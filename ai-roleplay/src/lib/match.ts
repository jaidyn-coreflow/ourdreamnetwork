/**
 * Wizard \u2192 character matcher.
 *
 * Pure functions only \u2014 no React, no fetch. Drives the inspiration
 * picks shown on the final step of `/create` and feeds the secondary
 * "Chat with our top pick" CTA. The primary CTA always goes to
 * ourdream's /create with funnel preselects.
 *
 * Trope was removed from the wizard in PR 4. Reason: ourdream's /create
 * has no canonical trope param, so collecting it added a step without
 * driving any preselect. Filtering now uses gender alone; inspiration
 * cards surface the rank-1 characters of the chosen gender.
 */

import { FEATURED_CHARACTERS, type Character } from "@/data/characters";

/* ── Public option vocabularies ──────────────────────────────────── */

export const WIZARD_GENDERS = ["female", "male", "any"] as const;
export type WizardGender = (typeof WIZARD_GENDERS)[number];

export const WIZARD_STYLES = ["realistic", "anime", "any"] as const;
export type WizardStyle = (typeof WIZARD_STYLES)[number];

/* ── Choice shape ─────────────────────────────────────────────────── */

export interface WizardChoices {
  gender?: WizardGender;
  style?: WizardStyle;
}

/* ── Matchers ─────────────────────────────────────────────────────── */

/**
 * Filter the catalogue down to characters that match the wizard's
 * gender choice. `any` (or omitted) acts as a wildcard.
 *
 * Sorting: ranked first (lowest rank wins), then unranked in source
 * order. That keeps the curated top-12 surfacing as inspiration.
 */
export function filterCharacters(choices: WizardChoices): Character[] {
  const { gender } = choices;
  const wantsGender = gender === "female" || gender === "male";

  const pool = wantsGender
    ? FEATURED_CHARACTERS.filter((c) => c.gender === gender)
    : [...FEATURED_CHARACTERS];

  return pool.sort((a, b) => {
    if (a.rank != null && b.rank != null) return a.rank - b.rank;
    if (a.rank != null) return -1;
    if (b.rank != null) return 1;
    return 0;
  });
}

/**
 * Pick the single best inspiration character for the user's choices.
 * Returns null when the filters zero out (defensive \u2014 the trope set
 * is sized to prevent this in practice).
 */
export function bestMatch(choices: WizardChoices): Character | null {
  return filterCharacters(choices)[0] ?? null;
}

/**
 * Pick up to N inspiration cards. Used on the reveal step to show
 * "Stories like the one you're about to build".
 */
export function topMatches(choices: WizardChoices, n = 3): Character[] {
  return filterCharacters(choices).slice(0, n);
}

/* ── ourdream URL extras builder ──────────────────────────────────── */

/**
 * Translate wizard choices into the `extras` map for OutboundLink.
 * `any` resolves to omission so ourdream's defaults take over.
 */
export function choicesToExtras(
  choices: WizardChoices,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (choices.gender && choices.gender !== "any") out.gender = choices.gender;
  if (choices.style && choices.style !== "any") out.style = choices.style;
  return out;
}
