"use client";

import { useEffect, useId, useRef, useState } from "react";

import {
  AwsWordmark,
  BellIcon,
  ChevronDownIcon,
  CloudShellIcon,
  GearIcon,
  GridIcon,
  HelpIcon,
  SearchIcon,
  ServiceHexIcon,
} from "@/components/console/console-icons";
import type { ConsoleSession } from "@/lib/auth";

export function GlobalNav({ session }: { session: ConsoleSession }) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const menuId = useId();
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey && event.code === "KeyS") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setAccountOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-[var(--nav-h)] items-center gap-2 border-b border-[var(--c-border-subtle)] bg-[var(--c-bg)] px-2 text-[13px] text-[var(--c-text-heading)] sm:gap-3 sm:px-3">
      <a href="/" className="shrink-0 px-1 text-white hover:text-white" aria-label="AWS">
        <AwsWordmark />
      </a>
      <span className="hidden h-5 w-px bg-[#3d4654] sm:block" aria-hidden="true" />
      <button
        type="button"
        className="hidden h-8 w-8 items-center justify-center text-white lg:inline-flex"
        aria-label="AWS services"
      >
        <ServiceHexIcon className="h-[22px] w-[22px]" />
      </button>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center text-[#c5cdd6] hover:text-white"
        aria-label="Services"
      >
        <GridIcon className="h-4 w-4" />
      </button>

      <label className="relative mx-1 hidden min-w-0 flex-1 items-center lg:flex">
        <span className="sr-only">Search</span>
        <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-[#8d99a6]" />
        <input
          ref={searchRef}
          type="search"
          placeholder="Search"
          className="h-8 w-full max-w-[720px] rounded-full border-0 bg-[var(--c-bg-search)] py-0 pr-24 pl-9 text-[13px] text-[var(--c-text)] outline-none placeholder:text-[#8d99a6] focus:shadow-[0_0_0_1px_#42b4ff]"
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[12px] text-[#8d99a6]">
          [Option+S]
        </span>
      </label>

      <div className="ml-auto flex items-center gap-0.5 sm:gap-1 lg:ml-0">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center text-[#c5cdd6] lg:hidden"
          aria-label="Search"
          onClick={() => searchRef.current?.focus()}
        >
          <SearchIcon className="h-4 w-4" />
        </button>
        <IconButton label="CloudShell" className="hidden sm:inline-flex">
          <CloudShellIcon className="h-[16px] w-[16px]" />
        </IconButton>
        <IconButton label="Notifications" className="hidden md:inline-flex">
          <BellIcon className="h-[16px] w-[16px]" />
        </IconButton>
        <IconButton label="Help">
          <HelpIcon className="h-[16px] w-[16px]" />
        </IconButton>
        <IconButton label="Settings" className="hidden md:inline-flex">
          <GearIcon className="h-[16px] w-[16px]" />
        </IconButton>
      </div>

      <button
        type="button"
        className="hidden h-8 items-center gap-1 px-1.5 text-[13px] text-[var(--c-text-heading)] hover:bg-[var(--c-bg-hover)] lg:inline-flex"
      >
        Global
        <ChevronDownIcon className="h-3 w-3 text-[#8d99a6]" />
      </button>

      <div ref={accountRef} className="relative">
        <button
          type="button"
          aria-expanded={accountOpen}
          aria-controls={menuId}
          onClick={() => setAccountOpen((value) => !value)}
          className="flex h-8 max-w-[168px] items-center gap-1 px-1.5 text-left hover:bg-[var(--c-bg-hover)] sm:max-w-[210px]"
        >
          <span className="min-w-0 leading-[1.15]">
            <span className="block truncate text-[11px] text-[#c5cdd6]">
              {session.workgroup}
            </span>
            <span className="block truncate text-[12px] text-[var(--c-text-heading)]">
              {session.name}
            </span>
          </span>
          <ChevronDownIcon className="h-3 w-3 shrink-0 text-[#8d99a6]" />
        </button>
        {accountOpen ? (
          <div
            id={menuId}
            className="absolute top-full right-0 z-50 mt-1 w-56 rounded-lg border border-[var(--c-border)] bg-[#1a212c] py-2 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
          >
            <p className="px-3 text-[12px] text-[#8d99a6]">Account</p>
            <p className="px-3 pt-1 text-[13px] text-[var(--c-text-heading)]">
              {session.workgroup}
            </p>
            <p className="px-3 pb-2 text-[13px]">{session.name}</p>
            <div className="border-t border-[var(--c-border-subtle)] px-3 pt-2">
              <a href="/" className="text-[13px]">
                aws.amazon.com
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function IconButton({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center text-[#c5cdd6] hover:bg-[var(--c-bg-hover)] hover:text-white ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
