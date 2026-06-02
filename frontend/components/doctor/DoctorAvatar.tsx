import { doctorImageUrl } from '@/lib/appointments';

type Props = {
  name: string;
  imageUrl?: string | null;
  className?: string;
  textClassName?: string;
  /** Bust browser cache after profile photo updates */
  cacheBust?: string | number;
};

export default function DoctorAvatar({
  name,
  imageUrl,
  className = 'h-full w-full',
  textClassName = 'text-2xl',
  cacheBust,
}: Props) {
  const autoBust = imageUrl?.match(/_(\d{10,})\.[a-z]+$/i)?.[1];
  const src = doctorImageUrl(imageUrl, cacheBust ?? autoBust);
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${className} object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center bg-[#ec6d13]/15 font-bold text-[#c45f10] ${textClassName}`}
    >
      {name.charAt(0).toUpperCase() || '?'}
    </div>
  );
}
