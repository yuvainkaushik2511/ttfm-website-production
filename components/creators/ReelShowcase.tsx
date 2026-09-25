"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import SplitHeading from "@/components/ui/SplitHeading";
import MediaSlot from "@/components/creators/MediaSlot";
import { reels } from "@/data/creators";

// Netflix-like gallery grid. Hover-scale + blur-the-siblings via hoveredIndex
// state + GSAP tweens on every tile (not CSS :has), consistent with this
// codebase's JS-driven interaction approach elsewhere.
export default function ReelShowcase() {
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleHover = (index: number | null) => {
    tileRefs.current.forEach((el, i) => {
      if (!el) return;
      const isFocused = index === null || i === index;
      gsap.to(el, {
        scale: index === i ? 1.05 : 1,
        filter: isFocused ? "blur(0px)" : "blur(3px)",
        opacity: isFocused ? 1 : 0.5,
        duration: 0.4,
        ease: "power3.out",
      });
    });
  };

  return (
    <section id="reels" className="relative bg-ink py-28">
      <div className="container-px">
        <span className="eyebrow">Reel Showcase</span>
        <SplitHeading
          as="h2"
          type="lines"
          className="font-display mt-4 max-w-2xl text-4xl font-semibold text-paper md:text-5xl"
        >
          Browse the work like premium content.
        </SplitHeading>
      </div>

      <div className="container-px mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {reels.map((reel, i) => (
          <div
            key={reel.slug}
            ref={(el) => {
              tileRefs.current[i] = el;
            }}
            onMouseEnter={() => handleHover(i)}
            onMouseLeave={() => handleHover(null)}
            data-cursor="link"
            data-cursor-label="Watch"
            className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-line will-change-transform"
          >
            <MediaSlot seed={reel.seed} mediaSrc={reel.mediaSrc} kind="image" className="absolute inset-0 h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-end p-4">
              <span className="text-xs text-paper-dim">{reel.creator}</span>
              <span className="font-display text-sm font-medium text-paper">{reel.title}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
