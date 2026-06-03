import type { Metadata } from "next";
import Link from "next/link";
import { CharacterCard } from "@/components/CharacterCard";
import { Disclaimer } from "@/components/Disclaimer";
import { FaqBlock } from "@/components/FaqBlock";
import { _allPreviews } from "@/data/chat-previews";
import { FEATURED_CHARACTERS, type Tag } from "@/data/characters";
import { ACTIVE_TAGS, getTagMeta } from "@/lib/tags";

const FAQ = [
  {
    q: "What are RomantasyAI characters?",
    a: "They are original romantic fantasy personas designed for consenting adults only \u2014 slow-burn romance that\u2019s suggestive and spicy, never explicit. The top characters ship with a free 60-second interactive story preview you can play right here.",
  },
  {
    q: "Are these characters based on copyrighted books?",
    a: "No. Every character is entirely original. We do not reproduce copyrighted names, likenesses, or plot details from any published work.",
  },
  {
    q: "Is the chat experience appropriate for all ages?",
    a: "No. RomantasyAI is an adults-only (18+) community. All characters and conversations are intended for consenting adults only. Content is suggestive, slow-burn romance \u2014 spicy but never explicit.",
  },
  {
    q: "How do I start chatting with a character?",
    a: "Try the free 60-second preview on any character marked with the gold pill, then continue the story on our partner chat platform. No account on RomantasyAI is required.",
  },
];

const FILTERS = [
  { label: "All", value: "" },
  { label: "Women", value: "female" },
  { label: "Men", value: "male" },
] as const;

/**
 * Dynamic metadata so we can swap the canonical URL when a `?tag=…`
 * filter is active. The dedicated `/characters/tag/<slug>` page is the
 * indexable surface for each trope; the query-string variants here are
 * for user convenience only.
 */
export function generateMetadata({
  searchParams,
}: {
  searchParams: { tag?: string };
}): Metadata {
  const base: Metadata = {
    title: "Stories You Can Play \u2014 Romantic Fantasy CYOA Catalogue",
    description:
      "Sixty-plus original romantic fantasy stories with choose-your-own-adventure depth. Free 60-second interactive previews on the top characters. Adults-only, spicy slow-burn \u2014 suggestive, never explicit.",
    alternates: { canonical: "/" },
  };

  const tagMeta = searchParams.tag ? getTagMeta(searchParams.tag) : null;
  if (!tagMeta) return base;

  return {
    ...base,
    alternates: { canonical: `/tag/${tagMeta.slug}` },
    /* Don't index the filtered query-string variants \u2014 the dedicated
     * tag page is the indexable surface. Filter is for users only. */
    robots: { index: false, follow: true },
  };
}

export default function CharactersPage({
  searchParams,
}: {
  searchParams: { gender?: string; tag?: string };
}) {
  const activeGender = searchParams.gender ?? "";
  /* Tag filter is intentionally a soft filter on /characters \u2014 the
   * canonical, indexable surface for each tag is /characters/tag/<tag>.
   * Here we just narrow the grid client-side via a URL parameter and
   * leave the canonical alone so we never compete with the dedicated
   * tag pages for SEO. */
  const activeTagMeta = searchParams.tag ? getTagMeta(searchParams.tag) : null;
  const activeTag: Tag | null = activeTagMeta?.slug ?? null;

  const characters = FEATURED_CHARACTERS.filter((c) => {
    if (
      (activeGender === "male" || activeGender === "female") &&
      c.gender !== activeGender
    ) {
      return false;
    }
    if (activeTag && !c.tags?.includes(activeTag)) return false;
    return true;
  });

  /* Build query strings that preserve the OTHER active filter when
   * users click a chip \u2014 e.g. clicking "vampire" while gender=female
   * is active should keep the gender selection. */
  const buildQuery = (overrides: { gender?: string; tag?: string }) => {
    const params = new URLSearchParams();
    const gender = overrides.gender ?? activeGender;
    const tag = overrides.tag ?? activeTag ?? "";
    if (gender) params.set("gender", gender);
    if (tag) params.set("tag", tag);
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <div className="page-section space-y-14">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl text-center">
        <Disclaimer />
        <p className="mt-6 text-sm uppercase tracking-[0.25em] text-gold-400/80">
          Stories
        </p>
        <h1 className="heading-1 mt-2">Stories You Can Play</h1>
        <p className="mt-4 text-lg text-parchment-300/80">
          Netflix-meets-video-game romantasy. Sixty-plus original story
          worlds with choose-your-own-adventure depth &mdash; your choices
          shape the plot, the romance, and the ending. Pick a story below
          and start with a free 60-second preview before you commit.
        </p>
        <p className="mt-3 text-sm text-parchment-300/60">
          Want to author your own world instead?{" "}
          <Link
            href="/character-builder-academy"
            className="text-gold-400 underline hover:text-gold-300"
          >
            Try the Character Builder Academy
          </Link>{" "}
          or jump into the{" "}
          <Link href="/create" className="text-gold-400 underline hover:text-gold-300">
            3-step wizard
          </Link>
          .
        </p>
      </div>

      {/* ── Gender filter tabs ────────────────────────────────── */}
      <div className="flex justify-center">
        <nav
          aria-label="Filter characters by gender"
          className="inline-flex rounded-lg border border-white/10 bg-night-800/60 p-1"
        >
          {FILTERS.map((f) => {
            const isActive = activeGender === f.value;
            return (
              <Link
                key={f.value}
                href={buildQuery({ gender: f.value })}
                className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gold-500/20 text-gold-400"
                    : "text-parchment-300/60 hover:text-parchment-200"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {f.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Trope chip row ────────────────────────────────────── */}
      <nav
        aria-label="Filter characters by trope"
        className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2"
      >
        <Link
          href={buildQuery({ tag: "" })}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            !activeTag
              ? "border-gold-500/40 bg-gold-500/15 text-gold-400"
              : "border-white/10 bg-night-800/60 text-parchment-300/60 hover:border-gold-500/30 hover:text-gold-400"
          }`}
          aria-current={!activeTag ? "page" : undefined}
        >
          All tropes
        </Link>
        {ACTIVE_TAGS.map((t) => {
          const isActive = activeTag === t.slug;
          return (
            <Link
              key={t.slug}
              href={buildQuery({ tag: t.slug })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "border-gold-500/40 bg-gold-500/15 text-gold-400"
                  : "border-white/10 bg-night-800/60 text-parchment-300/60 hover:border-gold-500/30 hover:text-gold-400"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {t.label}
            </Link>
          );
        })}
        {activeTag && activeTagMeta && (
          <Link
            href={`/tag/${activeTagMeta.slug}`}
            className="ml-2 inline-flex items-center gap-1 rounded-full border border-plum-700/40 bg-plum-900/30 px-3 py-1 text-xs font-medium text-parchment-300/80 hover:border-gold-500/30 hover:text-gold-400"
          >
            View dedicated {activeTagMeta.label} page&nbsp;&rarr;
          </Link>
        )}
      </nav>

      {/* ── Preview explainer banner ──────────────────────────── */}
      <PreviewBanner totalPreviews={_allPreviews.length} />

      {/* ── Character grid ──────────────────────────────────── */}
      {characters.length === 0 ? (
        <p className="py-12 text-center text-parchment-300/50">
          No characters match this filter yet &mdash; more coming soon.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((c, i) => (
            <CharacterCard key={c.slug} character={c} eager={i < 3} />
          ))}
        </div>
      )}

      {/* ── FAQ (ChatGPT / Google indexing) ──────────────────── */}
      <FaqBlock items={FAQ} />

      {/* ── Horizontal discovery: the other pillars ─────────── */}
      <section className="mx-auto max-w-4xl space-y-4">
        <h2 className="heading-2 text-center">Or take a different path</h2>
        <p className="mx-auto max-w-xl text-center text-sm text-parchment-300/60">
          Stories aren&rsquo;t the only thing here. The other two pathways
          are one click away.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/character-builder-academy"
            className="group rounded-xl border border-white/5 bg-card-gradient p-5 transition-all hover:border-gold-500/30"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-gold-400/80">
              Build
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold text-parchment-100 group-hover:text-gold-400">
              Author your own world
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-parchment-300/70">
              Eight craft lessons that teach you how to write a brief
              good enough to power a 30-chapter campaign. Your dragon-bonded
              heir, your fae court, your story.
            </p>
            <p className="mt-3 text-sm font-medium text-gold-400">
              Open the Academy&nbsp;&rarr;
            </p>
          </Link>
          <Link
            href="/prompt-studio"
            className="group rounded-xl border border-white/5 bg-card-gradient p-5 transition-all hover:border-gold-500/30"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-gold-400/80">
              Studio
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold text-parchment-100 group-hover:text-gold-400">
              Make scenes for your story
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-parchment-300/70">
              Compose cinematic stills and 60-second video clips for any
              scene in any story. Stitch into feature-length sequences,
              or make standalone fan art.
            </p>
            <p className="mt-3 text-sm font-medium text-gold-400">
              Open Prompt Studio&nbsp;&rarr;
            </p>
          </Link>
        </div>
        <p className="text-center text-xs text-parchment-300/50">
          Or jump straight to{" "}
          <Link href="/books" className="text-gold-400 hover:underline">
            book-inspired worlds
          </Link>{" "}
          &middot;{" "}
          <Link href="/create" className="text-gold-400 hover:underline">
            the 3-step wizard
          </Link>
        </p>
      </section>
    </div>
  );
}

/* ── Preview explainer banner ─────────────────────────────────────── */

/**
 * Small notice above the character grid that teaches users what the
 * gold pill on certain card images means. Shown unconditionally so we
 * set expectations even before the eye finds the first marked card.
 */
function PreviewBanner({ totalPreviews }: { totalPreviews: number }) {
  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-gold-500/20 bg-plum-900/20 px-5 py-3 text-center text-sm text-parchment-300/80">
      <span className="mr-2 inline-flex items-center gap-1 align-middle text-[10px] font-semibold uppercase tracking-wider text-gold-400">
        <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
        60-sec preview
      </span>
      Cards marked with the pill have a free interactive story preview &mdash;
      try {totalPreviews} of them on this page before you commit to a chat.
    </div>
  );
}
