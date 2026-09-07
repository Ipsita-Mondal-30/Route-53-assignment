"use client";

import Link from "next/link";

import { InfoCircleIcon, MenuIcon } from "@/components/console/console-icons";

export function ServiceBreadcrumb({
  current,
  onToggleSidebar,
}: {
  current: string;
  onToggleSidebar: () => void;
}) {
  return (
    <div className="sticky top-[var(--nav-h)] z-40 flex h-[var(--crumb-h)] items-center gap-2 border-b border-[var(--c-border-subtle)] bg-[var(--c-bg)] px-2 sm:px-3">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={onToggleSidebar}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#42b4ff] text-white hover:bg-[#7ec5f5]"
      >
        <MenuIcon className="h-4 w-4" />
      </button>
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[14px]">
        <Link href="/dashboard" className="truncate font-normal">
          Route 53
        </Link>
        <span className="text-[#8d99a6]" aria-hidden="true">
          &gt;
        </span>
        <span className="truncate text-[#c5cdd6]" aria-current="page">
          {current}
        </span>
      </nav>
      <button
        type="button"
        aria-label="Info"
        className="ml-auto inline-flex h-7 w-7 items-center justify-center text-[#d1d5db] hover:text-white"
      >
        <InfoCircleIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
