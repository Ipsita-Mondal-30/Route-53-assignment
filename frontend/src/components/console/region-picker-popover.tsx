"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

const STORAGE_KEY = "route53.console.region";

type Region = {
  name: string;
  code: string;
};

type RegionGroup = {
  label?: string;
  regions: Region[];
};

const REGION_GROUPS: RegionGroup[] = [
  {
    label: "US East",
    regions: [
      { name: "N. Virginia", code: "us-east-1" },
      { name: "Ohio", code: "us-east-2" },
    ],
  },
  {
    label: "US West",
    regions: [
      { name: "N. California", code: "us-west-1" },
      { name: "Oregon", code: "us-west-2" },
    ],
  },
  {
    label: "Africa",
    regions: [{ name: "Cape Town", code: "af-south-1" }],
  },
  {
    label: "Asia Pacific",
    regions: [
      { name: "Hong Kong", code: "ap-east-1" },
      { name: "Hyderabad", code: "ap-south-2" },
      { name: "Jakarta", code: "ap-southeast-3" },
      { name: "Melbourne", code: "ap-southeast-4" },
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
    regions: [
      { name: "Central", code: "ca-central-1" },
      { name: "Calgary", code: "ca-west-1" },
    ],
  },
  {
    label: "Europe",
    regions: [
      { name: "Frankfurt", code: "eu-central-1" },
      { name: "Ireland", code: "eu-west-1" },
      { name: "London", code: "eu-west-2" },
      { name: "Milan", code: "eu-south-1" },
      { name: "Paris", code: "eu-west-3" },
      { name: "Spain", code: "eu-south-2" },
      { name: "Stockholm", code: "eu-north-1" },
      { name: "Zurich", code: "eu-central-2" },
    ],
  },
  {
    label: "Israel",
    regions: [{ name: "Tel Aviv", code: "il-central-1" }],
  },
  {
    label: "Middle East",
    regions: [
      { name: "Bahrain", code: "me-south-1" },
      { name: "UAE", code: "me-central-1" },
    ],
  },
  {
    label: "South America",
    regions: [{ name: "São Paulo", code: "sa-east-1" }],
  },
];

const DISABLED_REGION_COUNT = 17;

type Tab = "regions" | "local-zones";

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
      aria-label="Regions"
      className="absolute top-full right-0 z-[70] w-[320px] overflow-hidden rounded-lg border border-[#687078] bg-[#1b232d] shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
    >
      <div className="px-4 pt-3 pb-2">
        <div
          role="tablist"
          aria-label="Region type"
          className="flex h-8 overflow-hidden rounded-full border border-[#7d8998]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "regions"}
            className={`flex-1 text-[13px] font-bold ${
              tab === "regions"
                ? "bg-[#42b4ff] text-[#0f141a]"
                : "bg-transparent text-white hover:bg-white/5"
            }`}
            onClick={() => setTab("regions")}
          >
            Regions
          </button>
          <span className="w-px self-stretch bg-[#7d8998]" aria-hidden />
          <button
            type="button"
            role="tab"
            aria-selected={tab === "local-zones"}
            className={`flex-1 text-[13px] font-bold ${
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
        <div className="region-picker-scroll max-h-[340px] overflow-y-auto px-1">
          {REGION_GROUPS.map((group) => (
            <div key={group.label}>
              {group.label ? (
                <p className="px-3 pt-3 pb-1 text-[12px] leading-4 font-bold text-[#aab7b8]">
                  {group.label}
                </p>
              ) : null}
              <ul>
                {group.regions.map((region) => {
                  const active = selected === region.code;
                  return (
                    <li key={region.code}>
                      <button
                        type="button"
                        onClick={() => selectRegion(region.code)}
                        className={`flex w-full items-center gap-2 border-b border-[#2a313c] px-3 py-2 text-left ${
                          active ? "bg-[#1a2838]" : "hover:bg-[#232f3e]"
                        }`}
                      >
                        <Lock
                          className="h-3.5 w-3.5 shrink-0 text-[#aab7b8]"
                          strokeWidth={2}
                        />
                        <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-white">
                          {region.name}
                        </span>
                        <span className="shrink-0 text-[12px] text-[#aab7b8]">
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
        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-8 text-center">
          <p className="text-[16px] leading-6 font-bold text-white">
            You haven&apos;t enabled any Local Zones yet.
          </p>
          <p className="mt-2 max-w-[260px] text-[13px] leading-5 text-[#aab7b8]">
            Get started with AWS Local Zones Available in 35 locations across 16
            countries.
          </p>
          <button type="button" className="console-btn console-btn-normal mt-5 font-bold">
            Manage Local Zones
          </button>
        </div>
      )}

      <div className="border-t border-[#2a313c] px-4 py-3">
        {tab === "regions" ? (
          <p className="mb-2 text-[12px] leading-4 text-[#d5dbdb]">
            <button
              type="button"
              className="border-b border-dotted border-[#d5dbdb] text-inherit"
            >
              There are {DISABLED_REGION_COUNT} Regions that are not enabled
            </button>{" "}
            for this account
          </p>
        ) : null}
        <div className="flex items-center gap-2 text-[13px] font-bold">
          <button type="button" className="text-[#42b4ff] hover:underline">
            Manage Regions
          </button>
          <span className="h-3 w-px bg-[#687078]" aria-hidden />
          <button type="button" className="text-[#42b4ff] hover:underline">
            Manage Local Zones
          </button>
        </div>
      </div>
    </div>
  );
}
