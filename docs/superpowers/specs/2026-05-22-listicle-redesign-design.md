# Listicle redesign — top-sites, top-ai-bf-sites, top-gay-ai-sites

**Date:** 2026-05-22
**Status:** Design approved, ready for implementation plan

## Goal

Redesign the brand listicle cards on the three top-sites pages so they match a numbered, badge-anchored layout (inspired by the reference image shared in the task), while keeping the existing light/pink palette and adding two more brands to each page.

## Scope

Three files, all in `public/`:

- `top-sites.html` (girlfriend niche)
- `top-ai-bf-sites.html` (boyfriend niche)
- `top-gay-ai-sites.html`

All three share the same `ts-*` CSS prefix and structure today, so changes are mirrored across them.

## Out of scope

- Hero section, page header, page footer, FAQ section, intro copy section, email-gate popup, save-email API, click redirection logic — all unchanged.
- Sister pages outside the three listicles (`index.html`, `/candy.html`, `/male.html`, etc.).
- Server-side or routing changes.

## What changes per page

### Brand list

Today each page lists 3 brands: ourdream, candy, joi. The redesign expands to 5 across all three pages, in the same order:

1. ourdream.ai
2. candy.ai
3. Joi AI
4. Lovescape
5. GirlfriendGPT

Lovescape and GirlfriendGPT are rendered as text wordmarks (no image assets needed). Every CTA — including the two new brands' "Visit Site" buttons — still routes through the existing email-gate then redirects to ourdream.ai. The two new brands act as visual content/social proof, not new partner integrations.

### Top-3 pill (the `.ts-top3` block above the listicle)

Stays as-is functionally (still showcases the top 3 with the existing "Experts' #1" badge on ourdream), but its three cards are restyled to use the new score-block treatment described below so it reads consistently with the listicle.

### Listicle card anatomy

```
        ╭─── pink gradient pill (cards 1–3 only) ───╮
        │  ✨  MOST REALISTIC EXPERIENCE             │
        ╰────────────────────────────────────────────╯
   ╭─────────────────────────────────────────────────────────╮
   │  ┏━━━┓                                                  │
   │  ┃ 1 ┃   ourdream.ai     ✓ Special offer: 75% saving    │
   │  ┃   ┃   ★★★★★           ✓ The ultimate AI chat exp.    │
   │  ┗━━━┛   Read Review     ✓ Bring imagination to life    │
   │                                                         │
   │                  9.9  ★★★★★  Top-Rated                  │
   │                              User Votes                 │
   │                  [    VISIT SITE    ]                   │
   ╰─────────────────────────────────────────────────────────╯
```

**Numbered rank circle**

- 44px diameter, pink gradient `linear-gradient(135deg, #F17BB6, #db2777)`, white bold numeral (24px / 800 weight).
- Soft drop shadow `0 6px 16px rgba(241,123,182,0.35)`.
- Floats off the left edge of the card on desktop (translated `-22px` so it overlaps the card border). Centered above the card content on mobile.
- Each of cards 1–5 has its rank number (1, 2, 3, 4, 5). The "Best Overall" closing card has no rank circle.

**Card surface**

- White background, 18px radius, `1px solid rgba(0,0,0,0.06)` border (same as today).
- Hover: lift `translateY(-2px)`, soft pink shadow (same as today).
- Featured card #1 keeps the existing `2px solid #F17BB6` border + outer pink halo. Cards 2–5 stay on the default border.

**Category badge pill (cards 1–3 only)**

- Replaces today's `.ts-badge-row`.
- Single pill overlapping the top edge by ~14px (similar position to today's badges but as one pill instead of two).
- Background `linear-gradient(90deg, #F17BB6, #db2777)`, white uppercase 11px text with 0.08em tracking, prefixed with a small ✨ glyph.
- Cards 4 and 5 have no badge — just the rank circle.

**Per-page badge copy:**

| Rank | top-sites.html | top-ai-bf-sites.html | top-gay-ai-sites.html |
|------|----------------|----------------------|------------------------|
| #1 | Most Realistic Experience | Most Realistic Experience | Most Realistic Experience |
| #2 | Top Pick by Users | Top Pick by Users | Top Pick by Users |
| #3 | Most Flirty | Most Romantic | Most Adventurous |

**Brand column** (~170px wide on desktop)

- Centered logo or wordmark, gold star row, "Read Review" link.
- Existing styling kept: ourdream uses its SVG droplet + `.ts-brand-tld` pink ".ai", candy.ai uses Georgia serif + 💝 glyph, Joi AI uses the 👁️ glyph + purple ".ai" text.
- Lovescape: bold sans-serif uppercase wordmark `LOVESCAPE` with a stylized "|" cursor at the end (matches the reference).
- GirlfriendGPT: small pink 💧 droplet glyph + "GirlfriendGPT" in 700 weight pink color.

**Features list**

- Existing `.ts-blurb-list` — pink ✓ checkmark bullets, 14px copy, no change.
- 2–3 bullets per card per the brand-copy table below.

**Score + CTA column** (~220px wide on desktop)

Replaces today's circular `.ts-score-ring` with a horizontal layout:

```
   ┌──────┐  Top-Rated
   │ 9.9  │  ★★★★★
   └──────┘  User Votes
   [   VISIT SITE   ]
```

- Score box: `#fff5fa` background, `1px solid rgba(241,123,182,0.25)` border, 12px radius, padding `8px 14px`. Numeral is 24px / 800 weight, color `#1a0e15`.
- Score-tier label varies by score:
  - ≥9.5 → "Top-Rated"
  - 9.0–9.4 → "Excellent"
  - 8.0–8.9 → "Very Good"
  - <8.0 → "Good"
- Gold ★★★★★ row right of the score box, bold tier label above, muted small-caps "User Votes" below.
- "Visit Site" pill button beneath. Existing CSS (`.ts-card-cta`) reused unchanged.
- Featured #1 keeps a subtle pink glow around its score box; cards 2–5 stay flat.

**Brand scores and copy:**

Scores are kept descending so rank order matches the ranking on the page. The existing top-3 scores stay; new brands sit below.

| # | Brand | Score | Tier label | Feature bullets |
|---|-------|-------|------------|------------------|
| 1 | ourdream.ai | 9.9 | Top-Rated | Special offer: 75% saving / The ultimate AI chat experience / Create your dream companion and bring your imagination to life |
| 2 | candy.ai | 9.4 | Excellent | Exclusive discount: Up to 70% off / Create your dream AI girlfriend tailored to your exact preferences |
| 3 | Joi AI | 8.7 | Very Good | Top deal: 70% off for first purchase / Enjoy playful conversations and company with AI 24/7 |
| 4 | Lovescape | 8.5 | Very Good | Special discount: Up to 70% Off / Matches your every mood — sweet, playful, or adventurous |
| 5 | GirlfriendGPT | 8.3 | Very Good | Best offer: Save 34% by going annual / The most immersive interactive experience featuring chat and dynamic visual generation |

For the boyfriend page (`top-ai-bf-sites.html`) the feature copy is rewritten to read in the boyfriend niche (the existing page already does this; we keep the same niche rewording for the two new brands). Same applies for the gay AI page. Exact niche copy for the two new brands will be authored at implementation time mirroring the tone of the existing page-specific copy.

### Layout grid

`.ts-card-body` grid changes from `200px 1fr 220px` to roughly `60px 170px 1fr 240px` (rank circle, brand col, features, score+CTA) on desktop. Below 860px it collapses to a single column with rank circle centered above brand → features → score → CTA.

### Sticky side banner (new)

Replaces today's bottom-of-page "Top 3 Sites In 2026" sidebar widget. Sits in a 2-column wrap that contains the listicle on the left and the banner on the right; the banner is sticky so it stays in view while the listicle scrolls.

```
   ╭───────────────────────╮
   │  ourdream.ai          │
   │  ┌──────────────────┐ │
   │  │   [hero image]   │ │
   │  └──────────────────┘ │
   │   SPECIAL OFFER       │
   │     75% SAVING        │
   │  [  Get Started  ]    │
   ╰───────────────────────╯
```

- White card, `1.5px solid #F17BB6` border, 16px radius, drop shadow `0 20px 60px rgba(241,123,182,0.18)` + an outer pink halo for emphasis.
- ~300px wide at ≥1180px, ~240px at 900–1179px, hidden below 900px.
- Sticky at `top: 20px`. Vertically anchored to the listicle column — appears alongside cards, ends when the listicle ends.
- Image source: `/female.webp` on `top-sites.html` and `top-gay-ai-sites.html`, `/male.webp` on `top-ai-bf-sites.html`. User will swap assets later by replacing the file or changing the `src`.
- "SPECIAL OFFER" small-caps muted, "75% SAVING" 28px bold pink (`#db2777`). "Get Started" pill button using the existing pink gradient.
- Same email-gate trigger as the other CTAs (`data-cta="ourdream-banner"`).

### "Best Overall" closing card

Replaces today's `.ts-offer` "Offer Of The Month" section.

```
   ╔════════════════════════════════════════════════╗
   ║  🏆  BEST OVERALL                              ║   ← pink gradient bar
   ╠════════════════════════════════════════════════╣
   │  ourdream.ai   ✓ Special offer: 75% saving     │
   │  ★★★★★         ✓ The ultimate AI chat exp.     │
   │                ✓ Bring imagination to life     │
   │                                                │
   │   9.9 ★★★★★ Top-Rated      [ VISIT SITE ]      │
   ╰────────────────────────────────────────────────╯
```

- Same internal anatomy as the regular listicle cards (brand col, features, score+CTA) — but with a full-width pink gradient header bar capping the top instead of a floating badge.
- No rank circle.
- White card body, sits between the listicle and the FAQ section.

### Removed / replaced elements

- `.ts-sidebar` (the bottom "Top 3 Sites In 2026" widget) — removed. Its role is taken by the new sticky side banner.
- `.ts-faq-layout` 2-column grid — replaced with FAQ section at full width since the sidebar is gone.
- `.ts-offer` section — replaced by the "Best Overall" closing card described above.
- `.ts-score-ring` circular score — replaced by the horizontal `9.9 ★★★★★ Top-Rated` layout.
- Today's two-badge row (`.ts-badge-row`) — replaced by a single category-badge pill.

## Layout grid (page level)

Today: hero → top-3 pill → meta row → listicle (full width) → intro → offer → FAQ (with right sidebar) → footer.

After: hero → top-3 pill → meta row → **2-column wrap (listicle column on left, sticky side banner on right)** → intro → **best overall card** → FAQ (full width) → footer.

The 2-column wrap collapses to a single column below 900px and the side banner is hidden.

## Responsive behavior

- **≥1180px**: 2-column wrap (listicle ~840px / banner ~300px), card body grid `60px 170px 1fr 240px`.
- **900–1179px**: same 2-column wrap, banner narrows to ~240px, card body grid `52px 150px 1fr 220px`.
- **<900px**: single column. Side banner hidden. Card body collapses to one column with rank circle centered above the brand block. Badge pill anchored to top of each card.

## Files affected

- `public/top-sites.html` — full restyle (CSS + listicle HTML + closing card + side banner). New brand cards added for Lovescape and GirlfriendGPT.
- `public/top-ai-bf-sites.html` — same change, badge #3 says "Most Romantic", side banner uses `/male.webp`, feature copy in boyfriend niche.
- `public/top-gay-ai-sites.html` — same change, badge #3 says "Most Adventurous", side banner uses `/female.webp` for now (the user can swap), feature copy in gay AI niche.

No new files, no new images required at implementation time. No JS logic changes — existing `data-cta` wiring already handles arbitrary CTA sources via the `BRAND_LABELS` map, which we extend to include Lovescape and GirlfriendGPT and the new `ourdream-banner` entry.

## Risk and validation

- Visual regression on three pages — verify all three in browser at 1440px, 1024px, 768px, and 375px viewports after implementation. Confirm card hover, badge alignment, sticky banner behavior.
- Email gate still fires for all 5 brand CTAs + top-3 pill CTAs + side banner CTA + closing-card CTA. Verify by clicking each one.
- No change to `/api/save-email` payload shape; `mode` stays `top-sites`. The new `source` values (`lovescape`, `girlfriendgpt`, `ourdream-banner`) flow through as labels only.

## Open items deferred to implementation

- Exact niche-specific feature copy for Lovescape and GirlfriendGPT on the boyfriend and gay AI pages — author at implementation time mirroring the tone of the existing page-specific copy on each page.
- Final stylistic treatment of the Lovescape and GirlfriendGPT wordmarks (font weight, letter spacing) — finalize by visual review during implementation against the rest of the page.
