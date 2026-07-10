import Link from 'next/link';
import { SITE_LOGO_PATH, SITE_NAME } from '@/lib/site';

type SiteLogoProps = {
  href?: string;
  /** Display height in pixels; width scales automatically. */
  height?: number;
  className?: string;
  /** When true, render a more prominent, framed logo for high visibility. */
  prominent?: boolean;
};

export default function SiteLogo({
  href = '/',
  height = 56,
  className = '',
  prominent = false,
}: SiteLogoProps) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- transparent PNG brand asset
    <img
      src={SITE_LOGO_PATH}
      alt={SITE_NAME}
      height={height}
      decoding="async"
      className={`block h-auto w-auto max-w-[200px] object-contain object-center sm:max-w-[220px] ${className}`}
      style={{ height, width: 'auto' }}
    />
  );

  const wrapperClass = prominent
    ? 'inline-flex items-center shrink-0 rounded-full bg-white p-2 shadow-lg ring-2 ring-[#ec6d13]'
    : 'inline-flex shrink-0 items-center';

  if (!href) {
    return <span className={wrapperClass}>{image}</span>;
  }

  return (
    <Link href={href} className={`${wrapperClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#ec6d13]`}>
      {image}
    </Link>
  );
}
