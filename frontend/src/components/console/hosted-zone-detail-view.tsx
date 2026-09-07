"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Search,
  Settings,
  X,
} from "lucide-react";

import { ConsoleButton } from "@/components/console/console-button";
import { InfoLink } from "@/components/route53/HostedZoneInfoPanel";
import { SortChevronIcon } from "@/components/route53/icons";
import { RECORD_TYPES } from "@/lib/mock/records";
import type { DnsRecord, RecordType, RoutingPolicy } from "@/lib/mock/types";
import { useRoute53Store } from "@/lib/mock/store";

const ROUTING: RoutingPolicy[] = [
  "Simple",
  "Weighted",
  "Latency",
  "Failover",
  "Geolocation",
  "Multivalue",
];

const TABS = [
  "records",
  "accelerated",
  "dnssec",
  "tags",
] as const;

type TabId = (typeof TABS)[number];

type FormState = {
  name: string;
  type: RecordType;
  value: string;
  ttl: string;
  routingPolicy: RoutingPolicy;
};

const emptyForm: FormState = {
  name: "",
  type: "A",
  value: "",
  ttl: "300",
  routingPolicy: "Simple",
};

const CREATED_FLAG_PREFIX = "route53.zone.created.";

export function HostedZoneDetailView({ zoneId }: { zoneId: string }) {
  const router = useRouter();
  const { getZone, getRecords, createRecord, updateRecord, deleteRecord, deleteZones, hydrated } =
    useRoute53Store();
  const zone = getZone(zoneId);
  const records = getRecords(zoneId);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [routingFilter, setRoutingFilter] = useState("all");
  const [aliasFilter, setAliasFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<TabId>("records");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(true);
  const [selectionOpen, setSelectionOpen] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editing, setEditing] = useState<DnsRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const filtered = useMemo(() => {
    void refreshKey;
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
  }, [aliasFilter, query, records, refreshKey, routingFilter, typeFilter]);

  const selectedRecords = useMemo(
    () => records.filter((record) => selectedIds.has(record.id)),
    [records, selectedIds],
  );

  if (hydrated && !zone) {
    return (
      <div>
        <h1 className="text-[20px] font-bold text-white">Hosted zone not found</h1>
        <p className="mt-2 text-[14px] text-[#d1d5db]">
          The requested hosted zone does not exist in this demo.
        </p>
        <div className="mt-4">
          <ConsoleButton href="/hosted-zones">Back to hosted zones</ConsoleButton>
        </div>
      </div>
    );
  }

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setForm({ ...emptyForm, name: zone?.name ?? "" });
    setError(null);
  }

  function openEdit(record: DnsRecord) {
    setEditing(record);
    setCreating(false);
    setForm({
      name: record.name,
      type: record.type,
      value: record.value,
      ttl: String(record.ttl),
      routingPolicy: record.routingPolicy,
    });
    setError(null);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
    setError(null);
  }

  function onSubmit(event: FormEvent) {
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
    if (editing) {
      updateRecord(editing.id, payload);
    } else {
      createRecord(zoneId, payload);
    }
    closeForm();
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

  function confirmDeleteSelected() {
    selectedIds.forEach((id) => deleteRecord(id));
    setSelectedIds(new Set());
    setPendingDelete(false);
  }

  const recordCount = records.length;
  const showForm = creating || editing;
  const nsRecord = records.find((record) => record.type === "NS");

  const tabLabels: Record<TabId, string> = {
    records: `Records (${recordCount})`,
    accelerated: "Accelerated recovery",
    dnssec: "DNSSEC signing",
    tags: `Hosted zone tags (${zone?.tags.length ?? 0})`,
  };

  return (
    <div className="-mx-4 -my-5 flex min-h-[calc(100%+2.5rem)] sm:-mx-5 lg:-mx-6">
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
              onClick={() => {
                if (zone && window.confirm(`Delete hosted zone ${zone.name}?`)) {
                  deleteZones([zone.id]);
                  router.push("/hosted-zones");
                }
              }}
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
        <div className="mb-4 border border-[#414d5c] bg-[#161d27]">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-[14px] font-bold text-white hover:text-[#42b4ff]"
              onClick={() => setDetailsOpen((value) => !value)}
              aria-expanded={detailsOpen}
            >
              <ChevronRight
                className={`h-4 w-4 text-[#aab7b8] transition-transform ${
                  detailsOpen ? "rotate-90" : ""
                }`}
                strokeWidth={2.5}
              />
              Hosted zone details
            </button>
            <ConsoleButton variant="normal" className="!min-h-8 !rounded-full !px-4">
              Edit hosted zone
            </ConsoleButton>
          </div>
          {detailsOpen ? (
            <dl className="grid grid-cols-1 gap-4 border-t border-[#2a313c] px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem label="Hosted zone ID" value={zone?.id ?? "—"} mono />
              <DetailItem label="Description" value={zone?.description || "—"} />
              <DetailItem label="Type" value={`${zone?.type ?? "Public"} hosted zone`} />
              <DetailItem
                label="Name servers"
                value={nsRecord?.value.replace(/\n/g, "\n") ?? "—"}
                mono
                pre
              />
              <DetailItem
                label="Created"
                value={
                  zone?.createdAt
                    ? new Date(zone.createdAt).toLocaleString()
                    : "—"
                }
              />
            </dl>
          ) : null}
        </div>

        {/* Tabs */}
        <div className="mb-0 flex items-center gap-1 border-b border-[#414d5c]">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center text-[#aab7b8] hover:text-white"
            aria-label="Previous tabs"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <div className="flex min-w-0 flex-1 gap-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 border-b-2 px-3 py-2 text-[14px] font-bold whitespace-nowrap ${
                  activeTab === tab
                    ? "border-[#42b4ff] text-white"
                    : "border-transparent text-[#d5dbdb] hover:text-white"
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center text-[#aab7b8] hover:text-white"
            aria-label="Next tabs"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {activeTab === "records" ? (
          <div className="border border-t-0 border-[#414d5c] bg-[#161d27] p-4">
            <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-[18px] font-bold text-white">
                  Records ({recordCount})
                </h2>
                <InfoLink onClick={() => setHelpOpen(true)} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-label="Refresh"
                  className="hz-refresh-btn"
                  onClick={() => setRefreshKey((value) => value + 1)}
                >
                  <RotateCw className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <ConsoleButton
                  variant="secondary"
                  disabled={selectedIds.size === 0}
                  onClick={() => setPendingDelete(true)}
                  className="!font-bold"
                >
                  Delete record
                </ConsoleButton>
                <ConsoleButton variant="normal" className="!font-bold">
                  Import zone file
                </ConsoleButton>
                <ConsoleButton variant="orange" onClick={openCreate} className="!font-bold">
                  Create record
                </ConsoleButton>
              </div>
            </div>

            <p className="mb-3 text-[13px] text-[#aab7b8]">
              Automatic mode.{" "}
              <a href="#" className="font-bold text-[#42b4ff] hover:underline">
                To change modes go to settings.
              </a>
            </p>

            {/* Filters */}
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
              <FilterSelect
                label="Type"
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { value: "all", label: "Type" },
                  ...RECORD_TYPES.map((type) => ({ value: type, label: type })),
                ]}
              />
              <FilterSelect
                label="Routing policy"
                value={routingFilter}
                onChange={setRoutingFilter}
                options={[
                  { value: "all", label: "Routing policy" },
                  ...ROUTING.map((policy) => ({ value: policy, label: policy })),
                ]}
              />
              <FilterSelect
                label="Alias"
                value={aliasFilter}
                onChange={setAliasFilter}
                options={[
                  { value: "all", label: "Alias" },
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
            </div>

            <div className="overflow-x-auto border border-[#414d5c]">
              <table className="hz-table min-w-[1100px]">
                <thead>
                  <tr>
                    <th className="hz-check-col w-10">
                      <input
                        type="checkbox"
                        checked={
                          filtered.length > 0 && selectedIds.size === filtered.length
                        }
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
                      "TTL",
                    ].map((column) => (
                      <th key={column}>
                        <span className="inline-flex items-center text-[14px] font-bold text-white">
                          {column}
                          <SortChevronIcon className="hz-sort-icon h-3.5 w-2.5 text-[#aab7b8]" />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-[#8d99a6]">
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
                          onClick={() => toggleRecord(record.id)}
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
                          <td className="whitespace-nowrap text-[#d5dbdb]">
                            <button
                              type="button"
                              className="text-left text-[#42b4ff] hover:underline"
                              onClick={(event) => {
                                event.stopPropagation();
                                openEdit(record);
                              }}
                            >
                              {record.name}
                            </button>
                          </td>
                          <td>{record.type}</td>
                          <td>
                            {record.routingPolicy === "Simple"
                              ? "Simple routing"
                              : record.routingPolicy}
                          </td>
                          <td>—</td>
                          <td>No</td>
                          <td className="max-w-[320px]">
                            <span className="block whitespace-pre-line break-all text-[13px]">
                              {record.value}
                            </span>
                          </td>
                          <td>{record.ttl}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2 text-[13px] text-[#d5dbdb]">
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center text-[#aab7b8] hover:text-white"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="inline-flex h-7 min-w-7 items-center justify-center rounded border border-[#687078] px-2 font-bold text-white">
                1
              </span>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center text-[#aab7b8] hover:text-white"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center text-[#aab7b8] hover:text-white"
                aria-label="Table settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-t-0 border-[#414d5c] bg-[#161d27] px-4 py-10 text-center text-[14px] text-[#aab7b8]">
            {tabLabels[activeTab]} is not available in this demo.
          </div>
        )}
      </div>

      {/* Middle: selection details */}
      {selectionOpen ? (
        <aside className="hidden w-[240px] shrink-0 flex-col border-l border-[#414d5c] bg-[#161d27] xl:flex">
          <div className="flex items-center justify-between gap-2 border-b border-[#2a313c] px-3 py-3">
            <p className="text-[14px] font-bold text-white">
              {selectedIds.size} record{selectedIds.size === 1 ? "" : "s"} selected
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Selection settings"
                className="text-[#aab7b8] hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Collapse selection panel"
                className="text-[#aab7b8] hover:text-white"
                onClick={() => setSelectionOpen(false)}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center px-4 py-8 text-center text-[14px] text-[#aab7b8]">
            {selectedRecords.length === 0 ? (
              "Select a record to see its details"
            ) : (
              <div className="w-full space-y-3 text-left">
                {selectedRecords.map((record) => (
                  <div key={record.id} className="border border-[#2a313c] p-3">
                    <p className="text-[13px] font-bold text-white">{record.name}</p>
                    <p className="mt-1 text-[12px] text-[#aab7b8]">{record.type}</p>
                    <p className="mt-2 whitespace-pre-line break-all text-[12px] text-[#d5dbdb]">
                      {record.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
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

      {showForm ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#414d5c] bg-[#161d27] p-5 shadow-xl">
            <h3 className="text-[18px] font-bold text-white">
              {editing ? "Edit record" : "Create record"}
            </h3>
            <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <ConsoleButton type="submit" variant="orange">
                  {editing ? "Save record" : "Create record"}
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
              {selectedIds.size === 1 ? "" : "s"}? This only updates local demo data.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <ConsoleButton variant="link" onClick={() => setPendingDelete(false)}>
                Cancel
              </ConsoleButton>
              <ConsoleButton variant="orange" onClick={confirmDeleteSelected}>
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
  pre,
}: {
  label: string;
  value: string;
  mono?: boolean;
  pre?: boolean;
}) {
  return (
    <div>
      <dt className="text-[12px] text-[#8d99a6]">{label}</dt>
      <dd
        className={`mt-1 text-[14px] text-white ${mono ? "font-mono text-[13px]" : ""} ${
          pre ? "whitespace-pre-line" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative shrink-0">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 appearance-none rounded border border-[#687078] bg-[#0f141a] py-0 pr-8 pl-3 text-[14px] text-[#d5dbdb] outline-none focus:border-[#42b4ff]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2 text-[#42b4ff]" />
    </label>
  );
}
