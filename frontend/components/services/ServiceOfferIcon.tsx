import type { ReactNode } from 'react';

const ORANGE = '#ec6d13';

type IconName =
  | 'adoption'
  | 'grooming'
  | 'daycare'
  | 'vaccination'
  | 'training'
  | 'pet-sitting';

const paths: Record<IconName, ReactNode> = {
  adoption: (
    <>
      <circle cx="5.5" cy="8.5" r="2" />
      <circle cx="18.5" cy="8.5" r="2" />
      <circle cx="8" cy="4.5" r="1.75" />
      <circle cx="16" cy="4.5" r="1.75" />
      <path d="M12 11c-2.5 0-4.5 2-4.5 4.5V19h9v-3.5C16.5 13 14.5 11 12 11z" />
    </>
  ),
  grooming: (
    <path d="M8.5 3 6 5.5l2.5 2.5 1.5-1.5V10h2V6.5l1.5 1.5L16 5.5 13.5 3 15 2h-2l-.5 1zM5 12h2v8H5v-8zm12 0h2v8h-2v-8z" />
  ),
  daycare: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />,
  vaccination: (
    <path d="M8 2h2v2.2L5 9.2l1.4 1.4L10 7V9h2V5l3.6 3.6L17 7.2 12.8 3H14V2H8zm6 10.4L11 9.4V8h2v1.4l4.6 4.6-1.4 1.4L14 12.8z" />
  ),
  training: (
    <path d="M12 3 1 9l4 2.2V17l7 4 7-4v-5.8L23 9 12 3zm0 2.2 6.9 3.8L12 12.8 5.1 9 12 5.2zM6 11.5 11 14v5.5l-5-2.9V11.5zm12 0v5.1l-5 2.9V14l5-2.5z" />
  ),
  'pet-sitting': (
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  ),
};

export default function ServiceOfferIcon({
  name,
  className = 'h-10 w-10',
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke={ORANGE}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      {paths[name]}
    </svg>
  );
}

export type { IconName };
