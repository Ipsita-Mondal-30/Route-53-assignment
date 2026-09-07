"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink, RotateCw, Search } from "lucide-react";

import { ConsoleButton } from "@/components/console/console-button";
import {
  HostedZoneInfoPanel,
  InfoLink,
  type InfoTopic,
} from "@/components/route53/HostedZoneInfoPanel";
import { useRoute53Store } from "@/lib/mock/store";

const MORE_RESOURCES = [
  { label: "Documentation", href: "https://docs.aws.amazon.com/route53/" },
  {
    label: "API reference",
    href: "https://docs.aws.amazon.com/Route53/latest/APIReference/",
  },
  { label: "FAQs", href: "https://aws.amazon.com/route53/faqs/" },
  {
    label: "Forum - DNS and health checks",
    href: "https://repost.aws/tags/TAIF-cFYj-SPaad3rYdX3rQg/amazon-route-53",
  },
  {
    label: "Forum - Domain name registration",
    href: "https://repost.aws/tags/TAIF-cFYj-SPaad3rYdX3rQg/amazon-route-53",
  },
  {
    label: "Request a limit increase",
    href: "https://console.aws.amazon.com/servicequotas/home",
  },
] as const;

export function DashboardView() {
  const { zones, notifications } = useRoute53Store();
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpTopic, setHelpTopic] = useState<InfoTopic>("create");
  const [domainQuery, setDomainQuery] = useState("");
  const [noticeQuery, setNoticeQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const zoneCount = zones.length;

  const filteredNotifications = useMemo(() => {
    void refreshKey;
    const q = noticeQuery.trim().toLowerCase();
    if (!q) {
      return notifications;
    }
    return notifications.filter(
      (item) =>
        item.resource.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q),
    );
  }, [noticeQuery, notifications, refreshKey]);

  return (
    <div className="flex min-h-full gap-0">
      <div className="min-w-0 flex-1 space-y-5 pb-2">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h1 className="text-[24px] leading-8 font-bold text-white">
            Route 53 Dashboard
          </h1>
          <InfoLink
            onClick={() => {
              setHelpTopic("create");
              setHelpOpen(true);
            }}
          />
        </div>

        <section className="overflow-hidden rounded-lg border border-[#414d5c]">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex min-h-[200px] flex-col items-center justify-center border-b border-[#2a313c] px-8 py-8 text-center md:border-r">
              <h2 className="text-[16px] leading-6 font-bold text-white">
                DNS management
              </h2>
              <Link
                href="/hosted-zones"
                className="mt-5 inline-flex flex-col items-center hover:no-underline"
              >
                <span className="text-[36px] leading-10 font-bold text-[#42b4ff]">
                  {zoneCount}
                </span>
                <span className="mt-1 block h-px w-full min-w-[28px] bg-[#42b4ff]" />
              </Link>
              <p className="mt-2 text-[14px] leading-5 text-[#aab7b8]">
                {zoneCount === 1 ? "Hosted zone" : "Hosted zones"}
              </p>
            </div>

            <div className="flex min-h-[200px] flex-col items-center justify-center border-b border-[#2a313c] px-8 py-8 text-center">
              <h2 className="text-[16px] leading-6 font-bold text-white">
                Availability monitoring
              </h2>
              <p className="mt-3 max-w-[380px] flex-1 text-[14px] leading-[22px] text-[#aab7b8]">
                Health checks monitor your applications and web resources, and
                direct DNS queries to healthy resources.
              </p>
              <div className="mt-5">
                <ConsoleButton href="/health-checks">Create health check</ConsoleButton>
              </div>
            </div>

            <div className="flex min-h-[200px] flex-col items-center justify-center border-b border-[#2a313c] px-8 py-8 text-center md:border-r md:border-b-0">
              <h2 className="text-[16px] leading-6 font-bold text-white">
                Traffic management
              </h2>
              <p className="mt-3 max-w-[380px] flex-1 text-[14px] leading-[22px] text-[#aab7b8]">
                A visual tool that lets you easily create policies for multiple
                endpoints in complex configurations.
              </p>
              <div className="mt-5">
                <ConsoleButton href="/traffic-policies">Create policy</ConsoleButton>
              </div>
            </div>

            <div className="flex min-h-[200px] flex-col items-center justify-center px-8 py-8 text-center">
              <h2 className="text-[16px] leading-6 font-bold text-white">
                Domain registration
              </h2>
              <p className="mt-3 max-w-[380px] flex-1 text-[14px] leading-[22px] text-[#aab7b8]">
                A domain is the name, such as example.com, that your users use
                to access your application.
              </p>
              <div className="mt-5">
                <ConsoleButton href="/domains/registered">Register domain</ConsoleButton>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#414d5c] px-5 py-5">
          <h2 className="text-[16px] leading-6 font-bold text-white">Register domain</h2>
          <p className="mt-2 text-[14px] leading-5 text-[#d5dbdb]">
            Find and register an available domain, or transfer your existing domains
            to Route 53.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <input
                value={domainQuery}
                onChange={(event) => setDomainQuery(event.target.value)}
                placeholder="Enter a domain name"
                className="hz-filter-input pl-3"
                maxLength={255}
              />
              <p className="mt-1.5 text-[12px] leading-4 text-[#aab7b8]">
                You can use a-z, 0-9, and - (hyphen). Maximum of 255 characters.
              </p>
            </div>
            <ConsoleButton href="/domains/registered">Check</ConsoleButton>
          </div>
        </section>

        <section className="rounded-lg border border-[#414d5c] px-5 py-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[16px] leading-6 font-bold text-white">
              Notifications
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Refresh"
                className="hz-refresh-btn"
                onClick={() => setRefreshKey((value) => value + 1)}
              >
                <RotateCw className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center text-[#aab7b8] disabled:opacity-40"
                aria-label="Previous page"
                disabled
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <span className="min-w-5 text-center text-[14px] font-bold text-white">
                1
              </span>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center text-[#aab7b8] disabled:opacity-40"
                aria-label="Next page"
                disabled
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <label className="relative mb-3 block">
            <span className="sr-only">Find notifications</span>
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#8d99a6]" />
            <input
              value={noticeQuery}
              onChange={(event) => setNoticeQuery(event.target.value)}
              placeholder="Find notifications"
              className="hz-filter-input"
            />
          </label>
          <div className="console-table-wrap">
            <table className="hz-table min-w-[480px]">
              <thead>
                <tr>
                  {["Resource", "Status", "Last update"].map((column) => (
                    <th key={column}>
                      <span className="text-[14px] font-bold text-white">{column}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center text-[14px] text-[#8d99a6]">
                      No notifications to display
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map((item) => (
                    <tr key={item.id}>
                      <td className="text-white">{item.resource}</td>
                      <td className="text-white">{item.status}</td>
                      <td className="text-white">{item.lastUpdate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-[#414d5c] px-5 py-5">
          <h2 className="mb-3 inline-flex items-center gap-1.5 text-[16px] leading-6 font-bold text-white">
            More resources
            <ExternalLink className="h-3.5 w-3.5 text-[#42b4ff]" strokeWidth={2.25} />
          </h2>
          <ul>
            {MORE_RESOURCES.map((item) => (
              <li key={item.label} className="border-t border-[#2a313c]">
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block py-2.5 text-[14px] font-bold text-[#42b4ff] hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-[#414d5c] px-5 py-5">
          <h2 className="text-[16px] leading-6 font-bold text-white">Service health</h2>
          <p className="mt-2 text-[14px] leading-[22px] text-[#d5dbdb]">
            To view the current status of Route 53, see the{" "}
            <a
              href="https://health.aws.amazon.com/health/status"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#42b4ff] hover:underline"
            >
              AWS Service Health Dashboard
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.25} />
            </a>
            .
          </p>
        </section>
      </div>

      {helpOpen ? (
        <HostedZoneInfoPanel
          topic={helpTopic}
          onClose={() => setHelpOpen(false)}
        />
      ) : null}
    </div>
  );
}
