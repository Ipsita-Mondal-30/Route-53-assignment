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
    <div className="sticky top-[130px] z-40 mx-auto w-full max-w-[1600px] px-5 sm:top-[142px] md:px-8">
      <div
        ref={containerRef}
        className="relative rounded-[16px] bg-white shadow-[0_2px_10px_rgba(15,26,38,0.08)]"
      >
        <div className="flex flex-col px-5 py-2.5 md:h-[56px] md:flex-row md:items-center md:gap-8 md:px-7 md:py-0 lg:gap-10">
          <a
            href="#overview"
            className="aws-focus shrink-0 text-[16px] leading-6 font-bold tracking-[-0.01em] text-[#16191f]"
          >
            Amazon Route 53
          </a>
          <nav
            aria-label="Amazon Route 53"
            className="flex items-center gap-6 overflow-x-auto text-[14px] leading-5 font-normal tracking-[-0.01em] text-[#16191f] md:gap-7 md:overflow-visible"
          >
            {navItems.map((item) =>
              item.hasMenu ? (
                <div key={item.label} className="relative shrink-0">
                  <button
                    type="button"
                    className="aws-focus inline-flex items-center gap-1 py-2.5 font-normal text-[#16191f] md:h-[56px] md:py-0"
                    aria-expanded={open}
                    aria-haspopup="menu"
                    aria-controls={menuId}
                    onClick={() => setOpen((value) => !value)}
                  >
                    {item.label}
                    <ChevronDownIcon className="h-2.5 w-2.5" />
                  </button>
                  {open ? (
                    <ul
                      id={menuId}
                      role="menu"
                      className="absolute top-full left-0 z-50 min-w-[220px] rounded-lg border border-[#e5e7eb] bg-white py-2 text-[14px] shadow-[0_8px_24px_rgba(15,20,26,0.12)]"
                    >
                      {featureLinks.map((link) => (
                        <li key={link.label} role="none">
                          <a
                            role="menuitem"
                            href={link.href}
                            className="aws-focus block px-4 py-2 text-[#16191f] hover:bg-[#f2f3f3]"
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
                  className="aws-focus inline-flex shrink-0 items-center py-2.5 font-normal text-[#16191f] md:h-[56px] md:py-0"
                >
                  <span
                    className={
                      item.active
                        ? "border-b-[3px] border-[#16191f] pb-[3px]"
                        : "pb-[6px]"
                    }
                  >
                    {item.label}
                  </span>
                </a>
              ),
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
