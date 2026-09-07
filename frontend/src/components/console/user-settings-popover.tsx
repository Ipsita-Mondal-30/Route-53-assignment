"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Info, LayoutGrid } from "lucide-react";

import { SettingsPopoverSkeleton } from "@/components/console/skeleton";
import {
  LANGUAGE_OPTIONS,
  type ConsoleLanguage,
  type VisualMode,
  useUserSettings,
} from "@/lib/user-settings";

const MODES: VisualMode[] = ["browser", "light", "dark"];

export function UserSettingsPopover({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { hydrated, language, visualMode, copy, setLanguage, setVisualMode } =
    useUserSettings();
  const [langOpen, setLangOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setLangOpen(false);
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const selectedLabel =
    LANGUAGE_OPTIONS.find((option) => option.value === language)?.label ??
    "English (US)";

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label={copy.title}
      className="user-settings-popover absolute top-full right-0 z-[70] mt-0 w-[340px] border border-[#687078] bg-[#161d26] text-left shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
    >
      {!hydrated ? (
        <SettingsPopoverSkeleton />
      ) : (
        <div className="px-5 py-4">
          <div className="mb-5 flex items-start justify-between gap-3">
            <h2 className="text-[16px] leading-6 font-bold text-white">{copy.title}</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Open settings in a new view"
                className="inline-flex h-7 w-7 items-center justify-center text-[#d5dbdb] hover:text-white"
              >
                <LayoutGrid className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label="Settings information"
                className="inline-flex h-7 w-7 items-center justify-center text-[#d5dbdb] hover:text-white"
              >
                <Info className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>
          </div>

          <div className="relative mb-5">
            <p className="mb-1.5 text-[12px] leading-4 text-[#aab7b8]">{copy.language}</p>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              onClick={() => setLangOpen((value) => !value)}
              className={`flex h-8 w-full items-center justify-between rounded-sm border bg-[#0f141a] px-3 text-[14px] text-white ${
                langOpen
                  ? "border-[#42b4ff] shadow-[0_0_0_1px_#42b4ff]"
                  : "border-[#687078] hover:border-[#8d99a6]"
              }`}
            >
              <span>{selectedLabel}</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#d5dbdb]" strokeWidth={2.5} />
            </button>
            {langOpen ? (
              <ul
                role="listbox"
                className="absolute top-[calc(100%+4px)] right-0 left-0 z-10 max-h-56 overflow-y-auto border border-[#687078] bg-[#161d26] py-1 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <li key={option.value} role="option" aria-selected={option.value === language}>
                    <button
                      type="button"
                      className={`flex w-full px-3 py-1.5 text-left text-[14px] ${
                        option.value === language
                          ? "bg-[#1a2838] text-white"
                          : "text-[#d5dbdb] hover:bg-[#1c2430]"
                      }`}
                      onClick={() => {
                        setLanguage(option.value as ConsoleLanguage);
                        setLangOpen(false);
                      }}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <fieldset className="mb-5 border-0 p-0">
            <legend className="mb-2.5 text-[12px] leading-4 text-[#aab7b8]">
              {copy.visualMode} - <em>{copy.beta}</em>
            </legend>
            <div className="space-y-2.5">
              {MODES.map((mode) => (
                <label
                  key={mode}
                  className="flex cursor-pointer items-center gap-2.5 text-[14px] leading-5 text-white"
                >
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      visualMode === mode
                        ? "border-[#42b4ff]"
                        : "border-[#7d8998]"
                    }`}
                  >
                    {visualMode === mode ? (
                      <span className="h-2 w-2 rounded-full bg-[#42b4ff]" />
                    ) : null}
                  </span>
                  <input
                    type="radio"
                    name="visual-mode"
                    value={mode}
                    checked={visualMode === mode}
                    onChange={() => setVisualMode(mode)}
                    className="sr-only"
                  />
                  {mode === "browser"
                    ? copy.browserDefault
                    : mode === "light"
                      ? copy.light
                      : copy.dark}
                </label>
              ))}
            </div>
          </fieldset>

          <Link
            href="/settings"
            onClick={onClose}
            className="text-[14px] font-bold text-[#42b4ff] hover:underline"
          >
            {copy.seeAll}
          </Link>
        </div>
      )}
    </div>
  );
}
