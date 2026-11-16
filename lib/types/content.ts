/**
 * Content model shared by the public site and the admin panel.
 *
 * Mirrors the backend schemas (api.chamathdilshan.dev app/schemas/*.py).
 * Section keys match the backend registry exactly.
 */

export type NavKey = "home" | "projects" | "about" | "journal" | "contact";

export type HomeBlock =
  | "about"
  | "stack"
  | "work"
  | "services"
  | "pricing"
  | "testimonials"
  | "cta"
  | "numbers"
  | "journal";

export type Cta = { label: string; href: string };
export type Stat = { label: string; value: string };
export type ImageRef = { url: string; alt: string };
export type MediaItem = { kind: "image" | "video"; url: string; alt: string; poster?: string | null };

/* --- global --------------------------------------------------------------- */

export type SiteSettings = {
  name: string;
  wordmark: string;
  logo: string;
  email: string;
  year: string;
  github: string;
  description: string;
};

export type Navigation = { items: Array<{ key: NavKey; title: string; href: string }> };

export type Faq = {
  title: string;
  reel: { image: string; label: string; meta: string; href: string };
  items: Array<{ question: string; answer: string }>;
};

export type Footer = {
  heading: string;
  cta: Cta;
  /** `{year}` is replaced with the year from site settings. */
  copyright: string;
  credit: { label: string; linkLabel: string; href: string };
};

/* --- home ----------------------------------------------------------------- */

export type HomeLayout = { sections: Array<{ section: HomeBlock; visible: boolean }> };

export type HomeHero = {
  image: string;
  imageAlt: string;
  intro: { line1: string; line2: string; line2Dim: string; line3Dim: string };
  cta: Cta;
  disciplines: string[];
};

export type HomeAbout = {
  title: string;
  aside: string;
  statement: string;
  image: string;
  imageAlt: string;
  pre: string;
  post: string;
  results: Stat[];
  cta: Cta;
};

export type HomeWork = { title: string; aside: string; cta: Cta; seeAllThumb: string };

export type ServiceItem = { number: string; title: string; heading: string; body: string; image: string };

export type HomeServices = {
  title: string;
  aside: string;
  statement: string;
  poster: string;
  posterAlt: string;
  cta: Cta;
  items: ServiceItem[];
};

export type PricingPlan = {
  name: string;
  description: string;
  price: string;
  unit: string;
  tone: "light" | "dark";
  included: string[];
};

export type HomePricing = { title: string; aside: string; includedHeading: string; plans: PricingPlan[]; cta: Cta };

export type Testimonial = { quote: string; name: string; role: string; company: string; project: string };

export type HomeTestimonials = { title: string; aside: string; items: Testimonial[] };

export type HomeCta = {
  marquee: string;
  background: string;
  backgroundAlt: string;
  action: Cta;
};

export type NumberItem = { value: string; title: string; body: string };
export type HomeNumbers = { title: string; aside: string; items: NumberItem[] };
export type HomeJournal = { title: string; aside: string; cta: Cta };

/* --- pages ---------------------------------------------------------------- */

export type ListPage = {
  /** Two lines, e.g. ["Latest", "Projects"]. */
  title: string[];
  image: string;
  imageAlt: string;
  description: string;
  listTitle: string;
  listAside: string;
};

export type AboutPage = { title: string; image: string; imageAlt: string; label: string; blurb: string };

/** Heading for the work timeline; the roles come from /api/experience. */
export type AboutExperience = { title: string; aside: string };

export type ProcessStep = { number: string; title: string; body: string; included: string[] };
export type AboutProcess = {
  title: string;
  aside: string;
  statement: string;
  image: string;
  imageAlt: string;
  steps: ProcessStep[];
};

export type ToolboxItem = { name: string; role: string; image: string | null };
export type AboutToolbox = { title: string; aside: string; items: ToolboxItem[] };

export type AboutRecognition = {
  title: string;
  aside: string;
  rows: Array<{ count: string; award: string; project: string; result: string }>;
};

export type AboutStack = { title: string; aside: string };

export type ContactIcon = "rocket" | "code" | "server" | "bulb" | "sparkles";
export type ContactPage = {
  title: string;
  intro: string;
  image: string;
  imageAlt: string;
  categories: Array<{ value: string; title: string; description: string; icon: ContactIcon }>;
};

/** Every editable section, keyed exactly like the backend registry. */
export type SiteContent = {
  site: SiteSettings;
  navigation: Navigation;
  faq: Faq;
  footer: Footer;
  "home.layout": HomeLayout;
  "home.hero": HomeHero;
  "home.about": HomeAbout;
  "home.work": HomeWork;
  "home.services": HomeServices;
  "home.pricing": HomePricing;
  "home.testimonials": HomeTestimonials;
  "home.cta": HomeCta;
  "home.numbers": HomeNumbers;
  "home.journal": HomeJournal;
  "page.projects": ListPage;
  "page.blog": ListPage;
  "page.about": AboutPage;
  "about.experience": AboutExperience;
  "about.process": AboutProcess;
  "about.toolbox": AboutToolbox;
  "about.recognition": AboutRecognition;
  "about.stack": AboutStack;
  "page.contact": ContactPage;
};

export type SectionKey = keyof SiteContent;

/* --- collections ---------------------------------------------------------- */

export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  /** One sentence for the hero. */
  summary: string;
  /** Card image for grids, the home stack and testimonials. */
  thumbnail: ImageRef;
  /** Image or video behind the case-study title. */
  hero: MediaItem;
  /** The large statement under "The Project". */
  intro: string;
  discover: string;
  explore: string;
  results: Stat[];
  gallery: MediaItem[];
  tech: string[];
  liveUrl: string | null;
  repoUrl: string | null;
  /** Shown in Selected Work on the home page. */
  featured: boolean;
  /** Optional Studio presentation data; legacy projects remain unchanged. */
  template?: string;
  templateConfig?: Record<string, unknown>;
  studioContent?: {
    headline?: string;
    brief?: Record<string, string>;
    architecture?: Array<{ title: string; body: string }>;
    features?: string[];
    techStack?: Record<string, string[]>;
    aiUsage?: string[];
    links?: Record<string, string>;
    caseStudy?: Record<string, string | string[]>;
    evidence?: Array<{ path: string; claim: string; confidence: string }>;
    sectionImages?: Record<string, Array<{ url: string; alt?: string }>>;
  };
  seo?: { description?: string; keywords?: string[] };
  repositories?: Array<{ url: string; name: string; owner: string; role?: string; primary?: boolean; visibility?: string; language?: string | null; stars?: number }>;
};

export type PostSection = {
  title: string;
  paragraphs: string[];
  /** One full-width image or two side by side, shown after the section. */
  images: ImageRef[];
  /** Optional for articles saved before section videos were supported. */
  videos?: MediaItem[];
};

export type Post = {
  slug: string;
  title: string;
  category: string;
  /** ISO date. */
  date: string;
  excerpt: string;
  cover: MediaItem;
  sections: PostSection[];
};

export type Skill = {
  name: string;
  category: string;
  icon: string | null;
  /** In the scrolling strip on the home page. */
  featured: boolean;
  /** In the Stack grid on the about page. */
  visible: boolean;
};

/** One position at a company. Months are "YYYY-MM"; no end month means current. */
export type ExperienceRole = {
  title: string;
  employmentType: string;
  start: string;
  end: string | null;
  summary: string;
  highlights: string[];
  skills: string[];
};

export type ExperienceDocument = {
  id: string;
  label: string;
  format: "png";
  pages: number;
};

/** An employer and every role held there, newest role first (as the API sends it). */
export type Experience = {
  /** Optional while the frontend and API are rolling between releases. */
  id?: number;
  company: string;
  companyUrl: string | null;
  logo: string | null;
  location: string;
  roles: ExperienceRole[];
  documents?: ExperienceDocument[];
};
