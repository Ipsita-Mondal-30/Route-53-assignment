"use client";

import type { HostedZoneType } from "@/lib/mock/types";

type Props = {
  value: HostedZoneType;
  onChange: (value: HostedZoneType) => void;
};

const OPTIONS: {
  value: HostedZoneType;
  title: string;
  description: string;
}[] = [
  {
    value: "Public",
    title: "Public hosted zone",
    description: "A public hosted zone determines how traffic is routed on the internet.",
  },
  {
    value: "Private",
    title: "Private hosted zone",
    description:
      "A private hosted zone determines how traffic is routed within an Amazon VPC.",
  },
];

export function HostedZoneTypeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className="hz-type-card"
            data-selected={selected ? "true" : "false"}
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
          >
            <span className="hz-radio" aria-hidden="true">
              {selected ? <span className="hz-radio-dot" /> : null}
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] leading-5 font-bold text-[var(--c-text-heading)]">
                {option.title}
              </span>
              <span className="mt-1 block text-[13px] leading-5 text-[#aab7b8]">
                {option.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
