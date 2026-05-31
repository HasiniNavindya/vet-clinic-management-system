'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type NavItem = { href: string; label: string };
type NavGroup = { id: string; label: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  { id: 'dash', label: 'Dashboard', items: [{ href: '/dashboard/receptionist', label: 'Overview' }] },
  {
    id: 'appts',
    label: 'Appointments',
    items: [
      { href: '/dashboard/receptionist/appointments', label: 'All Appointments' },
      { href: '/dashboard/receptionist/appointments/today', label: "Today's Appointments" },
      { href: '/dashboard/receptionist/appointments/calendar', label: 'Appointment Calendar' },
      { href: '/dashboard/receptionist/appointments/manage', label: 'Approve & Respond' },
    ],
  },
  {
    id: 'pets',
    label: 'Pets',
    items: [
      { href: '/dashboard/receptionist/pets', label: 'Pet List' },
      { href: '/dashboard/receptionist/owners', label: 'Pet Owners' },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    items: [
      { href: '/dashboard/receptionist/orders', label: 'All Orders' },
    ],
  },
  {
    id: 'notif',
    label: 'Notifications',
    items: [
      { href: '/dashboard/receptionist/notifications/send', label: 'Send Notification' },
      { href: '/dashboard/receptionist/notifications/history', label: 'Notification History' },
    ],
  },
  {
    id: 'docs',
    label: 'Doctors',
    items: [{ href: '/dashboard/receptionist/doctors', label: 'Doctor Schedule' }],
  },
  {
    id: 'pay',
    label: 'Payments',
    items: [{ href: '/dashboard/receptionist/payments', label: 'Record Offline Payment' }],
  },
  {
    id: 'profile',
    label: 'Profile',
    items: [
      { href: '/dashboard/receptionist/profile', label: 'My Profile' },
      { href: '/dashboard/settings', label: 'Change Password' },
    ],
  },
];

function navClass(active: boolean) {
  return active
    ? 'block rounded-lg bg-[#ec6d13]/10 px-3 py-2 text-sm font-semibold text-[#b6530f]'
    : 'block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50';
}

type Props = {
  welcomeName: string;
  email?: string;
};

export default function ReceptionistSidebar({ welcomeName, email }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>({
    appts: true,
    pets: false,
    orders: false,
    notif: false,
  });

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard/receptionist' && pathname.startsWith(href));

  return (
    <aside className="fixed left-0 top-28 z-20 flex h-[calc(100vh-112px)] w-64 flex-col overflow-y-auto border-r border-gray-200 bg-white p-5">
      <div className="mb-5 border-b border-gray-200 pb-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#ec6d13]">Reception desk</p>
        <div className="mx-auto mt-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#ec6d13] text-xl font-bold text-white">
          {welcomeName.charAt(0).toUpperCase()}
        </div>
        <p className="mt-2 text-sm font-bold text-gray-900">{welcomeName}</p>
        {email ? <p className="text-xs text-gray-500">{email}</p> : null}
      </div>

      <nav className="flex-1 space-y-1">
        {GROUPS.map((group) => {
          const single = group.items.length === 1 && group.id === 'dash';
          if (single) {
            const item = group.items[0];
            return (
              <Link key={item.href} href={item.href} className={navClass(isActive(item.href))}>
                {group.label}
              </Link>
            );
          }
          const expanded = open[group.id] ?? false;
          const anyChildActive = group.items.some((i) => isActive(i.href));
          return (
            <div key={group.id}>
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [group.id]: !expanded }))}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold ${
                  anyChildActive ? 'text-[#ec6d13]' : 'text-gray-800'
                }`}
              >
                {group.label}
                <span className="text-gray-400">{expanded ? '−' : '+'}</span>
              </button>
              {expanded ? (
                <div className="ml-2 mt-1 space-y-0.5 border-l border-gray-200 pl-2">
                  {group.items.map((item) => (
                    <Link key={item.href} href={item.href} className={navClass(isActive(item.href))}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
