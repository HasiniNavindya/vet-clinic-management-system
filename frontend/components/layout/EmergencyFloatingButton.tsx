'use client';

import { EMERGENCY_PHONE_DISPLAY, EMERGENCY_PHONE_TEL } from '@/lib/site';

export default function EmergencyFloatingButton() {
  return (
    <a
      href={EMERGENCY_PHONE_TEL}
      className="group fixed bottom-5 right-5 z-[60] flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-[#ec6d13] text-white shadow-md ring-2 ring-white/90 transition hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#ec6d13] focus:ring-offset-2 sm:bottom-6 sm:right-6"
      aria-label={`Emergency call ${EMERGENCY_PHONE_DISPLAY}`}
      title={`Emergency: ${EMERGENCY_PHONE_DISPLAY}`}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
      <span className="pointer-events-none absolute right-full mr-2 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition group-hover:opacity-100 sm:block">
        Emergency call
      </span>
    </a>
  );
}
