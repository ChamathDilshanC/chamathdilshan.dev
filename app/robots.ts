import type { MetadataRoute } from "next";

const siteUrl = "https://www.chamathdilshan.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin surface is not secret, but it must not be indexed.
      // Security comes from server-side authorization, not from this file.
      disallow: ["/ChamathDilshanC", "/ChamathDilshanC/", "/api/", "/_next/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
