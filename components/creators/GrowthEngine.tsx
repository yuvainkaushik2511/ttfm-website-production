"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useIsMobile } from "@/lib/useIsMobile";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useDeviceTier } from "@/lib/useDeviceTier";
import { useInViewport } from "@/lib/useInViewport";
import { growthNodes } from "@/data/creators";
import SplitHeading from "@/components/ui/SplitHeading";

const GrowthEngineScene = dynamic(
  () => import("@/components/three/creators/GrowthEngineScene"),
  { ssr: false }
);

// Driven by a pinned ScrollTrigger writing progressRef — the exact
// Ecosystem.tsx applyProgress pattern, without the press-and-hold/auto-play
// complexity (this is a shorter, linear 6-stop pipeline, not a 7-vertical tour).
function DesktopGrowthEngine({ active }: { active: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  // This section sits 6th on the page — unlike Ecosystem.tsx (2nd section, so
  // "always mounted" barely matters), mounting its Canvas+Bloom (the heaviest
  // scene on the route) unconditionally at page load would hold a live WebGL
  // context for a section nobody has scrolled near yet. Gate the Canvas itself
  // on viewport proximity; the ScrollTrigger pin still registers via `active`
  // alone so progressRef stays correct the moment the Canvas mounts.
  const inView = useInViewport(sectionRef, { rootMargin: "50% 0px" });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !active) return;
    registerGsap();

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${growthNodes.length * 90}%`,
      pin: true,
      scrub: 0.7,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        const idx = Math.round(self.progress * (growthNodes.length - 1));
        setActiveIndex((prev) => (prev === idx ? prev : idx));
      },
    });

    return () => st.kill();
  }, [active]);

  const node = growthNodes[activeIndex];

  return (
    <div
      ref={sectionRef}
      className={active ? "relative h-screen w-full overflow-hidden bg-ink" : "hidden"}
    >
      <div className="absolute inset-0">
        {active && inView && <GrowthEngineScene nodes={growthNodes} progressRef={progressRef} />}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
      <div className="container-px pointer-events-none absolute inset-0 flex flex-col justify-between py-28">
        <span className="eyebrow">Creator Growth Engine</span>
        <div className="mx-auto max-w-md text-center">
          <div className="eyebrow mb-4 text-ember">
            {String(activeIndex + 1).padStart(2, "0")} / {String(growthNodes.length).padStart(2, "0")}
          </div>
          <h3 className="font-display text-4xl font-semibold text-paper md:text-6xl">{node.label}</h3>
          <p className="mt-3 text-base text-paper-dim">{node.description}</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          {growthNodes.map((n, i) => (
            <span
              key={n.label}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-8 bg-ember" : "w-1.5 bg-paper-dim/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MobileGrowthEngine({ active }: { active: boolean }) {
  return (
    <div className={active ? "container-px relative bg-ink py-24" : "hidden"}>
      <span className="eyebrow">Creator Growth Engine</span>
      <SplitHeading
        as="h2"
        type="lines"
        className="font-display mt-4 text-4xl font-semibold text-paper"
      >
        From creator to revenue.
      </SplitHeading>
      <div className="mt-10 flex flex-col gap-3">
        {growthNodes.map((node, i) => (
          <div
            key={node.label}
            className="flex items-center gap-4 rounded-2xl border border-line bg-ink-raised/40 p-4"
          >
            <span className="eyebrow text-ember">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="font-display text-lg font-medium text-paper">{node.label}</h3>
              <p className="mt-1 text-sm text-steel">{node.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GrowthEngine() {
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const tier = useDeviceTier();
  const desktopActive = !isMobile && !reducedMotion && tier === "high";

  return (
    <section id="growth">
      <DesktopGrowthEngine active={desktopActive} />
      <MobileGrowthEngine active={!desktopActive} />
    </section>
  );
}
