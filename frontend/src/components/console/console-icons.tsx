import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function AwsWordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col leading-none text-white ${className ?? ""}`}>
      <span
        className="text-[17px] font-extrabold tracking-[-0.06em]"
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        aws
      </span>
      <svg viewBox="0 0 48 8" className="mt-px h-[7px] w-[36px]" aria-hidden="true">
        <path
          d="M4 1.2c6.5 5.4 22.4 7.2 40 1.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path d="M40.2 0.6 47.5 3.4 40.2 6.4Z" fill="currentColor" />
      </svg>
    </span>
  );
}

export function ServiceHexIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="r53hex" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="55%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.2 20.2 7v10L12 21.8 3.8 17V7L12 2.2Z"
        fill="url(#r53hex)"
      />
      <path
        d="M8.2 12.2h3.1V16H8.2v-3.8Zm4.5-3.6h3.1V16h-3.1V8.6Z"
        fill="#161d27"
        opacity="0.85"
      />
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <rect x="1" y="1" width="3.4" height="3.4" rx="0.4" />
      <rect x="6.3" y="1" width="3.4" height="3.4" rx="0.4" />
      <rect x="11.6" y="1" width="3.4" height="3.4" rx="0.4" />
      <rect x="1" y="6.3" width="3.4" height="3.4" rx="0.4" />
      <rect x="6.3" y="6.3" width="3.4" height="3.4" rx="0.4" />
      <rect x="11.6" y="6.3" width="3.4" height="3.4" rx="0.4" />
      <rect x="1" y="11.6" width="3.4" height="3.4" rx="0.4" />
      <rect x="6.3" y="11.6" width="3.4" height="3.4" rx="0.4" />
      <rect x="11.6" y="11.6" width="3.4" height="3.4" rx="0.4" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path d="m11 11 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function CloudShellIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="m4.2 6.2 2.2 1.8-2.2 1.8M8.2 10.4h3.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 6.4a4 4 0 0 1 8 0c0 2.4.8 3.4 1.3 4.1H2.7C3.2 9.8 4 8.8 4 6.4ZM6.3 12.4a1.7 1.7 0 0 0 3.4 0"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HelpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M6.3 6.2a1.7 1.7 0 1 1 2.2 1.6c-.5.3-.8.6-.8 1.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.2" r="0.7" fill="currentColor" />
    </svg>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="m8 1.6.5 1.6 1.6-.4 1.1 1.1-.4 1.6 1.6.5v1.6l-1.6.5.4 1.6-1.1 1.1-1.6-.4L8 14.4l-.5-1.6-1.6.4-1.1-1.1.4-1.6L3.6 9V7.4l1.6-.5-.4-1.6 1.1-1.1 1.6.4L8 1.6Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" {...props}>
      <path d="M2.4 4.2 6 7.8l3.6-3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" {...props}>
      <path d="M7.8 2.4 4.2 6l3.6 3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" {...props}>
      <path d="M4.2 2.4 7.8 6l-3.6 3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="M3 4.5h10M3 8h10M3 11.5h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function InfoCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 7.2v4.1M8 4.8v.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M13.2 8A5.2 5.2 0 1 1 11.6 3.7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M11.2 1.8v2.6h2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="M9.2 3.2H13v3.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M13 3.2 7.4 8.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path
        d="M10.4 9v3.2a.8.8 0 0 1-.8.8H3.8a.8.8 0 0 1-.8-.8V6.4a.8.8 0 0 1 .8-.8H7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="m4 4 8 8M12 4 4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function FeedbackIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2.5 3.5h11v7.2H6.2L3.4 13V10.7H2.5V3.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <rect x="4.2" y="1.6" width="7.6" height="12.8" rx="1.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 12.4h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function ToolkitIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 6.2h10v7.2H3V6.2Zm2.2-2.4h5.6v2.4H5.2V3.8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
