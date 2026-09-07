import Link from "next/link";

import { ChevronDownIcon, GlobeIcon } from "@/components/ui/icons";

const columns = [
  {
    heading: "Learn",
    links: [
      "What Is AWS?",
      "What Is Cloud Computing?",
      "What Is Agentic AI?",
      "Cloud Computing Concepts Hub",
      "AWS Cloud Security",
    ],
  },
  {
    heading: "Resources",
    links: [
      "Getting Started",
      "Training",
      "AWS Trust Center",
      "AWS Solutions Library",
      "Architecture Center",
    ],
  },
  {
    heading: "Developers",
    links: [
      "Builder Center",
      "SDKs & Tools",
      ".NET on AWS",
      "Python on AWS",
      "Java on AWS",
    ],
  },
  {
    heading: "Help",
    links: [
      "Contact Us",
      "File a Support Ticket",
      "AWS re:Post",
      "Knowledge Center",
      "AWS Support Overview",
    ],
  },
] as const;

export function AwsFooter() {
  return (
    <footer className="rounded-t-[28px] bg-aws-footer text-white">
      <div className="mx-auto max-w-[1450px] px-5 py-10 md:px-8 md:py-14">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/signup"
            className="aws-focus inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-[15px] font-bold text-aws-ink hover:bg-[#f2f3f3]"
          >
            Create an AWS account
          </Link>
          <a
            href="#"
            className="aws-focus inline-flex h-12 items-center gap-2 rounded-full border border-white/70 px-5 text-[15px] font-medium"
          >
            <GlobeIcon className="h-4 w-4" />
            English
            <ChevronDownIcon className="h-3 w-3" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
          {columns.map((column) => (
            <div key={column.heading}>
              <h2 className="mb-4 text-[16px] font-bold">{column.heading}</h2>
              <ul className="space-y-3">
                {column.links.map((label) => (
                  <li key={label}>
                    <a
                      href="#"
                      className="aws-focus text-[14px] leading-6 text-aws-footer-link hover:text-white hover:underline"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
