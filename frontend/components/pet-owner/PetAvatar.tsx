import { resolvePetImageUrl } from '@/lib/appointments';

const SIZE_CLASS = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-14 w-14 text-lg',
  lg: 'h-20 w-20 text-2xl',
} as const;

type Props = {
  name: string;
  imageUrl?: string | null;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
};

export default function PetAvatar({ name, imageUrl, size = 'md', className = '' }: Props) {
  const sizeClass = SIZE_CLASS[size];
  const src = resolvePetImageUrl(imageUrl);
  const initial = name?.charAt(0).toUpperCase() || '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-gray-100 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#ec6d13] font-bold text-white shadow-sm ring-1 ring-gray-100 ${className}`}
    >
      {initial}
    </div>
  );
}
