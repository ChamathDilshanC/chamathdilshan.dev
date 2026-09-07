import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chamathdilshan.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin surface is not secret, but it must not be indexed.
      // Security comes from server-side authorization, not from this file.
      disallow: ["/ChamathDilshanC", "/ChamathDilshanC/", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
