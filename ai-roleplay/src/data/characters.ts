/**
 * Signature leads for the /experience story funnel.
 *
 * Five original, legally-distinct, anime-style, female-POV leads. Each has a
 * branching CYOA story (see src/data/chat-previews) and per-character email-gate
 * copy. `chatUrl` is a PLACEHOLDER until real ourdream chat slugs exist — the
 * redirect derives sub17 from its /chat/<slug> path. Portraits are user-supplied
 * webp files under public/characters/.
 *
 * Never use the source game's or its characters' names in any copy or metadata.
 */

export interface GateCopy {
  /** Emotional tagline above the email field. */
  headline: string;
  /** Instruction line ("Enter your email to …"). */
  sub: string;
  /** Submit button label. */
  button: string;
}

export interface Character {
  slug: string;
  name: string;
  /** Short power descriptor, shown as a badge. */
  power: string;
  /** One-line hook for the picker card + hero. */
  hook: string;
  /** Portrait: picker card, hero, and chat avatar. PLACEHOLDER file for now. */
  imageUrl: string;
  /** Base ourdream.ai chat URL. PLACEHOLDER slug — user supplies real id. */
  chatUrl: string;
  gate: GateCopy;
}

export const FEATURED_CHARACTERS: Character[] = [
  {
    slug: "aric-venn",
    name: "Dr. Aric Venn",
    power: "Frost · cryokinesis",
    hook: "The cold surgeon with a childhood promise — he freezes everything he touches, except you.",
    imageUrl: "/ai-roleplay/characters/aric-venn.webp",
    chatUrl: "https://ourdream.ai/chat/aric-venn-PLACEHOLDER",
    gate: {
      headline: "Aric remembers every word.",
      sub: "Enter your email to hear what he's been holding back.",
      button: "Hear his confession →",
    },
  },
  {
    slug: "lucen-aldair",
    name: "Lucen Aldair",
    power: "Light-bending · time-slip",
    hook: "The sleepy guardian hiding immense power — he slows the dawn just to keep you in it.",
    imageUrl: "/ai-roleplay/characters/lucen-aldair.webp",
    chatUrl: "https://ourdream.ai/chat/lucen-aldair-PLACEHOLDER",
    gate: {
      headline: "He'll remember this dawn.",
      sub: "Enter your email to keep the morning from ending.",
      button: "Keep the morning →",
    },
  },
  {
    slug: "marlowe-vesper",
    name: "Marlowe Vesper",
    power: "Tide-calling · water",
    hook: "The temperamental artist with a drowned-royal secret — every canvas in his studio is you.",
    imageUrl: "/ai-roleplay/characters/marlowe-vesper.webp",
    chatUrl: "https://ourdream.ai/chat/marlowe-vesper-PLACEHOLDER",
    gate: {
      headline: "Marlowe never forgets a face.",
      sub: "Enter your email before the tide comes in.",
      button: "Before the tide →",
    },
  },
  {
    slug: "vaughn-crowe",
    name: "Vaughn Crowe",
    power: "Gravity-warping",
    hook: "The syndicate lord soft only for you — one word and grown men kneel, but he wants you standing.",
    imageUrl: "/ai-roleplay/characters/vaughn-crowe.webp",
    chatUrl: "https://ourdream.ai/chat/vaughn-crowe-PLACEHOLDER",
    gate: {
      headline: "Vaughn doesn't repeat himself.",
      sub: "Enter your email to learn what he's protecting you from.",
      button: "Learn the truth →",
    },
  },
  {
    slug: "rook-callahan",
    name: "Rook Callahan",
    power: "Solar-flare · plasma",
    hook: "Childhood best friend, ace pilot, darker turn — he's hidden a small sun to stay close to you.",
    imageUrl: "/ai-roleplay/characters/rook-callahan.webp",
    chatUrl: "https://ourdream.ai/chat/rook-callahan-PLACEHOLDER",
    gate: {
      headline: "Rook's waited your whole life.",
      sub: "Enter your email to hear what he never said.",
      button: "Hear him out →",
    },
  },
];

export function getCharacter(slug: string): Character | undefined {
  return FEATURED_CHARACTERS.find((c) => c.slug === slug);
}
