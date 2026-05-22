# Listicle Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the brand listicle cards on the three top-sites pages to a numbered, badge-anchored layout with a sticky offer side-banner, while keeping the existing light/pink palette and adding two more brands (Lovescape, GirlfriendGPT) to each page.

**Architecture:** Pure HTML/CSS/JS edits to three static files in `public/`. Each page already embeds its own `<style>` block and shares the same `ts-*` class prefix; we edit each file independently following the same pattern. No framework, no build step. Visual verification is done by running the local Express server (`node server.js` on port 3000) and screenshotting at multiple viewports via the Playwright MCP browser tool.

**Tech Stack:** Vanilla HTML, vanilla CSS, vanilla JS, Express (dev server only).

**Spec:** `docs/superpowers/specs/2026-05-22-listicle-redesign-design.md`

---

## File Structure

Three files modified, no new files. Each file gets the same shape of change (CSS rules in the embedded `<style>`, HTML structure inside `.ts-wrap`, two entries appended to the `BRAND_LABELS` JS map), with per-page variation only in copy and the banner image source.

- **Modify:** `public/top-sites.html` — full restyle (Task 1)
- **Modify:** `public/top-ai-bf-sites.html` — same shape, boyfriend-niche copy, badge #3 "Most Romantic", banner uses `/male.webp` (Task 2)
- **Modify:** `public/top-gay-ai-sites.html` — same shape, gay-AI-niche copy, badge #3 "Most Adventurous", banner uses `/female.webp` (Task 3)
- **No changes:** `api/`, `server.js`, `vercel.json`, the email-gate logic. `BRAND_LABELS` map is extended in each page (the entries are page-local).

The three pages have duplicated CSS today — that's the established pattern and we don't unilaterally refactor it.

---

## Verification Approach

There is no test framework in this repo. Verification is visual:

- Start the dev server with `node server.js` (port 3000) at the start of Task 1. Leave it running for the whole plan.
- Use the Playwright MCP browser tool to navigate to `http://localhost:3000/top-sites`, `/top-ai-bf-sites`, `/top-gay-ai-sites` and screenshot at viewports 1440×900, 1024×768, 768×1024, 375×812.
- After each task, screenshot the affected page and visually compare against the spec's card-anatomy diagram. Check console for errors (`browser_console_messages`).
- Smoke-test every CTA click in each page after the redesign to confirm the email-gate popup still opens with the right brand label.

---

### Task 1: Restyle `public/top-sites.html`

**Files:**
- Modify: `public/top-sites.html` (CSS rules added/removed in the `<style>` block; markup restructured inside `.ts-wrap`; JS `BRAND_LABELS` map extended)

---

- [ ] **Step 1.1: Start the dev server**

Run in a background terminal:

```bash
node server.js
```

Expected output:
```
Server running at http://localhost:3000
```

Leave it running for the rest of this task and Tasks 2–3.

- [ ] **Step 1.2: Take a "before" screenshot for reference**

Use the Playwright MCP tool to navigate and snapshot:

```
mcp__playwright__browser_navigate → http://localhost:3000/top-sites
mcp__playwright__browser_resize → 1440 × 900
mcp__playwright__browser_take_screenshot → save as before-top-sites-1440.png
```

This is for visual diff comparison; not committed to the repo.

- [ ] **Step 1.3: Add the new CSS block to `public/top-sites.html`**

Open `public/top-sites.html`. Find the closing `</style>` tag (around line 453). Insert this block **before** the `</style>` (so it overrides earlier rules where they conflict):

```css

/* ══════════════════════════════════════════════
   ── LISTICLE REDESIGN (2026-05-22) ──
   ══════════════════════════════════════════════ */

/* ── 2-column wrap (listicle + sticky banner) ─── */
.ts-listicle-wrap {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 28px;
  align-items: start;
  margin-bottom: 48px;
}
@media (max-width: 1179px) { .ts-listicle-wrap { grid-template-columns: 1fr 240px; gap: 20px; } }
@media (max-width: 899px)  { .ts-listicle-wrap { grid-template-columns: 1fr; } }

/* ── Card override: extra left padding for floating rank circle,
       top padding so the badge pill doesn't overlap blurb content ─── */
.ts-card { padding-top: 36px; padding-left: 40px; }
@media (max-width: 859px) { .ts-card { padding-left: 24px; padding-top: 56px; } }

/* ── Card body grid: brand col + features + score+CTA ─── */
.ts-card-body {
  grid-template-columns: 170px 1fr 240px;
}
@media (max-width: 1179px) { .ts-card-body { grid-template-columns: 150px 1fr 220px; gap: 20px; } }
@media (max-width: 859px)  { .ts-card-body { grid-template-columns: 1fr; gap: 18px; } }

/* ── Rank circle (floats off left edge of card) ─── */
.ts-rank {
  position: absolute;
  left: -22px; top: 50%; transform: translateY(-50%);
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, #F17BB6, #db2777);
  color: #fff; font-size: 22px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 16px rgba(241,123,182,0.35);
  z-index: 2;
  font-family: inherit;
}
@media (max-width: 859px) {
  .ts-rank {
    position: absolute; left: 50%; top: -22px; transform: translateX(-50%);
  }
}

/* ── Category badge pill (cards 1–3 only) ─── */
.ts-cat-badge {
  position: absolute;
  top: -14px; left: 60px;
  background: linear-gradient(90deg, #F17BB6, #db2777);
  color: #fff;
  font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
  padding: 6px 14px; border-radius: 999px;
  box-shadow: 0 4px 12px rgba(241,123,182,0.35);
  display: inline-flex; align-items: center; gap: 6px;
  white-space: nowrap;
  z-index: 2;
}
@media (max-width: 859px) {
  .ts-cat-badge { left: 50%; transform: translateX(-50%); top: 12px; }
}

/* ── New score row (replaces .ts-score-ring) ─── */
.ts-score-row {
  display: flex; align-items: center; gap: 12px;
  justify-content: center;
}
.ts-score-box {
  background: #fff5fa;
  border: 1px solid rgba(241,123,182,0.25);
  border-radius: 12px;
  padding: 6px 12px;
  font-size: 22px; font-weight: 800; color: #1a0e15;
  flex: 0 0 auto; line-height: 1;
  min-width: 56px; text-align: center;
}
.ts-score-meta { display: flex; flex-direction: column; gap: 2px; line-height: 1.15; }
.ts-score-tier { font-size: 13px; font-weight: 800; color: #1a0e15; }
.ts-score-stars { color: #facc15; font-size: 12px; letter-spacing: 0.5px; }
.ts-score-votes { font-size: 10px; color: #8a6273; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; }
.ts-card-featured .ts-score-box { box-shadow: 0 0 18px rgba(241,123,182,0.20); }

/* ── Side banner (sticky right column) ─── */
.ts-banner {
  position: sticky; top: 20px;
  background: #fff;
  border: 1.5px solid #F17BB6;
  border-radius: 16px;
  padding: 18px 16px 20px;
  box-shadow: 0 20px 60px rgba(241,123,182,0.18);
  text-align: center;
}
.ts-banner-brand {
  font-size: 16px; font-weight: 800; color: #1a0e15;
  margin: 0 0 12px;
}
.ts-banner-brand .ts-brand-tld { color: #F17BB6; }
.ts-banner-img {
  width: 100%; aspect-ratio: 4 / 5; object-fit: cover;
  border-radius: 12px; margin-bottom: 14px;
  display: block;
}
.ts-banner-label {
  font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
  color: #8a6273;
}
.ts-banner-deal {
  font-size: 26px; font-weight: 800; color: #db2777;
  margin: 4px 0 14px; letter-spacing: -0.01em; line-height: 1;
}
.ts-banner-cta {
  display: block; width: 100%;
  background: linear-gradient(90deg, #F17BB6, #db2777);
  color: #fff; border: none; border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.2s;
}
.ts-banner-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(241,123,182,0.4); }

/* ── Best Overall closing card ─── */
.ts-best-overall {
  position: relative;
  margin: 48px 0 56px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(241,123,182,0.10);
}
.ts-best-overall-bar {
  background: linear-gradient(90deg, #F17BB6, #db2777);
  color: #fff; text-align: center;
  padding: 14px 16px;
  font-size: 14px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase;
}
.ts-best-overall .ts-card-body {
  display: grid;
  grid-template-columns: 170px 1fr 240px;
  gap: 24px;
  align-items: center;
  padding: 26px 24px;
}
@media (max-width: 1179px) {
  .ts-best-overall .ts-card-body { grid-template-columns: 150px 1fr 220px; gap: 20px; }
}
@media (max-width: 859px) {
  .ts-best-overall .ts-card-body { grid-template-columns: 1fr; gap: 18px; padding: 22px 20px; }
}

/* ── FAQ layout: single column (sidebar removed) ─── */
.ts-faq-layout { grid-template-columns: 1fr; }
.ts-sidebar { display: none; }

/* ── Lovescape & GirlfriendGPT wordmark styles ─── */
.ts-brand-lovescape {
  font-family: 'Arial Black', system-ui, sans-serif;
  font-weight: 900;
  font-size: 18px;
  letter-spacing: 0.04em;
  color: #1a0e15;
  text-transform: uppercase;
}
.ts-brand-lovescape::after {
  content: '|';
  color: #F17BB6;
  margin-left: 2px;
  animation: ts-blink 1.2s steps(2) infinite;
}
@keyframes ts-blink { 50% { opacity: 0; } }
.ts-brand-gfgpt {
  font-size: 18px; font-weight: 800; color: #db2777;
  display: inline-flex; align-items: center; gap: 4px;
}
.ts-brand-gfgpt::before { content: '💧'; font-size: 16px; }
```

- [ ] **Step 1.4: Reload the page and verify nothing visually broke**

The new CSS is additive (the only override is `.ts-faq-layout` going to single column, which collapses the sidebar — but we'll remove the sidebar's markup in a later step). Reload `http://localhost:3000/top-sites`.

Expected: existing 3-card listicle still renders. The right sidebar (Top 3 Sites In 2026) below the listicle now flows under the FAQ as a hidden element (`display: none`). Console clean.

If anything looks broken, fix the offending CSS before moving on.

- [ ] **Step 1.5: Restructure the listicle HTML — wrap in 2-column container**

In `public/top-sites.html`, locate the meta row and the `.ts-cards` block (around lines 516–627). Wrap the `.ts-cards` block in a new 2-column container and add the new banner. Replace from the meta-row line up to and including the closing `</div>` of `.ts-cards`:

**Find:**

```html
  <!-- ── Meta row ───────────────────────────────────────── -->
  <div class="ts-meta">
    <span class="ts-meta-updated">Updated for May 2026</span>
    <span>Advertising Disclosure | We receive fees from partners that influence rating listings</span>
  </div>

  <!-- ── Main review cards ──────────────────────────────── -->
  <div class="ts-cards" id="reviews">
```

**Replace with:**

```html
  <!-- ── Meta row ───────────────────────────────────────── -->
  <div class="ts-meta">
    <span class="ts-meta-updated">Updated for May 2026</span>
    <span>Advertising Disclosure | We receive fees from partners that influence rating listings</span>
  </div>

  <!-- ── Listicle + sticky side banner ──────────────────── -->
  <div class="ts-listicle-wrap">
  <div class="ts-cards" id="reviews">
```

Then, find the closing `</div>` of `.ts-cards` (right before the `<!-- ── Your Ideal AI Girlfriend ─── -->` comment) and replace:

**Find:**

```html
  </div>

  <!-- ── Your Ideal AI Girlfriend ─────────────────────────── -->
```

**Replace with:**

```html
  </div><!-- /.ts-cards -->

  <aside class="ts-banner">
    <p class="ts-banner-brand">ourdream<span class="ts-brand-tld">.ai</span></p>
    <img src="/female.webp" alt="" class="ts-banner-img" loading="lazy" decoding="async">
    <div class="ts-banner-label">Special Offer</div>
    <div class="ts-banner-deal">75% Saving</div>
    <button class="ts-banner-cta" data-cta="ourdream-banner">Get Started</button>
  </aside>
  </div><!-- /.ts-listicle-wrap -->

  <!-- ── Your Ideal AI Girlfriend ─────────────────────────── -->
```

- [ ] **Step 1.6: Reload and verify the 2-column layout**

Reload `http://localhost:3000/top-sites` at 1440×900. Expected:
- Listicle cards on the left, side banner on the right (with `/female.webp` image + "75% Saving" + "Get Started" button)
- Banner is sticky when scrolling past the cards
- At 768×1024 the banner is hidden

If layout is broken, double-check the `.ts-listicle-wrap` open/close tags.

- [ ] **Step 1.7: Replace Card #1 (ourdream) — add rank circle, new badge, new score row**

In `public/top-sites.html`, find the existing Card #1 markup (`<!-- Card #1 — OurDream (featured) -->`). Replace the entire `<article>...</article>` block for Card #1 with:

```html
    <!-- Card #1 — OurDream (featured) -->
    <article class="ts-card ts-card-featured">
      <div class="ts-rank" aria-hidden="true">1</div>
      <span class="ts-cat-badge">✨ Most Realistic Experience</span>
      <div class="ts-card-body">
        <div class="ts-brand-col">
          <div class="ts-brand-logo">
            <svg class="ts-brand-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <linearGradient id="od-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#f9a8d4"/>
                  <stop offset="100%" stop-color="#F17BB6"/>
                </linearGradient>
              </defs>
              <path d="M8 18 C 8 14, 12 12, 14 14 C 16 12, 20 14, 20 18 C 20 22, 14 26, 14 26 C 14 26, 8 22, 8 18 Z" fill="url(#od-grad)"/>
              <ellipse cx="22" cy="12" rx="6" ry="3.5" fill="url(#od-grad)" opacity="0.85"/>
              <ellipse cx="16" cy="9" rx="5" ry="2.8" fill="url(#od-grad)" opacity="0.7"/>
            </svg>
            <span>ourdream<span class="ts-brand-tld">.ai</span></span>
          </div>
          <div class="ts-brand-stars">★★★★★</div>
          <a class="ts-brand-review">Read Review</a>
        </div>

        <div class="ts-blurb">
          <p class="ts-blurb-title">Top choice for those seeking highly personalized AI companions with a spicy flavor</p>
          <ul class="ts-blurb-list">
            <li>Special offer: 75% saving</li>
            <li>The ultimate AI chat experience</li>
            <li>Create your dream companion and bring your imagination to life</li>
          </ul>
        </div>

        <div class="ts-score-col">
          <div class="ts-score-row">
            <div class="ts-score-box">9.9</div>
            <div class="ts-score-meta">
              <span class="ts-score-tier">Top-Rated</span>
              <span class="ts-score-stars">★★★★★</span>
              <span class="ts-score-votes">User Votes</span>
            </div>
          </div>
          <button class="ts-card-cta" data-cta="ourdream">Visit Site</button>
        </div>
      </div>
    </article>
```

- [ ] **Step 1.8: Replace Card #2 (candy)**

Find the existing Card #2 markup. Replace the entire `<article>...</article>` block with:

```html
    <!-- Card #2 — candy.ai -->
    <article class="ts-card">
      <div class="ts-rank" aria-hidden="true">2</div>
      <span class="ts-cat-badge">✨ Top Pick by Users</span>
      <div class="ts-card-body">
        <div class="ts-brand-col">
          <div class="ts-brand-logo ts-brand-logo-candy">
            <span aria-hidden="true" style="font-size:24px">💝</span>
            <span>candy<span class="ts-brand-tld">.ai</span></span>
          </div>
          <div class="ts-brand-stars">★★★★☆</div>
          <a class="ts-brand-review">Read Review</a>
        </div>

        <div class="ts-blurb">
          <p class="ts-blurb-title">Leading AI platform for immersive experiences & uncensored pleasure</p>
          <ul class="ts-blurb-list">
            <li>Exclusive discount: Up to 70% off</li>
            <li>Create your dream AI girlfriend tailored to your exact preferences</li>
          </ul>
        </div>

        <div class="ts-score-col">
          <div class="ts-score-row">
            <div class="ts-score-box">9.4</div>
            <div class="ts-score-meta">
              <span class="ts-score-tier">Excellent</span>
              <span class="ts-score-stars">★★★★★</span>
              <span class="ts-score-votes">User Votes</span>
            </div>
          </div>
          <button class="ts-card-cta" data-cta="candy">Visit Site</button>
        </div>
      </div>
    </article>
```

- [ ] **Step 1.9: Replace Card #3 (Joi)**

Find the existing Card #3 markup. Replace the entire `<article>...</article>` block with:

```html
    <!-- Card #3 — Joi AI -->
    <article class="ts-card">
      <div class="ts-rank" aria-hidden="true">3</div>
      <span class="ts-cat-badge">✨ Most Flirty</span>
      <div class="ts-card-body">
        <div class="ts-brand-col">
          <div class="ts-brand-logo">
            <span aria-hidden="true" style="font-size:24px;color:#a855f7">👁️</span>
            <span>Joi <span class="ts-brand-tld" style="color:#a855f7">AI</span></span>
          </div>
          <div class="ts-brand-stars">★★★★☆</div>
          <a class="ts-brand-review">Read Review</a>
        </div>

        <div class="ts-blurb">
          <p class="ts-blurb-title">Where imagination comes to life with deep emotions & connections</p>
          <ul class="ts-blurb-list">
            <li>Top deal: 70% off for first purchase</li>
            <li>Enjoy playful conversations and company with AI 24/7</li>
          </ul>
        </div>

        <div class="ts-score-col">
          <div class="ts-score-row">
            <div class="ts-score-box">8.7</div>
            <div class="ts-score-meta">
              <span class="ts-score-tier">Very Good</span>
              <span class="ts-score-stars">★★★★☆</span>
              <span class="ts-score-votes">User Votes</span>
            </div>
          </div>
          <button class="ts-card-cta" data-cta="joi">Visit Site</button>
        </div>
      </div>
    </article>
```

- [ ] **Step 1.10: Add Card #4 (Lovescape) and Card #5 (GirlfriendGPT)**

After the closing `</article>` of Card #3 (still inside `.ts-cards`), append:

```html
    <!-- Card #4 — Lovescape -->
    <article class="ts-card">
      <div class="ts-rank" aria-hidden="true">4</div>
      <div class="ts-card-body">
        <div class="ts-brand-col">
          <div class="ts-brand-logo">
            <span class="ts-brand-lovescape">Lovescape</span>
          </div>
          <div class="ts-brand-stars">★★★★☆</div>
          <a class="ts-brand-review">Read Review</a>
        </div>

        <div class="ts-blurb">
          <p class="ts-blurb-title">Match your mood with an AI companion designed to follow your lead</p>
          <ul class="ts-blurb-list">
            <li>Special discount: Up to 70% Off</li>
            <li>Matches your every mood — sweet, playful, or adventurous</li>
          </ul>
        </div>

        <div class="ts-score-col">
          <div class="ts-score-row">
            <div class="ts-score-box">8.5</div>
            <div class="ts-score-meta">
              <span class="ts-score-tier">Very Good</span>
              <span class="ts-score-stars">★★★★☆</span>
              <span class="ts-score-votes">User Votes</span>
            </div>
          </div>
          <button class="ts-card-cta" data-cta="lovescape">Visit Site</button>
        </div>
      </div>
    </article>

    <!-- Card #5 — GirlfriendGPT -->
    <article class="ts-card">
      <div class="ts-rank" aria-hidden="true">5</div>
      <div class="ts-card-body">
        <div class="ts-brand-col">
          <div class="ts-brand-logo">
            <span class="ts-brand-gfgpt">GirlfriendGPT</span>
          </div>
          <div class="ts-brand-stars">★★★★☆</div>
          <a class="ts-brand-review">Read Review</a>
        </div>

        <div class="ts-blurb">
          <p class="ts-blurb-title">Interactive AI companion experience with chat plus dynamic visual generation</p>
          <ul class="ts-blurb-list">
            <li>Best offer: Save 34% by going annual</li>
            <li>The most immersive experience featuring chat and dynamic visual generation</li>
          </ul>
        </div>

        <div class="ts-score-col">
          <div class="ts-score-row">
            <div class="ts-score-box">8.3</div>
            <div class="ts-score-meta">
              <span class="ts-score-tier">Very Good</span>
              <span class="ts-score-stars">★★★★☆</span>
              <span class="ts-score-votes">User Votes</span>
            </div>
          </div>
          <button class="ts-card-cta" data-cta="girlfriendgpt">Visit Site</button>
        </div>
      </div>
    </article>
```

- [ ] **Step 1.11: Replace the "Offer Of The Month" section with "Best Overall" closing card**

Find the existing `<section class="ts-offer">...</section>` block (around lines 636–676). Replace the entire block with:

```html
  <!-- ── Best Overall closing card ────────────────────────── -->
  <section class="ts-best-overall">
    <div class="ts-best-overall-bar">🏆 Best Overall</div>
    <div class="ts-card-body">
      <div class="ts-brand-col">
        <div class="ts-brand-logo">
          <svg class="ts-brand-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="od-grad-best" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#f9a8d4"/>
                <stop offset="100%" stop-color="#F17BB6"/>
              </linearGradient>
            </defs>
            <path d="M8 18 C 8 14, 12 12, 14 14 C 16 12, 20 14, 20 18 C 20 22, 14 26, 14 26 C 14 26, 8 22, 8 18 Z" fill="url(#od-grad-best)"/>
            <ellipse cx="22" cy="12" rx="6" ry="3.5" fill="url(#od-grad-best)" opacity="0.85"/>
            <ellipse cx="16" cy="9" rx="5" ry="2.8" fill="url(#od-grad-best)" opacity="0.7"/>
          </svg>
          <span>ourdream<span class="ts-brand-tld">.ai</span></span>
        </div>
        <div class="ts-brand-stars">★★★★★</div>
        <a class="ts-brand-review">Read Review</a>
      </div>

      <div class="ts-blurb">
        <p class="ts-blurb-title">The top-rated AI companion platform for personalized, lifelike chat</p>
        <ul class="ts-blurb-list">
          <li>Special offer: 75% saving</li>
          <li>The ultimate AI chat experience</li>
          <li>Create your dream companion and bring your imagination to life</li>
        </ul>
      </div>

      <div class="ts-score-col">
        <div class="ts-score-row">
          <div class="ts-score-box">9.9</div>
          <div class="ts-score-meta">
            <span class="ts-score-tier">Top-Rated</span>
            <span class="ts-score-stars">★★★★★</span>
            <span class="ts-score-votes">User Votes</span>
          </div>
        </div>
        <button class="ts-card-cta" data-cta="ourdream-offer">Visit Site</button>
      </div>
    </div>
  </section>
```

- [ ] **Step 1.12: Remove the `.ts-sidebar` aside from inside the FAQ block**

Find the `<aside class="ts-sidebar">...</aside>` block inside `.ts-faq-layout` (around lines 709–735). Delete the entire `<aside>...</aside>` element. The FAQ section now occupies full width (CSS already overridden in Step 1.3).

- [ ] **Step 1.13: Replace the `BRAND_LABELS` JS map**

In `public/top-sites.html`, find the `BRAND_LABELS` object in the `<script>` block (around line 760). Replace it with:

```js
const BRAND_LABELS = {
  'ourdream':         'ourdream',
  'ourdream-top3':    'ourdream',
  'ourdream-offer':   'ourdream',
  'ourdream-banner':  'ourdream',
  'candy':            'candy',
  'candy-top3':       'candy',
  'joi':              'Joi AI',
  'joi-top3':         'Joi AI',
  'lovescape':        'Lovescape',
  'girlfriendgpt':    'GirlfriendGPT',
};
```

The old `*-sidebar` entries are removed because the sidebar widget is deleted in Step 1.12.

- [ ] **Step 1.14: Reload and visually verify the full top-sites.html redesign**

Reload `http://localhost:3000/top-sites`. Use the Playwright MCP tool to screenshot at four viewports:

```
mcp__playwright__browser_resize → 1440 × 900    → screenshot top-sites-1440.png
mcp__playwright__browser_resize → 1024 × 768    → screenshot top-sites-1024.png
mcp__playwright__browser_resize → 768  × 1024   → screenshot top-sites-768.png
mcp__playwright__browser_resize → 375  × 812    → screenshot top-sites-375.png
```

Visually check each screenshot against the spec's card-anatomy diagram. Specifically:
- All 5 ranked cards visible with rank circles (1, 2, 3, 4, 5) floating on the left.
- Cards 1–3 have category badge pills on top-left ("✨ Most Realistic Experience", "✨ Top Pick by Users", "✨ Most Flirty"). Cards 4–5 have no badge.
- Score row reads `9.9 | Top-Rated ★★★★★ User Votes` style (no circular ring).
- Sticky side banner visible at ≥900px, hidden below.
- "🏆 Best Overall" closing card sits between the listicle and the intro/FAQ.
- FAQ takes full width; old sidebar widget is gone.
- At 375px: rank circles centered above each card, badges centered on top, layout single-column.

Also check the browser console (`mcp__playwright__browser_console_messages`) — no JS errors.

- [ ] **Step 1.15: Smoke-test the CTAs**

Click each of these in turn (`mcp__playwright__browser_click`) on the 1440px view and confirm the email-gate popup opens with the correct brand heading:

- Top-3 pill: "ourdream", "candy", "joi" → headings "75% off ourdream", "75% off candy", "75% off Joi AI"
- Listicle CTAs: "ourdream", "candy", "joi", "lovescape", "girlfriendgpt" → headings include each brand name
- Side banner: "ourdream-banner" → "75% off ourdream"
- Best Overall: "ourdream-offer" → "75% off ourdream"

Close the popup between clicks with Escape.

If any popup misses a label or shows `undefined`, double-check the `BRAND_LABELS` map.

- [ ] **Step 1.16: Commit**

```bash
git add public/top-sites.html
git commit -m "$(cat <<'EOF'
Redesign top-sites.html listicle with numbered cards and side banner

Replaces the existing 3-card listicle with a 5-card numbered layout:
ourdream, candy, joi, plus new visual cards for Lovescape and
GirlfriendGPT. Adds a sticky right-column "75% Saving" offer banner
and a "Best Overall" closing card that replaces "Offer Of The Month".

All CTAs still route through the existing email gate to ourdream.ai.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Restyle `public/top-ai-bf-sites.html`

**Files:**
- Modify: `public/top-ai-bf-sites.html` (same shape of CSS additions; HTML restructure with boyfriend-niche copy; banner uses `/male.webp`; badge #3 is "Most Romantic")

---

- [ ] **Step 2.1: Read the current `top-ai-bf-sites.html` to confirm structure parity**

Run:

```bash
diff -q "public/top-sites.html" "public/top-ai-bf-sites.html" | head
```

Then read both files side-by-side at the same line ranges. Expected: the CSS block and overall structure mirror `top-sites.html` exactly; only the copy (titles, blurbs, brand language) and image (`/male.webp` vs `/female.webp`) differ.

This step is read-only and exists to catch any drift between the two files before mirroring changes.

- [ ] **Step 2.2: Insert the same CSS block before `</style>` in `top-ai-bf-sites.html`**

Paste the exact same CSS block from **Step 1.3** of Task 1 (the entire `/* ══ LISTICLE REDESIGN (2026-05-22) ══ */` section) before the closing `</style>` tag in `public/top-ai-bf-sites.html`.

- [ ] **Step 2.3: Wrap the listicle in `.ts-listicle-wrap` and insert the side banner**

Two find-and-replace operations in `public/top-ai-bf-sites.html`. The banner image src is `/male.webp` (the only difference from Task 1).

**Find:**

```html
  <!-- ── Meta row ───────────────────────────────────────── -->
  <div class="ts-meta">
    <span class="ts-meta-updated">Updated for May 2026</span>
    <span>Advertising Disclosure | We receive fees from partners that influence rating listings</span>
  </div>

  <!-- ── Main review cards ──────────────────────────────── -->
  <div class="ts-cards" id="reviews">
```

**Replace with:**

```html
  <!-- ── Meta row ───────────────────────────────────────── -->
  <div class="ts-meta">
    <span class="ts-meta-updated">Updated for May 2026</span>
    <span>Advertising Disclosure | We receive fees from partners that influence rating listings</span>
  </div>

  <!-- ── Listicle + sticky side banner ──────────────────── -->
  <div class="ts-listicle-wrap">
  <div class="ts-cards" id="reviews">
```

Then find the closing `</div>` of `.ts-cards` (right before the next major comment block):

**Find:**

```html
  </div>

  <!-- ── Your Ideal AI Boyfriend ─────────────────────────── -->
```

(The exact comment may say "Your Ideal AI Boyfriend" or similar — match what's currently in the file.)

**Replace with:**

```html
  </div><!-- /.ts-cards -->

  <aside class="ts-banner">
    <p class="ts-banner-brand">ourdream<span class="ts-brand-tld">.ai</span></p>
    <img src="/male.webp" alt="" class="ts-banner-img" loading="lazy" decoding="async">
    <div class="ts-banner-label">Special Offer</div>
    <div class="ts-banner-deal">75% Saving</div>
    <button class="ts-banner-cta" data-cta="ourdream-banner">Get Started</button>
  </aside>
  </div><!-- /.ts-listicle-wrap -->

  <!-- ── Your Ideal AI Boyfriend ─────────────────────────── -->
```

- [ ] **Step 2.4: Replace Card #1 (ourdream) on the boyfriend page**

Same shape as **Step 1.7**, but mirror the existing page's boyfriend-niche copy. Replace the Card #1 `<article>` with:

```html
    <!-- Card #1 — OurDream (featured) -->
    <article class="ts-card ts-card-featured">
      <div class="ts-rank" aria-hidden="true">1</div>
      <span class="ts-cat-badge">✨ Most Realistic Experience</span>
      <div class="ts-card-body">
        <div class="ts-brand-col">
          <div class="ts-brand-logo">
            <svg class="ts-brand-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <linearGradient id="od-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#f9a8d4"/>
                  <stop offset="100%" stop-color="#F17BB6"/>
                </linearGradient>
              </defs>
              <path d="M8 18 C 8 14, 12 12, 14 14 C 16 12, 20 14, 20 18 C 20 22, 14 26, 14 26 C 14 26, 8 22, 8 18 Z" fill="url(#od-grad)"/>
              <ellipse cx="22" cy="12" rx="6" ry="3.5" fill="url(#od-grad)" opacity="0.85"/>
              <ellipse cx="16" cy="9" rx="5" ry="2.8" fill="url(#od-grad)" opacity="0.7"/>
            </svg>
            <span>ourdream<span class="ts-brand-tld">.ai</span></span>
          </div>
          <div class="ts-brand-stars">★★★★★</div>
          <a class="ts-brand-review">Read Review</a>
        </div>

        <div class="ts-blurb">
          <p class="ts-blurb-title">Top choice for those seeking highly personalized AI boyfriends with a spicy flavor</p>
          <ul class="ts-blurb-list">
            <li>Special offer: 75% saving</li>
            <li>The ultimate AI chat experience</li>
            <li>Create your dream boyfriend and bring your imagination to life</li>
          </ul>
        </div>

        <div class="ts-score-col">
          <div class="ts-score-row">
            <div class="ts-score-box">9.9</div>
            <div class="ts-score-meta">
              <span class="ts-score-tier">Top-Rated</span>
              <span class="ts-score-stars">★★★★★</span>
              <span class="ts-score-votes">User Votes</span>
            </div>
          </div>
          <button class="ts-card-cta" data-cta="ourdream">Visit Site</button>
        </div>
      </div>
    </article>
```

- [ ] **Step 2.5: Replace Card #2 (candy) on the boyfriend page**

```html
    <!-- Card #2 — candy.ai -->
    <article class="ts-card">
      <div class="ts-rank" aria-hidden="true">2</div>
      <span class="ts-cat-badge">✨ Top Pick by Users</span>
      <div class="ts-card-body">
        <div class="ts-brand-col">
          <div class="ts-brand-logo ts-brand-logo-candy">
            <span aria-hidden="true" style="font-size:24px">💝</span>
            <span>candy<span class="ts-brand-tld">.ai</span></span>
          </div>
          <div class="ts-brand-stars">★★★★☆</div>
          <a class="ts-brand-review">Read Review</a>
        </div>

        <div class="ts-blurb">
          <p class="ts-blurb-title">Leading AI platform for immersive boyfriend experiences & uncensored pleasure</p>
          <ul class="ts-blurb-list">
            <li>Exclusive discount: Up to 70% off</li>
            <li>Create your dream AI boyfriend tailored to your exact preferences</li>
          </ul>
        </div>

        <div class="ts-score-col">
          <div class="ts-score-row">
            <div class="ts-score-box">9.4</div>
            <div class="ts-score-meta">
              <span class="ts-score-tier">Excellent</span>
              <span class="ts-score-stars">★★★★★</span>
              <span class="ts-score-votes">User Votes</span>
            </div>
          </div>
          <button class="ts-card-cta" data-cta="candy">Visit Site</button>
        </div>
      </div>
    </article>
```

- [ ] **Step 2.6: Replace Card #3 (Joi) on the boyfriend page — badge "Most Romantic"**

```html
    <!-- Card #3 — Joi AI -->
    <article class="ts-card">
      <div class="ts-rank" aria-hidden="true">3</div>
      <span class="ts-cat-badge">✨ Most Romantic</span>
      <div class="ts-card-body">
        <div class="ts-brand-col">
          <div class="ts-brand-logo">
            <span aria-hidden="true" style="font-size:24px;color:#a855f7">👁️</span>
            <span>Joi <span class="ts-brand-tld" style="color:#a855f7">AI</span></span>
          </div>
          <div class="ts-brand-stars">★★★★☆</div>
          <a class="ts-brand-review">Read Review</a>
        </div>

        <div class="ts-blurb">
          <p class="ts-blurb-title">Where imagination comes to life with deep emotions & connections</p>
          <ul class="ts-blurb-list">
            <li>Top deal: 70% off for first purchase</li>
            <li>Enjoy playful conversations and a romantic AI companion 24/7</li>
          </ul>
        </div>

        <div class="ts-score-col">
          <div class="ts-score-row">
            <div class="ts-score-box">8.7</div>
            <div class="ts-score-meta">
              <span class="ts-score-tier">Very Good</span>
              <span class="ts-score-stars">★★★★☆</span>
              <span class="ts-score-votes">User Votes</span>
            </div>
          </div>
          <button class="ts-card-cta" data-cta="joi">Visit Site</button>
        </div>
      </div>
    </article>
```

- [ ] **Step 2.7: Add Card #4 (Lovescape) and Card #5 (GirlfriendGPT) on the boyfriend page**

```html
    <!-- Card #4 — Lovescape -->
    <article class="ts-card">
      <div class="ts-rank" aria-hidden="true">4</div>
      <div class="ts-card-body">
        <div class="ts-brand-col">
          <div class="ts-brand-logo">
            <span class="ts-brand-lovescape">Lovescape</span>
          </div>
          <div class="ts-brand-stars">★★★★☆</div>
          <a class="ts-brand-review">Read Review</a>
        </div>

        <div class="ts-blurb">
          <p class="ts-blurb-title">Match your mood with an AI boyfriend designed to follow your lead</p>
          <ul class="ts-blurb-list">
            <li>Special discount: Up to 70% Off</li>
            <li>Matches your every mood — sweet, playful, or adventurous</li>
          </ul>
        </div>

        <div class="ts-score-col">
          <div class="ts-score-row">
            <div class="ts-score-box">8.5</div>
            <div class="ts-score-meta">
              <span class="ts-score-tier">Very Good</span>
              <span class="ts-score-stars">★★★★☆</span>
              <span class="ts-score-votes">User Votes</span>
            </div>
          </div>
          <button class="ts-card-cta" data-cta="lovescape">Visit Site</button>
        </div>
      </div>
    </article>

    <!-- Card #5 — GirlfriendGPT (presented as a chat-only AI on this page) -->
    <article class="ts-card">
      <div class="ts-rank" aria-hidden="true">5</div>
      <div class="ts-card-body">
        <div class="ts-brand-col">
          <div class="ts-brand-logo">
            <span class="ts-brand-gfgpt">GirlfriendGPT</span>
          </div>
          <div class="ts-brand-stars">★★★★☆</div>
          <a class="ts-brand-review">Read Review</a>
        </div>

        <div class="ts-blurb">
          <p class="ts-blurb-title">Interactive AI companion experience with chat plus dynamic visual generation</p>
          <ul class="ts-blurb-list">
            <li>Best offer: Save 34% by going annual</li>
            <li>The most immersive experience featuring chat and dynamic visual generation</li>
          </ul>
        </div>

        <div class="ts-score-col">
          <div class="ts-score-row">
            <div class="ts-score-box">8.3</div>
            <div class="ts-score-meta">
              <span class="ts-score-tier">Very Good</span>
              <span class="ts-score-stars">★★★★☆</span>
              <span class="ts-score-votes">User Votes</span>
            </div>
          </div>
          <button class="ts-card-cta" data-cta="girlfriendgpt">Visit Site</button>
        </div>
      </div>
    </article>
```

- [ ] **Step 2.8: Replace `.ts-offer` with "Best Overall" closing card on the boyfriend page**

Mirror **Step 1.11** but use boyfriend-niche blurb copy:

```html
  <!-- ── Best Overall closing card ────────────────────────── -->
  <section class="ts-best-overall">
    <div class="ts-best-overall-bar">🏆 Best Overall</div>
    <div class="ts-card-body">
      <div class="ts-brand-col">
        <div class="ts-brand-logo">
          <svg class="ts-brand-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="od-grad-best" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#f9a8d4"/>
                <stop offset="100%" stop-color="#F17BB6"/>
              </linearGradient>
            </defs>
            <path d="M8 18 C 8 14, 12 12, 14 14 C 16 12, 20 14, 20 18 C 20 22, 14 26, 14 26 C 14 26, 8 22, 8 18 Z" fill="url(#od-grad-best)"/>
            <ellipse cx="22" cy="12" rx="6" ry="3.5" fill="url(#od-grad-best)" opacity="0.85"/>
            <ellipse cx="16" cy="9" rx="5" ry="2.8" fill="url(#od-grad-best)" opacity="0.7"/>
          </svg>
          <span>ourdream<span class="ts-brand-tld">.ai</span></span>
        </div>
        <div class="ts-brand-stars">★★★★★</div>
        <a class="ts-brand-review">Read Review</a>
      </div>

      <div class="ts-blurb">
        <p class="ts-blurb-title">The top-rated AI boyfriend platform for personalized, lifelike chat</p>
        <ul class="ts-blurb-list">
          <li>Special offer: 75% saving</li>
          <li>The ultimate AI chat experience</li>
          <li>Create your dream boyfriend and bring your imagination to life</li>
        </ul>
      </div>

      <div class="ts-score-col">
        <div class="ts-score-row">
          <div class="ts-score-box">9.9</div>
          <div class="ts-score-meta">
            <span class="ts-score-tier">Top-Rated</span>
            <span class="ts-score-stars">★★★★★</span>
            <span class="ts-score-votes">User Votes</span>
          </div>
        </div>
        <button class="ts-card-cta" data-cta="ourdream-offer">Visit Site</button>
      </div>
    </div>
  </section>
```

- [ ] **Step 2.9: Remove the `.ts-sidebar` aside on the boyfriend page**

Delete the `<aside class="ts-sidebar">...</aside>` block inside `.ts-faq-layout`. Same as **Step 1.12**.

- [ ] **Step 2.10: Replace the `BRAND_LABELS` JS map**

In `public/top-ai-bf-sites.html`, replace the `BRAND_LABELS` object in the `<script>` block with:

```js
const BRAND_LABELS = {
  'ourdream':         'ourdream',
  'ourdream-top3':    'ourdream',
  'ourdream-offer':   'ourdream',
  'ourdream-banner':  'ourdream',
  'candy':            'candy',
  'candy-top3':       'candy',
  'joi':              'Joi AI',
  'joi-top3':         'Joi AI',
  'lovescape':        'Lovescape',
  'girlfriendgpt':    'GirlfriendGPT',
};
```

- [ ] **Step 2.11: Visually verify and smoke-test the boyfriend page**

Repeat **Steps 1.14 and 1.15** for `http://localhost:3000/top-ai-bf-sites`:
- Screenshot at 1440, 1024, 768, 375
- Confirm side banner uses `/male.webp`
- Confirm card #3 badge reads "✨ Most Romantic"
- Smoke-test every CTA opens the email gate with the correct brand label

- [ ] **Step 2.12: Commit**

```bash
git add public/top-ai-bf-sites.html
git commit -m "$(cat <<'EOF'
Redesign top-ai-bf-sites.html listicle to match top-sites layout

Mirrors the numbered 5-card listicle, sticky banner (with male.webp),
and Best Overall closing card from top-sites.html. Card #3 badge reads
"Most Romantic" to fit the boyfriend niche.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Restyle `public/top-gay-ai-sites.html`

**Files:**
- Modify: `public/top-gay-ai-sites.html` (same shape; gay-AI-niche copy; banner uses `/female.webp` per spec note; badge #3 is "Most Adventurous")

---

- [ ] **Step 3.1: Read the current `top-gay-ai-sites.html` to confirm structure parity**

```bash
diff -q "public/top-sites.html" "public/top-gay-ai-sites.html" | head
```

Skim both files at the same line ranges. The structure should mirror `top-sites.html`; only copy differs.

- [ ] **Step 3.2: Insert the same CSS block before `</style>` in `top-gay-ai-sites.html`**

Paste the same CSS block from **Step 1.3**.

- [ ] **Step 3.3: Wrap the listicle in `.ts-listicle-wrap` and insert the side banner**

Two find-and-replace operations in `public/top-gay-ai-sites.html`. Banner image is `/female.webp` per the spec.

**Find:**

```html
  <!-- ── Meta row ───────────────────────────────────────── -->
  <div class="ts-meta">
    <span class="ts-meta-updated">Updated for May 2026</span>
    <span>Advertising Disclosure | We receive fees from partners that influence rating listings</span>
  </div>

  <!-- ── Main review cards ──────────────────────────────── -->
  <div class="ts-cards" id="reviews">
```

**Replace with:**

```html
  <!-- ── Meta row ───────────────────────────────────────── -->
  <div class="ts-meta">
    <span class="ts-meta-updated">Updated for May 2026</span>
    <span>Advertising Disclosure | We receive fees from partners that influence rating listings</span>
  </div>

  <!-- ── Listicle + sticky side banner ──────────────────── -->
  <div class="ts-listicle-wrap">
  <div class="ts-cards" id="reviews">
```

Then find the closing `</div>` of `.ts-cards` (right before the next major comment block, likely "Your Ideal AI Companion" or similar):

**Find:**

```html
  </div>

  <!-- ── Your Ideal AI
```

(Match the exact comment text in the file when locating the position.)

**Replace with:**

```html
  </div><!-- /.ts-cards -->

  <aside class="ts-banner">
    <p class="ts-banner-brand">ourdream<span class="ts-brand-tld">.ai</span></p>
    <img src="/female.webp" alt="" class="ts-banner-img" loading="lazy" decoding="async">
    <div class="ts-banner-label">Special Offer</div>
    <div class="ts-banner-deal">75% Saving</div>
    <button class="ts-banner-cta" data-cta="ourdream-banner">Get Started</button>
  </aside>
  </div><!-- /.ts-listicle-wrap -->

  <!-- ── Your Ideal AI
```

(Restore the original comment text so the rest of the document is unchanged.)

- [ ] **Step 3.4: Replace Card #1 (ourdream) on the gay AI page**

```html
    <!-- Card #1 — OurDream (featured) -->
    <article class="ts-card ts-card-featured">
      <div class="ts-rank" aria-hidden="true">1</div>
      <span class="ts-cat-badge">✨ Most Realistic Experience</span>
      <div class="ts-card-body">
        <div class="ts-brand-col">
          <div class="ts-brand-logo">
            <svg class="ts-brand-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <linearGradient id="od-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#f9a8d4"/>
                  <stop offset="100%" stop-color="#F17BB6"/>
                </linearGradient>
              </defs>
              <path d="M8 18 C 8 14, 12 12, 14 14 C 16 12, 20 14, 20 18 C 20 22, 14 26, 14 26 C 14 26, 8 22, 8 18 Z" fill="url(#od-grad)"/>
              <ellipse cx="22" cy="12" rx="6" ry="3.5" fill="url(#od-grad)" opacity="0.85"/>
              <ellipse cx="16" cy="9" rx="5" ry="2.8" fill="url(#od-grad)" opacity="0.7"/>
            </svg>
            <span>ourdream<span class="ts-brand-tld">.ai</span></span>
          </div>
          <div class="ts-brand-stars">★★★★★</div>
          <a class="ts-brand-review">Read Review</a>
        </div>

        <div class="ts-blurb">
          <p class="ts-blurb-title">Top choice for those seeking highly personalized gay AI companions</p>
          <ul class="ts-blurb-list">
            <li>Special offer: 75% saving</li>
            <li>The ultimate AI chat experience</li>
            <li>Create your dream companion and bring your imagination to life</li>
          </ul>
        </div>

        <div class="ts-score-col">
          <div class="ts-score-row">
            <div class="ts-score-box">9.9</div>
            <div class="ts-score-meta">
              <span class="ts-score-tier">Top-Rated</span>
              <span class="ts-score-stars">★★★★★</span>
              <span class="ts-score-votes">User Votes</span>
            </div>
          </div>
          <button class="ts-card-cta" data-cta="ourdream">Visit Site</button>
        </div>
      </div>
    </article>
```

- [ ] **Step 3.5: Replace Card #2 (candy) on the gay AI page**

```html
    <!-- Card #2 — candy.ai -->
    <article class="ts-card">
      <div class="ts-rank" aria-hidden="true">2</div>
      <span class="ts-cat-badge">✨ Top Pick by Users</span>
      <div class="ts-card-body">
        <div class="ts-brand-col">
          <div class="ts-brand-logo ts-brand-logo-candy">
            <span aria-hidden="true" style="font-size:24px">💝</span>
            <span>candy<span class="ts-brand-tld">.ai</span></span>
          </div>
          <div class="ts-brand-stars">★★★★☆</div>
          <a class="ts-brand-review">Read Review</a>
        </div>

        <div class="ts-blurb">
          <p class="ts-blurb-title">Leading AI platform for immersive gay AI experiences & uncensored pleasure</p>
          <ul class="ts-blurb-list">
            <li>Exclusive discount: Up to 70% off</li>
            <li>Create your dream AI companion tailored to your exact preferences</li>
          </ul>
        </div>

        <div class="ts-score-col">
          <div class="ts-score-row">
            <div class="ts-score-box">9.4</div>
            <div class="ts-score-meta">
              <span class="ts-score-tier">Excellent</span>
              <span class="ts-score-stars">★★★★★</span>
              <span class="ts-score-votes">User Votes</span>
            </div>
          </div>
          <button class="ts-card-cta" data-cta="candy">Visit Site</button>
        </div>
      </div>
    </article>
```

- [ ] **Step 3.6: Replace Card #3 (Joi) on the gay AI page — badge "Most Adventurous"**

```html
    <!-- Card #3 — Joi AI -->
    <article class="ts-card">
      <div class="ts-rank" aria-hidden="true">3</div>
      <span class="ts-cat-badge">✨ Most Adventurous</span>
      <div class="ts-card-body">
        <div class="ts-brand-col">
          <div class="ts-brand-logo">
            <span aria-hidden="true" style="font-size:24px;color:#a855f7">👁️</span>
            <span>Joi <span class="ts-brand-tld" style="color:#a855f7">AI</span></span>
          </div>
          <div class="ts-brand-stars">★★★★☆</div>
          <a class="ts-brand-review">Read Review</a>
        </div>

        <div class="ts-blurb">
          <p class="ts-blurb-title">Where imagination comes to life with deep emotions & connections</p>
          <ul class="ts-blurb-list">
            <li>Top deal: 70% off for first purchase</li>
            <li>Enjoy adventurous conversations and AI companionship 24/7</li>
          </ul>
        </div>

        <div class="ts-score-col">
          <div class="ts-score-row">
            <div class="ts-score-box">8.7</div>
            <div class="ts-score-meta">
              <span class="ts-score-tier">Very Good</span>
              <span class="ts-score-stars">★★★★☆</span>
              <span class="ts-score-votes">User Votes</span>
            </div>
          </div>
          <button class="ts-card-cta" data-cta="joi">Visit Site</button>
        </div>
      </div>
    </article>
```

- [ ] **Step 3.7: Add Card #4 (Lovescape) and Card #5 (GirlfriendGPT) on the gay AI page**

```html
    <!-- Card #4 — Lovescape -->
    <article class="ts-card">
      <div class="ts-rank" aria-hidden="true">4</div>
      <div class="ts-card-body">
        <div class="ts-brand-col">
          <div class="ts-brand-logo">
            <span class="ts-brand-lovescape">Lovescape</span>
          </div>
          <div class="ts-brand-stars">★★★★☆</div>
          <a class="ts-brand-review">Read Review</a>
        </div>

        <div class="ts-blurb">
          <p class="ts-blurb-title">Match your mood with an AI companion designed to follow your lead</p>
          <ul class="ts-blurb-list">
            <li>Special discount: Up to 70% Off</li>
            <li>Matches your every mood — sweet, playful, or adventurous</li>
          </ul>
        </div>

        <div class="ts-score-col">
          <div class="ts-score-row">
            <div class="ts-score-box">8.5</div>
            <div class="ts-score-meta">
              <span class="ts-score-tier">Very Good</span>
              <span class="ts-score-stars">★★★★☆</span>
              <span class="ts-score-votes">User Votes</span>
            </div>
          </div>
          <button class="ts-card-cta" data-cta="lovescape">Visit Site</button>
        </div>
      </div>
    </article>

    <!-- Card #5 — GirlfriendGPT -->
    <article class="ts-card">
      <div class="ts-rank" aria-hidden="true">5</div>
      <div class="ts-card-body">
        <div class="ts-brand-col">
          <div class="ts-brand-logo">
            <span class="ts-brand-gfgpt">GirlfriendGPT</span>
          </div>
          <div class="ts-brand-stars">★★★★☆</div>
          <a class="ts-brand-review">Read Review</a>
        </div>

        <div class="ts-blurb">
          <p class="ts-blurb-title">Interactive AI companion experience with chat plus dynamic visual generation</p>
          <ul class="ts-blurb-list">
            <li>Best offer: Save 34% by going annual</li>
            <li>The most immersive experience featuring chat and dynamic visual generation</li>
          </ul>
        </div>

        <div class="ts-score-col">
          <div class="ts-score-row">
            <div class="ts-score-box">8.3</div>
            <div class="ts-score-meta">
              <span class="ts-score-tier">Very Good</span>
              <span class="ts-score-stars">★★★★☆</span>
              <span class="ts-score-votes">User Votes</span>
            </div>
          </div>
          <button class="ts-card-cta" data-cta="girlfriendgpt">Visit Site</button>
        </div>
      </div>
    </article>
```

- [ ] **Step 3.8: Replace `.ts-offer` with "Best Overall" closing card on the gay AI page**

```html
  <!-- ── Best Overall closing card ────────────────────────── -->
  <section class="ts-best-overall">
    <div class="ts-best-overall-bar">🏆 Best Overall</div>
    <div class="ts-card-body">
      <div class="ts-brand-col">
        <div class="ts-brand-logo">
          <svg class="ts-brand-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="od-grad-best" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#f9a8d4"/>
                <stop offset="100%" stop-color="#F17BB6"/>
              </linearGradient>
            </defs>
            <path d="M8 18 C 8 14, 12 12, 14 14 C 16 12, 20 14, 20 18 C 20 22, 14 26, 14 26 C 14 26, 8 22, 8 18 Z" fill="url(#od-grad-best)"/>
            <ellipse cx="22" cy="12" rx="6" ry="3.5" fill="url(#od-grad-best)" opacity="0.85"/>
            <ellipse cx="16" cy="9" rx="5" ry="2.8" fill="url(#od-grad-best)" opacity="0.7"/>
          </svg>
          <span>ourdream<span class="ts-brand-tld">.ai</span></span>
        </div>
        <div class="ts-brand-stars">★★★★★</div>
        <a class="ts-brand-review">Read Review</a>
      </div>

      <div class="ts-blurb">
        <p class="ts-blurb-title">The top-rated gay AI companion platform for personalized, lifelike chat</p>
        <ul class="ts-blurb-list">
          <li>Special offer: 75% saving</li>
          <li>The ultimate AI chat experience</li>
          <li>Create your dream companion and bring your imagination to life</li>
        </ul>
      </div>

      <div class="ts-score-col">
        <div class="ts-score-row">
          <div class="ts-score-box">9.9</div>
          <div class="ts-score-meta">
            <span class="ts-score-tier">Top-Rated</span>
            <span class="ts-score-stars">★★★★★</span>
            <span class="ts-score-votes">User Votes</span>
          </div>
        </div>
        <button class="ts-card-cta" data-cta="ourdream-offer">Visit Site</button>
      </div>
    </div>
  </section>
```

- [ ] **Step 3.9: Remove the `.ts-sidebar` aside on the gay AI page**

Delete the `<aside class="ts-sidebar">...</aside>` block.

- [ ] **Step 3.10: Replace the `BRAND_LABELS` JS map**

In `public/top-gay-ai-sites.html`, replace the `BRAND_LABELS` object in the `<script>` block with:

```js
const BRAND_LABELS = {
  'ourdream':         'ourdream',
  'ourdream-top3':    'ourdream',
  'ourdream-offer':   'ourdream',
  'ourdream-banner':  'ourdream',
  'candy':            'candy',
  'candy-top3':       'candy',
  'joi':              'Joi AI',
  'joi-top3':         'Joi AI',
  'lovescape':        'Lovescape',
  'girlfriendgpt':    'GirlfriendGPT',
};
```

- [ ] **Step 3.11: Visually verify and smoke-test the gay AI page**

Same as **Step 1.14/1.15**, on `http://localhost:3000/top-gay-ai-sites`.
- Confirm card #3 badge reads "✨ Most Adventurous"
- Smoke-test every CTA

- [ ] **Step 3.12: Commit**

```bash
git add public/top-gay-ai-sites.html
git commit -m "$(cat <<'EOF'
Redesign top-gay-ai-sites.html listicle to match top-sites layout

Mirrors the numbered 5-card listicle and Best Overall closing card.
Card #3 badge reads "Most Adventurous" for the gay AI niche.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Cross-page responsive validation

**Files:** none modified (verification only)

---

- [ ] **Step 4.1: Run a final visual pass across all 3 pages at 4 viewports**

For each of `/top-sites`, `/top-ai-bf-sites`, `/top-gay-ai-sites`, screenshot at 1440×900, 1024×768, 768×1024, 375×812. Inspect:

- Cards 1–5 all render in order with rank circles 1, 2, 3, 4, 5
- Cards 1–3 have the correct page-specific badges; cards 4–5 have no badge
- Side banner sticks while scrolling at ≥900px; hidden at <900px
- "Best Overall" closing card sits between the listicle and the intro
- FAQ section is full-width (no sidebar)
- All gradients are pink (`#F17BB6 → #db2777`); no purple anywhere
- No horizontal scroll at 375px
- No console errors

- [ ] **Step 4.2: Stop the dev server**

```bash
# In the background terminal, Ctrl-C to stop `node server.js`
```

- [ ] **Step 4.3: Final cleanup commit if any tweaks were made**

If Step 4.1 surfaced small issues (alignment, padding tweaks, etc.) and you fixed them in `public/top-sites.html` / `top-ai-bf-sites.html` / `top-gay-ai-sites.html`, commit them:

```bash
git add public/top-sites.html public/top-ai-bf-sites.html public/top-gay-ai-sites.html
git commit -m "$(cat <<'EOF'
Polish listicle responsive layout across all three pages

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

If no tweaks were needed, skip the commit.
