"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, ExternalLink, Info, Search, X } from "lucide-react";

import { InfoLink, type InfoTopic } from "@/components/route53/HostedZoneInfoPanel";
import {
  AWS_REGIONS,
  regionByCode,
  vpcsForRegion,
} from "@/lib/mock/vpcs";

export type VpcAssociation = {
  id: string;
  region: string;
  vpcId: string;
};

type Props = {
  associations: VpcAssociation[];
  onChange: (associations: VpcAssociation[]) => void;
  onOpenInfo: (topic: InfoTopic) => void;
  error?: string | null;
};

export function emptyVpcAssociation(): VpcAssociation {
  return {
    id: `vpc-row-${Math.random().toString(36).slice(2, 9)}`,
    region: "",
    vpcId: "",
  };
}

export function PrivateZoneVpcAssociation({
  associations,
  onChange,
  onOpenInfo,
  error,
}: Props) {
  const [alertOpen, setAlertOpen] = useState(true);

  function updateRow(id: string, patch: Partial<VpcAssociation>) {
    onChange(
      associations.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function removeRow(id: string) {
    if (associations.length <= 1) {
      onChange([{ ...associations[0], region: "", vpcId: "" }]);
      return;
    }
    onChange(associations.filter((row) => row.id !== id));
  }

  function addRow() {
    onChange([...associations, emptyVpcAssociation()]);
  }

  return (
    <section className="hz-form-card">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-[18px] leading-6 font-bold text-white">
          VPCs to associate with the hosted zone
        </h2>
        <InfoLink onClick={() => onOpenInfo("vpc")} />
      </div>
      <p className="mt-2 max-w-4xl text-[14px] leading-5 text-[#aab7b8]">
        To use this hosted zone to resolve DNS queries for one or more VPCs, choose the
        VPCs. To associate a VPC with a hosted zone when the VPC was created using a
        different AWS account, you must use a programmatic method, such as the AWS CLI.
      </p>

      {alertOpen ? (
        <div className="hz-info-alert mt-5" role="status">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-[#42b4ff]"
            strokeWidth={2.25}
          />
          <p className="min-w-0 flex-1 text-[14px] leading-5 text-[#d5dbdb]">
            For each VPC that you associate with a private hosted zone, you must set the
            Amazon VPC settings{" "}
            <a
              href="https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[13px] text-[#42b4ff] underline hover:text-[#6ec4ff]"
            >
              enableDnsHostnames
            </a>{" "}
            and{" "}
            <a
              href="https://docs.aws.amazon.com/vpc/latest/userguide/vpc-dns.html"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[13px] text-[#42b4ff] underline hover:text-[#6ec4ff]"
            >
              enableDnsSupport
              <ExternalLink className="h-3 w-3" strokeWidth={2.25} />
            </a>{" "}
            to true.
          </p>
          <button
            type="button"
            aria-label="Dismiss"
            className="shrink-0 text-[#aab7b8] hover:text-white"
            onClick={() => setAlertOpen(false)}
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      ) : null}

      <div className="mt-6 space-y-6">
        {associations.map((row) => (
          <VpcAssociationRow
            key={row.id}
            row={row}
            usedVpcIds={associations
              .filter((item) => item.id !== row.id)
              .map((item) => item.vpcId)
              .filter(Boolean)}
            onChange={(patch) => updateRow(row.id, patch)}
            onRemove={() => removeRow(row.id)}
            onOpenInfo={onOpenInfo}
          />
        ))}
      </div>

      {error ? (
        <p className="hz-field-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5">
        <button type="button" className="hz-add-tag-btn" onClick={addRow}>
          Add VPC
        </button>
      </div>
    </section>
  );
}

function VpcAssociationRow({
  row,
  usedVpcIds,
  onChange,
  onRemove,
  onOpenInfo,
}: {
  row: VpcAssociation;
  usedVpcIds: string[];
  onChange: (patch: Partial<VpcAssociation>) => void;
  onRemove: () => void;
  onOpenInfo: (topic: InfoTopic) => void;
}) {
  const region = regionByCode(row.region);
  const vpcs = vpcsForRegion(row.region).filter(
    (vpc) => vpc.id === row.vpcId || !usedVpcIds.includes(vpc.id),
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
          <span className="text-[14px] leading-5 font-bold text-white">Region</span>
          <InfoLink onClick={() => onOpenInfo("vpc")} />
        </div>
        <SearchableSelect
          placeholder="Choose region"
          value={row.region}
          display={region?.name}
          options={AWS_REGIONS.map((item) => ({
            value: item.code,
            label: item.name,
            hint: item.code,
          }))}
          onChange={(regionCode) => onChange({ region: regionCode, vpcId: "" })}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
          <span className="text-[14px] leading-5 font-bold text-white">VPC ID</span>
          <InfoLink onClick={() => onOpenInfo("vpc")} />
        </div>
        <SearchableSelect
          placeholder="Choose VPC"
          value={row.vpcId}
          display={row.vpcId || undefined}
          searchIcon
          emptyText="No VPCs found"
          options={vpcs.map((vpc) => ({
            value: vpc.id,
            label: vpc.id,
            hint: vpc.name,
          }))}
          onChange={(vpcId) => onChange({ vpcId })}
        />
      </div>
      <button type="button" className="hz-add-tag-btn shrink-0" onClick={onRemove}>
        Remove VPC
      </button>
    </div>
  );
}

type SelectOption = {
  value: string;
  label: string;
  hint?: string;
};

function SearchableSelect({
  placeholder,
  value,
  display,
  options,
  onChange,
  searchIcon = false,
  emptyText = "No matches",
}: {
  placeholder: string;
  value: string;
  display?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  searchIcon?: boolean;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return options;
    }
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        option.value.toLowerCase().includes(q) ||
        option.hint?.toLowerCase().includes(q),
    );
  }, [options, query]);

  useEffect(() => {
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
    }
  }, [open]);

  const shown = display || placeholder;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-8 w-full items-center gap-2 rounded border bg-[#0f141a] px-3 text-left text-[14px] leading-5 ${
          open
            ? "border-[#42b4ff] text-white shadow-[0_0_0_1px_#42b4ff]"
            : "border-[#687078] text-[#d5dbdb] hover:border-[#7d8998]"
        }`}
      >
        {searchIcon ? (
          <Search className="h-3.5 w-3.5 shrink-0 text-[#8d99a6]" strokeWidth={2.25} />
        ) : null}
        <span className={`min-w-0 flex-1 truncate ${display ? "text-white" : ""}`}>
          {shown}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-[#42b4ff] transition-transform ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={2.5}
        />
      </button>

      {open ? (
        <div className="absolute top-[calc(100%+4px)] right-0 left-0 z-40 overflow-hidden rounded border border-[#687078] bg-[#161d27] shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
          <div className="border-b border-[#2a313c] p-2">
            <label className="relative block">
              <span className="sr-only">Find</span>
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#8d99a6]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find"
                className="h-8 w-full rounded border border-[#687078] bg-[#0f141a] pr-2 pl-8 text-[13px] text-white outline-none placeholder:text-[#8d99a6] focus:border-[#42b4ff]"
              />
            </label>
          </div>
          <ul
            id={listId}
            role="listbox"
            className="max-h-[240px] overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-[13px] text-[#8d99a6]">{emptyText}</li>
            ) : (
              filtered.map((option) => (
                <li key={option.value} role="option" aria-selected={option.value === value}>
                  <button
                    type="button"
                    className={`flex w-full flex-col px-3 py-1.5 text-left ${
                      option.value === value
                        ? "bg-[#1a2838]"
                        : "hover:bg-[#1c2430]"
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <span className="text-[14px] leading-5 text-white">
                      {option.label}
                    </span>
                    {option.hint ? (
                      <span className="text-[12px] leading-4 text-[#aab7b8]">
                        {option.hint}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
