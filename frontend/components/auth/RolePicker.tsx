'use client';

import type { PublicRole } from '@/lib/roles';

type Props = {
  roles: PublicRole[];
  value: string;
  onChange: (roleId: string) => void;
  disabled?: boolean;
};

export default function RolePicker({ roles, value, onChange, disabled }: Props) {
  return (
    <div>
      <span className="mb-2 block text-center text-sm font-semibold text-gray-900">Account type</span>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Account type">
        {roles.map((role) => {
          const selected = value === role.id;
          return (
            <button
              key={role.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(role.id)}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 ${
                selected
                  ? 'bg-[#ec6d13] shadow-md ring-2 ring-[#ec6d13] ring-offset-2'
                  : 'bg-[#ec6d13]/80 hover:bg-[#d65e0f]'
              }`}
              aria-pressed={selected}
            >
              {role.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
