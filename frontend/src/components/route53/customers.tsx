"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import { ArrowRightIcon } from "@/components/ui/icons";

const stories = [
  {
    href: "#",
    image: "/images/landing/capital-one.jpg",
    imageAlt:
      "Person in a yellow raincoat looking at a pink smartphone outdoors",
    logo: "Capital One",
    title: "Capital One improves cloud resilience with Amazon Route 53",
    cta: "Watch the video",
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

type CardStyle = {
  transform: string;
  opacity: number;
  zIndex: number;
};

function cardStyleFor(
  index: number,
  progress: number,
  count: number,
  travelPx: number,
): CardStyle {
  const offset = index - progress;
  const peekPx = 32;

  let translateY: number;
  let scale = 1;
  let opacity = 1;

  if (offset > 0) {
    translateY = offset * peekPx;
    scale = 1 - Math.min(offset, 1) * 0.015;
  } else if (offset < 0) {
    const leave = Math.min(1, -offset);
    translateY = offset * travelPx;
    scale = 1 - leave * 0.045;
    opacity = 1 - leave * 0.4;
  } else {
    translateY = 0;
  }

  return {
    transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
    opacity: Math.max(0.12, opacity),
    zIndex: count - index,
  };
}

export function Customers() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [travelPx, setTravelPx] = useState(640);
  const [reducedMotion, setReducedMotion] = useState(false);
  const count = stories.length;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function syncMotion() {
      setReducedMotion(media.matches);
    }
    syncMotion();
    media.addEventListener("change", syncMotion);
    return () => media.removeEventListener("change", syncMotion);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    let frame = 0;

    function update() {
      frame = 0;
      const track = trackRef.current;
      const stack = stackRef.current;
      if (!track) {
        return;
      }
      if (stack) {
        setTravelPx(Math.max(480, stack.clientHeight + 48));
      }
      const rect = track.getBoundingClientRect();
      const scrollable = Math.max(1, track.offsetHeight - window.innerHeight);
      const scrolled = Math.min(scrollable, Math.max(0, -rect.top));
      setProgress((scrolled / scrollable) * (count - 1));
    }

    function onScroll() {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count, reducedMotion]);

  return (
    <section id="customers" className="case-studies">
      <div className="case-studies-heading px-5 md:px-8">
        <div className="mx-auto max-w-[1450px]">
          <h2 className="font-display text-[32px] leading-tight font-medium text-aws-ink">
            Customers
          </h2>
        </div>
      </div>

      {reducedMotion ? (
        <div className="case-studies-fallback px-5 md:px-8">
          <div className="mx-auto flex max-w-[1450px] flex-col gap-6">
            {stories.map((story) => (
              <article key={story.title} className="case-study-card-static">
                <CaseStudyCardContent story={story} priority={false} />
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={trackRef}
          className="case-studies-track"
          style={{ ["--case-count"]: String(count) } as CSSProperties}
        >
          <div className="case-studies-sticky">
            <div className="case-studies-glow" aria-hidden="true" />
            <div
              ref={stackRef}
              className="case-studies-stack"
              aria-label="Customer case studies"
            >
              {stories.map((story, index) => {
                const style = cardStyleFor(index, progress, count, travelPx);
                return (
                  <article
                    key={story.title}
                    className="case-study-card"
                    style={{
                      transform: style.transform,
                      opacity: style.opacity,
                      zIndex: style.zIndex,
                    }}
                  >
                    <CaseStudyCardContent
                      story={story}
                      priority={index === 0}
                    />
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CaseStudyCardContent({
  story,
  priority,
}: {
  story: (typeof stories)[number];
  priority: boolean;
}) {
  return (
    <a href={story.href} className="case-study-card-link aws-focus">
      <Image
        src={story.image}
        alt={story.imageAlt}
        fill
        className="object-cover object-[center_22%]"
        sizes="(min-width: 1600px) 1500px, 94vw"
        priority={priority}
      />
      <span className="case-study-card-shade" aria-hidden="true" />
      <span className="case-study-card-copy">
        <span className="case-study-card-logo">{story.logo}</span>
        <span className="case-study-card-title">{story.title}</span>
        <span className="case-study-card-cta">
          {story.cta}
          <ArrowRightIcon className="h-4 w-4" />
        </span>
      </span>
    </a>
  );
}
