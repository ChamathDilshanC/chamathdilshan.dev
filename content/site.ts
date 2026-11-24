/**
 * Default site content.
 *
 * The live site reads every section from the API, where it is edited in the
 * admin panel (/ChamathDilshanC). These defaults are the fallback used while
 * building without the API and the seed for a fresh database
 * (api.chamathdilshan.dev app/seed/content.json — regenerate it with
 * `npm run export:seed`).
 *
 * PLACEHOLDER CONTENT: every image, number, price, quote and project here is
 * illustrative. Images live in public/images/placeholders/.
 */

import type { SiteContent } from "@/lib/types/content";

const img = (name: string) => `/images/placeholders/${name}.jpg`;

const github = "https://github.com/ChamathDilshanC";

export const defaultContent: SiteContent = {
  site: {
    name: "Chamath Dilshan",
    wordmark: "CHAMATH",
    logo: "CHAMATH",
    email: "chamathdilshan.dev@gmail.com",
    year: "2026",
    github,
    description: "Software engineer building fast, accessible web apps, APIs and cloud platforms.",
  },

  navigation: {
    items: [
      { key: "home", title: "Home", href: "/" },
      { key: "projects", title: "Projects", href: "/projects" },
      { key: "about", title: "About", href: "/about" },
      { key: "journal", title: "Journal", href: "/blog" },
      { key: "contact", title: "Contact", href: "/contact" },
    ],
  },

  faq: {
    title: "FAQ",
    reel: { image: img("reel"), label: "Open", meta: "GitHub", href: github },
    items: [
      {
        question: "What kind of projects do you take on?",
        answer:
          "Web apps, APIs and internal tools, from a first MVP to new features on a mature product. If it runs in a browser or behind one, I can probably help.",
      },
      {
        question: "Why hire an independent engineer over an agency?",
        answer:
          "You talk directly to the person writing the code. Decisions are faster, nothing gets lost in handoffs, and you pay for engineering rather than overhead.",
      },
      {
        question: "Can you join an existing codebase?",
        answer:
          "Yes. I start by reading the code, running it locally and shipping a small fix, so we both learn how the project works before taking on bigger pieces.",
      },
      {
        question: "How long does a typical project take?",
        answer:
          "Small features land within days. A first release of a new product usually takes four to eight weeks, with a timeline agreed before work starts.",
      },
      {
        question: "Do you take on one-off projects?",
        answer: "Yes. Fixed-scope projects get a clear price, a clear timeline and the same care as ongoing work.",
      },
    ],
  },

  footer: {
    heading: "Let’s work together",
    cta: { label: "Contact Now", href: "/contact" },
    profileImage:
      "https://res.cloudinary.com/vmfn84y1/image/upload/f_auto,q_auto,c_fill,g_face,w_256,h_256/v1793902790/chamathdilshan.dev/shared/hcc5l3yfawhijzq2vbsc-15.png",
    copyright: "© {year}, All Rights Reserved",
    credit: { label: "Code on", linkLabel: "GitHub", href: github },
  },

  "home.layout": {
    sections: [
      { section: "about", visible: true },
      { section: "stack", visible: true },
      { section: "work", visible: true },
      { section: "services", visible: true },
      { section: "pricing", visible: true },
      { section: "testimonials", visible: true },
      { section: "cta", visible: true },
      { section: "numbers", visible: true },
      { section: "journal", visible: true },
    ],
  },

  "home.hero": {
    image: img("hero-trails"),
    imageAlt: "Abstract orange light with flowing light trails over a dark form",
    intro: {
      line1: "Share the idea, set the goal,",
      line2: "and your product ",
      line2Dim: "takes shape",
      line3Dim: "one sprint at a time.",
    },
    cta: { label: "Explore Now", href: "/about" },
    disciplines: ["Frontend", "Backend", "Cloud"],
  },

  "home.about": {
    title: "About",
    aside: "Independent engineer",
    statement:
      "Independent software engineer building fast, accessible web apps, APIs and cloud platforms for ambitious teams that plan for tomorrow.",
    image: img("about"),
    imageAlt: "Two dark forms in deep red light",
    pre: "Every build starts with listening. I dig into your users, constraints and goals before writing a single line, so the product has a clear reason to exist.",
    post: "After launch I stay close. I monitor, tune and extend what we shipped as your team grows, so the product keeps working long after release.",
    results: [
      { label: "Projects shipped", value: "24" },
      { label: "Years building", value: "5" },
    ],
    cta: { label: "Explore Now", href: "/about" },
  },

  "home.work": {
    title: "Selected Work",
    aside: "2023 — 2026",
    cta: { label: "Work With Me", href: "/contact" },
    seeAllThumb: img("thumb"),
  },

  "home.services": {
    title: "Services",
    aside: "Frontend · Backend · Cloud",
    statement:
      "Independent engineer making web apps, APIs and cloud platforms that help ambitious teams ship faster and sleep better, by Chamath.",
    poster: img("service-poster"),
    posterAlt: "A dark curved form against an orange field",
    cta: { label: "Explore More", href: "/about" },
    items: [
      {
        number: "01",
        title: "Frontend",
        heading: "Web Applications",
        body: "React and Next.js interfaces that load fast, read clearly and stay accessible, built on components your team can keep extending.",
        image: img("service-1"),
      },
      {
        number: "02",
        title: "Backend",
        heading: "APIs & Data",
        body: "FastAPI and Postgres services with clear contracts, caching and tests, so new features ship without breaking what already works.",
        image: img("service-2"),
      },
      {
        number: "03",
        title: "Cloud",
        heading: "Infrastructure",
        body: "CI/CD pipelines, containers and cloud deploys with monitoring built in, so releases are routine and downtime is rare.",
        image: img("service-3"),
      },
    ],
  },

  "home.pricing": {
    title: "Engagements",
    aside: "Three ways to work",
    includedHeading: "What’s included",
    plans: [
      {
        name: "Starter",
        description: "For founders who need a fast, solid first release.",
        price: "1999",
        unit: "/ Project",
        tone: "light",
        included: ["Landing page or MVP build", "Responsive, accessible UI", "Deployment and handover"],
      },
      {
        name: "Product",
        description: "For teams that need an engineer on call every month.",
        price: "4999",
        unit: "/ Month",
        tone: "light",
        included: [
          "Landing page or MVP build",
          "Responsive, accessible UI",
          "Deployment and handover",
          "API and database design",
          "Weekly progress calls",
          "Analytics and monitoring",
        ],
      },
      {
        name: "Partner",
        description: "A dedicated engineer for products in a big moment.",
        price: "8999",
        unit: "/ Month",
        tone: "dark",
        included: [
          "Landing page or MVP build",
          "Responsive, accessible UI",
          "Deployment and handover",
          "API and database design",
          "Weekly progress calls",
          "Analytics and monitoring",
          "Priority fixes and support",
          "Unlimited requests and revisions",
        ],
      },
    ],
    cta: { label: "Get Started", href: "/contact" },
  },

  "home.testimonials": {
    title: "Testimonials",
    aside: "From recent partners",
    items: [
      {
        quote:
          "Replace this with a real quote from a client or teammate. Two or three sentences about what you built together and the difference it made work best.",
        name: "Client Name",
        role: "Founder",
        company: "Company",
        project: "monolith-cms",
      },
      {
        quote:
          "Specific details make a testimonial believable: a launch date, a metric that moved, or how the work felt day to day. Keep it in their own words.",
        name: "Client Name",
        role: "CTO",
        company: "Company",
        project: "northwind-store",
      },
      {
        quote:
          "Ask someone you shipped with what they would tell a friend about working with you. Short, honest quotes read better than long, polished ones.",
        name: "Client Name",
        role: "Product Lead",
        company: "Company",
        project: "haven-stays",
      },
      {
        quote:
          "Edit these in the admin panel under Sections → Testimonials, then add their name, role and the project you worked on.",
        name: "Client Name",
        role: "Co-founder",
        company: "Company",
        project: "stride",
      },
    ],
  },

  "home.cta": {
    marquee: "Software Made For Tomorrow, By Chamath",
    background: img("cta"),
    backgroundAlt: "Dusk light over a pool and dark walls",
    action: { label: "Contact Now", href: "/contact" },
  },

  "home.numbers": {
    title: "In Numbers",
    aside: "Building since 2021",
    items: [
      {
        value: "24+",
        title: "Projects Shipped",
        body: "Web apps, APIs and internal tools for startups, agencies and product teams since 2021.",
      },
      {
        value: "5",
        title: "Years Building",
        body: "Writing production code since 2021, from first freelance builds to full product teams.",
      },
      {
        value: "12",
        title: "Open-Source Repos",
        body: "Libraries, starters and experiments published on GitHub for anyone to use and learn from.",
      },
      {
        value: "3",
        title: "Hackathon Awards",
        body: "Recognition for fast, well-built prototypes, though the best result is a user who comes back.",
      },
    ],
  },

  "home.journal": {
    title: "Journal",
    aside: "Notes from the desk",
    cta: { label: "View All Articles", href: "/blog" },
  },

  "page.projects": {
    title: ["Latest", "Projects"],
    image: img("projects-hero"),
    imageAlt: "Hazy coastal light over a dark rock",
    description: "Web apps, APIs and platforms for teams I believe in",
    listTitle: "All Work",
    listAside: "Case studies, 2023 — 2026",
  },

  "page.blog": {
    title: ["Latest", "Journal"],
    image: img("blog-hero"),
    imageAlt: "A green ring of light around a dark centre",
    description: "Notes on code, product and craft from my desk",
    listTitle: "All Articles",
    listAside: "Notes from the desk",
  },

  "page.about": {
    title: "Hi, I’m Chamath",
    image: img("about-hero"),
    imageAlt: "A dark profile in violet light",
    label: "(Who I Am)",
    blurb: "An independent engineer building web products for clients worldwide.",
  },

  "about.experience": {
    title: "Experience",
    aside: "Roles, teams and promotions",
  },

  "about.process": {
    title: "Process",
    aside: "Three steps, one engineer",
    statement:
      "Since 2021 I have helped founders and teams turn good ideas into products people use, trust and recommend. Software made for tomorrow.",
    image: img("about-process"),
    imageAlt: "Warm orange folds of light",
    steps: [
      {
        number: "001",
        title: "Discover",
        body: "I start by listening. Calls, a look at your users and a review of what already exists show what makes the product different and what it needs first.",
        included: ["Discovery call & workshop", "User and competitor review", "Technical audit of what exists"],
      },
      {
        number: "002",
        title: "Build",
        body: "I design the data, the API and the interface together, shipping small working slices you can click through every week instead of one big reveal.",
        included: ["Weekly demos on a live URL", "Typed APIs with tests", "Accessible, responsive UI"],
      },
      {
        number: "003",
        title: "Launch",
        body: "I harden, measure and hand over, with docs, monitoring and a deploy pipeline, so your team can keep shipping long after launch day.",
        included: ["CI/CD and monitoring", "Docs and handover session", "30 days of launch support"],
      },
    ],
  },

  "about.toolbox": {
    title: "Toolbox",
    aside: "What I use every day",
    items: [
      { name: "VS Code", role: "Editor", image: "https://thesvg.org/icons/visual-studio-code/default.svg" },
      { name: "Figma", role: "Design", image: "https://thesvg.org/icons/figma/default.svg" },
      { name: "Docker", role: "Containers", image: "https://thesvg.org/icons/docker/default.svg" },
      { name: "GitHub Actions", role: "CI/CD", image: "https://thesvg.org/icons/github-actions/default.svg" },
      { name: "Supabase", role: "Data & Auth", image: "https://thesvg.org/icons/supabase/default.svg" },
    ],
  },

  "about.recognition": {
    title: "Recognition",
    aside: "Awards & certificates",
    rows: [
      { count: "1×", award: "Hackathon Winner", project: "Project Name", result: "Winner" },
      { count: "2×", award: "Hackathon Finalist", project: "Project Name", result: "Finalist" },
      { count: "1×", award: "Cloud Certification", project: "Provider Name", result: "Certified" },
      { count: "3×", award: "Open-Source Feature", project: "Repository Name", result: "Featured" },
      { count: "1×", award: "Best Use of AI", project: "Project Name", result: "Shortlist" },
    ],
  },

  "about.stack": {
    title: "Stack",
    aside: "Tools I build with",
  },

  "page.contact": {
    title: "Let’s Talk",
    intro: "Tell me about your product and what you need, and I will reply within one working day.",
    image: img("contact"),
    imageAlt: "A dark curved form against an orange field",
    categories: [
      { value: "new-product", title: "New product", description: "Design and build something from scratch.", icon: "rocket" },
      { value: "existing-codebase", title: "Existing codebase", description: "New features, fixes or a cleanup.", icon: "code" },
      { value: "api-backend", title: "API or backend", description: "Endpoints, data models and integrations.", icon: "server" },
      { value: "consulting", title: "Consulting", description: "Architecture review or a second opinion.", icon: "bulb" },
      { value: "something-else", title: "Something else", description: "Tell me about it in the message.", icon: "sparkles" },
    ],
  },
};
