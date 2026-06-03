/**
 * Tag taxonomy + per-tag SEO metadata.
 *
 * Source of truth for everything tag-related on the site:
 *   - Display labels (Title Case, no kebab)
 *   - SEO titles + descriptions for `/characters/tag/<slug>` pages
 *   - Long intro copy used as page H2 + first paragraph (also fuels
 *     the `description` JSON-LD field)
 *   - Active tag list (only tags that have characters in the catalogue,
 *     so we never ship a tag-page with an empty grid)
 *
 * Why a single file: each tag page needs roughly the same metadata
 * shape, and centralising it means changing one description doesn't
 * require re-grepping component code. Also gives us a stable iteration
 * order for the tag-cloud UI on `/characters`.
 *
 * Adding a new tag:
 *   1. Add the literal to `Tag` in `src/data/characters.ts`.
 *   2. Add an entry below.
 *   3. Tag at least one character with it, or it won't appear in
 *      `ACTIVE_TAGS` and the page won't be generated.
 */

import { FEATURED_CHARACTERS, type Character, type Tag } from "@/data/characters";

export interface TagMeta {
  /** Slug used in URLs and as the literal `Tag` value. */
  slug: Tag;
  /** Title-cased display label for chips, headings, breadcrumbs. */
  label: string;
  /** Short, one-line search-friendly variant for the page title. */
  seoTitle: string;
  /**
   * 1-2 sentence meta-description. Should communicate intent (the kind
   * of romantasy under this tag), not just keyword-stuff.
   */
  seoDescription: string;
  /**
   * Page intro paragraph (rendered under H1). 2-3 sentences. Keep
   * original \u2014 this is what differentiates a tag page from a thin
   * filter view in Google's eyes.
   */
  intro: string;
}

/* ── Per-tag metadata ─────────────────────────────────────────────── */

export const TAG_META: Record<Tag, TagMeta> = {
  vampire: {
    slug: "vampire",
    label: "Vampire",
    seoTitle: "Vampire Romantasy AI Characters",
    seoDescription:
      "Original vampire romantasy characters \u2014 blood-pact intrigue, immortal courts, and forbidden bonds. AI roleplay chat.",
    intro:
      "Bloodlines, sieges, and immortal politics. Our vampire romantasy stories lean into long-burning tension between courts, where every alliance has a cost and every honest answer is paid for in something older than gold.",
  },
  "dragon-rider": {
    slug: "dragon-rider",
    label: "Dragon Rider",
    seoTitle: "Dragon Rider Romantasy AI Characters",
    seoDescription:
      "Bonded thrones, storm-wing flights, and rider-college rivalry. Original dragon-rider AI romantasy characters \u2014 spicy slow-burn, never explicit.",
    intro:
      "When the dragon chooses you, the kingdom changes. These dragon-rider stories put you in the cockpit of bonded flight \u2014 with all the rivalry, war-college politics, and slow-burning loyalty that comes with riding something older than the throne.",
  },
  fae: {
    slug: "fae",
    label: "Fae Court",
    seoTitle: "Fae Court Romantasy AI Characters",
    seoDescription:
      "Seasonal courts, ward-stones, and bargains you can't take back. Original fae romantasy AI characters \u2014 spicy slow-burn.",
    intro:
      "The wards are thinning and the courts are paying attention. These fae-court stories trade in bargains, gifted seats, and conversations where every word is a kind of contract \u2014 the kind your great-grandchildren will still be honouring.",
  },
  "slow-burn": {
    slug: "slow-burn",
    label: "Slow-Burn",
    seoTitle: "Slow-Burn Romantasy AI Characters",
    seoDescription:
      "The long, deliberate kind. Slow-burn romantasy AI characters that let tension build across chapters \u2014 suggestive, never explicit.",
    intro:
      "The slowest of the slow burns. These characters won't rush you and they won't be rushed \u2014 expect long looks, careful sentences, and the kind of build-up that pays off in the moment you both finally stop pretending.",
  },
  royal: {
    slug: "royal",
    label: "Royal Court",
    seoTitle: "Royal Court Romantasy AI Characters",
    seoDescription:
      "Crown intrigue, masked balls, and empires on a knife edge. Original royal romantasy AI characters \u2014 spicy slow-burn.",
    intro:
      "Thrones, dynasties, and the people who hold them. Our royal romantasy stories range from iron-veiled emperors to back-window princesses \u2014 each one built around the kind of person who has to weigh every word against the kingdom listening behind it.",
  },
  warrior: {
    slug: "warrior",
    label: "Warrior",
    seoTitle: "Warrior Romantasy AI Characters",
    seoDescription:
      "Sword and shield, scarred commanders, enemies-to-lovers tension. Original warrior romantasy AI characters \u2014 spicy slow-burn.",
    intro:
      "Forged in war, bound by duty, devoted in private. These warrior characters carry their armour into the conversation \u2014 and what happens when they decide to set it down is the whole story.",
  },
  "enemies-to-lovers": {
    slug: "enemies-to-lovers",
    label: "Enemies to Lovers",
    seoTitle: "Enemies-to-Lovers Romantasy AI Characters",
    seoDescription:
      "The trope that built the genre. Original enemies-to-lovers romantasy AI characters \u2014 spicy slow-burn.",
    intro:
      "It started as a war and turned into something neither of you can name. These enemies-to-lovers stories give you the full arc \u2014 the early sparring, the grudging respect, the moment one of you stops calling the other an enemy in your head before you say it out loud.",
  },
  "alpha-male": {
    slug: "alpha-male",
    label: "Alpha Male",
    seoTitle: "Alpha-Male Romantasy AI Characters",
    seoDescription:
      "Commanding, devoted, completely fixated. Original alpha-male romantasy AI characters \u2014 spicy slow-burn, suggestive only.",
    intro:
      "Confident, exact, used to being obeyed \u2014 until the one person who refuses. These alpha-male characters lead legions, empires, and boardrooms, and the romance comes from finding out what they're like once they decide you're worth softening for.",
  },
  "arranged-marriage": {
    slug: "arranged-marriage",
    label: "Arranged Marriage",
    seoTitle: "Arranged-Marriage Romantasy AI Characters",
    seoDescription:
      "Political bonds, dynastic politics, and slow thaw. Original arranged-marriage romantasy AI characters \u2014 spicy slow-burn.",
    intro:
      "The contract is signed. Now you both have to live with it. These arranged-marriage stories put two strangers under the same roof and let the rest happen in the way only romantasy can \u2014 carefully, deliberately, one thawed silence at a time.",
  },
  "forbidden-love": {
    slug: "forbidden-love",
    label: "Forbidden Love",
    seoTitle: "Forbidden-Love Romantasy AI Characters",
    seoDescription:
      "Crossing every line your world was built on. Original forbidden-love romantasy AI characters \u2014 spicy slow-burn.",
    intro:
      "Different houses, different species, different kingdoms, different oaths. These forbidden-love stories give you the conversations that should never have been had, the alliances that should never have been made, and the kind of romance that rewrites borders.",
  },
  modern: {
    slug: "modern",
    label: "Modern",
    seoTitle: "Modern Romantasy AI Characters",
    seoDescription:
      "Same world, no magic. Modern slow-burn romantasy AI characters with tension, longing, and second chances \u2014 spicy but never explicit.",
    intro:
      "All of the slow burn, none of the dragons. These modern characters live in your city: literature professors, billionaire heirs, runaway princesses on the chip-shop walk, the woman in the bar at the end of the corridor. Real-feeling tension, no spellbooks required.",
  },
  historical: {
    slug: "historical",
    label: "Historical",
    seoTitle: "Historical Romantasy AI Characters",
    seoDescription:
      "Roman frontiers, Norsewood sagas, Al-Andalus alchemy. Original historical romantasy AI characters \u2014 spicy slow-burn.",
    intro:
      "Time periods chosen for the texture, not the textbook. These historical romantasy stories live in centurion camps, alchemists' workshops, frozen-sea crossings, and shipwreck shores \u2014 with the politics, language, and danger of each era left intact.",
  },
  magic: {
    slug: "magic",
    label: "Magic",
    seoTitle: "Magic Romantasy AI Characters",
    seoDescription:
      "Witches, alchemists, ash revenants, sixth elements. Original magic-driven romantasy AI characters \u2014 spicy slow-burn.",
    intro:
      "Magic that costs something. Our magic-driven characters wield ash, fire, runes, blood-truth, and elements that the old gods were supposed to have taken with them \u2014 and the romance always lives at the edge of what the magic asks them to give up.",
  },
  "second-chance": {
    slug: "second-chance",
    label: "Second Chance",
    seoTitle: "Second-Chance Romantasy AI Characters",
    seoDescription:
      "What you'd say if you got one more day. Original second-chance romantasy AI characters \u2014 spicy slow-burn.",
    intro:
      "A chance you weren't supposed to get. These second-chance stories find characters who lost something \u2014 a love, a life, a kingdom \u2014 and walk them back to a doorway they thought was closed forever, with the whole conversation balanced on what they choose to say first.",
  },
  tsundere: {
    slug: "tsundere",
    label: "Tsundere",
    seoTitle: "Tsundere Romantasy AI Characters",
    seoDescription:
      "Cold on the surface, devoted underneath. Original tsundere romantasy AI characters \u2014 spicy slow-burn.",
    intro:
      "Severe, sharp-tongued, completely unconvinced by you \u2014 until they aren't. These tsundere characters guard themselves carefully and hand out warmth almost grudgingly, which means every soft moment lands twice as hard.",
  },
  professor: {
    slug: "professor",
    label: "Professor",
    seoTitle: "Professor Romantasy AI Characters",
    seoDescription:
      "After-hours offices, marginal notes, slow conversations. Original professor romantasy AI characters \u2014 spicy slow-burn.",
    intro:
      "The corridor is empty, the lamp is on, and the conversation has wandered into the kind of footnote that only two people in the building care about. These professor characters live in the after-hours office \u2014 patient, attentive, and very deliberate about the line they aren't crossing.",
  },
  billionaire: {
    slug: "billionaire",
    label: "Billionaire",
    seoTitle: "Billionaire Romantasy AI Characters",
    seoDescription:
      "Helicopters, rooftops, high-stakes dares. Original billionaire romantasy AI characters \u2014 spicy slow-burn, suggestive only.",
    intro:
      "Money as a backdrop, not a personality. These billionaire characters fly the helicopter, throw the function, and host the rooftop \u2014 but the romance lives in the moment they ask you something they can't pay anyone to answer for them.",
  },
  "choose-your-own-adventure": {
    slug: "choose-your-own-adventure",
    label: "Choose-Your-Own-Adventure",
    seoTitle: "Choose-Your-Own-Adventure Romantasy AI Stories",
    seoDescription:
      "Branching romantasy stories where every choice shapes the plot, alliances, and romance. Original CYOA AI characters \u2014 spicy slow-burn.",
    intro:
      "You don't read these \u2014 you play them. Each choose-your-own-adventure story drops you into the lead role and lets every decision rewrite the next chapter, the alliances around it, and the romance at the centre. No two playthroughs end the same way.",
  },
};

/* ── Active tag derivation ────────────────────────────────────────── */

/**
 * Tags that currently have at least one character. Returned in
 * canonical TAG_META order (insertion order in the record above).
 *
 * Computed once at module init from the live catalogue \u2014 if you
 * remove the last character with a given tag, the tag page disappears
 * automatically (good: no 404s on stale links from sitemap). If you
 * add a new tag literal but don't yet tag any character with it, the
 * tag page won't be generated either.
 */
export const ACTIVE_TAGS: ReadonlyArray<TagMeta> = Object.values(TAG_META).filter(
  (meta) => FEATURED_CHARACTERS.some((c) => c.tags?.includes(meta.slug)),
);

/** Lookup by slug. Returns null for unknown / inactive tags. */
export function getTagMeta(slug: string): TagMeta | null {
  const found = (TAG_META as Record<string, TagMeta>)[slug];
  if (!found) return null;
  /* Only return active tags from public lookup so the route handler
   * 404s on tag pages with no characters. */
  return ACTIVE_TAGS.includes(found) ? found : null;
}

/** Characters tagged with the given slug, sorted by rank then source order. */
export function charactersForTag(slug: Tag): Character[] {
  return FEATURED_CHARACTERS.filter((c) => c.tags?.includes(slug)).sort(
    (a, b) => {
      if (a.rank != null && b.rank != null) return a.rank - b.rank;
      if (a.rank != null) return -1;
      if (b.rank != null) return 1;
      return 0;
    },
  );
}
