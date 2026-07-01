/**
 * Chat preview registry \u2014 the 5 /experience story trees.
 *
 * Slug-keyed lookup. Validation runs at module init in non-production builds
 * so authoring mistakes (typo'd choice targets, orphan nodes, mid+leaf
 * collisions, duplicate slugs) fail loudly on first load in dev.
 */

import { type ChatPreview, assertPreviewValid } from "./types";
import aricVenn from "./aric-venn";
import lucenAldair from "./lucen-aldair";
import marloweVesper from "./marlowe-vesper";
import vaughnCrowe from "./vaughn-crowe";
import rookCallahan from "./rook-callahan";

const PREVIEWS: ReadonlyArray<ChatPreview> = [
  aricVenn,
  lucenAldair,
  marloweVesper,
  vaughnCrowe,
  rookCallahan,
];

const PREVIEW_BY_SLUG: ReadonlyMap<string, ChatPreview> = new Map(
  PREVIEWS.map((p) => [p.characterSlug, p]),
);

if (process.env.NODE_ENV !== "production") {
  for (const p of PREVIEWS) {
    assertPreviewValid(p);
  }
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

export const _allPreviews = PREVIEWS;
