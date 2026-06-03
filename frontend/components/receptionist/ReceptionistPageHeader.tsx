type Props = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export default function ReceptionistPageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="font-sans text-base font-semibold text-gray-900">{title}</p>
        {subtitle ? <p className="mt-0.5 font-sans text-xs text-gray-500">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
