/**
 * Default journal articles — the build-time fallback and the database seed.
 * Edit the published ones in the admin panel under Journal.
 *
 * Artwork lives in public/images/journal/<slug>/: a square cover, a wide and
 * a tall image for the first section, and wide images for the next two.
 */

import type { ImageRef, Post } from "@/lib/types/content";

const art = (slug: string, name: string, alt: string): ImageRef => ({
  url: `/images/journal/${slug}/${name}.jpg`,
  alt,
});

const AI = "working-with-ai-coding-agents";
const OBS = "observability-from-day-one";
const PG = "postgres-is-probably-enough";
const SEC = "security-basics-for-web-apps";
const CACHE = "caching-without-stale-data";
const SHIP = "small-pull-requests-shipped-daily";

export const defaultPosts: Post[] = [
  {
    slug: AI,
    title: "Working with AI coding agents",
    category: "AI",
    date: "2026-10-28",
    excerpt:
      "An agent can write a feature in minutes. Getting code that is correct, readable and safe to ship still depends on how you brief it and how you review what comes back.",
    cover: art(AI, "cover", "A violet and an amber glow overlapping above faint lines of code"),
    sections: [
      {
        title: "Write the Brief First",
        paragraphs: [
          "An agent is only as good as the task it is given. Before I start one, I write down what done looks like: the behaviour I expect, the files that are likely involved, the constraints that matter (no new dependencies, no changes to the public API) and how to check the result.",
          "Vague requests produce plausible code that solves a slightly different problem. Five minutes on the brief saves an hour of untangling, and the same note becomes the pull request description afterwards.",
        ],
        images: [
          art(AI, "rows", "Blurred rows of code with one line highlighted in amber"),
          art(AI, "column", "A tall violet column of light with a small amber spark"),
        ],
      },
      {
        title: "Let Tests Hold the Line",
        paragraphs: [
          "Tests are the one part of the contract an agent cannot talk its way around. I ask for the failing test first, read it carefully, and only then let the agent make it pass. If the test is wrong, everything built on it is wrong too.",
          "Fast checks make this loop work. When lint, type checks and unit tests finish in under a minute, the agent can run them after every change, and so can I.",
          "One habit to watch for: an agent that cannot fix a bug will sometimes weaken the assertion instead. I review changes to tests as closely as changes to code.",
        ],
        images: [art(AI, "diff", "Two soft columns of red and green bars, like a code diff")],
      },
      {
        title: "Review Every Line You Ship",
        paragraphs: [
          "The name on the commit is mine, so I read the diff the way I would read a colleague’s. Are errors handled? Does it duplicate a helper that already exists? Does it call a function or an option that does not exist at all?",
          "Imports deserve a second look. A package name that is almost right can be a typo-squatted copy published to catch exactly this mistake, so I check every new dependency before it lands.",
          "All of this is only possible when changes are small. I ask for one change at a time, review it, commit it, and then ask for the next.",
        ],
        images: [art(AI, "speed", "Violet and amber streaks blurred by fast motion")],
      },
      {
        title: "Keep Secrets and Judgement Human",
        paragraphs: [
          "Agents run commands, so they get the least access that still lets them work: a sandbox or a branch, no production credentials in the environment, and a confirmation step before anything destructive.",
          "Decisions about architecture, deleting data and security trade-offs stay with people. The real gain is the time no longer spent typing, and I spend it on design, edge cases and talking to the people who will use the software.",
        ],
        images: [],
      },
    ],
  },
  {
    slug: OBS,
    title: "Observability from day one",
    category: "DevOps",
    date: "2026-10-07",
    excerpt:
      "When something breaks at two in the morning, the questions are always the same: what failed, for whom, and since when. Set up the answers before the first deploy.",
    cover: art(OBS, "cover", "Staggered teal bars like a request trace, one long amber span"),
    sections: [
      {
        title: "Structured Logs, Not Sentences",
        paragraphs: [
          "I log events as JSON with the same fields everywhere: a timestamp, a level, an event name, the request id and, where it is appropriate, the account the request belongs to. Free-text log lines are easy to write and painful to search.",
          "Logs must never contain passwords, tokens or full request bodies. Redaction belongs in the logger itself, so nobody has to remember it on a busy day.",
        ],
        images: [
          art(OBS, "pulse", "A glowing mint line with a sharp latency spike"),
          art(OBS, "logs", "Stacked log lines with green, amber and red level markers"),
        ],
      },
      {
        title: "Trace a Request End to End",
        paragraphs: [
          "Logs say what happened; traces show where the time went. OpenTelemetry is the vendor-neutral standard for both: instrument the code once and send the data to whichever backend you choose, today or later.",
          "Automatic instrumentation for the web framework, HTTP clients and database drivers covers most of the work. The important part is passing the trace context (the W3C traceparent header) across services and into background jobs, so a slow page can be followed all the way to the query that caused it.",
        ],
        images: [art(OBS, "trace", "A light waterfall of teal spans across a pale background")],
      },
      {
        title: "Measure What Users Feel",
        paragraphs: [
          "For every service I track the four golden signals: latency, traffic, errors and saturation. Latency is reported as percentiles such as p95 and p99, because an average hides exactly the slow requests that people complain about.",
          "A service level objective turns this into a decision. When 99.5% of requests should succeed in under 500 ms over 30 days, the remaining error budget tells the team whether to ship features or fix reliability this week.",
        ],
        images: [
          art(OBS, "signals", "Three status lights, green, amber and red, reflected on a dark floor"),
        ],
      },
      {
        title: "Alerts That Deserve to Wake You",
        paragraphs: [
          "An alert should wake someone only when users are affected and a person needs to act now. Everything else belongs on a dashboard or in a ticket for the morning.",
          "Every alert links to a short runbook: what it means, where to look first and how to make it stop. After each incident, alerts that nobody acted on are deleted, so the ones that remain are trusted.",
        ],
        images: [],
      },
    ],
  },
  {
    slug: PG,
    title: "Postgres is probably enough",
    category: "Databases",
    date: "2026-09-16",
    excerpt:
      "Before adding a queue, a search engine and a vector database, check what the database you already run can do. For most products, it is a lot.",
    cover: art(PG, "cover", "Three stacked, glowing blue discs, like layers of a database"),
    sections: [
      {
        title: "Relational First, JSON Where It Fits",
        paragraphs: [
          "Most product data is relational: accounts, orders, permissions. Constraints, foreign keys and transactions protect it far better than checks scattered through application code.",
          "For the genuinely flexible parts, such as user settings or payloads from third-party webhooks, a jsonb column stores the document as it is, and a GIN index keeps it fast to query. There is no need for a second database to hold them.",
        ],
        images: [
          art(PG, "table", "A soft grid of table rows with one row highlighted in blue"),
          art(PG, "cylinder", "A tall blue cylinder of light on a dark background"),
        ],
      },
      {
        title: "A Queue in a Table",
        paragraphs: [
          "Background jobs can live in an ordinary table. Workers claim the next job with SELECT … FOR UPDATE SKIP LOCKED, so two workers never pick up the same job and none of them waits on a row another one has locked. Libraries such as pg-boss for Node.js and Oban for Elixir are built on exactly this.",
          "The real benefit is transactional: the job is added in the same transaction as the data that caused it. If the order is not saved, the confirmation email is never queued, and there is no gap between two systems to reconcile.",
        ],
        images: [art(PG, "queue", "A line of blue blocks moving right, the front one lit up")],
      },
      {
        title: "Search and Vectors Without New Infrastructure",
        paragraphs: [
          "Built-in full-text search with tsvector columns and GIN indexes handles stemming, ranking and phrase matching well enough for most product search, and the pg_trgm extension adds fuzzy matching for typos.",
          "The pgvector extension stores embeddings next to the rows they describe and supports HNSW indexes for fast nearest-neighbour search. Filtering by account and ranking by similarity in a single query is simple when everything is in one database.",
        ],
        images: [art(PG, "vectors", "Clusters of soft points scattered in space, like embeddings")],
      },
      {
        title: "Know When to Move On",
        paragraphs: [
          "There are real limits: search that needs advanced relevance tuning across many languages, queues handling many thousands of jobs a second, or analytics across billions of rows. When measurements show one of these, I move that single workload to a specialised tool.",
          "Until then, one database means one backup to test, one set of credentials to protect and one system to monitor. That simplicity is worth more than most features on a comparison chart.",
        ],
        images: [],
      },
    ],
  },
  {
    slug: SEC,
    title: "Security basics every web app needs",
    category: "Security",
    date: "2026-08-26",
    excerpt:
      "Most breaches do not need a clever exploit. They walk through a missing check, a leaked key or an outdated package. These are the basics I put in place on every project.",
    cover: art(SEC, "cover", "Concentric rings around a bright coral core, like layers of defence"),
    sections: [
      {
        title: "Authentication You Do Not Invent",
        paragraphs: [
          "Sign-in is not the place for original ideas. I use a proven provider or a well-maintained library, and I offer passkeys where I can, because they are resistant to phishing in a way passwords never will be. When passwords are stored, they are hashed with Argon2id or bcrypt.",
          "Sessions live in cookies marked HttpOnly, Secure and SameSite, expire after a reasonable time and are revoked on the server when someone signs out. Sign-in and code verification are rate limited, so guessing is slow and noisy.",
        ],
        images: [
          art(SEC, "lock", "The blurred outline of a padlock with a warm glow at the keyhole"),
          art(SEC, "keyhole", "A keyhole of ember light in the dark"),
        ],
      },
      {
        title: "Authorise Every Request",
        paragraphs: [
          "Broken access control sits at the top of the OWASP Top 10 for a reason. Being signed in is not the same as being allowed: on every request, the server checks that this user may read or change this particular record. Someone will change the id in the URL.",
          "Input is validated against a schema at the edge of the system, queries are parameterised, output is encoded for where it is shown, and a Content Security Policy limits the damage if a script ever slips through.",
        ],
        images: [
          art(SEC, "layers", "Translucent coral panels in a row, a streak fading as it passes through"),
        ],
      },
      {
        title: "Guard the Supply Chain",
        paragraphs: [
          "Most of an application is other people’s code. Lock files are committed, dependency updates arrive as automated pull requests that run the full test suite, and known vulnerabilities fail the build instead of filling a report nobody reads.",
          "New packages get a quick look before they are installed: who maintains them, how widely they are used, and whether the name is spelt exactly right. In CI, third-party actions are pinned to a commit and tokens get only the permissions each job needs.",
        ],
        images: [art(SEC, "graph", "A tree of connected points with one glowing red")],
      },
      {
        title: "Keep Secrets Secret",
        paragraphs: [
          "Secrets live in the hosting platform’s environment settings or a secrets manager, never in the repository. Secret scanning with push protection catches the mistakes that happen anyway.",
          "Each environment has its own keys with the least access it needs, and keys are rotated when someone leaves or anything looks wrong. Security events such as sign-ins and permission changes are logged, so there is a record to read when it matters.",
        ],
        images: [],
      },
    ],
  },
  {
    slug: CACHE,
    title: "Caching without stale data",
    category: "Performance",
    date: "2026-08-05",
    excerpt:
      "A cache makes a site fast until it shows someone yesterday’s price. Good caching is mostly about knowing exactly when to forget.",
    cover: art(CACHE, "cover", "Three translucent panes receding into depth, a beam of light passing through"),
    sections: [
      {
        title: "Know Every Layer",
        paragraphs: [
          "A single request can be answered by the browser, a CDN, the framework’s data cache, an application cache such as Redis, or the database itself. Each layer needs its own rule, and I write those rules down in one place.",
          "When a bug report says “I still see the old version”, the first question is always which layer answered. Response headers that say where a response came from make that question quick to settle.",
        ],
        images: [
          art(CACHE, "panes", "Overlapping sage and mint panels on warm sand"),
          art(CACHE, "beam", "A vertical beam of warm light crossing thin glass edges"),
        ],
      },
      {
        title: "Choose Lifetimes Deliberately",
        paragraphs: [
          "Files with a content hash in their name never change, so they are cached for a year and marked immutable. Pages get a short shared lifetime with stale-while-revalidate, so visitors get an instant response while the cache refreshes in the background. Private or personalised responses are marked no-store.",
          "ETags let a client ask whether its copy is still current and receive a tiny 304 Not Modified instead of the full response when nothing has changed.",
        ],
        images: [art(CACHE, "ttl", "A thick amber ring three quarters full, like a timer running out")],
      },
      {
        title: "Invalidate by Tag, Not by Guesswork",
        paragraphs: [
          "Expiry by time alone forces a trade-off between fresh and fast. Instead, each cached entry is tagged with the data it contains, such as a post or the project list, and those tags are purged the moment that data changes. Next.js supports this with revalidateTag, and many CDNs offer purging by tag or surrogate key.",
          "The code that saves a record also clears its tags, in the same place. When invalidation lives on the write path, no update can forget it.",
        ],
        images: [art(CACHE, "tags", "Scattered rounded labels in sage and sand, a few lit in amber")],
      },
      {
        title: "Test the Stale Path",
        paragraphs: [
          "I test that an edit appears on the live site within the expected time, that responses for signed-in users are never cached publicly, and that the site still works when the cache is down by falling back to the source instead of failing.",
          "The hit ratio is worth watching too. A cache that is rarely hit is just one more thing that can serve the wrong answer.",
        ],
        images: [],
      },
    ],
  },
  {
    slug: SHIP,
    title: "Small pull requests, shipped daily",
    category: "Workflow",
    date: "2026-07-15",
    excerpt:
      "Big releases feel safe and are not. Small changes, merged and deployed every day, are easier to review, easier to test and easier to undo.",
    cover: art(SHIP, "cover", "Warm orange and pink lines curving together into one bright trunk"),
    sections: [
      {
        title: "Make Every Change Small",
        paragraphs: [
          "A good pull request can be reviewed properly in about fifteen minutes, which usually means a few hundred lines at most. Refactoring goes in one pull request and behaviour changes in another, and a large feature becomes a short series of steps that each work on their own.",
          "Small changes get reviewed sooner, merge with fewer conflicts and, when something does break, the cause is obvious.",
        ],
        images: [
          art(SHIP, "streaks", "Short orange and pink streaks flowing across cream"),
          art(SHIP, "checks", "A vertical stack of green check lights, the last one orange"),
        ],
      },
      {
        title: "Hide Unfinished Work Behind Flags",
        paragraphs: [
          "Feature flags let unfinished work merge into the main branch without anyone seeing it. Deploying and releasing become separate steps: code ships switched off, turns on for the team, then for a share of users, then for everyone.",
          "Flags are debt with a due date. Each one has an owner and is removed as soon as the feature is fully released.",
        ],
        images: [art(SHIP, "flags", "Four soft toggle switches on cream, two of them switched on")],
      },
      {
        title: "Keep the Pipeline Fast and Trusted",
        paragraphs: [
          "Every pull request runs lint, type checks, tests and a build, ideally in under ten minutes. A preview deployment for each pull request lets reviewers click through the change instead of imagining it.",
          "A flaky test is fixed or quarantined the day it appears, because a pipeline that fails at random teaches everyone to ignore it. The main branch is always deployable, and merging deploys it.",
        ],
        images: [art(SHIP, "sunrise", "A warm sun rising over a dark horizon")],
      },
      {
        title: "Make Undo Cheap",
        paragraphs: [
          "Rolling back takes one command or one click. Database changes follow expand and contract: add the new column, move the code over, and only then remove the old one, so the previous version of the app still works if it has to come back.",
          "When releasing is cheap and reversible, teams ship more often and with less fear, and users get improvements every day instead of a big surprise every quarter.",
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
