/**
 * CharacterCard
 *
 * Vertical character card used on /characters, /characters/tag/[tag],
 * and any other "catalogue grid" surface. Designed to surface our
 * highest-leverage UX moves at-a-glance:
 *
 *   1. A "60-sec preview" pill in the top-left of the card image when
 *      a hand-authored CYOA preview exists for that character. This is
 *      the primary visual signal to users that they can taste the
 *      story before redirecting.
 *   2. A three-CTA action row at the bottom:
 *        - "Chat now" (primary, gold) \u2014 deep-links straight to ourdream
 *        - "60-sec preview" (secondary chip) \u2014 anchors to the
 *          interactive ChatPreview on the detail page
 *        - "Details" (tertiary text link) \u2014 the full detail page
 *      Cards without a preview collapse the secondary chip and keep
 *      the primary + a Details text link.
 *
 * Why a server component:
 *   No interactivity, no hooks. The OutboundLink (which is itself a
 *   client component wrapped in <Suspense>) handles the only dynamic
 *   piece (search-param pass-through).
 */

import Image from "next/image";
import Link from "next/link";
import { OutboundLink } from "./OutboundLink";
import { hasChatPreview } from "@/data/chat-previews";
import type { Character } from "@/data/characters";

interface Props {
  character: Character;
  /**
   * Whether this card sits in the first row of its grid. First-row
   * images get `loading="eager"` so they don't push LCP off the cliff.
   */
  eager?: boolean;
}

export function CharacterCard({ character: c, eager = false }: Props) {
  const showsPreview = hasChatPreview(c.slug);
  const ourdreamPath = new URL(c.chatUrl).pathname;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-white/5 bg-card-gradient transition-colors hover:border-gold-500/20">
      {/* Image \u2014 anchored relative so the preview pill can absolute-pin. */}
      <Link
        href={
          showsPreview
            ? `/characters/${c.slug}#chat-preview`
            : `/characters/${c.slug}`
        }
        className="relative block"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-night-800">
          <Image
            src={c.imageUrl}
            alt={c.name}
            width={512}
            height={512}
            /* Grid is 1-up on mobile, 2-up on sm, 3-up on lg.
             * Pick the largest plausible rendered width per breakpoint
             * so the optimizer doesn't oversend on phones. */
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            priority={eager}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        {showsPreview && <PreviewBadge />}
      </Link>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <Link href={`/characters/${c.slug}`}>
            <h3 className="font-display text-xl font-semibold text-gold-400 hover:text-gold-300">
              {c.name}
            </h3>
          </Link>
          <p className="mt-1.5 text-sm leading-relaxed text-parchment-300/70">
            {c.vibe}
          </p>
          {c.description && (
            <p className="mt-1 text-xs leading-relaxed text-parchment-300/50">
              {c.description}
            </p>
          )}
        </div>

        {/* ── Action row ─────────────────────────────────────── */}
        <div className="mt-5 space-y-2">
          {/* Primary CTA \u2014 always present, full-width to dominate the eye. */}
          <OutboundLink
            path={ourdreamPath}
            className="btn-primary w-full justify-center text-sm"
          >
            Chat now&nbsp;&rarr;
          </OutboundLink>

          {/* Secondary row: preview chip (if available) + tiny details link. */}
          <div className="flex items-center justify-between gap-2">
            {showsPreview ? (
              <Link
                href={`/characters/${c.slug}#chat-preview`}
                className="inline-flex items-center gap-1 rounded-full border border-gold-500/30 bg-plum-900/20 px-3 py-1 text-xs font-medium text-gold-400 transition-colors hover:border-gold-500/50 hover:bg-plum-900/40"
              >
                60-sec preview&nbsp;&rarr;
              </Link>
            ) : (
              /* Spacer keeps the Details link right-aligned even when
               * the preview chip is absent, so cards stay visually
               * consistent across the grid. */
              <span aria-hidden className="block" />
            )}
            <Link
              href={`/characters/${c.slug}`}
              className="text-xs text-parchment-300/50 underline-offset-2 hover:text-gold-400 hover:underline"
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── Preview badge ────────────────────────────────────────────────── */

/**
 * Small pill positioned top-left over the card image. The /characters
 * page banner explains what the pill means; this is the at-a-glance
 * signal users see while scanning the grid. Gold + plum to match the
 * primary action and stand out from the dark image background.
 */
export function PreviewBadge() {
  return (
    <span
      /* aria-hidden because the same information is duplicated in the
       * "60-sec preview" CTA below; double-announcement clutters
       * screen reader output. */
      aria-hidden
      className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-gold-500/40 bg-night-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-400 backdrop-blur-sm"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
      60-sec preview
    </span>
  );
}
