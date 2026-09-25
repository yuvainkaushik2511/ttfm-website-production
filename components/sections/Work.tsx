"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { verticals } from "@/data/verticals";
import SplitHeading from "@/components/ui/SplitHeading";
import LazyVideo from "@/components/ui/LazyVideo";

type Layout = "full" | "split-left" | "split-right" | "compact";

interface Item {
  slug: string;
  layout: Layout;
  media: { type: "video" | "image"; src: string };
}

// Each entry gets its own composition — full-bleed, split with text on the
// opposite side, or a small frame in a sea of whitespace — instead of one
// repeated card shape. Media alternates video/photography per the brief's
// "use video where video, photography where photography" instruction.
const ITEMS: Item[] = [
  { slug: "film", layout: "full", media: { type: "video", src: "/videos/hero-clapperboard.mp4" } },
  { slug: "music-videos", layout: "split-right", media: { type: "image", src: "/images/crew-set-gathering.jpg" } },
  { slug: "advertising", layout: "full", media: { type: "video", src: "/videos/car-sunset-drive.mp4" } },
  { slug: "casting", layout: "split-left", media: { type: "image", src: "/images/camera-operator.jpg" } },
  { slug: "photography", layout: "compact", media: { type: "image", src: "/images/camera-equipment-detail.jpg" } },
  { slug: "post", layout: "split-right", media: { type: "video", src: "/videos/editing-timeline.mp4" } },
  { slug: "studio", layout: "full", media: { type: "image", src: "/images/cinematographer-silhouette.jpg" } },
];

function WorkMedia({ item }: { item: Item }) {
  if (item.media.type === "video") {
    return (
      <LazyVideo
        src={item.media.src}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <Image
      src={item.media.src}
      alt=""
      fill
      sizes={item.layout === "compact" ? "(min-width: 768px) 24rem, 20rem" : "(min-width: 768px) 50vw, 100vw"}
      className="object-cover"
    />
  );
}

function WorkRow({ item, data }: { item: Item; data: (typeof verticals)[number] }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const row = rowRef.current;
    const media = mediaRef.current;
    if (!row || !media || reducedMotion) return;
    registerGsap();

    gsap.set(media, { scale: 0.88, autoAlpha: 0 });
    gsap.set(row.querySelectorAll("[data-text]"), { autoAlpha: 0, y: 20 });

    const st = ScrollTrigger.create({
      trigger: row,
      start: "top 85%",
      onEnter: () => {
        gsap.to(media, { scale: 1, autoAlpha: 1, duration: 1.1, ease: "power3.out" });
        gsap.to(row.querySelectorAll("[data-text]"), {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          delay: 0.15,
          ease: "power3.out",
        });
      },
    });

    return () => st.kill();
  }, [reducedMotion]);

  const text = (
    <div>
      <span data-text className="font-display block text-2xl text-steel md:text-3xl">
        {data.code}
      </span>
      <h3 data-text className="font-headline mt-2 text-3xl text-paper md:text-5xl">
        {data.name}
      </h3>
      <p data-text className="mt-4 max-w-sm text-base text-paper-dim md:text-lg">
        {data.descriptor}
      </p>
    </div>
  );

  if (item.layout === "full") {
    return (
      <div ref={rowRef} className="relative h-[85vh] w-full overflow-hidden">
        <div ref={mediaRef} className="absolute inset-0">
          <WorkMedia item={item} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
        <div className="container-px absolute inset-x-0 bottom-12 md:bottom-16">{text}</div>
      </div>
    );
  }

  if (item.layout === "compact") {
    return (
      <div ref={rowRef} className="container-px flex flex-col items-center gap-10 py-24 text-center md:py-32">
        <div ref={mediaRef} className="relative aspect-[4/5] w-full max-w-xs overflow-hidden rounded-sm md:max-w-sm">
          <WorkMedia item={item} />
        </div>
        {text}
      </div>
    );
  }

  const imageFirst = item.layout === "split-left";
  return (
    <div
      ref={rowRef}
      className={`container-px grid items-center gap-10 py-20 md:grid-cols-2 md:gap-16 md:py-28 ${
        imageFirst ? "" : "md:[&>*:first-child]:order-2"
      }`}
    >
      <div ref={mediaRef} className="relative aspect-[3/4] w-full overflow-hidden md:aspect-[4/5]">
        <WorkMedia item={item} />
      </div>
      {text}
    </div>
  );
}

export default function Work() {
  return (
    <section id="work" className="relative overflow-hidden bg-ink">
      <div className="container-px pt-24">
        <span className="eyebrow">Selected Work</span>
        <SplitHeading
          as="h2"
          type="lines"
          start="top 90%"
          className="font-headline mt-4 max-w-2xl text-4xl text-paper md:text-5xl"
        >
          A showreel is in production. Here&rsquo;s what we make until then.
        </SplitHeading>
      </div>

      <div className="mt-14 flex flex-col divide-y divide-line border-t border-line">
        {ITEMS.map((item) => {
          const data = verticals.find((v) => v.slug === item.slug);
          if (!data) return null;
          return <WorkRow key={item.slug} item={item} data={data} />;
        })}
      </div>
    </section>
  );
}
