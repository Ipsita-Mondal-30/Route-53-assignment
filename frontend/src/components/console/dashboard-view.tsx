"use client";

import { useState } from "react";

import { ConsoleButton } from "@/components/console/console-button";
import { ConsoleCard, ConsoleCardTitle } from "@/components/console/console-card";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  RefreshIcon,
  SearchIcon,
} from "@/components/console/console-icons";
import { useRoute53Store } from "@/lib/mock/store";

const actions = [
  {
    title: "DNS management",
    body: "A hosted zone tells Route 53 how to respond to DNS queries for a domain such as example.com.",
    href: "/hosted-zones/new",
    label: "Create hosted zone",
  },
  {
    title: "Availability monitoring",
    body: "Health checks monitor your applications and web resources, and direct DNS queries to healthy resources.",
    href: "/health-checks",
    label: "Create health check",
  },
  {
    title: "Traffic management",
    body: "A visual tool that lets you easily create policies for multiple endpoints in complex configurations.",
    href: "/traffic-policies",
    label: "Create policy",
  },
  {
    title: "Domain registration",
    body: "A domain is the name, such as example.com, that your users use to access your application.",
    href: "/domains/registered",
    label: "Register domain",
  },
] as const;

const moreResources = [
  "Documentation",
  "API reference",
  "FAQs",
  "Forum - DNS and health checks",
  "Forum - Domain name registration",
  "Request a limit increase",
];

const DOMAIN_HELP =
  "Each label (each part between dots) can be up to 63 characters long and must start with a-z or 0-9. Maximum length: 255 characters, including dots. Valid characters: a-z, 0-9, and - (hyphen)";

function isLikelyDomain(value: string) {
  return /^(?=.{1,255}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(
    value.trim(),
  );
}

export function DashboardView() {
  const { notifications } = useRoute53Store();
  const [domain, setDomain] = useState("");
  const [checkMessage, setCheckMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  function checkDomain() {
    const value = domain.trim();
    if (!value) {
      setCheckMessage("Enter a domain name.");
      return;
    }
    if (!isLikelyDomain(value)) {
      setCheckMessage(
        "The domain name is invalid. Use letters, numbers, dots, and hyphens only.",
      );
      return;
    }
    const taken = /example\.com|amazon\.com|aws\.amazon/i.test(value);
    setCheckMessage(
      taken
        ? `${value} is not available in this demo.`
        : `${value} appears to be available. Domain registration is simulated.`,
    );
  }

  const visibleNotifications = notifications.filter((item) =>
    item.resource.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-4 flex flex-wrap items-baseline gap-2">
        <h1 className="text-[20px] leading-7 font-bold text-[var(--c-text-heading)] sm:text-[24px] sm:leading-8">
          Route 53 Dashboard
        </h1>
        <a href="#" className="text-[14px]">
          Info
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-w-0 flex-col gap-4">
          <ConsoleCard padding={false}>
            <div className="grid grid-cols-1 md:grid-cols-2">
              {actions.map((action, index) => (
                <div
                  key={action.title}
                  className={`flex min-h-[148px] flex-col p-4 sm:p-5 ${
                    index % 2 === 0 ? "md:border-r md:border-[var(--c-border-subtle)]" : ""
                  } ${index < actions.length - 1 ? "border-b border-[var(--c-border-subtle)]" : ""} ${
                    index >= 2 ? "md:border-b-0" : ""
                  }`}
                >
                  <h2 className="text-[16px] font-bold text-[var(--c-text-heading)]">
                    {action.title}
                  </h2>
                  <p className="mt-2 flex-1 text-[14px] leading-5 text-[var(--c-text)]">
                    {action.body}
                  </p>
                  <div className="mt-4">
                    <ConsoleButton href={action.href}>{action.label}</ConsoleButton>
                  </div>
                </div>
              ))}
            </div>
          </ConsoleCard>

          <ConsoleCard>
            <ConsoleCardTitle>Register domain</ConsoleCardTitle>
            <p className="mt-2 text-[14px] leading-5">
              Find and register an available domain, or transfer your existing domains to
              Route 53.
            </p>
            <label className="mt-4 block">
              <span className="sr-only">Domain name</span>
              <input
                value={domain}
                onChange={(event) => {
                  setDomain(event.target.value);
                  setCheckMessage(null);
                }}
                placeholder="Enter a domain name"
                className="console-input h-10 text-[16px]"
              />
            </label>
            <p className="mt-2 text-[12px] leading-4 text-[var(--c-text-muted)]">
              {DOMAIN_HELP}
            </p>
            <div className="mt-4">
              <ConsoleButton onClick={checkDomain}>Check</ConsoleButton>
            </div>
            {checkMessage ? (
              <p className="mt-3 text-[14px] text-[var(--c-text)]" role="status">
                {checkMessage}
              </p>
            ) : null}
          </ConsoleCard>

          <ConsoleCard>
            <div className="mb-3 flex items-center gap-2">
              <ConsoleCardTitle>Notifications</ConsoleCardTitle>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Refresh notifications"
                  className="inline-flex h-7 w-7 items-center justify-center text-[#42b4ff] hover:text-[#7ec5f5]"
                >
                  <RefreshIcon className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1 text-[13px] text-[#c5cdd6]">
                  <button type="button" className="p-1 text-[#5f6b7a]" disabled aria-label="Previous page">
                    <ChevronLeftIcon className="h-3 w-3" />
                  </button>
                  <span>1</span>
                  <button type="button" className="p-1 text-[#5f6b7a]" disabled aria-label="Next page">
                    <ChevronRightIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
            <label className="relative mb-3 block max-w-md">
              <span className="sr-only">Find notifications</span>
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#8d99a6]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find notifications"
                className="console-input pl-8"
              />
            </label>
            <div className="console-table-wrap rounded-md border border-[var(--c-border-subtle)]">
              <table className="console-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Status</th>
                    <th>Last update</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleNotifications.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-10 text-center text-[14px] text-[#8d99a6]">
                        No notifications to display
                      </td>
                    </tr>
                  ) : (
                    visibleNotifications.map((item) => (
                      <tr key={item.id}>
                        <td>{item.resource}</td>
                        <td>{item.status}</td>
                        <td>{item.lastUpdate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ConsoleCard>
        </div>

        <div className="flex flex-col gap-4">
          <ConsoleCard padding={false}>
            <div className="flex items-center gap-1.5 px-4 pt-4 pb-2">
              <ConsoleCardTitle>More resources</ConsoleCardTitle>
              <ExternalLinkIcon className="h-3.5 w-3.5 text-[#42b4ff]" />
            </div>
            <ul>
              {moreResources.map((label, index) => (
                <li
                  key={label}
                  className={index === 0 ? "border-t border-[var(--c-border-subtle)]" : ""}
                >
                  <a
                    href="#"
                    className="flex items-center border-b border-[var(--c-border-subtle)] px-4 py-2.5 text-[14px] hover:bg-[var(--c-bg-hover)] hover:no-underline"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </ConsoleCard>

          <ConsoleCard>
            <ConsoleCardTitle>Service health</ConsoleCardTitle>
            <p className="mt-2 text-[14px] leading-5">
              To view the current status of Route 53, see the{" "}
              <a href="#" className="inline-flex items-center gap-1">
                AWS Service Health Dashboard
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </a>
              .
            </p>
          </ConsoleCard>
        </div>
      </div>
    </div>
  );
}
