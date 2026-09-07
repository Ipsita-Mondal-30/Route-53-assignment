"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ConsoleButton } from "@/components/console/console-button";
import { ConsoleCard, ConsoleCardTitle } from "@/components/console/console-card";
import { SearchIcon } from "@/components/console/console-icons";
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

export function HostedZoneDetailView({ zoneId }: { zoneId: string }) {
  const router = useRouter();
  const { getZone, getRecords, createRecord, updateRecord, deleteRecord, hydrated } =
    useRoute53Store();
  const zone = getZone(zoneId);
  const records = getRecords(zoneId);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | RecordType>("all");
  const [editing, setEditing] = useState<DnsRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DnsRecord | null>(null);

  const filtered = useMemo(() => {
    return records.filter((record) => {
      const matchesType = typeFilter === "all" || record.type === typeFilter;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        record.name.toLowerCase().includes(q) ||
        record.value.toLowerCase().includes(q) ||
        record.type.toLowerCase().includes(q);
      return matchesType && matchesQuery;
    });
  }, [query, records, typeFilter]);

  if (hydrated && !zone) {
    return (
      <div>
        <h1 className="text-[20px] font-bold text-[var(--c-text-heading)]">
          Hosted zone not found
        </h1>
        <p className="mt-2 text-[14px]">The requested hosted zone does not exist in this demo.</p>
        <div className="mt-4">
          <ConsoleButton href="/hosted-zones">Back to hosted zones</ConsoleButton>
        </div>
      </div>
    );
  }

  function openCreate() {
    setCreating(true);
    setEditing(null);
    setForm({
      ...emptyForm,
      name: zone?.name ?? "",
    });
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

  const showForm = creating || editing;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="text-[20px] leading-7 font-bold text-[var(--c-text-heading)] sm:text-[24px]">
              {zone?.name ?? "Hosted zone"}
            </h1>
            <button
              type="button"
              className="text-[14px] text-[#42b4ff] hover:underline"
              onClick={() => router.push("/hosted-zones")}
            >
              Hosted zones
            </button>
          </div>
        </div>
        <ConsoleButton href="/hosted-zones/new" variant="primary">
          Create hosted zone
        </ConsoleButton>
      </div>

      <ConsoleCard className="mb-4">
        <ConsoleCardTitle>Hosted zone details</ConsoleCardTitle>
        <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Domain name" value={zone?.name ?? "—"} />
          <Detail label="Hosted zone ID" value={zone?.id ?? "—"} mono />
          <Detail label="Type" value={zone?.type ?? "—"} />
          <Detail label="Description" value={zone?.description || "—"} />
        </dl>
      </ConsoleCard>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[18px] font-bold text-[var(--c-text-heading)]">Records</h2>
        <ConsoleButton onClick={openCreate} variant="primary">
          Create record
        </ConsoleButton>
      </div>

      {showForm ? (
        <ConsoleCard className="mb-4">
          <ConsoleCardTitle>{editing ? "Edit record" : "Create record"}</ConsoleCardTitle>
          <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Record name">
              <input
                className="console-input"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </Field>
            <Field label="Record type">
              <select
                className="console-input"
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({ ...current, type: event.target.value as RecordType }))
                }
              >
                {RECORD_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Value" className="md:col-span-2">
              <textarea
                className="console-input h-20 py-2"
                value={form.value}
                onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
              />
            </Field>
            <Field label="TTL (seconds)">
              <input
                className="console-input"
                value={form.ttl}
                onChange={(event) => setForm((current) => ({ ...current, ttl: event.target.value }))}
              />
            </Field>
            <Field label="Routing policy">
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
            </Field>
            {error ? (
              <p className="md:col-span-2 text-[14px] text-[#eb6f6f]" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <ConsoleButton type="button" onClick={closeForm}>
                Cancel
              </ConsoleButton>
              <ConsoleButton type="submit" variant="primary">
                {editing ? "Save record" : "Create record"}
              </ConsoleButton>
            </div>
          </form>
        </ConsoleCard>
      ) : null}

      <ConsoleCard padding={false}>
        <div className="flex flex-col gap-3 border-b border-[var(--c-border-subtle)] p-4 md:flex-row md:items-center">
          <label className="relative block w-full max-w-md">
            <span className="sr-only">Search records</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#8d99a6]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              className="console-input pl-8"
            />
          </label>
          <label className="flex items-center gap-2 text-[13px]">
            <span className="text-[#8d99a6]">Filter</span>
            <select
              className="console-input w-auto min-w-[120px]"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as "all" | RecordType)
              }
            >
              <option value="all">All record types</option>
              {RECORD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="console-table-wrap">
          <table className="console-table">
            <thead>
              <tr>
                <th>Record name</th>
                <th>Type</th>
                <th>Value</th>
                <th>TTL</th>
                <th>Routing policy</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#8d99a6]">
                    No records to display
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr key={record.id}>
                    <td className="whitespace-nowrap">{record.name}</td>
                    <td>{record.type}</td>
                    <td className="max-w-[320px]">
                      <span className="block truncate whitespace-pre-line">{record.value}</span>
                    </td>
                    <td>{record.ttl}</td>
                    <td>{record.routingPolicy}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-[13px] text-[#42b4ff] hover:underline"
                          onClick={() => openEdit(record)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-[13px] text-[#eb6f6f] hover:underline"
                          onClick={() => setPendingDelete(record)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ConsoleCard>

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-[var(--c-border)] bg-[var(--c-bg)] p-5">
            <h3 className="text-[16px] font-bold text-[var(--c-text-heading)]">Delete record</h3>
            <p className="mt-2 text-[14px]">
              Delete {pendingDelete.type} record {pendingDelete.name}? This action is
              simulated and only updates local demo data.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <ConsoleButton onClick={() => setPendingDelete(null)}>Cancel</ConsoleButton>
              <ConsoleButton
                variant="primary"
                onClick={() => {
                  deleteRecord(pendingDelete.id);
                  setPendingDelete(null);
                }}
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

function Detail({
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
      <dt className="text-[12px] text-[#8d99a6]">{label}</dt>
      <dd className={`mt-0.5 text-[14px] text-[var(--c-text-heading)] ${mono ? "font-mono text-[13px]" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-[14px] font-bold text-[var(--c-text-heading)]">
        {label}
      </span>
      {children}
    </label>
  );
}
