"use client";

import { ChevronDown } from "lucide-react";

import type { HostedZone } from "@/lib/mock/types";

const COLUMNS = [
  "Hosted zone name",
  "Type",
  "Created by",
  "Record count",
  "Description",
  "Hosted zone ID",
] as const;

type Props = {
  zones: HostedZone[];
  recordCount: (zoneId: string) => number;
  selectedId: string | null;
  onSelect: (zoneId: string) => void;
  onOpen: (zoneId: string) => void;
};

function ColumnLabel({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[14px] leading-5 font-bold text-[var(--c-text-heading)]">
      {label}
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--c-text-muted)]" strokeWidth={2.5} />
    </span>
  );
}

export function HostedZoneTable({
  zones,
  recordCount,
  selectedId,
  onSelect,
  onOpen,
}: Props) {
  return (
    <div className="console-table-wrap" data-shortcut-table="true">
      <table className="hz-table hz-zones-table">
        <thead>
          <tr>
            <th className="hz-check-col w-10 !px-3">
              <span className="sr-only">Select</span>
            </th>
            {COLUMNS.map((column) => (
              <th key={column}>
                <ColumnLabel label={column} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => {
            const selected = selectedId === zone.id;
            return (
              <tr
                key={zone.id}
                data-clickable="true"
                data-selected={selected ? "true" : "false"}
                onClick={() => onSelect(zone.id)}
              >
                <td
                  className="w-10"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(zone.id);
                  }}
                >
                  <label className="inline-flex cursor-pointer items-center">
                    <input
                      type="radio"
                      name="hosted-zone-selection"
                      checked={selected}
                      onChange={() => onSelect(zone.id)}
                      onClick={(event) => event.stopPropagation()}
                      aria-label={`Select ${zone.name}`}
                      className="sr-only"
                    />
                    <span
                      className="hz-radio mt-0"
                      data-checked={selected ? "true" : "false"}
                      aria-hidden="true"
                    >
                      {selected ? <span className="hz-radio-dot" /> : null}
                    </span>
                  </label>
                </td>
                <td>
                  <button
                    type="button"
                    className="text-left font-bold text-[var(--c-link)] hover:underline"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpen(zone.id);
                    }}
                  >
                    {zone.name}
                  </button>
                </td>
                <td className="font-bold">{zone.type}</td>
                <td className="font-bold">{zone.createdBy}</td>
                <td className="font-bold">{recordCount(zone.id)}</td>
                <td className="max-w-[240px] truncate font-bold">
                  {zone.description || "—"}
                </td>
                <td className="font-mono text-[13px] font-bold">{zone.id}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function HostedZoneTableHeaderOnly() {
  return (
    <div className="console-table-wrap">
      <table className="hz-table hz-zones-table">
        <thead>
          <tr>
            <th className="hz-check-col w-10 !px-3">
              <span className="sr-only">Select</span>
            </th>
            {COLUMNS.map((column) => (
              <th key={column}>
                <ColumnLabel label={column} />
              </th>
            ))}
          </tr>
        </thead>
      </table>
    </div>
  );
}
