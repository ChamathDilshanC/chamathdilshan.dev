"use client";

import { IconArrowRight, IconCheck, IconExternalLink, IconRefresh, IconShieldLock, IconSparkles } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN } from "@/components/admin/shell";
import { Badge, Button, ErrorBanner, Input, PageHeader, Spinner, Textarea } from "@/components/admin/ui";
import { adminFetch, errorMessage } from "@/lib/admin/api";
import type { RepositoryPage, RepositorySummary, StudioContent, StudioDraft } from "@/lib/admin/studio";

const templates = [
  ["minimal-case-study", "Minimal engineering case study", "Large hero, concise brief, stack and results."],
  ["editorial-technical-story", "Editorial technical story", "Readable numbered story with architecture callouts."],
  ["product-showcase", "Product showcase", "Feature-led product presentation with screenshots."],
  ["architecture-deep-dive", "Architecture deep dive", "System, data flow, API and infrastructure detail."],
  ["opensource-showcase", "Open source developer showcase", "Repository-first presentation with submodules."],
] as const;

const mediaLayouts = ["cinematic-hero", "split-hero", "device-showcase", "masonry-gallery", "editorial-inline", "alternating-screenshots"] as const;

export function GitHubProjectStudio() {
  const router = useRouter();
  const [page, setPage] = useState<RepositoryPage | null>(null);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [sort, setSort] = useState("updated");
  const [includeForks, setIncludeForks] = useState(true);
  const [includeArchived, setIncludeArchived] = useState(true);
  const [selected, setSelected] = useState<RepositorySummary | null>(null);
  const [url, setUrl] = useState("");
  const [consent, setConsent] = useState(false);
  const [draft, setDraft] = useState<StudioDraft | null>(null);
  const [template, setTemplate] = useState("minimal-case-study");
  const [mediaLayout, setMediaLayout] = useState<(typeof mediaLayouts)[number]>("cinematic-hero");
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [publish, setPublish] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setBusy("Loading repositories");
    setError("");
    try {
      const params = new URLSearchParams({ page: "1", perPage: "20", search, sort, visibility, includeForks: String(includeForks), includeArchived: String(includeArchived) });
      setPage(await adminFetch<RepositoryPage>(`/api/admin/github/repositories?${params}`));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const loadMore = async () => {
    if (!page?.hasNext || busy) return;
    setBusy("Loading more repositories");
    try {
      const params = new URLSearchParams({ page: String(page.page + 1), perPage: String(page.perPage), search, sort, visibility, includeForks: String(includeForks), includeArchived: String(includeArchived) });
      const next = await adminFetch<RepositoryPage>(`/api/admin/github/repositories?${params}`);
      setPage({ ...next, items: [...page.items, ...next.items] });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
    // The initial discovery should not refetch on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const content = draft?.content;
  const updateContent = (patch: Partial<StudioContent>) => {
    if (draft?.content) setDraft({ ...draft, content: { ...draft.content, ...patch } });
  };
  const updateBrief = (key: string, value: string) => updateContent({ brief: { ...(content?.brief ?? {}), [key]: value } });
  const media = useMemo(() => draft?.analysis.media ?? [], [draft]);

  const analyze = async () => {
    const repositoryUrl = url || selected?.htmlUrl;
    if (!repositoryUrl) return;
    setBusy("Reading repository structure");
    setError("");
    try {
      const result = await adminFetch<StudioDraft>("/api/admin/github/analyze", { method: "POST", body: { repositoryUrl, privacyConsent: consent } });
      setDraft(result);
      setTemplate(result.template);
      setMediaLayout(result.mediaLayout as (typeof mediaLayouts)[number]);
      setSelectedMedia([]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const generate = async () => {
    if (!draft) return;
    setBusy("Preparing project draft");
    setError("");
    try {
      const result = await adminFetch<StudioDraft>(`/api/admin/studio/drafts/${draft.id}/generate`, { method: "POST", body: { draftId: draft.id, privacyConsent: consent } });
      setDraft(result);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const saveAndCreate = async () => {
    if (!draft || !content) return;
    setBusy("Saving reviewed project");
    setError("");
    try {
      await adminFetch(`/api/admin/studio/drafts/${draft.id}`, { method: "PUT", body: { content, template, mediaLayout } });
      const created = await adminFetch<{ id: number }>("/api/admin/studio/projects", {
        method: "POST",
        body: {
          draftId: draft.id,
          content,
          template,
          mediaLayout,
          publish,
          media: media.filter((item) => selectedMedia.includes(item.url)),
        },
      });
      router.push(`${ADMIN}/projects/${created.id}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader title="Import from GitHub" description="Discover a repository, review bounded evidence, generate an editable draft, then choose how it should be presented." actions={<Button variant="secondary" onClick={() => void load()} icon={<IconRefresh className="size-4" />}>Refresh</Button>} />
      {error && <ErrorBanner>{error}</ErrorBanner>}
      <div className="grid gap-5 l:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <section className="flex flex-col gap-4 rounded-[8px] bg-white-token p-5 ring-1 ring-black-a10">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-50 flex-1 flex-col gap-1.5 text-[12px] font-medium text-black-a60">Search repositories<Input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void load(); }} placeholder="name or description" /></label>
            <label className="flex flex-col gap-1.5 text-[12px] font-medium text-black-a60">Visibility<select className="h-10 rounded-[6px] border border-black-a15 bg-white-token px-3 text-[13px] text-black-token" value={visibility} onChange={(event) => { setVisibility(event.target.value); void load(); }}><option value="all">All</option><option value="public">Public</option><option value="private">Private</option></select></label>
            <label className="flex flex-col gap-1.5 text-[12px] font-medium text-black-a60">Sort<select className="h-10 rounded-[6px] border border-black-a15 bg-white-token px-3 text-[13px] text-black-token" value={sort} onChange={(event) => { setSort(event.target.value); void load(); }}><option value="updated">Recently updated</option><option value="pushed">Recently pushed</option><option value="created">Recently created</option><option value="full_name">Name</option><option value="stars">Stars</option></select></label>
            <Button variant="secondary" onClick={() => void load()}>Search</Button>
          </div>
          <div className="flex flex-wrap gap-4 text-[12px] text-black-a60"><label className="flex items-center gap-2"><input type="checkbox" checked={includeForks} onChange={(event) => setIncludeForks(event.target.checked)} />Include forks</label><label className="flex items-center gap-2"><input type="checkbox" checked={includeArchived} onChange={(event) => setIncludeArchived(event.target.checked)} />Include archived</label></div>
          <div className="rounded-[6px] bg-neutral-50 p-3"><label className="flex flex-col gap-1.5 text-[12px] font-medium text-black-a60">Paste a GitHub repository URL<Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://github.com/owner/repository" /></label></div>
          {busy && !draft && <Spinner label={busy} />}
          {!page?.items.length && !busy && <p className="py-10 text-center text-[13px] text-black-a60">No accessible repositories matched those filters.</p>}
          <div className="divide-y divide-black-a10">
            {page?.items.map((repo) => <button type="button" key={repo.fullName} onClick={() => { setSelected(repo); setUrl(repo.htmlUrl); }} className={`flex w-full items-start gap-3 py-4 text-left ${selected?.fullName === repo.fullName ? "bg-neutral-50" : ""}`}><span className="mt-1 flex size-7 flex-none items-center justify-center rounded-full bg-neutral-100 text-[11px] font-semibold">{repo.language?.slice(0, 2) ?? "GH"}</span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2 text-[14px] font-medium">{repo.fullName}{repo.visibility === "private" && <Badge tone="warning">Private</Badge>}{repo.importedProjectId && <Badge tone="success">Imported</Badge>}</span><span className="mt-1 block text-[12.5px] text-black-a60">{repo.description || "No description"}</span><span className="mt-2 block text-[11.5px] text-black-a50">{[repo.language, `${repo.stars} stars`, repo.updatedAt ? `updated ${new Date(repo.updatedAt).toLocaleDateString()}` : ""].filter(Boolean).join(" · ")}</span></span><IconArrowRight className="mt-1 size-4 text-black-a40" /></button>)}
          </div>
          <Button variant="primary" disabled={!url || !!busy} onClick={() => void analyze()} icon={<IconArrowRight className="size-4" />}>Analyze selected repository</Button>
          {page?.hasNext && <Button variant="secondary" disabled={!!busy} onClick={() => void loadMore()}>{busy ?? "Load more repositories"}</Button>}
        </section>

        <aside className="flex flex-col gap-4">
          {selected?.visibility === "private" && <div className="rounded-[8px] border border-amber-200 bg-amber-50 p-4 text-[12.5px] text-amber-950"><div className="flex items-center gap-2 font-medium"><IconShieldLock className="size-4" />Private repository privacy</div><p className="mt-2 leading-5">Without consent, only repository metadata is read. Checking this box permits selected repository evidence to be sent to Gemini for generation.</p><label className="mt-3 flex items-start gap-2"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5" />I consent to sending repository evidence to Google Gemini.</label></div>}
          {draft && <div className="rounded-[8px] bg-white-token p-5 ring-1 ring-black-a10"><div className="flex items-center justify-between"><div><p className="text-[12px] uppercase tracking-[0.12em] text-black-a50">Step 2 · Analyze</p><h2 className="mt-1 text-[18px] font-medium">{draft.analysis.repository.fullName}</h2></div><Badge tone={draft.status === "review" ? "success" : "neutral"}>{draft.status}</Badge></div><p className="mt-3 text-[13px] leading-5 text-black-a60">Scanned {draft.analysis.filesScanned.length} high-signal files at <code className="text-[11px]">{draft.sourceSha}</code>. {draft.analysis.omittedFiles.length} files were omitted by the safety budget.</p>{draft.analysis.warnings.map((warning) => <p key={warning} className="mt-3 rounded-[5px] bg-amber-50 p-2.5 text-[12px] text-amber-950">{warning}</p>)}<Button className="mt-4 w-full" variant="primary" disabled={!!busy || (draft.analysis.repository.visibility === "private" && !consent)} onClick={() => void generate()} icon={<IconSparkles className="size-4" />}>{busy ?? "Generate editable draft"}</Button></div>}
          {content && <div className="flex flex-col gap-5 rounded-[8px] bg-white-token p-5 ring-1 ring-black-a10"><p className="text-[12px] uppercase tracking-[0.12em] text-black-a50">Step 3 · Review and design</p><label className="flex flex-col gap-1.5 text-[12px] font-medium text-black-a60">Project title<Input value={content.title} onChange={(event) => updateContent({ title: event.target.value })} /></label><label className="flex flex-col gap-1.5 text-[12px] font-medium text-black-a60">Summary<Textarea value={content.summary} onChange={(event) => updateContent({ summary: event.target.value })} rows={3} /></label><div className="grid gap-3 m:grid-cols-2"><label className="flex flex-col gap-1.5 text-[12px] font-medium text-black-a60">Purpose<Textarea value={content.brief.purpose ?? ""} onChange={(event) => updateBrief("purpose", event.target.value)} rows={3} /></label><label className="flex flex-col gap-1.5 text-[12px] font-medium text-black-a60">Overview<Textarea value={content.brief.overview ?? ""} onChange={(event) => updateBrief("overview", event.target.value)} rows={3} /></label></div><label className="flex flex-col gap-1.5 text-[12px] font-medium text-black-a60">Features, one per line<Textarea value={content.features.join("\n")} onChange={(event) => updateContent({ features: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} rows={4} /></label><div><p className="text-[12px] font-medium text-black-a60">Presentation template</p><div className="mt-2 grid gap-2">{templates.map(([value, title, description]) => <button type="button" key={value} onClick={() => setTemplate(value)} className={`rounded-[6px] border p-3 text-left ${template === value ? "border-black-token bg-neutral-50" : "border-black-a10"}`}><span className="flex items-center gap-2 text-[13px] font-medium">{template === value && <IconCheck className="size-4" />}{title}</span><span className="mt-1 block text-[12px] text-black-a60">{description}</span></button>)}</div></div><label className="flex flex-col gap-1.5 text-[12px] font-medium text-black-a60">Media layout<select className="h-10 rounded-[6px] border border-black-a15 bg-white-token px-3 text-[13px]" value={mediaLayout} onChange={(event) => setMediaLayout(event.target.value as (typeof mediaLayouts)[number])}>{mediaLayouts.map((item) => <option key={item} value={item}>{item.replaceAll("-", " ")}</option>)}</select></label>{media.length > 0 && <fieldset><legend className="text-[12px] font-medium text-black-a60">Discovered repository media</legend><div className="mt-2 flex flex-col gap-2">{media.map((item) => <label key={item.url} className="flex items-center gap-2 text-[12px]"><input type="checkbox" checked={selectedMedia.includes(item.url)} onChange={(event) => setSelectedMedia((current) => event.target.checked ? [...current, item.url] : current.filter((urlItem) => urlItem !== item.url))} />{item.path}</label>)}</div></fieldset>}<label className="flex items-center gap-2 text-[12.5px]"><input type="checkbox" checked={publish} onChange={(event) => setPublish(event.target.checked)} />Publish after review {selectedMedia.length === 0 && <span className="text-black-a50">(add media first)</span>}</label><Button variant="primary" disabled={!!busy || !content.title} onClick={() => void saveAndCreate()} icon={<IconCheck className="size-4" />}>{busy ?? "Save draft to Projects"}</Button><a className="inline-flex items-center gap-1 text-[12px] text-black-a60 hover:text-black-token" href={draft.repositoryUrl} target="_blank" rel="noreferrer">Open repository <IconExternalLink className="size-3.5" /></a></div>}
        </aside>
      </div>
    </>
  );
}
