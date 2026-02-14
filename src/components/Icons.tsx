import type { SVGProps } from 'react';

export function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden='true' viewBox='0 0 20 20' {...props}>
      <path
        d='M4 10h11M11 5l5 5-5 5'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth='1.7'
      />
    </svg>
  );
}

export function ObjectsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden='true' viewBox='0 0 24 24' {...props}>
      <path
        d='m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <path d='m4.5 7.8 7.5 4.3 7.5-4.3M12 12.1V21' fill='none' stroke='currentColor' strokeWidth='1.5' />
    </svg>
  );
}

export function AvailableIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden='true' viewBox='0 0 24 24' {...props}>
      <circle cx='12' cy='12' r='8.5' fill='none' stroke='currentColor' strokeWidth='1.5' />
      <path
        d='m8 12 2.6 2.6L16.5 9'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.7'
      />
    </svg>
  );
}

export function HeldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden='true' viewBox='0 0 24 24' {...props}>
      <path
        d='M7 3.5h10M7 20.5h10M8 4c0 4 1.5 5.5 4 8-2.5 2.5-4 4-4 8m8-16c0 4-1.5 5.5-4 8 2.5 2.5 4 4 4 8'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth='1.5'
      />
    </svg>
  );
}

export function AcquiredIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden='true' viewBox='0 0 24 24' {...props}>
      <rect
        x='5.5'
        y='10'
        width='13'
        height='10'
        rx='2'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <path d='M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10' fill='none' stroke='currentColor' strokeWidth='1.5' />
      <circle cx='12' cy='15' r='1' fill='currentColor' />
    </svg>
  );
}

export function ExternalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden='true' viewBox='0 0 20 20' {...props}>
      <path
        d='M11 4h5v5M9 11l7-7M16 11v5H4V4h5'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  );
}

export function ResetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden='true' viewBox='0 0 20 20' {...props}>
      <path
        d='M4.5 6.5A6 6 0 1 1 4 13M4.5 6.5V2.8M4.5 6.5h3.8'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  );
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden='true' viewBox='0 0 20 20' {...props}>
      <path
        d='M10 2.5 16 5v4.2c0 3.8-2.4 6.5-6 8.3-3.6-1.8-6-4.5-6-8.3V5l6-2.5Z'
        fill='none'
        stroke='currentColor'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <path
        d='m7.3 9.8 1.7 1.7 3.8-4'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeWidth='1.5'
      />
    </svg>
  );
}

export function CardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden='true' viewBox='0 0 20 20' {...props}>
      <rect
        x='2.5'
        y='4.5'
        width='15'
        height='11'
        rx='2'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
      />
      <path d='M3 8h14M5.5 12h3' fill='none' stroke='currentColor' strokeLinecap='round' strokeWidth='1.5' />
    </svg>
  );
}

export function EngineIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden='true' viewBox='0 0 24 24' {...props}>
      <path
        d='M8 4h8v3h3v10h-3v3H8v-3H5V7h3V4Z'
        fill='none'
        stroke='currentColor'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
      <path
        d='M9 9h6v6H9zM2.5 9H5m-2.5 6H5M19 9h2.5M19 15h2.5'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
      />
    </svg>
  );
}

export function SyncIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden='true' viewBox='0 0 24 24' {...props}>
      <path
        d='M18.5 8A7.5 7.5 0 0 0 6 6.5L4 9m1.5 7A7.5 7.5 0 0 0 18 17.5l2-2.5M4 5.5V9h3.5M20 18.5V15h-3.5'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  );
}
