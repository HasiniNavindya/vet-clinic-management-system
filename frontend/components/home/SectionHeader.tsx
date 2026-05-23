type Props = {
  title: string;
  subtitle?: string;
  light?: boolean;
};

export default function SectionHeader({ title, subtitle, light }: Props) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <h2 className={light ? 'text-white' : 'text-gray-900'}>{title}</h2>
      <div className="mx-auto mt-3 flex items-center justify-center gap-3">
        <div className="h-0.5 w-14 bg-[#ec6d13]" />
        <span className="text-[#ec6d13]">✦</span>
        <div className="h-0.5 w-14 bg-[#ec6d13]" />
      </div>
      {subtitle ? (
        <p className={`mt-3 text-base leading-relaxed ${light ? 'text-white/85' : 'text-gray-600'}`}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
