import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--ff-geist", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--ff-inter", display: "swap" });

const siteUrl = "https://chamathdilshan.com";

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
  icons: { icon: "/Logo.png", apple: "/Logo.png" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
