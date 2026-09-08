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
      "What's New",
      "Blogs",
      "Press Releases",
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
      "Product and Technical FAQs",
      "Analyst Reports",
      "AWS Partners",
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
      "PHP on AWS",
      "JavaScript on AWS",
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
      "AWS Accessibility",
      "Legal",
      "Event Code of Conduct",
      "Event Terms & Conditions",
    ],
  },
] as const;

const legalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Site terms", href: "#" },
  { label: "Cookie Preferences", href: "#" },
] as const;

const socialLinks = [
  { label: "X", href: "https://x.com/awscloud", Icon: XIcon },
  { label: "Facebook", href: "https://www.facebook.com/amazonwebservices", Icon: FacebookIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/amazon-web-services/", Icon: LinkedInIcon },
  { label: "Instagram", href: "https://www.instagram.com/amazonwebservices/", Icon: InstagramIcon },
  { label: "Twitch", href: "https://www.twitch.tv/aws", Icon: TwitchIcon },
  { label: "YouTube", href: "https://www.youtube.com/user/AmazonWebServices", Icon: YouTubeIcon },
  { label: "Email", href: "#", Icon: MailIcon },
  { label: "Podcast", href: "#", Icon: PodcastIcon },
] as const;

export function AwsFooter() {
  return (
    <footer className="bg-aws-footer text-white">
      <div className="aws-content pt-12 pb-8 md:pt-16 md:pb-10">
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

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 md:gap-10">
          {columns.map((column) => (
            <div key={column.heading}>
              <h2 className="mb-4 text-[16px] leading-6 font-bold">{column.heading}</h2>
              <ul className="space-y-2.5">
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

        <div className="mt-14 flex justify-center">
          <a
            href="#top"
            className="aws-focus inline-flex items-center gap-1.5 text-[14px] font-medium text-white hover:underline"
          >
            Back to top
            <span aria-hidden="true" className="text-[15px] leading-none">
              ↑
            </span>
          </a>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-white/10 pt-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[720px]">
            <p className="text-[12px] leading-5 text-[#aab7b8]">
              Amazon is an equal opportunity employer and does not discriminate
              on the basis of protected veteran status, disability or other
              legally protected status. Veterans, military spouses, and people
              with disabilities are encouraged to apply.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {legalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="aws-focus text-[12px] leading-4 text-aws-footer-link hover:text-white hover:underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <ul className="flex flex-wrap items-center gap-4 lg:justify-end">
            {socialLinks.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  aria-label={label}
                  className="aws-focus inline-flex h-8 w-8 items-center justify-center text-white/90 hover:text-white"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-center text-[12px] leading-4 text-[#aab7b8]">
          © 2026, Amazon Web Services, Inc. or its affiliates. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M14.2 10.3 22 2h-1.9l-6.8 7.2L8 2H2.2l8.2 11.6L2 22h1.9l7.1-7.6L16 22h5.8l-7.6-11.7ZM12 13.4l-.8-1.1L4.5 3.4H7l5.2 7.2.8 1.1 7.7 10.1H18l-6-8.4Z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M14.2 21v-7.2h2.5l.4-2.9h-2.9V9.1c0-.8.2-1.4 1.4-1.4h1.6V5.1c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2h-2.6v2.9h2.6V21h3.1Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M6.5 9.3H4V20h2.5V9.3ZM5.2 4C4.4 4 3.7 4.7 3.7 5.5S4.4 7 5.2 7 6.8 6.3 6.8 5.5 6.1 4 5.2 4ZM20 20h-2.5v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V20H11.3V9.3h2.4v1.5h.1c.3-.6 1.2-1.7 2.8-1.7 3 0 3.5 2 3.5 4.5V20Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 8.2A3.8 3.8 0 1 0 12 15.8 3.8 3.8 0 0 0 12 8.2Zm0 6.3A2.5 2.5 0 1 1 12 9.5a2.5 2.5 0 0 1 0 5Zm5.2-6.5a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0ZM19.8 7.2c0-1.6-1.3-2.9-2.9-2.9H7.1C5.5 4.3 4.2 5.6 4.2 7.2v9.8c0 1.6 1.3 2.9 2.9 2.9h9.8c1.6 0 2.9-1.3 2.9-2.9V7.2Zm-1.3 9.8c0 .9-.7 1.6-1.6 1.6H7.1c-.9 0-1.6-.7-1.6-1.6V7.2c0-.9.7-1.6 1.6-1.6h9.8c.9 0 1.6.7 1.6 1.6v9.8Z" />
    </svg>
  );
}

function TwitchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M5.2 3 3 6.3v12.4h4.2V21h2.3l2.2-2.3h3.4L20 14.2V3H5.2Zm13.3 10.3-2.3 2.3h-3.5L10.5 18v-2.4H6.7V4.5h11.8v8.8ZM14.8 7h1.7v5.1h-1.7V7Zm-4.4 0h1.7v5.1H10.4V7Z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M21.6 8.2s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.2 5 12 5 12 5h0s-4.2 0-6.8.3c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2.2 9.8 2.2 11.5v1.5c0 1.7.2 3.3.2 3.3s.2 1.4.8 2c.8.8 1.9.8 2.4.9 1.7.1 6.4.2 6.4.2s4.2 0 6.8-.3c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.3v-1.5c0-1.7-.2-3.3-.2-3.3ZM10.2 14.6V8.9l5.2 2.9-5.2 2.8Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4.2 7 7.8 6.2L19.8 7" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function PodcastIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M7.2 8.2a6.4 6.4 0 0 1 9.6 0M5.2 6.2a9.2 9.2 0 0 1 13.6 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M12 15.5v4.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9.8 20.5h4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
