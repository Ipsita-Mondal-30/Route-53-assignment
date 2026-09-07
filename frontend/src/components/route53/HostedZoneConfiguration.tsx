"use client";

import { HostedZoneTypeSelector } from "@/components/route53/HostedZoneTypeSelector";
import { InfoLink, type InfoTopic } from "@/components/route53/HostedZoneInfoPanel";
import type { HostedZoneType } from "@/lib/mock/types";

type Props = {
  domainName: string;
  description: string;
  type: HostedZoneType;
  domainError: string | null;
  onDomainChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTypeChange: (value: HostedZoneType) => void;
  onOpenInfo: (topic: InfoTopic) => void;
};

export function HostedZoneConfiguration({
  domainName,
  description,
  type,
  domainError,
  onDomainChange,
  onDescriptionChange,
  onTypeChange,
  onOpenInfo,
}: Props) {
  return (
    <section className="hz-form-card">
      <h2 className="text-[18px] leading-6 font-bold text-white">
        Hosted zone configuration
      </h2>
      <p className="mt-2 max-w-4xl text-[14px] leading-5 text-[#aab7b8]">
        A hosted zone is a container that holds information about how you want to route
        traffic for a domain, such as example.com, and its subdomains.
      </p>

      <div className="mt-6">
        <div className="flex flex-wrap items-baseline gap-2">
          <label
            htmlFor="hz-domain-name"
            className="text-[14px] leading-5 font-bold text-white"
          >
            Domain name
          </label>
          <InfoLink onClick={() => onOpenInfo("domain")} />
        </div>
        <p className="mt-1 text-[14px] leading-5 text-[#aab7b8]">
          This is the name of the domain that you want to route traffic for.
        </p>
        <input
          id="hz-domain-name"
          value={domainName}
          onChange={(event) => onDomainChange(event.target.value)}
          placeholder="example.com"
          className={`console-input mt-2 max-w-xl ${domainError ? "hz-input-error" : ""}`}
          aria-invalid={Boolean(domainError)}
          aria-describedby={
            domainError ? "hz-domain-error hz-domain-help" : "hz-domain-help"
          }
        />
        {domainError ? (
          <p id="hz-domain-error" className="hz-field-error" role="alert">
            {domainError}
          </p>
        ) : null}
        <p id="hz-domain-help" className="mt-2 text-[12px] leading-4 text-[#8d99a6]">
          Valid characters: a-z, 0-9, ! &quot; # $ % &amp; &apos; ( ) * + - / : ; &lt; = &gt;
          ? @ [ \ ] ^ _ ` {"{"} | {"}"} ~
        </p>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-baseline gap-2">
          <label
            htmlFor="hz-description"
            className="text-[14px] leading-5 font-bold text-white"
          >
            Description - optional
          </label>
          <InfoLink onClick={() => onOpenInfo("description")} />
        </div>
        <p className="mt-1 text-[14px] leading-5 text-[#aab7b8]">
          This value lets you distinguish hosted zones that have the same name.
        </p>
        <textarea
          id="hz-description"
          value={description}
          maxLength={256}
          onChange={(event) => onDescriptionChange(event.target.value.slice(0, 256))}
          placeholder="The hosted zone is used for..."
          rows={4}
          className="console-input mt-2 h-auto max-w-3xl resize-y py-2"
        />
        <p className="mt-1 max-w-3xl text-right text-[12px] leading-4 text-[#8d99a6]">
          The description can have up to 256 characters. {description.length}/256
        </p>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-[14px] leading-5 font-bold text-white">Type</span>
          <InfoLink onClick={() => onOpenInfo("type")} />
        </div>
        <p className="mt-1 mb-3 text-[14px] leading-5 text-[#aab7b8]">
          The type indicates whether you want to route traffic on the internet or in an
          Amazon VPC.
        </p>
        <HostedZoneTypeSelector value={type} onChange={onTypeChange} />
      </div>
    </section>
  );
}

export function focusDomainInput() {
  const input = document.getElementById("hz-domain-name") as HTMLInputElement | null;
  input?.focus();
}
