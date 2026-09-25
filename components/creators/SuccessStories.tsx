"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { stories, type SuccessStory } from "@/data/creators";
import SplitHeading from "@/components/ui/SplitHeading";
import MediaSlot from "@/components/creators/MediaSlot";
import StatCounter from "@/components/creators/StatCounter";

const ROWS: Array<{ label: string; field: keyof SuccessStory }> = [
  { label: "Before", field: "before" },
  { label: "Process", field: "process" },
  { label: "Growth", field: "growth" },
  { label: "Results", field: "results" },
];

// Entrance = Contact.tsx's scale/blur settle pattern (standalone ScrollTrigger
// onUpdate, not a scrub tween with scrollTrigger attached — see Work.tsx's note
// on why that form silently fails). Visual pinned via native CSS `sticky`, not
// GSAP — no JS needed to hold it in place while the narrative scrolls past.
function StoryBlock({ story }: { story: SuccessStory }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const content = contentRef.current;
    if (reducedMotion || !content) return;
    registerGsap();

    gsap.set(content, { scale: 1.05, filter: "blur(6px)", autoAlpha: 0 });

    const st = ScrollTrigger.create({
      trigger: content,
      start: "top bottom",
      end: "top 55%",
      scrub: 0.6,
      onUpdate: (self) => {
        gsap.set(content, {
          scale: gsap.utils.interpolate(1.05, 1, self.progress),
          filter: `blur(${gsap.utils.interpolate(6, 0, self.progress)}px)`,
          autoAlpha: self.progress,
        });
      },
    });

    return () => st.kill();
  }, [reducedMotion]);

  return (
    <div
      ref={contentRef}
      className="grid gap-10 border-t border-line py-16 md:grid-cols-[0.85fr_1.15fr] md:gap-16"
    >
      <div className="md:sticky md:top-32 md:self-start">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-line">
          <MediaSlot seed={story.seed} mediaSrc={story.mediaSrc} kind="image" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <StatCounter
          value={story.statValue}
          suffix={story.statSuffix}
          label={story.statLabel}
          className="mt-8"
        />
      </div>

      <div className="flex flex-col gap-8">
        <div>
          <span className="eyebrow text-ember">{story.creator}</span>
          <h3 className="font-display mt-2 text-3xl font-semibold text-paper md:text-4xl">
            Success Story
          </h3>
        </div>
        {ROWS.map((row) => (
          <div key={row.label}>
            <span className="eyebrow text-steel">{row.label}</span>
            <p className="mt-2 text-base text-paper-dim md:text-lg">{String(story[row.field])}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SuccessStories() {
  return (
    <section className="relative bg-ink py-8">
      <div className="container-px">
        <span className="eyebrow">Success Stories</span>
        <SplitHeading
          as="h2"
          type="lines"
          className="font-display mt-4 max-w-2xl text-4xl font-semibold text-paper md:text-5xl"
        >
          The proof, told like a documentary.
        </SplitHeading>
      </div>
      <div className="container-px">
        {stories.map((story) => (
          <StoryBlock key={story.slug} story={story} />
        ))}
      </div>
    </section>
  );
}
