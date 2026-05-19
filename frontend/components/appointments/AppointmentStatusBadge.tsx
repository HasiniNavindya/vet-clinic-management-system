import { AppointmentStatus, statusBadgeClass } from '@/lib/appointments';

type Props = {
  status: AppointmentStatus;
  label?: string;
  className?: string;
};

export default function AppointmentStatusBadge({ status, label, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusBadgeClass(status)} ${className}`}
    >
      {label || status}
    </span>
  );
}
