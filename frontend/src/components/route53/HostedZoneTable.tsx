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
  selectedIds: Set<string>;
  onToggle: (zoneId: string) => void;
  onOpen: (zoneId: string) => void;
};

function ColumnLabel({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[14px] leading-5 font-bold text-white">
      {label}
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#aab7b8]" strokeWidth={2.5} />
    </span>
  );
}

export function HostedZoneTable({
  zones,
  recordCount,
  selectedIds,
  onToggle,
  onOpen,
}: Props) {
  return (
    <div className="console-table-wrap" data-shortcut-table="true">
      <table className="hz-table">
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
            const selected = selectedIds.has(zone.id);
            return (
              <tr
                key={zone.id}
                data-clickable="true"
                data-selected={selected ? "true" : "false"}
                onClick={() => onOpen(zone.id)}
              >
                <td
                  className="w-10"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggle(zone.id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggle(zone.id)}
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`Select ${zone.name}`}
                    className="h-3.5 w-3.5 accent-[#42b4ff]"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="text-left font-bold text-[#42b4ff] hover:underline"
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
      <table className="hz-table">
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
