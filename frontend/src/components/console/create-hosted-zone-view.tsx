"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { ConsoleButton } from "@/components/console/console-button";
import { ConsoleCard, ConsoleCardTitle } from "@/components/console/console-card";
import { normalizeDomainName } from "@/lib/mock/hosted-zones";
import type { HostedZoneType } from "@/lib/mock/types";
import { useRoute53Store } from "@/lib/mock/store";

export function CreateHostedZoneView() {
  const router = useRouter();
  const { createZone, zones } = useRoute53Store();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<HostedZoneType>("Public");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const domain = normalizeDomainName(name);
    if (!domain) {
      setError("Enter a domain name.");
      return;
    }
    if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/.test(domain)) {
      setError("Enter a valid domain name, such as example.com.");
      return;
    }
    if (zones.some((zone) => zone.name === domain)) {
      setError(`A hosted zone already exists for ${domain}.`);
      return;
    }
    const zone = createZone({ name: domain, description, type });
    router.push(`/hosted-zones/${zone.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-4xl">
      <div className="mb-4">
        <h1 className="text-[20px] leading-7 font-bold text-[var(--c-text-heading)] sm:text-[24px]">
          Create hosted zone
        </h1>
        <p className="mt-1 text-[14px] leading-5">
          Create a container for records that specify how you want to route traffic for a
          domain.
        </p>
      </div>

      <ConsoleCard className="mb-4">
        <ConsoleCardTitle>Domain name</ConsoleCardTitle>
        <label className="mt-3 block text-[14px] font-bold text-[var(--c-text-heading)]">
          Domain name <span className="text-[#eb6f6f]">*</span>
        </label>
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError(null);
          }}
          className="console-input mt-1 max-w-xl"
          placeholder="example.com"
        />
        <p className="mt-2 text-[12px] text-[var(--c-text-muted)]">
          The domain name that you want to route traffic for. You cannot change this
          after you create the hosted zone.
        </p>

        <label className="mt-5 block text-[14px] font-bold text-[var(--c-text-heading)]">
          Description
        </label>
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="console-input mt-1 max-w-xl"
        />
        <p className="mt-2 text-[12px] text-[var(--c-text-muted)]">
          Optional comment that describes this hosted zone.
        </p>
      </ConsoleCard>

      <ConsoleCard className="mb-4">
        <ConsoleCardTitle>Hosted zone type</ConsoleCardTitle>
        <fieldset className="mt-3 space-y-3">
          <legend className="sr-only">Hosted zone type</legend>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="radio"
              name="zone-type"
              checked={type === "Public"}
              onChange={() => setType("Public")}
              className="mt-1 accent-[#42b4ff]"
            />
            <span>
              <span className="block font-bold text-[var(--c-text-heading)]">
                Public hosted zone
              </span>
              <span className="block text-[13px] text-[var(--c-text-muted)]">
                Route traffic on the internet. Use a public hosted zone when you want to
                route queries for a publicly available domain.
              </span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="radio"
              name="zone-type"
              checked={type === "Private"}
              onChange={() => setType("Private")}
              className="mt-1 accent-[#42b4ff]"
            />
            <span>
              <span className="block font-bold text-[var(--c-text-heading)]">
                Private hosted zone
              </span>
              <span className="block text-[13px] text-[var(--c-text-muted)]">
                Route traffic within one or more VPCs. VPC association is simulated in
                this demo.
              </span>
            </span>
          </label>
        </fieldset>
      </ConsoleCard>

      {error ? (
        <p className="mb-4 text-[14px] text-[#eb6f6f]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <ConsoleButton href="/hosted-zones">Cancel</ConsoleButton>
        <ConsoleButton type="submit" variant="primary">
          Create hosted zone
        </ConsoleButton>
      </div>
    </form>
  );
}
