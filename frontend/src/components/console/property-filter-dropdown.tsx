"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

type Option = { value: string; label: string };

export function PropertyFilterDropdown({
  label,
  value,
  onChange,
  options,
  searchable = true,
  widthClass = "w-[220px]",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  searchable?: boolean;
  widthClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return options;
    }
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query]);

  const selected = options.find((option) => option.value === value);
  const display =
    !value || value === "all" ? label : (selected?.label ?? label);

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open && searchable) {
      inputRef.current?.focus();
    }
    if (!open) {
      setQuery("");
    }
  }, [open, searchable]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex h-8 min-w-[104px] items-center justify-between gap-2 rounded border px-3 text-[14px] leading-5 ${
          open
            ? "border-[#42b4ff] bg-[#0f141a] text-white shadow-[0_0_0_1px_#42b4ff]"
            : "border-[#687078] bg-[#0f141a] text-[#d5dbdb] hover:border-[#7d8998]"
        }`}
      >
        <span className="max-w-[110px] truncate">{display}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#42b4ff]" strokeWidth={2.5} />
      </button>

      {open ? (
        <div
          className={`absolute top-[calc(100%+4px)] left-0 z-40 overflow-hidden rounded border border-[#687078] bg-[#161d27] shadow-[0_8px_24px_rgba(0,0,0,0.45)] ${widthClass}`}
        >
          {searchable ? (
            <div className="border-b border-[#2a313c] p-2">
              <label className="relative block">
                <span className="sr-only">Find {label}</span>
                <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#8d99a6]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Find filter"
                  className="h-8 w-full rounded border border-[#687078] bg-[#0f141a] pr-2 pl-8 text-[13px] text-white outline-none placeholder:text-[#8d99a6] focus:border-[#42b4ff]"
                />
              </label>
            </div>
          ) : null}
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            className="max-h-[280px] overflow-y-auto py-1"
          >
            <li role="option" aria-selected={value === "all"}>
              <button
                type="button"
                className={`flex w-full px-3 py-1.5 text-left text-[14px] ${
                  value === "all"
                    ? "bg-[#1a2838] text-white"
                    : "text-[#d5dbdb] hover:bg-[#1c2430]"
                }`}
                onClick={() => {
                  onChange("all");
                  setOpen(false);
                }}
              >
                {label}
              </button>
            </li>
            {filtered.map((option) => (
              <li key={option.value} role="option" aria-selected={value === option.value}>
                <button
                  type="button"
                  className={`flex w-full px-3 py-1.5 text-left text-[14px] ${
                    value === option.value
                      ? "bg-[#1a2838] text-white"
                      : "text-[#d5dbdb] hover:bg-[#1c2430]"
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-[13px] text-[#8d99a6]">No matches</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
