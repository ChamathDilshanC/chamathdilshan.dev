export type Project = {
  id: string;
  name: string;
  category: string;
  landmark: string;
  summary: string;
  problem: string;
  solution: string;
  stack: string[];
  architecture: string[];
  features: string[];
  github: string | null;
  demo: string | null;
  screenshots: { src: string; alt: string }[];
};

// The single editorial source. All projects and career entries are sample content.
export const portfolio = {
  editorial: {
    brand: "CHAMATH DILSHAN",
    subtitle: "CODE / DESIGN / DIGITAL WORLDS",
    sideNotes: ["IMAGINATION, IN REAL TIME", "SCROLL TO EXPLORE"],
    sceneCaption: "The Crystal Guardian",
    projectsTitle: ["Ideas, made", "tangible."],
    projectsIntro:
      "Every project leaves a mark. A few things built along the way.",
    projectsNote: "Selected concepts · illustrative projects",
    passageTitle: ["Beyond the ordinary.", "Into another world."],
    skillsTitle: ["Many tools.", "One intention."],
    skillsIntro:
      "A collection of disciplines, connected by the desire to make things work beautifully.",
    experienceTitle: ["Built along", "the way."],
    experienceNote: "Your story belongs here · sample timeline",
    closing: "Thank you for walking this path.",
  },
  profile: {
    name: "Chamath Dilshan",
    monogram: "CD",
    role: "Creative Software Engineer",
    intro:
      "I turn ideas into interfaces, code into experiences, and imagination into worlds.",
    eyebrow: "An independent mind. An interactive world.",
    statement: ["Thoughtful code.", "Enduring experiences."],
    location: "Crafted between code & imagination",
  },
  chapters: [
    { id: "journey", label: "Journey", title: "The awakening", number: "01" },
    {
      id: "projects",
      label: "Projects",
      title: "Traces of work",
      number: "02",
    },
    { id: "skills", label: "Skills", title: "The art of making", number: "03" },
    {
      id: "experience",
      label: "Experience",
      title: "A path in progress",
      number: "04",
    },
    { id: "about", label: "About", title: "Behind the craft", number: "05" },
    { id: "contact", label: "Contact", title: "A new horizon", number: "06" },
  ],
  projects: [
    {
      id: "devresume",
      name: "DevResume",
      category: "Developer tooling",
      landmark: "The quiet shrine",
      summary:
        "An event-driven pipeline that turns a developer’s work into a living resume.",
      problem:
        "Keeping a technical resume current should not become another maintenance task.",
      solution:
        "A versioned pipeline collects activity, composes a structured profile, and produces accessible documents on demand.",
      stack: ["TypeScript", "Python", "PostgreSQL"],
      architecture: [
        "Activity sources",
        "Event queue",
        "Profile service",
        "Document renderer",
      ],
      features: [
        "Event-driven updates",
        "Versioned profile snapshots",
        "Accessible document exports",
      ],
      github: null,
      demo: null,
      screenshots: [],
    },
    {
      id: "waypoint",
      name: "Waypoint",
      category: "Cloud infrastructure",
      landmark: "The lantern station",
      summary:
        "A clear view of distributed services, from the first request to the final response.",
      problem: "Fragmented telemetry makes small failures difficult to trace.",
      solution:
        "One observability workspace connects service health, traces, and actionable deployment context.",
      stack: ["React", "Go", "OpenTelemetry"],
      architecture: [
        "Service agents",
        "Telemetry collector",
        "Time-series store",
        "Web dashboard",
      ],
      features: [
        "Connected traces",
        "Deployment comparisons",
        "Service health alerts",
      ],
      github: null,
      demo: null,
      screenshots: [],
    },
    {
      id: "fieldnotes",
      name: "Fieldnotes",
      category: "Interface engineering",
      landmark: "The stone archive",
      summary:
        "A quiet, local-first space for ideas that deserve a little more attention.",
      problem:
        "Knowledge gets scattered across disconnected tools and devices.",
      solution:
        "An offline-ready writing environment pairs fast local search with deliberate, conflict-aware sync.",
      stack: ["Next.js", "IndexedDB", "Tailwind"],
      architecture: [
        "Editor",
        "Local database",
        "Sync worker",
        "Cloud archive",
      ],
      features: ["Offline writing", "Full-text search", "Conflict-aware sync"],
      github: null,
      demo: null,
      screenshots: [],
    },
    {
      id: "ember",
      name: "Ember",
      category: "Intelligent systems",
      landmark: "The mountain lookout",
      summary:
        "A small research assistant that keeps its sources close and its reasoning visible.",
      problem:
        "Useful answers need verifiable evidence and a transparent research trail.",
      solution:
        "A retrieval workflow collects source material, ranks relevant passages, and builds cited responses.",
      stack: ["Python", "FastAPI", "Vector search"],
      architecture: [
        "Source library",
        "Indexing pipeline",
        "Retrieval engine",
        "Cited response",
      ],
      features: [
        "Source-linked answers",
        "Private collections",
        "Reproducible evaluations",
      ],
      github: null,
      demo: null,
      screenshots: [],
    },
  ] satisfies Project[],
  skills: [
    {
      name: "Frontend",
      landmark: "The illuminated shrine",
      symbol: "◈",
      description: "Interfaces with clarity, purpose and a sense of place.",
      items: ["React", "Next.js", "TypeScript", "Accessibility"],
    },
    {
      name: "Backend",
      landmark: "The forge",
      symbol: "◇",
      description: "Resilient foundations beneath every interaction.",
      items: ["Python", "FastAPI", "Node.js", "API design"],
    },
    {
      name: "DevOps",
      landmark: "The connected gates",
      symbol: "⌘",
      description: "Repeatable paths from an idea to production.",
      items: ["Docker", "GitHub Actions", "Linux", "CI/CD"],
    },
    {
      name: "Cloud",
      landmark: "The mountain peak",
      symbol: "△",
      description: "Systems that grow without losing their balance.",
      items: ["Cloud infrastructure", "Serverless", "Observability"],
    },
    {
      name: "Databases",
      landmark: "The stone archive",
      symbol: "▤",
      description: "Structure, integrity and a memory that lasts.",
      items: ["PostgreSQL", "Redis", "Data modeling"],
    },
    {
      name: "AI",
      landmark: "The guiding lantern",
      symbol: "✧",
      description: "Practical intelligence, grounded in evidence.",
      items: ["Retrieval", "Agent workflows", "Evaluation"],
    },
  ],
  experience: [
    {
      period: "Chapter III · Present",
      role: "Building what comes next",
      team: "Your current role / team",
      description:
        "Add your current responsibilities, the systems you work on, and the impact you make.",
    },
    {
      period: "Chapter II · Growth",
      role: "Turning ideas into systems",
      team: "Your previous role / team",
      description:
        "Add a meaningful career milestone and the lessons that shaped your engineering approach.",
    },
    {
      period: "Chapter I · Beginnings",
      role: "A foundation in curiosity",
      team: "Your education / first role",
      description:
        "Add the starting point of your journey: study, an early project, or your first engineering role.",
    },
  ],
  about: {
    eyebrow: "The person behind the work",
    title: "A quiet mind.\nA restless curiosity.",
    text: "I build software with a focus on performance, automation, developer experience and thoughtful interface design.",
    secondary:
      "I believe the best work happens where technical depth meets care for the people using it. Every project is an opportunity to simplify, to learn, and to make something that lasts.",
    values: ["Build with intention", "Stay curious", "Make it matter"],
  },
  contact: {
    title: "Every great story\nstarts somewhere.",
    text: "Have an idea worth exploring? Let’s build something thoughtful together.",
    email: "hello@example.com",
    cta: "Start a conversation",
    configured: false,
  },
  socials: { github: null as string | null, linkedin: null as string | null },
  assets: { warrior: null as string | null },
  seo: {
    title: "Chamath Dilshan — Code, Design & Digital Worlds",
    description:
      "A cinematic software engineering portfolio. Explore selected projects, technical craft, and the journey behind the work.",
  },
};
