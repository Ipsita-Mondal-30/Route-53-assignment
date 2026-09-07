"use client";

import { useEffect, useId, useRef, useState } from "react";

const LANGUAGES = [
  "English",
  "Deutsch",
  "Español",
  "Français",
  "日本語",
  "한국어",
  "Português",
  "中文(简体)",
] as const;

type Language = (typeof LANGUAGES)[number];

export function SignupLanguageSelect() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("English");
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="absolute top-4 right-6 z-30 sm:top-5 sm:right-8"
    >
      <button
        type="button"
        className="aws-focus inline-flex items-center gap-1 text-[14px] text-[#0073bb]"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label="Select language"
        onClick={() => setOpen((value) => !value)}
      >
        {language}
        <svg
          viewBox="0 0 12 8"
          className={`h-2.5 w-2.5 fill-[#0073bb] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M1.1 1.2 6 6.1l4.9-4.9 1.1 1.1L6 8.2.01 2.3z" />
        </svg>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Languages"
          className="absolute top-full right-0 mt-1 min-w-[148px] overflow-hidden rounded-md border border-[#d5dbdb] bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
        >
          {LANGUAGES.map((option) => {
            const selected = option === language;
            return (
              <li key={option} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`block w-full px-4 py-2 text-left text-[14px] text-[#161e2d] hover:bg-[#f2f3f3] focus-visible:bg-[#f2f3f3] focus-visible:outline-none ${
                    selected ? "bg-[#f2f3f3]" : "bg-white"
                  }`}
                  onClick={() => {
                    setLanguage(option);
                    setOpen(false);
                  }}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
