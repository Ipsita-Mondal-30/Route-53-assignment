"use client";

import { useId, useState } from "react";

import { MinusIcon, PlusIcon } from "@/components/ui/icons";

export type AccordionItem = {
  id: string;
  title: string;
  content: string;
};

type AccordionProps = {
  items: AccordionItem[];
};

export function Accordion({ items }: AccordionProps) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="border-b border-[#d5dbdb]">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;

        return (
          <div key={item.id} className="border-t border-[#d5dbdb]">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="aws-focus flex w-full items-start justify-between gap-6 py-6 text-left"
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                <span className="text-[18px] leading-7 font-semibold text-aws-text">
                  {item.title}
                </span>
                <span className="mt-0.5 shrink-0 text-aws-text">
                  {isOpen ? (
                    <MinusIcon className="h-7 w-7" />
                  ) : (
                    <PlusIcon className="h-7 w-7" />
                  )}
                  <span className="sr-only">
                    {isOpen ? "Collapse" : "Expand"}
                  </span>
                </span>
              </button>
            </h3>
            {isOpen ? (
              <p
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="pb-6 pr-12 text-[16px] leading-7 text-aws-text"
              >
                {item.content}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
