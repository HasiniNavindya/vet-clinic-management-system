import {
  VaccinationStatus,
  vaccinationBadgeClass,
  vaccinationStatusLabel,
} from '@/lib/vaccinations';

type Props = {
  status: VaccinationStatus;
  className?: string;
};

export default function VaccinationStatusBadge({ status, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${vaccinationBadgeClass(status)} ${className}`}
    >
      {vaccinationStatusLabel(status)}
    </span>
  );
}
