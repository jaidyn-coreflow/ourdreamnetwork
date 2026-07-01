# /experience Story Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repurpose the `/ai-roleplay` Next.js zone into a 5-character interactive branching-story funnel whose email gate is the primary Google Ads conversion.

**Architecture:** Reuse the zone's existing CYOA dialogue-tree engine (`ChatPreview` + `chat-previews/types.ts`), RedTrack funnel (`redirect.ts` + `funnel-client.ts`), GTM/uniclick wiring, and `basePath: /ai-roleplay`. Replace all catalogue content: 5 new leads, 5 authored 7-node reconverging story trees, a character-select landing, a simplified per-character page, per-character email-gate copy, and a new `generate_lead` conversion push. Delete tag pages and catalogue-only SEO surfaces.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Vitest. Working directory for all commands: `ai-roleplay/`.

## Global Constraints

- All work happens inside the `ai-roleplay/` directory. Run every `npm`/`npx` command from there.
- Public URL stays `/ai-roleplay`. Do NOT change `next.config.js` `basePath`/`assetPrefix` or `vercel.json`.
- RedTrack: reuse the existing ai-roleplay campaign in `redirect.ts` (`REDTRACK_BASE`), `sub11="ai-roleplay"`, `sub17=<per-character chat slug>`. Do NOT invent a new campaign id.
- Google Sheet save `mode` label = `"experience"`.
- The email gate MUST push `{ event: 'generate_lead', currency: 'USD', value: 1.0, user_data: { email } }` on valid submit BEFORE redirect. It is the only GTM-wired conversion here. Do NOT rely on `quiz_email_captured`/`quiz_redirect` (no GTM trigger).
- Never block the redirect on `saveEmail` (fire-and-forget).
- `_gl` MUST come from `getGlValue()`, never from the URL.
- Every story beat stays SFW. Never use the source game's or its characters' names in any code, copy, or metadata. Rook is a childhood **friend**, never a sibling.
- The zone stays `robots: noindex` (already set in `lib/metadata.ts`).
- The 5 slugs are exactly: `aric-venn`, `lucen-aldair`, `marlowe-vesper`, `vaughn-crowe`, `rook-callahan`.
- Character portraits and real ourdream chat slugs are user-supplied later; use the documented placeholders.

---

### Task 1: Character data model + 5 leads

**Files:**
- Modify (full rewrite): `ai-roleplay/src/data/characters.ts`
- Create: `ai-roleplay/src/data/characters.test.ts`

**Interfaces:**
- Produces:
  - `interface GateCopy { headline: string; sub: string; button: string }`
  - `interface Character { slug: string; name: string; power: string; hook: string; imageUrl: string; chatUrl: string; gate: GateCopy }`
  - `const FEATURED_CHARACTERS: Character[]` — the 5 leads (this exact export name is consumed by the pages)
  - `function getCharacter(slug: string): Character | undefined`

- [ ] **Step 1: Write the failing test**

Create `ai-roleplay/src/data/characters.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { FEATURED_CHARACTERS, getCharacter } from "./characters";

const EXPECTED_SLUGS = [
  "aric-venn",
  "lucen-aldair",
  "marlowe-vesper",
  "vaughn-crowe",
  "rook-callahan",
];

describe("FEATURED_CHARACTERS", () => {
  it("has exactly the 5 signature leads", () => {
    expect(FEATURED_CHARACTERS.map((c) => c.slug).sort()).toEqual(
      [...EXPECTED_SLUGS].sort(),
    );
  });

  it("every lead has all required fields populated", () => {
    for (const c of FEATURED_CHARACTERS) {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.power.length).toBeGreaterThan(0);
      expect(c.hook.length).toBeGreaterThan(0);
      expect(c.imageUrl.startsWith("/ai-roleplay/characters/")).toBe(true);
      expect(c.chatUrl.startsWith("https://ourdream.ai/chat/")).toBe(true);
      expect(c.gate.headline.length).toBeGreaterThan(0);
      expect(c.gate.sub.length).toBeGreaterThan(0);
      expect(c.gate.button.length).toBeGreaterThan(0);
    }
  });

  it("slugs are unique", () => {
    const set = new Set(FEATURED_CHARACTERS.map((c) => c.slug));
    expect(set.size).toBe(FEATURED_CHARACTERS.length);
  });

  it("getCharacter returns the lead by slug and undefined otherwise", () => {
    expect(getCharacter("aric-venn")?.name).toBe("Dr. Aric Venn");
    expect(getCharacter("nope")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ai-roleplay && npx vitest run src/data/characters.test.ts`
Expected: FAIL (old `characters.ts` has no `getCharacter`, and its `Character` shape lacks `power`/`hook`/`gate`).

- [ ] **Step 3: Write the new data file**

Replace the ENTIRE contents of `ai-roleplay/src/data/characters.ts` with:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd ai-roleplay && npx vitest run src/data/characters.test.ts`
Expected: PASS (4 tests).

Note: `npx tsc --noEmit` across the whole project will still fail here because pages/components still reference the old `Character` shape — that is expected and restored to green in Task 5.

- [ ] **Step 5: Commit**

```bash
cd ai-roleplay && git add src/data/characters.ts src/data/characters.test.ts
git commit -m "feat(experience): replace catalogue data with 5 signature leads"
```

---

### Task 2: Author the 5 CYOA story trees + registry

**Files:**
- Create: `ai-roleplay/src/data/chat-previews/aric-venn.ts`
- Create: `ai-roleplay/src/data/chat-previews/lucen-aldair.ts`
- Create: `ai-roleplay/src/data/chat-previews/marlowe-vesper.ts`
- Create: `ai-roleplay/src/data/chat-previews/vaughn-crowe.ts`
- Create: `ai-roleplay/src/data/chat-previews/rook-callahan.ts`
- Modify (full rewrite): `ai-roleplay/src/data/chat-previews/index.ts`
- Create: `ai-roleplay/src/data/chat-previews/story-structure.test.ts`
- Delete: all old preview files + old fixtures (see Step 6)

**Interfaces:**
- Consumes: `ChatPreview`, `ChatPreviewChoice` types + `assertPreviewValid` from `./types` (unchanged); `FEATURED_CHARACTERS` from Task 1.
- Produces: `getChatPreview(slug: string): ChatPreview | null` (same signature as today), backed by the 5 new trees.

**Tree shape (identical for all 5):** 7 nodes. `intro` = opening narration. `b1` (root) = Beat 1 line with 3 Choice-1 options → `r1a/r1b/r1c`. Each `r1*` folds *his Choice-1 answer* + *Beat 2 power reveal* into one bubble and offers the SAME three Choice-2 targets `r2a/r2b/r2c` (reconvergence). Each `r2*` folds *his Choice-2 answer* + *Beat 3 cliffhanger* and is terminal (`endLine`). Stage direction uses `*single asterisks*`.

- [ ] **Step 1: Write `aric-venn.ts`**

Create `ai-roleplay/src/data/chat-previews/aric-venn.ts`:

```ts
import type { ChatPreview, ChatPreviewChoice } from "./types";

const CHOICE2: ChatPreviewChoice[] = [
  { label: "You didn't freeze me.", next: "r2a" },
  { label: "Then don't touch the world. Touch this. [offer your hand]", next: "r2b" },
  { label: "Show me.", next: "r2c" },
];

const REVEAL =
  `*He finally turns. Snow melts before it touches him — a slow, deliberate warmth he keeps only for you.* "I freeze everything I touch. People. Rooms. I learned to; it's easier that way."`;

const CLIFF =
  `*The ice-bloom hovers, perfect, and for the first time his composure cracks.* "There's something I should have told you years ago. Before I lose my nerve—" *He steps closer. The city holds its breath.*`;

const preview: ChatPreview = {
  characterSlug: "aric-venn",
  intro:
    "You find him where you always do after a brutal shift — the roof, alone, the city humming below. The first snow just started.",
  rootId: "b1",
  nodes: {
    b1: {
      text: `"You should be inside. You're shaking."`,
      choices: [
        { label: "So are you.", next: "r1a" },
        { label: "I wanted to see you.", next: "r1b" },
        { label: "[Say nothing. Step in beside him.]", next: "r1c" },
      ],
    },
    r1a: {
      text: `"I don't feel the cold." *A breath — and frost feathers across the railing beneath his hand.* "Occupational hazard."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1b: {
      text: `*A pause. He doesn't look at you — but the line of his shoulders eases.* "…Then you're not as smart as your charts suggest."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1c: {
      text: `"No arguments tonight? Good." *The corner of his mouth almost moves.* "Stay. Just for a minute."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r2a: {
      text: `"No." *Barely a whisper.* "That's the part that frightens me."\n\n${CLIFF}`,
      endLine: true,
    },
    r2b: {
      text: `*He stares at your hand like a scalpel he doesn't trust himself with. Then, carefully, he takes it — and it's warm.*\n\n${CLIFF}`,
      endLine: true,
    },
    r2c: {
      text: `*He lifts a hand; an intricate bloom of ice unfurls in the air between you, delicate as lace.* "…I've never shown anyone."\n\n${CLIFF}`,
      endLine: true,
    },
  },
};

export default preview;
```

- [ ] **Step 2: Write `lucen-aldair.ts`**

Create `ai-roleplay/src/data/chat-previews/lucen-aldair.ts`:

```ts
import type { ChatPreview, ChatPreviewChoice } from "./types";

const CHOICE2: ChatPreviewChoice[] = [
  { label: "What are you, really?", next: "r2a" },
  { label: "I'm not afraid of you.", next: "r2b" },
  { label: "[Reach up and pull his hood down.]", next: "r2c" },
];

const REVEAL =
  `*He sits up, sleepiness gone, something older behind his eyes.* "I let people think I'm harmless. It's safer. But when it's you standing in front of the thing that could hurt you—" *light gathers at his fingertips* "—I stop pretending."`;

const CLIFF =
  `*The stretched second begins to slip.* "Before the morning catches up with us, there's a truth I've been holding in every version of this moment—"`;

const preview: ChatPreview = {
  characterSlug: "lucen-aldair",
  intro:
    "Dawn. He's exactly where he shouldn't be — half-asleep on the ledge, hood up, like the most dangerous man in the city has nothing to guard but a nap.",
  rootId: "b1",
  nodes: {
    b1: {
      text: `*One eye opens.* "You're up early." *A slow smile.* "Or I slowed the morning down. Hard to say."`,
      choices: [
        { label: "Show-off.", next: "r1a" },
        { label: "You could sleep anywhere. Why here?", next: "r1b" },
        { label: "Slow it down again.", next: "r1c" },
      ],
    },
    r1a: {
      text: `"Mm. For you? Always." *He lifts a finger; the falling light bends, and a soft after-image of your own smile drifts in the air, then fades.*\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1b: {
      text: `"…Because you walk this way at dawn." *Said like it's obvious — though his ears go faintly pink.*\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1c: {
      text: `"Greedy." *But he does — and the sunrise stutters, holds, a single gold second stretched just for the two of you.*\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r2a: {
      text: `"Something that's been finding its way back to you far longer than you'd believe."\n\n${CLIFF}`,
      endLine: true,
    },
    r2b: {
      text: `"I know." *Quiet.* "That's the part I can't get over."\n\n${CLIFF}`,
      endLine: true,
    },
    r2c: {
      text: `*He lets you. Fully awake now, fully seen.* "…No one does that. Only you."\n\n${CLIFF}`,
      endLine: true,
    },
  },
};

export default preview;
```

- [ ] **Step 3: Write `marlowe-vesper.ts`**

Create `ai-roleplay/src/data/chat-previews/marlowe-vesper.ts`:

```ts
import type { ChatPreview, ChatPreviewChoice } from "./types";

const CHOICE2: ChatPreviewChoice[] = [
  { label: "Then don't let it take you.", next: "r2a" },
  { label: "Paint me for real, then.", next: "r2b" },
  { label: "[Touch the floating water.]", next: "r2c" },
];

const REVEAL =
  `*He crosses to you, plum hair damp, mismatched eyes bright.* "I'm not from here. Something drowned a long time ago and washed up wearing my face. The sea wants it back." *Water beads off his palm, rising, not falling.* "It's patient. I'm not."`;

const CLIFF =
  `*Thunder. The tide surges up the beach toward the studio door.* "There's something I have to tell you before the water does—"`;

const preview: ChatPreview = {
  characterSlug: "marlowe-vesper",
  intro:
    "His studio smells of salt and turpentine. Every canvas is the sea — and, you realize slowly, every canvas is also you.",
  rootId: "b1",
  nodes: {
    b1: {
      text: `"Don't move." *Brush frozen mid-air.* "I finally get the light right and you walk in and ruin it by being better than the painting."`,
      choices: [
        { label: "You painted me. We've never met.", next: "r1a" },
        { label: "It's beautiful.", next: "r1b" },
        { label: "Why is it storming?", next: "r1c" },
      ],
    },
    r1a: {
      text: `"Haven't we?" *A crooked, haunted grin. Outside, the tide draws back from the shore as if leaning in to listen.*\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1b: {
      text: `"It's unfinished." *He sets the brush down.* "Like everything I care about. …Sit with me anyway."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1c: {
      text: `"Because I'm—" *he catches himself as rain lashes the glass* "—in a mood. The sea and I have that problem."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r2a: {
      text: `*The rising water stills.* "Say that again like you mean it and I might believe it's possible."\n\n${CLIFF}`,
      endLine: true,
    },
    r2b: {
      text: `"…If I do, you're mine. That's how it works with me." *He's only half joking.*\n\n${CLIFF}`,
      endLine: true,
    },
    r2c: {
      text: `*It wraps your fingers, warm as a summer sea.* "It likes you," *he breathes.* "So do I. That's the dangerous part."\n\n${CLIFF}`,
      endLine: true,
    },
  },
};

export default preview;
```

- [ ] **Step 4: Write `vaughn-crowe.ts`**

Create `ai-roleplay/src/data/chat-previews/vaughn-crowe.ts`:

```ts
import type { ChatPreview, ChatPreviewChoice } from "./types";

const CHOICE2: ChatPreviewChoice[] = [
  { label: "Then treat me like an equal.", next: "r2a" },
  { label: "Make me kneel, then.", next: "r2b" },
  { label: "[Step into his space.]", next: "r2c" },
];

const REVEAL =
  `*He crosses the room; the air thickens, the whole world leaning toward him.* "Everyone here bends. Gravity's my native tongue — one word and grown men kneel." *He stops close.* "You? You I want standing."`;

const CLIFF =
  `*One raven caws. His jaw tightens.* "There's a reason I let you this close — and a reason it could get you killed. You should hear it from me—"`;

const preview: ChatPreview = {
  characterSlug: "vaughn-crowe",
  intro:
    "The most feared man in the quarter runs it from up here — and right now, every ounce of that attention is on you.",
  rootId: "b1",
  nodes: {
    b1: {
      text: `"You walked into my city, into my home, alone." *He swirls a glass, unhurried.* "Brave. Or you wanted to be caught."`,
      choices: [
        { label: "Maybe I wanted to catch you.", next: "r1a" },
        { label: "You don't scare me.", next: "r1b" },
        { label: "[Hold his gaze. Say nothing.]", next: "r1c" },
      ],
    },
    r1a: {
      text: `*A low laugh you feel in your chest.* "Careful. Talk like that and I keep you." *The ravens shift.*\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1b: {
      text: `"No?" *He tilts his head; the glass lifts off his palm and hangs in the air, held by nothing.* "Give it a moment."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1c: {
      text: `"…Silence. I like that far more than I should." *He sets the glass down without touching it.*\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r2a: {
      text: `"An equal." *He says it like a rare wine.* "Dangerous idea. I'm listening."\n\n${CLIFF}`,
      endLine: true,
    },
    r2b: {
      text: `*The pressure gathers — then releases, gentle.* "No. Anyone can force a bow. I want yours freely, or not at all."\n\n${CLIFF}`,
      endLine: true,
    },
    r2c: {
      text: `*For a heartbeat the crushing weight of the room vanishes; around you two, it's weightless.* "That," *he murmurs,* "I've never done for anyone."\n\n${CLIFF}`,
      endLine: true,
    },
  },
};

export default preview;
```

- [ ] **Step 5: Write `rook-callahan.ts`**

Create `ai-roleplay/src/data/chat-previews/rook-callahan.ts`:

```ts
import type { ChatPreview, ChatPreviewChoice } from "./types";

const CHOICE2: ChatPreviewChoice[] = [
  { label: "You're still you to me.", next: "r2a" },
  { label: "How long?", next: "r2b" },
  { label: "[Cover his burning hand with yours.]", next: "r2c" },
];

const REVEAL =
  `*He holds up a hand; a small sun ignites above his palm, golden and searing, lighting his face from below.* "This is what I've been keeping from you. It's getting harder to hold in. And it's changing me."`;

const CLIFF =
  `*The sky darkens too fast; something's coming. His voice drops, all playfulness gone.* "If I don't say this now, I might not get another chance—"`;

const preview: ChatPreview = {
  characterSlug: "rook-callahan",
  intro:
    "You've known that grin your whole life. Tonight, in the dying light, it's hiding something.",
  rootId: "b1",
  nodes: {
    b1: {
      text: `"Hey, trouble." *He wipes his hands, easy as ever.* "Bet you my whole flight pay you couldn't stay away."`,
      choices: [
        { label: "Never could.", next: "r1a" },
        { label: "What are you hiding, Rook?", next: "r1b" },
        { label: "You look tired.", next: "r1c" },
      ],
    },
    r1a: {
      text: `"Yeah." *His smile softens into something that isn't a joke.* "Me neither. That's kind of the problem."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1b: {
      text: `*The grin flickers. Heat-haze shimmers off his shoulders, gold and wrong.* "…You always could read me."\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r1c: {
      text: `"Been flying a long time. Longer than you know." *He glances at the sky like it owes him something.*\n\n${REVEAL}`,
      choices: CHOICE2,
    },
    r2a: {
      text: `*The little sun trembles.* "Say that again when you've seen what I can do. …Please still mean it."\n\n${CLIFF}`,
      endLine: true,
    },
    r2b: {
      text: `"Since we were kids. I hid it so I could stay close to you. Turns out that was the only thing keeping me human."\n\n${CLIFF}`,
      endLine: true,
    },
    r2c: {
      text: `*The flame doesn't hurt you — it gentles. His breath catches.* "It's never done that. Only for you."\n\n${CLIFF}`,
      endLine: true,
    },
  },
};

export default preview;
```

- [ ] **Step 6: Delete the old previews + fixtures**

```bash
cd ai-roleplay/src/data/chat-previews
rm -f dragon-rider-bonded-throne.ts courts-of-starlight.ts iron-commander.ts \
  ironveil-emperor.ts storm-rider.ts centurion.ts crimson-covenant.ts \
  quilana-vaelrith.ts royal-pains.ts adrian-wolfe.ts maeve-anon.ts \
  dawson-monroe.ts chat-previews.test.ts
cd -
```

- [ ] **Step 7: Rewrite the registry**

Replace the ENTIRE contents of `ai-roleplay/src/data/chat-previews/index.ts` with:

```ts
/**
 * Chat preview registry — the 5 /experience story trees.
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
```

- [ ] **Step 8: Write the structure test**

Create `ai-roleplay/src/data/chat-previews/story-structure.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { _allPreviews, getChatPreview } from "./index";
import { assertPreviewValid } from "./types";
import { FEATURED_CHARACTERS } from "../characters";

describe("story trees", () => {
  it("registers exactly one preview per lead", () => {
    expect(_allPreviews.map((p) => p.characterSlug).sort()).toEqual(
      FEATURED_CHARACTERS.map((c) => c.slug).sort(),
    );
  });

  for (const p of _allPreviews) {
    describe(p.characterSlug, () => {
      it("passes referential validation", () => {
        expect(() => assertPreviewValid(p)).not.toThrow();
      });

      it("has the 7-node beat structure", () => {
        expect(Object.keys(p.nodes).sort()).toEqual(
          ["b1", "r1a", "r1b", "r1c", "r2a", "r2b", "r2c"].sort(),
        );
        expect(p.rootId).toBe("b1");
        expect(p.nodes.b1.choices).toHaveLength(3);
      });

      it("Choice 2 reconverges (all r1 nodes share the same targets)", () => {
        const targets = (id: string) =>
          (p.nodes[id].choices ?? []).map((c) => c.next).sort();
        expect(targets("r1a")).toEqual(["r2a", "r2b", "r2c"]);
        expect(targets("r1b")).toEqual(["r2a", "r2b", "r2c"]);
        expect(targets("r1c")).toEqual(["r2a", "r2b", "r2c"]);
      });

      it("terminal nodes end the story", () => {
        for (const id of ["r2a", "r2b", "r2c"]) {
          expect(p.nodes[id].endLine).toBe(true);
          expect(p.nodes[id].choices).toBeUndefined();
        }
      });
    });
  }

  it("getChatPreview resolves a known slug and rejects unknown", () => {
    expect(getChatPreview("aric-venn")?.characterSlug).toBe("aric-venn");
    expect(getChatPreview("nope")).toBeNull();
  });
});
```

- [ ] **Step 9: Run the tests to verify they pass**

Run: `cd ai-roleplay && npx vitest run src/data/chat-previews/story-structure.test.ts src/data/characters.test.ts`
Expected: PASS (all story-structure + character tests green; `assertPreviewValid` did not throw for any tree).

- [ ] **Step 10: Commit**

```bash
cd ai-roleplay && git add src/data/chat-previews/
git commit -m "feat(experience): author 5 CYOA story trees + registry"
```

---

### Task 3: Funnel — generate_lead conversion + per-character gate copy

**Files:**
- Modify: `ai-roleplay/src/lib/funnel-client.ts`
- Modify: `ai-roleplay/src/components/EmailGate.tsx`
- Create: `ai-roleplay/src/lib/funnel-client.test.ts`

**Interfaces:**
- Consumes: `GateCopy` from `@/data/characters` (Task 1); `buildRedirectUrl` + `mergePersistedWithUrl` (unchanged).
- Produces:
  - `buildLeadEvent(email: string): { event: "generate_lead"; currency: "USD"; value: number; user_data: { email: string } }` (exported from `funnel-client.ts`, pure, unit-tested)
  - `captureAndRedirect(email: string, chatSlug: string): Promise<void>` (unchanged signature; now pushes `generate_lead`)
  - `EmailGate`'s `openGate(chatSlug: string, name: string, gate: GateCopy): void` (new 3rd arg)

- [ ] **Step 1: Write the failing test**

Create `ai-roleplay/src/lib/funnel-client.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildLeadEvent } from "./funnel-client";

describe("buildLeadEvent", () => {
  it("builds the Google Ads generate_lead payload", () => {
    expect(buildLeadEvent("a@b.com")).toEqual({
      event: "generate_lead",
      currency: "USD",
      value: 1.0,
      user_data: { email: "a@b.com" },
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ai-roleplay && npx vitest run src/lib/funnel-client.test.ts`
Expected: FAIL ("buildLeadEvent" is not exported).

- [ ] **Step 3: Edit `funnel-client.ts`**

In `ai-roleplay/src/lib/funnel-client.ts`, add this exported helper just above the `saveEmail` function:

```ts
/** The Google Ads conversion payload. Fired on valid email submit. */
export function buildLeadEvent(email: string) {
  return {
    event: "generate_lead" as const,
    currency: "USD" as const,
    value: 1.0,
    user_data: { email },
  };
}
```

Then change the `saveEmail` body's `mode` from `"ai-roleplay"` to `"experience"`:

```ts
    body: JSON.stringify({ email, mode: "experience", marketingConsent: false }),
```

Then replace the body of `captureAndRedirect` so the FIRST thing it does is push the conversion, and drop the two un-wired events. The function becomes:

```ts
export async function captureAndRedirect(email: string, chatSlug: string): Promise<void> {
  // generate_lead is the primary Google Ads conversion — must fire on valid
  // submit BEFORE the redirect (see CLAUDE.md). It is the only GTM-wired event
  // in this funnel.
  track("generate_lead", buildLeadEvent(email));
  saveEmail(email).catch((e) => console.warn("[save-email] failed:", e));

  const clickid = readClickid();
  const inbound = mergePersistedWithUrl(new URLSearchParams(window.location.search));
  const gl = await getGlValue();
  const url = buildRedirectUrl({ chatSlug, clickid, gl, inbound });

  window.location.href = url;
}
```

Note: `track(event, params)` spreads `params` after `event`, so passing the full `buildLeadEvent(email)` object (which itself contains `event`) is fine — the spread's `event` key equals the first arg. Keep it as written above.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd ai-roleplay && npx vitest run src/lib/funnel-client.test.ts`
Expected: PASS.

- [ ] **Step 5: Thread per-character gate copy through EmailGate**

Edit `ai-roleplay/src/components/EmailGate.tsx`:

1. Add the import at the top:

```ts
import type { GateCopy } from "@/data/characters";
```

2. Extend `GateTarget` and the context signature:

```ts
interface GateTarget {
  chatSlug: string;
  name: string;
  gate: GateCopy;
}

interface GateCtx {
  openGate: (chatSlug: string, name: string, gate: GateCopy) => void;
}
```

3. Update `openGate` in the provider:

```ts
  const openGate = useCallback((chatSlug: string, name: string, gate: GateCopy) => {
    setError(false);
    setTarget({ chatSlug, name, gate });
  }, []);
```

4. In the modal JSX, replace the static headline/subcopy/button with the per-character copy. Replace the `<h2>` + `<p>` block:

```tsx
            <h2 id="gate-title" className="mb-1.5 text-center text-[22px] font-bold">
              {target.gate.headline}
            </h2>
            <p className="mb-5 text-center text-sm text-white/60">
              {target.gate.sub}
            </p>
```

And replace the submit button's label:

```tsx
              <button
                type="submit" disabled={submitting}
                className="btn-primary mt-3.5 w-full justify-center text-sm disabled:opacity-70"
              >
                {submitting ? "Submitting…" : target.gate.button}
              </button>
```

- [ ] **Step 6: Commit**

```bash
cd ai-roleplay && git add src/lib/funnel-client.ts src/lib/funnel-client.test.ts src/components/EmailGate.tsx
git commit -m "feat(experience): fire generate_lead + per-character gate copy"
```

Note: `tsc` across the project is still red until Task 5 (ChatPreview still calls `openGate` with 2 args). Expected.

---

### Task 4: Story UI — ChatPreview gate-copy + rebrand + theme

**Files:**
- Modify: `ai-roleplay/src/components/ChatPreview.tsx`

**Interfaces:**
- Consumes: `Character`/`GateCopy` (Task 1), `useEmailGate().openGate` 3-arg form (Task 3).
- Produces: `ChatPreview` component now requires a `gate: GateCopy` prop and passes it to `openGate`.

- [ ] **Step 1: Add the `gate` prop and pass it to openGate**

In `ai-roleplay/src/components/ChatPreview.tsx`:

1. Add to the `Props` interface:

```ts
  /** Per-character email-gate copy, shown when the terminal CTA opens the modal. */
  gate: import("@/data/characters").GateCopy;
```

2. Destructure it in the component signature: add `gate` to the `{ preview, characterName, characterImageUrl, ourdreamChatPath }` params → `{ preview, characterName, characterImageUrl, ourdreamChatPath, gate }`.

3. Update the terminal CTA `onClick`:

```tsx
            onClick={() => openGate(chatSlug, characterName, gate)}
```

- [ ] **Step 2: Rebrand + retheme the story card**

In the same file, make the copy story-appropriate and align to the dark-pink brand (replace romantasy gold tokens on THIS component only):

1. Header heading text: change `A 60-second taste of {characterName}` to:

```tsx
          Play the opening scene with {characterName}
```

2. Heading class: change `text-gold-400` to `text-[#F17BB6]`.

3. Terminal CTA intro paragraph: change its text to:

```tsx
            The scene doesn't have to end here. Continue it — your choices,
            your pace.
```

4. Terminal CTA button label: change `Continue this story&nbsp;&rarr;` to:

```tsx
            Continue with {characterName}&nbsp;&rarr;
```

Leave the bubble/choice mechanics and the `renderInline` helper unchanged.

- [ ] **Step 3: Commit**

```bash
cd ai-roleplay && git add src/components/ChatPreview.tsx
git commit -m "feat(experience): story-brand ChatPreview + wire gate copy"
```

Note: `tsc` still red until Task 5 (the `[slug]` page hasn't passed `gate` yet, and old pages/components remain). Expected.

---

### Task 5: Pages + shell rewrite + teardown (restore full green)

This task rewrites the landing and character pages, rebrands the shell, deletes catalogue-only surfaces, and restores `tsc` + `lint` + `build` + tests to green. Do the deletions AFTER verifying nothing else references them (Step 1).

**Files:**
- Modify (full rewrite): `ai-roleplay/src/app/page.tsx`
- Modify (full rewrite): `ai-roleplay/src/app/[slug]/page.tsx`
- Modify (full rewrite): `ai-roleplay/src/components/CharacterCard.tsx`
- Modify: `ai-roleplay/src/lib/metadata.ts`, `ai-roleplay/src/app/layout.tsx`, `ai-roleplay/src/components/SiteHeader.tsx`, `ai-roleplay/src/components/SiteFooter.tsx`
- Delete: `ai-roleplay/src/app/tag/[tag]/page.tsx` (+ empty `tag/` dirs), `ai-roleplay/src/lib/tags.ts`, `ai-roleplay/src/lib/tags.test.ts`, `ai-roleplay/src/lib/match.ts`, `ai-roleplay/src/lib/match.test.ts`, `ai-roleplay/src/components/ChatPreviewSeoSurface.tsx`, `ai-roleplay/src/components/CharacterCardCompact.tsx`, `ai-roleplay/src/components/ChatNowButton.tsx`, `ai-roleplay/src/components/FaqBlock.tsx`

- [ ] **Step 1: Confirm delete targets are unreferenced by code we keep**

Run from `ai-roleplay/`:

```bash
cd ai-roleplay && for sym in tags match ChatPreviewSeoSurface CharacterCardCompact ChatNowButton FaqBlock buildChatPreviewJsonLd getTagMeta ACTIVE_TAGS; do
  echo "== $sym =="; grep -rn "$sym" src --include=*.ts --include=*.tsx | grep -v -E "src/(lib/(tags|match)\.|components/(ChatPreviewSeoSurface|CharacterCardCompact|ChatNowButton|FaqBlock))"; done
```

Expected after Steps 2–4 rewrites: only matches inside the files being deleted (or none). Any match in a file we KEEP means that reference must be removed first. (The rewrites in Steps 2–4 remove all such references; run this again after Step 4 to confirm clean.)

- [ ] **Step 2: Rewrite the landing page (character picker)**

Replace the ENTIRE contents of `ai-roleplay/src/app/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { CharacterCard } from "@/components/CharacterCard";
import { FEATURED_CHARACTERS } from "@/data/characters";

export const metadata: Metadata = {
  title: "Pick Your Story",
  description:
    "Five originals, one choice. Pick a character and play the opening scene — your choices, your pace.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="page-section space-y-10">
      <header className="mx-auto max-w-2xl text-center space-y-4">
        <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
          Who do you want to meet tonight?
        </h1>
        <p className="text-lg leading-relaxed text-white/60">
          Five originals, each with a secret. Pick one and play the opening
          scene — every choice is yours.
        </p>
      </header>

      <section
        aria-label="Choose a character"
        className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURED_CHARACTERS.map((c) => (
          <CharacterCard key={c.slug} character={c} />
        ))}
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Rewrite the picker card**

Replace the ENTIRE contents of `ai-roleplay/src/components/CharacterCard.tsx` with:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/data/characters";

/** Picker card: portrait + name + power badge + hook, links to the story. */
export function CharacterCard({ character }: { character: Character }) {
  return (
    <Link
      href={`/${character.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-night-800/60 transition-colors hover:border-[#F17BB6]/40"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-night-800">
        <Image
          src={character.imageUrl}
          alt={character.name}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-0.5 text-[11px] font-medium text-white/80 backdrop-blur">
          {character.power}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="text-lg font-semibold text-white">{character.name}</h2>
        <p className="flex-1 text-sm leading-relaxed text-white/55">
          {character.hook}
        </p>
        <span className="mt-1 text-sm font-semibold text-[#F17BB6] group-hover:underline">
          Begin the scene &rarr;
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Rewrite the character page**

Replace the ENTIRE contents of `ai-roleplay/src/app/[slug]/page.tsx` with:

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatPreview } from "@/components/ChatPreview";
import { getChatPreview } from "@/data/chat-previews";
import { FEATURED_CHARACTERS, getCharacter } from "@/data/characters";

export function generateStaticParams() {
  return FEATURED_CHARACTERS.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const c = getCharacter(params.slug);
  if (!c) return {};
  const title = c.name;
  const desc = `Play the opening scene with ${c.name} — ${c.hook}`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/${c.slug}` },
    openGraph: {
      title,
      description: desc,
      images: [{ url: c.imageUrl, width: 512, height: 683, alt: c.name }],
    },
  };
}

export default function CharacterPage({
  params,
}: {
  params: { slug: string };
}) {
  const character = getCharacter(params.slug);
  if (!character) notFound();

  const preview = getChatPreview(character.slug);
  const ourdreamChatPath = new URL(character.chatUrl).pathname;

  return (
    <div className="page-section space-y-12">
      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <nav className="text-xs text-white/40">
        <Link href="/" className="hover:text-[#F17BB6]">
          Characters
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-white/70">{character.name}</span>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-[2fr_3fr]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-night-800">
          <Image
            src={character.imageUrl}
            alt={character.name}
            width={512}
            height={683}
            sizes="(min-width: 768px) 40vw, 100vw"
            priority
            className="aspect-[3/4] w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center space-y-4">
          <span className="w-fit rounded-full border border-white/15 bg-night-800/60 px-3 py-1 text-xs text-white/70">
            {character.power}
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-5xl">
            {character.name}
          </h1>
          <p className="text-lg leading-relaxed text-white/70">
            {character.hook}
          </p>
          {preview && (
            <a href="#story" className="btn-primary w-fit">
              Play the opening scene&nbsp;&darr;
            </a>
          )}
        </div>
      </div>

      {/* ── Interactive story ─────────────────────────────────── */}
      {preview && (
        <div id="story" className="mx-auto max-w-2xl scroll-mt-24">
          <ChatPreview
            preview={preview}
            characterName={character.name}
            characterImageUrl={character.imageUrl}
            ourdreamChatPath={ourdreamChatPath}
            gate={character.gate}
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Delete the catalogue-only surfaces**

```bash
cd ai-roleplay
rm -f src/app/tag/[tag]/page.tsx
rmdir src/app/tag/[tag] src/app/tag 2>/dev/null || true
rm -f src/lib/tags.ts src/lib/tags.test.ts src/lib/match.ts src/lib/match.test.ts
rm -f src/components/ChatPreviewSeoSurface.tsx src/components/CharacterCardCompact.tsx \
  src/components/ChatNowButton.tsx src/components/FaqBlock.tsx
cd -
```

- [ ] **Step 6: Rebrand the shell copy**

1. `ai-roleplay/src/lib/metadata.ts` — update the title/description defaults:

```ts
  title: {
    default: "Pick Your Story | OurDream Network",
    template: "%s | OurDream Network",
  },
  description:
    "Five original characters, one choice. Play the opening scene, then continue the story on ourdream.",
```

Also update `OG_IMAGE.alt`:

```ts
  alt: "OurDream Network — Pick Your Story",
```

2. `ai-roleplay/src/components/SiteHeader.tsx` — leave the logo + "chatting now" pill as-is (still on-brand). No change required unless the "248,123 chatting now" copy should change (keep it).

3. `ai-roleplay/src/components/SiteFooter.tsx` — open the file; if it contains catalogue-specific link lists (e.g. `/books`, tag links, "browse characters"), replace those with just the Terms + Privacy links (`https://ourdreamnetwork.com/terms`, `https://ourdreamnetwork.com/privacy`) and a short SFW disclaimer line. Keep the existing structure/styling; only prune dead catalogue links.

4. `ai-roleplay/src/app/layout.tsx` — no functional change (GTM/uniclick/TrackingCapture/EmailGateProvider stay). Only verify it still compiles after the header/footer edits.

- [ ] **Step 7: Add placeholder portrait images**

The pages use `next/image` with local paths under `public/characters/`. Add 5 placeholder files so dev/build don't 404 (the user swaps in real art later). If any existing `public/characters/*.jpg` remain from the old catalogue, copy one; otherwise create solid-color placeholders:

```bash
cd ai-roleplay/public/characters 2>/dev/null || mkdir -p ai-roleplay/public/characters && cd ai-roleplay/public/characters
# Reuse any existing image as a stand-in, else document the gap.
SRC=$(ls *.jpg *.webp *.png 2>/dev/null | head -1)
for slug in aric-venn lucen-aldair marlowe-vesper vaughn-crowe rook-callahan; do
  if [ -n "$SRC" ] && [ ! -f "$slug.webp" ]; then cp "$SRC" "$slug.webp"; fi
done
ls -1 *.webp 2>/dev/null
cd -
```

If no source image exists, note in the commit that `public/characters/<slug>.webp` (5 files) are still required from the user, and proceed — `next build` succeeds with string `src` even if the file is absent (the image simply 404s at runtime until supplied).

- [ ] **Step 8: Verify the whole zone is green**

Run each from `ai-roleplay/` and confirm the expected result:

```bash
cd ai-roleplay
npx tsc --noEmit          # Expected: no errors
npm run lint              # Expected: no errors (warnings ok)
npx vitest run            # Expected: all tests pass
npm run build             # Expected: build succeeds; /  and /[slug] render
```

If `tsc` reports a reference to any deleted file, re-run Step 1's grep, remove the stray reference, and re-run. Do not proceed until all four commands are green.

- [ ] **Step 9: Commit**

```bash
cd ai-roleplay && git add -A
git commit -m "feat(experience): picker landing, story page, shell rebrand, teardown"
```

---

### Task 6: End-to-end funnel smoke test

Unit tests can't cover the browser redirect. Verify the real flow before declaring done.

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `cd ai-roleplay && npm run dev`
Open `http://localhost:3000/ai-roleplay`.

- [ ] **Step 2: Verify the picker + story render**

Expected: landing shows 5 character cards. Click one → character hero + "Play the opening scene" → story card with the Beat 1 line and 3 choices. Click through Choice 1 → the response+reveal bubble appears with Choice 2 → click a Choice 2 → the response+cliffhanger bubble appears, followed by the "Continue with {name} →" CTA.

- [ ] **Step 3: Verify the gate + conversion + redirect**

In DevTools console, before clicking the terminal CTA, run:

```js
window.dataLayer = window.dataLayer || [];
const seen = [];
const orig = window.dataLayer.push.bind(window.dataLayer);
window.dataLayer.push = (...a) => { seen.push(...a); return orig(...a); };
window.__seen = seen;
```

Click the terminal CTA → the modal shows the per-character `gate.headline` / `gate.sub` / `gate.button`. Enter `test@example.com`, submit. Immediately (before navigation) check `window.__seen` — expected to contain an object `{ event: "generate_lead", currency: "USD", value: 1.0, user_data: { email: "test@example.com" } }`.

Expected redirect: the browser navigates to a `https://clk.ourdreamnetwork.com/...` URL whose query contains `sub11=ai-roleplay` and `sub17=<slug>-PLACEHOLDER` (and `sub19=<_gl>` if GTM decorated one). Note the placeholder slug is expected until the user supplies real ids.

- [ ] **Step 4: Confirm invalid email is blocked**

Reload, reach the gate, submit an empty/invalid email → inline error shows, no `generate_lead` pushed, no navigation.

- [ ] **Step 5: Stop the dev server**

Stop `npm run dev` (Ctrl-C).

---

## Post-implementation handoff to the user

Two things remain user-supplied (documented in the spec's "Open items"):
1. Replace the 5 placeholder portraits in `ai-roleplay/public/characters/<slug>.webp`.
2. Replace each `chatUrl` placeholder in `src/data/characters.ts` with the real ourdream chat slug so `sub17` is correct.
