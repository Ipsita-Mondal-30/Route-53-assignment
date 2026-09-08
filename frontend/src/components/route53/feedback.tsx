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
    <section id="feedback" className="px-5 pb-8 md:px-8 md:pb-10">
      <div className="mx-auto flex max-w-[1450px] flex-col justify-between gap-5 rounded-[16px] bg-linear-to-r from-[#c4f0f8] via-[#8fb4f4] to-[#c7a6f5] px-6 py-5 sm:flex-row sm:items-center sm:gap-8 md:px-8 md:py-[22px]">
        <div className="min-w-0">
          <h2 className="text-[18px] leading-[1.3] font-bold text-[#161d26] md:text-[20px]">
            Did you find what you were looking for today?
          </h2>
          <p className="mt-1 text-[14px] leading-[1.4] text-[#161d26]">
            Let us know so we can improve the quality of the content on our
            pages
          </p>
        </div>
        <div className="flex shrink-0 gap-2.5">
          {options.map(({ value, label, Icon }) => {
            const isSelected = selected === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelected(value)}
                className={`aws-focus inline-flex h-10 items-center gap-2 rounded-full px-[18px] text-[14px] font-bold ${
                  isSelected
                    ? "bg-black text-white"
                    : "bg-[#161d26] text-white hover:bg-black"
                }`}
              >
                {label}
                <Icon className="h-[15px] w-[15px]" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
