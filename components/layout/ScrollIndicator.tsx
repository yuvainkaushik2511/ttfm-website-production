"use client";

import { useEffect, useState } from "react";

const SECTION_IDS = ["top", "manifesto", "work", "pillars", "mumbai", "about", "contact"];

// A minimal "01 / 07" counter + growing vertical line — moving through
// chapters of a film without literally numbering them "Chapter I, II, III."
// Homepage-only, desktop-only.
export default function ScrollIndicator() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = SECTION_IDS.indexOf(entry.target.id);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const progress = SECTION_IDS.length > 1 ? active / (SECTION_IDS.length - 1) : 0;

  return (
    <div className="fixed bottom-10 right-6 z-[500] hidden flex-col items-center gap-3 xl:flex">
      <span className="font-body text-[0.7rem] tabular-nums tracking-[0.2em] text-paper-dim/60">
        {String(active + 1).padStart(2, "0")}
      </span>
      <div className="relative h-24 w-px bg-line">
        <div
          className="absolute inset-x-0 top-0 w-px bg-ember transition-[height] duration-500 ease-out"
          style={{ height: `${progress * 100}%` }}
        />
      </div>
      <span className="font-body text-[0.7rem] tabular-nums tracking-[0.2em] text-paper-dim/30">
        {String(SECTION_IDS.length).padStart(2, "0")}
      </span>
    </div>
  );
}
