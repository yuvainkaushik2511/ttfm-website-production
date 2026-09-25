"use client";

import { useMemo, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useIsTouchDevice } from "@/lib/useIsTouchDevice";
import { createRng } from "@/lib/rng";
import { brands, type Brand } from "@/data/creators";
import SplitHeading from "@/components/ui/SplitHeading";
import GlassPanel from "@/components/creators/GlassPanel";

interface FloatLayout {
  top: number;
  left: number;
  rotate: number;
  delay: number;
  duration: number;
  tracking: number;
}

function useFloatLayout(count: number): FloatLayout[] {
  return useMemo(() => {
    const rng = createRng(0x4252414e);
    return Array.from({ length: count }, () => ({
      top: 8 + rng() * 68,
      left: 4 + rng() * 78,
      rotate: (rng() - 0.5) * 6,
      delay: rng() * 2,
      duration: 5 + rng() * 4,
      tracking: rng() > 0.5 ? 0.08 : 0.02,
    }));
  }, [count]);
}

function BrandBadge({
  brand,
  layout,
  onHover,
}: {
  brand: Brand;
  layout: FloatLayout;
  onHover: (slug: string | null) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const isTouch = useIsTouchDevice();

  const handleMove = (e: React.MouseEvent) => {
    if (isTouch || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    gsap.to(ref.current, { x: relX * 0.3, y: relY * 0.3, duration: 0.4, ease: "power3.out" });
  };

  const handleLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    onHover(null);
  };

  return (
    <button
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => onHover(brand.slug)}
      onMouseLeave={handleLeave}
      onFocus={() => onHover(brand.slug)}
      onBlur={handleLeave}
      data-cursor="link"
      data-cursor-label="View"
      style={{
        top: `${layout.top}%`,
        left: `${layout.left}%`,
        rotate: `${layout.rotate}deg`,
        animationDelay: `${layout.delay}s`,
        animationDuration: `${layout.duration}s`,
        letterSpacing: `${layout.tracking}em`,
      }}
      className="brand-float font-display absolute rounded-full border border-line bg-ink-raised/50 px-6 py-3 text-lg font-medium text-paper backdrop-blur-sm transition-colors hover:border-ember hover:text-ember"
    >
      {brand.name}
    </button>
  );
}

export default function BrandEcosystem() {
  const layouts = useFloatLayout(brands.length);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const hovered = brands.find((b) => b.slug === hoveredSlug) ?? null;

  return (
    <section id="brands" className="relative overflow-hidden bg-ink py-28">
      <div className="container-px">
        <span className="eyebrow">Brands We Work With</span>
        <SplitHeading
          as="h2"
          type="lines"
          className="font-display mt-4 max-w-2xl text-4xl font-semibold text-paper md:text-5xl"
        >
          A floating ecosystem of partners.
        </SplitHeading>
      </div>

      <div className="relative mt-16 h-[68vh] w-full">
        {brands.map((brand, i) => (
          <BrandBadge key={brand.slug} brand={brand} layout={layouts[i]} onHover={setHoveredSlug} />
        ))}
      </div>

      <div className="container-px">
        <GlassPanel
          className={`mx-auto max-w-xl p-8 text-center transition-opacity duration-300 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {hovered ? (
            <>
              <span className="eyebrow text-ember">{hovered.category}</span>
              <p className="mt-3 text-base text-paper-dim">{hovered.caseStudy}</p>
            </>
          ) : (
            <p className="text-sm text-steel">Hover a brand to see the case study.</p>
          )}
        </GlassPanel>
      </div>
    </section>
  );
}
