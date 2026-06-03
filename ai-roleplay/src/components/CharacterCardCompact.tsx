/**
 * CharacterCardCompact
 *
 * The horizontal "avatar + text" card used on the home page top-9
 * grid and the related-characters strip on character detail pages.
 *
 * Information density is intentionally lower than CharacterCard \u2014
 * this surface is a glance, not a destination. The CYOA preview
 * affordance is surfaced as a small inline link rather than a chip,
 * and the avatar carries a tiny gold-dot indicator instead of a full
 * pill (no room for it).
 */

import Image from "next/image";
import Link from "next/link";
import { ChatNowButton } from "./ChatNowButton";
import { hasChatPreview } from "@/data/chat-previews";
import type { Character } from "@/data/characters";

interface Props {
  character: Character;
  /** Show "age" inline next to the name. Useful on home, off elsewhere. */
  showAge?: boolean;
  /** Eager-load the avatar image (above-the-fold rows). */
  eager?: boolean;
}

export function CharacterCardCompact({
  character: c,
  showAge = false,
  eager = false,
}: Props) {
  const showsPreview = hasChatPreview(c.slug);
  const detailHref = showsPreview
    ? `/${c.slug}#chat-preview`
    : `/${c.slug}`;

  return (
    <article className="group flex items-start gap-4 rounded-xl border border-white/5 bg-card-gradient p-4 transition-colors hover:border-gold-500/20">
      {/* Avatar \u2014 anchored relative for the gold-dot preview indicator. */}
      <Link href={detailHref} className="relative shrink-0">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-night-800">
          <Image
            src={c.imageUrl}
            alt={showAge ? `${c.name}, age ${c.age}` : c.name}
            width={56}
            height={56}
            /* Avatar size is fixed at 56px (2x for retina). */
            sizes="56px"
            priority={eager}
            className="h-full w-full object-cover"
          />
        </div>
        {showsPreview && (
          <span
            /* aria-hidden \u2014 redundant with the visible "Preview" text link. */
            aria-hidden
            title="60-second preview available"
            className="absolute -right-1 -top-1 inline-block h-3 w-3 rounded-full border-2 border-night-900 bg-gold-400"
          />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/${c.slug}`}>
          <h3 className="font-display text-base font-semibold text-gold-400 group-hover:text-gold-300">
            {c.name}
            {showAge && (
              <span className="ml-1.5 text-sm font-normal text-parchment-300/50">
                {c.age}
              </span>
            )}
          </h3>
        </Link>
        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-parchment-300/60">
          {c.vibe}
        </p>

        {/* Inline action row \u2014 keep it tight; this surface is a teaser. */}
        <div className="mt-2 flex items-center gap-3 text-xs font-semibold">
          <ChatNowButton chatUrl={c.chatUrl} className="text-gold-400 hover:text-gold-300">
            Chat now&nbsp;&rarr;
          </ChatNowButton>
          {showsPreview && (
            <Link
              href={`/${c.slug}#chat-preview`}
              className="text-parchment-300/70 hover:text-gold-300"
            >
              60-sec preview&nbsp;&rarr;
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
