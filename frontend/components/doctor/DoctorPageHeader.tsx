type Props = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export default function DoctorPageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="font-sans text-[1.65rem] font-semibold tracking-tight text-gray-900 md:text-[1.75rem]">{title}</p>
        {subtitle ? <p className="mt-1 font-sans text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
