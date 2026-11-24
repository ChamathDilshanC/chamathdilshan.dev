/**
 * Default case studies — the build-time fallback and the database seed.
 * PLACEHOLDER CONTENT: manage the real ones in the admin panel under Projects.
 */

import type { ImageRef, MediaItem, Project } from "@/lib/types/content";

const img = (name: string) => `/images/placeholders/${name}.jpg`;
const image = (name: string, alt: string): MediaItem => ({ kind: "image", url: img(name), alt, poster: null });
const thumb = (name: string, alt: string): ImageRef => ({ url: img(name), alt });

export const defaultProjects: Project[] = [
  {
    slug: "monolith-cms",
    title: "Monolith CMS",
    category: "Headless CMS",
    year: "2025",
    summary: "A calm, fast editing experience for a publisher with a decade of content.",
    thumbnail: thumb("work-1", "Monochrome light falling across a dark fold"),
    hero: image("work-1", "Monochrome light falling across a dark fold"),
    intro:
      "A headless CMS and editor for a publishing team, built around structured content, instant previews and a schema that grows with the newsroom.",
    discover:
      "I spent the first week with editors, timing how long everyday tasks took and mapping every content type they had invented over the years.",
    explore:
      "We prototyped three editing flows on real articles, then kept the one that let editors publish without leaving the page they were writing on.",
    results: [
      { label: "Publish time", value: "−42%" },
      { label: "Page speed", value: "98/100" },
    ],
    gallery: [
      image("detail-1", "Warm light blurred by movement"),
      image("detail-2", "A white fold on a pale grey ground"),
      image("detail-3", "A white form on a dark ground"),
    ],
    tech: ["Next.js", "TypeScript", "PostgreSQL"],
    liveUrl: null,
    repoUrl: null,
    youtubeUrl: null,
    featured: true,
  },
  {
    slug: "northwind-store",
    title: "Northwind Store",
    category: "E-commerce & Web",
    year: "2025",
    summary: "A storefront and order system for an independent skincare label.",
    thumbnail: thumb("work-2", "Amber bottles on a warm neutral set"),
    hero: image("work-2", "Amber bottles on a warm neutral set"),
    intro:
      "A storefront, checkout and order dashboard for an independent skincare label, designed to load instantly on phones and stay simple to run.",
    discover:
      "Order data showed most visitors arrived on mobile from social links, so every decision started with a phone on a slow connection.",
    explore:
      "I tested checkout variations against real orders and landed on a single page flow with saved carts and wallet payments.",
    results: [
      { label: "Conversion", value: "+31%" },
      { label: "Checkout time", value: "1.8x faster" },
    ],
    gallery: [
      image("work-2", "Amber bottles on a warm neutral set"),
      image("journal-3", "A cream fold catching warm light"),
      image("service-3", "A dark vase on a wooden bench"),
    ],
    tech: ["React", "FastAPI", "Stripe"],
    liveUrl: null,
    repoUrl: null,
    youtubeUrl: null,
    featured: true,
  },
  {
    slug: "haven-stays",
    title: "Haven Stays",
    category: "Booking Platform",
    year: "2024",
    summary: "Bookings, payments and calendars for a group of boutique rentals.",
    thumbnail: thumb("work-3", "A bright, minimal bedroom interior"),
    hero: image("work-3", "A bright, minimal bedroom interior"),
    intro:
      "A booking platform for a group of boutique rentals, joining availability, payments and guest messages into one quiet, reliable system.",
    discover:
      "Hosts were juggling four calendars and a spreadsheet. I mapped every double booking from the last year to find where things went wrong.",
    explore:
      "A single source of truth for availability, synced both ways with the big listing sites, removed the spreadsheet entirely.",
    results: [
      { label: "Double bookings", value: "0" },
      { label: "Direct bookings", value: "+54%" },
    ],
    gallery: [
      image("work-3", "A bright, minimal bedroom interior"),
      image("journal-2", "Concrete blocks against a pale sky"),
      image("service-1", "A calm sea horizon at dusk"),
    ],
    tech: ["Next.js", "Supabase"],
    liveUrl: null,
    repoUrl: null,
    youtubeUrl: null,
    featured: true,
  },
  {
    slug: "stride",
    title: "Stride",
    category: "Fitness App",
    year: "2024",
    summary: "A training app and real-time leaderboard for a running club.",
    thumbnail: thumb("work-4", "Green and amber streaks of fast motion"),
    hero: image("work-4", "Green and amber streaks of fast motion"),
    intro:
      "A training app and real-time leaderboard for a running club, turning weekly runs into shared goals that members actually come back for.",
    discover:
      "Club organisers wanted fewer group chats and more runs. I followed three weekly sessions to see how members planned and logged them.",
    explore:
      "Live leaderboards and streaks tested best, so we built them on a realtime database with offline logging for runs without signal.",
    results: [
      { label: "Weekly active", value: "+2.1x" },
      { label: "Runs logged", value: "18k" },
    ],
    gallery: [
      image("work-4", "Green and amber streaks of fast motion"),
      image("journal-4", "Red light blurred across a pale ground"),
      image("about", "Two dark forms in deep red light"),
    ],
    tech: ["React Native", "Supabase"],
    liveUrl: null,
    repoUrl: null,
    youtubeUrl: null,
    featured: true,
  },
];
