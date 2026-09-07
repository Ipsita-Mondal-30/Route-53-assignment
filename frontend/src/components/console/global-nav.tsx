"use client";

import type { ConsoleSession } from "@/lib/auth";
import { logoutSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LayoutGrid,
  Search,
  Settings,
  SquareTerminal,
} from "lucide-react";

import {
  AmazonQIcon,
  AmazonQSearchIcon,
  AwsWordmark,
} from "@/components/console/console-icons";

export function GlobalNav({ session }: { session: ConsoleSession }) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
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
    <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center border-b border-[#232b37] bg-[#16191f] text-[14px] font-bold text-white">
      <div className="flex min-w-0 flex-1 items-center">
        <a
          href="/"
          className="flex h-12 shrink-0 items-center px-3 text-white hover:text-white"
          aria-label="AWS"
        >
          <AwsWordmark />
        </a>

        <NavDivider />

        <button
          type="button"
          className="inline-flex h-12 w-10 shrink-0 items-center justify-center hover:bg-[#232f3e]"
          aria-label="Amazon Q"
        >
          <AmazonQIcon className="h-6 w-6" />
        </button>

        <NavDivider />

        <button
          type="button"
          className="inline-flex h-12 w-10 shrink-0 items-center justify-center text-white hover:bg-[#232f3e]"
          aria-label="Services"
        >
          <LayoutGrid className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </button>

        <label className="relative mx-2 hidden min-w-0 flex-1 items-center md:flex">
          <span className="sr-only">Search</span>
          <Search
            className="pointer-events-none absolute left-3 z-[1] h-4 w-4 text-[#aab7b8]"
            strokeWidth={2.25}
          />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search"
            className="h-8 w-full max-w-[720px] rounded-md border border-[#545b64] bg-[#0f141a] py-0 pr-[108px] pl-9 text-[14px] leading-5 font-bold text-white outline-none placeholder:font-normal placeholder:text-[#aab7b8] focus:border-[#42b4ff] focus:shadow-[0_0_0_1px_#42b4ff]"
          />
          <span className="pointer-events-none absolute top-1/2 right-9 -translate-y-1/2 text-[12px] leading-none font-bold text-[#aab7b8]">
            [Option+S]
          </span>
          <AmazonQSearchIcon className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-[#d5dbdb]" />
        </label>
      </div>

      <div className="ml-auto flex h-12 shrink-0 items-center">
        <button
          type="button"
          className="inline-flex h-12 w-10 items-center justify-center text-white hover:bg-[#232f3e] md:hidden"
          aria-label="Search"
          onClick={() => searchRef.current?.focus()}
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </button>

        <IconButton label="CloudShell" className="hidden sm:inline-flex">
          <SquareTerminal className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </IconButton>
        <NavDivider className="hidden sm:block" />

        <IconButton label="Notifications">
          <Bell className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </IconButton>
        <NavDivider />

        <IconButton label="Help">
          <CircleHelp className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </IconButton>
        <NavDivider />

        <IconButton label="Settings" className="hidden sm:inline-flex">
          <Settings className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </IconButton>
        <NavDivider className="hidden sm:block" />

        <button
          type="button"
          className="hidden h-12 items-center gap-1.5 px-3 text-[14px] font-bold text-white hover:bg-[#232f3e] sm:inline-flex"
        >
          Global
          <ChevronDown className="h-3.5 w-3.5 text-[#aab7b8]" strokeWidth={2.5} />
        </button>

        <NavDivider className="hidden sm:block" />

        <div ref={accountRef} className="relative flex h-12 items-stretch">
          <button
            type="button"
            aria-expanded={accountOpen}
            aria-controls={menuId}
            onClick={() => setAccountOpen((value) => !value)}
            className="flex h-12 min-w-[190px] flex-col justify-center px-3 text-left hover:bg-[#232f3e]"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="max-w-[190px] truncate text-[13px] leading-[15px] font-bold text-white">
                {session.workgroup}
              </span>
              <ChevronDown
                className="h-3.5 w-3.5 shrink-0 text-[#aab7b8]"
                strokeWidth={2.5}
              />
            </span>
            <span className="mt-px text-right text-[12px] leading-[14px] font-bold text-[#aab7b8]">
              {session.name}
            </span>
          </button>

          {accountOpen ? (
            <div
              id={menuId}
              className="absolute top-full right-0 z-50 w-64 border border-[#414d5c] bg-[#1b232d] py-2 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
            >
              <p className="px-3 text-[12px] font-bold text-[#aab7b8]">Account</p>
              <p className="px-3 pt-1 text-[13px] font-bold text-white">
                {session.workgroup}
              </p>
              <p className="px-3 pb-2 text-[13px] font-bold text-[#d1d5db]">
                {session.name}
              </p>
              <div className="border-t border-[#2a313c] px-3 pt-2 space-y-2">
                {session.email ? (
                  <p className="text-[12px] text-[#aab7b8]">{session.email}</p>
                ) : null}
                <a href="/" className="block text-[13px] font-bold text-[#42b4ff]">
                  aws.amazon.com
                </a>
                <button
                  type="button"
                  disabled={loggingOut}
                  className="text-[13px] font-bold text-[#eb6f6f] hover:underline disabled:opacity-60"
                  onClick={async () => {
                    setLoggingOut(true);
                    try {
                      await logoutSession();
                      router.replace("/login");
                    } finally {
                      setLoggingOut(false);
                      setAccountOpen(false);
                    }
                  }}
                >
                  {loggingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function NavDivider({ className }: { className?: string }) {
  return (
    <span
      className={`mx-0 h-5 w-px shrink-0 self-center bg-[#545b64] ${className ?? ""}`}
      aria-hidden="true"
    />
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
      className={`inline-flex h-12 w-10 items-center justify-center text-white hover:bg-[#232f3e] ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
