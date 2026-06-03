# RomantasyAI.com MVP Specification

## 1. MVP Definition

- **Product**: RomantasyAI.com is a landing and funnel site that positions 18+ romantic/fantasy fiction and directs users to **ourdream.ai** for image generation (Prompt Studio) and character chat.
- **Scope**: Marketing site + clear route to ourdream.ai; no age gate on-site; above-the-fold disclaimer and footer label; content, Prompt Studio rules, and Characters library aligned with safe, adult-only use and copyright-safe UX.
- **Out of scope for MVP**: On-site image generation, on-site chat, user accounts, payments, UTMs, or any tracking beyond the fixed param and pass-through rules below.

---

## 2. Route Map

| Route | Purpose |
|-------|--------|
| `/` | Home / value prop; primary CTAs to internal `/create` wizard + ourdream.ai/chat |
| `/create` | **3-step guided funnel** (gender → style → reveal) that hands off to `ourdream.ai/create` with `gender` + `style` preselected via the outbound `extras` mechanism. URL-driven state, statically prerendered, wrapped in a `<Suspense>` boundary. Trope was dropped in PR 4 because ourdream's /create has no canonical trope param. See `src/components/CreateWizard.tsx` + `src/lib/match.ts` |
| `/characters` | Character catalogue (60+ characters, ranked top-12 + shuffled tail); CTA = "Chat with a character" deep-linking to `ourdream.ai/chat/<slug>`. Soft `?gender=` and `?tag=` filters supported for users; canonical points at `/characters/tag/<slug>` when a tag filter is active so we don't compete with the dedicated tag pages for SEO |
| `/characters/[slug]` | Character detail with `Choose-Your-Own-Adventure` storyline copy + `CreativeWork` JSON-LD. The top 12 ranked characters all ship a hand-authored **CYOA chat preview**: 7-node branching dialogue tree (1 root + 2 mid + 4 leaves), interactive client UI + crawlable static SEO surface + `Conversation` JSON-LD. Trope chips at the bottom of the hero deep-link into `/characters/tag/<tag>`. See `src/data/chat-previews/` + `src/components/ChatPreview.tsx` |
| `/characters/tag/[tag]` | Per-trope landing pages (vampire, dragon-rider, fae, slow-burn, royal, warrior, modern, billionaire, professor, etc.). One static page per active tag, generated at build time via `generateStaticParams`. Each ships unique H1 + intro copy + `CollectionPage`/`ItemList` JSON-LD + breadcrumb + related-tropes footer. Source of truth for the taxonomy: `src/lib/tags.ts` |
| `/prompt-studio` | Prompt composer; CTA = internal `/create` |
| `/prompt-library` | Curated prompt cards; CTAs deep-link to ourdream.ai/create |
| `/books` | Book-inspired prompting guides index |
| `/books/crown-and-thorn` | Crown & Thorn series hub (32 stories) |
| `/books/the-crossing-series` | The Crossing Series hub |
| `/books/fourth-wing` | Fourth Wing vibe templates, settings, trope prompts, FAQ |
| `/books/acotar` | ACOTAR vibe templates, settings, trope prompts, FAQ |
| `/about` | About RomantasyAI |
| `/privacy` | Privacy policy; no storage of pasted text; tracking rules |
| `/terms` | Terms of use; 18+ disclaimer; adult-only; copyright guidance |

All outbound links to ourdream.ai must preserve and pass through existing query params from the current page when present (see Tracking rules). Wizard-driven preselects use the `extras` parameter on `buildOurdreamUrl`, which always wins over inbound conflicts but cannot override `ref`.

---

## 3. Page Objectives + CTAs

### CTA Deep-Link Rules

All outbound CTAs must use the outbound link helper (`buildOurdreamUrl`):

| CTA type | Deep-link target | Example |
|----------|-----------------|---------|
| **"Create" / "Start Creating"** | `ourdream.ai/create` | `https://ourdream.ai/create?ref=romantasyai` |
| **"Chat with [name]"** | `ourdream.ai/chat/<character-slug>` | `https://ourdream.ai/chat/kael-stormblade?ref=romantasyai` |
| **Generic "Open OurDream"** | `ourdream.ai/` (root) | `https://ourdream.ai/?ref=romantasyai` |

All links must include `ref=romantasyai` and pass through `tracker`, `source`, `gender`, `clickid` when present. Never add UTMs.

### Per-Page Objectives

- **Home (`/`)**: Communicate 18+ romantic/fantasy positioning; primary CTA = "Start Creating" (deep-link to `ourdream.ai/create`); secondary CTA = "Chat with a Character" (deep-link to `ourdream.ai/chat/<slug>`); tertiary = Prompt Studio / Characters links.
- **Characters (`/characters`)**: SFW-approved catalogue of 6 featured characters with card images. Each card's CTA = "Chat with [name]" deep-linking to `ourdream.ai/chat/<character-slug>`.
- **Prompt Studio / tips**: Explain defaults (cinematic realism; Vivid for images); CTA deep-links to `ourdream.ai/create`.
- **Prompt Library**: Curated prompt cards; CTAs deep-link to `ourdream.ai/create`.
- **Books / book pages**: Vibe templates, setting guides, trope prompts; CTAs deep-link to `ourdream.ai/create`.
- **Privacy**: Explain we do not store pasted text; document tracking (ref=romantasyai + pass-through only).
- **Terms**: Enforce 18+ and adult-only; copyright-safe guidance and prohibited uses.

---

## 4. Content Rules

- **Positioning**: 18+ romantic/fantasy fiction and imagery; consenting adults only.
- **Tone**: Non-graphic on-site; no explicit imagery or copy on romantasyai.com. All adult content is on ourdream.ai; romantasyai.com stays suitable for age-disclaimed browsing only (disclaimer + footer).
- **No age gate**: Do not implement an age gate on romantasyai.com. Use an above-the-fold disclaimer and a footer label stating 18+ / adult-only.

---

## 5. SEO + ChatGPT Indexing Checklist

- [ ] Meta title and description per page (18+ / romantic fantasy, no misleading claims).
- [ ] Canonical URLs set; no duplicate content.
- [ ] Structured data (e.g. Organization/WebSite) where appropriate.
- [ ] Clear H1/H2 hierarchy; descriptive alt text for images.
- [ ] robots.txt and sitemap allow desired discovery; block only if needed for crawler control.
- [ ] ChatGPT / AI indexing: ensure key pages are crawlable and content clearly describes 18+ romantic fantasy and link to ourdream.ai; avoid cloaking.

---

## 6. Tracking Rules

- **Fixed param**: Always set `ref=romantasyai` on every outbound link to ourdream.ai. romantasyai claims last-touch attribution per ourdream's first-write-wins rule.
- **Never *add* UTMs**: Do not synthesise `utm_source` / `utm_medium` / `utm_campaign` / `utm_term` / `utm_content`. They are passed through unchanged when present on the inbound URL but never invented.
- **Pass-through params**: When present on the inbound URL, forward unchanged. Source of truth is `src/lib/outbound.ts` (`PASSTHROUGH_PARAMS`). The five categories:

  1. **Affiliate / click IDs** — `click_id`, `clickid`, `cid`, `exotracker`, `aclid`, `adniumconv`, `TRid` (case-sensitive), `TSid` (case-sensitive), `tracker`, `affid`, `aff_id`, `dpo`, `source`, `reward`, `rdt_cid`.
  2. **Everflow sub-parameters** — `sub1`, `sub2`, `sub3`, `sub4`, `sub5`. (sub5 typically carries the affiliate's tracker click ID for postback reconciliation.)
  3. **UTMs + ad-platform click IDs** — `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `fbclid`, `gclid`, `msclkid`, `ttclid`.
  4. **Google Ads ValueTrack macros** — `adgroup`, `keyword`, `matchtype`, `network`, `device`, `placement`, `adposition`, `loc_physical`, `loc_interest`, `campaignid`, `adgroupid`, `feeditemid`, `targetid`.
  5. **Funnel / UX preselects** — `gender` (`female|male|trans|any`), `style` (`sfw|nsfw|realistic|anime|any`), `promo`, `closed`, `signup`, `login`, `upgrade`.

- **Casing**: `TRid` and `TSid` must be preserved with their original casing. URLSearchParams is case-sensitive so this is the default behaviour; do not normalise.
- **Conflict resolution**: If both an inbound canonical preselect (e.g. `gender=male`) and an Everflow sub (e.g. `sub1=female`) are present, both are forwarded unchanged. ourdream's landing system uses the canonical params for routing and the subs for attribution. Do not reconcile on this side.
- **Empty values**: Empty-string params are dropped (treated as absent).
- **Outbound link path**: Match the user intent — `/create`, `/chat/<slug>`, or `/` — never strip a path-level destination in favour of a query param.

These rules are unit-tested in `src/lib/outbound.test.ts` and surfaced to the user in `/privacy`.

---

## 7. Prompt Studio Rules

- **Default style**: Cinematic realism. For images on ourdream.ai, **Vivid** is recommended.
- **No 18+ age gate on romantasyai.com**: Use an above-the-fold disclaimer and a footer label (e.g. "18+ / Adult-only"). No interstitial age gate.
- **Adult-only**: All prompts must be strictly adult-only: consenting adults only. No exceptions.
- **Prohibited terms (block/sanitize)**: User input and generated prompts must be checked and sanitized. The following (and morphs/variants) must be **blocked** in both user input and in any generated prompt text:
  - **Minors / underage**: kid, child, children, daughter, son, teen, teenager, schoolgirl, schoolboy, underage, minor, baby, toddler, preteen, little girl, little boy.
  - **Incest / family sexualization**: stepdaughter, stepson, stepmother, stepfather, stepbrother, stepsister, and any similar terms used to imply underage or non-consenting family sexualization.
- Implement input validation and output sanitization so that prompts containing these terms are rejected or stripped before being sent to ourdream.ai or shown to users.

---

## 8. Copyright-Safe Guidance

- **UX and Terms must make the following clear:**
  - **Encourage**: Users should write their own summary or paraphrase when describing scenes or characters (e.g. for Prompt Studio).
  - **Discourage**: Pasting long excerpts or verbatim text from copyrighted books or other copyrighted material.
  - **Storage**: We do not store pasted text. Pasted content is not retained on our systems.
- Surface this in onboarding/tooltips where users can paste text, and in Terms of Use and Privacy Policy.

---

## 9. Asset Requirements

### `/characters` Page Assets

| Asset | Spec | Notes |
|-------|------|-------|
| 6 character card images | 1024 × 1024 px, PNG or WebP | One per featured character. Cinematic realism style, adult-only, non-graphic. No copyrighted character likenesses. |
| 1 banner image | 1600 × 600 px, PNG or WebP | Hero banner for `/characters` page. Cinematic realism, adult-only, non-graphic. |

**Style rules for all assets:**
- Cinematic realism (matches Prompt Studio default).
- Adult-only: all depicted characters must be clearly adults.
- Non-graphic: no explicit content; suggestive romance themes only.
- Original characters only — do not reproduce copyrighted character designs or likenesses.
- Alt text must describe each image accurately for accessibility and SEO.

---

## 10. Done When

- [ ] `/docs/mvp.md` exists and matches this spec.
- [ ] Route map is implemented (all routes in §2 including `/characters`).
- [ ] `/characters` page displays 6 SFW-approved character cards with "Chat with [name]" CTAs deep-linking to `ourdream.ai/chat/<character-slug>`.
- [ ] "Create" CTAs across the site deep-link to `ourdream.ai/create` (not ourdream.ai root).
- [ ] "Chat" CTAs deep-link to `ourdream.ai/chat/<character-slug>`.
- [ ] All outbound links use `buildOurdreamUrl` with `ref=romantasyai` + pass-through params; no UTMs.
- [ ] Above-the-fold disclaimer and footer 18+ label are live; no age gate.
- [ ] Prompt Studio rules (defaults, prohibited terms, adult-only) documented in-product and on site.
- [ ] Prohibited-terms blocking/sanitization is implemented for user input and generated prompts.
- [ ] Copyright-safe guidance is in UX and in Terms/Privacy (no storage of pasted text; encourage paraphrase).
- [ ] Asset requirements for `/characters` are documented (6 × 1024×1024 cards + 1 × 1600×600 banner; cinematic realism, adult-only, non-graphic).
- [ ] SEO + ChatGPT indexing checklist items are done for launched pages.
