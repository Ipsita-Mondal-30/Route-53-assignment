"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export type ConsoleMenuItem = {
  id: string;
  label: string;
  onSelect: () => void;
  disabled?: boolean;
};

export type ConsoleMenuSection = {
  id: string;
  label: string;
  items: ConsoleMenuItem[];
};

export function ConsoleActionsMenu({
  label = "Actions",
  sections,
  disabled = false,
  variant = "normal",
}: {
  label?: string;
  sections: ConsoleMenuSection[];
  disabled?: boolean;
  variant?: "normal" | "secondary";
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setExpanded(null);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setExpanded(null);
      }
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const buttonClass =
    variant === "secondary"
      ? "console-btn console-btn-secondary !font-bold"
      : "console-btn console-btn-normal !min-h-8 !rounded-full !px-4";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={buttonClass}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          setOpen((current) => {
            const next = !current;
            setExpanded(next ? (sections[0]?.id ?? null) : null);
            return next;
          });
        }}
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-[calc(100%+4px)] right-0 z-50 min-w-[220px] overflow-hidden rounded border border-[#687078] bg-[#161d27] py-1 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        >
          {sections.map((section) => (
            <div key={section.id}>
              <button
                type="button"
                role="menuitem"
                aria-expanded={expanded === section.id}
                className="flex w-full items-center justify-between gap-4 px-3 py-1.5 text-left text-[14px] text-[#d5dbdb] hover:bg-[#1c2430] hover:text-white"
                onClick={() =>
                  setExpanded((current) =>
                    current === section.id ? null : section.id,
                  )
                }
              >
                {section.label}
                <ChevronRight className="h-3.5 w-3.5 text-[#8d99a6]" strokeWidth={2.5} />
              </button>
              {expanded === section.id
                ? section.items.map((item) => (
                    <MenuRow
                      key={item.id}
                      disabled={item.disabled}
                      onSelect={() => {
                        if (item.disabled) {
                          return;
                        }
                        setOpen(false);
                        setExpanded(null);
                        item.onSelect();
                      }}
                    >
                      {item.label}
                    </MenuRow>
                  ))
                : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MenuRow({
  children,
  disabled,
  onSelect,
}: {
  children: ReactNode;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className="flex w-full px-6 py-1.5 text-left text-[14px] text-[#d5dbdb] hover:bg-[#1c2430] hover:text-white disabled:cursor-not-allowed disabled:text-[#687078] disabled:hover:bg-transparent"
      onClick={onSelect}
    >
      {children}
    </button>
  );
}
