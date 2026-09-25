// Mock content for the /creators route. Names and figures here are
// illustrative placeholders, not real creators, brands, or claims — swap in
// real client data before launch. Creator/BTS mediaSrc fields point at
// /creators/*.jpg — licensed stock photography (Unsplash License: free for
// commercial and noncommercial use) picked for niche/gender fit, downloaded
// into public/creators/. Brand logoSrc stays undefined deliberately — the
// brand names below are fictional, so using a real company's logo would
// misrepresent an actual partnership; those keep the generative wordmark
// treatment in BrandEcosystem.tsx instead.

export interface CreatorProfile {
  slug: string;
  name: string;
  niche: string;
  followers: string;
  engagement: string;
  highlight: string;
  seed: number;
  mediaSrc?: string;
}

export const creators: CreatorProfile[] = [
  { slug: "ananya-rao", name: "Ananya Rao", niche: "Fashion", followers: "2.4M", engagement: "6.8%", highlight: "Lakmé Fashion Week takeover series", seed: 0x4e4f5641, mediaSrc: "/creators/ananya-rao.jpg" },
  { slug: "arjun-mehta", name: "Arjun Mehta", niche: "Fitness", followers: "1.8M", engagement: "8.1%", highlight: "12-week transformation docuseries", seed: 0x4b41494d, mediaSrc: "/creators/arjun-mehta.jpg" },
  { slug: "chai-pe-charcha", name: "Chai Pe Charcha", niche: "Podcast", followers: "980K", engagement: "11.2%", highlight: "India's top-10 culture & business chart run", seed: 0x4c4f5744, mediaSrc: "/creators/chai-pe-charcha.jpg" },
  { slug: "kavya-malhotra", name: "Kavya Malhotra", niche: "Luxury", followers: "3.1M", engagement: "5.4%", highlight: "Global watch-house ambassador campaign", seed: 0x41524941, mediaSrc: "/creators/kavya-malhotra.jpg" },
  { slug: "rohan-kapoor", name: "Rohan Kapoor", niche: "Lifestyle", followers: "1.2M", engagement: "9.6%", highlight: "Mumbai apartment renovation series", seed: 0x4d494c4f, mediaSrc: "/creators/rohan-kapoor.jpg" },
  { slug: "meera-iyer", name: "Meera Iyer", niche: "Travel", followers: "2.0M", engagement: "7.3%", highlight: "40-country solo expedition archive", seed: 0x57524e41, mediaSrc: "/creators/meera-iyer.jpg" },
  { slug: "vikram-chawla", name: "Vikram Chawla", niche: "Business", followers: "760K", engagement: "10.4%", highlight: "Founder-to-exit build-in-public series", seed: 0x4a554e4f, mediaSrc: "/creators/vikram-chawla.jpg" },
  { slug: "priya-deshmukh", name: "Priya Deshmukh", niche: "Fashion", followers: "1.5M", engagement: "7.9%", highlight: "Sustainable streetwear capsule drop", seed: 0x52454d59, mediaSrc: "/creators/priya-deshmukh.jpg" },
  { slug: "karan-singh", name: "Karan Singh", niche: "Fitness", followers: "2.7M", engagement: "6.2%", highlight: "Combat-sports training method launch", seed: 0x44415348, mediaSrc: "/creators/karan-singh.jpg" },
  { slug: "ishita-bhatt", name: "Ishita Bhatt", niche: "Luxury", followers: "1.1M", engagement: "8.8%", highlight: "Private-jet lifestyle editorial series", seed: 0x49524953, mediaSrc: "/creators/ishita-bhatt.jpg" },
];

export interface Reel {
  slug: string;
  creator: string;
  title: string;
  seed: number;
  mediaSrc?: string;
  posterSrc?: string;
}

// mediaSrc here points at a static photo, not real video footage — MediaSlot
// is told kind="image" wherever a reel's mediaSrc is used (see ReelShowcase.tsx)
// so it renders as an <img>, not a broken <video src="*.jpg">. Swap to a real
// clip + posterSrc later without touching any component.
export const reels: Reel[] = [
  { slug: "runway-blur", creator: "Ananya Rao", title: "Runway Blur", seed: 0x1001, mediaSrc: "/creators/ananya-rao.jpg" },
  { slug: "iron-hours", creator: "Arjun Mehta", title: "Iron Hours", seed: 0x1002, mediaSrc: "/creators/arjun-mehta.jpg" },
  { slug: "off-mic", creator: "Chai Pe Charcha", title: "Off Mic", seed: 0x1003, mediaSrc: "/creators/chai-pe-charcha.jpg" },
  { slug: "timepiece", creator: "Kavya Malhotra", title: "Timepiece", seed: 0x1004, mediaSrc: "/creators/kavya-malhotra.jpg" },
  { slug: "slow-house", creator: "Rohan Kapoor", title: "Slow House", seed: 0x1005, mediaSrc: "/creators/rohan-kapoor.jpg" },
  { slug: "border-run", creator: "Meera Iyer", title: "Border Run", seed: 0x1006, mediaSrc: "/creators/meera-iyer.jpg" },
  { slug: "cap-table", creator: "Vikram Chawla", title: "Cap Table", seed: 0x1007, mediaSrc: "/creators/vikram-chawla.jpg" },
  { slug: "capsule-01", creator: "Priya Deshmukh", title: "Capsule 01", seed: 0x1008, mediaSrc: "/creators/priya-deshmukh.jpg" },
  { slug: "ring-work", creator: "Karan Singh", title: "Ring Work", seed: 0x1009, mediaSrc: "/creators/karan-singh.jpg" },
  { slug: "altitude", creator: "Ishita Bhatt", title: "Altitude", seed: 0x100a, mediaSrc: "/creators/ishita-bhatt.jpg" },
];

export interface Brand {
  slug: string;
  name: string;
  category: string;
  caseStudy: string;
  seed: number;
  logoSrc?: string;
}

export const brands: Brand[] = [
  { slug: "verdant", name: "Verdant", category: "Beauty", caseStudy: "A 6-creator seeding campaign that turned into Verdant's best-performing quarter of organic search.", seed: 0x2001 },
  { slug: "northline", name: "Northline", category: "Outdoor", caseStudy: "Meera Iyer's expedition series became Northline's highest-converting ad creative for 9 straight weeks.", seed: 0x2002 },
  { slug: "cadence", name: "Cadence", category: "Audio", caseStudy: "Chai Pe Charcha's sponsor-read format lifted Cadence's app installs 34% quarter over quarter.", seed: 0x2003 },
  { slug: "hearth", name: "Hearth", category: "Home", caseStudy: "Rohan's renovation arc drove Hearth's single largest single-day revenue day in company history.", seed: 0x2004 },
  { slug: "vantage", name: "Vantage", category: "Finance", caseStudy: "Vikram Chawla's build-in-public series became Vantage's top acquisition channel for premium accounts.", seed: 0x2005 },
  { slug: "solstice", name: "Solstice", category: "Fashion", caseStudy: "Priya Deshmukh's capsule drop sold out in under four hours across every Solstice market.", seed: 0x2006 },
];

export interface SuccessStory {
  slug: string;
  creator: string;
  before: string;
  process: string;
  growth: string;
  results: string;
  statValue: number;
  statSuffix: string;
  statLabel: string;
  seed: number;
  mediaSrc?: string;
}

export const stories: SuccessStory[] = [
  {
    slug: "arjun-mehta",
    creator: "Arjun Mehta",
    before: "A fitness creator with a loyal but plateaued following of 240K, no brand infrastructure, and no repeatable content system.",
    process: "TTFM built a weekly production cadence, a signature docuseries format, and a direct-to-brand pitch deck inside 60 days.",
    growth: "Following grew 7.5x over 14 months on the back of the transformation-series format, with engagement rate holding above 8%.",
    results: "Now runs a training-method licensing business built entirely from the audience TTFM helped grow.",
    statValue: 650,
    statSuffix: "%",
    statLabel: "Follower Growth",
    seed: 0x3001,
    mediaSrc: "/creators/arjun-mehta.jpg",
  },
  {
    slug: "vikram-chawla",
    creator: "Vikram Chawla",
    before: "A first-time founder posting inconsistently, with strong ideas but no distribution and no creator-market fit.",
    process: "TTFM repositioned the content around a build-in-public arc, paired with a growth-engine media plan across three platforms.",
    growth: "Grew from under 40K to 760K in eleven months, becoming a reference account in the founder-content category.",
    results: "The audience became the seed investor list and first customer base for two subsequent product launches.",
    statValue: 18,
    statSuffix: "x",
    statLabel: "Audience Growth",
    seed: 0x3002,
    mediaSrc: "/creators/vikram-chawla.jpg",
  },
  {
    slug: "priya-deshmukh",
    creator: "Priya Deshmukh",
    before: "A wardrobe stylist with strong taste but no personal brand, working exclusively as an uncredited freelancer.",
    process: "TTFM built a signature visual identity, negotiated the first capsule-collection deal, and ran the launch media plan.",
    growth: "Personal following grew past 1.5M, with the capsule drop becoming the case study brands now ask for by name.",
    results: "Now fronts an ongoing capsule-collection program with a standing production and brand-deal pipeline.",
    statValue: 410,
    statSuffix: "%",
    statLabel: "Revenue Growth",
    seed: 0x3003,
    mediaSrc: "/creators/priya-deshmukh.jpg",
  },
];

export interface Stat {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
}

export const stats: Stat[] = [
  { value: 100, suffix: "M+", label: "Creator Reach" },
  { value: 500, suffix: "+", label: "Projects Delivered" },
  { value: 50, suffix: "+", label: "Brands Connected" },
  { value: 8, suffix: "x", label: "Average Growth Multiple" },
];

export interface JourneyStep {
  stage: string;
  title: string;
  description: string;
}

export const journeySteps: JourneyStep[] = [
  { stage: "01", title: "Discover", description: "We find creators with a distinct point of view before the algorithm does." },
  { stage: "02", title: "Create", description: "A production system built around your format, not a generic content calendar." },
  { stage: "03", title: "Grow", description: "Distribution strategy tuned per platform, per audience, per release." },
  { stage: "04", title: "Monetize", description: "Brand infrastructure that turns reach into standing revenue, not one-off deals." },
  { stage: "05", title: "Build a Brand", description: "The audience becomes the company — products, ventures, a category of one." },
];

export interface GrowthNode {
  label: string;
  description: string;
}

export const growthNodes: GrowthNode[] = [
  { label: "Creator", description: "A distinct voice with real point of view." },
  { label: "Content", description: "A repeatable, signature production format." },
  { label: "Audience", description: "A community that shows up on release day." },
  { label: "Distribution", description: "The right platform mix, tuned per release." },
  { label: "Brands", description: "Partners who want the audience, not just the reach." },
  { label: "Revenue", description: "Standing income, not one-off brand deals." },
];

export interface BtsFrame {
  slug: string;
  caption: string;
  seed: number;
  mediaSrc?: string;
}

export const btsFrames: BtsFrame[] = [
  { slug: "studio-set", caption: "Studio build, week one", seed: 0x4001, mediaSrc: "/creators/bts-studio-set.jpg" },
  { slug: "shoot-day", caption: "Shoot day, Ananya Rao campaign", seed: 0x4002, mediaSrc: "/creators/bts-shoot-day.jpg" },
  { slug: "edit-bay", caption: "Edit bay, overnight pass", seed: 0x4003, mediaSrc: "/creators/bts-edit-bay.jpg" },
  { slug: "brand-call", caption: "Brand deal negotiation", seed: 0x4004, mediaSrc: "/creators/bts-brand-call.jpg" },
  { slug: "drone-pass", caption: "Aerial unit, Meera Iyer expedition", seed: 0x4005, mediaSrc: "/creators/bts-drone-pass.jpg" },
  { slug: "motion-graphics", caption: "Motion graphics pass", seed: 0x4006, mediaSrc: "/creators/bts-motion-graphics.jpg" },
];

export interface ApplicationStepDef {
  id: string;
  title: string;
  question: string;
  fieldType: "text" | "select" | "number" | "textarea" | "links";
  fieldName: string;
  options?: string[];
  placeholder?: string;
}

export const applicationSteps: ApplicationStepDef[] = [
  { id: "identity", title: "Who are you?", question: "Tell us your name and what you go by online.", fieldType: "text", fieldName: "name", placeholder: "Your name" },
  { id: "niche", title: "Content niche?", question: "What's the world you create in?", fieldType: "select", fieldName: "niche", options: ["Fashion", "Fitness", "Podcast", "Luxury", "Lifestyle", "Travel", "Business", "Other"] },
  { id: "followers", title: "Follower count?", question: "Roughly how large is your current audience?", fieldType: "select", fieldName: "followers", options: ["Under 10K", "10K–100K", "100K–500K", "500K–1M", "1M+"] },
  { id: "goals", title: "Your goals?", question: "What does the next 12 months look like if this works?", fieldType: "textarea", fieldName: "goals", placeholder: "Tell us what you're building toward" },
  { id: "portfolio", title: "Portfolio links?", question: "Drop links to your best work — profiles, reels, anything.", fieldType: "links", fieldName: "portfolio", placeholder: "https://" },
  { id: "submit", title: "Submit", question: "Review your application before it goes to our team.", fieldType: "text", fieldName: "email", placeholder: "Best email to reach you" },
];
