# RomantasyAI.com — MVP QA Checklist

## 1. Route Coverage (no 404s)

| Route | Exists | Has metadata | Has canonical |
|-------|--------|-------------|---------------|
| `/` | Yes | Yes | `"/"` |
| `/characters` | Yes | Yes | `"/characters"` |
| `/prompt-studio` | Yes | Yes | `"/prompt-studio"` |
| `/prompt-library` | Yes | Yes | `"/prompt-library"` |
| `/books` | Yes | Yes | `"/books"` |
| `/books/fourth-wing` | Yes | Yes | `"/books/fourth-wing"` |
| `/books/acotar` | Yes | Yes | `"/books/acotar"` |
| `/about` | Yes | Yes | `"/about"` |
| `/privacy` | Yes | Yes | `"/privacy"` |
| `/terms` | Yes | Yes | `"/terms"` |
| `/robots.txt` | Yes (route handler) | — | — |
| `/sitemap.xml` | Yes (route handler) | — | — |

### Manual checks

- [ ] Visit every route above in a browser — no 404 or error pages.
- [ ] `/robots.txt` returns `Allow: /` + Sitemap link in prod; `Disallow: /` when `NOINDEX=true`.
- [ ] `/sitemap.xml` returns valid XML listing all 10 page routes.

---

## 2. Navigation + Footer Links

### Header nav links

- [ ] Logo → `/`
- [ ] Characters → `/characters`
- [ ] Prompt Studio → `/prompt-studio`
- [ ] Prompt Library → `/prompt-library`
- [ ] Books → `/books`
- [ ] About → `/about`
- [ ] "Create on OurDream →" → `ourdream.ai/create?ref=romantasyai` (OutboundLink)

### Footer nav links

- [ ] Characters → `/characters`
- [ ] About → `/about`
- [ ] Privacy → `/privacy`
- [ ] Terms → `/terms`
- [ ] 18+ badge + "Non-graphic · Suggestive romance themes only · Consenting adults" label is present.

### Mobile nav

- [ ] Hamburger opens; all links above are present.
- [ ] Links close the menu on tap.

---

## 3. Above-the-Fold Disclaimers

- [ ] **Home (`/`)**: Disclaimer component appears above the fold with:
  - "18+ community (non-graphic). Suggestive romance themes only."
  - "Please don't paste copyrighted text. Use your own summary or paraphrase."
- [ ] **Prompt Studio (`/prompt-studio`)**: Same Disclaimer component appears above the fold.
- [ ] No other pages show the Disclaimer (by design).
- [ ] **No age gate** exists anywhere — confirmed via codebase search.

---

## 4. Prompt Studio Safety Filters

### Blocked terms (from docs/mvp.md §7)

The following must be blocked/sanitized in user input and generated prompts:

**Minors / underage:** kid, child, children, daughter, son, teen, teenager, schoolgirl, schoolboy, underage, minor, baby, toddler, preteen, little girl, little boy.

**Incest / family sexualization:** stepdaughter, stepson, stepmother, stepfather, stepbrother, stepsister.

### Checks

- [ ] Input validation rejects prompts containing any blocked term.
- [ ] A friendly error message is shown (not a raw error).
- [ ] Output sanitization strips blocked terms before display.
- [ ] None of the 12 Prompt Library cards contain any blocked term.
- [ ] None of the 6 character descriptions contain any blocked term.
- [ ] None of the book page vibe/setting/trope templates contain any blocked term.

> **Sweep result:** Codebase searched for all prohibited terms. The only occurrences of "children" are React's `children` prop (composition API) — not content. Zero prohibited terms appear in any user-facing text, prompts, or character data.

---

## 5. Outbound Link Rules

### `buildOurdreamUrl` (src/lib/outbound.ts)

- [ ] Always adds `ref=romantasyai`.
- [ ] Passes through `tracker`, `source`, `gender`, `clickid` when present in current page params.
- [ ] Never adds `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, or `utm_content`.
- [ ] No UTM strings exist anywhere in application code (only in policy docs stating they must not be used).

### `<OutboundLink>` component (src/components/OutboundLink.tsx)

- [ ] Wraps `buildOurdreamUrl` with `useSearchParams()` for automatic pass-through.
- [ ] Falls back to a plain `<a>` with `ref=romantasyai` during SSR/Suspense.
- [ ] Opens in new tab (`target="_blank"`, `rel="noopener noreferrer"`).

### Create deep links (`ourdream.ai/create`)

Every "Create" CTA must use `<OutboundLink path="/create">`:

| Location | path prop | Status |
|----------|-----------|--------|
| Header (desktop) | `"/create"` | OK |
| Header (mobile) | `"/create"` | OK |
| Home hero | `"/create"` | OK |
| Prompt Studio | `"/create"` | OK |
| PromptCard (Prompt Library, ×12) | `"/create"` | OK |
| Books index | `"/create"` | OK |
| Books / Fourth Wing | `"/create"` | OK |
| Books / ACOTAR | `"/create"` | OK |
| Characters cross-link | `"/create"` | OK |

### Chat deep links (`ourdream.ai/chat/<slug>`)

Every "Chat" CTA must use `<OutboundLink path={"/chat/<slug>"}>`:

| Location | path prop | Status |
|----------|-----------|--------|
| `/characters` grid (×6 cards) | `` `/chat/${c.slug}` `` | OK |

> **Note:** The Home page "Featured Characters" section is a compact teaser; it links to `/characters` (internal) via "Browse All Characters" rather than individual chat deep links. Chat CTAs are on the full `/characters` page. This is by design.

---

## 6. SEO

### Per-page metadata

- [ ] Every page exports `metadata` with a unique `title` and `description`.
- [ ] Every page sets `alternates.canonical` to its own path.
- [ ] Root layout (`src/lib/metadata.ts`) sets OG defaults (title, description, image, type, locale, siteName), Twitter card, and `robots` index/follow (respects `NOINDEX` env var).

### FAQ blocks (ChatGPT indexing)

| Page | FaqBlock present | JSON-LD FAQPage |
|------|-----------------|-----------------|
| `/characters` | Yes | Yes |
| `/books/fourth-wing` | Yes | Yes |
| `/books/acotar` | Yes | Yes |

- [ ] JSON-LD renders as `<script type="application/ld+json">` with valid `@type: FAQPage`.

### Sitemap + robots

- [ ] `/sitemap.xml` lists all 10 page routes with `<lastmod>`.
- [ ] `/robots.txt` includes `Sitemap:` directive pointing to `/sitemap.xml`.
- [ ] Setting `NOINDEX=true` causes robots to `Disallow: /` and metadata to set `index: false, follow: false`.

---

## 7. Performance Basics

- [ ] Images use `<img>` with descriptive `alt` text (acceptable for MVP; migrate to `next/image` post-launch).
- [ ] Character card images have `aspect-square` containers to prevent layout shift.
- [ ] No blocking third-party scripts.
- [ ] Tailwind CSS is purged (content paths configured in `tailwind.config.ts`).
- [ ] `<html lang="en">` set on root layout.

---

## 8. Content Safety

- [ ] No explicit pornographic language anywhere in `src/` — confirmed via codebase search.
- [ ] All content is "suggestive, non-graphic" per spec.
- [ ] No age gate implemented — only above-the-fold disclaimers + footer label.
- [ ] All character data is original (no copyrighted names or likenesses).
- [ ] All prompt templates are original (no copyrighted character names or direct quotes).
- [ ] Copyright-safe guidance appears on Prompt Studio, book pages, and Terms.

---

## 9. Found Issues + Fixes Applied

| # | Issue | Status |
|---|-------|--------|
| — | No issues found. | — |

Full sweep performed:

1. **UTM audit** — Zero UTM parameters in application code. Only policy/doc references stating UTMs must not be used.
2. **Prohibited terms audit** — Zero prohibited terms in user-facing content. Only `children` appears as React's composition prop.
3. **Age gate audit** — No age gate code exists. All references are spec text saying "no age gate."
4. **Explicit content audit** — Zero explicit/pornographic language in `src/`.
5. **OutboundLink audit** — All 10 usages have correct `path` props: 9 × `"/create"`, 1 × `` `/chat/${slug}` ``. None default to `"/"`.
6. **buildOurdreamUrl audit** — Correctly sets `ref=romantasyai`, passes through `tracker/source/gender/clickid`, adds no UTMs.
7. **Disclaimers** — Present on `/` and `/prompt-studio`. No other page shows them (by design).
8. **SEO** — All 10 pages have unique title, description, and canonical. FAQ blocks on `/characters`, `/books/fourth-wing`, `/books/acotar`.
9. **Sitemap** — All 10 routes listed including `/characters`.

---

## 10. Done When

- [ ] All 10 routes load without errors (manual browser check).
- [ ] Header nav includes Characters, links work.
- [ ] Footer nav includes Characters, links work.
- [ ] Above-the-fold disclaimers appear on `/` and `/prompt-studio` only.
- [ ] Every "Create" CTA deep-links to `ourdream.ai/create` with `ref=romantasyai`.
- [ ] Every "Chat" CTA on `/characters` deep-links to `ourdream.ai/chat/<slug>` with `ref=romantasyai`.
- [ ] Outbound links pass through `tracker`, `source`, `gender`, `clickid` when present.
- [ ] Zero UTMs anywhere in outbound URLs.
- [ ] Zero prohibited terms in user-facing content or prompt templates.
- [ ] No age gate — only disclaimers and footer label.
- [ ] No explicit/pornographic language — content is suggestive and non-graphic.
- [ ] FAQ blocks with valid FAQPage JSON-LD on `/characters`, `/books/fourth-wing`, `/books/acotar`.
- [ ] Unique title + description + canonical on every page.
- [ ] `/robots.txt` and `/sitemap.xml` behave correctly (incl. `NOINDEX` env var).
- [ ] All character and prompt content is original and copyright-safe.
