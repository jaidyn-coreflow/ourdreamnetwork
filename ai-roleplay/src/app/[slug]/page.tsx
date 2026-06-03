import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CharacterCardCompact } from "@/components/CharacterCardCompact";
import { ChatPreview } from "@/components/ChatPreview";
import {
  ChatPreviewSeoSurface,
  buildChatPreviewJsonLd,
} from "@/components/ChatPreviewSeoSurface";
import { ChatNowButton } from "@/components/ChatNowButton";
import { getChatPreview } from "@/data/chat-previews";
import { FEATURED_CHARACTERS, type Series } from "@/data/characters";
import { getTagMeta } from "@/lib/tags";

const SERIES_META: Record<Series, { label: string; href: string }> = {
  "crown-and-thorn": { label: "Crown & Thorn", href: "/" },
  "the-crossing-series": { label: "The Crossing Series", href: "/" },
};

export function generateStaticParams() {
  return FEATURED_CHARACTERS.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const c = FEATURED_CHARACTERS.find((ch) => ch.slug === params.slug);
  if (!c) return {};
  const isStory = c.series || c.storyline;
  const seriesLabel = c.series ? SERIES_META[c.series].label : null;
  /* Avoid duplicating the series label when the character name already
   * starts with it (e.g. "Crown & Thorn: Courts of Starlight"). */
  const title =
    seriesLabel && !c.name.startsWith(seriesLabel)
      ? `${c.name} \u2014 ${seriesLabel} AI Roleplay`
      : c.name;
  const desc = isStory
    ? `Play ${c.name} \u2014 an AI choose-your-adventure roleplay. ${c.description || c.vibe}`
    : c.description || c.vibe;
  return {
    title,
    description: desc,
    alternates: { canonical: `/${c.slug}` },
    openGraph: {
      title,
      description: desc,
      images: [{ url: c.imageUrl, width: 512, height: 512, alt: c.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [c.imageUrl],
    },
  };
}

export default function CharacterPage({
  params,
}: {
  params: { slug: string };
}) {
  const character = FEATURED_CHARACTERS.find((c) => c.slug === params.slug);
  if (!character) notFound();

  const series = character.series ? SERIES_META[character.series] : null;
  const chatPreview = getChatPreview(character.slug);
  const ourdreamChatPath = new URL(character.chatUrl).pathname;

  const related = character.series
    ? FEATURED_CHARACTERS.filter(
        (c) => c.series === character.series && c.slug !== character.slug,
      ).slice(0, 6)
    : FEATURED_CHARACTERS.filter(
        (c) => c.slug !== character.slug && c.gender === character.gender,
      ).slice(0, 6);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ourdreamnetwork.com/ai-roleplay";
  const isStory = !!(series || character.storyline);
  const pageUrl = `${siteUrl}/${character.slug}`;

  /* Two nodes in a @graph instead of one object: previously a conditional
   * spread set "@type": "CreativeWork" AFTER "@type": "WebPage", clobbering
   * the WebPage type entirely (last key wins in JS object literals). Now
   * the WebPage and the CreativeWork are separate entities, linked via
   * mainEntity so Google can attribute both intents to the page. */
  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Characters", item: `${siteUrl}/` },
      ...(series
        ? [{ "@type": "ListItem", position: 2, name: series.label, item: `${siteUrl}${series.href}` }]
        : []),
      {
        "@type": "ListItem",
        position: series ? 3 : 2,
        name: character.name,
        item: pageUrl,
      },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: character.name,
        description: character.description || character.vibe,
        primaryImageOfPage: character.imageUrl,
        breadcrumb,
        ...(isStory && { mainEntity: { "@id": `${pageUrl}#story` } }),
      },
      ...(isStory
        ? [
            {
              "@type": "CreativeWork",
              "@id": `${pageUrl}#story`,
              name: character.name,
              description: character.description || character.vibe,
              image: character.imageUrl,
              genre: "AI Roleplay",
              interactivityType: "active",
              ...(series && {
                isPartOf: {
                  "@type": "CreativeWorkSeries",
                  name: series.label,
                  url: `${siteUrl}${series.href}`,
                },
              }),
            },
          ]
        : []),
    ],
  };

  const conversationJsonLd = chatPreview
    ? buildChatPreviewJsonLd(
        chatPreview,
        character.name,
        `${siteUrl}/${character.slug}`,
      )
    : null;

  return (
    <div className="page-section space-y-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {conversationJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(conversationJsonLd),
          }}
        />
      )}

      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <nav className="text-xs text-parchment-300/50">
        <Link href="/" className="hover:text-gold-400">
          Characters
        </Link>
        {series && (
          <>
            <span className="mx-1.5">/</span>
            <Link href={series.href} className="hover:text-gold-400">
              {series.label}
            </Link>
          </>
        )}
        <span className="mx-1.5">/</span>
        <span className="text-parchment-300/70">{character.name}</span>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        {/* Image — LCP candidate. priority=true emits a fetchpriority
             "high" + skips lazy-loading; sizes pins the optimizer to a
             ~halfpage column on desktop, fullwidth on mobile. */}
        <div className="overflow-hidden rounded-xl border border-white/5 bg-night-800">
          <Image
            src={character.imageUrl}
            alt={character.name}
            width={512}
            height={512}
            sizes="(min-width: 768px) 50vw, 100vw"
            priority
            className="aspect-square w-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {series && (
              <Link
                href={series.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-plum-700/40 bg-plum-900/40 px-3 py-1 text-xs font-medium text-parchment-300/70 transition-colors hover:border-gold-500/30 hover:text-gold-400"
              >
                {series.label}
              </Link>
            )}
            <span className="rounded-full border border-white/10 bg-night-800/60 px-2.5 py-0.5 text-xs text-parchment-300/50">
              {character.gender === "male" ? "Play as the man" : "Play as the woman"}
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight text-gold-400 md:text-5xl">
            {character.name}
          </h1>

          <p className="text-lg leading-relaxed text-parchment-300/80">
            {character.vibe}
          </p>

          {character.description && (
            <p className="text-sm leading-relaxed text-parchment-300/60">
              {character.description}
            </p>
          )}

          {/* Trope chips \u2014 each links to its dedicated /characters/tag
              page. Strong internal-linking signal for the tag-page SEO
              and gives users a discovery shortcut. */}
          {character.tags && character.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {character.tags
                .map((slug) => getTagMeta(slug))
                .filter((m): m is NonNullable<ReturnType<typeof getTagMeta>> => m !== null)
                .map((tagMeta) => (
                  <Link
                    key={tagMeta.slug}
                    href={`/tag/${tagMeta.slug}`}
                    className="rounded-full border border-white/10 bg-night-800/60 px-2.5 py-0.5 text-xs text-parchment-300/60 transition-colors hover:border-gold-500/30 hover:text-gold-400"
                  >
                    {tagMeta.label}
                  </Link>
                ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {chatPreview ? (
              <>
                <a href="#chat-preview" className="btn-primary">
                  Try a 60-second preview&nbsp;&darr;
                </a>
                <ChatNowButton chatUrl={character.chatUrl} name={character.name} className="btn-secondary">
                  Continue this story&nbsp;&rarr;
                </ChatNowButton>
              </>
            ) : (
              <ChatNowButton chatUrl={character.chatUrl} name={character.name} className="btn-primary">
                {series || character.storyline ? "Play this story" : "Start chatting"}&nbsp;&rarr;
              </ChatNowButton>
            )}
          </div>
        </div>
      </div>

      {/* ── Interactive chat preview (PR 4) ───────────────────── */}
      {chatPreview && (
        <div id="chat-preview" className="mx-auto max-w-2xl scroll-mt-24 space-y-4">
          <ChatPreview
            preview={chatPreview}
            characterName={character.name}
            characterImageUrl={character.imageUrl}
            ourdreamChatPath={ourdreamChatPath}
          />
          <ChatPreviewSeoSurface
            preview={chatPreview}
            characterName={character.name}
          />
        </div>
      )}

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl space-y-5">
        <h2 className="heading-2">
          {series || character.storyline
            ? "Choose Your Own AI Roleplay Adventure"
            : `About ${character.name}`}
        </h2>

        {series || character.storyline ? (
          <>
            <p className="text-sm leading-relaxed text-parchment-300/70">
              <strong className="text-parchment-200">{character.name}</strong> is
              an AI-powered choose-your-own-adventure AI roleplay story. You
              don&rsquo;t just read &mdash; you{" "}
              <em>play as the main character</em>. Every choice you make shapes
              the plot, the alliances, and the romance. No two playthroughs are
              ever the same.
            </p>

            {character.storyline && (
              <blockquote className="border-l-2 border-gold-500/30 pl-4 text-sm italic leading-relaxed text-parchment-300/80">
                {character.storyline}
              </blockquote>
            )}
            <p className="text-sm leading-relaxed text-parchment-300/70">
              {character.gender === "male" ? (
                <>
                  In this story, you step into the role of{" "}
                  <strong className="text-parchment-200">the male lead</strong>.
                  If you&rsquo;d prefer to play as the woman, browse our{" "}
                  <Link
                    href="/?gender=female"
                    className="text-gold-400 underline hover:text-gold-300"
                  >
                    female characters
                  </Link>{" "}
                  instead.
                </>
              ) : (
                <>
                  In this story, you step into the role of{" "}
                  <strong className="text-parchment-200">the female lead</strong>.
                  If you&rsquo;d prefer to play as the man, browse our{" "}
                  <Link
                    href="/?gender=male"
                    className="text-gold-400 underline hover:text-gold-300"
                  >
                    male characters
                  </Link>{" "}
                  instead.
                </>
              )}
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Your Story, Your Rules",
                  text: "Forge alliances, defy kings, or surrender to the slow burn. The AI adapts to every decision.",
                },
                {
                  title: "Slow-Burn Tension",
                  text: "Tension that builds across chapters, with the AI matching your pace every step of the way.",
                },
                {
                  title: "Infinite Replayability",
                  text: "Different choices unlock different paths, characters, and endings. Play it again and discover something new.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border border-white/5 bg-card-gradient p-4"
                >
                  <h3 className="text-sm font-semibold text-gold-400">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-parchment-300/60">
                    {card.text}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-parchment-300/70">
            {character.gender === "male" ? (
              <>
                Chat with <strong className="text-parchment-200">{character.name}</strong> in
                an AI-powered roleplay conversation. You play as the
                woman in this story &mdash; guide the conversation, build the
                connection, and let the slow burn unfold at your pace. If
                you&rsquo;d prefer to play as the man, browse our{" "}
                <Link
                  href="/?gender=female"
                  className="text-gold-400 underline hover:text-gold-300"
                >
                  female characters
                </Link>{" "}
                instead.
              </>
            ) : (
              <>
                Chat with <strong className="text-parchment-200">{character.name}</strong> in
                an AI-powered roleplay conversation. You play as the
                man in this story &mdash; guide the conversation, build the
                connection, and let the slow burn unfold at your pace. If
                you&rsquo;d prefer to play as the woman, browse our{" "}
                <Link
                  href="/?gender=male"
                  className="text-gold-400 underline hover:text-gold-300"
                >
                  male characters
                </Link>{" "}
                instead.
              </>
            )}
          </p>
        )}
      </section>

      {/* ── Series callout ────────────────────────────────────── */}
      {series && (
        <section className="mx-auto max-w-3xl rounded-xl border border-gold-500/10 bg-card-gradient p-6 text-center">
          <h2 className="font-display text-lg font-semibold text-gold-400">
            Part of {series.label}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-parchment-300/60">
            This story belongs to a larger collection of interconnected
            AI roleplay adventures. Explore the full series to discover new
            characters, settings, and storylines.
          </p>
          <Link
            href={series.href}
            className="btn-secondary mt-4 inline-flex text-sm"
          >
            Explore {series.label}&nbsp;&rarr;
          </Link>
        </section>
      )}

      {/* ── Related characters ────────────────────────────────── */}
      {related.length > 0 && (
        <section className="space-y-6">
          <h2 className="heading-2 text-center">
            {series ? `More from ${series.label}` : "You might also like"}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <CharacterCardCompact key={c.slug} character={c} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
