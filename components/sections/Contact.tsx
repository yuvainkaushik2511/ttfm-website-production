"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import SplitHeading from "@/components/ui/SplitHeading";
import MagneticButton from "@/components/ui/MagneticButton";
import FrameLine from "@/components/ui/FrameLine";

const CONTACT_ROWS = [
  { label: "Email", value: "connect@thetruefamemedia.com", href: "mailto:connect@thetruefamemedia.com" },
  { label: "WhatsApp", value: "+91 96712 13139", href: "https://wa.me/919671213139" },
  { label: "Website", value: "thetruefamemedia.com", href: "https://thetruefamemedia.com" },
  { label: "Instagram", value: "@thetruefamemedia", href: "https://instagram.com/thetruefamemedia" },
];

const WHATSAPP_CTA_HREF =
  "https://wa.me/919671213139?text=Hi%20TTFM%20Production%2C%20I%20want%20to%20discuss%20a%20project";

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Entrance-only clip-path reveal on the background image, paired with a
  // blur-settle on the headline (no pin — this is the final CTA, it shouldn't
  // feel gated) so it arrives like the camera settling on the last stop.
  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const image = imageRef.current;
    if (reducedMotion || !section || !content || !image) return;
    registerGsap();

    gsap.set(content, { filter: "blur(6px)", autoAlpha: 0, y: 24 });
    gsap.set(image, { clipPath: "inset(0% 0% 100% 0%)" });

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 75%",
      end: "top 30%",
      scrub: 0.6,
      onUpdate: (self) => {
        gsap.set(image, { clipPath: `inset(0% 0% ${100 - self.progress * 100}% 0%)` });
        gsap.set(content, {
          filter: `blur(${gsap.utils.interpolate(6, 0, self.progress)}px)`,
          autoAlpha: self.progress,
          y: gsap.utils.interpolate(24, 0, self.progress),
        });
      },
    });

    return () => st.kill();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative overflow-hidden border-t border-line bg-ink py-32 md:py-44"
    >
      <div ref={imageRef} className="absolute inset-0">
        <Image
          src="/images/crew-set-gathering.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-ink/70 to-ink" />

      <div
        ref={contentRef}
        className="container-px relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center"
      >
        <span className="eyebrow">Contact</span>

        <SplitHeading
          as="h2"
          type="chars"
          className="font-headline mt-6 text-[13vw] leading-[0.9] text-paper sm:text-[8vw] md:text-[5.5vw]"
        >
          Have a story worth making?
        </SplitHeading>

        <MagneticButton
          as="a"
          href={WHATSAPP_CTA_HREF}
          target="_blank"
          rel="noopener noreferrer"
          cursorLabel="Start"
          className="mt-14 rounded-full bg-paper px-9 py-5 font-display text-base font-medium text-ink hover:bg-ember"
        >
          Start a Project
        </MagneticButton>

        <FrameLine className="mt-20 max-w-2xl" />

        <div className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-x-6 gap-y-8 text-left md:grid-cols-4">
          {CONTACT_ROWS.map((row) => (
            <a
              key={row.label}
              href={row.href}
              target={row.href.startsWith("http") ? "_blank" : undefined}
              rel={row.href.startsWith("http") ? "noopener noreferrer" : undefined}
              data-cursor="link"
              className="group"
            >
              <span className="eyebrow block text-steel">{row.label}</span>
              <span className="mt-2 block text-sm text-paper transition-colors group-hover:text-ember">
                {row.value}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
