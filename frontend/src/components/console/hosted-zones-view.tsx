"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Search,
  Settings,
} from "lucide-react";

import { ConsoleButton } from "@/components/console/console-button";
import { ConsoleActionsMenu } from "@/components/console/console-actions-menu";
import { HostedZoneDetailsPanel } from "@/components/console/hosted-zone-details-panel";
import { HostedZoneEmptyState } from "@/components/route53/HostedZoneEmptyState";
import {
  HostedZoneTable,
  HostedZoneTableHeaderOnly,
} from "@/components/route53/HostedZoneTable";
import { HostedZonesListSkeleton } from "@/components/console/skeleton";
import { ApiError } from "@/lib/api";
import {
  downloadSelectedHostedZonesExport,
  zoneExportFilename,
  type ExportFormat,
} from "@/lib/hosted-zone-export-api";
import { useRoute53Store } from "@/lib/mock/store";

export function HostedZonesView() {
  const router = useRouter();
  const {
    zones,
    recordCount,
    deleteZones,
    getRecords,
    refreshRecords,
    hydrated,
    loading,
    error,
    refreshZones,
  } = useRoute53Store();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  const selectedZone = selectedId
    ? zones.find((zone) => zone.id === selectedId) ?? null
    : null;
  const hasSelection = Boolean(selectedZone);
  const selectedIds = useMemo(
    () => (selectedId ? new Set([selectedId]) : new Set<string>()),
    [selectedId],
  );

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    if (!filtered.some((zone) => zone.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filtered, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedId(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    void refreshRecords(selectedId).catch(() => {
      /* panel still shows zone fields */
    });
  }, [refreshRecords, selectedId]);

  function onViewDetails() {
    if (selectedId) {
      router.push(`/hosted-zones/${selectedId}`);
    }
  }

  function onEdit() {
    if (selectedId) {
      router.push(`/hosted-zones/${selectedId}/edit`);
    }
  }

  async function onDelete() {
    if (!hasSelection || busy || !selectedId) {
      return;
    }
    if (!window.confirm("Delete 1 hosted zone? This cannot be undone.")) {
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      await deleteZones([selectedId]);
      setSelectedId(null);
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

  async function onExport(format: ExportFormat) {
    if (!hasSelection || busy) {
      return;
    }
    const ids = Array.from(selectedIds);
    setBusy(true);
    setActionError(null);
    try {
      const fallback =
        ids.length === 1
          ? zoneExportFilename(
              zones.find((zone) => zone.id === ids[0])?.name ?? "hosted-zone",
              format,
            )
          : format === "json"
            ? "hosted-zones.json"
            : "hosted-zones.zip";
      await downloadSelectedHostedZonesExport(ids, format, fallback);
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : "Failed to export hosted zones",
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
  const nsRecord = selectedId
    ? getRecords(selectedId).find((record) => record.type === "NS")
    : undefined;
  const nameServers = nsRecord?.value.split("\n").filter(Boolean) ?? [];
  const countLabel = selectedZone ? `1/${count}` : String(count);

  return (
    <div className="-mx-4 -my-5 flex min-h-[calc(100%+2.5rem)] flex-col sm:-mx-5 lg:-mx-6">
      <div className="flex min-h-0 flex-1">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto px-4 py-5 sm:px-5 lg:px-6">
        <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[22px] leading-8 font-bold text-[var(--c-text-heading)] sm:text-[24px]">
            Hosted zones{" "}
            <span className="font-bold text-[var(--c-text-muted)]">
              ({countLabel})
            </span>
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-label="Refresh"
              data-shortcut-refresh="true"
              className="hz-refresh-btn"
              disabled={loading || busy}
              onClick={() => void onRefresh()}
            >
              <RotateCw className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <ConsoleButton
              variant="secondary"
              disabled={!selectedId}
              onClick={onViewDetails}
              className="!font-bold"
            >
              View details
            </ConsoleButton>
            <ConsoleButton
              variant="secondary"
              disabled={!selectedId}
              onClick={onEdit}
              className="!font-bold"
            >
              Edit
            </ConsoleButton>
            <ConsoleButton
              variant="secondary"
              disabled={!hasSelection || busy}
              data-shortcut-delete="true"
              onClick={() => void onDelete()}
              className="!font-bold"
            >
              Delete
            </ConsoleButton>
            <ConsoleActionsMenu
              variant="secondary"
              disabled={!hasSelection || busy}
              sections={[
                {
                  id: "export",
                  label: "Export",
                  items: [
                    {
                      id: "json",
                      label: "Export as JSON",
                      onSelect: () => void onExport("json"),
                    },
                    {
                      id: "bind",
                      label: "Export as BIND",
                      onSelect: () => void onExport("bind"),
                    },
                  ],
                },
              ]}
            />
            <ConsoleButton href="/hosted-zones/new" variant="orange" className="!font-bold">
              Create hosted zone
            </ConsoleButton>
          </div>
        </div>

        <p className="mb-4 text-[14px] leading-5 font-bold text-[var(--c-link)]">
          Automatic mode is the current search behavior optimized for best filter
          results.{" "}
          <a
            href="#"
            className="font-bold text-[var(--c-link)] underline hover:text-[var(--c-link-hover)]"
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
              className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-[var(--c-text-muted)]"
              strokeWidth={2.25}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter records by property or value"
              data-shortcut-search="page"
              className="hz-filter-input font-bold placeholder:font-normal"
            />
          </label>
          <div className="flex shrink-0 items-center gap-0.5 text-[14px] font-bold text-[var(--c-text-muted)]">
            <button
              type="button"
              aria-label="Previous page"
              className="inline-flex h-7 w-7 items-center justify-center disabled:opacity-40"
              disabled
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <span className="min-w-5 text-center font-bold text-[var(--c-text-heading)]">
              1
            </span>
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
              className="ml-1 inline-flex h-8 w-8 items-center justify-center text-[var(--c-text-muted)] hover:text-[var(--c-text-heading)]"
            >
              <Settings className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {!hydrated || loading ? (
            <>
              <HostedZoneTableHeaderOnly />
              <HostedZonesListSkeleton />
            </>
          ) : zones.length === 0 ? (
            <>
              <HostedZoneTableHeaderOnly />
              <HostedZoneEmptyState />
            </>
          ) : filtered.length === 0 ? (
            <>
              <HostedZoneTableHeaderOnly />
              <div className="flex flex-1 items-center justify-center px-4 py-16 text-[14px] font-bold text-[var(--c-text-muted)]">
                No hosted zones match this filter.
              </div>
            </>
          ) : (
            <HostedZoneTable
              zones={filtered}
              recordCount={recordCount}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onOpen={(zoneId) => router.push(`/hosted-zones/${zoneId}`)}
            />
          )}
        </div>
      </div>

      {selectedZone ? (
        <HostedZoneDetailsPanel
          zone={selectedZone}
          recordCount={recordCount(selectedZone.id)}
          nameServers={nameServers}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
      </div>
    </div>
  );
}
