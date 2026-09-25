"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, registerGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import SplitHeading from "@/components/ui/SplitHeading";
import LazyVideo from "@/components/ui/LazyVideo";

const TAGLINE = "One crew, start to finish. We don't hand off between vendors.";

const STAGES = [
  {
    code: "01",
    name: "Concept",
    copy: "Story, creative direction and positioning — the film is designed before it's shot.",
    media: { type: "image" as const, src: "/images/camera-equipment-detail.jpg" },
  },
  {
    code: "02",
    name: "Pre-Production",
    copy: "Casting, locations, crew and scheduling, assembled around the story.",
    media: { type: "image" as const, src: "/images/crew-set-gathering.jpg" },
  },
  {
    code: "03",
    name: "Production",
    copy: "Director-led shoot days — camera, light and performance, in studio or on location.",
    media: { type: "video" as const, src: "/videos/hero-clapperboard.mp4" },
  },
  {
    code: "04",
    name: "Post",
    copy: "Edit, color, sound and motion graphics — the final cut, delivered.",
    media: { type: "video" as const, src: "/videos/editing-timeline.mp4" },
  },
];

// A vertical production timeline — the active stage tracks scroll position
// (IntersectionObserver on each row) and crossfades real footage/photography
// in a sticky panel beside it, so the section reads as a journey through
// actual production media rather than a static list with decorative art.
export default function Pillars() {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const rows = rowRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (!rows.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = rows.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    registerGsap();
    const panels = mediaRefs.current.filter((el): el is HTMLDivElement => el !== null);
    panels.forEach((panel, i) => {
      gsap.to(panel, {
        autoAlpha: i === active ? 1 : 0,
        scale: i === active ? 1 : 1.06,
        duration: 0.7,
        ease: "power2.out",
      });
    });
  }, [active, reducedMotion]);

  return (
    <section
      id="pillars"
      className="relative overflow-hidden border-t border-line bg-ink py-28 md:py-36"
    >
      <div className="container-px mx-auto max-w-6xl">
        <span className="eyebrow">The Process</span>
        <SplitHeading
          as="h2"
          type="lines"
          className="font-headline mt-4 max-w-2xl text-4xl text-paper md:text-5xl"
        >
          One partner, every stage.
        </SplitHeading>

        <div className="mt-16 grid gap-10 md:mt-20 md:grid-cols-[1fr_26rem] md:gap-16">
          <div className="flex flex-col">
            {STAGES.map((stage, i) => (
              <div
                key={stage.code}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className={`flex items-baseline gap-6 border-t border-line py-8 transition-opacity duration-500 last:border-b md:py-10 ${
                  active === i ? "opacity-100" : "opacity-40"
                }`}
              >
                <span
                  className={`font-display text-2xl transition-colors duration-500 md:text-3xl ${
                    active === i ? "text-ember" : "text-steel"
                  }`}
                >
                  {stage.code}
                </span>
                <div>
                  <h3 className="font-display text-2xl font-medium text-paper md:text-3xl">
                    {stage.name}
                  </h3>
                  <p className="mt-2 max-w-md text-base text-paper-dim md:text-lg">{stage.copy}</p>
                  <p className="mt-3 max-w-md text-sm text-steel">{TAGLINE}</p>
                </div>
              </div>
            ))}
          </div>

          {!reducedMotion && (
            <div className="hidden md:block">
              <div className="sticky top-32 aspect-[4/5] overflow-hidden rounded-sm">
                {STAGES.map((stage, i) => (
                  <div
                    key={stage.code}
                    ref={(el) => {
                      mediaRefs.current[i] = el;
                    }}
                    className="absolute inset-0"
                    style={{ opacity: i === 0 ? 1 : 0 }}
                  >
                    {stage.media.type === "video" ? (
                      <LazyVideo
                        src={stage.media.src}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={stage.media.src}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 26rem, 0px"
                        className="object-cover"
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                  </div>
                ))}
                <span className="eyebrow absolute bottom-4 right-4 z-10 text-paper">
                  {STAGES[active].code} / {STAGES[active].name}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
