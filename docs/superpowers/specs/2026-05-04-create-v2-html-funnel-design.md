# create_v2 HTML funnel design

**Date:** 2026-05-04
**Status:** Approved (pending spec review)

## Goal

Replace the current `index.html` quiz on `ourdreamnetwork.com` with a vanilla-HTML port of the `create_v2/create-3step-flow.tsx` 3-step flow (Style → Look → Personality), gated at the end by an email-capture screen, then handing off to `clk.ourdreamnetwork.com/click/1` for RedTrack attribution and final redirect to `ourdream.ai`.

## Non-goals

- Real authentication (sessions, password storage, account recovery). The "login" gate is email-only lead capture.
- A Next.js / React build pipeline. This repo stays a static-HTML deploy on Vercel with `framework: null`.
- Carrying full Q1..Q18 data through to ourdream.ai. Only `sub11=googlecpc` + `clickid` survive the RedTrack handoff (matching today's behavior).
- NSFW mode. The original TSX has SFW/NSFW; we ship SFW only.
- Updating the RedTrack campaign config or `api/save-email.js` / Apps Script.

## Architecture

```
ourdreamnetwork.com/                 → new index.html (3-step flow + email gate)
ourdreamnetwork.com/quiz-old.html    → archived old quiz (rollback safety net)
ourdreamnetwork.com/api/save-email   → unchanged, captures email
clk.ourdreamnetwork.com/click/1      → unchanged, RedTrack handoff
ourdream.ai                          → final destination
```

**Files touched:**

- `index.html` — replaced with the new flow (single self-contained file, inline CSS + JS, SFW-only)
- `public/index.html` — same replacement (the repo serves both at root)
- `quiz-old.html` — new file, copy of the current `index.html` for rollback
- `create_v2/` — deleted after the port (TSX won't run in this static repo)

**Files unchanged:**

- `api/save-email.js`
- `vercel.json`
- `terms.html`, `privacy.html`, favicons, GTM config (`GTM-5VRS8QPJ`)

## User flow

1. **Step 1 — Choose style.** Two cards: Realistic, Anime. Each with a hover/tap video preview from `static.ourdream.ai/create-videos/...`. Click sets `state.style` and advances to step 2.
2. **Step 2 — Design look.** Three pick-grids stacked: Ethnicity (6 options), Hair Style (6 options), Physique (6 options). All assets are direct `static.ourdream.ai` CDN URLs. When all three are picked, auto-advance to step 3 after a 350ms beat.
3. **Step 3 — Pick personality.** Single CTA at the bottom: "Meet your match." Click triggers the email gate.
4. **Email gate (new).** Full-screen overlay matching the flow's visual style. Heading "Almost there - enter to reveal your creation", single email input (autofocused, `type="email"`), primary button "Continue". Small print at the bottom links to `/terms.html` and `/privacy.html`. No marketing-consent checkbox.
5. **RedTrack redirect.** On valid submit, `POST /api/save-email`, then `window.location.href = clk.ourdreamnetwork.com/click/1?...` (see Data flow).

**Step progress bar** at the top stays. Tapping a completed step jumps back; users can't skip ahead. Email gate has a small "← back" link returning to step 3 with picks preserved.

## State (in-memory, vanilla JS)

```js
const state = {
  currentStep: 1,           // 1 | 2 | 3 | 'email'
  style: null,              // 'Realistic' | 'Anime'
  ethnicity: null,          // string
  hairStyle: null,          // string
  physique: null,           // { value, label, img, bodyType, breastSize, buttSize }
  email: null,
  inboundParams: new URLSearchParams(window.location.search),
};
```

Step-3 personality picks (`Q13..Q17`) are randomized at submit time from the persona arrays in the original TSX (`pickRandom(persona.personality)`, etc.). They aren't propagated through RedTrack today, but we still build them for consistency and future use.

State is in memory only. A page refresh resets it — same as the current quiz.

## Rendering

- One `render()` function per step, called on state change.
- Steps live as sibling `<section>` elements. Only the active one has `display: block`.
- Animations via CSS classes ported from the TSX: `c3s-step-enter` / `c3s-step-exit`, with `@keyframes c3s-stepIn` / `c3s-stepOut`.
- Auto-advance on step 2 uses a single `setTimeout(350)` after the third pick, with a guard so re-picks don't double-fire.

## Data flow at the end of step 3

On step-3 CTA click:

1. Build the full Q-param object from state (mirrors TSX lines 819–863):
   ```
   Q1=Female, Q2=<style>, Q3=<ethnicity>,
   Q4=<physique.breastSize>, Q5=<physique.buttSize>,
   Q6=<skinTone>, Q7=<hairColor>, Q8=<hairStyle>,
   Q9=<eyeColor>, Q10=<physique.bodyType>,
   Q13=randomFrom(persona.personality),
   Q14=randomFrom(persona.occupation),
   Q15=randomFrom(persona.relationship),
   Q16=randomFrom(persona.hobby),
   Q17=randomFrom(persona.fetish),
   Q18=true, s=6, ref=create-3step
   ```
2. Stash in `state.qParams` (kept for analytics, not sent to RedTrack).
3. Show the email gate.

On email-gate submit:

4. Validate email format (`/.+@.+\..+/`). Invalid → inline error, button stays enabled.
5. `dataLayer.push({ event: 'quiz_email_captured', email_provided: true })`.
6. `POST /api/save-email` with payload shaped to fit the existing endpoint:
   ```js
   {
     email,
     mode: 'companion',                                    // hits the gender-mode branch
     answers: ['Female', state.style, state.ethnicity, state.hairStyle],
     marketingConsent: false
   }
   ```
   This maps to Sheet columns `gender='Female', answer1=style, answer2=ethnicity, answer3=hairStyle, marketingConsent='No'`. No backend change needed.
7. **Whether `/api/save-email` returns 200, errors, or times out → continue to redirect.** Capture is best-effort, never blocks. Errors logged to `console.warn`.
8. Build RedTrack URL and redirect.

## RedTrack URL

```
https://clk.ourdreamnetwork.com/click/1?sub11=googlecpc&clickid=<from cookie>&<inbound params>
```

- `sub11=googlecpc` (fixed). RedTrack remaps → `ref=googlecpc` on `ourdream.ai`. Matches today's affiliate reporting.
- `clickid` from `document.cookie.match(/(?:^|;\s*)rtkclickid-store=([^;]+)/)`. If the cookie is missing, redirect without `clickid` (matches today).
- **All inbound URL params are passed through** (e.g., `utm_source`, `utm_campaign`, `gclid`, `fbclid`). RedTrack ignores unknown params; ourdream.ai may use them for campaign-level attribution.
- The base URL `clk.ourdreamnetwork.com/click/1` is base64-encoded in source as today (`aHR0cHM6Ly9jbGsub3VyZHJlYW1uZXR3b3JrLmNvbS9jbGljay8x`).
- `dataLayer.push({ event: 'quiz_redirect', redirect_url })` fires before navigation.

**Dropped sub-params** (vs current quiz): `sub12, sub13, sub14, sub15, sub16, sub17, sub18`. Impact: ourdream.ai's `/create` page no longer receives `Q1, Q10, Q12, Q13, Q15, Q18, s` — users land on a generic `/create` instead of one prefilled from quiz answers. RedTrack click attribution is unaffected.

## Error handling

| Failure | Behavior |
|---|---|
| Invalid email format | Inline red error under input, no submit |
| `/api/save-email` 4xx/5xx/timeout | `console.warn`, continue to redirect |
| `rtkclickid-store` cookie missing | Redirect without `clickid` |
| JS disabled | Whole flow doesn't work — same as today's quiz |
| Asset CDN failure (image/video 404) | Browser shows broken thumbnail / empty `<video>`. No JS-level fallback. Acceptable — assets are external and stable. |

## Tracking (preserved as-is)

- GTM container `GTM-5VRS8QPJ` loads in `<head>` with the same snippet.
- The `track(eventName, params)` helper from the current quiz is ported verbatim. Cross-domain link decoration (anchor click + GTM tick) is preserved at redirect time.
- Events fired at minimum: `quiz_email_captured` (on email submit) and `quiz_redirect` (just before navigation). Additional per-step events can be added during implementation if useful, but the two above are the minimum to maintain parity with the current quiz's funnel reporting.

## Asset references

All SFW assets in the TSX are direct `static.ourdream.ai/create-videos/...` URLs. The `mediaUrl()` helper from `@repo/lib/utils/media-url` is only used in the NSFW branch (dropped). The `LP` constant pointing at `https://ouraidream.com/create-3step-assets` is used for some shared images and stays as-is.

No new assets are hosted in this repo. No `mediaUrl` shim or workspace-alias resolution needed.

## Verification (manual smoke test on Vercel preview)

Preview URLs require auth, so we use `vercel curl --deployment` for headless 200-checks and a real browser for the visual pass.

1. Land on `/`, see step 1. Pick "Realistic" → step 2.
2. On step 2, pick Ethnicity + Hair Style + Physique → step 3 auto-loads after ~350ms.
3. Step 3 → click "Meet your match" → email gate.
4. Invalid email → inline error.
5. Valid email → spinner → arrives at `clk.ourdreamnetwork.com/click/1?sub11=googlecpc&clickid=...` (inspect with `e.preventDefault()` in DevTools console if needed).
6. Google Sheet receives a row with the email + answers.
7. GTM dataLayer received `quiz_email_captured` and `quiz_redirect`.
8. Land with `?utm_source=test&gclid=abc` → those params survive into the final RedTrack URL.
9. `/quiz-old.html` still serves the old quiz (rollback safety net).
10. Step progress bar lets you jump back to completed steps; can't skip ahead.

After merge, repeat checklist on production URL.

## Rollback plan

If the new flow regresses conversion or breaks in production:

1. Rename `index.html` → `index-new.html`.
2. Rename `quiz-old.html` → `index.html`.
3. Same for `public/index.html`.
4. Commit + deploy.

Old quiz is restored intact.
