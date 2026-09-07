import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Official AWS smile wordmark, light gray like the console header. */
export function AwsWordmark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 304 182"
      width={59}
      height={35}
      className={className ?? "block h-[35px] w-[59px] text-[#d5dbdb]"}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M86.4,66.4c0,3.7,0.4,6.7,1.1,8.9c0.8,2.2,1.8,4.6,3.2,7.2c0.5,0.8,0.7,1.6,0.7,2.3c0,1-0.6,2-1.9,3l-6.3,4.2c-0.9,0.6-1.8,0.9-2.6,0.9c-1,0-2-0.5-3-1.4C76.2,90,75,88.4,74,86.8c-1-1.7-2-3.6-3.1-5.9c-7.8,9.2-17.6,13.8-29.4,13.8c-8.4,0-15.1-2.4-20-7.2c-4.9-4.8-7.4-11.2-7.4-19.2c0-8.5,3-15.4,9.1-20.6c6.1-5.2,14.2-7.8,24.5-7.8c3.4,0,6.9,0.3,10.6,0.8c3.7,0.5,7.5,1.3,11.5,2.2v-7.3c0-7.6-1.6-12.9-4.7-16c-3.2-3.1-8.6-4.6-16.3-4.6c-3.5,0-7.1,0.4-10.8,1.3c-3.7,0.9-7.3,2-10.8,3.4c-1.6,0.7-2.8,1.1-3.5,1.3c-0.7,0.2-1.2,0.3-1.6,0.3c-1.4,0-2.1-1-2.1-3.1v-4.9c0-1.6,0.2-2.8,0.7-3.5c0.5-0.7,1.4-1.4,2.8-2.1c3.5-1.8,7.7-3.3,12.6-4.5c4.9-1.3,10.1-1.9,15.6-1.9c11.9,0,20.6,2.7,26.2,8.1c5.5,5.4,8.3,13.6,8.3,24.6V66.4z M45.8,81.6c3.3,0,6.7-0.6,10.3-1.8c3.6-1.2,6.8-3.4,9.5-6.4c1.6-1.9,2.8-4,3.4-6.4c0.6-2.4,1-5.3,1-8.7v-4.2c-2.9-0.7-6-1.3-9.2-1.7c-3.2-0.4-6.3-0.6-9.4-0.6c-6.7,0-11.6,1.3-14.9,4c-3.3,2.7-4.9,6.5-4.9,11.5c0,4.7,1.2,8.2,3.7,10.6C37.7,80.4,41.2,81.6,45.8,81.6z M126.1,92.4c-1.8,0-3-0.3-3.8-1c-0.8-0.6-1.5-2-2.1-3.9L96.7,10.2c-0.6-2-0.9-3.3-0.9-4c0-1.6,0.8-2.5,2.4-2.5h9.8c1.9,0,3.2,0.3,3.9,1c0.8,0.6,1.4,2,2,3.9l16.8,66.2l15.6-66.2c0.5-2,1.1-3.3,1.9-3.9c0.8-0.6,2.2-1,4-1h8c1.9,0,3.2,0.3,4,1c0.8,0.6,1.5,2,1.9,3.9l15.8,67l17.3-67c0.6-2,1.3-3.3,2-3.9c0.8-0.6,2.1-1,3.9-1h9.3c1.6,0,2.5,0.8,2.5,2.5c0,0.5-0.1,1-0.2,1.6c-0.1,0.6-0.3,1.4-0.7,2.5l-24.1,77.3c-0.6,2-1.3,3.3-2.1,3.9c-0.8,0.6-2.1,1-3.8,1h-8.6c-1.9,0-3.2-0.3-4-1c-0.8-0.7-1.5-2-1.9-4L156,23l-15.4,64.4c-0.5,2-1.1,3.3-1.9,4c-0.8,0.7-2.2,1-4,1H126.1z M254.6,95.1c-5.2,0-10.4-0.6-15.4-1.8c-5-1.2-8.9-2.5-11.5-4c-1.6-0.9-2.7-1.9-3.1-2.8c-0.4-0.9-0.6-1.9-0.6-2.8v-5.1c0-2.1,0.8-3.1,2.3-3.1c0.6,0,1.2,0.1,1.8,0.3c0.6,0.2,1.5,0.6,2.5,1c3.4,1.5,7.1,2.7,11,3.5c4,0.8,7.9,1.2,11.9,1.2c6.3,0,11.2-1.1,14.6-3.3c3.4-2.2,5.2-5.4,5.2-9.5c0-2.8-0.9-5.1-2.7-7c-1.8-1.9-5.2-3.6-10.1-5.2L246,52c-7.3-2.3-12.7-5.7-16-10.2c-3.3-4.4-5-9.3-5-14.5c0-4.2,0.9-7.9,2.7-11.1c1.8-3.2,4.2-6,7.2-8.2c3-2.3,6.4-4,10.4-5.2c4-1.2,8.2-1.7,12.6-1.7c2.2,0,4.5,0.1,6.7,0.4c2.3,0.3,4.4,0.7,6.5,1.1c2,0.5,3.9,1,5.7,1.6c1.8,0.6,3.2,1.2,4.2,1.8c1.4,0.8,2.4,1.6,3,2.5c0.6,0.8,0.9,1.9,0.9,3.3v4.7c0,2.1-0.8,3.2-2.3,3.2c-0.8,0-2.1-0.4-3.8-1.2c-5.7-2.6-12.1-3.9-19.2-3.9c-5.7,0-10.2,0.9-13.3,2.8c-3.1,1.9-4.7,4.8-4.7,8.9c0,2.8,1,5.2,3,7.1c2,1.9,5.7,3.8,11,5.5l14.2,4.5c7.2,2.3,12.4,5.5,15.5,9.6c3.1,4.1,4.6,8.8,4.6,14c0,4.3-0.9,8.2-2.6,11.6c-1.8,3.4-4.2,6.4-7.3,8.8c-3.1,2.5-6.8,4.3-11.1,5.6C264.4,94.4,259.7,95.1,254.6,95.1z" />
      <path
        fillRule="evenodd"
        d="M273.5,143.7c-32.9,24.3-80.7,37.2-121.8,37.2c-57.6,0-109.5-21.3-148.7-56.7c-3.1-2.8-0.3-6.6,3.4-4.4c42.4,24.6,94.7,39.5,148.8,39.5c36.5,0,76.6-7.6,113.5-23.2C274.2,133.6,278.9,139.7,273.5,143.7z"
      />
      <path
        fillRule="evenodd"
        d="M287.2,128.1c-4.2-5.4-27.8-2.6-38.5-1.3c-3.2,0.4-3.7-2.4-0.8-4.5c18.8-13.2,49.7-9.4,53.3-5c3.6,4.5-1,35.4-18.6,50.2c-2.7,2.3-5.3,1.1-4.1-1.9C282.5,155.7,291.4,133.4,287.2,128.1z"
      />
    </svg>
  );
}

export function AmazonQIcon({
  className,
  uid = "aq",
}: {
  className?: string;
  uid?: string;
}) {
  const gradientId = `${uid}-radial`;
  const clipId = `${uid}-clip`;
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
      <rect width="24" height="24" rx="6" fill={`url(#${gradientId})`} />
      <g clipPath={`url(#${clipId})`}>
        <path
          fill="#fff"
          d="M18.2199 7.40941L12.8699 4.31846C12.6299 4.17842 12.3199 4.1084 11.9999 4.1084C11.6799 4.1084 11.3699 4.17842 11.1299 4.31846L5.77991 7.40941C5.29991 7.67949 4.90991 8.3597 4.90991 8.90986V15.0917C4.90991 15.6419 5.29991 16.3121 5.77991 16.5922L11.1399 19.6832C11.3799 19.8232 11.6899 19.8932 12.0099 19.8932C12.3299 19.8932 12.6399 19.8232 12.8799 19.6832L18.2399 16.5922C18.7199 16.3121 19.1099 15.6419 19.1099 15.0917V8.90986C19.1099 8.3597 18.7199 7.67949 18.2399 7.40941H18.2199ZM11.9999 17.8826L6.90991 14.9417V9.05991L11.9999 6.11901L17.0899 9.05991V13.7813L13.9999 12.0008V11.2606C13.9999 11.0005 13.8599 10.7704 13.6399 10.6404L12.3599 9.90017C12.2499 9.84015 12.1199 9.80013 11.9999 9.80013C11.8799 9.80013 11.7499 9.83014 11.6399 9.90017L10.3599 10.6404C10.1399 10.7704 9.99991 11.0105 9.99991 11.2606V12.741C9.99991 13.0011 10.1399 13.2312 10.3599 13.3612L11.6399 14.1014C11.7499 14.1615 11.8799 14.2015 11.9999 14.2015C12.1199 14.2015 12.2499 14.1715 12.3599 14.1014L12.9999 13.7313L16.0899 15.5119L11.9999 17.8726V17.8826Z"
        />
      </g>
      <defs>
        <radialGradient
          id={gradientId}
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
        <clipPath id={clipId}>
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
