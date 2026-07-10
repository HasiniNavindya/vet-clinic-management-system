'use client';

import Image from 'next/image';
import { blogImageUrl } from '@/lib/blog';

type Props = {
  imagePath?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

/** Blog covers from the API use a plain img tag — Next/Image optimizer returns 400 for localhost uploads. */
export default function BlogCoverImage({
  imagePath,
  alt,
  className = '',
  fill,
  priority,
  sizes,
}: Props) {
  const src = blogImageUrl(imagePath);
  const isApiUpload = src.startsWith('http://') || src.startsWith('https://');

  if (isApiUpload) {
    const fillClass = fill ? 'absolute inset-0 h-full w-full object-cover' : '';
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={[fillClass, className].filter(Boolean).join(' ')}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}
