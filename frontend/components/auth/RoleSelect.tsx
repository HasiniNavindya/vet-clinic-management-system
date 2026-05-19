'use client';

import type { PublicRole } from '@/lib/roles';

interface RoleSelectProps {
  roles: PublicRole[];
  value: string;
  onChange: (roleId: string) => void;
  id?: string;
  name?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export default function RoleSelect({
  roles,
  value,
  onChange,
  id = 'role',
  name = 'role',
  label = 'Select your role',
  className = '',
  disabled = false,
}: RoleSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ec6d13] transition-all duration-200 ${className}`}
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.label}
          </option>
        ))}
      </select>
    </div>
  );
}
