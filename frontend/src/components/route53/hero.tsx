import Link from "next/link";

import { ChevronRightIcon } from "@/components/ui/icons";

const crumbs = [
  { label: "Products", href: "#" },
  { label: "Networking and Content Delivery", href: "#" },
] as const;

export function Hero() {
  return (
    <section id="overview" className="px-5 pt-10 pb-16 md:px-8 md:pt-14 md:pb-24">
      <div className="mx-auto max-w-[1450px]">
        <nav aria-label="Breadcrumb" className="mb-10 text-[14px] text-aws-text">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {crumbs.map((crumb) => (
              <li key={crumb.label} className="inline-flex items-center gap-2">
                <a href={crumb.href} className="aws-focus underline">
                  {crumb.label}
                </a>
                <ChevronRightIcon className="h-3 w-3 text-aws-muted" />
              </li>
            ))}
            <li aria-current="page">Amazon Route 53</li>
          </ol>
        </nav>

        <h1 className="font-display max-w-4xl text-[32px] leading-tight font-medium text-aws-ink">
          Amazon Route 53 - DNS service
        </h1>
        <p className="mt-5 max-w-3xl text-[20px] leading-8 text-aws-ink md:text-[24px] md:leading-9">
          A reliable and cost-effective way to route end users to Internet
          applications
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href="/login"
            className="aws-btn-primary aws-focus h-12 px-7 text-[16px]"
          >
            Get started with Route 53
          </Link>
          <a href="#" className="aws-btn-secondary aws-focus h-12 px-7 text-[16px]">
            Connect with an expert
          </a>
        </div>
      </div>
    </section>
  );
}
