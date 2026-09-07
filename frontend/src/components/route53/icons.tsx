export function SortChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 14"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 1.2 8.4 5.2H1.6L5 1.2Z" opacity="0.85" />
      <path d="M5 12.8 1.6 8.8h6.8L5 12.8Z" opacity="0.85" />
    </svg>
  );
}

export function RemoveTagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path
        d="m4.2 4.2 7.6 7.6M11.8 4.2 4.2 11.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
