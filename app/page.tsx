import { apiGetOptional } from "@/lib/api";
import { TAG, TTL } from "@/lib/cache-tags";

// Home is statically rendered and refreshed by ISR + tag invalidation.
// (CACHING.md §7)
export const revalidate = 3600;

type Profile = {
  name: string;
  headline: string;
  summary: string;
};

export default async function HomePage() {
  const profile = await apiGetOptional<Profile>("/api/profile", {
    revalidate: TTL.content,
    tags: [TAG.profile, TAG.content],
  });

  return (
    <main>
      <h1>{profile?.name ?? "Chamath Dilshan"}</h1>
      <p>{profile?.headline ?? ""}</p>
    </main>
  );
}
