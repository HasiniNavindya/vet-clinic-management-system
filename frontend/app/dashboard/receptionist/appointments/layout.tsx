'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/dashboard/receptionist/appointments', label: 'All', exact: true },
  { href: '/dashboard/receptionist/appointments/today', label: 'Today' },
  { href: '/dashboard/receptionist/appointments/calendar', label: 'Calendar' },
  { href: '/dashboard/receptionist/appointments/manage', label: 'Approve' },
  { href: '/dashboard/receptionist/appointments/queue', label: 'Check-in' },
] as const;

function tabActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ReceptionistAppointmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-gray-900">Appointments</h1>
        <nav
          className="inline-flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1"
          aria-label="Appointment views"
        >
          {TABS.map((tab) => {
            const active = tabActive(pathname, tab.href, tab.exact);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-white text-[#ec6d13] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
