import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--ff-geist", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--ff-inter", display: "swap" });
const spacex = localFont({
  src: "../public/fonts/SpaceX.ttf",
  variable: "--ff-spacex",
  display: "block",
  preload: true,
});

const siteUrl = "https://chamathdilshan.com";

export const dynamic = "force-dynamic";

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
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "48x48" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable} ${spacex.variable}`}>
      <body>{children}</body>
    </html>
  );
}
