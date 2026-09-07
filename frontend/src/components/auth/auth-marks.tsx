export function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M6.5 3.5H3.5A1 1 0 0 0 2.5 4.5v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M9.5 2.5h4v4M13.5 2.5 7 9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

export function AppleMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12.8 9.4c0-1.8 1.5-2.7 1.5-2.7s-1.2-1.7-3-1.7c-1.6 0-2.1.8-3.1.8-1.1 0-1.9-.8-3.2-.8-1.7 0-3.5 1.5-3.5 4.4 0 1.8.7 3.6 1.6 4.8.7 1 1.4 1.9 2.4 1.9.9 0 1.3-.6 2.5-.6 1.2 0 1.5.6 2.5.6 1 0 1.7-.9 2.4-1.8.5-.7.8-1.3 1-1.9-2.3-1-2.1-3.9-2.1-4zM11.1 3.8c.6-.7 1-1.7.9-2.7-1 .1-2.1.7-2.7 1.5-.6.7-1 1.6-.9 2.6 1 0 2-.6 2.7-1.4z" />
    </svg>
  );
}

export function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M9 0C4 0 0 4.1 0 9.1c0 4 2.6 7.4 6.2 8.6.5.1.6-.2.6-.4v-1.5c-2.5.6-3.1-1.2-3.1-1.2-.4-1.1-1-1.4-1-1.4-.8-.6.1-.6.1-.6.9.1 1.4.9 1.4.9.8 1.4 2.1 1 2.6.8.1-.6.3-1 .6-1.2-2-.2-4.1-1-4.1-4.5 0-1 .3-1.8.9-2.4-.1-.2-.4-1.2.1-2.4 0 0 .8-.2 2.5 1 .7-.2 1.5-.3 2.3-.3s1.6.1 2.3.3c1.7-1.2 2.5-1 2.5-1 .5 1.2.2 2.2.1 2.4.6.6.9 1.4.9 2.4 0 3.5-2.1 4.2-4.1 4.5.3.3.6.8.6 1.6v2.4c0 .2.2.5.6.4C15.4 16.5 18 13.1 18 9.1 18 4.1 14 0 9 0z"
      />
    </svg>
  );
}
