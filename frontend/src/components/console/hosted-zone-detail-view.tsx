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
import { PropertyFilterDropdown } from "@/components/console/property-filter-dropdown";
import {
  RecordDetailsPanel,
  type RecordFormState,
  type RecordPanelMode,
} from "@/components/console/record-details-panel";
import { InfoLink } from "@/components/route53/HostedZoneInfoPanel";
import { SortChevronIcon } from "@/components/route53/icons";
import { ApiError } from "@/lib/api";
import type { DnsRecord, RecordType, RoutingPolicy } from "@/lib/mock/types";
import { useRoute53Store } from "@/lib/mock/store";

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

const ROUTING: RoutingPolicy[] = [
  "Simple",
  "Weighted",
  "Latency",
  "Failover",
  "Geolocation",
  "Multivalue",
];

const RECORD_TYPES: RecordType[] = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "TXT",
  "NS",
  "PTR",
  "SRV",
  "CAA",
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

export function HostedZoneDetailView({ zoneId }: { zoneId: string }) {
  const router = useRouter();
  const {
    getZone,
    getRecords,
    createRecord,
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
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [panelMode, setPanelMode] = useState<RecordPanelMode>("details");
  const [showSuccess, setShowSuccess] = useState(false);
  const [editing, setEditing] = useState<DnsRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<RecordFormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [zoneMissing, setZoneMissing] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const key = `${CREATED_FLAG_PREFIX}${zoneId}`;
      if (sessionStorage.getItem(key) === "1") {
        sessionStorage.removeItem(key);
        setShowSuccess(true);
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

  if (loadingDetail && !zone) {
    return (
      <div className="py-16 text-center text-[14px] text-[#aab7b8]">
        Loading hosted zone…
      </div>
    );
  }

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setPanelMode("details");
    setForm({ ...emptyForm, name: zone?.name ?? "" });
    setError(null);
  }

  function openEdit(record: DnsRecord) {
    setEditing(record);
    setCreating(false);
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

  function closeForm() {
    setCreating(false);
    setEditing(null);
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
      if (editing) {
        await updateRecord(editing.id, payload);
        setEditing(null);
        setPanelMode("details");
      } else {
        await createRecord(zoneId, payload);
        closeForm();
      }
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
  const showForm = creating;
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
        {showSuccess ? (
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
              onClick={() => setShowSuccess(false)}
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
        <div className="mb-5 overflow-hidden rounded-xl border border-[#545b64] bg-[#161d27]">
          <div className="flex items-center justify-between gap-3 px-5 py-3.5">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-[16px] font-bold text-white"
              onClick={() => setDetailsOpen((value) => !value)}
              aria-expanded={detailsOpen}
            >
              <ChevronDown
                className={`h-4 w-4 text-white transition-transform ${
                  detailsOpen ? "" : "-rotate-90"
                }`}
                strokeWidth={2.5}
              />
              Hosted zone details
            </button>
            <ConsoleButton variant="normal" className="min-h-8! rounded-full! px-4!">
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
                <dd className="mt-1.5 space-y-0.5 font-mono text-[13px] leading-5 text-white">
                  {(nsRecord?.value.split("\n") ?? ["—"]).map((ns) => (
                    <div key={ns}>{ns.replace(/\.$/, "")}</div>
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
          <div className="border border-t-0 border-[#545b64] bg-[#161d27] px-5 pt-4 pb-5">
            {error && !showForm && panelMode !== "edit" && !pendingDelete ? (
              <p className="mb-3 text-[14px] text-[#eb6f6f]" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
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
                <p className="mt-1 max-w-[720px] text-[13px] leading-5 text-[#aab7b8]">
                  The following table lists the existing records in {zone?.name}. You
                  can&apos;t delete the SOA record or the NS record named {zone?.name}.
                </p>
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
                <ConsoleButton variant="normal" className="font-bold!">
                  Import zone file
                </ConsoleButton>
                <ConsoleButton variant="orange" onClick={openCreate} className="font-bold!">
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
                  className="hz-filter-input"
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
              <div className="ml-auto flex items-center gap-0.5 text-[13px] text-[#d5dbdb]">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center text-[#aab7b8] hover:text-white"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded border border-[#687078] bg-[#0f141a] px-2 font-bold text-white">
                  1
                </span>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center text-[#aab7b8] hover:text-white"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center text-[#aab7b8] hover:text-white"
                  aria-label="Table settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded border border-[#414d5c]">
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
                        <span className="inline-flex items-center gap-1 text-[14px] font-bold text-white">
                          {column}
                          <SortChevronIcon className="hz-sort-icon h-3 w-2.5 text-[#42b4ff]" />
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
                            <span className="block whitespace-pre-line break-all text-[13px] leading-5 text-white">
                              {record.value
                                .split("\n")
                                .map((line) => line.replace(/\.$/, ""))
                                .join("\n")}
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
          <div className="border border-t-0 border-[#414d5c] bg-[#161d27] px-4 py-10 text-center text-[14px] text-[#aab7b8]">
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

      {showForm ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#414d5c] bg-[#161d27] p-5 shadow-xl">
            <h3 className="text-[18px] font-bold text-white">Create record</h3>
            <form onSubmit={(event) => void onSubmit(event)} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[14px] font-bold text-white">
                  Record name
                </span>
                <input
                  className="console-input"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[14px] font-bold text-white">Type</span>
                <select
                  className="console-input"
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value as RecordType,
                    }))
                  }
                >
                  {RECORD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[14px] font-bold text-white">TTL</span>
                <input
                  className="console-input"
                  value={form.ttl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, ttl: event.target.value }))
                  }
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[14px] font-bold text-white">Value</span>
                <textarea
                  className="console-input h-24 py-2"
                  value={form.value}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, value: event.target.value }))
                  }
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[14px] font-bold text-white">
                  Routing policy
                </span>
                <select
                  className="console-input"
                  value={form.routingPolicy}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      routingPolicy: event.target.value as RoutingPolicy,
                    }))
                  }
                >
                  {ROUTING.map((policy) => (
                    <option key={policy} value={policy}>
                      {policy}
                    </option>
                  ))}
                </select>
              </label>
              {error ? (
                <p className="sm:col-span-2 text-[14px] text-[#eb6f6f]" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end gap-2 sm:col-span-2">
                <ConsoleButton type="button" variant="link" onClick={closeForm}>
                  Cancel
                </ConsoleButton>
                <ConsoleButton type="submit" variant="orange" disabled={busy}>
                  Create record
                </ConsoleButton>
              </div>
            </form>
          </div>
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
