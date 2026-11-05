/**
 * Default journal articles — the build-time fallback and the database seed.
 * PLACEHOLDER CONTENT: manage the real ones in the admin panel under Journal.
 */

import type { ImageRef, Post } from "@/lib/types/content";

const img = (name: string, alt: string): ImageRef => ({ url: `/images/placeholders/${name}.jpg`, alt });

export const defaultPosts: Post[] = [
  {
    slug: "designing-apis-that-last",
    title: "Designing APIs that last",
    category: "Backend",
    date: "2026-03-18",
    excerpt: "Endpoints outlive the screens that first call them. Here is how I design APIs that are still pleasant to use years later.",
    cover: img("journal-1", "Pale, blurred forms in motion"),
    sections: [
      {
        title: "Start From the Client",
        paragraphs: [
          "Before writing a route, I write the code that will call it. If the request is awkward to build or the response needs three follow-up calls, the design is wrong, and it is far cheaper to find out now.",
          "That habit keeps endpoints small and shaped around real tasks rather than database tables.",
        ],
        images: [img("detail-1", "Warm light blurred by movement"), img("work-4", "Green and amber streaks of fast motion")],
      },
      {
        title: "Name Things Once",
        paragraphs: [
          "Every concept gets one name across the database, the API and the interface. When a field is called status in one place and state in another, every new developer pays for it.",
          "A short glossary in the repository settles arguments before they reach code review.",
        ],
        images: [img("service-1", "A calm sea horizon at dusk")],
      },
      {
        title: "Version by Addition",
        paragraphs: [
          "Most breaking changes can be avoided by adding instead of changing. New fields are optional, old fields stay until nothing reads them, and deprecations are announced with dates.",
        ],
        images: [img("journal-2", "Concrete blocks against a pale sky")],
      },
      {
        title: "Test the Contract",
        paragraphs: [
          "Types catch typos, but contract tests catch broken promises. I keep a small suite that calls the API the way real clients do and fails loudly when a response changes shape.",
          "Generated client types from the OpenAPI schema close the loop, so the frontend learns about a change at build time instead of in production.",
        ],
        images: [],
      },
    ],
  },
  {
    slug: "the-case-for-less-javascript",
    title: "The case for less JavaScript",
    category: "Frontend",
    date: "2026-02-04",
    excerpt: "Every kilobyte has to be downloaded, parsed and run on someone’s phone. Shipping less is the fastest optimisation there is.",
    cover: img("journal-2", "Concrete blocks against a pale sky"),
    sections: [
      {
        title: "Render on the Server",
        paragraphs: [
          "Most of a page never changes after it loads. Rendering that part on the server means visitors see content immediately and their phones never download the code that produced it.",
        ],
        images: [img("work-1", "Monochrome light falling across a dark fold"), img("detail-2", "A white fold on a pale grey ground")],
      },
      {
        title: "Islands of Interaction",
        paragraphs: [
          "Interactivity goes where it is needed and nowhere else: a menu, a form, a carousel. Each island loads its own small bundle, and a slow widget never blocks the rest of the page.",
        ],
        images: [img("journal-3", "A cream fold catching warm light")],
      },
      {
        title: "Measure on Real Phones",
        paragraphs: [
          "A fast laptop hides problems. I test on a mid-range phone over a throttled connection, because that is what many visitors actually use.",
          "Core Web Vitals from real sessions are the scoreboard, not a lab score on a developer machine.",
        ],
        images: [],
      },
    ],
  },
  {
    slug: "shipping-on-a-small-budget",
    title: "Shipping on a small budget",
    category: "Cloud",
    date: "2025-12-10",
    excerpt: "You do not need a platform team to deploy safely. A few boring choices go a long way when every hour and every dollar counts.",
    cover: img("journal-3", "A cream fold catching warm light"),
    sections: [
      {
        title: "Pick Managed Services",
        paragraphs: [
          "A managed database and a managed host cost a little more per month and save days every quarter. Patching servers is rarely the best use of a small team.",
        ],
        images: [img("service-2", "Light beams converging in the dark"), img("service-3", "A dark vase on a wooden bench")],
      },
      {
        title: "Automate the Path to Production",
        paragraphs: [
          "Every push runs lint, type checks, tests and a build. When all four pass, the same pipeline deploys. Releases become routine instead of events.",
        ],
        images: [img("cta", "Dusk light over a pool and dark walls")],
      },
      {
        title: "Watch What Matters",
        paragraphs: [
          "Three alerts cover most problems: errors are up, the site is slow, or a background job stopped. Anything noisier gets ignored, so I keep the list short.",
        ],
        images: [],
      },
    ],
  },
  {
    slug: "choosing-a-stack-that-lasts",
    title: "Choosing a stack that lasts",
    category: "Architecture",
    date: "2025-10-22",
    excerpt: "The best stack is the one your team can still hire for, debug and upgrade in three years. Fashion is a poor guide.",
    cover: img("journal-4", "Red light blurred across a pale ground"),
    sections: [
      {
        title: "Boring Is a Feature",
        paragraphs: [
          "Mature tools have answers for problems you have not met yet. I reach for proven foundations and save experiments for places where they can fail safely.",
        ],
        images: [img("about", "Two dark forms in deep red light"), img("journal-4", "Red light blurred across a pale ground")],
      },
      {
        title: "Fewer Moving Parts",
        paragraphs: [
          "Each new service, queue or language is something to deploy, monitor and learn. A single well-structured app often beats a constellation of tiny ones for a small team.",
        ],
        images: [img("work-3", "A bright, minimal bedroom interior")],
      },
      {
        title: "Plan the Upgrade",
        paragraphs: [
          "Frameworks change every year. Pinning versions, reading release notes and upgrading in small steps keeps a codebase current without heroic rewrites.",
        ],
        images: [],
      },
    ],
  },
];

export function formatPostDate(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
