"use client";

import { useState } from "react";

import { ConsoleButton } from "@/components/console/console-button";
import {
  CaretDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  InfoCircleIcon,
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
    <div className="pb-2">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h1 className="text-[20px] leading-7 font-bold text-[#eaeded] sm:text-[24px] sm:leading-8">
            Route 53 Dashboard
          </h1>
          <a href="#" className="text-[14px] text-[#42b4ff]! hover:underline">
            Info
          </a>
        </div>
        <button
          type="button"
          aria-label="Info"
          className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center text-[#aab7b8] hover:text-[#eaeded]"
        >
          <InfoCircleIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Quick actions — 2x2 */}
        <section className="overflow-hidden rounded-2xl border border-[#414d5c] bg-[#161d27]">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {actions.map((action, index) => (
              <div
                key={action.title}
                className={`flex min-h-[168px] flex-col items-center px-6 py-6 text-center ${
                  index % 2 === 0 ? "md:border-r md:border-[#2a313c]" : ""
                } ${index < 2 ? "border-b border-[#2a313c]" : ""}`}
              >
                <h2 className="text-[16px] leading-6 font-bold text-[#eaeded]">
                  {action.title}
                </h2>
                <p className="mt-2 max-w-[420px] flex-1 text-[14px] leading-[22px] text-[#d1d5db]">
                  {action.body}
                </p>
                <div className="mt-4">
                  <ConsoleButton href={action.href}>{action.label}</ConsoleButton>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Register domain */}
        <section className="rounded-2xl border border-[#414d5c] bg-[#161d27] p-5 sm:p-6">
          <h2 className="text-[16px] leading-6 font-bold text-[#eaeded]">
            Register domain
          </h2>
          <p className="mt-2 text-[14px] leading-[22px] text-[#d1d5db]">
            Find and register an available domain, or{" "}
            <a href="#" className="text-[#42b4ff]! hover:underline">
              transfer your existing domains
            </a>{" "}
            to Route 53.
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
              className="console-input h-10 text-[14px] placeholder:italic"
            />
          </label>
          <p className="mt-2 text-[12px] leading-[18px] text-[#8d99a6]">{DOMAIN_HELP}</p>
          <div className="mt-4">
            <ConsoleButton onClick={checkDomain} variant="primary">
              Check
            </ConsoleButton>
          </div>
          {checkMessage ? (
            <p className="mt-3 text-[14px] text-[#d1d5db]" role="status">
              {checkMessage}
            </p>
          ) : null}
        </section>

        {/* Notifications */}
        <section className="rounded-2xl border border-[#414d5c] bg-[#161d27] p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-[16px] leading-6 font-bold text-[#eaeded]">
              Notifications
            </h2>
            <button
              type="button"
              aria-label="Refresh notifications"
              className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#42b4ff] text-[#42b4ff] hover:bg-[rgba(66,180,255,0.12)]"
            >
              <RefreshIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block min-w-0 flex-1">
              <span className="sr-only">Find notifications</span>
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#8d99a6]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find notifications"
                className="console-input pl-8 placeholder:italic"
              />
            </label>
            <div className="flex shrink-0 items-center gap-0.5 self-end text-[13px] text-[#aab7b8] sm:self-auto">
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center text-[#5f6b7a]"
                disabled
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-5 text-center text-[#eaeded]">1</span>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center text-[#5f6b7a]"
                disabled
                aria-label="Next page"
              >
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden border border-[#414d5c]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[14px] leading-5">
                <thead>
                  <tr>
                    <th className="relative border-t border-b border-[#414d5c] bg-[#1a232f] px-3 py-2 text-left font-bold text-[#eaeded]">
                      Resource
                    </th>
                    <th className="relative border-t border-b border-[#414d5c] bg-[#1a232f] px-3 py-2 text-left font-bold text-[#eaeded] before:absolute before:top-1.5 before:bottom-1.5 before:left-0 before:w-px before:bg-[#545b64]">
                      Status
                    </th>
                    <th className="relative border-t border-b border-[#414d5c] bg-[#1a232f] px-3 py-2 text-left font-bold text-[#eaeded] before:absolute before:top-1.5 before:bottom-1.5 before:left-0 before:w-px before:bg-[#545b64]">
                      <span className="inline-flex w-full items-center justify-between gap-2">
                        Last update
                        <CaretDownIcon className="h-2 w-2 text-[#aab7b8]" />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleNotifications.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-16 text-center text-[14px] text-[#aab7b8]"
                      >
                        No notifications to display
                      </td>
                    </tr>
                  ) : (
                    visibleNotifications.map((item) => (
                      <tr key={item.id} className="border-b border-[#2a313c]">
                        <td className="px-3 py-2 text-[#d1d5db]">{item.resource}</td>
                        <td className="px-3 py-2 text-[#d1d5db]">{item.status}</td>
                        <td className="px-3 py-2 text-[#d1d5db]">{item.lastUpdate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* More resources */}
        <section className="overflow-hidden rounded-2xl border border-[#414d5c] bg-[#161d27]">
          <div className="flex items-center gap-1.5 px-5 pt-4 pb-3 sm:px-6">
            <h2 className="text-[16px] leading-6 font-bold text-[#eaeded]">
              More resources
            </h2>
            <ExternalLinkIcon className="h-3.5 w-3.5 text-[#eaeded]" />
          </div>
          <ul>
            {moreResources.map((label) => (
              <li key={label}>
                <a
                  href="#"
                  className="flex items-center border-t border-[#2a313c] px-5 py-2.5 text-[14px] text-[#42b4ff]! hover:bg-[#1c2430] hover:no-underline sm:px-6"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Service health */}
        <section className="rounded-2xl border border-[#414d5c] bg-[#161d27] p-5 sm:p-6">
          <h2 className="text-[16px] leading-6 font-bold text-[#eaeded]">
            Service health
          </h2>
          <p className="mt-2 text-[14px] leading-[22px] text-[#d1d5db]">
            To view the current status of Route 53, see the{" "}
            <a href="#" className="inline-flex items-center gap-1 text-[#42b4ff]! hover:underline">
              AWS Service Health Dashboard
              <ExternalLinkIcon className="h-3.5 w-3.5" />
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
