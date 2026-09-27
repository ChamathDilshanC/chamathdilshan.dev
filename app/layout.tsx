import type { Metadata } from "next";
import "./globals.css";
import "./world-theme.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { portfolio } from "@/config/portfolio";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  preload: false,
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://chamathdilshan.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: portfolio.seo.title,
    template: `%s · ${portfolio.profile.name}`,
  },
  description: portfolio.seo.description,
  openGraph: {
    type: "website",
    siteName: portfolio.profile.name,
    title: portfolio.seo.title,
    description: portfolio.seo.description,
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Browser extensions can inject attributes on <html> before hydration.
    // Keep this escape hatch at the document root; descendants still validate.
    <html
      lang="en"
      className={cn("font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: portfolio.seo.title,
              description: portfolio.seo.description,
              url: siteUrl,
            }).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
