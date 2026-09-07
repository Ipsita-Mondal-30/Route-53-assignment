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
    <div className="sticky top-[var(--nav-h)] z-40 flex h-[var(--crumb-h)] items-center gap-3 border-b border-[#232b37] bg-[#232f3e] px-3">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={onToggleSidebar}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#42b4ff] text-white hover:bg-[#6ec4ff]"
      >
        <Menu className="h-4 w-4" strokeWidth={2.5} />
      </button>

      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-1.5 text-[14px] leading-5"
      >
        <Link
          href="/dashboard"
          className="truncate font-bold text-[#42b4ff]! underline decoration-[#42b4ff] decoration-1 underline-offset-[3px] hover:text-[#6ec4ff]!"
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
                className="h-3.5 w-3.5 shrink-0 text-[#87919c]"
                strokeWidth={2.5}
              />
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="truncate font-bold text-[#42b4ff]! underline decoration-[#42b4ff] decoration-1 underline-offset-[3px] hover:text-[#6ec4ff]!"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className="truncate font-bold text-white"
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
          className="inline-flex h-7 w-7 items-center justify-center text-[#aab7b8] hover:text-white"
        >
          <Info className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
