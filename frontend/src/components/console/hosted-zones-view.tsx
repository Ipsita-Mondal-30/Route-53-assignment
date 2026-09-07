"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ConsoleButton } from "@/components/console/console-button";
import { ConsoleCard } from "@/components/console/console-card";
import { SearchIcon } from "@/components/console/console-icons";
import { useRoute53Store } from "@/lib/mock/store";

export function HostedZonesView() {
  const router = useRouter();
  const { zones, recordCount } = useRoute53Store();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return zones;
    }
    return zones.filter(
      (zone) =>
        zone.name.toLowerCase().includes(q) ||
        zone.description.toLowerCase().includes(q) ||
        zone.id.toLowerCase().includes(q),
    );
  }, [query, zones]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="text-[20px] leading-7 font-bold text-[var(--c-text-heading)] sm:text-[24px]">
              Hosted zones
            </h1>
            <a href="#" className="text-[14px]">
              Info
            </a>
          </div>
          <p className="mt-1 max-w-3xl text-[14px] leading-5 text-[var(--c-text)]">
            A hosted zone is a container for records, and records contain information
            about how you want to route traffic for a specific domain.
          </p>
        </div>
        <ConsoleButton href="/hosted-zones/new" variant="primary">
          Create hosted zone
        </ConsoleButton>
      </div>

      <ConsoleCard padding={false}>
        <div className="flex flex-col gap-3 border-b border-[var(--c-border-subtle)] p-4 sm:flex-row sm:items-center">
          <label className="relative block w-full max-w-md">
            <span className="sr-only">Search hosted zones</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#8d99a6]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="console-input pl-8"
            />
          </label>
          <p className="text-[13px] text-[#8d99a6] sm:ml-auto">
            {filtered.length} hosted zone{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="console-table-wrap">
          <table className="console-table">
            <thead>
              <tr>
                <th>Domain name</th>
                <th>Type</th>
                <th>Record count</th>
                <th>Description</th>
                <th>Hosted zone ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#8d99a6]">
                    No hosted zones match this search.
                  </td>
                </tr>
              ) : (
                filtered.map((zone) => (
                  <tr
                    key={zone.id}
                    data-clickable="true"
                    onClick={() => router.push(`/hosted-zones/${zone.id}`)}
                  >
                    <td>
                      <span className="font-normal text-[#42b4ff]">{zone.name}</span>
                    </td>
                    <td>{zone.type}</td>
                    <td>{recordCount(zone.id)}</td>
                    <td className="max-w-[280px] truncate">{zone.description || "—"}</td>
                    <td className="font-mono text-[13px]">{zone.id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ConsoleCard>
    </div>
  );
}
