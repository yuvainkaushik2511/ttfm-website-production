"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import SplitHeading from "@/components/ui/SplitHeading";

const COLUMNS = [
  {
    label: "Capability",
    copy: "TTFM Production develops, shoots and finishes work for film, television and brands — one team, from first frame to final cut.",
  },
  {
    label: "Scale",
    copy: "We build for scale: features and series alongside commercials and music videos, produced with the same discipline and the same crew.",
  },
];

// Brand-introduction beat, directly after Hero: an asymmetric editorial grid
// — small label left, oversized claim right — with a soundstage photograph
// partially overlapping the headline and drifting slightly as the section
// scrolls, rather than sitting in its own boxed slot.
export default function Manifesto() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;
    registerGsap();

    const items = section.querySelectorAll<HTMLElement>("[data-reveal]");
    gsap.set(items, { autoAlpha: 0, y: 24 });
    gsap.set(imageRef.current, { autoAlpha: 0, scale: 0.9 });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      onEnter: () => {
        gsap.to(imageRef.current, { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power3.out" });
        gsap.to(items, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          delay: 0.2,
          ease: "power3.out",
        });
      },
    });

    // A slow drift on the image as the whole section scrolls through — the
    // small "media moves independently of text" detail the brief asks for.
    const parallax = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: 0.6,
      onUpdate: (self) => {
        gsap.set(imageRef.current, { yPercent: gsap.utils.interpolate(-3, 3, self.progress) });
      },
    });

    return () => {
      st.kill();
      parallax.kill();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      className="relative overflow-hidden border-t border-line bg-ink py-28 md:py-40"
    >
      <div className="container-px relative mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-[12rem_1fr] md:gap-16">
          <span className="eyebrow">The Studio</span>

          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <SplitHeading
              as="h2"
              type="words"
              className="font-display text-[11vw] font-semibold leading-[0.95] tracking-tight text-paper sm:text-6xl md:text-7xl lg:min-w-0 lg:flex-1 lg:text-[5rem]"
            >
              Stories built for the screen.
            </SplitHeading>

            <div
              ref={imageRef}
              className="relative hidden aspect-[4/5] w-48 shrink-0 overflow-hidden rounded-sm sm:block md:w-56 lg:w-60"
            >
              <Image
                src="/images/soundstage-crew.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 15rem, (min-width: 768px) 14rem, 12rem"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-12 border-t border-line pt-12 sm:grid-cols-2 md:ml-[calc(12rem+4rem)] md:mt-20 md:pt-14">
          {COLUMNS.map((c) => (
            <div key={c.label} data-reveal>
              <span className="eyebrow text-steel">{c.label}</span>
              <p className="mt-4 text-lg text-paper-dim md:text-xl">{c.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
