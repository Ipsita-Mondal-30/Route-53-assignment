"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  RotateCw,
  Search,
  Settings,
  X,
} from "lucide-react";

import { ConsoleButton } from "@/components/console/console-button";
import { ImportRecordsPanel } from "@/components/console/import-records-panel";
import { PropertyFilterDropdown } from "@/components/console/property-filter-dropdown";
import {
  RecordDetailsPanel,
  type RecordFormState,
  type RecordPanelMode,
} from "@/components/console/record-details-panel";
import { HostedZoneDetailSkeleton } from "@/components/console/skeleton";
import { InfoLink } from "@/components/route53/HostedZoneInfoPanel";
import { ApiError } from "@/lib/api";
import type { DnsRecord } from "@/lib/mock/types";
import { useRoute53Store } from "@/lib/mock/store";
import { emitNotificationsChanged } from "@/lib/notifications-api";

const RECORD_TYPE_OPTIONS = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "TXT",
  "PTR",
  "SRV",
  "CAA",
  "NS",
].map((type) => ({ value: type, label: type }));

const ROUTING_OPTIONS = [
  { value: "Simple", label: "Simple" },
  { value: "Weighted", label: "Weighted" },
  { value: "Geolocation", label: "Geolocation" },
  { value: "Latency", label: "Latency" },
  { value: "Failover", label: "Failover" },
  { value: "Multivalue", label: "Multivalue answer" },
  { value: "IP-based", label: "IP-based" },
  { value: "Geoproximity", label: "Geoproximity location" },
];

const ALIAS_OPTIONS = [
  { value: "yes", label: "Alias" },
  { value: "no", label: "Non-alias" },
];

const TABS = [
  "records",
  "accelerated",
  "dnssec",
  "tags",
] as const;

type TabId = (typeof TABS)[number];

const emptyForm: RecordFormState = {
  name: "",
  type: "A",
  value: "",
  ttl: "300",
  routingPolicy: "Simple",
  alias: false,
};

const CREATED_FLAG_PREFIX = "route53.zone.created.";
const UPDATED_FLAG_PREFIX = "route53.zone.updated.";

export function HostedZoneDetailView({ zoneId }: { zoneId: string }) {
  const router = useRouter();
  const {
    getZone,
    getRecords,
    updateRecord,
    deleteRecord,
    deleteZones,
    ensureZone,
    refreshRecords,
    hydrated,
  } = useRoute53Store();
  const zone = getZone(zoneId);
  const records = getRecords(zoneId);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [routingFilter, setRoutingFilter] = useState("all");
  const [aliasFilter, setAliasFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabId>("records");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [panelMode, setPanelMode] = useState<RecordPanelMode>("details");
  const [successKind, setSuccessKind] = useState<"created" | "updated" | null>(
    null,
  );
  const [editing, setEditing] = useState<DnsRecord | null>(null);
  const [form, setForm] = useState<RecordFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [zoneMissing, setZoneMissing] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const createdKey = `${CREATED_FLAG_PREFIX}${zoneId}`;
      const updatedKey = `${UPDATED_FLAG_PREFIX}${zoneId}`;
      if (sessionStorage.getItem(createdKey) === "1") {
        sessionStorage.removeItem(createdKey);
        setSuccessKind("created");
      } else if (sessionStorage.getItem(updatedKey) === "1") {
        sessionStorage.removeItem(updatedKey);
        setSuccessKind("updated");
      }
    } catch {
      /* ignore */
    }
  }, [zoneId]);

  useEffect(() => {
    let cancelled = false;
    setLoadingDetail(true);
    setZoneMissing(false);
    setSelectedIds(new Set());

    (async () => {
      const loaded = await ensureZone(zoneId);
      if (cancelled) {
        return;
      }
      if (!loaded) {
        setZoneMissing(true);
        setLoadingDetail(false);
        return;
      }
      try {
        await refreshRecords(zoneId);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiError
              ? err.detail
              : err instanceof Error
                ? err.message
                : "Failed to load records",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingDetail(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ensureZone, refreshRecords, zoneId]);

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const q = query.trim().toLowerCase();
      if (
        q &&
        !record.name.toLowerCase().includes(q) &&
        !record.value.toLowerCase().includes(q) &&
        !record.type.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (typeFilter !== "all" && record.type !== typeFilter) {
        return false;
      }
      if (routingFilter !== "all" && record.routingPolicy !== routingFilter) {
        return false;
      }
      if (aliasFilter === "yes") {
        return false;
      }
      return true;
    });
  }, [aliasFilter, query, records, routingFilter, typeFilter]);

  const selectedRecords = useMemo(
    () => records.filter((record) => selectedIds.has(record.id)),
    [records, selectedIds],
  );

  const selectedKey = Array.from(selectedIds).sort().join(",");
  const prevSelectedKey = useRef("");

  useEffect(() => {
    if (selectedIds.size >= 1) {
      if (prevSelectedKey.current !== selectedKey) {
        setPanelCollapsed(false);
        setHelpOpen(false);
        setPanelMode("details");
        setEditing(null);
      }
    } else {
      setPanelCollapsed(false);
      setPanelMode("details");
      setEditing(null);
    }
    prevSelectedKey.current = selectedKey;
  }, [selectedIds.size, selectedKey]);

  if ((hydrated && zoneMissing) || (!loadingDetail && !zone && hydrated)) {
    return (
      <div>
        <h1 className="text-[20px] font-bold text-white">Hosted zone not found</h1>
        <p className="mt-2 text-[14px] text-[#d1d5db]">
          The requested hosted zone does not exist.
        </p>
        <div className="mt-4">
          <ConsoleButton href="/hosted-zones">Back to hosted zones</ConsoleButton>
        </div>
      </div>
    );
  }

  if (loadingDetail) {
    return <HostedZoneDetailSkeleton />;
  }

  function openEdit(record: DnsRecord) {
    setEditing(record);
    setPanelCollapsed(false);
    setPanelMode("edit");
    setForm({
      name: record.name,
      type: record.type,
      value: record.value,
      ttl: String(record.ttl),
      routingPolicy: record.routingPolicy,
      alias: false,
    });
    setError(null);
  }

  function cancelPanelEdit() {
    setEditing(null);
    setPanelMode("details");
    setError(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const ttl = Number(form.ttl);
    if (!form.name.trim()) {
      setError("Enter a record name.");
      return;
    }
    if (!form.value.trim()) {
      setError("Enter a record value.");
      return;
    }
    if (!Number.isFinite(ttl) || ttl < 0) {
      setError("Enter a valid TTL.");
      return;
    }
    if (!editing) {
      return;
    }
    const payload = {
      name: form.name,
      type: form.type,
      value: form.value,
      ttl,
      routingPolicy: form.routingPolicy,
    };
    setBusy(true);
    setError(null);
    try {
      await updateRecord(editing.id, payload);
      setEditing(null);
      setPanelMode("details");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : "Failed to save record",
      );
    } finally {
      setBusy(false);
    }
  }

  function toggleRecord(recordId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(recordId)) {
        next.delete(recordId);
      } else {
        next.add(recordId);
      }
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filtered.map((record) => record.id)));
  }

  async function confirmDeleteSelected() {
    setBusy(true);
    setError(null);
    try {
      for (const id of Array.from(selectedIds)) {
        await deleteRecord(id);
      }
      setSelectedIds(new Set());
      setPendingDelete(false);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : "Failed to delete records",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteZone() {
    if (!zone || busy) {
      return;
    }
    if (!window.confirm(`Delete hosted zone ${zone.name}?`)) {
      return;
    }
    setBusy(true);
    try {
      await deleteZones([zone.id]);
      router.push("/hosted-zones");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : "Failed to delete hosted zone",
      );
      setBusy(false);
    }
  }

  async function onRefresh() {
    setError(null);
    try {
      await refreshRecords(zoneId);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : "Failed to refresh records",
      );
    }
  }

  const recordCount = records.length;
  const showRecordPanel = selectedIds.size > 0;
  const nsRecord = records.find((record) => record.type === "NS");
  const deleteDisabled =
    selectedIds.size === 0 ||
    selectedRecords.some(
      (record) =>
        record.type === "SOA" ||
        (record.type === "NS" && record.name === zone?.name),
    );

  const tabLabels: Record<TabId, string> = {
    records: `Records (${recordCount})`,
    accelerated: "Accelerated recovery",
    dnssec: "DNSSEC signing",
    tags: `Hosted zone tags (${zone?.tags.length ?? 0})`,
  };

  return (
    <div className="-mx-4 -my-5 flex min-h-[calc(100%+2.5rem)] flex-col sm:-mx-5 lg:-mx-6">
      <div className="flex min-h-0 flex-1">
      <div className="min-w-0 flex-1 overflow-auto px-4 py-5 sm:px-5 lg:px-6">
        {successKind === "updated" ? (
          <div
            role="status"
            className="mb-4 flex items-start gap-3 rounded-lg border border-[#1d8102] bg-[#1a472a] px-4 py-3 text-[14px] leading-[22px] text-[#d5dbdb]"
          >
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1d8102] text-white">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white">
                {zone?.name} was successfully updated.
              </p>
              <p className="text-[#d5dbdb]">
                Hosted zone details were successfully updated.
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              className="shrink-0 text-[#d5dbdb] hover:text-white"
              onClick={() => setSuccessKind(null)}
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        ) : successKind === "created" ? (
          <div
            role="status"
            className="mb-4 flex items-start gap-3 rounded-lg border border-[#1d8102] bg-[#1a472a] px-4 py-3 text-[14px] leading-[22px] text-[#d5dbdb]"
          >
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1d8102] text-white">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <p className="min-w-0 flex-1 text-white">
              <span className="font-bold">{zone?.name}</span> was successfully created. Now
              you can create records in the hosted zone to specify how you want Route 53 to
              route traffic for your domain.
            </p>
            <button
              type="button"
              aria-label="Dismiss"
              className="shrink-0 text-[#d5dbdb] hover:text-white"
              onClick={() => setSuccessKind(null)}
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        ) : null}

        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <span className="inline-flex rounded-sm bg-[#0972d3] px-2 py-0.5 text-[12px] leading-4 font-bold text-white">
              {zone?.type ?? "Public"}
            </span>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <h1 className="text-[24px] leading-8 font-bold text-white">
                {zone?.name ?? "Hosted zone"}
              </h1>
              <InfoLink onClick={() => setHelpOpen(true)} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ConsoleButton
              variant="normal"
              className="!min-h-8 !rounded-full !px-4"
              disabled={busy}
              onClick={() => void onDeleteZone()}
            >
              Delete zone
            </ConsoleButton>
            <ConsoleButton variant="normal" className="!min-h-8 !rounded-full !px-4">
              Test record
            </ConsoleButton>
            <ConsoleButton variant="normal" className="!min-h-8 !rounded-full !px-4">
              Configure query logging
            </ConsoleButton>
          </div>
        </div>

        {/* Hosted zone details accordion */}
        <div className="mb-5 overflow-hidden rounded-lg border border-[#545b64]">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-[16px] leading-6 font-bold text-white"
              onClick={() => setDetailsOpen((value) => !value)}
              aria-expanded={detailsOpen}
            >
              <ChevronRight
                className={`h-4 w-4 text-white transition-transform ${
                  detailsOpen ? "rotate-90" : ""
                }`}
                strokeWidth={2.5}
              />
              Hosted zone details
            </button>
            <ConsoleButton
              variant="normal"
              href={`/hosted-zones/${zoneId}/edit`}
              className="min-h-8! rounded-full! px-4!"
            >
              Edit hosted zone
            </ConsoleButton>
          </div>
          {detailsOpen ? (
            <div className="grid grid-cols-1 gap-x-10 gap-y-5 border-t border-[#414d5c] px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-5">
                <DetailItem label="Hosted zone name" value={zone?.name ?? "—"} />
                <DetailItem label="Hosted zone ID" value={zone?.id ?? "—"} mono />
                <DetailItem label="Description" value={zone?.description || "—"} />
              </div>
              <div className="space-y-5">
                <DetailItem label="Query log" value="-" />
                <DetailItem
                  label="Type"
                  value={`${zone?.type ?? "Public"} hosted zone`}
                />
                <DetailItem label="Record count" value={String(recordCount)} />
              </div>
              <div>
                <dt className="text-[12px] leading-4 font-bold text-[#aab7b8]">
                  Name servers
                </dt>
                <dd className="mt-1.5 space-y-0.5 text-[14px] leading-5 text-white">
                  {(nsRecord?.value.split("\n") ?? ["—"]).map((ns) => (
                    <div key={ns}>{ns}</div>
                  ))}
                </dd>
              </div>
            </div>
          ) : null}
        </div>

        {/* Tabs */}
        <div className="hz-tabs mb-0 flex items-end overflow-x-auto border-b border-[#414d5c]">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`hz-tab shrink-0 px-4 py-2.5 text-[14px] font-bold whitespace-nowrap ${
                activeTab === tab
                  ? "hz-tab-active text-[#42b4ff]"
                  : "text-[#d5dbdb] hover:text-white"
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {activeTab === "records" ? (
          <div className="pt-4 pb-5">
            {error && panelMode !== "edit" && !pendingDelete ? (
              <p className="mb-3 text-[14px] text-[#eb6f6f]" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-[18px] leading-6 font-bold text-white">
                  Records (
                  {selectedIds.size > 0
                    ? `${selectedIds.size}/${recordCount}`
                    : recordCount}
                  )
                </h2>
                <InfoLink onClick={() => setHelpOpen(true)} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-label="Refresh"
                  className="hz-refresh-btn"
                  disabled={busy || loadingDetail}
                  onClick={() => void onRefresh()}
                >
                  <RotateCw className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  disabled={deleteDisabled || busy}
                  onClick={() => setPendingDelete(true)}
                  className="hz-btn-grey"
                >
                  Delete record
                </button>
                <ConsoleButton
                  variant="normal"
                  className="font-bold!"
                  disabled={busy}
                  onClick={() => setImportOpen(true)}
                >
                  Import records
                </ConsoleButton>
                <ConsoleButton
                  variant="orange"
                  href={`/hosted-zones/${zoneId}/create-record`}
                  className="font-bold!"
                >
                  Create record
                </ConsoleButton>
              </div>
            </div>

            <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Filter records</span>
                <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#8d99a6]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter records by property or value"
                  className="hz-filter-input font-bold placeholder:font-normal"
                />
              </label>
              <PropertyFilterDropdown
                label="Type"
                value={typeFilter}
                onChange={setTypeFilter}
                options={RECORD_TYPE_OPTIONS}
                widthClass="w-[200px]"
              />
              <PropertyFilterDropdown
                label="Routing policy"
                value={routingFilter}
                onChange={setRoutingFilter}
                options={ROUTING_OPTIONS}
                widthClass="w-[240px]"
              />
              <PropertyFilterDropdown
                label="Alias"
                value={aliasFilter}
                onChange={setAliasFilter}
                options={ALIAS_OPTIONS}
                widthClass="w-[180px]"
              />
              <div className="ml-auto flex shrink-0 items-center gap-0.5 text-[14px] font-bold text-[#aab7b8]">
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center disabled:opacity-40"
                  aria-label="Previous page"
                  disabled
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <span className="min-w-5 text-center font-bold text-white">1</span>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center disabled:opacity-40"
                  aria-label="Next page"
                  disabled
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  className="ml-1 inline-flex h-8 w-8 items-center justify-center text-[#aab7b8] hover:text-white"
                  aria-label="Table settings"
                >
                  <Settings className="h-4 w-4" strokeWidth={2.25} />
                </button>
              </div>
            </div>

            <p className="mb-3 text-[14px] leading-5 font-bold text-[#42b4ff]">
              Automatic mode is the current search behavior optimized for best filter
              results.{" "}
              <a
                href="#"
                className="font-bold text-[#42b4ff] underline hover:text-[#6ec4ff]"
              >
                To change modes go to settings.
              </a>
            </p>

            <div className="console-table-wrap">
              <table className="hz-table hz-records-table min-w-[1280px]">
                <thead>
                  <tr>
                    <th className="hz-check-col w-10">
                      <input
                        type="checkbox"
                        checked={
                          filtered.length > 0 && selectedIds.size === filtered.length
                        }
                        ref={(el) => {
                          if (el) {
                            el.indeterminate =
                              selectedIds.size > 0 &&
                              selectedIds.size < filtered.length;
                          }
                        }}
                        onChange={toggleAll}
                        aria-label="Select all records"
                        className="h-3.5 w-3.5 accent-[#42b4ff]"
                      />
                    </th>
                    {[
                      "Record name",
                      "Type",
                      "Routing policy",
                      "Differentiator",
                      "Alias",
                      "Value/Route traffic to",
                      "TTL (seconds)",
                      "Health check ID",
                      "Evaluate target health",
                    ].map((column) => (
                      <th key={column}>
                        <span className="inline-flex items-center gap-1 text-[14px] leading-5 font-bold text-white">
                          {column}
                          <ChevronDown
                            className="h-3.5 w-3.5 shrink-0 text-[#aab7b8]"
                            strokeWidth={2.5}
                          />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-[#8d99a6]">
                        No records to display
                      </td>
                    </tr>
                  ) : (
                    filtered.map((record) => {
                      const selected = selectedIds.has(record.id);
                      return (
                        <tr
                          key={record.id}
                          data-selected={selected}
                          data-clickable="true"
                          onClick={() => setSelectedIds(new Set([record.id]))}
                        >
                          <td onClick={(event) => event.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleRecord(record.id)}
                              aria-label={`Select ${record.name}`}
                              className="h-3.5 w-3.5 accent-[#42b4ff]"
                            />
                          </td>
                          <td className="whitespace-nowrap text-white">{record.name}</td>
                          <td className="text-white">{record.type}</td>
                          <td className="text-white">
                            {record.routingPolicy === "Simple"
                              ? "Simple"
                              : record.routingPolicy}
                          </td>
                          <td className="text-white">-</td>
                          <td className="text-white">No</td>
                          <td className="max-w-[280px] align-top">
                            <span
                              className={`block text-[13px] leading-5 text-white ${
                                record.type === "NS"
                                  ? "whitespace-pre-line break-all"
                                  : "truncate"
                              }`}
                            >
                              {record.value}
                            </span>
                          </td>
                          <td className="whitespace-nowrap text-white">
                            {record.ttl.toLocaleString("en-US")}
                          </td>
                          <td className="text-white">-</td>
                          <td className="text-white">-</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="px-0 py-10 text-center text-[14px] text-[#aab7b8]">
            {tabLabels[activeTab]} is not available in this demo.
          </div>
        )}
      </div>

      {/* Record details / Edit record split panel */}
      {showRecordPanel && !panelCollapsed ? (
        <RecordDetailsPanel
          selected={selectedRecords}
          mode={panelMode}
          form={form}
          error={error}
          onCollapse={() => {
            setPanelCollapsed(true);
            setPanelMode("details");
            setEditing(null);
          }}
          onEdit={() => {
            const record = selectedRecords[0];
            if (record) {
              openEdit(record);
            }
          }}
          onCancelEdit={cancelPanelEdit}
          onFormChange={(patch) =>
            setForm((current) => ({ ...current, ...patch }))
          }
          onSave={(event) => void onSubmit(event)}
          saving={busy}
        />
      ) : null}

      {/* Right help panel */}
      {helpOpen ? (
        <>
          <button
            type="button"
            aria-label="Close info panel"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setHelpOpen(false)}
          />
          <aside className="fixed top-[calc(var(--nav-h)+var(--crumb-h))] right-0 z-50 flex h-[calc(100dvh-var(--nav-h)-var(--crumb-h)-var(--footer-h))] w-[min(100%,360px)] flex-col border-l border-[#414d5c] bg-[#161d27] lg:sticky lg:top-0 lg:z-auto lg:h-auto lg:w-[300px] xl:w-[340px]">
            <div className="flex items-center justify-between gap-3 border-b border-[#2a313c] px-4 py-3">
              <h2 className="text-[16px] font-bold text-white">Hosted zone details</h2>
              <button
                type="button"
                aria-label="Close info panel"
                onClick={() => setHelpOpen(false)}
                className="text-[#aab7b8] hover:text-white"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 text-[14px] leading-[22px] text-[#d1d5db]">
              <p>
                The details page for a hosted zone include the following information:
              </p>
              <ul className="mt-4 list-disc space-y-4 pl-5">
                <li>
                  <strong className="font-bold text-white">Hosted zone ID:</strong> The ID
                  that Route 53 assigned to the hosted zone when you created it.
                </li>
                <li>
                  <strong className="font-bold text-white">Description:</strong> The
                  description that you entered when you created the hosted zone, if any.
                </li>
                <li>
                  <strong className="font-bold text-white">Type:</strong> Whether this is a
                  public or private hosted zone.
                </li>
                <li>
                  <strong className="font-bold text-white">Name servers:</strong> The four
                  name servers that Route 53 assigned to the hosted zone.
                </li>
              </ul>
              <p className="mt-4">
                If you want to make Route 53 the DNS service for a domain, update the name
                server records with your domain registrar to use these name servers.
              </p>
            </div>
          </aside>
        </>
      ) : null}
      </div>

      {showRecordPanel && panelCollapsed ? (
        <div className="rd-collapsed-bar">
          <p className="text-[14px] font-bold text-white">Record details</p>
          <button
            type="button"
            aria-label="Expand record panel"
            className="inline-flex h-8 w-8 items-center justify-center text-[#d5dbdb] hover:text-white"
            onClick={() => setPanelCollapsed(false)}
          >
            <ChevronUp className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </div>
      ) : null}

      {pendingDelete ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#414d5c] bg-[#161d27] p-5">
            <h3 className="text-[16px] font-bold text-white">Delete record</h3>
            <p className="mt-2 text-[14px] text-[#d1d5db]">
              Delete {selectedIds.size} selected record
              {selectedIds.size === 1 ? "" : "s"}? This cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <ConsoleButton variant="link" onClick={() => setPendingDelete(false)}>
                Cancel
              </ConsoleButton>
              <ConsoleButton
                variant="orange"
                disabled={busy}
                onClick={() => void confirmDeleteSelected()}
              >
                Delete
              </ConsoleButton>
            </div>
          </div>
        </div>
      ) : null}

      {importOpen ? (
        <ImportRecordsPanel
          zoneId={zoneId}
          onClose={() => setImportOpen(false)}
          onImported={async () => {
            await refreshRecords(zoneId);
            emitNotificationsChanged();
          }}
        />
      ) : null}
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[12px] leading-4 font-bold text-[#aab7b8]">{label}</dt>
      <dd
        className={`mt-1.5 text-[14px] leading-5 text-white ${
          mono ? "font-mono text-[13px]" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
