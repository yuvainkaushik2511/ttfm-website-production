import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://thetruefamemedia.com";
const TITLE = "Terms of Service — TTFM Production";
const DESCRIPTION =
  "Terms of Service for BK Media OS, operated by Yogender Kaushik under The True Fame Media.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/terms`,
    siteName: "TTFM Production",
    type: "website",
    locale: "en_US",
  },
};

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-8">
      <h2 className="font-display text-xl font-medium text-paper md:text-2xl">{heading}</h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-paper-dim">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="bg-ink py-32 md:py-40">
      <div className="container-px mx-auto max-w-[820px]">
        <span className="eyebrow">Legal</span>
        <h1 className="font-display mt-4 text-4xl font-semibold text-paper md:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-steel">
          BK Media OS (operated by Yogender Kaushik / The True Fame Media) &middot; Effective date:
          25 September 2026
        </p>

        <div className="mt-8 rounded-sm border border-line bg-ink-raised/40 p-6 text-sm leading-relaxed text-paper-dim">
          BK Media OS uses YouTube API Services. Anyone using BK Media OS agrees to be bound by the{" "}
          <a
            href="https://www.youtube.com/t/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-paper underline hover:text-ember"
          >
            YouTube Terms of Service
          </a>
          . See also the{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-paper underline hover:text-ember"
          >
            Google Privacy Policy
          </a>{" "}
          and our{" "}
          <Link href="/privacy-policy" className="text-paper underline hover:text-ember">
            Privacy Policy
          </Link>
          .
        </div>

        <Section heading="1. Service">
          <p>
            BK Media OS is a private internal tool used only by its operator to upload, schedule and
            analyse content on the operator&rsquo;s own YouTube channel &ldquo;Bhagwat Kirtan&rdquo;
            (@bhagwatkirtan). It is not sold, licensed or made available to third parties.
          </p>
        </Section>

        <Section heading="2. Authorized use">
          <p>
            Only the channel owner may use BK Media OS, and only with the owner&rsquo;s own Google
            account through OAuth 2.0. Use must comply with the YouTube Terms of Service, the
            YouTube API Services Terms of Service and Developer Policies, and YouTube Community
            Guidelines.
          </p>
        </Section>

        <Section heading="3. Content">
          <p>
            All content published through BK Media OS is original content owned by the operator.
            Where content is created with AI tools, it is disclosed in the video description and via
            YouTube&rsquo;s altered or synthetic content setting.
          </p>
        </Section>

        <Section heading="4. No warranty">
          <p>
            The tool is provided &ldquo;as is&rdquo; for internal use. The operator is responsible
            for all content published through it.
          </p>
        </Section>

        <Section heading="5. Termination">
          <p>
            Access can be revoked at any time at{" "}
            <a
              href="https://security.google.com/settings/security/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-paper underline hover:text-ember"
            >
              Google security settings
            </a>
            . After revocation, stored data is handled as described in the Privacy Policy.
          </p>
        </Section>

        <Section heading="6. Governing law and contact">
          <p>
            These terms are governed by the laws of India. Contact:{" "}
            <a href="mailto:connect@thetruefamemedia.com" className="text-paper underline hover:text-ember">
              connect@thetruefamemedia.com
            </a>
          </p>
        </Section>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-8 text-sm text-steel">
          <span>&copy; 2026 The True Fame Media</span>
          <Link href="/privacy-policy" className="underline hover:text-ember">
            Privacy Policy
          </Link>
          <a
            href="https://www.youtube.com/t/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ember"
          >
            YouTube Terms of Service
          </a>
        </div>
      </div>
    </div>
  );
}
