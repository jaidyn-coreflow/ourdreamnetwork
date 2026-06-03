# `/ai-roleplay` — AI Roleplay Character Catalogue

**Date:** 2026-06-03
**Status:** Design approved, pending spec review

## Goal

Add a new page at `ourdreamnetwork.com/ai-roleplay` that reuses the **real React
components** from the romantasy `/characters` experience (cloned at
`romantasy/romantasyai.com`), reskinned to match ourdreamnetwork's `index.html`
look, with CTAs that open an email-capture modal before redirecting users into
the ourdream.ai chat funnel.

## Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Reconcile "same components" + "ourdreamnetwork style" | Run the **real Next.js/React components** in the repo (not a static port) |
| Scope | **Full experience**: catalogue grid + detail pages + interactive 60-sec CYOA previews + tag pages |
| CTA behavior | Open an **email-capture modal** — "Free Trial Offer — Enter Your Email To Get 5 Messages Free" — then redirect through the funnel |
| Theme | Match **`index.html`**: dark (`#0a0a0a`) + white text + pink accents (`#F17BB6` / `#db2777`) + sans-serif + pink ambient glow |
| Deployment | **Separate proxied app** (Vercel Multi-Zones) — existing static funnel untouched |
| Redirect target after email | The clicked character's specific `ourdream.ai/chat/<slug>` URL |
| Out-of-scope cross-links | **Removed** (`/create` wizard, `/books`, `/prompt-studio`, `/character-builder-academy`, `/prompt-library`, `/about`) |

## Why this approach

The repo is a pure static site (`vercel.json` `"framework": null`, `public/*.html`
served directly, `/` → `index.html`, plus a standalone `/api/save-email.js`
function). Converting the whole repo to Next.js would change the build config of
the live `/` quiz funnel (Next.js does not serve `public/index.html` at `/`). To
avoid any risk to the revenue funnel, the new app deploys as its **own Vercel
project** and is proxied in via rewrites (Vercel Multi-Zones). The existing static
pages, the `/` quiz, and `/api/save-email.js` are not touched.

## Architecture

### Deployment (Multi-Zones)

- New Next.js app in the repo at `ai-roleplay/` (a trimmed app derived from the
  romantasy clone — we keep only the characters experience and its dependencies).
- Deployed as a **second Vercel project** with:
  - `basePath: '/ai-roleplay'`
  - `assetPrefix: '/ai-roleplay'` (so `_next/*` assets resolve under the proxied path)
- Main static project's `vercel.json` gains two rewrites:
  ```json
  { "source": "/ai-roleplay", "destination": "https://<zone-app>.vercel.app/ai-roleplay" },
  { "source": "/ai-roleplay/:path*", "destination": "https://<zone-app>.vercel.app/ai-roleplay/:path*" }
  ```
- Drop romantasy's `next.config.js` `romantasyai.com → www` host redirect. Keep its
  `images.remotePatterns` (`img.ourdream.ai`) and security headers.

### Routes (re-rooted so the catalogue is the zone root)

| Route file | Serves | Was (romantasy) |
|---|---|---|
| `src/app/page.tsx` | `/ai-roleplay` — catalogue grid + gender tabs + trope chips + FAQ | `src/app/characters/page.tsx` |
| `src/app/[slug]/page.tsx` | `/ai-roleplay/<slug>` — character detail + CYOA preview | `src/app/characters/[slug]/page.tsx` |
| `src/app/tag/[tag]/page.tsx` | `/ai-roleplay/tag/<tag>` — trope tag page | `src/app/characters/tag/[tag]/page.tsx` |

Internal `<Link>` hrefs are rewritten from `/characters/...` to the new roots
(`/`, `/<slug>`, `/tag/<tag>`); `basePath` prepends `/ai-roleplay` automatically.

### Components reused (mostly as-is)

`CharacterCard`, `FaqBlock`, `Disclaimer`, `ChatPreview`, `ChatPreviewSeoSurface`,
`OutboundLink`, `Header`, `Footer`, and the `_allPreviews` / `characters` data
modules. Data (`src/data/characters.ts`, `src/data/chat-previews/*`) is reused
unchanged (~60 characters, `ourdream.ai` chat URLs, `img.ourdream.ai` images).

**Risk flag:** the `img.ourdream.ai` image URLs are signed (`?sig=…&exp=…`). If
those signatures have expired since the clone, images 404 and need refreshing from
a current ourdream.ai source. Verify during implementation.

## Reskin: match `index.html` (token remap, not per-component rewrites)

The components use semantic-ish Tailwind color tokens (`text-gold-400`,
`bg-night-800`, `text-parchment-300`, `bg-plum-900`, `font-display`). Instead of
editing every `className`, remap the tokens in `tailwind.config.ts` + `globals.css`:

- `gold` palette → pink (`#F17BB6` primary, `#db2777` deep) — matches index accents
- `plum` → dark magenta/pink-tinted surfaces
- `parchment` → white / neutral grays (index text colors)
- `night` ≈ unchanged (`#0a0a0a` family)
- `font-display` (serif) → `system-ui` sans-serif (index body font)

Then graft index's chrome:
- Pink **ambient drift glow** (`radial-gradient` pink halos, the `c3s-drift` animation)
- ourdreamnetwork **logo + header** (replace romantasy `Header`)
- ourdreamnetwork **footer + trust badges** (replace romantasy `Footer`)
- Buttons restyled to index's pink primary CTA

Net effect: identical components and layout, index's dark-pink skin.

## Email-gate modal funnel (the new behavior)

Romantasy's CTAs deep-link straight to `ourdream.ai` via `OutboundLink`. Here, the
primary CTAs (card "Chat now", detail-page primary CTA, CYOA preview "continue")
instead open a modal:

> **Free Trial Offer**
> Enter Your Email To Get 5 Messages Free
> `[ email input ]  [ Submit ]`

On submit (reusing index.html's exact pipeline):

1. Validate email (`/.+@.+\..+/`).
2. `track('quiz_email_captured', { source: 'ai-roleplay', ... })`.
3. `saveEmail(email)` — POST `/api/save-email`, **fire-and-forget**, wrapped so a
   slow/failed save never blocks the redirect.
4. `redirectToChat(character)`:
   - Build target = the clicked character's `ourdream.ai/chat/<slug>` URL.
   - **Paid** (`rtkclickid-store` cookie present): route through
     `clk.ourdreamnetwork.com/click/N` with `sub11=ai-roleplay`, `sub19=<_gl>` (from
     `getGlValue()`), `clickid=<cookie>`. The RedTrack slot `N` must be configured
     with a destination that lands on the per-character chat URL (carry the chat
     path/slug via a sub-slot macro). **Exact RedTrack dashboard config is an
     implementation step + external dependency — flag it.**
   - **Organic** (no cookie): skip RedTrack, redirect directly to the chat URL,
     GTM-decorated via `getDecoratedUrl()` so `_gl` is preserved.
5. `track('quiz_redirect', { source: 'ai-roleplay', redirect_url, has_clickid })`.

The modal is a small client component; `getGlValue` / `getDecoratedUrl` /
`saveEmail` / `redirectToChat` are ported from `public/index.html` into a shared
client module in the zone app.

**Per CLAUDE.md compliance:** `_gl` always comes from `getGlValue()`, never the URL;
the organic branch is always implemented; the redirect never awaits `saveEmail`;
`quiz_email_captured` + `quiz_redirect` fire with `source: 'ai-roleplay'`.

## Out of scope (removed)

- Cross-links/sections pointing to non-ported romantasy pillars: `/create` wizard,
  `/books`, `/prompt-studio`, `/character-builder-academy`, `/prompt-library`,
  `/about`. The catalogue page's "Or take a different path" section and the header
  "author your own world / 3-step wizard" links are removed.
- No change to any existing ourdreamnetwork static page or the `/` quiz funnel.

## Documentation / housekeeping

- Add the `/ai-roleplay` row to the CLAUDE.md page table (note it is a separate
  Next.js zone, not a `public/*.html` page).
- Add the two `vercel.json` rewrites.

## Open external dependency

- RedTrack click-slot configured to forward to per-character `ourdream.ai/chat/<slug>`
  URLs (the `_gl={sub19}` macro must be present, per CLAUDE.md). Needs dashboard
  setup before the paid path attributes correctly; the organic path works without it.
