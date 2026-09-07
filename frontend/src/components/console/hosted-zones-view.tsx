"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Search,
  Settings,
} from "lucide-react";

import { ConsoleButton } from "@/components/console/console-button";
import { HostedZoneEmptyState } from "@/components/route53/HostedZoneEmptyState";
import {
  HostedZoneTable,
  HostedZoneTableHeaderOnly,
} from "@/components/route53/HostedZoneTable";
import { ApiError } from "@/lib/api";
import { useRoute53Store } from "@/lib/mock/store";

export function HostedZonesView() {
  const router = useRouter();
  const {
    zones,
    recordCount,
    deleteZones,
    hydrated,
    loading,
    error,
    refreshZones,
  } = useRoute53Store();
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return zones;
    }
    return zones.filter(
      (zone) =>
        zone.name.toLowerCase().includes(q) ||
        zone.description.toLowerCase().includes(q) ||
        zone.id.toLowerCase().includes(q) ||
        zone.type.toLowerCase().includes(q) ||
        zone.createdBy.toLowerCase().includes(q),
    );
  }, [query, zones]);

  const hasSelection = selectedIds.size > 0;
  const singleSelectedId =
    selectedIds.size === 1 ? Array.from(selectedIds)[0] : null;

  function toggleZone(zoneId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(zoneId)) {
        next.delete(zoneId);
      } else {
        next.add(zoneId);
      }
      return next;
    });
  }

  function onViewDetails() {
    if (singleSelectedId) {
      router.push(`/hosted-zones/${singleSelectedId}`);
    }
  }

  function onEdit() {
    if (singleSelectedId) {
      router.push(`/hosted-zones/${singleSelectedId}`);
    }
  }

  async function onDelete() {
    if (!hasSelection || busy) {
      return;
    }
    const ids = Array.from(selectedIds);
    if (
      !window.confirm(
        `Delete ${ids.length} hosted zone${ids.length === 1 ? "" : "s"}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      await deleteZones(ids);
      setSelectedIds(new Set());
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : "Failed to delete hosted zones",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onRefresh() {
    setActionError(null);
    try {
      await refreshZones();
    } catch {
      /* store keeps error */
    }
  }

  const count = hydrated ? zones.length : 0;
  const displayError = actionError || error;

  return (
    <div className="flex min-h-full flex-col pb-2">
      <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[22px] leading-8 font-bold text-white sm:text-[24px]">
          Hosted zones{" "}
          <span className="font-bold text-[#d5dbdb]">({count})</span>
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-label="Refresh"
            className="hz-refresh-btn"
            disabled={loading || busy}
            onClick={() => void onRefresh()}
          >
            <RotateCw className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <ConsoleButton
            variant="secondary"
            disabled={!singleSelectedId}
            onClick={onViewDetails}
            className="!font-bold"
          >
            View details
          </ConsoleButton>
          <ConsoleButton
            variant="secondary"
            disabled={!singleSelectedId}
            onClick={onEdit}
            className="!font-bold"
          >
            Edit
          </ConsoleButton>
          <ConsoleButton
            variant="secondary"
            disabled={!hasSelection || busy}
            onClick={() => void onDelete()}
            className="!font-bold"
          >
            Delete
          </ConsoleButton>
          <ConsoleButton href="/hosted-zones/new" variant="orange" className="!font-bold">
            Create hosted zone
          </ConsoleButton>
        </div>
      </div>

      <p className="mb-4 text-[14px] leading-5 font-bold text-[#aab7b8]">
        Automatic mode is the current search behavior optimized for best filter
        results.{" "}
        <a
          href="#"
          className="font-bold text-[#42b4ff] underline hover:text-[#6ec4ff]"
        >
          To change modes go to settings.
        </a>
      </p>

      {displayError ? (
        <p className="mb-3 text-[14px] text-[#eb6f6f]" role="alert">
          {displayError}
        </p>
      ) : null}

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">Filter hosted zones</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-[#8d99a6]"
            strokeWidth={2.25}
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter records by property or value"
            className="hz-filter-input font-bold placeholder:font-normal"
          />
        </label>
        <div className="flex shrink-0 items-center gap-0.5 text-[14px] font-bold text-[#aab7b8]">
          <button
            type="button"
            aria-label="Previous page"
            className="inline-flex h-7 w-7 items-center justify-center disabled:opacity-40"
            disabled
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <span className="min-w-5 text-center font-bold text-white">1</span>
          <button
            type="button"
            aria-label="Next page"
            className="inline-flex h-7 w-7 items-center justify-center disabled:opacity-40"
            disabled
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            aria-label="Table preferences"
            className="ml-1 inline-flex h-8 w-8 items-center justify-center text-[#aab7b8] hover:text-white"
          >
            <Settings className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {!hydrated || loading ? (
          <>
            <HostedZoneTableHeaderOnly />
            <div className="flex flex-1 items-center justify-center px-4 py-16 text-[14px] font-bold text-[#aab7b8]">
              Loading hosted zones…
            </div>
          </>
        ) : zones.length === 0 ? (
          <>
            <HostedZoneTableHeaderOnly />
            <HostedZoneEmptyState />
          </>
        ) : filtered.length === 0 ? (
          <>
            <HostedZoneTableHeaderOnly />
            <div className="flex flex-1 items-center justify-center px-4 py-16 text-[14px] font-bold text-[#aab7b8]">
              No hosted zones match this filter.
            </div>
          </>
        ) : (
          <HostedZoneTable
            zones={filtered}
            recordCount={recordCount}
            selectedIds={selectedIds}
            onToggle={toggleZone}
            onOpen={(zoneId) => router.push(`/hosted-zones/${zoneId}`)}
          />
        )}
      </div>
    </div>
  );
}
