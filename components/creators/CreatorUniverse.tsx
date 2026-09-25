"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useDeviceTier } from "@/lib/useDeviceTier";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useIsMobile } from "@/lib/useIsMobile";
import { useIsTouchDevice } from "@/lib/useIsTouchDevice";
import { useInViewport } from "@/lib/useInViewport";
import { creators, type CreatorProfile } from "@/data/creators";
import SplitHeading from "@/components/ui/SplitHeading";
import MediaSlot from "@/components/creators/MediaSlot";

const CreatorUniverseScene = dynamic(
  () => import("@/components/three/creators/CreatorUniverseScene"),
  { ssr: false }
);

function TiltCard({ index }: { index: number }) {
  const creator = creators[index];
  const cardRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();

  // The manual-transform-string tilt from GenerativePanel.tsx — gsap's CSSPlugin
  // transform composition conflicts with Tailwind v4's native rotate/scale
  // properties, so a plain state object drives the write instead of the element.
  const tiltState = useRef({ rx: 0, ry: 0 });
  const tiltX = useRef<((v: number) => void) | null>(null);
  const tiltY = useRef<((v: number) => void) | null>(null);

  const applyTilt = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `rotateX(${tiltState.current.rx}deg) rotateY(${tiltState.current.ry}deg)`;
  };

  useEffect(() => {
    if (isTouch) return;
    tiltX.current = gsap.quickTo(tiltState.current, "rx", { duration: 0.6, ease: "power3.out", onUpdate: applyTilt });
    tiltY.current = gsap.quickTo(tiltState.current, "ry", { duration: 0.6, ease: "power3.out", onUpdate: applyTilt });
  }, [isTouch]);

  const handleMove = (e: React.MouseEvent) => {
    if (isTouch || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    tiltX.current?.(-relY * 8);
    tiltY.current?.(relX * 8);
  };

  const handleLeave = () => {
    tiltX.current?.(0);
    tiltY.current?.(0);
  };

  return (
    <div className="h-72 w-56 flex-none" style={{ perspective: 1200 }}>
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        data-cursor="link"
        data-cursor-label="Explore"
        style={{ transformStyle: "preserve-3d" }}
        className="relative flex h-full w-full flex-col justify-end overflow-hidden rounded-[1.75rem] border border-line bg-ink-raised/60 will-change-transform"
      >
        <MediaSlot seed={creator.seed} mediaSrc={creator.mediaSrc} kind="image" className="absolute inset-0 h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
        <div className="relative z-10 p-5">
          <span className="eyebrow text-ember">{creator.niche}</span>
          <h3 className="font-display mt-1 text-xl font-medium text-paper">{creator.name}</h3>
          <p className="mt-1 text-xs text-steel">{creator.followers} reach · {creator.engagement} eng.</p>
        </div>
      </div>
    </div>
  );
}

export default function CreatorUniverse() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInViewport(sectionRef, { rootMargin: "40% 0px" });
  const tier = useDeviceTier();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const useWebGL = tier === "high" && !reducedMotion && !isMobile;
  const [hoveredCreator, setHoveredCreator] = useState<CreatorProfile | null>(null);

  return (
    <section id="universe" ref={sectionRef} className="relative bg-ink py-28">
      <div className="container-px">
        <span className="eyebrow">Infinite Creator Universe</span>
        <SplitHeading
          as="h2"
          type="lines"
          className="font-display mt-4 max-w-2xl text-4xl font-semibold text-paper md:text-5xl"
        >
          A whole galaxy of creators, one scroll away.
        </SplitHeading>
      </div>

      {useWebGL ? (
        <div className="relative mt-14 h-[80vh] w-full">
          {inView && <CreatorUniverseScene creators={creators} onHoverCreator={setHoveredCreator} />}
          {/* Plain DOM overlay driven by the hover callback, not a drei <Html>
              portal inside the Canvas — see CreatorUniverseScene.tsx's note. */}
          <div
            className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-ink/85 px-4 py-2 text-xs uppercase tracking-[0.2em] text-paper backdrop-blur-sm transition-opacity duration-200"
            style={{ opacity: hoveredCreator ? 1 : 0 }}
          >
            {hoveredCreator ? `${hoveredCreator.name} · ${hoveredCreator.niche}` : ""}
          </div>
        </div>
      ) : (
        <div className="mt-14 flex gap-5 overflow-x-auto px-[clamp(1.25rem,5vw,4rem)] pb-8">
          {creators.map((_, i) => (
            <TiltCard key={creators[i].slug} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
