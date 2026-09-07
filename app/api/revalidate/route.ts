/**
 * On-demand revalidation endpoint.
 * The FastAPI backend calls this after every successful admin mutation.
 * See CACHING.md §8.3 and §10.
 */
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SECRET = process.env.CACHE_REVALIDATE_SECRET;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: NextRequest) {
  if (!SECRET) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const provided = req.headers.get("x-revalidate-secret") ?? "";
  if (!timingSafeEqual(provided, SECRET)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: { tags?: unknown; paths?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string") : [];
  const paths = Array.isArray(body.paths) ? body.paths.filter((p): p is string => typeof p === "string") : [];

  for (const tag of tags) revalidateTag(tag);
  for (const path of paths) revalidatePath(path);

  return NextResponse.json(
    { revalidated: true, tags, paths, at: Date.now() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
