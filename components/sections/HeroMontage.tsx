"use client";

import { forwardRef, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

// A fast cinematic montage instead of one looping background clip — several
// short, varied clips cross-cut on a beat, like a production reel rather than
// a static corporate video background. All clips are preloaded and stacked
// (opacity-toggled), not swapped via `src`, so cuts are instant with no reload
// stutter.
const CLIPS = [
  { src: "/videos/hero-clapperboard.mp4", holdMs: 2200 },
  { src: "/videos/crew-director-shoot.mp4", holdMs: 1800 },
  { src: "/videos/camera-lens-closeup.mp4", holdMs: 1400 },
  { src: "/videos/cameraman-filming.mp4", holdMs: 1800 },
  { src: "/videos/clapperboard-scene.mp4", holdMs: 2000 },
];

const HeroMontage = forwardRef<HTMLDivElement, { className?: string }>(function HeroMontage(
  { className },
  ref
) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const videos = videoRefs.current.filter((v): v is HTMLVideoElement => v !== null);
    if (!videos.length) return;

    gsap.set(videos, { autoAlpha: 0 });
    gsap.set(videos[0], { autoAlpha: 1 });
    // Only the visible clip decodes; the rest stay paused (5 simultaneous
    // decodes + the rest of the page's video was crashing laptop tabs).
    videos[0].play().catch(() => {});

    let index = 0;
    let cancelled = false;
    let onScreen = true;

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) videos[index].play().catch(() => {});
      else videos.forEach((v) => v.pause());
    });
    const container = videos[0].parentElement;
    if (container) io.observe(container);

    const advance = () => {
      if (cancelled) return;
      const next = (index + 1) % videos.length;
      // Quick cross-cut (fast crossfade), not a hard pop — "occasional slow
      // shot, occasional flash" per the brief's varied-transition note comes
      // from the per-clip hold durations, not the cut style itself.
      const prev = videos[index];
      if (onScreen) videos[next].play().catch(() => {});
      gsap.to(prev, { autoAlpha: 0, duration: 0.25, ease: "power1.in", onComplete: () => prev.pause() });
      gsap.to(videos[next], { autoAlpha: 1, duration: 0.25, ease: "power1.out" });
      index = next;
      timeout = window.setTimeout(advance, CLIPS[index].holdMs);
    };

    let timeout = window.setTimeout(advance, CLIPS[0].holdMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      io.disconnect();
      videos.forEach((v) => v.pause());
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {CLIPS.map((clip, i) => (
        <video
          key={clip.src}
          ref={(el) => {
            videoRefs.current[i] = el;
          }}
          src={clip.src}
          preload={i === 0 ? "auto" : "metadata"}
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ))}
    </div>
  );
});

export default HeroMontage;
