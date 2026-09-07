"use client";

import { useEffect, useId, useRef, useState } from "react";

import { ChevronDownIcon } from "@/components/ui/icons";

const featureLinks = [
  { label: "Features overview", href: "#features" },
  { label: "DNS", href: "#how-it-works" },
  { label: "Traffic flow", href: "#use-cases" },
  { label: "Resolver", href: "#how-it-works" },
  { label: "Health checks", href: "#how-it-works" },
  { label: "Domain registration", href: "#benefits" },
] as const;

type NavItem = {
  label: string;
  href: string;
  active?: boolean;
  hasMenu?: boolean;
};

const navItems: NavItem[] = [
  { label: "Overview", href: "#overview", active: true },
  { label: "Features", href: "#features", hasMenu: true },
  { label: "Pricing", href: "#get-started" },
  { label: "Resources", href: "#get-started" },
  { label: "FAQs", href: "#feedback" },
];

export function Route53Navbar() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="sticky top-[130px] z-40 mx-auto w-[calc(100%-1.5rem)] max-w-[1450px] sm:top-[142px] md:w-[calc(100%-4rem)]">
      <div
        ref={containerRef}
        className="relative rounded-xl border border-[#d9dce3] bg-white shadow-[0_6px_24px_rgba(15,20,26,0.12)]"
      >
        <div className="flex flex-col gap-1 px-5 py-3 md:flex-row md:items-center md:justify-between md:px-8 md:py-0 md:h-[64px]">
          <a
            href="#overview"
            className="aws-focus text-[16px] font-bold text-aws-ink"
          >
            Amazon Route 53
          </a>
          <nav
            aria-label="Amazon Route 53"
            className="flex items-center gap-5 overflow-x-auto pb-1 text-[15px] md:gap-8 md:overflow-visible md:pb-0"
          >
            {navItems.map((item) =>
              item.hasMenu ? (
                <div key={item.label} className="relative shrink-0">
                  <button
                    type="button"
                    className="aws-focus inline-flex items-center gap-1 py-3 font-medium text-aws-muted hover:text-aws-ink"
                    aria-expanded={open}
                    aria-haspopup="menu"
                    aria-controls={menuId}
                    onClick={() => setOpen((value) => !value)}
                  >
                    {item.label}
                    <ChevronDownIcon className="h-3 w-3" />
                  </button>
                  {open ? (
                    <ul
                      id={menuId}
                      role="menu"
                      className="absolute left-0 top-full z-50 min-w-[220px] rounded-lg border border-[#e5e7eb] bg-white py-2 shadow-[0_8px_24px_rgba(15,20,26,0.12)]"
                    >
                      {featureLinks.map((link) => (
                        <li key={link.label} role="none">
                          <a
                            role="menuitem"
                            href={link.href}
                            className="aws-focus block px-4 py-2 text-[14px] text-aws-ink hover:bg-[#f2f3f3]"
                            onClick={() => setOpen(false)}
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={`aws-focus shrink-0 py-3 font-medium ${
                    item.active
                      ? "border-b-[3px] border-aws-ink text-aws-ink"
                      : "text-aws-muted hover:text-aws-ink"
                  }`}
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
