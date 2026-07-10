'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { resolveUserDashboardPath } from '@/lib/roles';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import SiteLogo from '@/components/layout/SiteLogo';

const NAV_LINKS = [
  { href: '/', label: 'HOME' },
  { href: '/about', label: 'ABOUT US' },
  { href: '/services', label: 'SERVICES' },
  { href: '/marketplace', label: 'MARKETPLACE' },
  { href: '/blog', label: 'BLOG' },
  { href: '/contact', label: 'CONTACT US' },
] as const;

function navActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  pathname,
  mobile,
  onNavigate,
}: {
  href: string;
  label: string;
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const active = navActive(pathname, href);
  const base = mobile
    ? 'block py-2 text-sm font-semibold uppercase text-white'
    : 'relative pb-0.5 text-xs font-semibold uppercase text-white transition hover:text-white/90';
  const activeClass = mobile
    ? 'text-white underline decoration-2 underline-offset-4'
    : 'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-white after:content-[""]';

  return (
    <Link href={href} className={`${base} ${active ? activeClass : ''}`} onClick={onNavigate}>
      {label}
    </Link>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated, hasRole } = useAuth();
  const pathname = usePathname();
  const dashboardHref = user ? resolveUserDashboardPath(user) : '/login';
  const appointmentHref =
    isAuthenticated && hasRole('user')
      ? '/dashboard/pet-owner/appointments/book'
      : '/login?role=user';

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed top-0 z-50 w-full bg-white shadow-sm">
      <div className="hidden border-b border-gray-100 bg-gray-50/90 md:block">
        <div className="container mx-auto flex justify-end gap-5 px-4 py-1 text-[10px] leading-tight text-gray-600">
          <span>
            <span className="font-semibold text-gray-800">Timing:</span> Mon–Fri 8am–10pm
          </span>
          <span>
            <span className="font-semibold text-gray-800">Call:</span> +01 234 56789
          </span>
          <span>
            <span className="font-semibold text-gray-800">Email:</span> info@carlislepetcare.com
          </span>
        </div>
      </div>

      <nav className="bg-[#ec6d13]">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 md:gap-5">
            <SiteLogo href="/" height={48} prominent />

            <div className="hidden min-w-0 flex-1 items-center justify-between md:flex">
              <div className="flex items-center gap-5 py-2">
                {NAV_LINKS.map((link) => (
                  <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
                ))}
              </div>

              <div className="flex shrink-0 items-center space-x-2 py-1.5">
                {isAuthenticated ? (
                  <>
                    <NotificationDropdown />
                    <Link href={dashboardHref} className="flex items-center gap-2 text-white transition hover:text-white/85">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-[#ec6d13]">
                        {user?.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="max-w-[8rem] truncate text-xs font-semibold uppercase">
                        {user?.fullName}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        window.location.href = '/';
                      }}
                      className="bg-white px-4 py-1.5 text-xs font-bold uppercase text-[#ec6d13] transition-all hover:bg-gray-100"
                    >
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth"
                    className="inline-block bg-white px-4 py-1.5 text-xs font-bold uppercase text-[#ec6d13] transition-all hover:bg-gray-100"
                  >
                    LOGIN
                  </Link>
                )}
                <Link
                  href={appointmentHref}
                  className="border-2 border-white bg-transparent px-4 py-1.5 text-xs font-bold uppercase text-white transition-all hover:bg-white/15"
                >
                  GET APPOINTMENT
                </Link>
              </div>
            </div>

            <button
              type="button"
              className="ml-auto py-2 text-white md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {isMenuOpen && (
            <div className="animate-fade-in-up border-t border-white/20 pb-4 md:hidden">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  pathname={pathname}
                  mobile
                  onNavigate={closeMenu}
                />
              ))}

              {isAuthenticated ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="mt-2 flex items-center gap-3 border-t border-white/20 pt-3 text-sm font-semibold uppercase text-white"
                    onClick={closeMenu}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-bold text-[#ec6d13]">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <span>DASHBOARD — {user?.fullName}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      window.location.href = '/';
                    }}
                    className="mt-3 w-full bg-white px-4 py-2 text-sm font-bold uppercase text-[#ec6d13]"
                  >
                    LOGOUT
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="mt-3 block w-full bg-white px-4 py-2 text-center text-sm font-bold uppercase text-[#ec6d13]"
                  onClick={closeMenu}
                >
                  LOGIN
                </Link>
              )}

              <Link
                href={appointmentHref}
                className="mt-2 block w-full border-2 border-white px-4 py-2 text-center text-sm font-bold uppercase text-white"
                onClick={closeMenu}
              >
                GET APPOINTMENT
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
