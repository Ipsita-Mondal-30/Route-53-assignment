import type { ReactNode } from "react";

export function ConsoleCard({
  children,
  className,
  padding = true,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-[var(--c-border)] bg-[var(--c-bg)] ${
        padding ? "p-4 sm:p-5" : ""
      } ${className ?? ""}`}
    >
      {children}
    </section>
  );
}

export function ConsoleCardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`text-[16px] leading-6 font-bold text-[var(--c-text-heading)] ${className ?? ""}`}
    >
      {children}
    </h2>
  );
}
