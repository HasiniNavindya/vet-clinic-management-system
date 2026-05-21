import { API_BASE_URL, authHeaders } from './api';

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid response');
  }
}

export interface ReportsDashboard {
  year: number;
  month: number;
  bookingsCreated: number;
  visitsCompleted: number;
  treatmentsRecorded: number;
  paymentCount: number;
  paymentRevenueCents: number;
  shopOrdersPaid: number;
  shopRevenueCents: number;
  appointmentsByStatus: { status: string; c: number }[];
}

export async function fetchReportsDashboard(
  token: string,
  year: number,
  month: number
): Promise<ReportsDashboard> {
  const q = new URLSearchParams({ year: String(year), month: String(month) });
  const res = await fetch(`${API_BASE_URL}/api/admin/reports/dashboard?${q}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson(res);
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed');
  const raw = data as ReportsDashboard & {
    appointmentsByStatus: { status: string; c?: number; count?: number }[];
  };
  return {
    ...raw,
    appointmentsByStatus: (raw.appointmentsByStatus || []).map((row) => ({
      status: row.status,
      c: row.c ?? (row as { count?: number }).count ?? 0,
    })),
  };
}

export async function downloadReportCsv(
  token: string,
  report: 'payments' | 'revenue' | 'appointments' | 'treatments' | 'shop',
  year: number,
  month: number
): Promise<void> {
  const q = new URLSearchParams({ report, year: String(year), month: String(month) });
  const res = await fetch(`${API_BASE_URL}/api/admin/reports/export.csv?${q}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'CSV export failed');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report}-${year}-${month}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadReportPdf(
  token: string,
  report: string,
  year: number,
  month: number
): Promise<void> {
  const q = new URLSearchParams({ report, year: String(year), month: String(month) });
  const res = await fetch(`${API_BASE_URL}/api/admin/reports/export.pdf?${q}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'PDF export failed');
  }
  const html = await res.text();
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
