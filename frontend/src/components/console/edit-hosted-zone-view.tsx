"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ConsoleButton } from "@/components/console/console-button";
import { HostedZoneFormActions } from "@/components/route53/HostedZoneFormActions";
import {
  HostedZoneInfoPanel,
  InfoLink,
  type InfoTopic,
} from "@/components/route53/HostedZoneInfoPanel";
import { HostedZoneTags } from "@/components/route53/HostedZoneTags";
import { ApiError } from "@/lib/api";
import type { ZoneTag } from "@/lib/mock/types";
import { useRoute53Store } from "@/lib/mock/store";

export function EditHostedZoneView({ zoneId }: { zoneId: string }) {
  const router = useRouter();
  const { getZone, getRecords, ensureZone, updateZone, hydrated } = useRoute53Store();
  const zone = getZone(zoneId);
  const records = getRecords(zoneId);

  const [description, setDescription] = useState(zone?.description ?? "");
  const [tags, setTags] = useState<ZoneTag[]>(zone?.tags ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoneMissing, setZoneMissing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [infoTopic, setInfoTopic] = useState<InfoTopic | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setZoneMissing(false);

    (async () => {
      const loaded = await ensureZone(zoneId);
      if (cancelled) {
        return;
      }
      if (!loaded) {
        setZoneMissing(true);
        setLoading(false);
        return;
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [ensureZone, zoneId]);

  useEffect(() => {
    if (!zone) {
      return;
    }
    setDescription(zone.description);
    setTags(zone.tags);
    // Only hydrate when the zone identity changes, so typing is not overwritten.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone?.id]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!zone || submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await updateZone(zone.id, {
        description: description.slice(0, 256),
        tags,
      });
      try {
        sessionStorage.setItem(`route53.zone.updated.${zone.id}`, "1");
      } catch {
        /* ignore */
      }
      router.push(`/hosted-zones/${zone.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : "Failed to update hosted zone",
      );
      setSubmitting(false);
    }
  }

  if ((hydrated && zoneMissing) || (!loading && !zone && hydrated)) {
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

  if (!zone) {
    return (
      <div className="py-16 text-center text-[14px] text-[#aab7b8]">
        Loading hosted zone…
      </div>
    );
  }

  const recordCount = zone?.recordCount ?? records.length;
  const panelHeight =
    "h-[calc(100dvh-var(--nav-h)-var(--crumb-h)-var(--footer-h))]";

  return (
    <div className="-mx-4 -my-5 flex min-h-[calc(100%+2.5rem)] sm:-mx-5 lg:-mx-6">
      <form
        onSubmit={(event) => void onSubmit(event)}
        className="min-w-0 flex-1 overflow-auto px-4 py-5 sm:px-5 lg:px-6"
      >
        <div className="mb-4 flex flex-wrap items-baseline gap-2">
          <h1 className="text-[20px] leading-7 font-bold text-white sm:text-[24px]">
            Edit {zone?.name}
          </h1>
          <InfoLink onClick={() => setInfoTopic("edit")} />
        </div>

        {error ? (
          <p className="mb-4 text-[14px] text-[#eb6f6f]" role="alert">
            {error}
          </p>
        ) : null}

        <div className="space-y-5">
          <section className="hz-form-card">
            <h2 className="text-[18px] leading-6 font-bold text-white">
              Edit hosted zone
            </h2>
            <p className="mt-2 max-w-4xl text-[14px] leading-5 text-[#aab7b8]">
              A hosted zone is a container that holds information about how you want to
              route traffic for a domain, such as example.com, and its subdomains.
            </p>

            <div className="mt-6 space-y-5">
              <ReadOnlyField label="Domain name" value={zone?.name ?? "—"} />
              <ReadOnlyField
                label="Hosted zone ID"
                value={zone?.id ?? "—"}
                mono
              />
              <ReadOnlyField label="Record count" value={String(recordCount)} />
              <ReadOnlyField
                label="Type"
                value={`${zone?.type ?? "Public"} hosted zone`}
              />
            </div>

            <div className="mt-6">
              <div className="flex flex-wrap items-baseline gap-2">
                <label
                  htmlFor="hz-edit-description"
                  className="text-[14px] leading-5 font-bold text-white"
                >
                  Description - optional
                </label>
                <InfoLink onClick={() => setInfoTopic("description")} />
              </div>
              <p className="mt-1 text-[14px] leading-5 text-[#aab7b8]">
                This value lets you distinguish hosted zones that have the same name.
              </p>
              <textarea
                id="hz-edit-description"
                value={description}
                maxLength={256}
                onChange={(event) =>
                  setDescription(event.target.value.slice(0, 256))
                }
                rows={5}
                className="console-input mt-2 h-[112px] w-full resize-y py-2"
              />
              <p className="mt-1 text-[12px] leading-4 text-[#8d99a6]">
                The description can have up to 256 characters. {description.length}/256
              </p>
            </div>
          </section>

          <HostedZoneTags
            tags={tags}
            onChange={setTags}
            onOpenInfo={setInfoTopic}
          />

          <HostedZoneFormActions
            submitting={submitting}
            onCancelHref={`/hosted-zones/${zoneId}`}
            submitLabel="Save changes"
          />
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

function ReadOnlyField({
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
      <dt className="text-[14px] leading-5 font-bold text-white">{label}</dt>
      <dd
        className={`mt-1 text-[14px] leading-5 text-[#d1d5db] ${
          mono ? "font-mono text-[13px]" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
