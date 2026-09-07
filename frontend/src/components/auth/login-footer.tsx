import { ExternalLinkIcon } from "@/components/auth/auth-marks";

export function LoginFooter() {
  return (
    <footer className="shrink-0 px-4 pb-4 pt-2 text-center text-[11px] leading-4 text-[#d5dbdb]">
      <nav
        aria-label="Legal"
        className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1"
      >
        <a
          href="#"
          className="aws-focus inline-flex items-center gap-1 hover:underline"
        >
          Privacy
          <ExternalLinkIcon className="h-3 w-3" />
        </a>
        <span aria-hidden="true" className="text-[#8d99a6]">
          |
        </span>
        <a
          href="#"
          className="aws-focus inline-flex items-center gap-1 hover:underline"
        >
          Site terms
          <ExternalLinkIcon className="h-3 w-3" />
        </a>
        <span aria-hidden="true" className="text-[#8d99a6]">
          |
        </span>
        <a href="#" className="aws-focus hover:underline">
          Cookie preferences
        </a>
      </nav>
      <p className="mt-1.5 text-[#aab7c4]">
        © 2026, Amazon Web Services, Inc. or its affiliates. All rights reserved.
      </p>
    </footer>
  );
}
