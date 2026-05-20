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
      className="group relative flex flex-col rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:border-[#ec6d13]/30 hover:shadow-md"
    >
      {badge !== undefined && badge > 0 ? (
        <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ec6d13] px-1 text-[10px] font-bold text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#ec6d13]/10 text-[#ec6d13] transition group-hover:bg-[#ec6d13] group-hover:text-white">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{description}</p>
    </Link>
  );
}
