import type { Metadata } from "next";
import CreatorsThemeScope from "@/components/creators/CreatorsThemeScope";
import CreatorsAmbient from "@/components/creators/CreatorsAmbient";

const SITE_URL = "https://thetruefamemedia.com";
const TITLE = "TTFM Creators — The next generation of creators";
const DESCRIPTION =
  "TTFM Creators is a creator growth ecosystem. We discover, build, produce and scale creators into brands.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/creators",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/creators`,
    siteName: "TTFM Creators",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Server component (required to keep `export const metadata` valid — see AGENTS.md
// guidance and the plan's R7 note; the project has no cacheComponents flag set in
// next.config.ts, so no Suspense boundary is needed downstream for usePathname).
// All client behavior — theme override, always-alive background — lives in the
// client children below.
export default function CreatorsLayout({ children }: { children: React.ReactNode }) {
  return (
    <CreatorsThemeScope>
      <CreatorsAmbient />
      {children}
    </CreatorsThemeScope>
  );
}
