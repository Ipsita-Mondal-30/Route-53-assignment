"use client";

import { ChevronRight, Settings } from "lucide-react";

import type { HostedZone } from "@/lib/mock/types";

type Props = {
  zone: HostedZone;
  recordCount: number;
  nameServers: string[];
  onClose: () => void;
};

export function HostedZoneDetailsPanel({
  zone,
  recordCount,
  nameServers,
  onClose,
}: Props) {
  const servers = nameServers.length > 0 ? nameServers : ["—"];

  return (
    <>
      <button
        type="button"
        aria-label="Close hosted zone details"
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
      />
      <aside
        className="rd-panel fixed top-[calc(var(--nav-h)+var(--crumb-h))] right-0 z-50 flex h-[calc(100dvh-var(--nav-h)-var(--crumb-h)-var(--footer-h))] w-[min(100%,360px)] shrink-0 flex-col overflow-hidden border-l border-[#414d5c] bg-[#161d27] lg:sticky lg:top-0 lg:z-auto lg:h-[calc(100dvh-var(--nav-h)-var(--crumb-h)-var(--footer-h))] lg:w-[320px] xl:w-[340px]"
        aria-label="Hosted zone details"
      >
        <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-[#2a313c] px-4">
          <h2 className="text-[16px] leading-6 font-bold text-[var(--c-text-heading)]">
            Hosted zone details
          </h2>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              aria-label="Panel settings"
              className="inline-flex h-8 w-8 items-center justify-center text-[var(--c-text-muted)] hover:text-[var(--c-text-heading)]"
            >
              <Settings className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <button
              type="button"
              aria-label="Close hosted zone details"
              className="inline-flex h-8 w-8 items-center justify-center text-[var(--c-text-muted)] hover:text-[var(--c-text-heading)]"
              onClick={onClose}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <DetailField label="Hosted zone name" value={zone.name} />
          <DetailField label="Hosted zone ID" value={zone.id} mono />
          <DetailField label="Description" value={zone.description || "—"} />
          <DetailField label="Query log" value="-" />
          <DetailField label="Type" value={`${zone.type} hosted zone`} />
          <DetailField label="Record count" value={String(recordCount)} />
          <div className="mb-4">
            <dt className="text-[12px] leading-4 font-bold text-[var(--c-text-muted)]">
              Name servers
            </dt>
            <dd className="mt-1.5">
              <ul className="list-disc space-y-1 pl-4 text-[14px] leading-5 text-[var(--c-text-heading)]">
                {servers.map((ns) => (
                  <li key={ns} className="break-all">
                    {ns}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </div>
      </aside>
    </>
  );
}

function DetailField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="mb-4">
      <dt className="text-[12px] leading-4 font-bold text-[var(--c-text-muted)]">
        {label}
      </dt>
      <dd
        className={`mt-1.5 text-[14px] leading-5 text-[var(--c-text-heading)] ${
          mono ? "font-mono text-[13px] break-all" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
