"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useIsMobile } from "@/lib/useIsMobile";
import { creators } from "@/data/creators";
import MediaSlot from "@/components/creators/MediaSlot";

const FEATURED = creators.slice(0, 6);

// Extends BuildLaunchScale.tsx's pinned-fractional-progress pattern exactly:
// fractional = progress * (n - 1), per-item opacity/scale/blur from
// 1 - min(abs(fractional - i), 1) — full-bleed creator panels instead of words.
export default function FeaturedCreators() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  // Pinned full-viewport scroll-jacking is disabled on mobile — same convention
  // as Work.tsx/CreatorJourney.tsx/BehindTheScenes.tsx (`useHorizontal`) and
  // Ecosystem.tsx/GrowthEngine.tsx (`desktopActive`): known-janky on mobile
  // Safari in particular, so mobile gets the plain stacked fallback instead.
  const animated = !reducedMotion && !isMobile;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !animated) return;
    registerGsap();

    gsap.set(cardRefs.current, { opacity: 0, scale: 1.08, filter: "blur(10px)" });
    gsap.set(cardRefs.current[0], { opacity: 1, scale: 1, filter: "blur(0px)" });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${FEATURED.length * 100}%`,
      pin: true,
      scrub: 0.6,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const fractional = self.progress * (FEATURED.length - 1);
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const dist = Math.min(Math.abs(fractional - i), 1);
          const amt = 1 - dist;
          gsap.set(el, {
            opacity: amt,
            scale: gsap.utils.interpolate(1.08, 1, amt),
            filter: `blur(${gsap.utils.interpolate(10, 0, amt)}px)`,
          });
        });
      },
    });

    return () => st.kill();
  }, [animated]);

  return (
    <>
      <div className={animated ? "hidden" : "flex flex-col gap-4 bg-ink px-6 py-24"}>
        {FEATURED.map((creator) => (
          <div
            key={creator.slug}
            className="relative h-[70vh] overflow-hidden rounded-[2rem] border border-line"
          >
            <MediaSlot seed={creator.seed} mediaSrc={creator.mediaSrc} kind="image" className="absolute inset-0 h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-end p-8">
              <span className="eyebrow text-ember">{creator.niche}</span>
              <h3 className="font-display mt-2 text-4xl font-semibold text-paper">{creator.name}</h3>
              <p className="mt-2 max-w-md text-sm text-paper-dim">{creator.highlight}</p>
              <div className="mt-4 flex gap-6 text-xs text-steel">
                <span>{creator.followers} reach</span>
                <span>{creator.engagement} engagement</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        ref={sectionRef}
        className={animated ? "relative h-screen w-full overflow-hidden bg-ink" : "hidden"}
      >
        <div className="container-px pointer-events-none absolute inset-x-0 top-24 z-20 flex items-center justify-between">
          <span className="eyebrow">Featured Creators</span>
          <span className="eyebrow text-ember">Scroll to explore</span>
        </div>
        {FEATURED.map((creator, i) => (
          <div
            key={creator.slug}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute inset-0"
          >
            <MediaSlot seed={creator.seed} mediaSrc={creator.mediaSrc} kind="image" className="absolute inset-0 h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
            <div className="container-px relative z-10 flex h-full flex-col justify-end pb-28">
              <span className="eyebrow text-ember">{creator.niche}</span>
              <h3 className="font-display mt-3 text-6xl font-semibold text-paper md:text-8xl">
                {creator.name}
              </h3>
              <p className="mt-4 max-w-lg text-base text-paper-dim">{creator.highlight}</p>
              <div className="mt-5 flex gap-8 text-sm text-steel">
                <span>{creator.followers} reach</span>
                <span>{creator.engagement} engagement</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
