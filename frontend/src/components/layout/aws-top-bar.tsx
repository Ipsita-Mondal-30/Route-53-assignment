"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { ChevronDownIcon, GlobeIcon, UserCircleIcon } from "@/components/ui/icons";

const links = [
  { label: "Contact us", href: "#" },
  { label: "AWS Marketplace", href: "#" },
  { label: "Support", href: "#", hasMenu: true },
  { label: "My account", href: "#", hasMenu: true },
] as const;

export function AwsTopBar() {
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
    <div className="bg-aws-navy text-white">
      <div className="mx-auto flex h-[58px] max-w-[1600px] items-center justify-end gap-5 px-5 text-[13px] md:gap-6 md:px-8">
        <a
          href="#"
          className="aws-focus inline-flex items-center gap-1.5 whitespace-nowrap hover:underline"
        >
          <GlobeIcon className="h-4 w-4" />
          English
          <ChevronDownIcon className="h-2.5 w-2.5" />
        </a>
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="aws-focus hidden items-center gap-1 whitespace-nowrap hover:underline sm:inline-flex"
          >
            {link.label}
            {"hasMenu" in link && link.hasMenu ? (
              <ChevronDownIcon className="h-2.5 w-2.5" />
            ) : null}
          </a>
        ))}

        <div ref={containerRef} className="relative">
          <button
            type="button"
            aria-label="AWS Profile"
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
            className="aws-focus aws-glow rounded-full p-0.5 text-white"
          >
            <UserCircleIcon className="h-6 w-6" />
          </button>

          {open ? (
            <div
              id={menuId}
              role="dialog"
              aria-label="AWS Profile"
              className="absolute top-[calc(100%+10px)] right-0 z-[60] w-[300px] rounded-2xl bg-white p-5 text-aws-ink shadow-[0_8px_28px_rgba(15,20,26,0.18)]"
            >
              <h2 className="text-[18px] font-bold text-aws-ink">AWS Profile</h2>
              <p className="mt-2 text-[14px] leading-6 text-aws-muted">
                Your profile helps improve your interactions with select AWS
                experiences.
              </p>
              <Link
                href="/login"
                className="aws-btn-primary aws-focus mt-5 inline-flex h-11 w-full text-[14px]"
                onClick={() => setOpen(false)}
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
