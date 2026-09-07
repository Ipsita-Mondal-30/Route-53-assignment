"use client";

import { ChevronRight, ExternalLink, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export type InfoTopic =
  | "create"
  | "domain"
  | "description"
  | "type"
  | "tags";

type InfoContent = {
  title: string;
  intro: string;
  bullets: ReactNode[];
  learnMore: { label: string; href: string }[];
};

const CONTENT: Record<InfoTopic, InfoContent> = {
  create: {
    title: "Create hosted zone",
    intro:
      "Create a container for records that specify how you want to route traffic for a domain and its subdomains.",
    bullets: [
      <>
        A hosted zone has the same name as the corresponding domain or subdomain.
      </>,
      <>
        You can create a public hosted zone for internet traffic or a private hosted zone
        for traffic within an Amazon VPC.
      </>,
      <>
        After you create a hosted zone, you create records to tell Route 53 how you want
        to route traffic.
      </>,
    ],
    learnMore: [
      { label: "Working with hosted zones", href: "#" },
      { label: "Choosing between alias and non-alias records", href: "#" },
    ],
  },
  domain: {
    title: "Domain name",
    intro: "Enter the name of the domain that you want to route traffic for. Note the following:",
    bullets: [
      <>You can&apos;t change the name of a hosted zone after you create it.</>,
      <>
        The name is not case-sensitive, so <strong className="font-bold text-white">example.com</strong>{" "}
        is the same as <strong className="font-bold text-white">EXAMPLE.COM</strong>.
      </>,
      <>
        Except in rare cases, you don&apos;t specify the name of a subdomain, such as{" "}
        <strong className="font-bold text-white">www.example.com</strong>.
      </>,
      <>
        If the domain name contains characters other than a-z, 0-9, and - (hyphen), see{" "}
        <a
          href="#"
          className="inline-flex items-center gap-1 font-bold text-[#42b4ff] hover:underline"
        >
          DNS domain name format
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.25} />
        </a>
        .
      </>,
    ],
    learnMore: [
      { label: "Working with public hosted zones", href: "#" },
      { label: "Working with private hosted zones", href: "#" },
    ],
  },
  description: {
    title: "Description",
    intro:
      "Optionally enter a description that helps you distinguish this hosted zone from others.",
    bullets: [
      <>The description can have up to 256 characters.</>,
      <>
        Use a description when you have more than one hosted zone with the same domain
        name.
      </>,
      <>You can change the description after you create the hosted zone.</>,
    ],
    learnMore: [
      { label: "Working with hosted zones", href: "#" },
    ],
  },
  type: {
    title: "Type",
    intro:
      "The type indicates whether you want to route traffic on the internet or in an Amazon VPC.",
    bullets: [
      <>
        Choose <strong className="font-bold text-white">Public hosted zone</strong> to
        route traffic on the internet for a domain such as example.com.
      </>,
      <>
        Choose <strong className="font-bold text-white">Private hosted zone</strong> to
        route traffic within one or more Amazon VPCs.
      </>,
      <>You can&apos;t change the type after you create the hosted zone.</>,
    ],
    learnMore: [
      { label: "Working with public hosted zones", href: "#" },
      { label: "Working with private hosted zones", href: "#" },
    ],
  },
  tags: {
    title: "Tags",
    intro: "Apply tags to hosted zones to help organize and identify them.",
    bullets: [
      <>You can add up to 50 tags to a hosted zone.</>,
      <>Each tag consists of a key and an optional value.</>,
      <>Tag keys and values are case-sensitive.</>,
    ],
    learnMore: [
      { label: "Tagging Amazon Route 53 resources", href: "#" },
    ],
  },
};

type Props = {
  topic: InfoTopic;
  onClose: () => void;
};

export function HostedZoneInfoPanel({ topic, onClose }: Props) {
  const content = CONTENT[topic];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside
      className="flex h-full min-h-0 w-full flex-col border-l border-[#414d5c] bg-[#161d27] lg:w-[360px] xl:w-[400px]"
      aria-label={`${content.title} information`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#2a313c] px-5 py-4">
        <h2 className="text-[18px] leading-6 font-bold text-white">{content.title}</h2>
        <button
          type="button"
          aria-label="Close info panel"
          onClick={onClose}
          className="inline-flex h-8 w-8 items-center justify-center text-[#aab7b8] hover:text-white"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <p className="text-[14px] leading-[22px] text-[#d1d5db]">{content.intro}</p>

        <ul className="mt-4 list-disc space-y-3 pl-5 text-[14px] leading-[22px] text-[#d1d5db]">
          {content.bullets.map((bullet, index) => (
            <li key={index}>{bullet}</li>
          ))}
        </ul>

        <div className="mt-6 border-t border-[#2a313c] pt-5">
          <p className="text-[14px] leading-5 font-bold text-white">
            Was this content helpful?
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#539fe5] px-4 py-1.5 text-[14px] font-bold text-white hover:bg-[rgba(83,159,229,0.14)]"
            >
              <ThumbsUp className="h-4 w-4 text-[#42b4ff]" strokeWidth={2.25} />
              Yes
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#539fe5] px-4 py-1.5 text-[14px] font-bold text-white hover:bg-[rgba(83,159,229,0.14)]"
            >
              <ThumbsDown className="h-4 w-4 text-[#42b4ff]" strokeWidth={2.25} />
              No
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-[#2a313c] pt-5 pb-4">
          <div className="mb-3 flex items-center gap-1.5">
            <h3 className="text-[14px] leading-5 font-bold text-white">Learn more</h3>
            <ExternalLink className="h-3.5 w-3.5 text-white" strokeWidth={2.25} />
          </div>
          <ul className="space-y-2">
            {content.learnMore.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-[14px] font-bold text-[#42b4ff] hover:underline"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

export function InfoLink({
  onClick,
  children = "Info",
}: {
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[14px] font-bold text-[#42b4ff] hover:underline"
    >
      {children}
    </button>
  );
}
