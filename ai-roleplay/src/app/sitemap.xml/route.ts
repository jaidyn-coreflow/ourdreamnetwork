/**
 * Sitemap.xml — built from the known route list + character slugs.
 *
 * `force-static` makes Next bake the response at build time so the
 * <lastmod> values are genuinely "the day this build was deployed"
 * rather than "now" on every crawl. Re-evaluated only when the site
 * is redeployed, which is exactly the contract the field expects.
 */

import { FEATURED_CHARACTERS } from "@/data/characters";
import { ACTIVE_TAGS } from "@/lib/tags";

export const dynamic = "force-static";

const STATIC_ROUTES: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/create", changefreq: "weekly", priority: "0.95" },
  { path: "/character-builder-academy", changefreq: "monthly", priority: "0.9" },
  { path: "/characters", changefreq: "weekly", priority: "0.9" },
  { path: "/prompt-library", changefreq: "weekly", priority: "0.9" },
  { path: "/prompt-studio", changefreq: "monthly", priority: "0.7" },
  { path: "/books", changefreq: "monthly", priority: "0.7" },
  { path: "/books/crown-and-thorn", changefreq: "weekly", priority: "0.8" },
  { path: "/books/the-crossing-series", changefreq: "weekly", priority: "0.8" },
  { path: "/books/fourth-wing", changefreq: "monthly", priority: "0.6" },
  { path: "/books/acotar", changefreq: "monthly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

const CHARACTER_ROUTES = FEATURED_CHARACTERS.map((c) => ({
  path: `/characters/${c.slug}`,
  changefreq: "monthly",
  priority: "0.5",
}));

/* Per-trope landing pages \u2014 high-intent search targets ("vampire AI
 * chat", "dragon-rider romantasy"). Higher priority than individual
 * character pages because each tag page aggregates multiple characters
 * and matches a much broader query family. */
const TAG_ROUTES = ACTIVE_TAGS.map((t) => ({
  path: `/characters/tag/${t.slug}`,
  changefreq: "weekly",
  priority: "0.75",
}));

const ROUTES = [...STATIC_ROUTES, ...CHARACTER_ROUTES, ...TAG_ROUTES];

/* Build-time constant. We deliberately do NOT recompute lastmod per
 * request: a sitemap that claims every URL changed "today" on every
 * crawl is the textbook "lastmod abuse" pattern (Google's own guidance)
 * and trains crawlers to ignore the field. The value is captured once
 * at module init, so each deployment ships a fresh lastmod that matches
 * "the last time we shipped any change" — which is what the field
 * actually means. */
const BUILD_LASTMOD = new Date().toISOString().split("T")[0];

export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.romantasyai.com";

  const urls = ROUTES.map(
    (r) =>
      `  <url>\n    <loc>${siteUrl}${r.path}</loc>\n    <lastmod>${BUILD_LASTMOD}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
  ).join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");

  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
