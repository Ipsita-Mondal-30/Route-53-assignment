export function SortChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 6"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 5.2 1.2 1.2h7.6L5 5.2Z" />
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
