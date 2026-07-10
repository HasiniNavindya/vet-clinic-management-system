'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = { href: string; label: string; match?: (path: string) => boolean };

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

const GROUPS: NavGroup[] = [
  { id: 'overview', label: 'Overview', items: [{ href: '/dashboard/admin', label: 'Overview' }] },
  { id: 'analytics', label: 'Analytics', items: [{ href: '/dashboard/admin/analytics', label: 'Analytics' }] },
  {
    id: 'reports',
    label: 'Reports',
    items: [{ href: '/dashboard/admin/reports', label: 'Reports & export' }],
  },
  {
    id: 'users',
    label: 'Users',
    items: [
      {
        href: '/dashboard/admin/users',
        label: 'Users',
        match: (p) =>
          p.startsWith('/dashboard/admin/users') ||
          p.startsWith('/dashboard/admin/doctors') ||
          p.startsWith('/dashboard/admin/doctor-applications') ||
          p.startsWith('/dashboard/admin/staff') ||
          p.startsWith('/dashboard/admin/receptionist-applications'),
      },
    ],
  },
  {
    id: 'shop',
    label: 'Shop',
    items: [
      {
        href: '/dashboard/admin/shop',
        label: 'Shop',
        match: (p) =>
          p.startsWith('/dashboard/admin/shop') ||
          p.startsWith('/dashboard/admin/marketplace'),
      },
    ],
  },
  {
    id: 'payments',
    label: 'Payments',
    items: [
      {
        href: '/dashboard/admin/payments',
        label: 'Payments',
        match: (p) => p.startsWith('/dashboard/admin/payments'),
      },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    items: [{ href: '/dashboard/admin/notifications', label: 'Notification center' }],
  },
  { id: 'blog', label: 'Blog', items: [{ href: '/dashboard/admin/blog', label: 'Blog posts' }] },
];

function navClass(active: boolean) {
  return active
    ? 'block rounded-lg bg-[#ec6d13]/10 px-3 py-2 text-sm font-semibold text-[#b6530f]'
    : 'block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50';
}

function isActive(pathname: string, item: NavItem) {
  if (item.match) return item.match(pathname);
  if (item.href === '/dashboard/admin') return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

type Props = {
  welcomeName: string;
  email?: string;
};

export default function AdminSidebar({ welcomeName, email }: Props) {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-20 z-20 hidden h-[calc(100vh-5rem)] w-64 flex-col overflow-y-auto border-r border-gray-200 bg-white p-4 md:flex">
      <div className="mb-3 border-b border-gray-200 pb-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#ec6d13]">Administration</p>
        <div className="mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#ec6d13] text-lg font-bold text-white">
          {welcomeName.charAt(0).toUpperCase()}
        </div>
        <p className="mt-2 text-sm font-bold text-gray-900">{welcomeName}</p>
        {email ? <p className="text-xs text-gray-500">{email}</p> : null}
      </div>

      <nav className="flex-1 space-y-1">
        {GROUPS.map((group) => {
          const item = group.items[0];
          return (
            <Link
              key={group.id}
              href={item.href}
              className={navClass(isActive(pathname, item))}
            >
              {group.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
