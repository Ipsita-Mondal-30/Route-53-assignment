import { ConsoleCard } from "@/components/console/console-card";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h1 className="text-[22px] leading-8 font-bold text-[var(--c-text-heading)] sm:text-[24px]">
          {title}
        </h1>
        <a href="#" className="text-[14px] font-bold text-[var(--c-link)] hover:underline">
          Info
        </a>
      </div>

      <ConsoleCard className="flex min-h-[min(52vh,480px)] flex-1 flex-col items-center justify-center text-center">
        <p className="text-[18px] leading-6 font-bold text-[var(--c-text-heading)]">Coming soon</p>
        <p className="mt-2 max-w-lg text-[14px] leading-5 font-bold text-[var(--c-text-muted)]">
          {description ??
            `${title} is not available in this console yet. This page matches the Route 53 navigation and will be connected later.`}
        </p>
      </ConsoleCard>
    </div>
  );
}
