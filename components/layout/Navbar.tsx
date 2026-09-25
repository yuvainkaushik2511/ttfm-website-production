"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { useLenis } from "@/lib/lenis";
import MagneticButton from "@/components/ui/MagneticButton";
import clsx from "clsx";

const LINKS = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#pillars" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const CREATORS_LINKS = [
  { label: "Universe", href: "#universe" },
  { label: "Reels", href: "#reels" },
  { label: "Growth", href: "#growth" },
  { label: "Stories", href: "#stories" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const lenisRef = useLenis();
  const pathname = usePathname();
  const isCreators = pathname?.startsWith("/creators") ?? false;
  const links = isCreators ? CREATORS_LINKS : LINKS;
  const ctaLabel = isCreators ? "Apply Now" : "Let's Build";
  const ctaHref = isCreators ? "#apply" : "#contact";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuRef.current) return;
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      gsap.set(menuRef.current, { display: "flex" });
      gsap.fromTo(
        menuRef.current,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power4.inOut" }
      );
      gsap.fromTo(
        menuRef.current.querySelectorAll(".mobile-link"),
        { yPercent: 120 },
        { yPercent: 0, duration: 0.7, stagger: 0.06, delay: 0.15, ease: "power4.out" }
      );
    } else {
      document.body.style.overflow = "";
      gsap.to(menuRef.current, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.5,
        ease: "power3.in",
        onComplete: () => gsap.set(menuRef.current, { display: "none" }),
      });
    }
  }, [menuOpen]);

  const goTo = (href: string) => {
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      if (lenisRef?.current) lenisRef.current.scrollTo(target as HTMLElement, { duration: 1.4 });
      else target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-[900] transition-all duration-500",
          scrolled ? "py-3" : "py-6"
        )}
      >
        <div
          className={clsx(
            "container-px flex items-center justify-between border-b transition-all duration-500",
            scrolled ? "border-line bg-ink/80 py-3 backdrop-blur-md" : "border-transparent"
          )}
        >
          {isCreators ? (
            <Link
              href="/"
              data-cursor="link"
              data-cursor-label="TTFM"
              className="font-display text-lg font-semibold tracking-tight text-paper"
            >
              TTFM <span className="text-ember">/ Creators</span>
            </Link>
          ) : (
            <a
              href="#top"
              data-cursor="link"
              onClick={(e) => {
                e.preventDefault();
                goTo("body");
                if (lenisRef?.current) lenisRef.current.scrollTo(0, { duration: 1.2 });
              }}
              className="font-display text-lg font-semibold tracking-tight text-paper"
            >
              TTFM <span className="text-ember">Production</span>
            </a>
          )}

          <nav className="hidden items-center gap-10 md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                data-cursor="link"
                onClick={(e) => {
                  e.preventDefault();
                  goTo(link.href);
                }}
                className="eyebrow text-paper-dim transition-colors hover:text-paper"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <MagneticButton
              as="a"
              href={ctaHref}
              onClick={() => goTo(ctaHref)}
              className="eyebrow rounded-full border border-paper/30 px-5 py-3 text-paper hover:border-ember hover:text-ember"
            >
              {ctaLabel}
            </MagneticButton>
          </div>

          <button
            aria-label="Toggle menu"
            data-cursor="link"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span
              className={clsx(
                "h-px w-6 bg-paper transition-transform duration-300",
                menuOpen && "translate-y-[3.5px] rotate-45"
              )}
            />
            <span
              className={clsx(
                "h-px w-6 bg-paper transition-transform duration-300",
                menuOpen && "-translate-y-[3.5px] -rotate-45"
              )}
            />
          </button>
        </div>
      </header>

      <div
        ref={menuRef}
        className="fixed inset-0 z-[850] hidden flex-col justify-center gap-6 bg-ink px-8 md:hidden"
        style={{ clipPath: "inset(0% 0% 100% 0%)" }}
      >
        {links.map((link) => (
          <div key={link.href} className="overflow-hidden">
            <a
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                goTo(link.href);
              }}
              className="mobile-link font-display block text-5xl font-medium text-paper"
            >
              {link.label}
            </a>
          </div>
        ))}
        <div className="overflow-hidden pt-4">
          <a
            href={ctaHref}
            onClick={(e) => {
              e.preventDefault();
              goTo(ctaHref);
            }}
            className="mobile-link font-editorial block text-3xl text-ember"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </>
  );
}
