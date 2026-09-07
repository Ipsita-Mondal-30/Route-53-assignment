"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Settings,
  X,
} from "lucide-react";

import { ConsoleButton } from "@/components/console/console-button";
import type { DnsRecord, RecordType, RoutingPolicy } from "@/lib/mock/types";

export type RecordFormState = {
  name: string;
  type: RecordType;
  value: string;
  ttl: string;
  routingPolicy: RoutingPolicy;
  alias: boolean;
};

export type RecordPanelMode = "details" | "edit";

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

const ROUTING_LABELS: Record<RoutingPolicy, string> = {
  Simple: "Simple routing",
  Weighted: "Weighted routing",
  Latency: "Latency routing",
  Failover: "Failover routing",
  Geolocation: "Geolocation routing",
  Multivalue: "Multivalue answer routing",
};

const TTL_PRESETS = [
  { label: "1m", seconds: 60 },
  { label: "1h", seconds: 3600 },
  { label: "1d", seconds: 86400 },
] as const;

type Props = {
  selected: DnsRecord[];
  mode: RecordPanelMode;
  form: RecordFormState;
  error: string | null;
  saving?: boolean;
  onCollapse: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onFormChange: (patch: Partial<RecordFormState>) => void;
  onSave: (event: FormEvent) => void;
};

export function RecordDetailsPanel({
  selected,
  mode,
  form,
  error,
  saving = false,
  onCollapse,
  onEdit,
  onCancelEdit,
  onFormChange,
  onSave,
}: Props) {
  const record = selected.length === 1 ? selected[0] : null;
  const title = mode === "edit" && record ? "Edit record" : "Record details";

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (mode === "edit") {
          onCancelEdit();
        } else {
          onCollapse();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, onCancelEdit, onCollapse]);

  return (
    <>
      <button
        type="button"
        aria-label="Close record panel"
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onCollapse}
      />
      <aside
        className="rd-panel fixed top-[calc(var(--nav-h)+var(--crumb-h))] right-0 z-50 flex h-[calc(100dvh-var(--nav-h)-var(--crumb-h)-var(--footer-h))] w-[min(100%,420px)] shrink-0 flex-col overflow-hidden border-l border-[#687078] bg-[#161d27] lg:sticky lg:top-0 lg:z-auto lg:h-[calc(100dvh-var(--nav-h)-var(--crumb-h)-var(--footer-h))] lg:w-[400px]"
        aria-label={title}
      >
        <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-[#2a313c] px-5">
          <h2 className="text-[18px] leading-6 font-bold text-white">{title}</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Panel settings"
              className="inline-flex h-8 w-8 items-center justify-center text-[#d5dbdb] hover:text-white"
            >
              <Settings className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <button
              type="button"
              aria-label="Collapse record panel"
              className="inline-flex h-8 w-8 items-center justify-center text-[#d5dbdb] hover:text-white"
              onClick={onCollapse}
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </div>
        </div>

        {record && mode === "details" ? (
          <DetailsBody record={record} onEdit={onEdit} />
        ) : record && mode === "edit" ? (
          <EditBody
            record={record}
            form={form}
            error={error}
            onFormChange={onFormChange}
            onCancelEdit={onCancelEdit}
            onSave={onSave}
            saving={saving}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center px-6 text-center text-[14px] leading-[22px] text-[#aab7b8]">
            {selected.length} records selected. Select a single record to view
            details.
          </div>
        )}
      </aside>
    </>
  );
}

function DetailsBody({
  record,
  onEdit,
}: {
  record: DnsRecord;
  onEdit: () => void;
}) {
  const values = record.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
      <ConsoleButton variant="normal" className="font-bold!" onClick={onEdit}>
        Edit record
      </ConsoleButton>

      <dl className="mt-5 space-y-5">
        <DetailField label="Record name">
          <span className="inline-flex items-start gap-1.5 text-[14px] leading-5 text-white">
            {record.name}
            <CopyButton text={record.name} />
          </span>
        </DetailField>
        <DetailField label="Record type">
          <span className="text-[14px] leading-5 text-white">{record.type}</span>
        </DetailField>
        <DetailField label="Value">
          <div className="space-y-1">
            {values.map((value) => (
              <div
                key={value}
                className="flex items-start gap-1.5 text-[14px] leading-5 break-all text-white"
              >
                <span>{value}</span>
                <CopyButton text={value} />
              </div>
            ))}
          </div>
        </DetailField>
        <DetailField label="Alias">
          <span className="text-[14px] leading-5 text-white">No</span>
        </DetailField>
        <DetailField label="TTL (seconds)">
          <span className="text-[14px] leading-5 text-white">
            {record.ttl.toLocaleString("en-US")}
          </span>
        </DetailField>
        <DetailField label="Routing policy">
          <span className="text-[14px] leading-5 text-white">
            {record.routingPolicy === "Simple" ? "Simple" : record.routingPolicy}
          </span>
        </DetailField>
      </dl>
    </div>
  );
}

function EditBody({
  record,
  form,
  error,
  onFormChange,
  onCancelEdit,
  onSave,
  saving,
}: {
  record: DnsRecord;
  form: RecordFormState;
  error: string | null;
  onFormChange: (patch: Partial<RecordFormState>) => void;
  onCancelEdit: () => void;
  onSave: (event: FormEvent) => void;
  saving?: boolean;
}) {
  const [warningOpen, setWarningOpen] = useState(true);
  const locked = record.type === "NS" || record.type === "SOA";

  return (
    <form onSubmit={onSave} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {warningOpen && record.type === "NS" ? (
          <div className="rd-warning mb-5">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-[#f4d03f]"
              strokeWidth={2.25}
            />
            <div className="min-w-0 flex-1 text-[14px] leading-[22px] text-[#eaeded]">
              <p>
                Amazon Route 53 automatically creates a unique set of four name
                servers (a delegation set) for each hosted zone. If you change
                the name servers in this NS record, DNS resolvers might not be
                able to find your hosted zone, and your domain might become
                unavailable on the internet.{" "}
                <a href="#" className="inline-flex items-center gap-1 font-bold text-[#42b4ff] hover:underline">
                  Learn more
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.25} />
                </a>
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss warning"
              className="shrink-0 text-[#d5dbdb] hover:text-white"
              onClick={() => setWarningOpen(false)}
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        ) : null}

        {warningOpen && record.type === "SOA" ? (
          <div className="rd-warning mb-5">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-[#f4d03f]"
              strokeWidth={2.25}
            />
            <p className="min-w-0 flex-1 text-[14px] leading-[22px] text-[#eaeded]">
              The SOA record identifies the hosted zone. Changing this record
              can cause unexpected DNS behavior.
            </p>
            <button
              type="button"
              aria-label="Dismiss warning"
              className="shrink-0 text-[#d5dbdb] hover:text-white"
              onClick={() => setWarningOpen(false)}
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        ) : null}

        <div className="space-y-5">
          <div>
            <p className="text-[14px] leading-5 font-bold text-white">Record name</p>
            <p className="mt-1.5 text-[14px] leading-5 text-[#d5dbdb]">{form.name}</p>
          </div>

          <div>
            <p className="text-[14px] leading-5 font-bold text-white">Record type</p>
            {locked ? (
              <p className="mt-1.5 text-[14px] leading-5 text-[#d5dbdb]">
                {RECORD_TYPE_LABELS[form.type]}
              </p>
            ) : (
              <select
                className="console-input mt-1.5"
                value={form.type}
                onChange={(event) =>
                  onFormChange({ type: event.target.value as RecordType })
                }
              >
                {(Object.keys(RECORD_TYPE_LABELS) as RecordType[]).map((type) => (
                  <option key={type} value={type}>
                    {RECORD_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <p className="text-[14px] leading-5 font-bold text-white">Alias</p>
            <button
              type="button"
              role="switch"
              aria-checked={form.alias}
              aria-label="Alias"
              data-on={form.alias}
              className="rd-toggle mt-2"
              onClick={() => onFormChange({ alias: !form.alias })}
            />
          </div>

          <label className="block">
            <span className="text-[14px] leading-5 font-bold text-white">Value</span>
            <textarea
              className="console-input mt-1.5 h-[148px] resize-y py-2 font-mono text-[13px] leading-5"
              value={form.value}
              onChange={(event) => onFormChange({ value: event.target.value })}
            />
            <span className="mt-1.5 block text-[12px] leading-4 text-[#aab7b8]">
              Enter multiple values on separate lines.
            </span>
          </label>

          <div>
            <span className="text-[14px] leading-5 font-bold text-white">
              TTL (seconds)
            </span>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <input
                className="console-input max-w-[160px]"
                value={form.ttl}
                onChange={(event) => onFormChange({ ttl: event.target.value })}
              />
              {TTL_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="rd-ttl-chip"
                  onClick={() => onFormChange({ ttl: String(preset.seconds) })}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <span className="mt-1.5 block text-[12px] leading-4 text-[#aab7b8]">
              Recommended values: 60 to 172800 (two days)
            </span>
          </div>

          <label className="block">
            <span className="text-[14px] leading-5 font-bold text-white">
              Routing policy
            </span>
            <select
              className="console-input mt-1.5"
              value={form.routingPolicy}
              onChange={(event) =>
                onFormChange({
                  routingPolicy: event.target.value as RoutingPolicy,
                })
              }
            >
              {(Object.keys(ROUTING_LABELS) as RoutingPolicy[]).map((policy) => (
                <option key={policy} value={policy}>
                  {ROUTING_LABELS[policy]}
                </option>
              ))}
            </select>
          </label>

          {error ? (
            <p className="text-[14px] text-[#eb6f6f]" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#2a313c] px-5 py-3">
        <ConsoleButton type="button" variant="link" onClick={onCancelEdit}>
          Cancel
        </ConsoleButton>
        <ConsoleButton type="submit" variant="orange" className="font-bold!" disabled={saving}>
          Save
        </ConsoleButton>
      </div>
    </form>
  );
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="text-[12px] leading-4 font-bold text-[#aab7b8]">{label}</dt>
      <dd className="mt-1.5">{children}</dd>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy"}
      className="rd-copy-btn"
      onClick={async (event) => {
        event.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      ) : (
        <Copy className="h-3.5 w-3.5" strokeWidth={2.25} />
      )}
    </button>
  );
}
