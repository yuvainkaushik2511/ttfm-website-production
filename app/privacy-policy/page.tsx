import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://thetruefamemedia.com";
const TITLE = "Privacy Policy — TTFM Production";
const DESCRIPTION =
  "Privacy Policy for BK Media OS, operated by Yogender Kaushik under The True Fame Media.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/privacy-policy`,
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

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-ink py-32 md:py-40">
      <div className="container-px mx-auto max-w-[820px]">
        <span className="eyebrow">Legal</span>
        <h1 className="font-display mt-4 text-4xl font-semibold text-paper md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-steel">
          BK Media OS (operated by Yogender Kaushik / The True Fame Media) &middot; Effective date:
          25 September 2026
        </p>

        <div className="mt-8 rounded-sm border border-line bg-ink-raised/40 p-6 text-sm leading-relaxed text-paper-dim">
          <strong className="text-paper">BK Media OS uses YouTube API Services.</strong> By using
          BK Media OS you agree to be bound by the{" "}
          <a
            href="https://www.youtube.com/t/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-paper underline hover:text-ember"
          >
            YouTube Terms of Service
          </a>
          . Google&rsquo;s handling of data is described in the{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-paper underline hover:text-ember"
          >
            Google Privacy Policy
          </a>
          .
        </div>

        <Section heading="1. Who we are">
          <p>
            BK Media OS is a private, internal automation tool operated by Yogender Kaushik
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;) under the brand The True Fame Media
            (thetruefamemedia.com). It is used only to manage our own YouTube channel &ldquo;Bhagwat
            Kirtan&rdquo; (@bhagwatkirtan). It is not offered to the public or to other YouTube
            channels.
          </p>
        </Section>

        <Section heading="2. YouTube API Services we use">
          <p>
            With OAuth 2.0 authorization from the channel owner (us), BK Media OS uses the YouTube
            Data API v3, YouTube Analytics API and YouTube Live Streaming API to:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              upload our own original videos (initially as private), set titles, descriptions, tags,
              thumbnails and scheduled publish times;
            </li>
            <li>add our videos to our own playlists and post a comment on our own videos;</li>
            <li>create and manage livestreams on our own channel;</li>
            <li>
              read analytics for our own channel (views, watch time, retention, click-through rate,
              subscribers gained);
            </li>
            <li>
              read publicly available statistics (views, likes, comment counts, titles, durations) of
              other public devotional channels for market research.
            </li>
          </ul>
        </Section>

        <Section heading="3. Information we access, collect and store">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-paper">OAuth tokens</strong> for our own Google account, stored
              encrypted on our private server and never shared.
            </li>
            <li>
              <strong className="text-paper">Our own channel&rsquo;s videos, metadata and
              analytics.</strong>
            </li>
            <li>
              <strong className="text-paper">Public statistics of other channels&rsquo; public
              videos.</strong> Numeric statistics (views, likes, comment counts) and scores we derive
              from them are stored for up to 36 months. Other public data (for example video titles
              and channel names) is refreshed or deleted within 30 days.
            </li>
          </ul>
          <p>
            We do not collect personal information from YouTube viewers, do not access any other
            user&rsquo;s private data, and do not use cookies or tracking in BK Media OS. This
            website may use basic hosting logs from our hosting provider.
          </p>
        </Section>

        <Section heading="4. How we use information">
          <p>
            Only to publish and schedule our own content, run our livestreams, and measure and
            improve our own channel&rsquo;s performance. We do not sell, rent or share this
            information with third parties, and we do not use it for advertising.
          </p>
        </Section>

        <Section heading="5. Sharing">
          <p>
            We do not share YouTube API data with anyone. Data is processed only on our own server
            and by the Google APIs we call on our own behalf.
          </p>
        </Section>

        <Section heading="6. Data retention and deletion">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Data about our own channel is kept only while BK Media OS is in use and is deleted
              within 30 days after we stop using it.
            </li>
            <li>Public data about other channels follows the retention limits in section 3.</li>
            <li>
              To request deletion of any data relating to you, email us (section 8). We will
              complete the deletion within 7 days.
            </li>
          </ul>
        </Section>

        <Section heading="7. Revoking access">
          <p>
            Access granted to BK Media OS can be revoked at any time on the Google security settings
            page:{" "}
            <a
              href="https://security.google.com/settings/security/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-paper underline hover:text-ember"
            >
              security.google.com/settings/security/permissions
            </a>
            . After revocation, stored access tokens become invalid and are deleted from our server.
          </p>
        </Section>

        <Section heading="8. Contact">
          <p>
            Yogender Kaushik, The True Fame Media, India &middot; WhatsApp:{" "}
            <a href="https://wa.me/919671213139" target="_blank" rel="noopener noreferrer" className="text-paper underline hover:text-ember">
              +91 96712 13139
            </a>{" "}
            &middot; Email:{" "}
            <a href="mailto:connect@thetruefamemedia.com" className="text-paper underline hover:text-ember">
              connect@thetruefamemedia.com
            </a>
          </p>
        </Section>

        <Section heading="9. Changes">
          <p>We will post any update to this policy on this page and change the effective date above.</p>
        </Section>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-8 text-sm text-steel">
          <span>&copy; 2026 The True Fame Media</span>
          <Link href="/terms" className="underline hover:text-ember">
            Terms of Service
          </Link>
          <a
            href="https://www.youtube.com/t/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ember"
          >
            YouTube Terms of Service
          </a>
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ember"
          >
            Google Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
