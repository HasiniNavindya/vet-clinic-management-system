import type { EodSummary } from './receptionist';

function formatUsd(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    cents / 100
  );
}

export function buildEodReportHtml(summary: EodSummary, { autoPrint = true } = {}) {
  const dateLabel = summary.date
    ? new Date(`${summary.date}T12:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Today';
  const rows: [string, string][] = [
    ["Today's appointments", String(summary.appointmentsToday ?? 0)],
    ['Patients checked in', String(summary.checkedInToday ?? 0)],
    ['Visits completed', String(summary.completedToday ?? 0)],
    ['Pending requests (clinic)', String(summary.pendingRequests ?? 0)],
    ['Shop orders today', String(summary.ordersPlacedToday ?? 0)],
    [
      'Payments recorded',
      `${summary.paymentsRecordedToday ?? 0} (${formatUsd(summary.paymentsTotalCents ?? 0)})`,
    ],
  ];
  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:10px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151">${label}</td><td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:right;font-size:18px;font-weight:700;color:#111827">${value}</td></tr>`
    )
    .join('');
  const printScript = autoPrint
    ? '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},400)});</script>'
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>End of day summary — ${summary.date || ''}</title>
<style>
  body{font-family:system-ui,-apple-system,sans-serif;margin:0;padding:2rem;color:#111827;background:#fff}
  .header{border-bottom:3px solid #ec6d13;padding-bottom:1rem;margin-bottom:1.5rem}
  h1{margin:0;font-size:1.75rem;color:#ec6d13}
  .sub{margin:0.35rem 0 0;color:#6b7280;font-size:0.95rem}
  table{border-collapse:collapse;width:100%;max-width:520px}
  .footer{margin-top:2rem;font-size:0.8rem;color:#9ca3af}
  @media print{body{padding:1rem}.no-print{display:none}}
</style>
</head>
<body>
  <div class="header">
    <h1>Carlisle Pet Care</h1>
    <p class="sub">Reception desk — End of day summary</p>
    <p class="sub"><strong>Date:</strong> ${dateLabel}</p>
  </div>
  <table>${tableRows}</table>
  <p class="footer">Generated ${new Date().toLocaleString()}. Use Print → Save as PDF to download.</p>
  <p class="no-print footer">Tip: Press Ctrl+P (or Cmd+P) and choose &quot;Save as PDF&quot;.</p>
  ${printScript}
</body>
</html>`;
}

export function openEodReportInNewTab(summary: EodSummary) {
  const html = buildEodReportHtml(summary, { autoPrint: true });
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
