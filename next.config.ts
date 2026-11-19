import type { NextConfig } from "next";
import { securityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Uploaded media is served from Cloudinary's CDN. Cloudinary images use the
  // custom loader in lib/media.ts (Cloudinary resizes and converts them), so
  // this pattern only matters for any image rendered without that loader.
  // (CACHING.md §12)
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    minimumCacheTTL: 2592000,
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Admin surface must never be cached by any shared cache.
        // (CACHING.md §15, SECURITY.md §8)
        source: "/ChamathDilshanC/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
