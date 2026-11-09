"use client";

import { IconCopy, IconDownload, IconUpload } from "@tabler/icons-react";
import { useState } from "react";
import { EntityEditor } from "@/components/admin/entity-editor";
import { ADMIN } from "@/components/admin/shell";
import {
  Button,
  Card,
  ErrorBanner,
  Input,
  PageHeader,
} from "@/components/admin/ui";
import { adminFetch, errorMessage } from "@/lib/admin/api";
import {
  ARTICLE_AI_PROMPT,
  ARTICLE_HTML_SAMPLE,
} from "@/lib/admin/article-template";
import { toast } from "@/lib/toast";

type ImportResult = { article: Record<string, unknown>; warnings: string[] };
const MAX_BYTES = 1_048_576;

export default function ImportArticlePage() {
  const [file, setFile] = useState<File | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function readArticle() {
    if (!file || busy) return;
    setBusy(true);
    setProblem(null);
    try {
      if (!/\.html?$/i.test(file.name))
        throw new Error("Choose an .html or .htm file.");
      if (!file.size || file.size > MAX_BYTES)
        throw new Error("Choose a non-empty HTML file smaller than 1 MB.");
      const html = new TextDecoder("utf-8", { fatal: true }).decode(
        await file.arrayBuffer(),
      );
      const imported = await adminFetch<ImportResult>(
        "/api/admin/posts/import-preview",
        { method: "POST", body: { html } },
      );
      setResult(imported);
    } catch (error) {
      setProblem(
        error instanceof TypeError
          ? "Save the HTML file with UTF-8 encoding and try again."
          : errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  function downloadSample() {
    const url = URL.createObjectURL(
      new Blob([ARTICLE_HTML_SAMPLE], { type: "text/html;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "journal-article-template.html";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (result) {
    const sections = result.article.sections as Array<{
      paragraphs: string[];
      images: unknown[];
      videos: unknown[];
    }>;
    return (
      <EntityEditor
        kind="post"
        id={null}
        imported={result.article}
        aside={
          <Card
            title="HTML imported — review your draft"
            description="Nothing has been saved yet. Check the content below, then create the article. It stays a draft until you publish it."
          >
            <p className="text-[13.5px] text-black-a60">
              {file?.name} · {sections.length} sections ·{" "}
              {sections.reduce((n, s) => n + s.paragraphs.length, 0)} paragraphs
              · {sections.reduce((n, s) => n + s.images.length, 0)} images ·{" "}
              {sections.reduce((n, s) => n + s.videos.length, 0)} videos
            </p>
            {result.warnings.length > 0 && (
              <ul className="list-disc space-y-1 pl-5 text-[13px] text-amber-800">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            )}
          </Card>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader
        title="Import article"
        description="Turn an HTML file into a journal draft using the site's existing fonts and layout."
        back={{ href: `${ADMIN}/blog`, label: "Journal" }}
      />
      <Card
        title="Choose your HTML file"
        description="Upload a UTF-8 .html or .htm file, up to 1 MB. Review and edit the result before saving."
      >
        <label htmlFor="article-html" className="text-[13px] font-medium">
          Article HTML
        </label>
        <Input
          id="article-html"
          type="file"
          accept=".html,.htm,text/html"
          disabled={busy}
          className="h-auto py-3"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setProblem(null);
          }}
        />
        <p className="text-[12.5px] text-black-a60">
          Images and videos use their existing URLs. Upload local media in the
          Media library first. CSS and scripts are removed during import.
        </p>
        {problem && <ErrorBanner>{problem}</ErrorBanner>}
        <Button
          variant="primary"
          className="w-fit"
          loading={busy}
          disabled={!file}
          icon={<IconUpload className="size-4" />}
          onClick={() => void readArticle()}
        >
          Import and review
        </Button>
      </Card>
      <Card
        title="Generate HTML with Claude or another AI tool"
        description="Copy these instructions, replace [YOUR TOPIC], and give them to your AI tool. Save its output as an HTML file."
        actions={
          <>
            <Button
              size="sm"
              icon={<IconCopy className="size-4" />}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(ARTICLE_AI_PROMPT);
                  toast.success("AI instructions copied");
                } catch {
                  toast.error("Select and copy the instructions below.");
                }
              }}
            >
              Copy AI instructions
            </Button>
            <Button
              size="sm"
              icon={<IconDownload className="size-4" />}
              onClick={downloadSample}
            >
              Download sample HTML
            </Button>
          </>
        }
      >
        <details>
          <summary className="cursor-pointer text-[13.5px] font-medium">
            View format and sample instructions
          </summary>
          <pre className="mt-4 max-h-120 overflow-auto whitespace-pre-wrap break-words rounded-[6px] bg-neutral-50 p-4 font-mono text-[12px] leading-relaxed">
            {ARTICLE_AI_PROMPT}
          </pre>
        </details>
      </Card>
    </div>
  );
}
