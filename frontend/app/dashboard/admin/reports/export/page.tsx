'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/context/AuthContext';
import { downloadReportCsv, downloadReportPdf } from '@/lib/adminReports';

const REPORT_TYPES = [
  { id: 'payments' as const, label: 'Payments / revenue', desc: 'All payment transactions in the month' },
  { id: 'appointments' as const, label: 'Appointments', desc: 'Bookings created in the month' },
  { id: 'treatments' as const, label: 'Treatments', desc: 'Medical records by visit date' },
  { id: 'vaccinations' as const, label: 'Vaccinations', desc: 'Vaccines due in the selected month' },
  { id: 'shop' as const, label: 'Shop sales', desc: 'Shop orders placed in the month' },
];

export default function AdminExportCenterPage() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading, hasRole } = useAuth();
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace('/login?role=admin');
    if (!isLoading && isAuthenticated && !hasRole('admin')) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, hasRole, router]);

  const exportCsv = async (report: (typeof REPORT_TYPES)[number]['id']) => {
    if (!token) return;
    setBusy(`csv-${report}`);
    setError('');
    try {
      await downloadReportCsv(token, report, year, month);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'CSV export failed');
    } finally {
      setBusy(null);
    }
  };

  const exportPdf = async (report: string) => {
    if (!token) return;
    setBusy(`pdf-${report}`);
    setError('');
    try {
      await downloadReportPdf(token, report, year, month);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'PDF export failed');
    } finally {
      setBusy(null);
    }
  };

  if (isLoading || !isAuthenticated || !hasRole('admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ec6d13] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-8 pt-28">
        <Link href="/dashboard/admin/reports" className="text-sm font-semibold text-[#ec6d13] hover:underline">
          ← Reports dashboard
        </Link>
        <h1 className="mt-2 text-gray-900">Export center</h1>
        <p className="text-gray-600">
          Download CSV files for detailed rows, or open a printable HTML summary (use Print → Save as PDF).
        </p>

        <div className="mt-8 flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500">Year</label>
            <input
              type="number"
              className="mt-1 w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={year}
              min={2020}
              max={2100}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500">Month</label>
            <select
              className="mt-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString(undefined, { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <ul className="mt-8 space-y-4">
          {REPORT_TYPES.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="font-semibold text-gray-900">{r.label}</h2>
                <p className="text-sm text-gray-500">{r.desc}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => exportCsv(r.id)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
                >
                  {busy === `csv-${r.id}` ? '…' : 'CSV'}
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => exportPdf(r.id === 'payments' ? 'revenue' : r.id)}
                  className="rounded-lg bg-[#ec6d13] px-4 py-2 text-sm font-semibold text-white hover:bg-[#d65e0f] disabled:opacity-50"
                >
                  {busy === `pdf-${r.id === 'payments' ? 'revenue' : r.id}` ? '…' : 'Print / PDF'}
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={busy !== null}
          onClick={() => exportPdf('summary')}
          className="mt-6 rounded-lg border border-[#ec6d13] px-4 py-2 text-sm font-semibold text-[#ec6d13] hover:bg-orange-50 disabled:opacity-50"
        >
          {busy === 'pdf-summary' ? '…' : 'Open monthly summary (print/PDF)'}
        </button>
      </div>
    </div>
  );
}
