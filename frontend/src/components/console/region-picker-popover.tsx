"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

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
      className="region-picker-popover absolute top-full right-0 z-[70] w-[300px] overflow-hidden rounded-lg border border-[#545b64] bg-[#1b232d] shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
    >
      <div className="px-4 pt-3 pb-2">
        <div
          role="tablist"
          aria-label="Region type"
          className="flex h-8 overflow-hidden rounded-full border border-[#d5dbdb]"
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
        <div className="region-picker-scroll max-h-[352px] overflow-y-auto overscroll-contain pb-2">
          {REGION_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="region-picker-muted px-4 pt-3 pb-1 text-[13px] leading-4 font-bold text-[#d1d5db]">
                {group.label}
              </p>
              <ul>
                {group.regions.map((region) => {
                  const active = selected === region.code;
                  return (
                    <li key={region.code}>
                      <button
                        type="button"
                        onClick={() => selectRegion(region.code)}
                        className={`flex w-full items-center gap-2 px-4 py-[7px] text-left ${
                          active ? "bg-[#1a2838]" : "hover:bg-[#232f3e]"
                        }`}
                      >
                        <Lock
                          className="h-3.5 w-3.5 shrink-0 text-[#aab7b8]"
                          strokeWidth={1.75}
                        />
                        <span className="min-w-0 flex-1 truncate text-[13px] leading-5 text-[#eaeded]">
                          {region.name}
                        </span>
                        <span className="region-picker-muted shrink-0 text-[12px] leading-5 text-[#aab7b8]">
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

      <div className="border-t border-[#3d4853] px-4 py-3">
        <div className="flex items-center gap-2.5 text-[13px] font-bold">
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
