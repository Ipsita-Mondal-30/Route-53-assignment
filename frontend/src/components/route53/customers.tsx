import Image from "next/image";

import { ArrowRightIcon } from "@/components/ui/icons";

const stories = [
  {
    href: "#",
    image: "/images/landing/capital-one.jpg",
    imageAlt:
      "A person in a yellow raincoat looking at a smartphone",
    logo: "Capital One",
    title: "Capital One improves cloud resilience with Amazon Route 53",
  },
  {
    href: "#",
    image: "/images/landing/netflix.jpg",
    imageAlt: "Hands holding a smartphone with a video app on screen",
    logo: "Netflix",
    title: "Netflix improved application resiliency with Amazon Route 53",
    cta: "Watch the video",
  },
] as const;

export function Customers() {
  return (
    <section id="customers" className="px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1450px]">
        <h2 className="font-display mb-8 text-[32px] leading-tight font-medium text-aws-ink md:mb-10">
          Customers
        </h2>
        <div className="flex flex-col gap-6">
          {stories.map((story) => (
            <a
              key={story.title}
              href={story.href}
              className="aws-focus group relative block overflow-hidden rounded-2xl shadow-[0_8px_40px_rgba(80,110,200,0.22)]"
            >
              <div className="relative aspect-[16/7] min-h-[240px] md:min-h-[340px]">
                <Image
                  src={story.image}
                  alt={story.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1450px) 1450px, 100vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                <p className="absolute top-5 left-5 text-[18px] font-bold tracking-tight text-white md:top-8 md:left-8 md:text-[22px]">
                  {story.logo}
                </p>
                <div className="absolute right-5 bottom-5 left-5 md:right-8 md:bottom-8 md:left-8">
                  <p className="flex items-center gap-2 text-[18px] leading-snug font-medium text-white md:text-[22px]">
                    {story.title}
                    <ArrowRightIcon className="hidden h-5 w-5 shrink-0 sm:inline" />
                  </p>
                  {"cta" in story ? (
                    <p className="mt-3 inline-flex items-center gap-2 text-[16px] font-medium text-white">
                      {story.cta}
                      <ArrowRightIcon className="h-4 w-4" />
                    </p>
                  ) : null}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
