"use client";

import { IconCheck, IconPhotoPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import type { JsonSchema, MediaOut } from "@/lib/admin/api";
import { cn } from "@/lib/utils";
import { Button, Field, IconButton, Input, Textarea } from "./ui";
import { MediaPicker, MediaThumb } from "./media";

export const PROJECT_TEMPLATES = [
  {
    value: "minimal-case-study",
    title: "Minimal case study",
    description: "Clean Journal-inspired reading flow.",
    accent: "bg-neutral-300",
  },
  {
    value: "editorial-technical-story",
    title: "Editorial technical story",
    description: "Long-form article with contents navigation.",
    accent: "bg-blue-400",
  },
  {
    value: "product-showcase",
    title: "Product showcase",
    description: "Large product-led hero and capabilities.",
    accent: "bg-emerald-400",
  },
  {
    value: "architecture-deep-dive",
    title: "Architecture deep dive",
    description: "System design and implementation first.",
    accent: "bg-violet-400",
  },
  {
    value: "opensource-showcase",
    title: "Open-source showcase",
    description: "Repository evidence and contribution links.",
    accent: "bg-orange-400",
  },
] as const;

const IMAGE_SECTIONS = [
  ["brief", "Project brief"],
  ["features", "Features"],
  ["architecture", "Architecture"],
  ["challenge", "Challenge"],
  ["implementation", "Implementation"],
  ["outcomes", "Verified outcomes"],
  ["techStack", "Technology stack"],
  ["repositories", "Repositories"],
] as const;

type PresentationValue = {
  headline?: string;
  brief?: Record<string, string>;
  features?: string[];
  architecture?: Array<{ title: string; body: string }>;
  techStack?: Record<string, string[]>;
  caseStudy?: { problem?: string; approach?: string; results?: string[] };
  sectionImages?: Record<string, Array<{ url: string; alt: string }>>;
  [key: string]: unknown;
};

export type LegacyProjectContent = {
  intro?: string;
  discover?: string;
  explore?: string;
  tech?: string[];
  results?: Array<{ label: string; value: string }>;
};

const lines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const architectureLines = (value: string) =>
  lines(value)
    .map((item) => {
      const [title, ...body] = item.split(":");
      return { title: title?.trim() ?? "", body: body.join(":").trim() };
    })
    .filter((item) => item.title && item.body);

const architectureText = (value: unknown) =>
  Array.isArray(value)
    ? value
        .filter(
          (item): item is { title: string; body: string } =>
            Boolean(item && typeof item === "object" && "title" in item && "body" in item),
        )
        .map((item) => `${item.title}: ${item.body}`)
        .join("\n")
    : "";

const techStackText = (value: unknown) =>
  value && typeof value === "object"
    ? Object.entries(value as Record<string, unknown>)
        .map(([group, items]) => `${group}: ${Array.isArray(items) ? items.join(", ") : ""}`)
        .join("\n")
    : "";

const parseTechStack = (value: string) =>
  lines(value).reduce<Record<string, string[]>>((groups, item) => {
    const [group, ...items] = item.split(":");
    const name = group?.trim();
    const technologies = items
      .join(":")
      .split(",")
      .map((technology) => technology.trim())
      .filter(Boolean);
    if (name && technologies.length) groups[name] = technologies;
    return groups;
  }, {});

function SectionContentFields({
  section,
  content,
  legacy,
  update,
}: {
  section: string;
  content: PresentationValue;
  legacy?: LegacyProjectContent;
  update: (value: PresentationValue) => void;
}) {
  const brief = content.brief ?? {};
  const caseStudy = content.caseStudy ?? {};
  const updateBrief = (key: string, value: string) =>
    update({ ...content, brief: { ...brief, [key]: value } });
  const updateCaseStudy = (key: "problem" | "approach" | "results", value: string | string[]) =>
    update({ ...content, caseStudy: { ...caseStudy, [key]: value } });

  switch (section) {
    case "brief":
      return (
        <div className="grid gap-3 m:grid-cols-2">
          <Field label="Headline">
            <Input
              value={content.headline ?? ""}
              onChange={(event) => update({ ...content, headline: event.target.value })}
            />
          </Field>
          <Field label="Overview" description="Shown as the main project brief.">
            <Textarea
              value={brief.overview ?? legacy?.intro ?? ""}
              rows={3}
              onChange={(event) => updateBrief("overview", event.target.value)}
            />
          </Field>
          <Field label="Purpose">
            <Textarea
              value={brief.purpose ?? ""}
              rows={3}
              onChange={(event) => updateBrief("purpose", event.target.value)}
            />
          </Field>
          <Field label="Users">
            <Textarea
              value={brief.users ?? ""}
              rows={3}
              onChange={(event) => updateBrief("users", event.target.value)}
            />
          </Field>
        </div>
      );
    case "features":
      return (
        <Field label="Features" description="One feature per line.">
          <Textarea
            value={(content.features ?? []).join("\n")}
            rows={4}
            onChange={(event) => update({ ...content, features: lines(event.target.value) })}
          />
        </Field>
      );
    case "architecture":
      return (
        <Field label="Architecture" description="One section per line in the format Title: explanation.">
          <Textarea
            value={architectureText(content.architecture)}
            rows={4}
            onChange={(event) => update({ ...content, architecture: architectureLines(event.target.value) })}
          />
        </Field>
      );
    case "challenge":
      return (
        <Field label="Challenge" description="The problem this project solves.">
          <Textarea
            value={caseStudy.problem ?? legacy?.discover ?? ""}
            rows={4}
            onChange={(event) => updateCaseStudy("problem", event.target.value)}
          />
        </Field>
      );
    case "implementation":
      return (
        <Field label="Implementation" description="The engineering approach used to solve the challenge.">
          <Textarea
            value={caseStudy.approach ?? legacy?.explore ?? ""}
            rows={4}
            onChange={(event) => updateCaseStudy("approach", event.target.value)}
          />
        </Field>
      );
    case "outcomes":
      return (
        <Field label="Verified outcomes" description="One outcome per line.">
          <Textarea
            value={
              Array.isArray(caseStudy.results)
                ? caseStudy.results.join("\n")
                : (legacy?.results ?? []).map((item) => `${item.label}: ${item.value}`).join("\n")
            }
            rows={4}
            onChange={(event) => updateCaseStudy("results", lines(event.target.value))}
          />
        </Field>
      );
    case "techStack":
      return (
        <Field label="Technology stack" description="One group per line in the format Group: item, item.">
          <Textarea
            value={
              content.techStack !== undefined
                ? techStackText(content.techStack)
                : (legacy?.tech ?? []).length
                  ? `Technologies: ${(legacy?.tech ?? []).join(", ")}`
                  : ""
            }
            rows={4}
            onChange={(event) => update({ ...content, techStack: parseTechStack(event.target.value) })}
          />
        </Field>
      );
    case "repositories":
      return (
        <p className="rounded-[6px] bg-white-token px-3 py-2 text-[12px] leading-5 text-black-a60 ring-1 ring-black-a10">
          Repository links are managed in the separate Repositories field. Add section images here if this template needs them.
        </p>
      );
    default:
      return null;
  }
}

function TemplatePreview({
  accent,
  value,
  selected,
}: {
  accent: string;
  value: string;
  selected: boolean;
}) {
  return (
    <span
      className={cn(
        "relative flex h-24 flex-col gap-2 overflow-hidden rounded-[6px] bg-white p-2 ring-1 ring-black-a10",
        selected && "ring-2 ring-black-token",
      )}
    >
      <span className={cn("h-7 w-full rounded-[3px]", accent)} />
      <span className="flex gap-1">
        <span className="h-10 w-1/3 rounded-[2px] bg-neutral-100" />
        <span className="flex flex-1 flex-col gap-1">
          <span className="h-1.5 w-3/4 rounded-full bg-black-a20" />
          <span className="h-1.5 w-full rounded-full bg-black-a10" />
          <span className="h-1.5 w-2/3 rounded-full bg-black-a10" />
        </span>
      </span>
      {selected && (
        <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-black-token text-white-token">
          <IconCheck className="size-3" />
        </span>
      )}
      <span className="sr-only">{value}</span>
    </span>
  );
}

export function ProjectTemplateField({
  schema,
  value,
  onChange,
  label,
  path,
}: {
  schema: JsonSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  label: string;
  path: string;
}) {
  const selected =
    typeof value === "string" && value !== "legacy"
      ? value
      : PROJECT_TEMPLATES[0].value;
  return (
    <Field label={label} description={schema.description} htmlFor={path}>
      <div className="grid gap-2 m:grid-cols-2 l:grid-cols-3">
        {PROJECT_TEMPLATES.map((template) => (
          <button
            key={template.value}
            id={template.value === selected ? path : undefined}
            type="button"
            aria-pressed={selected === template.value}
            onClick={() => onChange(template.value)}
            className={cn(
              "flex cursor-pointer flex-col gap-2 rounded-[8px] p-1.5 text-left transition-colors hover:bg-neutral-50",
              selected === template.value && "bg-neutral-50",
            )}
          >
            <TemplatePreview
              accent={template.accent}
              value={template.value}
              selected={selected === template.value}
            />
            <span className="px-1 text-[13px] font-medium">
              {template.title}
            </span>
            <span className="px-1 text-[11.5px] leading-4 text-black-a60">
              {template.description}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-[12px] text-black-a60">
        Choose a layout. Existing projects keep the classic layout when set to
        Legacy.
      </p>
    </Field>
  );
}

export function ProjectContentField({
  schema,
  value,
  onChange,
  label,
  uploadFolder,
  legacy,
}: {
  schema: JsonSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  label: string;
  uploadFolder?: string;
  legacy?: LegacyProjectContent;
}) {
  const content = (
    value && typeof value === "object" ? value : {}
  ) as PresentationValue;
  const sectionImages = content.sectionImages ?? {};
  const [picker, setPicker] = useState<string | null>(null);

  const setImages = (section: string, items: MediaOut[]) => {
    onChange({
      ...content,
      sectionImages: {
        ...sectionImages,
        [section]: [
          ...(sectionImages[section] ?? []),
          ...items.map((item) => ({ url: item.url, alt: item.alt })),
        ],
      },
    });
  };

  const removeImage = (section: string, index: number) => {
    onChange({
      ...content,
      sectionImages: {
        ...sectionImages,
        [section]: (sectionImages[section] ?? []).filter((_, i) => i !== index),
      },
    });
  };

  return (
    <Field label={label} description={schema.description}>
      <div className="flex flex-col gap-3">
        <p className="text-[12px] text-black-a60">
          Add one or more images after the matching section. Images are stored
          with the project and rendered in the selected template.
        </p>
        {IMAGE_SECTIONS.map(([key, title]) => {
          const images = sectionImages[key] ?? [];
          return (
            <div
              key={key}
              className="rounded-[8px] bg-neutral-50/70 p-3 ring-1 ring-black-a10 ring-inset"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium">{title}</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setPicker(key)}
                >
                  <IconPhotoPlus className="size-4" />
                  Add images
                </Button>
              </div>
              <div className="mt-3 rounded-[6px] bg-white-token p-3 ring-1 ring-black-a10">
                <SectionContentFields
                  section={key}
                  content={content}
                  legacy={legacy}
                  update={(next) => onChange(next)}
                />
              </div>
              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2 m:grid-cols-4">
                  {images.map((image, index) => (
                    <div key={`${image.url}-${index}`} className="relative">
                      <MediaThumb
                        url={image.url}
                        kind="image"
                        alt={image.alt}
                        className="aspect-video rounded-[5px]"
                      />
                      <IconButton
                        label={`Remove ${title} image ${index + 1}`}
                        className="absolute top-1 right-1 bg-white-token/90"
                        onClick={() => removeImage(key, index)}
                      >
                        <IconTrash className="size-3.5" />
                      </IconButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <MediaPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        kind="image"
        multiple
        folder={uploadFolder}
        title={
          picker
            ? `Images for ${IMAGE_SECTIONS.find(([key]) => key === picker)?.[1] ?? "section"}`
            : "Choose images"
        }
        onSelect={(items) => {
          if (picker) setImages(picker, items);
        }}
      />
    </Field>
  );
}
