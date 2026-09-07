"use client";

import type { ConsoleSession } from "@/lib/auth";
import { logoutSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  ChevronDown,
  Search,
} from "lucide-react";

import { NotificationNavButton } from "@/components/console/notification-popover";
import { RegionPickerPopover } from "@/components/console/region-picker-popover";
import { UserSettingsPopover } from "@/components/console/user-settings-popover";
import {
  AmazonQIcon,
  AmazonQSearchIcon,
  AwsWordmark,
  CaretDownIcon,
  CloudShellIcon,
  GearIcon,
  GridIcon,
  HelpIcon,
} from "@/components/console/console-icons";

export function GlobalNav({
  session,
  amazonQOpen = false,
  onToggleAmazonQ,
}: {
  session: ConsoleSession;
  amazonQOpen?: boolean;
  onToggleAmazonQ?: () => void;
}) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuId = useId();
  const accountRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey && event.code === "KeyS") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setAccountOpen(false);
        setSettingsOpen(false);
        setNotificationsOpen(false);
        setRegionOpen(false);
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
      if (!settingsRef.current?.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (!regionRef.current?.contains(event.target as Node)) {
        setRegionOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center overflow-visible border-b border-[#232b37] bg-[#16191f] text-[14px] font-bold text-white">
      <div className="flex min-w-0 flex-1 items-center">
        <a
          href="/"
          id="nav-home-link"
          className="inline-flex h-12 w-[65px] shrink-0 items-center justify-center"
          aria-label="AWS"
        >
          <AwsWordmark className="block h-[22px] w-[40px] text-[#eaeded]" />
        </a>

        <NavDivider />

        <button
          type="button"
          className={`inline-flex h-12 w-10 shrink-0 items-center justify-center hover:bg-[#232f3e] ${
            amazonQOpen ? "bg-[#232f3e] shadow-[inset_0_0_0_2px_#42b4ff]" : ""
          }`}
          aria-label="Amazon Q"
          aria-pressed={amazonQOpen}
          onClick={onToggleAmazonQ}
        >
          <AmazonQIcon className="h-6 w-6" />
        </button>

        <NavDivider />

        <button
          type="button"
          className="inline-flex h-12 w-10 shrink-0 items-center justify-center text-white hover:bg-[#232f3e]"
          aria-label="Services"
        >
          <GridIcon className="h-[18px] w-[18px]" />
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
            className="h-8 w-full max-w-[720px] rounded-md border border-[#545b64] bg-[#0f141a] py-0 pr-[210px] pl-9 text-[14px] leading-5 font-normal text-white outline-none placeholder:italic placeholder:font-normal placeholder:text-[#aab7b8] focus:border-[#42b4ff] focus:shadow-[0_0_0_1px_#42b4ff]"
          />
          <span className="pointer-events-none absolute top-1/2 right-[138px] -translate-y-1/2 text-[12px] leading-none font-bold text-[#aab7b8]">
            [Option+S]
          </span>
          <span className="pointer-events-none absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1.5 text-[13px] font-bold text-[#d5dbdb]">
            <AmazonQSearchIcon className="h-4 w-4" />
            Ask Amazon Q
          </span>
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
          <CloudShellIcon className="h-[18px] w-[18px]" />
        </IconButton>
        <NavDivider className="hidden sm:block" />

        <div ref={notificationsRef} className="relative">
          <NotificationNavButton
            open={notificationsOpen}
            onToggle={() => {
              setNotificationsOpen((value) => !value);
              setSettingsOpen(false);
              setAccountOpen(false);
              setRegionOpen(false);
            }}
            onClose={() => setNotificationsOpen(false)}
          />
        </div>
        <NavDivider />

        <IconButton label="Help">
          <HelpIcon className="h-[18px] w-[18px]" />
        </IconButton>
        <NavDivider />

        <div ref={settingsRef} className="relative hidden h-12 sm:block">
          <button
            type="button"
            aria-label="Settings"
            aria-expanded={settingsOpen}
            aria-haspopup="dialog"
            onClick={() => {
              setSettingsOpen((value) => !value);
              setAccountOpen(false);
              setNotificationsOpen(false);
              setRegionOpen(false);
            }}
            className={`inline-flex h-12 w-10 items-center justify-center hover:bg-[#232f3e] ${
              settingsOpen ? "bg-[#232f3e] text-[#42b4ff]" : "text-white"
            }`}
          >
            <GearIcon className="h-[18px] w-[18px]" />
          </button>
          <UserSettingsPopover
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        </div>
        <NavDivider className="hidden sm:block" />

        <div ref={regionRef} className="relative hidden h-12 sm:block">
          <button
            type="button"
            aria-label="Regions"
            aria-expanded={regionOpen}
            aria-haspopup="dialog"
            onClick={() => {
              setRegionOpen((value) => !value);
              setSettingsOpen(false);
              setAccountOpen(false);
              setNotificationsOpen(false);
            }}
            className={`inline-flex h-12 items-center gap-1.5 px-3 text-[13px] font-normal hover:bg-[#232f3e] ${
              regionOpen ? "bg-[#232f3e] text-[#42b4ff]" : "text-white"
            }`}
          >
            Global
            <CaretDownIcon
              className={`h-2 w-2 ${regionOpen ? "rotate-180 text-[#42b4ff]" : "text-[#aab7b8]"}`}
            />
          </button>
          <RegionPickerPopover
            open={regionOpen}
            onClose={() => setRegionOpen(false)}
          />
        </div>

        <NavDivider className="hidden sm:block" />

        <div ref={accountRef} className="relative flex h-12 items-stretch">
          <button
            type="button"
            aria-expanded={accountOpen}
            aria-controls={menuId}
            onClick={() => {
              setAccountOpen((value) => !value);
              setSettingsOpen(false);
              setNotificationsOpen(false);
              setRegionOpen(false);
            }}
            className="mx-1 my-1.5 mr-2 flex h-9 min-w-[190px] flex-col justify-center px-2 text-left hover:bg-[#232f3e]"
          >
            <span className="flex items-center justify-between gap-1.5 rounded-md bg-[#414d5c] px-2 py-[3px]">
              <span className="max-w-[168px] truncate text-[12px] leading-[14px] font-bold text-white">
                {session.workgroup}
              </span>
              <ChevronDown
                className="h-3 w-3 shrink-0 text-[#d5dbdb]"
                strokeWidth={2.5}
              />
            </span>
            <span className="mt-0.5 pr-0.5 text-right text-[11px] leading-[13px] font-normal text-[#aab7b8]">
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
