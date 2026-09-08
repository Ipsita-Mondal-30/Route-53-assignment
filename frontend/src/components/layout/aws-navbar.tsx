"use client";

import Link from "next/link";
import { useState } from "react";
import { FaAws } from "react-icons/fa";

import { CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";

const navLinks = [
  { label: "Discover AWS", href: "#" },
  { label: "Products", href: "#" },
  { label: "Solutions", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Resources", href: "#" },
] as const;

export function AwsNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#e5e7eb] bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between gap-4 px-5 md:px-8">
        <div className="flex min-w-0 items-center gap-5 lg:gap-7">
          <Link href="/" className="aws-focus shrink-0 text-aws-ink" aria-label="AWS home">
            <FaAws className="h-7 w-7" aria-hidden="true" />
          </Link>
          <a
            href="#"
            className="aws-focus hidden text-[15px] font-medium text-aws-ink hover:underline md:inline"
          >
            re:Invent
          </a>
          <span className="hidden h-6 w-px bg-[#d5dbdb] md:block" aria-hidden="true" />
          <nav className="hidden items-center gap-6 lg:flex xl:gap-7" aria-label="AWS">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="aws-focus text-[15px] font-medium whitespace-nowrap text-aws-ink hover:underline"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <a
            href="#"
            className="aws-focus hidden items-center gap-2 text-[15px] font-medium text-aws-ink hover:underline md:inline-flex"
          >
            <SearchIcon className="h-5 w-5" />
            Search
          </a>
          <Link
            href="/signin"
            className="aws-focus hidden text-[15px] font-medium whitespace-nowrap text-aws-ink hover:underline lg:inline"
          >
            Sign in to the Console
          </Link>
          <Link
            href="/signup"
            className="aws-btn-primary aws-focus h-10 px-4 text-[13px] sm:h-11 sm:px-5 sm:text-[14px]"
          >
            Create an AWS Account
          </Link>
          <button
            type="button"
            className="aws-focus -mr-1 p-1 text-aws-ink lg:hidden"
            aria-expanded={open}
            aria-controls="aws-mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <CloseIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="aws-mobile-nav"
          aria-label="AWS mobile"
          className="border-t border-[#e5e7eb] bg-white px-5 py-4 lg:hidden"
        >
          <div className="flex flex-col gap-3">
            <a href="#" className="aws-focus py-1 text-[15px] font-medium text-aws-ink">
              re:Invent
            </a>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="aws-focus py-1 text-[15px] font-medium text-aws-ink"
              >
                {link.label}
              </a>
            ))}
            <a href="#" className="aws-focus py-1 text-[15px] font-medium text-aws-ink">
              Search
            </a>
            <Link href="/signin" className="aws-focus py-1 text-[15px] font-medium text-aws-ink">
              Sign in to the Console
            </Link>
            <Link href="/signup" className="aws-focus py-1 text-[15px] font-medium text-aws-ink">
              Create an AWS Account
            </Link>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
