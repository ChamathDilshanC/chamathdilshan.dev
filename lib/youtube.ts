const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** Return a privacy-enhanced YouTube embed URL for supported public links. */
export function youtubeEmbedUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let id = "";

    if (host === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname === "/watch") {
        id = url.searchParams.get("v") ?? "";
      } else if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/shorts/")) {
        id = url.pathname.split("/")[2] ?? "";
      }
    }

    return YOUTUBE_ID.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`
      : null;
  } catch {
    return null;
  }
}
