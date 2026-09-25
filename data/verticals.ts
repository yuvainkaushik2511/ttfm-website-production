// TTFM Productions' own service disciplines — NOT the wider TTFM group's
// portfolio of separate businesses (that's a different company/site), and not
// The True Fame Media's PR/digital-growth business either (also separate).
// This file drives every "flythrough the crafts" surface on this Productions
// site: Ecosystem's 3D graph, CompanyShowcase's marquee, Pillars' numbered
// list, and Work's horizontal reel.
export type VerticalStatus = "live" | "launching";

export interface Vertical {
  slug: string;
  code: string;
  name: string;
  descriptor: string;
  status: VerticalStatus;
}

export const verticals: Vertical[] = [
  {
    slug: "film",
    code: "01",
    name: "Film Production",
    descriptor: "Feature films, short films and original narrative content.",
    status: "live",
  },
  {
    slug: "music-videos",
    code: "02",
    name: "Music Videos",
    descriptor: "Concept, direction and production for music videos.",
    status: "live",
  },
  {
    slug: "advertising",
    code: "03",
    name: "Advertising Films",
    descriptor: "Brand films and commercial advertising content.",
    status: "live",
  },
  {
    slug: "casting",
    code: "04",
    name: "Casting & Talent",
    descriptor: "Casting for productions, talent sourcing and coordination.",
    status: "live",
  },
  {
    slug: "photography",
    code: "05",
    name: "Photography",
    descriptor: "Photography direction for campaigns, editorial and productions.",
    status: "live",
  },
  {
    slug: "post",
    code: "06",
    name: "Post-Production",
    descriptor: "Editing, color grading, VFX, motion graphics and sound design.",
    status: "live",
  },
  {
    slug: "studio",
    code: "07",
    name: "Studio & Creator Space",
    descriptor: "In-house studio space and production infrastructure.",
    status: "live",
  },
];
