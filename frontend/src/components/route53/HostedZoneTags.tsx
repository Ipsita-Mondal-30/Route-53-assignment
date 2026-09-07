"use client";

import { X } from "lucide-react";

import { InfoLink, type InfoTopic } from "@/components/route53/HostedZoneInfoPanel";
import type { ZoneTag } from "@/lib/mock/types";

const MAX_TAGS = 50;

type Props = {
  tags: ZoneTag[];
  onChange: (tags: ZoneTag[]) => void;
  onOpenInfo: (topic: InfoTopic) => void;
};

export function HostedZoneTags({ tags, onChange, onOpenInfo }: Props) {
  const remaining = MAX_TAGS - tags.length;

  function addTag() {
    if (tags.length >= MAX_TAGS) {
      return;
    }
    onChange([...tags, { key: "", value: "" }]);
  }

  function updateTag(index: number, patch: Partial<ZoneTag>) {
    onChange(tags.map((tag, i) => (i === index ? { ...tag, ...patch } : tag)));
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  return (
    <section className="hz-form-card">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-[18px] leading-6 font-bold text-white">Tags</h2>
        <InfoLink onClick={() => onOpenInfo("tags")} />
      </div>
      <p className="mt-2 text-[14px] leading-5 text-[#aab7b8]">
        Apply tags to hosted zones to help organize and identify them.
      </p>

      {tags.length === 0 ? (
        <p className="mt-5 text-[14px] leading-5 font-bold text-white">
          No tags associated with the resource.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          <div className="hidden grid-cols-[1fr_1fr_40px] gap-3 text-[12px] font-bold text-[#aab7b8] sm:grid">
            <span>Key</span>
            <span>Value</span>
            <span className="sr-only">Remove</span>
          </div>
          {tags.map((tag, index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_40px] sm:items-center sm:gap-3"
            >
              <label className="block">
                <span className="mb-1 block text-[12px] text-[#aab7b8] sm:hidden">Key</span>
                <input
                  value={tag.key}
                  onChange={(event) => updateTag(index, { key: event.target.value })}
                  placeholder="Key"
                  className="console-input"
                  maxLength={128}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[12px] text-[#aab7b8] sm:hidden">
                  Value
                </span>
                <input
                  value={tag.value}
                  onChange={(event) => updateTag(index, { value: event.target.value })}
                  placeholder="Value"
                  className="console-input"
                  maxLength={256}
                />
              </label>
              <button
                type="button"
                aria-label={`Remove tag ${index + 1}`}
                onClick={() => removeTag(index)}
                className="inline-flex h-8 w-8 items-center justify-center self-end rounded text-[#aab7b8] hover:bg-white/5 hover:text-white sm:self-auto"
              >
                <X className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5">
        <button
          type="button"
          className="hz-add-tag-btn"
          onClick={addTag}
          disabled={tags.length >= MAX_TAGS}
        >
          Add tag
        </button>
        <p className="mt-2 text-[12px] leading-4 text-[#8d99a6]">
          You can add up to {remaining} more tag{remaining === 1 ? "" : "s"}.
        </p>
      </div>
    </section>
  );
}
