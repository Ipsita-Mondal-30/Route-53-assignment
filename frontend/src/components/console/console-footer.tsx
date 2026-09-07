import { FeedbackIcon, PhoneIcon } from "@/components/console/console-icons";

const leftLinks = [
  { label: "Feedback", icon: FeedbackIcon },
  { label: "Console Mobile App", icon: PhoneIcon },
] as const;

export function ConsoleFooter() {
  return (
    <footer className="flex min-h-[40px] flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-[color:var(--c-border-subtle)] bg-[var(--c-bg-footer)] px-4 py-2 text-[12px] leading-4 text-[var(--c-text-muted)]">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        {leftLinks.map((link) => (
          <a
            key={link.label}
            href="#"
            className="inline-flex items-center gap-1.5 text-[var(--c-text-muted)]! hover:text-[var(--c-text-heading)]! hover:no-underline"
          >
            <link.icon className="h-3.5 w-3.5" />
            {link.label}
          </a>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span>© 2026, Amazon Web Services, Inc. or its affiliates.</span>
        <a href="#" className="text-[var(--c-text-muted)]! hover:text-[var(--c-text-heading)]! hover:no-underline">
          Privacy
        </a>
        <a href="#" className="text-[var(--c-text-muted)]! hover:text-[var(--c-text-heading)]! hover:no-underline">
          Terms
        </a>
        <a href="#" className="text-[var(--c-text-muted)]! hover:text-[var(--c-text-heading)]! hover:no-underline">
          Cookie preferences
        </a>
      </div>
    </footer>
  );
}
