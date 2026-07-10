'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type AdminTab = { id: string; label: string; badge?: number };

type Props = {
  tabs: AdminTab[];
  defaultTab: string;
  param?: string;
};

export function useAdminTab(defaultTab: string, validIds: string[], param = 'tab') {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = searchParams.get(param);
  const active = raw && validIds.includes(raw) ? raw : defaultTab;

  const setTab = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === defaultTab) params.delete(param);
    else params.set(param, id);
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  return { active, setTab };
}

export default function AdminPageTabs({ tabs, defaultTab, param = 'tab' }: Props) {
  const { active, setTab } = useAdminTab(
    defaultTab,
    tabs.map((t) => t.id),
    param
  );

  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50/80 p-1.5">
      {tabs.map((tab) => {
        const on = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTab(tab.id)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              on
                ? 'bg-white text-[#b6530f] shadow-sm ring-1 ring-[#ec6d13]/20'
                : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {tab.badge != null && tab.badge > 0 ? (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  on ? 'bg-[#ec6d13] text-white' : 'bg-amber-100 text-amber-900'
                }`}
              >
                {tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
