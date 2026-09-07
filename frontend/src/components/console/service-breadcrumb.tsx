"use client";

import Link from "next/link";
import { ChevronRight, Info, Menu } from "lucide-react";

export type BreadcrumbCrumb = {
  label: string;
  href?: string;
};

export function ServiceBreadcrumb({
  crumbs,
  onToggleSidebar,
}: {
  crumbs: BreadcrumbCrumb[];
  onToggleSidebar: () => void;
}) {
  return (
    <div className="service-breadcrumb sticky top-[var(--nav-h)] z-40 flex h-[var(--crumb-h)] items-center gap-3 border-b border-[color:var(--c-border)] bg-[var(--c-bg-breadcrumb)] px-3">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={onToggleSidebar}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--c-link)] text-white hover:bg-[var(--c-link-hover)]"
      >
        <Menu className="h-4 w-4" strokeWidth={2.5} />
      </button>

      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-1.5 text-[14px] leading-5"
      >
        <Link
          href="/dashboard"
          className="truncate font-bold text-[var(--c-link)]! underline decoration-[var(--c-link)] decoration-1 underline-offset-[3px] hover:text-[var(--c-link-hover)]!"
        >
          Route 53
        </Link>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <span
              key={`${crumb.label}-${index}`}
              className="flex min-w-0 items-center gap-1.5"
            >
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 text-[var(--c-text-muted)]"
                strokeWidth={2.5}
              />
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="truncate font-bold text-[var(--c-link)]! underline decoration-[var(--c-link)] decoration-1 underline-offset-[3px] hover:text-[var(--c-link-hover)]!"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className="truncate font-bold text-[var(--c-text-heading)]"
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          aria-label="Info"
          className="inline-flex h-7 w-7 items-center justify-center text-[var(--c-text-muted)] hover:text-[var(--c-text-heading)]"
        >
          <Info className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
