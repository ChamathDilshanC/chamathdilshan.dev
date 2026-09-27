import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_HOST ?? "*.supabase.co";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Loopback and this workstation's LAN preview must hydrate like localhost.
  allowedDevOrigins: ["127.0.0.1", "192.168.1.26"],

  // Media is served from Supabase Storage only.  (CACHING.md §12)
  images: {
    remotePatterns: [{ protocol: "https", hostname: supabaseHost }],
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
          ...securityHeaders,
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      },
    ];
  },
};

export default nextConfig;
