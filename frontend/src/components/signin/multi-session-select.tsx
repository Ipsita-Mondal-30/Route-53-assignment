"use client";

import { useEffect, useId, useRef, useState } from "react";

const OPTIONS = [
  { id: "enabled", label: "Multi-session enabled" },
  { id: "disabled", label: "Multi-session disabled" },
] as const;

type OptionId = (typeof OPTIONS)[number]["id"];

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.5 3.5H3.5A1 1 0 0 0 2.5 4.5v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M9.5 2.5h4v4M13.5 2.5 7 9"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MultiSessionSelect() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<OptionId>("disabled");
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const label =
    OPTIONS.find((option) => option.id === selected)?.label ??
    "Multi-session disabled";

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
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="aws-focus inline-flex items-center gap-1 text-[14px] font-semibold text-[#0073bb]"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
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
          aria-label="Multi-session options"
          className="absolute top-full right-0 z-40 mt-1 min-w-[220px] overflow-hidden rounded-md border border-[#d5dbdb] bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
        >
          {OPTIONS.map((option) => (
            <li key={option.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={selected === option.id}
                className={`block w-full px-4 py-2 text-left text-[14px] focus-visible:outline-none ${
                  selected === option.id
                    ? "cursor-default bg-[#f2f3f3] text-[#aab7b8]"
                    : "text-[#161e2d] hover:bg-[#f2f3f3] focus-visible:bg-[#f2f3f3]"
                }`}
                onClick={() => {
                  if (selected === option.id) {
                    setOpen(false);
                    return;
                  }
                  setSelected(option.id);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
          <li role="presentation">
            <a
              href="#"
              className="flex items-center gap-1 px-4 py-2 text-[14px] text-[#0073bb] hover:bg-[#f2f3f3]"
              onClick={() => setOpen(false)}
            >
              Learn More
              <ExternalIcon className="h-3 w-3" />
            </a>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
