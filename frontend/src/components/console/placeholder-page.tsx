import { ConsoleCard } from "@/components/console/console-card";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline gap-2">
        <h1 className="text-[20px] leading-7 font-bold text-[var(--c-text-heading)] sm:text-[24px]">
          {title}
        </h1>
        <a href="#" className="text-[14px]">
          Info
        </a>
      </div>
      <ConsoleCard>
        <p className="text-[14px] leading-5">
          {description ??
            `${title} is available in the Route 53 navigation. This page is a visual placeholder in the demo console and is not connected to AWS.`}
        </p>
      </ConsoleCard>
    </div>
  );
}
