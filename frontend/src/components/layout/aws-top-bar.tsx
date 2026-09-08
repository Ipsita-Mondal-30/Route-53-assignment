"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import {
  CheckIcon,
  ChevronDownIcon,
  GlobeIcon,
  UserCircleIcon,
} from "@/components/ui/icons";

type OpenMenu = "language" | "support" | "account" | "profile" | null;

const LANGUAGES_LEFT = [
  "العربية",
  "Bahasa Indonesia",
  "Deutsch",
  "English",
  "Español",
  "Français",
  "Italiano",
] as const;

const LANGUAGES_RIGHT = [
  "日本語",
  "한국어",
  "Português",
  "Türkçe",
  "中文(简体)",
  "中文(繁體)",
] as const;

const SUPPORT_LINKS = [
  { label: "Support Center", href: "#" },
  { label: "Expert Help", href: "#" },
  { label: "Documentation", href: "#" },
  { label: "Knowledge Center", href: "#" },
  { label: "AWS Support Overview", href: "#" },
  { label: "AWS re:Post", href: "#" },
] as const;

const ACCOUNT_LINKS = [
  { label: "AWS Management Console", href: "/signin" },
  { label: "Account Settings", href: "#" },
  { label: "Billing & Cost Management", href: "#" },
  { label: "Security Credentials", href: "#" },
  { label: "AWS Personal Health Dashboard", href: "#" },
] as const;

const menuPanelClass =
  "absolute top-[calc(100%+8px)] z-[70] overflow-hidden rounded-lg border border-[#d5dbdb] bg-white py-2 text-aws-ink shadow-[0_8px_28px_rgba(15,20,26,0.16)]";

const menuItemClass =
  "aws-focus block w-full px-4 py-2 text-left text-[14px] text-[#161d26] hover:bg-[#f2f3f3]";

function useDismiss(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return ref;
}

export function AwsTopBar() {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [language, setLanguage] = useState("English");
  const [detectLanguage, setDetectLanguage] = useState(false);
  const languageId = useId();
  const supportId = useId();
  const accountId = useId();
  const profileId = useId();
  const barRef = useDismiss(openMenu !== null, () => setOpenMenu(null));

  function toggle(menu: Exclude<OpenMenu, null>) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  return (
    <div className="bg-[#16191f] text-white">
      <div
        ref={barRef}
        className="mx-auto flex h-[48px] max-w-[1600px] items-center justify-end gap-4 px-5 text-[13px] md:h-[52px] md:gap-5 md:px-8"
      >
        <div className="relative">
          <button
            type="button"
            className="aws-focus inline-flex items-center gap-1.5 whitespace-nowrap hover:underline"
            aria-expanded={openMenu === "language"}
            aria-haspopup="listbox"
            aria-controls={languageId}
            onClick={() => toggle("language")}
          >
            <GlobeIcon className="h-4 w-4" />
            {language}
            <ChevronDownIcon className="h-2.5 w-2.5" />
          </button>
          {openMenu === "language" ? (
            <div
              id={languageId}
              role="listbox"
              aria-label="Select language"
              className={`${menuPanelClass} right-0 w-[min(92vw,420px)] p-0`}
            >
              <div className="grid grid-cols-2 gap-x-1 px-2 py-2">
                <div>
                  {LANGUAGES_LEFT.map((name) => {
                    const selected = name === language;
                    return (
                      <button
                        key={name}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`aws-focus flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[14px] ${
                          selected
                            ? "bg-[#16191f] text-white"
                            : "text-[#161d26] hover:bg-[#f2f3f3]"
                        }`}
                        onClick={() => {
                          setLanguage(name);
                          setOpenMenu(null);
                        }}
                      >
                        {name}
                        {selected ? <CheckIcon className="h-4 w-4" /> : null}
                      </button>
                    );
                  })}
                </div>
                <div>
                  {LANGUAGES_RIGHT.map((name) => {
                    const selected = name === language;
                    return (
                      <button
                        key={name}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`aws-focus flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-[14px] ${
                          selected
                            ? "bg-[#16191f] text-white"
                            : "text-[#161d26] hover:bg-[#f2f3f3]"
                        }`}
                        onClick={() => {
                          setLanguage(name);
                          setOpenMenu(null);
                        }}
                      >
                        {name}
                        {selected ? <CheckIcon className="h-4 w-4" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-[#d5dbdb] px-4 py-3">
                <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-[#161d26]">
                  <input
                    type="checkbox"
                    checked={detectLanguage}
                    onChange={(event) => setDetectLanguage(event.target.checked)}
                    className="iam-signin-checkbox mt-0.5"
                  />
                  <span>
                    <span className="block font-medium">Detect language</span>
                    <span className="mt-0.5 block text-[12px] text-[#545b64]">
                      Automatically translated to {language}
                    </span>
                  </span>
                </label>
              </div>
            </div>
          ) : null}
        </div>

        <a
          href="#"
          className="aws-focus hidden whitespace-nowrap hover:underline sm:inline"
        >
          Contact us
        </a>
        <a
          href="#"
          className="aws-focus hidden whitespace-nowrap hover:underline md:inline"
        >
          AWS Marketplace
        </a>

        <div className="relative hidden sm:block">
          <button
            type="button"
            className={`aws-focus inline-flex items-center gap-1 whitespace-nowrap hover:underline ${
              openMenu === "support" ? "underline" : ""
            }`}
            aria-expanded={openMenu === "support"}
            aria-haspopup="menu"
            aria-controls={supportId}
            onClick={() => toggle("support")}
          >
            Support
            <ChevronDownIcon className="h-2.5 w-2.5" />
          </button>
          {openMenu === "support" ? (
            <div
              id={supportId}
              role="menu"
              className={`${menuPanelClass} right-0 min-w-[240px]`}
            >
              {SUPPORT_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  role="menuitem"
                  className={menuItemClass}
                  onClick={() => setOpenMenu(null)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            className={`aws-focus inline-flex items-center gap-1 whitespace-nowrap hover:underline ${
              openMenu === "account" ? "underline" : ""
            }`}
            aria-expanded={openMenu === "account"}
            aria-haspopup="menu"
            aria-controls={accountId}
            onClick={() => toggle("account")}
          >
            My account
            <ChevronDownIcon className="h-2.5 w-2.5" />
          </button>
          {openMenu === "account" ? (
            <div
              id={accountId}
              role="menu"
              className={`${menuPanelClass} right-0 min-w-[280px]`}
            >
              {ACCOUNT_LINKS.map((link) =>
                link.href.startsWith("/") ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    role="menuitem"
                    className={menuItemClass}
                    onClick={() => setOpenMenu(null)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    role="menuitem"
                    className={menuItemClass}
                    onClick={() => setOpenMenu(null)}
                  >
                    {link.label}
                  </a>
                ),
              )}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="AWS Profile"
            aria-expanded={openMenu === "profile"}
            aria-haspopup="dialog"
            aria-controls={profileId}
            onClick={() => toggle("profile")}
            className="aws-focus aws-glow rounded-full p-0.5 text-white"
          >
            <UserCircleIcon className="h-6 w-6" />
          </button>
          {openMenu === "profile" ? (
            <div
              id={profileId}
              role="dialog"
              aria-label="AWS Profile"
              className="absolute top-[calc(100%+10px)] right-0 z-[70] w-[300px] rounded-2xl bg-white p-5 text-aws-ink shadow-[0_8px_28px_rgba(15,20,26,0.18)]"
            >
              <h2 className="text-[18px] font-bold text-aws-ink">AWS Profile</h2>
              <p className="mt-2 text-[14px] leading-6 text-aws-muted">
                Your profile helps improve your interactions with select AWS
                experiences.
              </p>
              <Link
                href="/login"
                className="aws-btn-primary aws-focus mt-5 inline-flex h-11 w-full text-[14px]"
                onClick={() => setOpenMenu(null)}
              >
                Create profile or sign in
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
