"use client";

/**
 * Renders an editor straight from a Pydantic JSON Schema.
 *
 * The API owns the content model; adding a field to a backend schema adds it
 * here with no frontend change. `widget` hints in the schema choose richer
 * inputs: image / image-ref / media / gallery pickers backed by Cloudinary,
 * a theSVG brand-icon search, tags, paragraphs, textarea and project-ref.
 */

import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconChevronDown,
  IconGripVertical,
  IconPhotoPlus,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import useSWR from "swr";
import { fetcher, type FieldErrors, type JsonSchema, type JsonSchemaRoot, type ProjectOut } from "@/lib/admin/api";
import { defaultFor, itemLabel, joinPath, labelFor, resolve, siblingValue, typeOf } from "@/lib/admin/schema";
import { cn } from "@/lib/utils";
import { BrandIconField } from "./brand-icon-field";
import { ExperienceDocumentsField } from "./experience-documents-field";
import { Dropzone, MediaPicker, MediaThumb, type MediaKind } from "./media";
import { ProjectContentField, ProjectTemplateField } from "./project-presentation-field";
import { Button, Card, Field, IconButton, Input, Select, Switch, Textarea } from "./ui";

/** `values` is the whole top-level value, for widgets that read a sibling field. */
type Ctx = { root: JsonSchemaRoot; errors: FieldErrors; values: Record<string, unknown>; uploadFolder?: string };
const FormContext = createContext<Ctx>({ root: {}, errors: {}, values: {} });

type NodeProps = {
  schema: JsonSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  path: string;
  label: string;
};

/* --- public API ----------------------------------------------------------- */

export type FieldGroup = { title: string; description?: string; fields: string[] };

export function SchemaForm({
  schema,
  value,
  onChange,
  errors = {},
  groups,
  uploadFolder,
}: {
  schema: JsonSchemaRoot;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  errors?: FieldErrors;
  uploadFolder?: string;
  /** Split the top-level fields into titled cards. Fields not listed go last. */
  groups?: FieldGroup[];
}) {
  const ctx = { root: schema, errors, values: value, uploadFolder };
  const props = resolve(schema, schema).schema.properties ?? {};
  const set = (key: string) => (next: unknown) => onChange({ ...value, [key]: next });

  const renderFields = (keys: string[]) => (
    <FieldGrid>
      {keys.map((key) => {
        const prop = props[key];
        if (!prop) return null;
        return (
          <FieldCell key={key} schema={prop}>
            <Node schema={prop} value={value[key]} onChange={set(key)} path={key} label={labelFor(key, prop)} />
          </FieldCell>
        );
      })}
    </FieldGrid>
  );

  if (!groups) return <FormContext.Provider value={ctx}>{renderFields(Object.keys(props))}</FormContext.Provider>;

  const listed = new Set(groups.flatMap((g) => g.fields));
  const rest = Object.keys(props).filter((key) => !listed.has(key));
  return (
    <FormContext.Provider value={ctx}>
      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <Card key={group.title} title={group.title} description={group.description}>
            {renderFields(group.fields)}
          </Card>
        ))}
        {rest.length > 0 && <Card title="More">{renderFields(rest)}</Card>}
      </div>
    </FormContext.Provider>
  );
}

/* --- layout helpers ------------------------------------------------------- */

function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-4 gap-y-5 m:grid-cols-2">{children}</div>;
}

const WIDE_WIDGETS = new Set([
  "textarea",
  "paragraphs",
  "image",
  "image-ref",
  "media",
  "gallery",
  "tags",
  "brand-icon",
  "documents",
  "project-template",
  "project-content",
]);

function FieldCell({ schema, children }: { schema: JsonSchema; children: ReactNode }) {
  const { root } = useContext(FormContext);
  const { schema: s } = resolve(schema, root);
  const type = typeOf(s);
  const wide = type === "object" || type === "array" || (s.widget && WIDE_WIDGETS.has(s.widget));
  return <div className={cn("min-w-0", wide && "m:col-span-2")}>{children}</div>;
}

function useError(path: string): string | undefined {
  return useContext(FormContext).errors[path];
}

/* --- dispatcher ----------------------------------------------------------- */

function Node(props: NodeProps) {
  const context = useContext(FormContext);
  const { root } = context;
  const { schema, nullable } = resolve(props.schema, root);
  const p = { ...props, schema };

  switch (schema.widget) {
    case "image":
      return <ImageUrlField {...p} nullable={nullable} />;
    case "brand-icon":
      return <BrandIcon {...p} nullable={nullable} />;
    case "image-ref":
      return <ImageRefField {...p} nullable={nullable} />;
    case "media":
      return <MediaItemField {...p} nullable={nullable} />;
    case "gallery":
      return <GalleryField {...p} />;
    case "tags":
      return <TagsField {...p} />;
    case "paragraphs":
      return <ParagraphsField {...p} />;
    case "project-ref":
      return <ProjectRefField {...p} />;
    case "documents":
      return (
        <ExperienceDocumentsField
          value={p.value}
          onChange={p.onChange}
          folder={context.uploadFolder}
          description={schema.description}
          error={context.errors[p.path]}
        />
      );
    case "project-template":
      return <ProjectTemplateField {...p} />;
    case "project-content":
      return <ProjectContentField {...p} uploadFolder={context.uploadFolder} />;
  }

  const type = typeOf(schema);
  if (type === "object") return <ObjectField {...p} />;
  if (type === "array") return <ArrayField {...p} />;
  if (type === "boolean") return <BooleanField {...p} />;
  if (schema.enum) return <EnumField {...p} />;
  if (type === "integer" || type === "number") return <NumberField {...p} />;
  return <TextField {...p} nullable={nullable} multiline={schema.widget === "textarea"} />;
}

/* --- scalars -------------------------------------------------------------- */

function TextField({ schema, value, onChange, path, label, nullable, multiline }: NodeProps & { nullable: boolean; multiline: boolean }) {
  const id = useId();
  const error = useError(path);
  const text = typeof value === "string" ? value : "";
  const set = (next: string) => onChange(nullable && next === "" ? null : next);
  const common = {
    id,
    value: text,
    maxLength: schema.maxLength,
    "aria-invalid": error ? true : undefined,
  };
  const counter =
    schema.maxLength && text.length > schema.maxLength * 0.8 ? (
      <span className="text-[11.5px] text-black-a60 tabular-nums">
        {text.length}/{schema.maxLength}
      </span>
    ) : undefined;
  return (
    <Field label={label} htmlFor={id} description={schema.description} error={error} aside={counter}>
      {multiline ? (
        <Textarea {...common} rows={text.length > 240 ? 6 : 3} onChange={(e) => set(e.target.value)} />
      ) : schema.format === "date" ? (
        <Input {...common} type="date" onChange={(e) => set(e.target.value)} />
      ) : schema.format === "month" ? (
        <Input {...common} type="month" placeholder="YYYY-MM" onChange={(e) => set(e.target.value)} />
      ) : (
        <Input {...common} type="text" onChange={(e) => set(e.target.value)} />
      )}
    </Field>
  );
}

function NumberField({ schema, value, onChange, path, label }: NodeProps) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} description={schema.description} error={useError(path)}>
      <Input id={id} type="number" value={typeof value === "number" ? value : 0} onChange={(e) => onChange(Number(e.target.value))} />
    </Field>
  );
}

function BooleanField({ schema, value, onChange, path, label }: NodeProps) {
  const error = useError(path);
  return (
    <div className="flex flex-col gap-1">
      <Switch checked={value === true} onChange={onChange} label={label} description={schema.description} />
      {error && <p className="text-[12px] text-red-600">{error}</p>}
    </div>
  );
}

function EnumField({ schema, value, onChange, path, label }: NodeProps) {
  const id = useId();
  const options = (schema.enum ?? []).map((v) => ({ value: String(v), label: String(v) }));
  return (
    <Field label={label} htmlFor={id} description={schema.description} error={useError(path)}>
      {options.length <= 3 ? (
        <div role="radiogroup" aria-label={label} className="flex w-fit gap-1 rounded-[7px] bg-neutral-50 p-1 ring-1 ring-black-a10 ring-inset">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={value === o.value}
              onClick={() => onChange(o.value)}
              className={cn(
                "h-7.5 cursor-pointer rounded-[5px] px-3 text-[12.5px] font-medium capitalize transition-colors",
                value === o.value ? "bg-white-token text-black-token shadow-sm ring-1 ring-black-a10" : "text-black-a60 hover:text-black-token",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      ) : (
        <Select id={id} value={String(value ?? "")} onChange={onChange} options={options} />
      )}
    </Field>
  );
}

/* --- object / array ------------------------------------------------------- */

function ObjectField({ schema, value, onChange, path, label }: NodeProps) {
  const obj = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const props = schema.properties ?? {};
  return (
    <fieldset className="flex flex-col gap-4 rounded-[8px] bg-neutral-50/70 p-4 ring-1 ring-black-a10 ring-inset">
      <legend className="sr-only">{label}</legend>
      <p aria-hidden className="text-[12.5px] font-semibold tracking-[-0.1px] text-black-token">
        {label}
      </p>
      <FieldGrid>
        {Object.entries(props).map(([key, prop]) => (
          <FieldCell key={key} schema={prop}>
            <Node
              schema={prop}
              value={obj[key]}
              onChange={(next) => onChange({ ...obj, [key]: next })}
              path={joinPath(path, key)}
              label={labelFor(key, prop)}
            />
          </FieldCell>
        ))}
      </FieldGrid>
    </fieldset>
  );
}

let keySeq = 0;
const nextKey = () => ++keySeq;

/**
 * Stable React keys for list items that survive add / remove / move. When the
 * list is replaced from outside (loaded, reset) the lengths disagree and fresh
 * keys are derived for that render.
 */
function useItemKeys(length: number) {
  const [keys, setKeys] = useState<number[]>(() => Array.from({ length }, nextKey));
  const [fallback] = useState(() => new Map<number, number[]>());
  if (keys.length === length) return { keys, setKeys, next: nextKey };
  let derived = fallback.get(length);
  if (!derived) {
    derived = Array.from({ length }, nextKey);
    fallback.set(length, derived);
  }
  return { keys: derived, setKeys, next: nextKey };
}

function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}

function ArrayField({ schema, value, onChange, path, label }: NodeProps) {
  const { root, errors } = useContext(FormContext);
  const list = Array.isArray(value) ? value : [];
  const items = schema.items ?? { type: "string" };
  const resolvedItems = resolve(items, root).schema;
  const itemType = typeOf(resolvedItems);
  const { keys, setKeys, next } = useItemKeys(list.length);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const error = useError(path);

  const fixed = schema.minItems !== undefined && schema.minItems === schema.maxItems;
  const canAdd = !fixed && (schema.maxItems === undefined || list.length < schema.maxItems);
  const canRemove = !fixed && list.length > (schema.minItems ?? 0);

  const add = () => {
    const key = next();
    setKeys([...keys, key]);
    setOpen(new Set(open).add(key));
    onChange([...list, defaultFor(items, root)]);
  };
  const remove = (i: number) => {
    setKeys(keys.filter((_, j) => j !== i));
    onChange(list.filter((_, j) => j !== i));
  };
  const shift = (i: number, by: number) => {
    const to = i + by;
    if (to < 0 || to >= list.length) return;
    setKeys(move(keys, i, to));
    onChange(move(list, i, to));
  };
  const set = (i: number) => (v: unknown) => onChange(list.map((item, j) => (j === i ? v : item)));
  const singular = label.replace(/ies$/, "y").replace(/s$/, "");

  if (itemType !== "object") {
    const itemSchema = resolve(items, root).schema;
    const plain = !itemSchema.widget && !itemSchema.enum && itemType === "string";
    return (
      <Field label={label} description={schema.description} error={error}>
        <div className="flex flex-col gap-2">
          {list.map((item, i) => (
            <div key={keys[i]} className={cn("flex gap-1.5", plain ? "items-center" : "items-start")}>
              <div className="min-w-0 flex-1">
                {plain ? (
                  <Input
                    aria-label={`${label} ${i + 1}`}
                    aria-invalid={errors[joinPath(path, i)] ? true : undefined}
                    title={errors[joinPath(path, i)]}
                    value={typeof item === "string" ? item : ""}
                    maxLength={itemSchema.maxLength}
                    onChange={(e) => set(i)(e.target.value)}
                  />
                ) : (
                  <Node schema={items} value={item} onChange={set(i)} path={joinPath(path, i)} label={`${singular} ${i + 1}`} />
                )}
              </div>
              {!fixed && (
                <div className={cn("flex", !plain && "mt-6")}>
                  <IconButton label="Move up" disabled={i === 0} onClick={() => shift(i, -1)}>
                    <IconArrowUp className="size-3.5" />
                  </IconButton>
                  <IconButton label="Move down" disabled={i === list.length - 1} onClick={() => shift(i, 1)}>
                    <IconArrowDown className="size-3.5" />
                  </IconButton>
                  <IconButton label="Remove" disabled={!canRemove} onClick={() => remove(i)}>
                    <IconTrash className="size-3.5" />
                  </IconButton>
                </div>
              )}
            </div>
          ))}
          {canAdd && (
            <Button size="sm" variant="ghost" icon={<IconPlus className="size-3.5" />} className="w-fit" onClick={add}>
              Add {singular.toLowerCase()}
            </Button>
          )}
        </div>
      </Field>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[12.5px] font-semibold tracking-[-0.1px] text-black-token">
          {label} <span className="font-normal text-black-a60">({list.length})</span>
        </p>
      </div>
      {schema.description && <p className="-mt-1 text-[12px] text-black-a60">{schema.description}</p>}
      {error && <p className="text-[12px] text-red-600">{error}</p>}
      <ol className="flex flex-col gap-2">
        {list.map((item, i) => {
          const key = keys[i] ?? i;
          const expanded = open.has(key);
          const hasError = Object.keys(errors).some((p) => p.startsWith(`${joinPath(path, i)}.`));
          return (
            <li key={key} className={cn("rounded-[8px] bg-white-token ring-1 ring-inset", hasError ? "ring-red-300" : "ring-black-a10")}>
              <div className="flex items-center gap-1 py-1 pr-1.5 pl-3">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => {
                    const nextOpen = new Set(open);
                    if (expanded) nextOpen.delete(key);
                    else nextOpen.add(key);
                    setOpen(nextOpen);
                  }}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 py-1.5 text-left"
                >
                  <IconChevronDown className={cn("size-4 flex-none text-black-a60 transition-transform", !expanded && "-rotate-90")} />
                  <span className="w-5 flex-none text-[12px] text-black-a60 tabular-nums">{i + 1}</span>
                  <span className="truncate text-[13.5px] text-black-token">{itemLabel(item, `${singular} ${i + 1}`)}</span>
                </button>
                <IconButton label="Move up" disabled={i === 0} onClick={() => shift(i, -1)}>
                  <IconArrowUp className="size-3.5" />
                </IconButton>
                <IconButton label="Move down" disabled={i === list.length - 1} onClick={() => shift(i, 1)}>
                  <IconArrowDown className="size-3.5" />
                </IconButton>
                <IconButton label="Remove" disabled={!canRemove} onClick={() => remove(i)}>
                  <IconTrash className="size-3.5" />
                </IconButton>
              </div>
              {expanded && (
                <div className="border-t border-black-a10 p-4">
                  {resolvedItems.widget === "image-ref" || resolvedItems.widget === "media" ? (
                    <Node schema={items} value={item} onChange={set(i)} path={joinPath(path, i)} label={`${singular} ${i + 1}`} />
                  ) : (
                    <ObjectBody schema={items} value={item} onChange={set(i)} path={joinPath(path, i)} />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {canAdd && (
        <Button size="sm" icon={<IconPlus className="size-3.5" />} className="w-fit" onClick={add}>
          Add {singular.toLowerCase()}
        </Button>
      )}
    </div>
  );
}

/** An object's fields without the surrounding fieldset (used inside list items). */
function ObjectBody({ schema, value, onChange, path }: Omit<NodeProps, "label">) {
  const { root } = useContext(FormContext);
  const s = resolve(schema, root).schema;
  const obj = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return (
    <FieldGrid>
      {Object.entries(s.properties ?? {}).map(([key, prop]) => (
        <FieldCell key={key} schema={prop}>
          <Node
            schema={prop}
            value={obj[key]}
            onChange={(next) => onChange({ ...obj, [key]: next })}
            path={joinPath(path, key)}
            label={labelFor(key, prop)}
          />
        </FieldCell>
      ))}
    </FieldGrid>
  );
}

/* --- rich widgets ---------------------------------------------------------- */

function TagsField({ schema, value, onChange, path, label }: NodeProps) {
  const id = useId();
  const tags = Array.isArray(value) ? (value as string[]) : [];
  const [draft, setDraft] = useState("");
  const commit = () => {
    const parts = draft
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && !tags.includes(t));
    if (parts.length) onChange([...tags, ...parts]);
    setDraft("");
  };
  return (
    <Field label={label} htmlFor={id} description={schema.description ?? "Press Enter or comma to add."} error={useError(path)}>
      <div className="flex min-h-9.5 flex-wrap items-center gap-1.5 rounded-[6px] bg-white-token px-2 py-1.5 ring-1 ring-black-a10 ring-inset focus-within:ring-2 focus-within:ring-black-token">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex h-6.5 items-center gap-1 rounded-[4px] bg-neutral-50 pr-1 pl-2 text-[12.5px] ring-1 ring-black-a10 ring-inset">
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="cursor-pointer rounded-[3px] p-0.5 text-black-a60 hover:bg-black-a10 hover:text-black-token"
            >
              <IconX className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            } else if (e.key === "Backspace" && !draft && tags.length) {
              onChange(tags.slice(0, -1));
            }
          }}
          onBlur={commit}
          className="h-6.5 min-w-24 flex-1 bg-transparent px-1 text-[13.5px] outline-none"
        />
      </div>
    </Field>
  );
}

function ParagraphsField({ schema, value, onChange, path, label }: NodeProps) {
  const id = useId();
  const paragraphs = Array.isArray(value) ? (value as string[]) : [];
  const joined = paragraphs.join("\n\n");
  const [text, setText] = useState(joined);
  const last = useRef(joined);
  useEffect(() => {
    // Only resync when the value changed from outside this textarea.
    if (joined !== last.current) {
      setText(joined);
      last.current = joined;
    }
  }, [joined]);
  return (
    <Field label={label} htmlFor={id} description={schema.description} error={useError(path)}>
      <Textarea
        id={id}
        rows={Math.min(14, Math.max(5, Math.ceil(text.length / 90)))}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const next = e.target.value.split(/\n\s*\n/);
          last.current = next.join("\n\n");
          onChange(next);
        }}
      />
    </Field>
  );
}

function ProjectRefField({ schema, value, onChange, path, label }: NodeProps) {
  const id = useId();
  const { data } = useSWR<ProjectOut[]>("/api/admin/projects", fetcher);
  const options = [{ value: "", label: "None" }, ...(data ?? []).map((p) => ({ value: p.slug, label: p.title }))];
  if (typeof value === "string" && value && !options.some((o) => o.value === value)) {
    options.push({ value, label: `${value} (not found)` });
  }
  return (
    <Field label={label} htmlFor={id} description={schema.description} error={useError(path)}>
      <Select id={id} value={typeof value === "string" ? value : ""} onChange={onChange} options={options} />
    </Field>
  );
}

/** Thumbnail + pick / replace / remove controls shared by every media widget. */
function MediaSlot({
  url,
  kind,
  pick,
  onPick,
  onClear,
  clearable,
  children,
}: {
  url: string;
  kind: "image" | "video";
  pick: MediaKind;
  onPick: (url: string, kind: "image" | "video", alt: string) => void;
  onClear: () => void;
  clearable: boolean;
  children?: ReactNode;
}) {
  const { uploadFolder } = useContext(FormContext);
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3 rounded-[8px] bg-neutral-50/70 p-3 ring-1 ring-black-a10 ring-inset m:flex-row">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative w-full flex-none cursor-pointer overflow-hidden rounded-[6px] m:w-40"
        aria-label={url ? "Replace file" : "Choose file"}
      >
        {url ? (
          <MediaThumb url={url} kind={kind} className="aspect-[4/3] w-full" />
        ) : (
          <span className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 border border-dashed border-black-a16 bg-white-token text-[12px] text-black-a60 group-hover:border-black-token group-hover:text-black-token">
            <IconPhotoPlus className="size-5" />
            {pick === "video" ? "Add video" : pick === "any" ? "Add image or video" : "Add image"}
          </span>
        )}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setOpen(true)}>
            {url ? "Replace" : "Choose"}
          </Button>
          {url && clearable && (
            <Button size="sm" variant="ghost" onClick={onClear}>
              Remove
            </Button>
          )}
        </div>
        {children}
      </div>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        kind={pick}
        folder={uploadFolder}
        onSelect={([item]) => item && onPick(item.url, item.kind, item.alt)}
      />
    </div>
  );
}

/** theSVG search, seeded with the entity's `name` (a skill's, for example). */
function BrandIcon({ schema, value, onChange, path, label, nullable }: NodeProps & { nullable: boolean }) {
  const { values } = useContext(FormContext);
  const siblingName = siblingValue(values, path, "name");
  const name = typeof siblingName === "string" ? siblingName : undefined;
  return (
    <BrandIconField
      label={label}
      description={schema.description}
      error={useError(path)}
      value={value}
      onChange={onChange}
      nullable={nullable}
      suggest={name}
    />
  );
}

function ImageUrlField({ schema, value, onChange, path, label, nullable }: NodeProps & { nullable: boolean }) {
  const id = useId();
  const url = typeof value === "string" ? value : "";
  return (
    <Field label={label} htmlFor={id} description={schema.description} error={useError(path)}>
      <MediaSlot url={url} kind="image" pick="image" clearable onPick={(u) => onChange(u)} onClear={() => onChange(nullable ? null : "")}>
        <Input
          id={id}
          value={url}
          placeholder="https://res.cloudinary.com/… or /images/…"
          onChange={(e) => onChange(nullable && !e.target.value ? null : e.target.value)}
          className="font-mono text-[12px]"
        />
      </MediaSlot>
    </Field>
  );
}

type Ref = { url: string; alt: string };

function ImageRefField({ schema, value, onChange, path, label, nullable }: NodeProps & { nullable: boolean }) {
  const id = useId();
  const ref = (value && typeof value === "object" ? value : null) as Ref | null;
  const ownError = useError(path);
  const urlError = useError(joinPath(path, "url"));
  return (
    <Field label={label} description={schema.description} error={ownError ?? urlError}>
      <MediaSlot
        url={ref?.url ?? ""}
        kind="image"
        pick="image"
        clearable={nullable}
        onPick={(url, _kind, alt) => onChange({ url, alt: ref?.alt || alt })}
        onClear={() => onChange(null)}
      >
        {ref && (
          <Field label="Alt text" htmlFor={id} description="Describe the image for screen readers.">
            <Input id={id} value={ref.alt} maxLength={300} onChange={(e) => onChange({ ...ref, alt: e.target.value })} />
          </Field>
        )}
      </MediaSlot>
    </Field>
  );
}

type Item = { kind: "image" | "video"; url: string; alt: string; poster?: string | null };

function MediaItemField({ schema, value, onChange, path, label, nullable }: NodeProps & { nullable: boolean }) {
  const id = useId();
  const item = (value && typeof value === "object" ? value : null) as Item | null;
  const ownError = useError(path);
  const urlError = useError(joinPath(path, "url"));
  return (
    <Field label={label} description={schema.description} error={ownError ?? urlError}>
      <MediaSlot
        url={item?.url ?? ""}
        kind={item?.kind ?? "image"}
        pick="any"
        clearable={nullable}
        onPick={(url, kind, alt) => onChange({ kind, url, alt: item?.alt || alt, poster: null })}
        onClear={() => onChange(null)}
      >
        {item && (
          <>
            <p className="text-[12px] text-black-a60">{item.kind === "video" ? "Video · plays muted and looped" : "Image"}</p>
            <Field label="Alt text" htmlFor={id}>
              <Input id={id} value={item.alt} maxLength={300} onChange={(e) => onChange({ ...item, alt: e.target.value })} />
            </Field>
          </>
        )}
      </MediaSlot>
    </Field>
  );
}

function GalleryField({ schema, value, onChange, path, label }: NodeProps) {
  const { uploadFolder } = useContext(FormContext);
  const list = (Array.isArray(value) ? value : []) as Item[];
  const [picking, setPicking] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const error = useError(path);
  const max = schema.maxItems ?? 40;

  const append = (items: Array<{ url: string; kind: "image" | "video"; alt: string }>) =>
    onChange([...list, ...items.map((m) => ({ kind: m.kind, url: m.url, alt: m.alt, poster: null }))].slice(0, max));
  const set = (i: number, next: Item) => onChange(list.map((item, j) => (j === i ? next : item)));
  const shift = (i: number, to: number) => {
    if (to < 0 || to >= list.length || to === i) return;
    onChange(move(list, i, to));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[12.5px] font-semibold tracking-[-0.1px] text-black-token">
          {label} <span className="font-normal text-black-a60">({list.length})</span>
        </p>
        <Button size="sm" icon={<IconPhotoPlus className="size-3.5" />} onClick={() => setPicking(true)} disabled={list.length >= max}>
          Add images or videos
        </Button>
      </div>
      {schema.description && <p className="-mt-1 text-[12px] text-black-a60">{schema.description}</p>}
      {error && <p className="text-[12px] text-red-600">{error}</p>}
      {list.length > 0 && (
        <ol className="grid grid-cols-1 gap-3 m:grid-cols-2 l:grid-cols-3">
          {list.map((item, i) => (
            <li
              key={`${i}-${item.url}`}
              draggable
              onDragStart={() => setDragFrom(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragFrom !== null) shift(dragFrom, i);
                setDragFrom(null);
              }}
              onDragEnd={() => setDragFrom(null)}
              className={cn(
                "flex flex-col gap-2 rounded-[8px] bg-white-token p-2 ring-1 ring-black-a10 ring-inset transition-opacity",
                dragFrom === i && "opacity-40",
              )}
            >
              <div className="relative">
                <MediaThumb url={item.url} kind={item.kind} alt={item.alt} className="aspect-[16/10] w-full rounded-[6px]" />
                <span className="absolute top-1.5 left-1.5 flex h-5.5 items-center gap-1 rounded-[4px] bg-black/60 px-1.5 text-[11px] text-white-token">
                  <IconGripVertical className="size-3" />
                  {i + 1}
                </span>
              </div>
              <Input
                aria-label={`Alt text for item ${i + 1}`}
                placeholder="Alt text"
                value={item.alt}
                maxLength={300}
                onChange={(e) => set(i, { ...item, alt: e.target.value })}
                className="h-8 text-[12.5px]"
              />
              <div className="flex items-center justify-between">
                <span className="pl-1 text-[11.5px] text-black-a60 capitalize">{item.kind}</span>
                <div className="flex">
                  <IconButton label="Move earlier" disabled={i === 0} onClick={() => shift(i, i - 1)}>
                    <IconArrowLeft className="size-3.5" />
                  </IconButton>
                  <IconButton label="Move later" disabled={i === list.length - 1} onClick={() => shift(i, i + 1)}>
                    <IconArrowRight className="size-3.5" />
                  </IconButton>
                  <IconButton label="Remove from gallery" onClick={() => onChange(list.filter((_, j) => j !== i))}>
                    <IconTrash className="size-3.5" />
                  </IconButton>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
      <Dropzone kind="any" compact folder={uploadFolder} onUploaded={append} />
      <MediaPicker open={picking} onClose={() => setPicking(false)} kind="any" multiple folder={uploadFolder} onSelect={append} />
    </div>
  );
}
