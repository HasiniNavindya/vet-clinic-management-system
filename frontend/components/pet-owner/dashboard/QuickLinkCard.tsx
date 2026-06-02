import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  badge?: number;
};

export default function QuickLinkCard({ href, title, description, icon, badge }: Props) {
  return (
    <Link
      href={href}
      className="group relative flex h-full min-h-[108px] items-start gap-3 rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm transition hover:border-[#ec6d13]/30 hover:bg-orange-50/40 hover:shadow-md"
    >
      {badge !== undefined && badge > 0 ? (
        <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ec6d13] px-1 text-[10px] font-bold text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ec6d13]/10 text-[#ec6d13] transition group-hover:bg-[#ec6d13] group-hover:text-white">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-sans text-sm font-semibold leading-5 text-gray-900">{title}</p>
        <p className="mt-0.5 line-clamp-2 text-[12px] leading-4 text-gray-500">{description}</p>
      </div>
    </Link>
  );
}
