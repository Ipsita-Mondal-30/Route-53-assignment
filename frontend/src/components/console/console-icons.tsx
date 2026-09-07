import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function AwsWordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col leading-none text-white ${className ?? ""}`}>
      <span
        className="text-[20px] font-black tracking-[-0.04em]"
        style={{ fontFamily: "Amazon Ember, Arial Black, Arial, Helvetica, sans-serif" }}
      >
        aws
      </span>
      <svg viewBox="0 0 48 8" className="mt-px h-2 w-10" aria-hidden="true">
        <path
          d="M4 1.2c6.5 5.4 22.4 7.2 40 1.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path d="M40.2 0.6 47.5 3.4 40.2 6.4Z" fill="currentColor" />
      </svg>
    </span>
  );
}

export function AmazonQIcon({ className }: { className?: string }) {
  const uid = "aq";
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="24" height="24" rx="6" fill={`url(#${uid}-radial)`} />
      <g clipPath={`url(#${uid}-clip)`}>
        <path
          fill="#fff"
          d="M18.2199 7.40941L12.8699 4.31846C12.6299 4.17842 12.3199 4.1084 11.9999 4.1084C11.6799 4.1084 11.3699 4.17842 11.1299 4.31846L5.77991 7.40941C5.29991 7.67949 4.90991 8.3597 4.90991 8.90986V15.0917C4.90991 15.6419 5.29991 16.3121 5.77991 16.5922L11.1399 19.6832C11.3799 19.8232 11.6899 19.8932 12.0099 19.8932C12.3299 19.8932 12.6399 19.8232 12.8799 19.6832L18.2399 16.5922C18.7199 16.3121 19.1099 15.6419 19.1099 15.0917V8.90986C19.1099 8.3597 18.7199 7.67949 18.2399 7.40941H18.2199ZM11.9999 17.8826L6.90991 14.9417V9.05991L11.9999 6.11901L17.0899 9.05991V13.7813L13.9999 12.0008V11.2606C13.9999 11.0005 13.8599 10.7704 13.6399 10.6404L12.3599 9.90017C12.2499 9.84015 12.1199 9.80013 11.9999 9.80013C11.8799 9.80013 11.7499 9.83014 11.6399 9.90017L10.3599 10.6404C10.1399 10.7704 9.99991 11.0105 9.99991 11.2606V12.741C9.99991 13.0011 10.1399 13.2312 10.3599 13.3612L11.6399 14.1014C11.7499 14.1615 11.8799 14.2015 11.9999 14.2015C12.1199 14.2015 12.2499 14.1715 12.3599 14.1014L12.9999 13.7313L16.0899 15.5119L11.9999 17.8726V17.8826Z"
        />
      </g>
      <defs>
        <radialGradient
          id={`${uid}-radial`}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(26.1421 -2.14213) rotate(135) scale(40 51.1797)"
        >
          <stop stopColor="#C51A70" />
          <stop offset="0.3" stopColor="#8B2E9C" />
          <stop offset="0.45" stopColor="#5B4ADB" />
          <stop offset="0.6" stopColor="#3B6FE8" />
          <stop offset="0.8" stopColor="#2E8DE1" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          <rect width="16" height="16.0049" fill="white" transform="translate(4 3.99805)" />
        </clipPath>
      </defs>
    </svg>
  );
}

/** White outline Q mark used inside the console search field */
export function AmazonQSearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M15.183 6.174 10.725 3.599A1.67 1.67 0 0 0 10 3.424c-.267 0-.525.058-.725.175L4.817 6.174c-.4.225-.725.792-.725 1.25v5.152c0 .458.325 1.025.725 1.25l4.45 2.575c.2.117.467.175.733.175.267 0 .533-.058.733-.175l4.484-2.575c.4-.225.725-.792.725-1.25V7.424c0-.458-.325-1.025-.725-1.25h-.017ZM10 14.902 5.758 12.451V7.55L10 5.098l4.242 1.45v2.618l-2.575-1.483V7.067c0-.217-.117-.408-.3-.517L10.3 5.9a.75.75 0 0 0-.6 0l-1.067.65a.6.6 0 0 0-.3.517v1.233c0 .217.117.409.3.517l1.067.65c.1.05.208.083.3.083s.208-.025.3-.083l.533-.308 2.575 1.483L10 14.893v.009Z"
      />
    </svg>
  );
}

/** @deprecated Use AmazonQIcon */
export function ServiceHexIcon({ className }: { className?: string }) {
  return <AmazonQIcon className={className} />;
}

export function GridIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <rect x="1.5" y="1.5" width="4" height="4" rx="0.6" />
      <rect x="8" y="1.5" width="4" height="4" rx="0.6" />
      <rect x="14.5" y="1.5" width="4" height="4" rx="0.6" />
      <rect x="1.5" y="8" width="4" height="4" rx="0.6" />
      <rect x="8" y="8" width="4" height="4" rx="0.6" />
      <rect x="14.5" y="8" width="4" height="4" rx="0.6" />
      <rect x="1.5" y="14.5" width="4" height="4" rx="0.6" />
      <rect x="8" y="14.5" width="4" height="4" rx="0.6" />
      <rect x="14.5" y="14.5" width="4" height="4" rx="0.6" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5" />
      <path d="m13.2 13.2 4.05 4.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CloudShellIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <rect x="2" y="3.25" width="16" height="13.5" rx="1.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m5.5 7.5 2.75 2.25L5.5 12M10.25 12.5h4.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 8a5 5 0 0 1 10 0c0 2.9 1 4.15 1.6 5H3.4C4 12.15 5 10.9 5 8ZM7.75 15.25a2.25 2.25 0 0 0 4.5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HelpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.75 7.6a2.25 2.25 0 1 1 2.85 2.15c-.7.4-1.1.8-1.1 1.55"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="14" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        d="M8.15 1.75h3.7l.4 2.05c.55.15 1.06.4 1.5.7l1.9-.8 1.85 1.85-.8 1.9c.3.44.55.95.7 1.5l2.05.4v3.7l-2.05.4c-.15.55-.4 1.06-.7 1.5l.8 1.9-1.85 1.85-1.9-.8c-.44.3-.95.55-1.5.7l-.4 2.05h-3.7l-.4-2.05a5.9 5.9 0 0 1-1.5-.7l-1.9.8-1.85-1.85.8-1.9a5.9 5.9 0 0 1-.7-1.5l-2.05-.4v-3.7l2.05-.4c.15-.55.4-1.06.7-1.5l-.8-1.9L6.65 3.7l1.9.8c.44-.3.95-.55 1.5-.7l.4-2.05Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.5" />
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

export function CaretDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 8 8" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M0.8 2.2h6.4L4 6.2 0.8 2.2Z" />
    </svg>
  );
}

export function CaretRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 8 8" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M2.2 0.8v6.4L6.2 4 2.2 0.8Z" />
    </svg>
  );
}

export function BreadcrumbChevronIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 10 14" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 2.5 7.2 7 3 11.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ToolsPanelIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <rect x="2.2" y="2.2" width="11.6" height="11.6" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 2.2v11.6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" {...props}>
      <path d="M7.8 2.4 4.2 6l3.6 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" {...props}>
      <path d="M4.2 2.4 7.8 6l-3.6 3.6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path d="M3.2 4.6h9.6M3.2 8h9.6M3.2 11.4h9.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function InfoCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 7.15v4M8 4.85v.7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
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
