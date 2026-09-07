"use client";

import { FormEvent, useEffect, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Settings,
} from "lucide-react";

import { ConsoleButton } from "@/components/console/console-button";
import { PropertyFilterDropdown } from "@/components/console/property-filter-dropdown";
import { InfoLink } from "@/components/route53/HostedZoneInfoPanel";
import { SortChevronIcon } from "@/components/route53/icons";
import { ApiError } from "@/lib/api";
import type { RecordType, RoutingPolicy } from "@/lib/mock/types";
import { useRoute53Store } from "@/lib/mock/store";

type DraftRecord = {
  id: string;
  subdomain: string;
  type: RecordType;
  alias: boolean;
  value: string;
  ttl: string;
  routingPolicy: RoutingPolicy;
  open: boolean;
};

const WRITEABLE_TYPES: RecordType[] = [
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

const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  A: "A – Routes traffic to an IPv4 address and some AWS resources",
  AAAA: "AAAA – Routes traffic to an IPv6 address and some AWS resources",
  CNAME: "CNAME – Routes traffic to another domain name and to some AWS resources",
  MX: "MX – Specifies mail servers",
  TXT: "TXT – Used to verify email senders and for application-specific values",
  NS: "NS – Name servers for a hosted zone",
  SOA: "SOA – Start of authority information for a hosted zone",
  PTR: "PTR – Maps an IP address to a domain name",
  SRV: "SRV – An SRV record specifies locations of servers",
  CAA: "CAA – Specifies which CAs are allowed to issue certificates",
};

const ROUTING_OPTIONS: { value: RoutingPolicy; label: string }[] = [
  { value: "Simple", label: "Simple routing" },
  { value: "Weighted", label: "Weighted routing" },
  { value: "Latency", label: "Latency routing" },
  { value: "Failover", label: "Failover routing" },
  { value: "Geolocation", label: "Geolocation routing" },
  { value: "Multivalue", label: "Multivalue answer routing" },
];

const TTL_PRESETS = [
  { label: "1m", seconds: 60 },
  { label: "1h", seconds: 3600 },
  { label: "1d", seconds: 86400 },
] as const;

const TYPE_FILTER_OPTIONS = WRITEABLE_TYPES.map((type) => ({
  value: type,
  label: type,
}));

const ROUTING_FILTER_OPTIONS = ROUTING_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

const ALIAS_FILTER_OPTIONS = [
  { value: "yes", label: "Alias" },
  { value: "no", label: "Non-alias" },
];

function newDraft(): DraftRecord {
  return {
    id: `draft-${Math.random().toString(36).slice(2, 10)}`,
    subdomain: "",
    type: "A",
    alias: false,
    value: "",
    ttl: "300",
    routingPolicy: "Simple",
    open: true,
  };
}

function fullRecordName(subdomain: string, zoneName: string): string {
  const label = subdomain.trim().replace(/\.$/, "").toLowerCase();
  if (!label || label === zoneName) {
    return zoneName;
  }
  if (label.endsWith(`.${zoneName}`)) {
    return label;
  }
  return `${label}.${zoneName}`;
}

function valuePlaceholder(type: RecordType): string {
  switch (type) {
    case "AAAA":
      return "2001:0db8:85a3:0:0:8a2e:0370:7334";
    case "CNAME":
      return "hostname.example.com";
    case "MX":
      return "10 mail.example.com";
    case "TXT":
      return '"Sample Text"';
    case "NS":
      return "ns-1.example.com";
    case "PTR":
      return "hostname.example.com";
    case "SRV":
      return "10 5 5060 sip.example.com";
    case "CAA":
      return "0 issue letsencrypt.org";
    default:
      return "192.0.2.235";
  }
}

export function CreateRecordView({ zoneId }: { zoneId: string }) {
  const router = useRouter();
  const {
    ensureZone,
    getZone,
    getRecords,
    refreshRecords,
    createRecord,
    hydrated,
  } = useRoute53Store();
  const zone = getZone(zoneId);
  const records = getRecords(zoneId);

  const [drafts, setDrafts] = useState<DraftRecord[]>([newDraft()]);
  const [existingOpen, setExistingOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [routingFilter, setRoutingFilter] = useState("all");
  const [aliasFilter, setAliasFilter] = useState("all");
  const formId = useId();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMissing(false);

    (async () => {
      const loaded = await ensureZone(zoneId);
      if (cancelled) {
        return;
      }
      if (!loaded) {
        setMissing(true);
        setLoading(false);
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
                : "Failed to load existing records",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ensureZone, refreshRecords, zoneId]);

  const filteredExisting = useMemo(() => {
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

  function patchDraft(id: string, patch: Partial<DraftRecord>) {
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft)),
    );
  }

  function removeDraft(id: string) {
    setDrafts((current) => {
      if (current.length <= 1) {
        return [newDraft()];
      }
      return current.filter((draft) => draft.id !== id);
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!zone || submitting) {
      return;
    }

    for (const draft of drafts) {
      if (draft.alias) {
        setError("Alias records are not supported yet. Turn Alias off to continue.");
        return;
      }
      if (!draft.value.trim()) {
        setError("Enter a value for each record.");
        return;
      }
      const ttl = Number(draft.ttl);
      if (!Number.isFinite(ttl) || ttl < 0) {
        setError("Enter a valid TTL for each record.");
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      for (const draft of drafts) {
        await createRecord(zoneId, {
          name: fullRecordName(draft.subdomain, zone.name),
          type: draft.type,
          value: draft.value.trim(),
          ttl: Number(draft.ttl),
          routingPolicy: draft.routingPolicy,
        });
      }
      router.push(`/hosted-zones/${zoneId}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : "Failed to create records",
      );
      setSubmitting(false);
    }
  }

  if ((hydrated && missing) || (!loading && !zone && hydrated)) {
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

  if (loading && !zone) {
    return (
      <div className="py-16 text-center text-[14px] text-[#aab7b8]">
        Loading create record…
      </div>
    );
  }

  const zoneName = zone?.name ?? "";

  return (
    <div className="pb-8">
      <div className="mb-5 flex flex-wrap items-baseline gap-2">
        <h1 className="text-[24px] leading-8 font-bold text-white">Create record</h1>
        <InfoLink onClick={() => undefined} />
      </div>

      <form id={formId} onSubmit={(event) => void onSubmit(event)}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[18px] leading-6 font-bold text-white">
            Quick create record
          </h2>
          <button
            type="button"
            className="text-[14px] font-bold text-[#42b4ff] hover:underline"
          >
            Switch to wizard
          </button>
        </div>

        <div className="space-y-4">
          {drafts.map((draft, index) => (
            <section
              key={draft.id}
              className="overflow-hidden rounded-xl border border-[#545b64] bg-[#161d27]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[#414d5c] px-5 py-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-[16px] font-bold text-white"
                  onClick={() => patchDraft(draft.id, { open: !draft.open })}
                  aria-expanded={draft.open}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${draft.open ? "" : "-rotate-90"}`}
                    strokeWidth={2.5}
                  />
                  Record {index + 1}
                </button>
                <ConsoleButton
                  variant="normal"
                  className="!min-h-8 !rounded-full !px-4"
                  onClick={() => removeDraft(draft.id)}
                >
                  Delete
                </ConsoleButton>
              </div>

              {draft.open ? (
                <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-5 py-5 lg:grid-cols-2">
                  <div>
                    <div className="mb-1.5 flex items-baseline gap-2">
                      <span className="text-[14px] font-bold text-white">
                        Record name
                      </span>
                      <InfoLink onClick={() => undefined} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        className="console-input min-w-0 flex-1"
                        value={draft.subdomain}
                        placeholder="subdomain"
                        onChange={(event) =>
                          patchDraft(draft.id, { subdomain: event.target.value })
                        }
                      />
                      <span className="shrink-0 text-[14px] text-[#d5dbdb]">
                        .{zoneName}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-[18px] text-[#aab7b8]">
                      Keep blank to create a record for the root domain.
                    </p>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-baseline gap-2">
                      <span className="text-[14px] font-bold text-white">
                        Record type
                      </span>
                      <InfoLink onClick={() => undefined} />
                    </div>
                    <select
                      className="console-input"
                      value={draft.type}
                      onChange={(event) =>
                        patchDraft(draft.id, {
                          type: event.target.value as RecordType,
                        })
                      }
                    >
                      {WRITEABLE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {RECORD_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={draft.alias}
                        data-on={draft.alias ? "true" : "false"}
                        className="rd-toggle"
                        onClick={() =>
                          patchDraft(draft.id, { alias: !draft.alias })
                        }
                      />
                      <span className="text-[14px] font-bold text-white">Alias</span>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="mb-1.5 flex items-baseline gap-2">
                      <span className="text-[14px] font-bold text-white">Value</span>
                      <InfoLink onClick={() => undefined} />
                    </div>
                    <textarea
                      className="console-input h-[120px] resize-y py-2 font-mono text-[13px] leading-5"
                      value={draft.value}
                      placeholder={valuePlaceholder(draft.type)}
                      onChange={(event) =>
                        patchDraft(draft.id, { value: event.target.value })
                      }
                    />
                    <p className="mt-1.5 text-[12px] leading-[18px] text-[#aab7b8]">
                      Enter multiple values on separate lines.
                    </p>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-baseline gap-2">
                      <span className="text-[14px] font-bold text-white">
                        TTL (seconds)
                      </span>
                      <InfoLink onClick={() => undefined} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        className="console-input max-w-[200px]"
                        value={draft.ttl}
                        onChange={(event) =>
                          patchDraft(draft.id, { ttl: event.target.value })
                        }
                      />
                      {TTL_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          className="rd-ttl-chip"
                          onClick={() =>
                            patchDraft(draft.id, { ttl: String(preset.seconds) })
                          }
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[12px] leading-[18px] text-[#aab7b8]">
                      Recommended values: 60 to 172800 (two days)
                    </p>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-baseline gap-2">
                      <span className="text-[14px] font-bold text-white">
                        Routing policy
                      </span>
                      <InfoLink onClick={() => undefined} />
                    </div>
                    <select
                      className="console-input"
                      value={draft.routingPolicy}
                      onChange={(event) =>
                        patchDraft(draft.id, {
                          routingPolicy: event.target.value as RoutingPolicy,
                        })
                      }
                    >
                      {ROUTING_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}
            </section>
          ))}
        </div>

        <div className="mt-4 flex justify-center sm:justify-end">
          <button
            type="button"
            className="console-btn console-btn-secondary !min-h-8 !rounded-full !px-4 !font-bold"
            onClick={() => setDrafts((current) => [...current, newDraft()])}
          >
            Add another record
          </button>
        </div>

        {error ? (
          <p className="mt-4 text-[14px] text-[#eb6f6f]" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-3">
          <ConsoleButton
            type="button"
            variant="link"
            onClick={() => router.push(`/hosted-zones/${zoneId}`)}
          >
            Cancel
          </ConsoleButton>
          <ConsoleButton type="submit" variant="orange" disabled={submitting}>
            {submitting ? "Creating…" : "Create records"}
          </ConsoleButton>
        </div>
      </form>

      <section className="mt-8 overflow-hidden rounded-xl border border-[#545b64] bg-[#161d27]">
        <button
          type="button"
          className="flex w-full items-center gap-2 px-5 py-3.5 text-left text-[16px] font-bold text-white"
          onClick={() => setExistingOpen((value) => !value)}
          aria-expanded={existingOpen}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${existingOpen ? "" : "-rotate-90"}`}
            strokeWidth={2.5}
          />
          View existing records
        </button>

        {existingOpen ? (
          <div className="border-t border-[#414d5c] px-5 pt-4 pb-5">
            <p className="mb-4 text-[14px] leading-5 text-[#aab7b8]">
              The following table lists the existing records in {zoneName}.
            </p>

            <div className="mb-3 flex flex-wrap items-baseline gap-2">
              <h3 className="text-[18px] leading-6 font-bold text-white">
                Existing records ({records.length})
              </h3>
              <InfoLink onClick={() => undefined} />
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
                options={TYPE_FILTER_OPTIONS}
                widthClass="w-[160px]"
              />
              <PropertyFilterDropdown
                label="Routing policy"
                value={routingFilter}
                onChange={setRoutingFilter}
                options={ROUTING_FILTER_OPTIONS}
                widthClass="w-[200px]"
              />
              <PropertyFilterDropdown
                label="Alias"
                value={aliasFilter}
                onChange={setAliasFilter}
                options={ALIAS_FILTER_OPTIONS}
                widthClass="w-[140px]"
              />
              <div className="ml-auto flex items-center gap-0.5 text-[13px] text-[#d5dbdb]">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center text-[#aab7b8]"
                  aria-label="Previous page"
                  disabled
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded border border-[#687078] bg-[#0f141a] px-2 font-bold text-white">
                  1
                </span>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center text-[#aab7b8]"
                  aria-label="Next page"
                  disabled
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center text-[#aab7b8]"
                  aria-label="Table settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded border border-[#414d5c]">
              <table className="hz-table hz-records-table min-w-[1400px]">
                <thead>
                  <tr>
                    <th className="hz-check-col w-10">
                      <span className="sr-only">Select</span>
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
                      "Record ID",
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
                  {filteredExisting.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-10 text-center text-[#8d99a6]">
                        No records to display
                      </td>
                    </tr>
                  ) : (
                    filteredExisting.map((record) => (
                      <tr key={record.id}>
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Select ${record.name}`}
                            className="h-3.5 w-3.5 accent-[#42b4ff]"
                          />
                        </td>
                        <td className="whitespace-nowrap text-white">{record.name}</td>
                        <td className="text-white">{record.type}</td>
                        <td className="text-white">Simple</td>
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
                        <td className="font-mono text-[12px] text-white">-</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
