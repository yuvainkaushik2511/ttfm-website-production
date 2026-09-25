"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLenis } from "@/lib/lenis";

const YOUTUBE_HREF = "https://www.youtube.com/@bhagwatkirtan";

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "YouTube Terms of Service", href: "https://www.youtube.com/t/terms", external: true },
];

export default function Footer() {
  const lenisRef = useLenis();
  const pathname = usePathname();
  const isCreators = pathname?.startsWith("/creators") ?? false;

  const backToTop = () =>
    lenisRef?.current
      ? lenisRef.current.scrollTo(0, { duration: 1.4 })
      : window.scrollTo(0, 0);


  // The creators route's own last section (CreatorsFinale) is the "immersive
  // final scene" the spec asks for — this shared, site-wide Footer stays a quiet
  // legal strip underneath it, dropping the corporate contact columns that don't
  // belong to the creators sub-brand.
  if (isCreators) {
    return (
      <footer className="border-t border-line">
        <div className="container-px flex flex-col gap-3 border-t border-line py-6 text-xs text-steel md:flex-row md:items-center md:justify-between">
          <span>&copy; 2022&ndash;{new Date().getFullYear()} TTFM Production &middot; A unit of The True Fame Media. All rights reserved.</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  data-cursor="link"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ember"
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} data-cursor="link" href={link.href} className="hover:text-ember">
                  {link.label}
                </Link>
              )
            )}
            <Link data-cursor="link" href="/" className="hover:text-ember">
              TTFM Production &#8599;
            </Link>
            <button data-cursor="link" onClick={backToTop} className="hover:text-ember">
              Back to top
            </button>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-line">
      <div className="container-px grid gap-12 py-16 md:grid-cols-[1fr_auto_auto] md:gap-16">
        <div>
          <div className="font-display text-3xl font-semibold text-paper">TTFM Production</div>
          <p className="mt-3 max-w-xs text-sm text-steel">
            Films, music videos and campaigns — produced end to end.
          </p>
        </div>

        <div>
          <span className="eyebrow text-steel">Explore</span>
          <nav className="mt-4 flex flex-col gap-2 text-sm text-paper-dim">
            <a data-cursor="link" href="#top" className="hover:text-ember">
              Home
            </a>
            <a data-cursor="link" href="#work" className="hover:text-ember">
              Work
            </a>
            <a data-cursor="link" href="#pillars" className="hover:text-ember">
              Services
            </a>
            <a data-cursor="link" href="#about" className="hover:text-ember">
              About
            </a>
            <Link data-cursor="link" href="/creators" className="hover:text-ember">
              Creators
            </Link>
          </nav>
        </div>

        <div>
          <span className="eyebrow text-steel">Follow</span>
          <div className="mt-4 flex flex-col gap-2 text-sm text-paper-dim">
            <a
              data-cursor="link"
              href="https://instagram.com/thetruefamemedia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ember"
            >
              Instagram
            </a>
            <a data-cursor="link" href={YOUTUBE_HREF} target="_blank" rel="noopener noreferrer" className="hover:text-ember">
              YouTube &mdash; Bhagwat Kirtan
            </a>
            <button data-cursor="link" onClick={backToTop} className="text-left hover:text-ember">
              Back to top
            </button>
          </div>
        </div>
      </div>
      <div className="container-px flex flex-col gap-3 border-t border-line py-6 text-xs text-steel md:flex-row md:items-center md:justify-between">
        <span>&copy; 2022&ndash;{new Date().getFullYear()} TTFM Production &middot; A unit of The True Fame Media. All rights reserved.</span>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {LEGAL_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                data-cursor="link"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ember"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.href} data-cursor="link" href={link.href} className="hover:text-ember">
                {link.label}
              </Link>
            )
          )}
        </div>
      </div>
    </footer>
  );
}
