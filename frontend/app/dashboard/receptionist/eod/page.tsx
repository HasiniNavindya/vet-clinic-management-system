'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchReceptionistEodSummary, type EodSummary } from '@/lib/receptionist';
import { openEodReportInNewTab } from '@/lib/receptionistEodReport';

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default function ReceptionistEodPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<EodSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchReceptionistEodSummary(token)
      .then(setSummary)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [token]);

  const handlePdfReport = () => {
    if (!summary) return;
    setPdfBusy(true);
    setPdfError('');
    try {
      openEodReportInNewTab(summary);
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : 'Could not open report');
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-sans text-xl font-semibold text-gray-900">End of day summary</p>
          <p className="mt-0.5 text-sm text-gray-500">Operational overview for today</p>
        </div>
        <button
          type="button"
          onClick={handlePdfReport}
          disabled={pdfBusy || loading || !summary}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#ec6d13] bg-white px-4 py-2.5 text-sm font-semibold text-[#ec6d13] hover:bg-orange-50 disabled:opacity-50"
        >
          <PdfIcon />
          {pdfBusy ? 'Opening…' : 'Get summary report (PDF)'}
        </button>
      </div>

      {pdfError ? <p className="mt-3 text-sm text-red-600">{pdfError}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ec6d13] border-t-transparent" />
        </div>
      ) : summary ? (
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Today's appointments", value: summary.appointmentsToday },
            { label: 'Patients checked in', value: summary.checkedInToday },
            { label: 'Visits completed', value: summary.completedToday },
            { label: 'Pending requests (clinic)', value: summary.pendingRequests },
            { label: 'Shop orders today', value: summary.ordersPlacedToday },
            {
              label: 'Payments recorded',
              value: `${summary.paymentsRecordedToday} (${money(summary.paymentsTotalCents)})`,
            },
          ].map((row) => (
            <div key={row.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <dt className="text-sm text-gray-600">{row.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-gray-900">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {summary ? (
        <p className="mt-6 text-xs text-gray-500">
          The PDF report opens in a new tab with today&apos;s figures. Use your browser&apos;s{' '}
          <strong>Print</strong> dialog and choose <strong>Save as PDF</strong> to download.
        </p>
      ) : null}
    </div>
  );
}

function PdfIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}
