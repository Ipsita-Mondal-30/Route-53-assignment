"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "route53.console.region";

type Region = {
  name: string;
  code: string;
};

type RegionGroup = {
  label: string;
  regions: Region[];
};

const REGION_GROUPS: RegionGroup[] = [
  {
    label: "United States",
    regions: [
      { name: "N. Virginia", code: "us-east-1" },
      { name: "Ohio", code: "us-east-2" },
      { name: "N. California", code: "us-west-1" },
      { name: "Oregon", code: "us-west-2" },
    ],
  },
  {
    label: "Asia Pacific",
    regions: [
      { name: "Mumbai", code: "ap-south-1" },
      { name: "Osaka", code: "ap-northeast-3" },
      { name: "Seoul", code: "ap-northeast-2" },
      { name: "Singapore", code: "ap-southeast-1" },
      { name: "Sydney", code: "ap-southeast-2" },
      { name: "Tokyo", code: "ap-northeast-1" },
    ],
  },
  {
    label: "Canada",
    regions: [{ name: "Central", code: "ca-central-1" }],
  },
  {
    label: "Europe",
    regions: [
      { name: "Frankfurt", code: "eu-central-1" },
      { name: "Ireland", code: "eu-west-1" },
      { name: "London", code: "eu-west-2" },
      { name: "Paris", code: "eu-west-3" },
      { name: "Stockholm", code: "eu-north-1" },
    ],
  },
  {
    label: "South America",
    regions: [{ name: "São Paulo", code: "sa-east-1" }],
  },
];

type Tab = "regions" | "local-zones";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5.25 7.25V5.4a2.75 2.75 0 0 1 5.5 0v1.85"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <rect
        x="3.4"
        y="7.25"
        width="9.2"
        height="6.35"
        rx="1.35"
        stroke="currentColor"
        strokeWidth="1.35"
      />
    </svg>
  );
}

export function RegionPickerPopover({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("regions");
  const [selected, setSelected] = useState("global");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSelected(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setTab("regions");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  function selectRegion(code: string) {
    setSelected(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-label={tab === "regions" ? "Regions" : "Local Zones"}
      className="region-picker-popover absolute top-full right-0 z-[70] w-[440px] overflow-hidden rounded-lg border border-[#4a5262] bg-[#1b232d] shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
    >
      <div className="px-5 pt-4 pb-3">
        <div
          role="tablist"
          aria-label="Region type"
          className="inline-flex h-8 items-stretch overflow-hidden rounded-full border border-[#687078] bg-[#151d27]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "regions"}
            className={`h-full px-6 text-[13px] leading-8 font-bold whitespace-nowrap ${
              tab === "regions"
                ? "bg-[#42b4ff] text-[#0f141a]"
                : "bg-transparent text-white hover:bg-white/5"
            }`}
            onClick={() => setTab("regions")}
          >
            Regions
          </button>
          <span className="w-px shrink-0 self-stretch bg-[#687078]" aria-hidden />
          <button
            type="button"
            role="tab"
            aria-selected={tab === "local-zones"}
            className={`h-full px-6 text-[13px] leading-8 font-bold whitespace-nowrap ${
              tab === "local-zones"
                ? "bg-[#42b4ff] text-[#0f141a]"
                : "bg-transparent text-white hover:bg-white/5"
            }`}
            onClick={() => setTab("local-zones")}
          >
            Local Zones
          </button>
        </div>
      </div>

      {tab === "regions" ? (
        <div className="region-picker-scroll max-h-[calc(100vh-9.5rem)] overflow-y-auto overscroll-contain">
          {REGION_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="region-picker-muted px-5 pt-3 pb-1.5 text-[13px] leading-4 font-bold text-[#eaeded]">
                {group.label}
              </p>
              <ul>
                {group.regions.map((region) => {
                  const active = selected === region.code;
                  return (
                    <li key={region.code} className="border-b border-[#2a323c]">
                      <button
                        type="button"
                        onClick={() => selectRegion(region.code)}
                        className={`flex h-[38px] w-full items-center gap-2.5 px-5 text-left ${
                          active ? "bg-[#1a2838]" : "hover:bg-[#232f3e]"
                        }`}
                      >
                        <LockIcon className="h-3 w-3 shrink-0 text-[#d5dbdb]" />
                        <span className="min-w-0 flex-1 truncate text-[13px] leading-5 text-[#d1d5db]">
                          {region.name}
                        </span>
                        <span className="region-picker-muted shrink-0 text-[12px] leading-5 text-[#9ba3af]">
                          {region.code}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-10 text-center">
          <p className="text-[16px] leading-6 font-bold text-white">
            You haven&apos;t enabled any Local Zones yet.
          </p>
          <p className="region-picker-muted mt-2 text-[13px] leading-5 text-[#aab7b8]">
            Get started with AWS Local Zones
          </p>
          <p className="region-picker-muted text-[13px] leading-5 text-[#aab7b8]">
            Available in 35 locations across 16 countries.
          </p>
          <button
            type="button"
            className="region-picker-action mt-5 inline-flex min-h-8 items-center justify-center rounded-full border-2 border-[#42b4ff] px-5 text-[14px] font-bold text-[#42b4ff] hover:bg-[#42b4ff]/10"
          >
            Manage Local Zones
          </button>
        </div>
      )}

      <div className="border-t border-[#3f4751] px-5 pt-3.5 pb-6">
        <div className="flex items-center gap-3 text-[13px] leading-5 font-bold">
          <button type="button" className="region-picker-link text-[#42b4ff] hover:underline">
            Manage Regions
          </button>
          <span className="h-3.5 w-px bg-[#687078]" aria-hidden />
          <button type="button" className="region-picker-link text-[#42b4ff] hover:underline">
            Manage Local Zones
          </button>
        </div>
      </div>
    </div>
  );
}
