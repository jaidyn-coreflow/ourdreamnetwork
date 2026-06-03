import type { Metadata } from "next";
import Link from "next/link";
import { CharacterCard } from "@/components/CharacterCard";
import { FaqBlock } from "@/components/FaqBlock";
import { _allPreviews } from "@/data/chat-previews";
import { FEATURED_CHARACTERS, type Tag } from "@/data/characters";
import { ACTIVE_TAGS, getTagMeta } from "@/lib/tags";

const FAQ = [
  {
    q: "What are OurDream AI roleplay characters?",
    a: "Original AI roleplay personas you can chat with \u2014 each with its own personality, world, and story. The top characters include a free 60-second interactive preview you can play right here before you start chatting.",
  },
  {
    q: "Are these characters based on copyrighted books?",
    a: "No. Every character is entirely original. We do not reproduce copyrighted names, likenesses, or plot details from any published work.",
  },
  {
    q: "How much does it cost to start?",
    a: "Enter your email and you\u2019ll get 5 free messages with any character \u2014 no upfront payment to try it.",
  },
  {
    q: "How do I start chatting with a character?",
    a: "Pick any character and tap \u201cChat now\u201d, or play the free 60-second preview first. Enter your email to unlock 5 free messages and continue the story on ourdream.",
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
      "Sixty-plus original AI roleplay characters with choose-your-own-adventure depth. Free 60-second interactive previews on the top characters, then 5 free messages to start chatting.",
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
        <p className="text-sm uppercase tracking-[0.25em] text-gold-400/80">
          Stories
        </p>
        <h1 className="heading-1 mt-2">AI Roleplay: Stories That You Can Play</h1>
        <p className="mt-4 text-lg text-parchment-300/80">
          Netflix-meets-video-game romantasy. Sixty-plus original story
          worlds with choose-your-own-adventure depth &mdash; your choices
          shape the plot, the romance, and the ending. Pick a story below
          and start with a free 60-second preview before you commit.
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
              href={`/tag/${t.slug}`}
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
