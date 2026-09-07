import {
  CloudShellIcon,
  FeedbackIcon,
  PhoneIcon,
  ToolkitIcon,
} from "@/components/console/console-icons";

const leftLinks = [
  { label: "CloudShell", icon: CloudShellIcon },
  { label: "Agent Toolkit for AWS", icon: ToolkitIcon },
  { label: "Feedback", icon: FeedbackIcon },
  { label: "Console mobile app", icon: PhoneIcon },
] as const;

export function ConsoleFooter() {
  return (
    <footer className="flex min-h-[var(--footer-h)] flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-[var(--c-border-subtle)] bg-[var(--c-bg)] px-3 py-1.5 text-[12px] text-[#c5cdd6]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {leftLinks.map((link) => (
          <a
            key={link.label}
            href="#"
            className="inline-flex items-center gap-1.5 text-[#d1d5db]! hover:text-white! hover:no-underline"
          >
            <link.icon className="h-3.5 w-3.5" />
            {link.label}
          </a>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#c5cdd6]">
        <span>© 2026, Amazon Web Services, Inc. or its affiliates. All rights reserved.</span>
        <a href="#" className="text-[#d1d5db]! hover:text-white! hover:no-underline">
          Privacy
        </a>
        <a href="#" className="text-[#d1d5db]! hover:text-white! hover:no-underline">
          Terms
        </a>
        <a href="#" className="text-[#d1d5db]! hover:text-white! hover:no-underline">
          Cookie preferences
        </a>
      </div>
    </footer>
  );
}
