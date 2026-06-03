/**
 * /characters/tag/[tag] — per-trope landing pages.
 *
 * SEO purpose:
 *   Each tag corresponds to a high-intent search term ("vampire AI
 *   chat", "dragon-rider romantasy"). A dedicated URL with a unique H1,
 *   intro, and JSON-LD CollectionPage gives Google a clean target to
 *   rank \u2014 better than `?tag=…` query-string filtering, which crawlers
 *   tend to consolidate into the canonical `/characters` URL.
 *
 * Pre-rendering:
 *   `generateStaticParams` enumerates every active tag at build time so
 *   each page ships as static HTML. New tags require either (a) tagging
 *   a character with a new literal or (b) deploying a code change \u2014
 *   either way the build picks them up automatically.
 *
 * 404 behaviour:
 *   `getTagMeta` returns null for unknown tags AND for tags that exist
 *   in the union but have no characters tagged with them yet, so we
 *   never ship an empty grid.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CharacterCard } from "@/components/CharacterCard";
import { ACTIVE_TAGS, charactersForTag, getTagMeta } from "@/lib/tags";

export function generateStaticParams() {
  return ACTIVE_TAGS.map((t) => ({ tag: t.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { tag: string };
}): Metadata {
  const meta = getTagMeta(params.tag);
  if (!meta) return { title: "Tag not found" };

  /* Per-tag OG image — top-ranked character in the tag. Falls back to the
   * site-wide /og.jpg via metadataBase if the tag somehow has no
   * characters (shouldn't happen — ACTIVE_TAGS filters them out). */
  const topChar = charactersForTag(meta.slug)[0];
  const ogImage = topChar?.imageUrl;

  return {
    title: { absolute: `${meta.seoTitle} | RomantasyAI` },
    description: meta.seoDescription,
    alternates: { canonical: `/tag/${meta.slug}` },
    openGraph: {
      title: meta.seoTitle,
      description: meta.seoDescription,
      url: `/tag/${meta.slug}`,
      ...(ogImage && {
        images: [{ url: ogImage, width: 512, height: 512, alt: meta.label }],
      }),
    },
    ...(ogImage && {
      twitter: {
        card: "summary_large_image",
        title: meta.seoTitle,
        description: meta.seoDescription,
        images: [ogImage],
      },
    }),
  };
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const meta = getTagMeta(params.tag);
  if (!meta) notFound();

  const characters = charactersForTag(meta.slug);
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://ourdreamnetwork.com/ai-roleplay";
  const pageUrl = `${siteUrl}/tag/${meta.slug}`;

  /* CollectionPage + ItemList: the Schema.org pattern Google uses for
   * "list of things" pages. The numbered ItemList helps with grid-style
   * rich results. Breadcrumbs round it out. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    url: pageUrl,
    name: meta.seoTitle,
    description: meta.seoDescription,
    isPartOf: { "@type": "WebSite", url: siteUrl, name: "RomantasyAI" },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Characters", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: meta.label, item: pageUrl },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: characters.length,
      itemListElement: characters.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        url: `${siteUrl}/${c.slug}`,
        image: c.imageUrl,
      })),
    },
  };

  /* Every other active trope \u2014 the footer links straight to each
   * dedicated trope page so users can jump to any category. */
  const otherTropes = ACTIVE_TAGS.filter((t) => t.slug !== meta.slug);

  return (
    <div className="page-section space-y-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <nav className="text-xs text-parchment-300/50">
        <Link href="/" className="hover:text-gold-400">
          Characters
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-parchment-300/70">{meta.label}</span>
      </nav>

      {/* ── Header ────────────────────────────────────────────── */}
      <header className="mx-auto max-w-3xl space-y-5 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gold-400/70">
          Romantasy by Trope
        </p>
        <h1 className="heading-1">{meta.label} Characters</h1>
        <p className="text-lg leading-relaxed text-parchment-300/80">
          {meta.intro}
        </p>
        <p className="text-xs text-parchment-300/50">
          {characters.length}{" "}
          {characters.length === 1 ? "character" : "characters"}
        </p>
      </header>

      {/* ── Character grid ────────────────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {characters.map((c, i) => (
          <CharacterCard key={c.slug} character={c} eager={i < 3} />
        ))}
      </div>

      {/* ── All other tropes ──────────────────────────────────── */}
      {otherTropes.length > 0 && (
        <section className="mx-auto max-w-3xl space-y-4 text-center">
          <h2 className="heading-2">Explore All Other Tropes</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {otherTropes.map((t) => (
              <Link
                key={t.slug}
                href={`/tag/${t.slug}`}
                className="inline-flex items-center rounded-full border border-white/10 bg-night-800/60 px-3 py-1 text-sm text-parchment-300/70 transition-colors hover:border-gold-500/30 hover:text-gold-400"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

