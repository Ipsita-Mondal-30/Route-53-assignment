"use client";

import { useState } from "react";

import { ThumbsDownIcon, ThumbsUpIcon } from "@/components/ui/icons";

const options = [
  { value: "yes", label: "Yes", Icon: ThumbsUpIcon },
  { value: "no", label: "No", Icon: ThumbsDownIcon },
] as const;

export function Feedback() {
  const [selected, setSelected] = useState<(typeof options)[number]["value"] | null>(
    null,
  );

  return (
    <section id="feedback" className="px-5 pb-10 md:px-8 md:pb-14">
      <div className="mx-auto max-w-[1450px] overflow-hidden rounded-2xl bg-linear-to-r from-[#9fe7f5] via-[#6ea8f0] to-[#b9a4f0] px-6 py-8 md:px-10 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-[22px] font-bold text-aws-ink md:text-[26px]">
              Did you find what you were looking for today?
            </h2>
            <p className="mt-2 text-[15px] text-aws-ink">
              Let us know so we can improve the quality of the content on our
              pages
            </p>
          </div>
          <div className="flex gap-3">
            {options.map(({ value, label, Icon }) => {
              const isSelected = selected === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelected(value)}
                  className={`aws-focus inline-flex h-11 items-center gap-2 rounded-full px-5 text-[15px] font-bold ${
                    isSelected
                      ? "bg-black text-white"
                      : "bg-aws-ink text-white hover:bg-black"
                  }`}
                >
                  {label}
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
