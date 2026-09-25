"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useIsMobile } from "@/lib/useIsMobile";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { journeySteps } from "@/data/creators";
import SplitHeading from "@/components/ui/SplitHeading";
import DrawnConnector from "@/components/ui/DrawnConnector";

// "Why TTFM" journey — reuses Work.tsx's pinned-horizontal-scroll technique
// wholesale, including DrawnConnector and the exact strokeDasharray/
// strokeDashoffset drive (see Work.tsx:27-61 for why this must be a standalone
// ScrollTrigger.create with onUpdate, not a scrub tween with scrollTrigger
// attached inline — the latter silently no-ops the transform).
export default function CreatorJourney() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const connectorPathRef = useRef<SVGPathElement>(null);
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
    gsap.set(track, { x: 0 });

    const connectorPath = connectorPathRef.current;
    const connectorLength = connectorPath?.getTotalLength() ?? 0;
    if (connectorPath) {
      connectorPath.style.strokeDasharray = `${connectorLength}`;
      connectorPath.style.strokeDashoffset = `${connectorLength}`;
    }

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${distance}`,
      pin: true,
      scrub: 0.7,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        gsap.set(track, { x: -distance * self.progress });
        if (connectorPath) {
          connectorPath.style.strokeDashoffset = `${connectorLength * (1 - self.progress)}`;
        }
      },
    });

    return () => st.kill();
  }, [useHorizontal]);

  return (
    <section id="journey" ref={sectionRef} className="relative overflow-hidden bg-ink">
      <div className="container-px pt-24">
        <span className="eyebrow">Why TTFM Creators</span>
        <SplitHeading
          as="h2"
          type="lines"
          start="top 90%"
          className="font-display mt-4 max-w-2xl text-4xl font-semibold text-paper md:text-5xl"
        >
          From discovery to a category of one.
        </SplitHeading>
      </div>

      <div
        ref={trackRef}
        data-cursor={useHorizontal ? "link" : undefined}
        data-cursor-label={useHorizontal ? "Drag" : undefined}
        className={
          useHorizontal
            ? "relative mt-14 flex h-[56vh] items-stretch gap-8 pl-[clamp(1.25rem,5vw,4rem)] will-change-transform"
            : "mt-10 flex flex-col gap-4 px-[clamp(1.25rem,5vw,4rem)] pb-10"
        }
      >
        {useHorizontal && (
          <DrawnConnector
            ref={connectorPathRef}
            humps={journeySteps.length}
            className="pointer-events-none absolute inset-x-0 top-1/2 h-20 w-full -translate-y-1/2"
          />
        )}
        {journeySteps.map((step) => (
          <div
            key={step.stage}
            className={
              useHorizontal
                ? "flex h-full w-[70vw] flex-none flex-col justify-center rounded-[2rem] border border-line bg-ink-raised/40 p-10 sm:w-[46vw] lg:w-[26vw]"
                : "rounded-2xl border border-line bg-ink-raised/40 p-6"
            }
          >
            <span className="font-display text-6xl font-semibold text-paper/10">{step.stage}</span>
            <h3 className="font-display mt-2 text-2xl font-medium text-paper">{step.title}</h3>
            <p className="mt-2 text-sm text-paper-dim">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
