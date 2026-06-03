import type { Metadata, Viewport } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ourdreamnetwork.com/ai-roleplay";

/** Shared OG image — 1200x630 painterly cover (mozjpeg q=75, ~248 KB). */
const OG_IMAGE = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: "RomantasyAI \u2014 Cinematic Romantic Fantasy",
} as const;

/**
 * Shared metadata defaults.
 * Import and spread into each page's `export const metadata`.
 */
export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AI Roleplay Characters | OurDream Network",
    template: "%s | OurDream Network",
  },
  description:
    "Chat with AI roleplay characters. Pick a character and start with 5 free messages.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "OurDream Network",
    url: SITE_URL,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE.url],
  },
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Shared viewport defaults. Next 14+ requires a separate `viewport` export
 * for theme-color / color-scheme. Keep colours in sync with `tailwind.config`.
 */
export const siteViewport: Viewport = {
  /* night-900 — matches Tailwind token; eliminates white flash on dark
   * mobile UAs and tints the iOS / Android URL bar. */
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};
