import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://chamathdilshan.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Chamath Dilshan",
    template: "%s · Chamath Dilshan",
  },
  description:
    "Portfolio, projects, technical writing and research by Chamath Dilshan.",
  openGraph: {
    type: "website",
    siteName: "Chamath Dilshan",
    url: siteUrl,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
