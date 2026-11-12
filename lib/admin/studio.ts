export type RepositorySummary = {
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  description: string;
  language: string | null;
  visibility: "public" | "private";
  stars: number;
  updatedAt: string | null;
  pushedAt: string | null;
  defaultBranch: string;
  fork: boolean;
  archived: boolean;
  hasReadme: boolean | null;
  importedProjectId: number | null;
  importedProjectSlug: string | null;
};

export type RepositoryPage = { items: RepositorySummary[]; page: number; perPage: number; hasNext: boolean };

export type Evidence = { path: string; claim: string; confidence: "verified" | "inferred" | "unknown"; sha?: string | null };

export type RepositoryAnalysis = {
  repository: RepositorySummary;
  sourceSha: string;
  filesScanned: string[];
  omittedFiles: string[];
  truncated: boolean;
  redactedFiles: string[];
  technologies: Record<string, string[]>;
  architecture: string[];
  features: string[];
  media: Array<{ path: string; url: string }>;
  submodules: Array<{ path: string; name: string; url?: string | null; sha: string; accessible: boolean; role: string }>;
  evidence: Evidence[];
  warnings: string[];
};

export type StudioContent = {
  title: string;
  slug: string | null;
  category: string;
  year: string;
  headline: string;
  summary: string;
  seoDescription: string;
  keywords: string[];
  brief: Record<string, string>;
  architecture: Array<{ title: string; body: string }>;
  features: string[];
  techStack: Record<string, string[]>;
  aiUsage: string[];
  links: Record<string, string>;
  caseStudy: Record<string, string | string[]>;
  evidence: Evidence[];
};

export type StudioDraft = {
  id: string;
  projectId: number | null;
  repositoryUrl: string;
  sourceSha: string | null;
  status: string;
  analysis: RepositoryAnalysis;
  content: StudioContent | null;
  evidence: Evidence[];
  template: string;
  mediaLayout: string;
  privacyConsent: boolean;
  model: string | null;
  error: string | null;
};
