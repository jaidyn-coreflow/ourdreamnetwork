/**
 * Chat preview registry.
 *
 * Slug-keyed lookup for the per-character CYOA previews. Imports stay
 * lazy-friendly (one file per character) so adding a new preview is a
 * single new file + one line in the registry.
 *
 * Validation runs at module init in non-production builds so authoring
 * mistakes (typo'd choice targets, orphan nodes, mid+leaf collisions)
 * fail loudly the first time the page is loaded in dev.
 */

import { type ChatPreview, assertPreviewValid } from "./types";
import bondedThrone from "./dragon-rider-bonded-throne";
import courtsOfStarlight from "./courts-of-starlight";
import ironCommander from "./iron-commander";
import ironveilEmperor from "./ironveil-emperor";
import stormRider from "./storm-rider";
import centurion from "./centurion";
import crimsonCovenant from "./crimson-covenant";
import quilanaVaelrith from "./quilana-vaelrith";
import royalPains from "./royal-pains";
import adrianWolfe from "./adrian-wolfe";
import maeveAnon from "./maeve-anon";
import dawsonMonroe from "./dawson-monroe";

const PREVIEWS: ReadonlyArray<ChatPreview> = [
  bondedThrone,
  courtsOfStarlight,
  ironCommander,
  ironveilEmperor,
  stormRider,
  centurion,
  crimsonCovenant,
  quilanaVaelrith,
  royalPains,
  adrianWolfe,
  maeveAnon,
  dawsonMonroe,
];

/* Indexed lookup. Built once at module init. */
const PREVIEW_BY_SLUG: ReadonlyMap<string, ChatPreview> = new Map(
  PREVIEWS.map((p) => [p.characterSlug, p]),
);

if (process.env.NODE_ENV !== "production") {
  for (const p of PREVIEWS) {
    /* Throws on referential errors; surfaces in `next dev` console + tests. */
    assertPreviewValid(p);
  }
  /* Catch duplicate slug registrations \u2014 silent overrides are a footgun. */
  if (PREVIEW_BY_SLUG.size !== PREVIEWS.length) {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const p of PREVIEWS) {
      if (seen.has(p.characterSlug)) dupes.push(p.characterSlug);
      seen.add(p.characterSlug);
    }
    throw new Error(
      `[chat-previews] duplicate slug registrations: ${dupes.join(", ")}`,
    );
  }
}

export function getChatPreview(slug: string): ChatPreview | null {
  return PREVIEW_BY_SLUG.get(slug) ?? null;
}

export function hasChatPreview(slug: string): boolean {
  return PREVIEW_BY_SLUG.has(slug);
}

/** Public for tests / observability. */
export const _allPreviews = PREVIEWS;
