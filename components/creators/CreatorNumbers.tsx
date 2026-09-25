"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useCountUp } from "@/lib/useCountUp";
import { gsap } from "@/lib/gsap";
import { creatorsTheme } from "@/lib/creatorsTheme";
import { createRng } from "@/lib/rng";
import { stats } from "@/data/creators";
import PanelCanvas, { type DrawFn } from "@/components/visuals/PanelCanvas";
import SplitHeading from "@/components/ui/SplitHeading";

// A particle-burst DrawFn factory whose intensity is driven by a plain mutable
// ref, not React state — PanelCanvas.tsx lists `draw` in its effect deps, so
// this MUST be memoized per seed or a fresh closure every render would tear down
// and restart the RAF loop (see MediaSlot.tsx for the identical note). Takes the
// ref object itself (not `.current`) and only reads `.current` inside the
// returned draw closure, which runs later during animation frames — reading a
// ref's `.current` synchronously during render is a lint error in this project.
function useBurstVisual(seed: number, burstStateRef: MutableRefObject<{ value: number }>): DrawFn {
  return useMemo(() => {
    const rng = createRng(seed);
    const particles = Array.from({ length: 36 }, () => ({
      angle: rng() * Math.PI * 2,
      speed: 0.3 + rng() * 0.7,
      size: 1 + rng() * 2,
    }));
    return (ctx, _t, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const intensity = burstStateRef.current.value;
      if (intensity <= 0.01) return;
      const cx = w / 2;
      const cy = h / 2;
      for (const p of particles) {
        const dist = (1 - intensity) * Math.min(w, h) * 0.5 * p.speed;
        const x = cx + Math.cos(p.angle) * dist;
        const y = cy + Math.sin(p.angle) * dist;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${creatorsTheme.accentBrightRgb}, ${intensity * 0.8})`;
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };
  }, [seed, burstStateRef]);
}

function StatTile({ index }: { index: number }) {
  const stat = stats[index];
  const burstStateRef = useRef({ value: 0 });
  const visual = useBurstVisual(index, burstStateRef);

  const ref = useCountUp<HTMLSpanElement>({
    target: stat.value,
    formatter: (v) => `${stat.prefix ?? ""}${Math.round(v).toLocaleString()}${stat.suffix}`,
    onComplete: () => {
      gsap.fromTo(burstStateRef.current, { value: 1 }, { value: 0, duration: 1.4, ease: "power2.out" });
    },
  });

  return (
    <div className="relative flex flex-col items-center overflow-hidden py-8 text-center">
      <PanelCanvas draw={visual} className="pointer-events-none absolute inset-0" />
      <span
        ref={ref}
        className="font-display relative z-10 text-[13vw] font-semibold leading-none tabular-nums text-paper sm:text-[6vw] md:text-[4vw]"
      />
      <span className="eyebrow relative z-10 mt-4 text-steel">{stat.label}</span>
    </div>
  );
}

export default function CreatorNumbers() {
  return (
    <section className="relative bg-ink py-28">
      <div className="container-px">
        <span className="eyebrow">By The Numbers</span>
        <SplitHeading
          as="h2"
          type="lines"
          className="font-display mt-4 max-w-2xl text-4xl font-semibold text-paper md:text-5xl"
        >
          The scale, in one glance.
        </SplitHeading>
      </div>
      <div className="container-px mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatTile key={stat.label} index={i} />
        ))}
      </div>
    </section>
  );
}
