# create_v2 HTML Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current `index.html` quiz on `ourdreamnetwork.com` with a vanilla-HTML port of `create_v2/create-3step-flow.tsx` (Style → Look → Personality), gated by an email-capture screen, then handing off to RedTrack via `clk.ourdreamnetwork.com/click/1` with `sub11=googlecpc` + `clickid` + inbound URL params passed through.

**Architecture:** Single self-contained `index.html` (HTML + inline CSS + inline JS), no build step, deployed as static on Vercel with `framework: null`. Vanilla JS state object + `render()` dispatcher replaces React's `useState`/`useEffect`. Reuses the existing `/api/save-email` endpoint without backend changes by shaping the payload as `mode='companion'`. The current `index.html` is archived as `quiz-old.html` for rollback. SFW-only — no NSFW branch.

**Tech Stack:** Vanilla HTML/CSS/JS, GTM (`GTM-5VRS8QPJ`), Vercel static deploy, existing serverless `api/save-email.js`.

**Spec:** [`docs/superpowers/specs/2026-05-04-create-v2-html-funnel-design.md`](../specs/2026-05-04-create-v2-html-funnel-design.md)

**Note on testing:** This repo has no JS test framework and no CI tests. "TDD" here means **manual browser verification at every step**: open `index.html` in a browser, exercise the new behavior, watch the DevTools console, and confirm the expected output before moving to the next task. Each task ends with a verification step that lists exactly what to check.

---

## File Structure

| File | Action | Purpose |
|---|---|---|
| `index.html` (root) | Replace contents | New 3-step flow + email gate |
| `public/index.html` | Replace contents | Mirror of root (kept in sync, since both serve at `/`) |
| `quiz-old.html` (root) | Create | Archive of previous `index.html` for rollback |
| `create_v2/` | Delete | TSX source no longer needed at runtime |
| `api/save-email.js` | Unchanged | |
| `vercel.json` | Unchanged | |
| `terms.html`, `privacy.html`, favicons | Unchanged | |

The new `index.html` follows the same single-file convention as the current one: `<head>` with GTM + meta + fonts + inline `<style>`, then `<body>` with the ambient bg div, the step container, and an inline `<script>` block holding all data, state, render, and event handlers.

---

## Task 1: Archive current `index.html` as `quiz-old.html`

Create a rollback safety net before changing anything.

**Files:**
- Create: `quiz-old.html` (copy of current `index.html`)

- [ ] **Step 1: Copy the current `index.html` to `quiz-old.html`**

```bash
cp index.html quiz-old.html
```

- [ ] **Step 2: Verify both files are identical**

```bash
diff index.html quiz-old.html
```

Expected: no output (files identical).

- [ ] **Step 3: Verify the archived file serves on Vercel preview after deploy** *(deferred to Task 14 smoke test — for now just confirm the file exists)*

```bash
ls -la quiz-old.html
```

Expected: file listed, ~38KB.

- [ ] **Step 4: Commit**

```bash
git add quiz-old.html
git commit -m "Archive current index.html as quiz-old.html for rollback"
```

---

## Task 2: Replace `index.html` with the shell (HTML head + GTM + body skeleton)

Wipe `index.html` and write the surrounding scaffold. Subsequent tasks fill in CSS, data, and JS.

**Files:**
- Modify: `index.html` (full rewrite of file)

- [ ] **Step 1: Replace `index.html` with the shell below**

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>Create AI Girlfriend | Design Your Perfect Companion | ourdream.ai</title>
<meta name="description" content="Create your AI girlfriend on Ourdream in 30 seconds. Choose her look, personality, and style. 100% private, always available.">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://static.ourdream.ai" crossorigin>
<link rel="preconnect" href="https://ouraidream.com" crossorigin>

<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5VRS8QPJ');</script>
<!-- End Google Tag Manager -->

<style>
/* CSS goes here in Task 3 */
body { margin: 0; background: #0a0a0a; color: #fff; font-family: system-ui, -apple-system, sans-serif; min-height: 100dvh; }
</style>
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5VRS8QPJ"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->

<div class="c3s-ambient"></div>

<div id="root" class="relative z-1 min-h-dvh flex flex-col"></div>

<div class="legal-footer">
  <a href="/terms.html">TERMS</a>
  <a href="/privacy.html">PRIVACY</a>
</div>

<script>
// Data tables, state, render dispatcher, components, event handlers
// All filled in by Tasks 4-12.
console.log('[init] shell loaded');
</script>
</body>
</html>
```

- [ ] **Step 2: Verify the file loads in a browser**

Run a local server (one of):

```bash
node server.js              # uses Express, port 3000 (per server.js)
# OR
npx vercel dev              # full Vercel emulator with /api routes
# OR
python3 -m http.server 8080 # quickest, but /api won't work
```

Open `http://localhost:3000/` (or whichever port). Expected:
- Page loads, blank dark background.
- DevTools console shows `[init] shell loaded`.
- DevTools Network tab shows `gtm.js` loading from `googletagmanager.com`.
- DevTools Application > Cookies shows GTM-related cookies appearing.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Replace index.html with shell for new 3-step funnel"
```

---

## Task 3: Add inline CSS (port `PAGE_CSS` from TSX + new email-gate styles)

Replace the placeholder `<style>` block with the full CSS for the flow.

**Files:**
- Modify: `index.html` — replace the `<style>...</style>` block in `<head>`

- [ ] **Step 1: Replace the `<style>` block with the full CSS below**

The base `c3s-*` styles are ported from `create_v2/create-3step-flow.tsx` lines 663–690 (`PAGE_CSS`). Additional layout styles (pick grids, cards, buttons, progress bar, email gate) are written from scratch to match the visual intent of the TSX.

```css
* { box-sizing: border-box; }
body {
  margin: 0;
  background: #0a0a0a;
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100dvh;
  -webkit-font-smoothing: antialiased;
}

/* Ambient background (ported from PAGE_CSS) */
.c3s-ambient { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.c3s-ambient::before {
  content: ''; position: absolute; top: -20%; left: -10%; width: 60%; height: 60%;
  background: radial-gradient(ellipse, rgba(219,39,119,0.08) 0%, transparent 70%);
  animation: c3s-drift 20s ease-in-out infinite;
}
.c3s-ambient::after {
  content: ''; position: absolute; bottom: -20%; right: -10%; width: 50%; height: 50%;
  background: radial-gradient(ellipse, rgba(219,39,119,0.06) 0%, transparent 70%);
  animation: c3s-drift 25s ease-in-out infinite reverse;
}
@keyframes c3s-drift {
  0%, 100% { transform: translate(0,0); }
  33% { transform: translate(5%,-3%); }
  66% { transform: translate(-3%,5%); }
}
@keyframes c3s-stepIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes c3s-stepOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-8px); } }
@keyframes c3s-fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes c3s-spin { to { transform: rotate(360deg); } }
.c3s-step-enter { animation: c3s-stepIn 0.4s ease forwards; }
.c3s-step-exit  { animation: c3s-stepOut 0.2s ease forwards; }

/* Layout */
#root { position: relative; z-index: 1; min-height: 100dvh; display: flex; flex-direction: column; }
.c3s-container { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 20px 16px 16px; max-width: 520px; margin: 0 auto; width: 100%; }
@media (min-width: 768px) { .c3s-container { padding: 32px 24px 24px; max-width: 700px; } }

/* Logo */
.c3s-logo { display: block; width: 75%; margin: 0 auto 20px; opacity: 0.85; transition: opacity 0.2s; text-decoration: none; }
.c3s-logo:hover { opacity: 1; }
.c3s-logo svg { width: 100%; height: auto; }
@media (min-width: 768px) { .c3s-logo { margin-bottom: 24px; } }

/* Step progress bar */
.c3s-progress { display: flex; gap: 8px; width: 100%; margin-bottom: 24px; }
.c3s-progress-seg { flex: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; cursor: default; position: relative; overflow: hidden; }
.c3s-progress-seg.is-clickable { cursor: pointer; }
.c3s-progress-fill { position: absolute; inset: 0; width: 0; background: linear-gradient(90deg, #ec4899, #db2777); transition: width 0.4s ease; }
.c3s-progress-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.5); margin-top: 6px; text-align: center; }
.c3s-progress-label.is-active { color: #ec4899; }

/* Headings */
.c3s-h1 { font-size: 28px; line-height: 1.2; font-weight: 700; text-align: center; margin: 0 0 8px; }
.c3s-h2 { font-size: 16px; font-weight: 500; text-align: center; color: rgba(255,255,255,0.7); margin: 0 0 24px; }
@media (min-width: 768px) { .c3s-h1 { font-size: 36px; } .c3s-h2 { font-size: 18px; } }

/* Style picker (Step 1) */
.c3s-style-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; }
.c3s-style-card { position: relative; aspect-ratio: 3/4; border-radius: 16px; overflow: hidden; cursor: pointer; border: 2px solid rgba(255,255,255,0.1); transition: border-color 0.2s, transform 0.15s; background: #1a1a1a; }
.c3s-style-card:hover, .c3s-style-card:focus-visible { border-color: rgba(236,72,153,0.5); transform: translateY(-2px); }
.c3s-style-card video, .c3s-style-card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.c3s-style-card-label { position: absolute; bottom: 12px; left: 12px; right: 12px; font-size: 18px; font-weight: 600; text-shadow: 0 2px 8px rgba(0,0,0,0.6); }

/* Pick grid (Step 2 sub-component) */
.c3s-pick-section { width: 100%; margin-bottom: 20px; }
.c3s-pick-title { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.8); margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.05em; }
.c3s-pick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.c3s-pick-card { position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden; cursor: pointer; border: 2px solid rgba(255,255,255,0.08); transition: border-color 0.15s, transform 0.1s; background: #1a1a1a; }
.c3s-pick-card:hover { border-color: rgba(236,72,153,0.4); }
.c3s-pick-card.is-selected { border-color: #ec4899; box-shadow: 0 0 0 3px rgba(236,72,153,0.25); }
.c3s-pick-card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.c3s-pick-card-label { position: absolute; bottom: 6px; left: 0; right: 0; text-align: center; font-size: 12px; font-weight: 600; text-shadow: 0 1px 4px rgba(0,0,0,0.8); }

/* Personality (Step 3) */
.c3s-persona-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; margin-bottom: 16px; }
.c3s-persona-card { position: relative; aspect-ratio: 3/4; border-radius: 16px; overflow: hidden; border: 2px solid rgba(255,255,255,0.1); background: #1a1a1a; cursor: pointer; transition: border-color 0.2s; }
.c3s-persona-card:hover { border-color: rgba(236,72,153,0.4); }
.c3s-persona-card.is-selected { border-color: #ec4899; box-shadow: 0 0 0 3px rgba(236,72,153,0.25); }
.c3s-persona-card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.c3s-persona-meta { position: absolute; left: 12px; right: 12px; bottom: 10px; }
.c3s-persona-name { font-size: 16px; font-weight: 700; text-shadow: 0 2px 8px rgba(0,0,0,0.7); }
.c3s-persona-vibe { font-size: 12px; color: rgba(255,255,255,0.85); text-shadow: 0 1px 4px rgba(0,0,0,0.7); }

/* Primary CTA */
.c3s-cta {
  display: block; width: 100%; padding: 16px 24px; border: none; border-radius: 12px;
  background: linear-gradient(90deg, #ec4899, #db2777); color: #fff;
  font-size: 18px; font-weight: 700; cursor: pointer; transition: transform 0.1s, box-shadow 0.2s;
  margin-top: 8px;
}
.c3s-cta:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(236,72,153,0.35); }
.c3s-cta:disabled { opacity: 0.6; cursor: not-allowed; }
.c3s-cta-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: c3s-spin 0.7s linear infinite; vertical-align: middle; margin-left: 8px; }

/* Email gate (overlay) */
.c3s-gate { position: fixed; inset: 0; z-index: 100; background: rgba(10,10,10,0.92); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 20px; animation: c3s-fadeIn 0.25s ease; }
.c3s-gate-card { width: 100%; max-width: 420px; background: rgba(20,20,20,0.85); border: 1px solid rgba(236,72,153,0.25); border-radius: 16px; padding: 28px 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.6); }
.c3s-gate-h1 { font-size: 22px; font-weight: 700; margin: 0 0 6px; text-align: center; }
.c3s-gate-sub { font-size: 14px; color: rgba(255,255,255,0.6); text-align: center; margin: 0 0 20px; }
.c3s-gate-input { width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.05); border: 1.5px solid rgba(255,255,255,0.1); border-radius: 10px; color: #fff; font-size: 16px; outline: none; transition: border-color 0.15s; }
.c3s-gate-input:focus { border-color: #ec4899; }
.c3s-gate-error { display: none; color: #ef4444; font-size: 13px; margin-top: 8px; }
.c3s-gate-error.is-shown { display: block; }
.c3s-gate-back { display: inline-block; margin-top: 14px; font-size: 13px; color: rgba(255,255,255,0.5); cursor: pointer; background: none; border: none; padding: 0; }
.c3s-gate-back:hover { color: rgba(255,255,255,0.8); }
.c3s-gate-legal { font-size: 11px; color: rgba(255,255,255,0.4); text-align: center; margin-top: 16px; }
.c3s-gate-legal a { color: rgba(255,255,255,0.6); text-decoration: underline; }

/* Legal footer */
.legal-footer { padding: 16px; text-align: center; position: relative; z-index: 1; }
.legal-footer a { color: rgba(255,255,255,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 12px; text-decoration: none; }
.legal-footer a:hover { color: rgba(255,255,255,0.8); }

/* Visibility helper for steps */
.c3s-step { display: none; width: 100%; }
.c3s-step.is-active { display: block; }
```

- [ ] **Step 2: Verify the styles load**

Refresh the local server. Expected:
- Background remains dark; you should see the subtle pink ambient gradient drifting (the `c3s-ambient` element).
- DevTools > Elements > Computed shows the `body` font is system UI.
- No CSS parse errors in DevTools console.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add CSS for 3-step flow and email gate"
```

---

## Task 4: Add SFW-only data tables

Append data tables to the inline `<script>` block. SFW-only — drop the `nsfw` branch entirely from each table. Source: `create_v2/create-3step-flow.tsx` lines 11–660.

**Files:**
- Modify: `index.html` — inside the `<script>` block, replace the placeholder `console.log('[init] shell loaded');` line with the data tables below (then re-add the init log at the end).

- [ ] **Step 1: Add the data tables to the inline `<script>` block**

```js
'use strict';

// ══════════════════════════════════════════════
//  ASSETS / CONSTANTS
// ══════════════════════════════════════════════

const LP = 'https://ouraidream.com/create-3step-assets';
const REDTRACK_BASE_B64 = 'aHR0cHM6Ly9jbGsub3VyZHJlYW1uZXR3b3JrLmNvbS9jbGljay8x'; // clk.ourdreamnetwork.com/click/1
const STEP_LABELS = ['Style', 'Look', 'Personality'];

// ══════════════════════════════════════════════
//  DATA TABLES (SFW-only — NSFW dropped per spec)
//  Source of truth: create_v2/create-3step-flow.tsx
// ══════════════════════════════════════════════

const STYLE_VIDEOS = {
  Realistic: {
    poster: 'https://static.ourdream.ai/create-videos/sfw-realistic-female-poster.webp',
    video:  'https://static.ourdream.ai/create-videos/w600/234b7ea4-be67-4b50-871e-8f65fe7a26f0.mp4',
  },
  Anime: {
    poster: 'https://static.ourdream.ai/create-videos/sfw-anime-female-poster.webp',
    video:  'https://static.ourdream.ai/create-videos/w600/514c0c25-05ec-452e-b56f-7e8841175aca.mp4',
  },
};

const ETHNICITY = {
  Realistic: [
    { value: 'White',   label: 'White',  img: 'https://static.ourdream.ai/create-videos/sfw-realistic-white.webp' },
    { value: 'Asian',   label: 'Asian',  img: 'https://static.ourdream.ai/create-videos/sfw-realistic-asian.webp' },
    { value: 'Latina',  label: 'Latina', img: 'https://static.ourdream.ai/create-videos/sfw-realistic-latina.webp' },
    { value: 'African', label: 'Black',  img: 'https://static.ourdream.ai/create-videos/sfw-realistic-african.webp' },
    { value: 'Elf',     label: 'Elf',    img: 'https://static.ourdream.ai/create-videos/sfw-realistic-elf.webp' },
    { value: 'Demon',   label: 'Demon',  img: 'https://static.ourdream.ai/create-videos/sfw-realistic-demon.webp' },
  ],
  Anime: [
    { value: 'White',   label: 'White',  img: 'https://static.ourdream.ai/create-videos/sfw-anime-white.webp' },
    { value: 'Asian',   label: 'Asian',  img: 'https://static.ourdream.ai/create-videos/sfw-anime-asian.webp' },
    { value: 'Latina',  label: 'Latina', img: 'https://static.ourdream.ai/create-videos/sfw-anime-latina.webp' },
    { value: 'African', label: 'Black',  img: 'https://static.ourdream.ai/create-videos/sfw-anime-african.webp' },
    { value: 'Elf',     label: 'Elf',    img: 'https://static.ourdream.ai/create-videos/sfw-anime-elf.webp' },
    { value: 'Demon',   label: 'Demon',  img: 'https://static.ourdream.ai/create-videos/sfw-anime-demon.webp' },
  ],
};

const ETHNICITY_APPEARANCE = {
  White:   { skinTone: 'Fair',   hairColor: 'Blonde',   eyeColor: 'Blue' },
  Asian:   { skinTone: 'Light',  hairColor: 'Black',    eyeColor: 'Brown' },
  Latina:  { skinTone: 'Olive',  hairColor: 'Brunette', eyeColor: 'Brown' },
  African: { skinTone: 'Dark',   hairColor: 'Black',    eyeColor: 'Brown' },
  Elf:     { skinTone: 'Fair',   hairColor: 'Silver',   eyeColor: 'Green' },
  Demon:   { skinTone: 'Darker', hairColor: 'Red',      eyeColor: 'Red' },
};

const HAIR = {
  Realistic: [
    { value: 'Wavy',          label: 'Wavy',     img: 'https://static.ourdream.ai/create-videos/sfw-realistic-wavy.webp' },
    { value: 'Long Straight', label: 'Long',     img: 'https://static.ourdream.ai/create-videos/sfw-realistic-long.webp' },
    { value: 'Ponytail',      label: 'Ponytail', img: 'https://static.ourdream.ai/create-videos/sfw-realistic-ponytail.webp' },
  ],
  Anime: [
    { value: 'Wavy',          label: 'Wavy',     img: 'https://static.ourdream.ai/create-videos/sfw-anime-wavy.webp' },
    { value: 'Long Straight', label: 'Long',     img: 'https://static.ourdream.ai/create-videos/sfw-anime-long.webp' },
    { value: 'Ponytail',      label: 'Ponytail', img: 'https://static.ourdream.ai/create-videos/sfw-anime-ponytail.webp' },
  ],
};

const PHYSIQUE = {
  Realistic: [
    { value: 'slim',     label: 'Slim',     img: 'https://static.ourdream.ai/create-videos/sfw-realistic-slim.webp',     bodyType: 'Slim',        breastSize: 'Small',  buttSize: 'Skinny' },
    { value: 'athletic', label: 'Athletic', img: 'https://static.ourdream.ai/create-videos/sfw-realistic-athletic.webp', bodyType: 'Athletic',    breastSize: 'Medium', buttSize: 'Athletic' },
    { value: 'curvy',    label: 'Curvy',    img: 'https://static.ourdream.ai/create-videos/sfw-realistic-curvy.webp',    bodyType: 'Voluptuous',  breastSize: 'Large',  buttSize: 'Large' },
  ],
  Anime: [
    { value: 'slim',     label: 'Slim',     img: 'https://static.ourdream.ai/create-videos/sfw-anime-slim.webp',     bodyType: 'Slim',        breastSize: 'Small',  buttSize: 'Skinny' },
    { value: 'athletic', label: 'Athletic', img: 'https://static.ourdream.ai/create-videos/sfw-anime-athletic.webp', bodyType: 'Athletic',    breastSize: 'Medium', buttSize: 'Athletic' },
    { value: 'curvy',    label: 'Curvy',    img: 'https://static.ourdream.ai/create-videos/sfw-anime-curvy.webp',    bodyType: 'Voluptuous',  breastSize: 'Large',  buttSize: 'Large' },
  ],
};

const PERSONALITIES = {
  Realistic: [
    { id: 'sweet',     img: `${LP}/sfw-sweet.webp`,     personality: ['Sweet', 'Caring'],       relationship: ['Crush', 'Friend'],            occupation: ['Nurse', 'Librarian'],   hobby: ['Cooking', 'Gardening'],   fetish: ['Vanilla', 'Roleplay'] },
    { id: 'flirty',    img: `${LP}/sfw-flirty.webp`,    personality: ['Flirty', 'Charming'],    relationship: ['Fling', 'Roommate'],          occupation: ['Bartender', 'Dancer'],  hobby: ['Dancing', 'Yoga'],        fetish: ['Lingerie', 'High Heels'] },
    { id: 'shy',       img: `${LP}/sfw-shy.webp`,       personality: ['Shy', 'Mysterious'],     relationship: ['Stranger', 'Secret Admirer'], occupation: ['Artist', 'Photographer'], hobby: ['Reading', 'Painting'],  fetish: ['Blindfolds', 'Stockings'] },
    { id: 'confident', img: `${LP}/sfw-confident.webp`, personality: ['Confident', 'Sassy'],    relationship: ['Lover', 'Colleague'],         occupation: ['Entrepreneur', 'Lawyer'], hobby: ['Running', 'Cycling'],   fetish: ['Uniforms', 'Corsets'] },
  ],
  Anime: [
    { id: 'sweet',     img: `${LP}/sfw-anime-sweet.webp`,     personality: ['Sweet', 'Caring'],    relationship: ['Crush', 'Friend'],            occupation: ['Nurse', 'Librarian'],   hobby: ['Cooking', 'Gardening'],   fetish: ['Vanilla', 'Roleplay'] },
    { id: 'flirty',    img: `${LP}/sfw-anime-flirty.webp`,    personality: ['Flirty', 'Charming'], relationship: ['Fling', 'Roommate'],          occupation: ['Bartender', 'Dancer'],  hobby: ['Dancing', 'Yoga'],        fetish: ['Lingerie', 'High Heels'] },
    { id: 'shy',       img: `${LP}/sfw-anime-shy.webp`,       personality: ['Shy', 'Mysterious'],  relationship: ['Stranger', 'Secret Admirer'], occupation: ['Artist', 'Photographer'], hobby: ['Reading', 'Painting'],  fetish: ['Blindfolds', 'Stockings'] },
    { id: 'confident', img: `${LP}/sfw-anime-confident.webp`, personality: ['Confident', 'Sassy'], relationship: ['Lover', 'Colleague'],         occupation: ['Entrepreneur', 'Lawyer'], hobby: ['Running', 'Cycling'],   fetish: ['Uniforms', 'Corsets'] },
  ],
};

const PERSONALITY_DISPLAY = {
  sweet:     { name: 'Sweet & Caring',     vibe: 'Warm, affectionate, always there for you' },
  flirty:    { name: 'Flirty & Playful',   vibe: 'Teasing, fun, keeps you on your toes' },
  shy:       { name: 'Shy & Mysterious',   vibe: 'Quiet charm, meaningful conversations' },
  confident: { name: 'Confident & Bold',   vibe: 'Knows what they want, takes the lead' },
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

console.log('[init] data tables loaded',
  { styles: Object.keys(STYLE_VIDEOS), personalities: PERSONALITIES.Realistic.length });
```

> **Note on placeholder hair/physique image URLs:** The TSX uses `mediaUrl()` for the SFW Hair and Physique tables (because the SFW versions of these were sourced from the same character-creation library as NSFW). The CDN URLs above (`sfw-realistic-wavy.webp` etc.) are constructed by analogy with the explicit URLs that already exist for ETHNICITY and STYLE_VIDEOS. **If any of these 12 URLs return 404 in the smoke test (Task 14, step 5), the implementing engineer must:**
> - Open the original ourdream.ai monorepo to resolve the actual `mediaUrl(...)` outputs from `create_v2/create-3step-flow.tsx` lines 233–286 (Hair) and 300–372 (Physique), AND
> - Replace the constructed URLs with the resolved ones, OR
> - Substitute with any working SFW asset of the same kind from `static.ourdream.ai/create-videos/`.

- [ ] **Step 2: Verify data tables load**

Refresh. DevTools console expected output:

```
[init] data tables loaded { styles: ['Realistic', 'Anime'], personalities: 4 }
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add SFW-only data tables for 3-step flow"
```

---

## Task 5: Add state object + `render()` dispatcher + step containers

Append the state model and the render dispatcher. Add three `<section>` elements to `#root` for the three steps.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace `<div id="root" ...></div>` with the step container scaffold**

```html
<div id="root">
  <div class="c3s-container">
    <a href="/" class="c3s-logo" aria-label="ourdream.ai">
      <svg viewBox="0 0 151 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="ourdream.ai">
        <!-- Logo paths from create_v2/create-3step-flow.tsx lines 888-938. Copy verbatim
             before Task 14 deletes the file. Open the TSX, find the <svg viewBox="0 0 151 16">
             starting at line 887, and paste every <path d="..." fill="..."/> child element
             from inside that <svg> into here. There are no fancy attrs to translate; JSX <path
             d=... /> works as-is in HTML. -->
        <!-- HARD STOP: do not skip this. The page renders without it (the <a> still wraps the
             whole header), but the ourdream.ai wordmark logo will be missing. -->
        <!-- After pasting, run `grep -c "<path" index.html` and confirm count >= 8. -->
        <!-- Then delete this comment block. -->
      </svg>
    </a>

    <div id="c3s-progress" class="c3s-progress" aria-label="Progress"></div>

    <section id="step-1" class="c3s-step"></section>
    <section id="step-2" class="c3s-step"></section>
    <section id="step-3" class="c3s-step"></section>
  </div>
</div>

<div id="c3s-gate-mount"></div>
```

- [ ] **Step 2: Append the state and render dispatcher to the inline `<script>` (after the data tables)**

```js
// ══════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════

const state = {
  currentStep: 1,                                          // 1 | 2 | 3 | 'email'
  style: null,                                             // 'Realistic' | 'Anime'
  ethnicity: null,                                         // string
  hairStyle: null,                                         // string
  physique: null,                                          // PhysiqueOption
  personality: null,                                       // 'sweet' | 'flirty' | 'shy' | 'confident'
  email: null,
  inboundParams: new URLSearchParams(window.location.search),
  qParams: null,                                           // built at end of step 3
  submitting: false,
  autoAdvanceTimer: null,
};

function setState(patch) {
  Object.assign(state, patch);
  render();
}

// ══════════════════════════════════════════════
//  RENDER DISPATCHER
// ══════════════════════════════════════════════

function render() {
  renderProgressBar();
  toggleStep('step-1', state.currentStep === 1);
  toggleStep('step-2', state.currentStep === 2);
  toggleStep('step-3', state.currentStep === 3);

  if (state.currentStep === 1) renderStep1();
  if (state.currentStep === 2) renderStep2();
  if (state.currentStep === 3) renderStep3();

  renderEmailGate(state.currentStep === 'email');
}

function toggleStep(id, isActive) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('is-active', isActive);
}

// Stubs filled in by later tasks
function renderProgressBar() { /* Task 7 */ }
function renderStep1() { /* Task 8 */ }
function renderStep2() { /* Task 9 */ }
function renderStep3() { /* Task 10 */ }
function renderEmailGate(_visible) { /* Task 11 */ }

// ══════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  console.log('[init] state ready', state);
  render();
});
```

- [ ] **Step 3: Verify the state model loads and render runs**

Refresh. DevTools console expected:

```
[init] data tables loaded { styles: [...], personalities: 4 }
[init] state ready { currentStep: 1, style: null, ... }
```

DevTools Elements: `#step-1` should have class `c3s-step is-active`; `#step-2` and `#step-3` only `c3s-step`. (They appear empty for now — content comes in Tasks 8-10.)

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Add state model, render dispatcher, and step containers"
```

---

## Task 6: Add tracking helpers (`track`, `getDecoratedUrl`)

Port the GTM helpers verbatim from the current `quiz-old.html` (which is the previous `index.html`). These are critical for cross-domain attribution and must match the existing implementation exactly.

**Files:**
- Modify: `index.html` — append to inline `<script>`, before the `DOMContentLoaded` listener

- [ ] **Step 1: Add tracking helpers**

```js
// ══════════════════════════════════════════════
//  TRACKING (verbatim port from quiz-old.html lines 610-636)
// ══════════════════════════════════════════════

window.dataLayer = window.dataLayer || [];

function track(eventName, params) {
  const data = { event: eventName, ...params };
  window.dataLayer.push(data);
  console.log('[dataLayer]', data);
}

function getDecoratedUrl(baseUrl) {
  return new Promise((resolve) => {
    // Create a temporary anchor and let GTM's cross-domain linker decorate it
    const a = document.createElement('a');
    a.href = baseUrl;
    a.style.cssText = 'position:fixed;left:-9999px;';
    document.body.appendChild(a);

    // GTM decorates links on mousedown — trigger it
    a.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    // Give GTM a tick to decorate, then read the href
    setTimeout(() => {
      const decoratedUrl = a.href;
      document.body.removeChild(a);
      resolve(decoratedUrl);
    }, 100);
  });
}
```

- [ ] **Step 2: Verify in browser**

Refresh. Open DevTools console and run:

```js
track('test_event', { foo: 'bar' });
```

Expected: console logs `[dataLayer] { event: 'test_event', foo: 'bar' }` and `window.dataLayer` now contains the pushed object.

```js
getDecoratedUrl('https://ourdream.ai/create').then(u => console.log(u));
```

Expected: after ~100ms, prints a URL. If GTM cross-domain linker is configured for `ourdream.ai`, the URL will include a `_gl=...` linker param. If not configured, it returns the original URL — that's fine.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add GTM tracking helpers"
```

---

## Task 7: Step Progress Bar

Implement `renderProgressBar()` to show three segments. Active step's segment is filled; clicking a completed segment goes back; can't skip ahead.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the `renderProgressBar()` stub**

```js
function renderProgressBar() {
  const container = document.getElementById('c3s-progress');
  if (!container) return;

  const stepNum = typeof state.currentStep === 'number' ? state.currentStep : 3; // gate counts as on step 3
  container.innerHTML = '';

  STEP_LABELS.forEach((label, i) => {
    const idx = i + 1;
    const completed = idx < stepNum;
    const active = idx === stepNum;
    const clickable = completed && state.currentStep !== 'email';

    const seg = document.createElement('div');
    seg.className = 'c3s-progress-seg' + (clickable ? ' is-clickable' : '');

    const fill = document.createElement('div');
    fill.className = 'c3s-progress-fill';
    fill.style.width = (idx <= stepNum) ? '100%' : '0%';
    seg.appendChild(fill);

    if (clickable) {
      seg.addEventListener('click', () => goToStep(idx));
    }

    const wrap = document.createElement('div');
    wrap.style.flex = '1';
    wrap.appendChild(seg);

    const labelEl = document.createElement('div');
    labelEl.className = 'c3s-progress-label' + (active ? ' is-active' : '');
    labelEl.textContent = label;
    wrap.appendChild(labelEl);

    container.appendChild(wrap);
  });
}

function goToStep(n) {
  if (state.autoAdvanceTimer) {
    clearTimeout(state.autoAdvanceTimer);
    state.autoAdvanceTimer = null;
  }
  setState({ currentStep: n });
}
```

- [ ] **Step 2: Verify in browser**

Refresh. The progress bar should show three segments — first one filled with pink gradient, others empty. Step labels under each segment: STYLE / LOOK / PERSONALITY (uppercase). The active label should be pink.

In DevTools console, simulate a step jump:

```js
setState({ currentStep: 3 });
```

Expected: progress bar fills all three segments. PERSONALITY label is now pink.

```js
setState({ currentStep: 1 });
```

Expected: back to first state.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add step progress bar"
```

---

## Task 8: Step 1 — Style Picker

Two cards (Realistic, Anime). Each shows a poster image; on hover, the video plays. Click selects style and advances to step 2.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the `renderStep1()` stub**

```js
function renderStep1() {
  const root = document.getElementById('step-1');
  if (root.dataset.rendered === '1') return; // render once
  root.dataset.rendered = '1';
  root.classList.add('c3s-step-enter');

  root.innerHTML = `
    <h1 class="c3s-h1">Choose her style</h1>
    <p class="c3s-h2">This sets the visual direction for your companion.</p>
    <div class="c3s-style-grid"></div>
  `;

  const grid = root.querySelector('.c3s-style-grid');
  ['Realistic', 'Anime'].forEach(styleKey => {
    const data = STYLE_VIDEOS[styleKey];
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'c3s-style-card';
    card.setAttribute('aria-label', `Choose ${styleKey} style`);
    card.innerHTML = `
      <video muted loop playsinline preload="none" poster="${data.poster}">
        <source src="${data.video}" type="video/mp4">
      </video>
      <div class="c3s-style-card-label">${styleKey}</div>
    `;

    const video = card.querySelector('video');
    card.addEventListener('mouseenter', () => { video.play().catch(() => {}); });
    card.addEventListener('mouseleave', () => { video.pause(); video.currentTime = 0; });
    card.addEventListener('click', () => {
      track('quiz_step_complete', { step: 1, style: styleKey });
      setState({ style: styleKey, currentStep: 2 });
    });

    grid.appendChild(card);
  });
}
```

- [ ] **Step 2: Verify in browser**

Refresh. Step 1 should show:
- Heading "Choose her style" + subtext
- Two cards side-by-side (Realistic, Anime), each showing a poster image
- Hover a card → video starts playing in place
- Click "Realistic" → DevTools console shows `[dataLayer] { event: 'quiz_step_complete', step: 1, style: 'Realistic' }`. Step 1 disappears, step 2 becomes visible (still empty until Task 9).
- Reset by running `setState({ currentStep: 1 })` in console.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add step 1: style picker"
```

---

## Task 9: Step 2 — Pick Grids (Ethnicity, Hair, Physique) + auto-advance

Three pick-grids stacked. When all three are picked, after a 350ms beat, auto-advance to step 3. Re-picking after the timer fires must not double-fire.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the `renderStep2()` stub**

```js
function renderStep2() {
  const root = document.getElementById('step-2');
  root.classList.add('c3s-step-enter');
  const styleKey = state.style || 'Realistic';

  root.innerHTML = `
    <h1 class="c3s-h1">Design her look</h1>
    <p class="c3s-h2">Pick one from each row.</p>
    ${renderPickSection('Ethnicity', ETHNICITY[styleKey],  state.ethnicity, 'ethnicity')}
    ${renderPickSection('Hair Style', HAIR[styleKey],      state.hairStyle, 'hairStyle')}
    ${renderPickSection('Physique',   PHYSIQUE[styleKey],  state.physique && state.physique.value, 'physique')}
  `;

  attachPickHandlers(root);
  maybeAutoAdvance();
}

function renderPickSection(title, options, selectedValue, stateKey) {
  const grid = options.map(opt => {
    const isSelected = opt.value === selectedValue;
    return `
      <button type="button" class="c3s-pick-card${isSelected ? ' is-selected' : ''}"
              data-state-key="${stateKey}" data-value="${opt.value}"
              aria-label="Choose ${opt.label}">
        <img src="${opt.img}" alt="${opt.label}" loading="lazy">
        <div class="c3s-pick-card-label">${opt.label}</div>
      </button>
    `;
  }).join('');

  return `
    <div class="c3s-pick-section">
      <h3 class="c3s-pick-title">${title}</h3>
      <div class="c3s-pick-grid">${grid}</div>
    </div>
  `;
}

function attachPickHandlers(root) {
  root.querySelectorAll('.c3s-pick-card').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.dataset.stateKey;
      const value = card.dataset.value;
      const styleKey = state.style || 'Realistic';

      let patch;
      if (key === 'physique') {
        const opt = PHYSIQUE[styleKey].find(p => p.value === value);
        patch = { physique: opt };
      } else {
        patch = { [key]: value };
      }

      track('quiz_pick', { step: 2, key, value });
      setState(patch);
    });
  });
}

function maybeAutoAdvance() {
  const allPicked = state.ethnicity && state.hairStyle && state.physique;
  if (!allPicked) return;

  // Guard against double-fire if user re-picks after timer started
  if (state.autoAdvanceTimer) {
    clearTimeout(state.autoAdvanceTimer);
  }
  state.autoAdvanceTimer = setTimeout(() => {
    state.autoAdvanceTimer = null;
    if (state.currentStep === 2) {
      setState({ currentStep: 3 });
    }
  }, 350);
}
```

- [ ] **Step 2: Verify in browser**

Refresh. Pick Realistic on step 1.

Step 2 expected behavior:
- Three sections appear: ETHNICITY (6 options), HAIR STYLE (3 options), PHYSIQUE (3 options).
- Click an Ethnicity card → it gets a pink border + glow. Console logs `[dataLayer] { event: 'quiz_pick', step: 2, key: 'ethnicity', value: '...' }`.
- Click a Hair Style card → same.
- Click a Physique card → same. Then ~350ms later, step 2 disappears and step 3 (empty for now) becomes visible.
- Test re-pick: from step 1, advance to step 2 again (`setState({ currentStep: 1 })` then walk through). Pick all 3 to set the timer running. Within 350ms, click another physique. Confirm only ONE step-3 transition occurs (check by adding a `console.log('advance!')` inside the `setTimeout` callback if you want to verify).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add step 2: ethnicity/hair/physique picks with auto-advance"
```

---

## Task 10: Step 3 — Personality Picker + Final CTA

Four persona cards (sweet, flirty, shy, confident). User picks one. CTA: "Meet your match." Click → trigger email gate.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the `renderStep3()` stub**

```js
function renderStep3() {
  const root = document.getElementById('step-3');
  root.classList.add('c3s-step-enter');
  const styleKey = state.style || 'Realistic';

  const cards = PERSONALITIES[styleKey].map(p => {
    const display = PERSONALITY_DISPLAY[p.id];
    const isSelected = state.personality === p.id;
    return `
      <button type="button" class="c3s-persona-card${isSelected ? ' is-selected' : ''}"
              data-personality="${p.id}" aria-label="Choose ${display.name}">
        <img src="${p.img}" alt="${display.name}" loading="lazy">
        <div class="c3s-persona-meta">
          <div class="c3s-persona-name">${display.name}</div>
          <div class="c3s-persona-vibe">${display.vibe}</div>
        </div>
      </button>
    `;
  }).join('');

  root.innerHTML = `
    <h1 class="c3s-h1">Pick her personality</h1>
    <p class="c3s-h2">This shapes how she talks and acts.</p>
    <div class="c3s-persona-grid">${cards}</div>
    <button type="button" id="c3s-final-cta" class="c3s-cta" ${state.personality ? '' : 'disabled'}>
      Meet your match
    </button>
  `;

  root.querySelectorAll('.c3s-persona-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.personality;
      track('quiz_pick', { step: 3, key: 'personality', value: id });
      setState({ personality: id });
    });
  });

  const cta = root.querySelector('#c3s-final-cta');
  cta.addEventListener('click', () => {
    if (!state.personality) return;
    state.qParams = buildQParams();
    track('quiz_step_complete', { step: 3, personality: state.personality });
    setState({ currentStep: 'email' });
  });
}

function buildQParams() {
  const styleKey = state.style;
  const eth = state.ethnicity;
  const phys = state.physique;
  const hair = state.hairStyle || 'Wavy';
  const appearance = ETHNICITY_APPEARANCE[eth] || ETHNICITY_APPEARANCE.White;
  const persona = PERSONALITIES[styleKey].find(p => p.id === state.personality)
              || PERSONALITIES[styleKey][0];

  const params = new URLSearchParams();

  // Carry over inbound URL params, except the Q-keys we'll be setting
  const skip = new Set(['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','Q10','Q13','Q14','Q15','Q16','Q17','Q18','s']);
  state.inboundParams.forEach((v, k) => { if (!skip.has(k)) params.set(k, v); });

  if (!params.has('ref')) params.set('ref', 'create-3step');

  params.set('Q1', 'Female');
  params.set('Q2', styleKey);
  params.set('Q3', eth);
  params.set('Q4', phys.breastSize);
  params.set('Q5', phys.buttSize);
  params.set('Q6', appearance.skinTone);
  params.set('Q7', appearance.hairColor);
  params.set('Q8', hair);
  params.set('Q9', appearance.eyeColor);
  params.set('Q10', phys.bodyType);
  params.set('Q13', pickRandom(persona.personality));
  params.set('Q14', pickRandom(persona.occupation));
  params.set('Q15', pickRandom(persona.relationship));
  params.set('Q16', pickRandom(persona.hobby));
  params.set('Q17', pickRandom(persona.fetish));
  params.set('Q18', 'true');
  params.set('s', '6');

  return params;
}
```

- [ ] **Step 2: Verify in browser**

Walk through the flow: pick Realistic → pick ethnicity, hair, physique → step 3 appears.

Expected:
- Heading "Pick her personality" + subtext.
- Four persona cards (Sweet & Caring, Flirty & Playful, Shy & Mysterious, Confident & Bold), each showing an image and a 2-line meta block.
- "Meet your match" button is **disabled** initially (gray).
- Click a persona card → it gets pink border. CTA becomes enabled.
- Click CTA → console shows `[dataLayer] { event: 'quiz_step_complete', step: 3, personality: 'sweet' }`. Step 3 disappears, but no email gate yet (Task 11).

In console:
```js
state.qParams.toString();
```

Expected: a URL-encoded string with `ref=create-3step&Q1=Female&Q2=Realistic&Q3=...&...&s=6`.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add step 3: personality picker and final CTA"
```

---

## Task 11: Email Gate

Full-screen overlay triggered when `state.currentStep === 'email'`. Single email input + Continue button. Validates, fires GTM event, POSTs `/api/save-email`, then triggers RedTrack redirect (Task 12 wires the redirect call).

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the `renderEmailGate()` stub**

```js
function renderEmailGate(visible) {
  const mount = document.getElementById('c3s-gate-mount');
  if (!mount) return;

  if (!visible) {
    mount.innerHTML = '';
    return;
  }

  if (mount.dataset.rendered === '1') return;
  mount.dataset.rendered = '1';

  mount.innerHTML = `
    <div class="c3s-gate" role="dialog" aria-modal="true" aria-labelledby="c3s-gate-title">
      <div class="c3s-gate-card">
        <h1 id="c3s-gate-title" class="c3s-gate-h1">Almost there - enter to reveal your creation</h1>
        <p class="c3s-gate-sub">We'll send your match details to this email.</p>
        <form id="c3s-gate-form" novalidate>
          <input type="email" name="email" id="c3s-gate-email" class="c3s-gate-input"
                 placeholder="you@example.com" autocomplete="email" autofocus required>
          <div id="c3s-gate-err" class="c3s-gate-error">Please enter a valid email.</div>
          <button type="submit" id="c3s-gate-submit" class="c3s-cta" style="margin-top: 14px;">
            Continue
          </button>
        </form>
        <div style="text-align:center;">
          <button type="button" id="c3s-gate-back" class="c3s-gate-back">← back</button>
        </div>
        <div class="c3s-gate-legal">
          By continuing you agree to our <a href="/terms.html">Terms</a> and <a href="/privacy.html">Privacy Policy</a>.
        </div>
      </div>
    </div>
  `;

  const form   = document.getElementById('c3s-gate-form');
  const input  = document.getElementById('c3s-gate-email');
  const err    = document.getElementById('c3s-gate-err');
  const submit = document.getElementById('c3s-gate-submit');
  const back   = document.getElementById('c3s-gate-back');

  back.addEventListener('click', () => {
    mount.dataset.rendered = '';
    setState({ currentStep: 3 });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (state.submitting) return;

    const email = input.value.trim();
    if (!isValidEmail(email)) {
      err.classList.add('is-shown');
      input.focus();
      return;
    }
    err.classList.remove('is-shown');

    state.submitting = true;
    submit.disabled = true;
    submit.innerHTML = 'Continue<span class="c3s-cta-spinner" aria-hidden="true"></span>';

    track('quiz_email_captured', { email_provided: true });

    // Fire-and-forget save-email; we proceed regardless of outcome.
    saveEmail(email).catch(err => console.warn('[save-email] failed:', err));

    // Wired in Task 12.
    redirectToRedtrack();
  });
}

function isValidEmail(s) {
  return /.+@.+\..+/.test(s);
}

function saveEmail(email) {
  return fetch('/api/save-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      mode: 'companion',
      answers: ['Female', state.style, state.ethnicity, state.hairStyle],
      marketingConsent: false,
    }),
  });
}

// Stub — implemented in Task 12
function redirectToRedtrack() {
  console.log('[redirect] would redirect now (stub)');
}
```

- [ ] **Step 2: Verify in browser**

Walk through the full flow to step 3 and click "Meet your match." Expected:
- Email gate overlay appears (full-screen, blurred backdrop).
- Heading: "Almost there - enter to reveal your creation".
- Single email input, autofocused.
- Submit empty/invalid email → red error appears under the input. Button stays enabled.
- Submit valid email (e.g., `test@test.com`) → button shows spinner, console logs `[dataLayer] { event: 'quiz_email_captured', email_provided: true }` and `[redirect] would redirect now (stub)`. (Network tab also shows a `POST /api/save-email` request — it may 500 if `SHEETS_WEBHOOK_*` env vars aren't set locally, that's expected.)
- Click "← back" → returns to step 3 with all picks intact.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add email gate overlay with validation and save-email POST"
```

---

## Task 12: RedTrack redirect helper

Replace the stub `redirectToRedtrack()` with the real implementation. Builds the URL with `sub11=googlecpc`, `clickid` from cookie, and inbound URL params passed through. Decorates with GTM cross-domain linker, then navigates.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the `redirectToRedtrack()` stub**

```js
function redirectToRedtrack() {
  // Build RedTrack URL: clk.ourdreamnetwork.com/click/1?sub11=googlecpc&clickid=<cookie>&<inbound>
  const base = atob(REDTRACK_BASE_B64); // https://clk.ourdreamnetwork.com/click/1
  const params = new URLSearchParams();

  // Fixed traffic source (RedTrack remaps → ref=googlecpc on ourdream.ai)
  params.set('sub11', 'googlecpc');

  // Forward clickid from the rtkclickid-store cookie. The cookie is scoped to
  // ourdreamnetwork.com (NOT clk.ourdreamnetwork.com), so we must pass it as a query.
  const cookieMatch = document.cookie.match(/(?:^|;\s*)rtkclickid-store=([^;]+)/);
  if (cookieMatch) {
    params.set('clickid', decodeURIComponent(cookieMatch[1]));
  }

  // Pass through inbound URL params (utm_*, gclid, fbclid, etc.). RedTrack ignores
  // unknown params; ourdream.ai may use them for campaign attribution.
  state.inboundParams.forEach((v, k) => {
    if (!params.has(k)) params.set(k, v);
  });

  const url = base + '?' + params.toString();

  track('quiz_redirect', { redirect_url: url });

  getDecoratedUrl(url).then(finalUrl => {
    window.location.href = finalUrl;
  });
}
```

- [ ] **Step 2: Verify in browser without leaving the page**

Walk through the flow. Just before clicking "Continue" on the email gate, open DevTools console and run:

```js
window.addEventListener('beforeunload', e => { e.preventDefault(); e.returnValue = ''; });
```

This pops a confirm dialog before the redirect fires, giving you time to inspect the URL.

Then submit a valid email. When the dialog appears, click "Cancel" and check the console:

Expected:
- `[dataLayer] { event: 'quiz_email_captured', ... }`
- `[dataLayer] { event: 'quiz_redirect', redirect_url: 'https://clk.ourdreamnetwork.com/click/1?sub11=googlecpc&...' }`
- The URL must NOT contain any of `sub12, sub13, sub14, sub15, sub16, sub17, sub18` (those are the dropped params from spec Section "Data flow").

To test the inbound-params passthrough, append `?utm_source=test&gclid=abc` to the page URL, then walk through the flow. The final RedTrack URL should include both `utm_source=test` and `gclid=abc`.

To test the missing-clickid path, clear cookies (`document.cookie.split(';').forEach(c => document.cookie = c.split('=')[0] + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT')`) before submitting. The URL should not contain `clickid` but should still navigate.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Wire RedTrack redirect with sub11+clickid+inbound passthrough"
```

---

## Task 13: Sync `public/index.html` with new root `index.html`

The repo serves both root `/index.html` and `public/index.html` at `/` (per project memory and the existing repo layout). Keep them in sync.

**Files:**
- Modify: `public/index.html` (full replace)

- [ ] **Step 1: Copy root `index.html` over `public/index.html`**

```bash
cp index.html public/index.html
```

- [ ] **Step 2: Verify they match**

```bash
diff index.html public/index.html
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add public/index.html
git commit -m "Sync public/index.html with new funnel"
```

---

## Task 14: Delete `create_v2/` directory

The TSX files were the source for the port, but they don't run in this static repo. Remove them now that the port is complete.

**Files:**
- Delete: `create_v2/page.tsx`
- Delete: `create_v2/loading.tsx`
- Delete: `create_v2/create-3step-flow.tsx`
- Delete: `create_v2/` directory itself

- [ ] **Step 1: Remove the directory**

```bash
git rm -r create_v2
```

- [ ] **Step 2: Verify it's gone from the working tree and from git**

```bash
ls create_v2 2>&1 || echo "OK: directory removed"
git status
```

Expected: "OK: directory removed" and `git status` shows three deletions staged.

- [ ] **Step 3: Commit**

```bash
git commit -m "Remove create_v2/ TSX source after HTML port"
```

---

## Task 15: Manual smoke test on Vercel preview

Per project memory: preview URLs require auth, so use `vercel curl --deployment` for headless 200-checks and a browser for the visual pass.

**Files:** None (verification only).

- [ ] **Step 1: Push the branch and deploy a preview**

```bash
git push -u origin <branch-name>
# Vercel auto-deploys on push if the project is linked. If not:
vercel deploy
```

Capture the preview URL printed by Vercel.

- [ ] **Step 2: Headless 200-check on the new pages**

```bash
vercel curl --deployment <preview-url> /          # new flow
vercel curl --deployment <preview-url> /quiz-old.html  # archived old quiz (rollback)
```

Expected: both return HTTP 200.

- [ ] **Step 3: Visual smoke test in a browser** (run through every item)

| # | Action | Expected |
|---|---|---|
| 1 | Land on `/` | Step 1 visible. Heading "Choose her style". Two style cards. |
| 2 | Pick "Realistic" | Step 2 appears. Three pick sections. |
| 3 | Pick Ethnicity, Hair Style, Physique (all three) | After ~350ms, step 3 appears. |
| 4 | Pick a personality, then click "Meet your match" | Email gate overlay appears. |
| 5 | Type invalid email, submit | Inline red error. No redirect. |
| 6 | Type valid email, submit | Spinner shown. Within ~150ms, page navigates to `clk.ourdreamnetwork.com/click/1?sub11=googlecpc&clickid=...`. Eventually lands on `ourdream.ai`. |
| 7 | Check Google Sheet | New row appended with the email + answers (mode='companion', gender='Female', answer1=style, answer2=ethnicity, answer3=hairStyle). |
| 8 | Check GTM (Tag Assistant or DevTools `dataLayer`) | Events `quiz_step_complete`, `quiz_pick`, `quiz_email_captured`, `quiz_redirect` all present. |
| 9 | Land with `?utm_source=test&gclid=abc` | Final RedTrack URL includes both `utm_source=test` and `gclid=abc`. |
| 10 | Visit `/quiz-old.html` | Old quiz still works (rollback safety net). |
| 11 | Step progress bar | Click a completed segment → goes back. Try clicking ahead → no-op. |
| 12 | Asset check | All ethnicity, hair, physique, persona cards show real images. None broken. |

- [ ] **Step 4: Fix any issues found**

If asset URLs 404, refer to the note in Task 4 Step 1 — resolve `mediaUrl()` outputs from the original ourdream.ai monorepo and update the URLs in `index.html` (and re-sync `public/index.html`). Commit the fix and re-verify.

- [ ] **Step 5: After all verification passes, open a PR**

```bash
gh pr create --title "Replace index.html with create_v2 HTML funnel + email gate" \
  --body "$(cat <<'EOF'
## Summary
- Ports create_v2/create-3step-flow.tsx to vanilla HTML/CSS/JS
- Replaces index.html with the new 3-step flow (Style → Look → Personality)
- Adds an email-capture gate before the RedTrack redirect
- Archives the previous quiz to /quiz-old.html for rollback
- Drops sub12..sub18 from the RedTrack URL; keeps sub11=googlecpc + clickid + inbound URL params passthrough
- Reuses existing /api/save-email with mode='companion' (no backend change)

## Test plan
- [ ] Headless 200-check on `/` and `/quiz-old.html`
- [ ] Walk through every row of the smoke test table in the plan
- [ ] Verify Google Sheet captures the email
- [ ] Verify GTM dataLayer events fire
- [ ] Verify inbound `utm_*`/`gclid`/`fbclid` survive into the final RedTrack URL

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-review

**Spec coverage check:**
- Replace `index.html` with new flow → Tasks 2-12
- Archive old quiz to `/quiz-old.html` → Task 1
- Sync `public/index.html` → Task 13
- Delete `create_v2/` → Task 14
- SFW-only → Task 4 explicitly drops NSFW branch
- Step 1 (Style) → Task 8
- Step 2 (Look) with 350ms auto-advance → Task 9
- Step 3 (Personality) with CTA → Task 10
- Email gate with copy "Almost there - enter to reveal your creation" / "Continue", no marketing-consent checkbox → Task 11
- RedTrack URL with `sub11=googlecpc` + `clickid` + inbound passthrough → Task 12
- `/api/save-email` payload `{ email, mode: 'companion', answers: ['Female', style, ethnicity, hairStyle], marketingConsent: false }` → Task 11 step 1
- GTM `track()` + `getDecoratedUrl()` ported verbatim → Task 6
- Step progress bar with back-navigation → Task 7
- Verification (manual smoke test) → Task 15
- Rollback plan (`quiz-old.html` exists) → Task 1

**Type/name consistency:** `STYLE_VIDEOS`, `ETHNICITY`, `HAIR`, `PHYSIQUE`, `PERSONALITIES`, `PERSONALITY_DISPLAY`, `ETHNICITY_APPEARANCE`, `state`, `setState`, `render`, `goToStep`, `buildQParams`, `redirectToRedtrack`, `saveEmail`, `track`, `getDecoratedUrl`, `pickRandom` — all referenced names match across tasks.

**Placeholder scan:** No "TBD"/"TODO" in any task body. The one open issue (mediaUrl-resolved Hair/Physique URLs in Task 4) is explicitly flagged with concrete instructions for the engineer if assets 404 in the smoke test.

**Note:** The Hair and Physique image URLs in Task 4 Step 1 are constructed by analogy from the ETHNICITY pattern, since the original TSX uses `mediaUrl()` (a workspace helper unavailable in this static repo). Task 14 Step 4 is the explicit fallback path if any of those URLs are wrong — resolve from the monorepo and update.
