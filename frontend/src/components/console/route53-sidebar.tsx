"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  CaretDownIcon,
  CaretRightIcon,
  ChevronLeftIcon,
  CloseIcon,
  ExternalLinkIcon,
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

const externalLinks = [
  { label: "DNS Firewall", href: "#" },
  { label: "Application Recovery Controller", href: "#" },
] as const;

const sidebarFont =
  'var(--font-inter), "Amazon Ember", "Helvetica Neue", Helvetica, Arial, sans-serif';

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
            className="console-nav-sidebar relative flex h-full min-h-0 w-[min(var(--sidebar-w),88vw)] flex-col border-r border-[color:var(--c-border-subtle)] bg-[var(--c-bg-card)] shadow-2xl"
            aria-label="Route 53"
          >
            <SidebarNav {...navProps} />
          </aside>
        </div>
      ) : null}
      {collapsed ? null : (
        <aside
          className="console-nav-sidebar hidden h-full min-h-0 w-[var(--sidebar-w)] shrink-0 flex-col border-r border-[color:var(--c-border-subtle)] bg-[var(--c-bg-card)] lg:flex"
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
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between px-4">
        <span
          className="text-[18px] leading-6 font-bold text-[var(--c-text-heading)]"
          style={{ fontFamily: sidebarFont }}
        >
          Route 53
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Close navigation"
            className="inline-flex h-8 w-8 items-center justify-center text-[var(--c-text-muted)] lg:hidden"
            onClick={onCloseMobile}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Collapse navigation"
            className="hidden h-8 w-8 items-center justify-center text-[var(--c-text-muted)] hover:text-[var(--c-text-heading)] lg:inline-flex"
            onClick={onCollapse}
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <nav
        className="sidebar-scroll min-h-0 flex-1 pb-5"
        style={{ fontFamily: sidebarFont }}
      >
        <ul>
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
            <div key={section.id} className="mt-2">
              <button
                type="button"
                className="flex w-full items-center gap-1.5 px-4 py-1.5 text-left text-[16px] leading-6 font-bold text-[var(--c-text-heading)] hover:bg-[var(--c-bg-hover)]"
                aria-expanded={openSection}
                onClick={() => onToggleSection(section.id)}
              >
                {openSection ? (
                  <CaretDownIcon className="h-2 w-2 shrink-0 text-[var(--c-text-heading)]" />
                ) : (
                  <CaretRightIcon className="h-2 w-2 shrink-0 text-[var(--c-text-heading)]" />
                )}
                <span>{section.label}</span>
              </button>
              {openSection ? (
                <ul>
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <SidebarLink
                        href={item.href}
                        active={isActive(pathname, item.href)}
                        badge={item.badge}
                        indented
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

        <div className="mx-3 mt-3 border-t border-[color:var(--c-border-subtle)] pt-2">
          {externalLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-1.5 px-1 py-[5px] text-[14px] leading-5 font-normal text-[var(--c-text)]! hover:bg-[var(--c-bg-hover)] hover:text-[var(--c-text-heading)]! hover:no-underline"
            >
              <span>{link.label}</span>
              <ExternalLinkIcon className="h-3 w-3 shrink-0 text-[var(--c-text-muted)]" />
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}

function SidebarLink({
  href,
  active,
  badge,
  indented,
  children,
  onNavigate,
}: {
  href: string;
  active: boolean;
  badge?: string;
  indented?: boolean;
  children: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`relative flex items-center justify-between gap-2 py-[5px] text-[14px] leading-5 font-normal hover:no-underline ${
        indented ? "pr-4 pl-8" : "px-4"
      } ${
        active
          ? "text-[var(--c-link)]! hover:text-[var(--c-link)]!"
          : "text-[var(--c-text)]! hover:bg-[var(--c-bg-hover)] hover:text-[var(--c-text-heading)]!"
      }`}
    >
      <span className="truncate">{children}</span>
      {badge ? (
        <span className="shrink-0 text-[12px] font-normal text-[var(--c-link)] underline decoration-dotted decoration-[var(--c-link)] underline-offset-[3px]">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
