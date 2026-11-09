/**
 * Helpers for rendering admin forms from the API's JSON Schemas.
 */

import type { JsonSchema, JsonSchemaRoot } from "./api";

export type Resolved = { schema: JsonSchema; nullable: boolean };

const META_KEYS = ["title", "description", "default", "widget", "format"] as const;

/** Follows $ref / allOf / nullable anyOf, keeping the outer title, description and widget. */
export function resolve(schema: JsonSchema, root: JsonSchemaRoot): Resolved {
  let nullable = false;
  let current: JsonSchema = schema;
  const outer: JsonSchema = {};
  for (const key of META_KEYS) if (schema[key] !== undefined) (outer as Record<string, unknown>)[key] = schema[key];

  for (let guard = 0; guard < 10; guard++) {
    if (current.anyOf) {
      const options = current.anyOf.filter((option) => option.type !== "null");
      nullable = nullable || options.length < current.anyOf.length;
      current = { ...current, anyOf: undefined, ...(options[0] ?? {}) };
      continue;
    }
    if (current.allOf && current.allOf.length === 1 && current.allOf[0]) {
      current = { ...current, allOf: undefined, ...current.allOf[0] };
      continue;
    }
    if (current.$ref) {
      const name = current.$ref.split("/").pop() ?? "";
      const target = root.$defs?.[name] ?? {};
      const { $ref: _ref, ...rest } = current;
      void _ref;
      current = { ...target, ...rest };
      continue;
    }
    break;
  }
  // A model-level widget (e.g. ImageRef → image-ref) loses to a field-level one.
  return { schema: { ...current, ...outer, widget: outer.widget ?? current.widget }, nullable };
}

export function typeOf(schema: JsonSchema): string {
  if (Array.isArray(schema.type)) return schema.type.find((t) => t !== "null") ?? "string";
  if (schema.type) return schema.type;
  if (schema.enum) return "string";
  if (schema.properties) return "object";
  return "string";
}

/** An empty value of the right shape for a new item or a missing field. */
export function defaultFor(schema: JsonSchema, root: JsonSchemaRoot): unknown {
  const { schema: s, nullable } = resolve(schema, root);
  if (s.default !== undefined) return structuredClone(s.default);
  if (nullable) return null;
  switch (typeOf(s)) {
    case "object": {
      const out: Record<string, unknown> = {};
      for (const [key, prop] of Object.entries(s.properties ?? {})) out[key] = defaultFor(prop, root);
      return out;
    }
    case "array":
      return Array.from({ length: s.minItems ?? 0 }, () => (s.items ? defaultFor(s.items, root) : ""));
    case "boolean":
      return false;
    case "integer":
    case "number":
      return 0;
    default:
      return s.enum ? s.enum[0] : "";
  }
}

/** Fills keys the stored data is missing (a field added after it was saved). */
export function withDefaults(value: unknown, schema: JsonSchema, root: JsonSchemaRoot): unknown {
  const { schema: s } = resolve(schema, root);
  if (typeOf(s) !== "object" || !value || typeof value !== "object" || Array.isArray(value)) return value;
  const out: Record<string, unknown> = { ...(value as Record<string, unknown>) };
  for (const [key, prop] of Object.entries(s.properties ?? {})) {
    out[key] = key in out ? withDefaults(out[key], prop, root) : defaultFor(prop, root);
  }
  return out;
}

const WORDS: Record<string, string> = { cta: "CTA", url: "URL", faq: "FAQ", seo: "SEO", href: "link", alt: "alt text" };

/** "seeAllThumb" → "See all thumb", "cta" → "CTA". */
export function humanize(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_.-]+/g, " ")
    .trim()
    .toLowerCase()
    .split(" ")
    .map((w) => WORDS[w] ?? w)
    .join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const squash = (text: string) => text.replace(/[\s_-]+/g, "").toLowerCase();

/**
 * Pydantic titles every field automatically ("Includedheading", "Image Alt");
 * those read worse than a humanized key, so only explicit titles are kept.
 */
export function labelFor(key: string, schema: JsonSchema): string {
  if (schema.title && squash(schema.title) !== squash(key)) return schema.title;
  return humanize(key);
}

/** A short label for an item in a list editor, from its first non-empty text field. */
export function itemLabel(value: unknown, fallback: string): string {
  if (typeof value === "string") return value || fallback;
  if (value && typeof value === "object") {
    for (const key of ["title", "name", "question", "label", "section", "award", "quote", "value", "alt"]) {
      const v = (value as Record<string, unknown>)[key];
      if (typeof v === "string" && v.trim()) return v.length > 60 ? `${v.slice(0, 60)}…` : v;
    }
  }
  return fallback;
}

export const joinPath = (base: string, key: string | number) => (base ? `${base}.${key}` : String(key));

/** Read a sibling field for both entity fields and nested array item fields. */
export function siblingValue(values: Record<string, unknown>, path: string, key: string): unknown {
  const parentPath = path.split(".").slice(0, -1);
  let parent: unknown = values;
  for (const part of parentPath) {
    parent = parent && typeof parent === "object" ? (parent as Record<string, unknown>)[part] : undefined;
  }
  return parent && typeof parent === "object" ? (parent as Record<string, unknown>)[key] : undefined;
}
