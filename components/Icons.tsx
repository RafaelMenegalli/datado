import type { SVGProps } from 'react';

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
} as const;

type P = SVGProps<SVGSVGElement>;

export const IconX = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const IconHelp = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M9.4 9.2a2.7 2.7 0 1 1 3.8 2.5c-.8.4-1.2.9-1.2 1.8" />
    <path d="M12 17.2h.01" />
  </svg>
);
export const IconFlame = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3c.9 3.6 5 5.6 5 10a5 5 0 0 1-10 0c0-2 .9-3.3 2-4.2.1 1.6.9 2.6 1.9 2.6C10.5 8.6 11 5.6 12 3z" />
  </svg>
);
export const IconMinus = (p: P) => (
  <svg {...base} strokeWidth={2.5} {...p}>
    <path d="M5 12h14" />
  </svg>
);
export const IconPlus = (p: P) => (
  <svg {...base} strokeWidth={2.5} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconCheck = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);
export const IconCopy = (p: P) => (
  <svg {...base} {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
  </svg>
);
export const IconChat = (p: P) => (
  <svg {...base} {...p}>
    <path d="M21 12a8.5 8.5 0 0 1-12.4 7.5L3.5 21l1.6-4.8A8.5 8.5 0 1 1 21 12z" />
  </svg>
);
export const IconPlay = (p: P) => (
  <svg {...base} fill="currentColor" strokeWidth={1.6} width={22} height={22} {...p}>
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
  </svg>
);
export const IconZoom = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5M11 8v6M8 11h6" />
  </svg>
);
