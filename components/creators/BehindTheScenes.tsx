"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useIsMobile } from "@/lib/useIsMobile";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { btsFrames } from "@/data/creators";
import SplitHeading from "@/components/ui/SplitHeading";
import MediaSlot from "@/components/creators/MediaSlot";

// Reuses Work.tsx's pinned-horizontal-scroll effect verbatim — including the
// invalidateOnRefresh and the first-10%-of-pin "arrival" scale push.
export default function BehindTheScenes() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const useHorizontal = !isMobile && !reducedMotion;

  useEffect(() => {
    if (!useHorizontal) return;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    registerGsap();

    const distance = track.scrollWidth - section.clientWidth;
    gsap.set(track, { x: 0, scale: 1.06 });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${distance}`,
      pin: true,
      scrub: 0.7,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const scaleIn =
          self.progress < 0.1
            ? gsap.utils.interpolate(1.06, 1, self.progress / 0.1)
            : 1;
        gsap.set(track, { x: -distance * self.progress, scale: scaleIn });
      },
    });

    return () => st.kill();
  }, [useHorizontal]);

  return (
    <section id="bts" ref={sectionRef} className="relative overflow-hidden bg-ink">
      <div className="container-px pt-24">
        <span className="eyebrow">Behind The Scenes</span>
        <SplitHeading
          as="h2"
          type="lines"
          start="top 90%"
          className="font-display mt-4 max-w-2xl text-4xl font-semibold text-paper md:text-5xl"
        >
          Inside the studio, mid-production.
        </SplitHeading>
      </div>

      <div
        ref={trackRef}
        data-cursor={useHorizontal ? "link" : undefined}
        data-cursor-label={useHorizontal ? "Drag" : undefined}
        className={
          useHorizontal
            ? "relative mt-14 flex h-[62vh] items-stretch gap-6 pl-[clamp(1.25rem,5vw,4rem)] will-change-transform"
            : "mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[clamp(1.25rem,5vw,4rem)] pb-10"
        }
      >
        {btsFrames.map((frame) => (
          <div
            key={frame.slug}
            className={
              useHorizontal
                ? "relative h-full w-[70vw] flex-none overflow-hidden rounded-[2rem] border border-line sm:w-[50vw] lg:w-[38vw]"
                : "relative h-[52vh] flex-none snap-start overflow-hidden rounded-2xl border border-line"
            }
          >
            <MediaSlot seed={frame.seed} mediaSrc={frame.mediaSrc} kind="image" className="absolute inset-0 h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
            <span className="absolute bottom-6 left-6 z-10 text-sm text-paper-dim">
              {frame.caption}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
