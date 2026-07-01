# /experience — Interactive Story Funnel (design)

Date: 2026-07-01
Status: Approved (brainstorming)

## Summary

Repurpose the existing `/ai-roleplay` Next.js zone into a 5-character
interactive-story ("signature leads") funnel. The zone keeps its URL
(`ourdreamnetwork.com/ai-roleplay`), tech stack (Next.js 14 App Router,
`basePath: /ai-roleplay`, Tailwind), and RedTrack/email funnel wiring. Its
content is fully replaced: the 60+ book-character catalogue, `/books`, tag
pages, and catalogue SEO scaffolding are removed and replaced with a
character-select landing → per-character branching story → email gate →
RedTrack redirect to ourdream.ai.

Source material: `ourdream_story_demo_scripts.docx` — 5 legally-distinct,
LADS-inspired, anime-style, female-POV leads. The email gate is the primary
Google Ads conversion.

## Decisions (locked)

- **Host:** repurpose the existing `/ai-roleplay` zone in place (same Vercel
  project, same multi-zone rewrite). No `vercel.json`/`basePath` changes.
- **URL:** stays `/ai-roleplay` (not renamed to `/experience`). "Experience"
  is a content/brand concept only.
- **Presentation:** compact chat-bubble — reuse the existing `ChatPreview`
  engine and card styling (not full-bleed cinematic).
- **Art:** one portrait per character (5 total), user-provided. Reused across
  all beats and the picker card.
- **Scope:** full replace — remove the catalogue, `/books`, tag pages, and
  catalogue-specific SEO surfaces.
- **Redirect target:** through `clk.ourdreamnetwork.com` (RedTrack), reusing
  the existing ai-roleplay campaign + `sub11=ai-roleplay`. Per-character chat
  slugs (`sub17`) are placeholders the user will specify.
- **Choices token:** not passed. Redirect carries the character only (no
  Choice-1/Choice-2 personalization token, no scene param).

## The 5 leads

Original characters; the source game's / its characters' names are never used
in product copy, ad copy, or metadata. All male, anime style, female-POV.

| Slug | Name | Power | Scene tag (metadata only) |
|---|---|---|---|
| `aric-venn` | Dr. Aric Venn | Frost / cryokinesis | otome |
| `lucen-aldair` | Lucen Aldair | Light-bending / time-slip | otome |
| `marlowe-vesper` | Marlowe Vesper | Tide-calling / water | fantasy |
| `vaughn-crowe` | Vaughn Crowe | Gravity-warping | fandom |
| `rook-callahan` | Rook Callahan | Solar-flare / plasma (childhood friend) | fandom |

Rules from the scripts: every beat stays SFW (tension sells the click; heat
lives past the gate). Rook is a childhood **friend**, never a sibling.

## Story engine — reuse existing CYOA dialogue tree

Each script maps onto the existing flat, reconverging node graph
(`data/chat-previews/types.ts`) with **no engine changes**. The demo flow
(opening → Beat 1 → Choice 1 → Beat 2 power reveal → Choice 2 → Beat 3
cliffhanger → gate) becomes a 7-node graph:

- `intro` (ChatPreview.intro): opening-scene narration.
- `b1` (rootId): Beat 1 spoken line. `choices` = Choice 1 (A/B/C).
- `r1a` / `r1b` / `r1c`: each folds *his Choice-1 answer* + *Beat 2 power
  reveal* into one bubble. Each has `choices` = Choice 2 (A/B/C), and all
  three point at the **same** three targets below (true reconvergence).
- `r2a` / `r2b` / `r2c`: each folds *his Choice-2 answer* + *Beat 3
  cliffhanger* into one bubble. `endLine: true` (terminal → email-gate CTA).

This satisfies `assertPreviewValid`: every mid node has 2–3 choices, terminals
use `endLine`, all nodes reachable from root, no dead-ends. Stage direction /
VO uses `*single asterisks*` for the renderer's italic pass.

Bubble-fold rationale: folding "his answer + next beat" into one character
bubble avoids an extra single-choice "continue" tap and reads naturally in the
chat UI. The shared Beat-2 / Beat-3 text may be lightly tailored per branch
for polish but is not required to be.

## Email gate & funnel

Gate copy is per-character (from the scripts, e.g. "Enter your email to hear
what he's been holding back →"), threaded through `openGate`. On valid email
submit, in order, before navigating away:

1. `dataLayer.push({ event: 'generate_lead', currency: 'USD', value: 1.0,
   user_data: { email } })` — **the Google Ads conversion**. (New: the zone
   currently fires only the un-wired `quiz_email_captured`/`quiz_redirect`
   events and no `generate_lead`; this design adds it.)
2. Fire-and-forget `saveEmail(email)` (mode label `experience`), never awaited.
3. `getGlValue()` → `_gl` (sub19).
4. `buildRedirectUrl({ chatSlug, clickid, gl, inbound })` →
   `clk.ourdreamnetwork.com/<ai-roleplay campaign>?sub11=ai-roleplay&sub17=<chatSlug>&sub19=<_gl>&clickid=<...>` + forwarded inbound params.
5. `window.location.href = url`.

`redirect.ts` (campaign id, sub11, sub17 mechanics), `TrackingCapture`,
uniclick.js, and GTM stay untouched. Per-character `chatUrl`/chat slug values
are placeholders (`TODO: real ourdream slug`) the user will specify.

## File plan (full replace)

Rewrite:
- `src/data/characters.ts` — 5 leads. Trim `Character` to what `/experience`
  needs (`slug`, `name`, `imageUrl` portrait, `vibe`/hook, `power`, `chatUrl`
  placeholder, per-character gate copy `{ gateHeadline, gateSub, gateButton }`).
  Keep the `FEATURED_CHARACTERS` export name to minimize import churn. Remove
  `Series`/`Tag`/`storyline`/`rank`/gender-filter machinery.
- `src/app/page.tsx` — character-select landing: hero + 5 picker cards linking
  to `/[slug]`. Remove gender filters, tag filters, catalogue FAQ copy (a short
  SFW FAQ is optional).
- `src/app/[slug]/page.tsx` — simplified: hero (portrait + name + hook) +
  `ChatPreview` story + gate CTA. Drop series/tags/related-by-gender/gender
  prose and catalogue JSON-LD. Zone stays `robots: noindex`.
- `src/lib/funnel-client.ts` — add `generate_lead`; keep getGl/redirect; set
  save mode to `experience`.
- `src/components/EmailGate.tsx` — accept per-character gate copy
  (headline/sub/button); keep modal + funnel call.
- `src/components/ChatPreview.tsx` — thread per-character gate copy into
  `openGate`; rebrand labels ("A 60-second taste of X" → story-appropriate
  copy); keep mechanics.
- `src/lib/metadata.ts`, `src/app/layout.tsx`, `src/components/SiteHeader.tsx`,
  `src/components/SiteFooter.tsx` — rebrand "AI Roleplay catalogue" copy to the
  story/experience concept.

Add:
- `src/data/chat-previews/{aric-venn,lucen-aldair,marlowe-vesper,vaughn-crowe,rook-callahan}.ts`
  and a rewritten `src/data/chat-previews/index.ts` registry.
- 5 portraits under `ai-roleplay/public/characters/` (user-provided).

Delete (after confirming unused post-refactor):
- `src/app/tag/[tag]/page.tsx`, `src/lib/tags.ts` (+ test), old
  `src/data/chat-previews/*` character files (+ `chat-previews.test.ts`
  fixtures), `ChatPreviewSeoSurface`, `match.ts` (+ test) and any other
  catalogue-only helpers with no remaining references.

Untouched:
- `next.config.js` (basePath/assetPrefix/headers), `vercel.json`,
  `TrackingCapture`, uniclick.js + GTM in `layout.tsx`, `redirect.ts` campaign.

## Theming

Align the story card and labels to the ourdream dark-pink brand. The zone
currently mixes romantasy gold/parchment/plum tokens (in `ChatPreview` and the
`[slug]` page) with `#F17BB6` pink (EmailGate, header). Normalize the
interactive story surfaces to the dark-pink palette used by `index.html` /
EmailGate.

## Legal / safety

- Keep every beat SFW.
- Never use the source game's or its characters' names in product copy, ad
  copy, or metadata.
- Retain the existing zone's Terms/Privacy links and disclaimer footer.

## Out of scope (v1)

- Full-bleed cinematic presentation (chose compact chat-bubble).
- Per-beat art (one portrait each).
- Choices/scene personalization token to ourdream.ai.
- Renaming the public route to `/experience`.
- Re-indexing / SEO catalogue surfaces (zone remains noindex).

## Open items for the user to supply

- 5 character portraits (drop into `ai-roleplay/public/characters/`).
- Real ourdream chat slug (or destination) per character for `sub17`.
