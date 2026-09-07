"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  HostedZoneConfiguration,
  focusDomainInput,
} from "@/components/route53/HostedZoneConfiguration";
import { HostedZoneFormActions } from "@/components/route53/HostedZoneFormActions";
import {
  HostedZoneInfoPanel,
  InfoLink,
  type InfoTopic,
} from "@/components/route53/HostedZoneInfoPanel";
import { HostedZoneTags } from "@/components/route53/HostedZoneTags";
import { ApiError } from "@/lib/api";
import {
  isValidDomainName,
  normalizeDomainName,
} from "@/lib/mock/hosted-zones";
import type { HostedZoneType, ZoneTag } from "@/lib/mock/types";
import { useRoute53Store } from "@/lib/mock/store";

export function CreateHostedZoneView() {
  const router = useRouter();
  const { createZone, zones } = useRoute53Store();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<HostedZoneType>("Public");
  const [tags, setTags] = useState<ZoneTag[]>([]);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [infoTopic, setInfoTopic] = useState<InfoTopic | null>(null);

  function openInfo(topic: InfoTopic) {
    setInfoTopic(topic);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const domain = normalizeDomainName(name);
    if (!domain) {
      setDomainError("Domain name is required.");
      focusDomainInput();
      return;
    }
    if (!isValidDomainName(domain)) {
      setDomainError("Enter a valid domain name, such as example.com.");
      focusDomainInput();
      return;
    }
    if (zones.some((zone) => zone.name === domain)) {
      setDomainError(`A hosted zone already exists for ${domain}.`);
      focusDomainInput();
      return;
    }

    setSubmitting(true);
    setDomainError(null);
    try {
      const zone = await createZone({
        name: domain,
        description: description.slice(0, 256),
        type,
        tags,
        createdBy: "Route 53",
      });
      try {
        sessionStorage.setItem(`route53.zone.created.${zone.id}`, "1");
      } catch {
        /* ignore */
      }
      router.push(`/hosted-zones/${zone.id}`);
    } catch (err) {
      setDomainError(
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : "Failed to create hosted zone",
      );
      focusDomainInput();
      setSubmitting(false);
    }
  }

  const panelHeight =
    "h-[calc(100dvh-var(--nav-h)-var(--crumb-h)-var(--footer-h))]";

  return (
    <div className="-mx-4 -my-5 flex min-h-[calc(100%+2.5rem)] sm:-mx-5 lg:-mx-6">
      <form onSubmit={(event) => void onSubmit(event)} className="min-w-0 flex-1 overflow-auto px-4 py-5 sm:px-5 lg:px-6">
        <div className="mb-4 flex flex-wrap items-baseline gap-2">
          <h1 className="text-[20px] leading-7 font-bold text-white sm:text-[24px]">
            Create hosted zone
          </h1>
          <InfoLink onClick={() => openInfo("create")} />
        </div>

        <div className="space-y-5">
          <HostedZoneConfiguration
            domainName={name}
            description={description}
            type={type}
            domainError={domainError}
            onDomainChange={(value) => {
              setName(value);
              setDomainError(null);
            }}
            onDescriptionChange={setDescription}
            onTypeChange={setType}
            onOpenInfo={openInfo}
          />

          <HostedZoneTags tags={tags} onChange={setTags} onOpenInfo={openInfo} />

          <HostedZoneFormActions submitting={submitting} />
        </div>
      </form>

      {infoTopic ? (
        <>
          <button
            type="button"
            aria-label="Close info panel"
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setInfoTopic(null)}
          />
          <div
            className={`fixed top-[calc(var(--nav-h)+var(--crumb-h))] right-0 z-50 w-[min(100%,400px)] ${panelHeight} lg:sticky lg:top-0 lg:z-auto lg:w-[360px] xl:w-[400px]`}
          >
            <HostedZoneInfoPanel
              topic={infoTopic}
              onClose={() => setInfoTopic(null)}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
