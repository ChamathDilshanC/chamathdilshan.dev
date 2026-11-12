"use client";

import { IconCheck, IconPhotoPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import type { JsonSchema, MediaOut } from "@/lib/admin/api";
import { cn } from "@/lib/utils";
import { Button, Field, IconButton } from "./ui";
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
  sectionImages?: Record<string, Array<{ url: string; alt: string }>>;
  [key: string]: unknown;
};

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
}: {
  schema: JsonSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  label: string;
  uploadFolder?: string;
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
