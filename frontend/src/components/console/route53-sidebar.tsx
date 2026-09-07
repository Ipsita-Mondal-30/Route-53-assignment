"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  CloseIcon,
} from "@/components/console/console-icons";

type NavLink = {
  label: string;
  href: string;
  badge?: string;
};

type NavSection = {
  id: string;
  label: string;
  items: NavLink[];
};

const topLinks: NavLink[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Hosted zones", href: "/hosted-zones" },
  { label: "Health checks", href: "/health-checks" },
  { label: "Profiles", href: "/profiles" },
];

const sections: NavSection[] = [
  {
    id: "global-resolver",
    label: "Global Resolver",
    items: [
      { label: "Global resolvers", href: "/resolver/global", badge: "New" },
      { label: "Shared DNS views", href: "/resolver/shared-dns-views", badge: "New" },
    ],
  },
  {
    id: "vpc-resolver",
    label: "VPC Resolver",
    items: [
      { label: "VPCs", href: "/resolver/vpcs" },
      { label: "Inbound endpoints", href: "/resolver/inbound-endpoints" },
      { label: "Outbound endpoints", href: "/resolver/outbound-endpoints" },
      { label: "Rules", href: "/resolver/rules" },
      { label: "Query logging", href: "/resolver/query-logging" },
      { label: "Outposts", href: "/resolver/outposts" },
    ],
  },
  {
    id: "domains",
    label: "Domains",
    items: [
      { label: "Registered domains", href: "/domains/registered" },
      { label: "Requests", href: "/domains/requests" },
    ],
  },
  {
    id: "ip-routing",
    label: "IP-based routing",
    items: [{ label: "CIDR collections", href: "/routing/cidr-collections" }],
  },
  {
    id: "traffic-flow",
    label: "Traffic flow",
    items: [
      { label: "Traffic policies", href: "/traffic-policies" },
      { label: "Policy records", href: "/traffic-flow/policy-records" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Route53Sidebar({
  open,
  collapsed,
  onCollapse,
  onCloseMobile,
}: {
  open: boolean;
  collapsed: boolean;
  onCollapse: () => void;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "global-resolver": true,
    "vpc-resolver": true,
    domains: true,
    "ip-routing": true,
    "traffic-flow": true,
  });

  const navProps = {
    pathname,
    expanded,
    onToggleSection: (id: string) =>
      setExpanded((current) => ({ ...current, [id]: !(current[id] ?? true) })),
    onCollapse,
    onCloseMobile,
  };

  return (
    <>
      {open ? (
        <div className="fixed inset-x-0 top-[calc(var(--nav-h)+var(--crumb-h))] bottom-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-black/50"
            onClick={onCloseMobile}
          />
          <aside
            className="relative flex h-full w-[min(var(--sidebar-w),85vw)] flex-col border-r border-[var(--c-border-subtle)] bg-[var(--c-bg)] shadow-2xl"
            aria-label="Route 53"
          >
            <SidebarNav {...navProps} />
          </aside>
        </div>
      ) : null}
      {collapsed ? null : (
        <aside
          className="hidden h-full w-[var(--sidebar-w)] shrink-0 flex-col border-r border-[var(--c-border-subtle)] bg-[var(--c-bg)] lg:flex"
          aria-label="Route 53"
        >
          <SidebarNav {...navProps} />
        </aside>
      )}
    </>
  );
}

function SidebarNav({
  pathname,
  expanded,
  onToggleSection,
  onCollapse,
  onCloseMobile,
}: {
  pathname: string;
  expanded: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  onCollapse: () => void;
  onCloseMobile: () => void;
}) {
  return (
    <>
      <div className="flex h-10 items-center justify-between px-3">
        <span className="text-[14px] font-bold text-[var(--c-text-heading)]">
          Route 53
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Close navigation"
            className="inline-flex h-7 w-7 items-center justify-center text-[#c5cdd6] lg:hidden"
            onClick={onCloseMobile}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Collapse navigation"
            className="hidden h-7 w-7 items-center justify-center text-[#c5cdd6] hover:text-white lg:inline-flex"
            onClick={onCollapse}
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto pb-6 text-[14px]">
        <ul className="px-1">
          {topLinks.map((link) => (
            <li key={link.href}>
              <SidebarLink
                href={link.href}
                active={isActive(pathname, link.href)}
                onNavigate={onCloseMobile}
              >
                {link.label}
              </SidebarLink>
            </li>
          ))}
        </ul>
        {sections.map((section) => {
          const openSection = expanded[section.id] ?? true;
          return (
            <div key={section.id} className="mt-1">
              <button
                type="button"
                className="flex w-full items-center gap-1 px-3 py-1.5 text-left text-[13px] text-[#c5cdd6] hover:bg-[var(--c-bg-hover)]"
                aria-expanded={openSection}
                onClick={() => onToggleSection(section.id)}
              >
                <ChevronDownIcon
                  className={`h-3 w-3 shrink-0 transition-transform ${openSection ? "" : "-rotate-90"}`}
                />
                {section.label}
              </button>
              {openSection ? (
                <ul className="pb-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <SidebarLink
                        href={item.href}
                        active={isActive(pathname, item.href)}
                        badge={item.badge}
                        onNavigate={onCloseMobile}
                      >
                        {item.label}
                      </SidebarLink>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </nav>
    </>
  );
}

function SidebarLink({
  href,
  active,
  badge,
  children,
  onNavigate,
}: {
  href: string;
  active: boolean;
  badge?: string;
  children: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center justify-between gap-2 px-3 py-[5px] hover:no-underline ${
        active
          ? "font-normal text-[#42b4ff]! hover:text-[#42b4ff]!"
          : "text-[#d1d5db]! hover:bg-[var(--c-bg-hover)] hover:text-[#eaeded]!"
      }`}
    >
      <span className="truncate">{children}</span>
      {badge ? (
        <span className="text-[12px] text-[#42b4ff] underline decoration-[#42b4ff] underline-offset-2">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
