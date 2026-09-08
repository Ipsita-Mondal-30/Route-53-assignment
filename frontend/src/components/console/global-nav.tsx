"use client";

import type { ConsoleSession } from "@/lib/auth";
import { logoutSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Search, Settings } from "lucide-react";

import { NotificationNavButton } from "@/components/console/notification-popover";
import { RegionPickerPopover } from "@/components/console/region-picker-popover";
import { UserSettingsPopover } from "@/components/console/user-settings-popover";
import { useKeyboardShortcuts } from "@/components/console/keyboard-shortcuts-provider";
import {
  AmazonQIcon,
  AmazonQSearchIcon,
  AwsWordmark,
  CaretDownIcon,
  CloudShellIcon,
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
  const { openHelp } = useKeyboardShortcuts();
  const searchRef = useRef<HTMLInputElement>(null);
  const [askQHover, setAskQHover] = useState(false);
  const askQHideTimer = useRef<number | null>(null);
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

  const showAskQ = askQHover || amazonQOpen;

  function revealAskQ() {
    if (askQHideTimer.current !== null) {
      window.clearTimeout(askQHideTimer.current);
      askQHideTimer.current = null;
    }
    setAskQHover(true);
  }

  function concealAskQ() {
    if (askQHideTimer.current !== null) {
      window.clearTimeout(askQHideTimer.current);
    }
    askQHideTimer.current = window.setTimeout(() => {
      setAskQHover(false);
      askQHideTimer.current = null;
    }, 120);
  }

  useEffect(() => {
    return () => {
      if (askQHideTimer.current !== null) {
        window.clearTimeout(askQHideTimer.current);
      }
    };
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
          aria-label="Ask Amazon Q"
          aria-pressed={amazonQOpen}
          onMouseEnter={revealAskQ}
          onMouseLeave={concealAskQ}
          onFocus={revealAskQ}
          onBlur={concealAskQ}
          onClick={onToggleAmazonQ}
        >
          <AmazonQIcon className="h-6 w-6" />
        </button>

        <button
          type="button"
          className="inline-flex h-12 w-10 shrink-0 items-center justify-center text-white hover:bg-[#232f3e]"
          aria-label="Services"
        >
          <GridIcon className="h-[18px] w-[18px]" />
        </button>

        <div className="relative mx-2 hidden h-7 w-[260px] shrink-0 md:block lg:w-[300px]">
          <span className="sr-only">Search</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 z-[1] h-3.5 w-3.5 -translate-y-1/2 text-[#8d99a6]"
            strokeWidth={2.25}
          />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search"
            data-shortcut-search="nav"
            className={`h-7 w-full rounded-sm border border-[#687078] bg-[#232f3e] py-0 pl-8 text-[13px] leading-5 font-normal text-[#d5dbdb] outline-none placeholder:italic placeholder:font-normal placeholder:text-[#8d99a6] appearance-none focus:border-[#42b4ff] focus:shadow-[0_0_0_1px_#42b4ff] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden ${
              showAskQ ? "pr-[210px]" : "pr-[96px]"
            }`}
          />
          <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center gap-1.5">
            <span className="text-[11px] leading-none font-normal text-[#8d99a6]">
              [Option+S]
            </span>
            <button
              type="button"
              className={`ask-q-chip pointer-events-auto inline-flex h-5 items-center gap-1 rounded-full text-[11px] leading-none font-normal text-[#d5dbdb] ${
                showAskQ
                  ? "border border-[#8d99a6] bg-[#16191f] pr-2 pl-1"
                  : "border border-transparent px-0.5"
              }`}
              aria-label="Ask Amazon Q"
              aria-pressed={amazonQOpen}
              onMouseEnter={revealAskQ}
              onMouseLeave={concealAskQ}
              onFocus={revealAskQ}
              onBlur={concealAskQ}
              onClick={onToggleAmazonQ}
            >
              <AmazonQSearchIcon className="h-3.5 w-3.5 shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap ${
                  showAskQ ? "max-w-[110px] opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                Ask Amazon Q
              </span>
            </button>
          </div>
        </div>
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

        <IconButton label="Help" ariaHasPopup="dialog" onClick={openHelp}>
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
            <Settings className="h-[18px] w-[18px]" strokeWidth={2} />
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

        <div ref={accountRef} className="relative flex h-12 shrink-0">
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
            className={`flex h-12 flex-col items-end justify-center px-3 text-right hover:bg-[#232f3e] ${
              accountOpen ? "bg-[#232f3e]" : ""
            }`}
          >
            <span className="inline-flex h-[18px] max-w-[220px] items-center gap-1 rounded-[4px] bg-[#414d5c] px-2">
              <span className="truncate text-[12px] leading-[18px] font-bold text-white">
                {session.workgroup}
              </span>
              <CaretDownIcon className="h-1.5 w-1.5 shrink-0 text-[#d5dbdb]" />
            </span>
            <span className="mt-0.5 max-w-[220px] truncate pr-0.5 text-[11px] leading-[13px] font-normal text-[#d1d5db]">
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
                      router.replace("/signin");
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
  onClick,
  ariaHasPopup,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  ariaHasPopup?: "dialog";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-haspopup={ariaHasPopup}
      onClick={onClick}
      className={`inline-flex h-12 w-10 items-center justify-center text-white hover:bg-[#232f3e] ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
