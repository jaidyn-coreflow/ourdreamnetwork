# CLAUDE.md

Repo-level instructions for Claude Code. Read this before touching any landing page.

## What this repo is

Static-site marketing surface for `ourdreamnetwork.com`. A collection of paid-ad landing pages (quiz, competitor-comparison pages, login) that capture email + redirect users to the `ourdream.ai` product through RedTrack for attribution.

Deployed on Vercel. No framework — plain HTML/CSS/JS in `/public`, one tiny Vercel Function in `/api`.

## Layout

- `public/*.html` — **source of truth** for every landing page. Pretty URLs are mapped in `vercel.json` (`/login` → `/login.html`, etc.). Any `.html` files at repo root are stale; ignore them.
- `api/save-email.js` — Vercel Function that proxies email captures to a Google Apps Script (which appends to a Google Sheet).
- `apps-script/append-row.gs` — the Apps Script. Edit here, then redeploy in the Apps Script console.
- `vercel.json` — rewrites only. When adding a new LP, add a rewrite here.

## Pages and their roles

| Pretty URL | File | Purpose | Receives paid ads? |
|---|---|---|---|
| `/` | `index.html` | Female-companion quiz funnel (primary) | Yes |
| `/login` | `login.html` | Email-gate landing page | Yes |
| `/candy` | `candy.html` | Competitor comparison (Candy AI) | Yes |
| `/joi` | `joi.html` | Competitor comparison (Joi AI) | Yes |
| `/girlfriendgpt` | `girlfriendgpt.html` | Competitor comparison (GirlfriendGPT) | Yes |
| `/quiz` | `quiz.html` | 6-step Figma quiz funnel (Owners Narrow theme). **No email capture** — final "Create my fantasy" builds the offer URL then multi-hops `/quiz → /go/ourdream → clk → ourdream.ai/create` | Yes |
| `/go/ourdream` | `go-ourdream.html` | Internal bounce — blank white screen ~2.5s, then `location.replace` to the `?to=` URL `/quiz` built (host-allowlisted to `clk.ourdreamnetwork.com` / `ourdream.ai`). Not a standalone LP | No |
| `/privacy`, `/terms` | `privacy.html`, `terms.html` | Legal | No (no submit) |

When the user adds a new LP, update both this table and `vercel.json`.

**Competitor-comparison pages (`/candy`, `/joi`, `/girlfriendgpt`) do NOT capture email or use the redirect funnel below.** Their CTAs are plain `<a href="/?…">` links into the same-domain `/` quiz funnel, which owns the email capture + offer redirect. On load they only rewrite each `[data-quiz-cta]` anchor's href to forward inbound query params (`utm_*`, `gclid`, `cmpid`, …) and fire a `quiz_cta_clicked` dataLayer event. No email form, no modal, no `getGlValue`/RedTrack on these pages — the `rtkclickid-store` cookie (set on `cookiedomain=ourdreamnetwork.com`) persists same-domain to `/`, which handles the cross-domain `_gl`/RedTrack hop. See `public/candy.html` (all three share identical markup, differing only in copy). To repoint these CTAs, change the `const href = '/' + (location.search …)` line and the static `data-quiz-cta` anchor hrefs in each file.

**`/quiz` (`quiz.html`) is a no-email funnel built to a Figma design.** It is the only LP that (a) captures **no email** — there is no `generate_lead`/Google Ads lead conversion on this page, by design — and (b) does **not** submit straight to `clk`. Instead, on the final "Create my fantasy" step it builds the destination URL itself (PAID: `clk.ourdreamnetwork.com/click/1` with `sub11..sub19` mirroring `index.html` exactly; ORGANIC: direct `ourdream.ai/create` with `Q1`/`Q13`/`Q22` + `_gl`), then **multi-hops** `/quiz → /go/ourdream?to=<url> → clk → ourdream.ai/create`. The `/go/ourdream` bounce (`go-ourdream.html`) is a deliberate blank-white interstitial (~2.5s) that just `location.replace`s to the allow-listed `?to=` URL — all the attribution work (clickid cookie + `getGlValue` `_gl`) happens on `/quiz` before the hop. Quiz answers map: attracted-gender → `Q1` companion gender, chosen chat-style → `Q13` personality, scene free-text → `Q22`. It self-hosts the **Owners Narrow** brand font (`public/assets/fonts/owners-narrow-*.woff2`; `&`/`-` glyphs are absent from the trial font and per-glyph fall back to the system stack). GTM events are still only the wired ones — `quiz_start`, `quiz_step_2_complete`, `quiz_step_3_complete`, `visit_site_clicked` (no `generate_lead`). Assets live in `public/assets/quiz/`.

## The redirect funnel — how every email-capturing LP must work

Every email-capturing LP (`/` quiz, login) submits the user into the same pipeline:

```
LP submit  →  clk.ourdreamnetwork.com/click/N?sub11=<source>&sub19=<_gl>&clickid=<...>
            →  ourdream.ai/<offer>?...&clickid={clickid}&tracker=rt&_gl={sub19}
```

- `clk.ourdreamnetwork.com` is the **RedTrack click router**. Slot `N` is configured in the RedTrack dashboard.
- `sub11` is the **source label** (`googlecpc`, `login`, etc.) — used for breakdowns in RedTrack reports.
- `clickid` comes from the `rtkclickid-store` cookie, set by RedTrack's tracking pixel (loaded via GTM tag `GTM-5VRS8QPJ`) when the user lands from a paid ad with `?cmpid=...` in the URL.
- `sub19` carries the **GA4 cross-domain linker payload (`_gl`)** so the user's GA4 session stitches from `ourdreamnetwork.com` to `ourdream.ai` instead of starting a fresh session on the offer page.

### CRITICAL: `_gl` must come from `getGlValue()`, never from the URL

Google Ads does **not** add `_gl` to the ad-click URL. `_gl` is a GA4 linker param, only present when a user clicks an internal cross-domain link that GTM has decorated. So on every ad-click landing, `window.location.search` has no `_gl` — reading from there gives you `null`, which propagates as `_gl=undefined` in the final offer URL and **breaks GA4 cross-session attribution**.

The correct pattern (used by every LP except the one that broke):

```js
function getGlValue() {
  return new Promise((resolve) => {
    const a = document.createElement('a');
    a.href = 'https://ourdream.ai/';
    a.style.cssText = 'position:fixed;left:-9999px;';
    document.body.appendChild(a);
    a.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    setTimeout(() => {
      const match = a.href.match(/[?&]_gl=([^&]+)/);
      document.body.removeChild(a);
      resolve(match ? decodeURIComponent(match[1]) : '');
    }, 100);
  });
}
```

It creates a hidden anchor to `ourdream.ai`, fires a `mousedown` to trigger GTM's linker, waits a tick, then extracts the `_gl` payload from the decorated href. Always `await` this before building the redirect URL and pass the result into `sub19`.

**Reference implementations:**
- Async/await + cookie branching: `public/index.html:727-825` (canonical — copy from here for new LPs)
- Promise-`.then()` style (ES5): `public/login.html:219-310`

### Organic vs paid branching

When no `rtkclickid-store` cookie exists, RedTrack rejects the click with "empty clickid value." Every LP that handles organic traffic must branch:

- **Cookie present (paid):** `clk.ourdreamnetwork.com/click/N?sub11=...&sub19=<_gl>&clickid=...`
- **No cookie (organic):** skip RedTrack entirely, go direct to the offer URL (e.g., `https://ourdream.ai/create?...` or `https://ourdream.ai/signup?ref=googlecpc`), and apply GTM linker decoration to that final URL via `getDecoratedUrl()` (see `public/index.html:790-808`).

Note: the "no cookie" case isn't only organic traffic — paid users whose RedTrack GTM tag hasn't fired yet (GTM loads on `window.load`, so fast submitters beat it) also land here. Always implement the branch even on paid-only LPs.

## Email capture

Form submits POST to `/api/save-email` with `{ email, mode }`. The Vercel Function forwards to a Google Apps Script that appends a row to a Google Sheet. **The save is non-blocking** — the LP wraps it in `withTimeout(..., 600)` so a slow/failing save can never stall the redirect. Don't ever make the redirect await the save.

## Tracking

GTM container: `GTM-5VRS8QPJ` (loaded deferred on `window.load` on every LP). **The GTM container is the source of truth for event names** — verify against the live container (`curl https://www.googletagmanager.com/gtm.js?id=GTM-5VRS8QPJ`, the trigger predicates are readable in the config blob). Only `dataLayer` events with a matching GTM trigger do anything; any other name (e.g. `quiz_redirect`) fires **zero** tags and silently tracks nothing. Always push the names below.

### dataLayer events that have GTM triggers (push these, nothing else)

| Event | When to fire | GTM tag(s) it fires | Canonical payload |
|---|---|---|---|
| `quiz_start` | User begins the funnel (first real pick, e.g. style selected) | GA4 – quiz_start | `{ quiz:'<slug>', style:'<style>' }` |
| `quiz_step_2_complete` … `quiz_step_6_complete` | Funnel steps 2–6 done (triggers exist for all five) | GA4 – same name | `{ quiz:'<slug>', ... }` |
| **`quiz_email_captured`** | **Valid email submitted (the conversion)** | **Google Ads conversion (`__awct` id 18007387494 / label 4OSbCJXk-Z8cEObay4pD) + GA4 event renamed `generate_lead`** | `{ currency:'USD', value:1.0, user_data:{ email } }` |
| `visit_site_clicked` | Outbound click / redirect to `ourdream.ai` | GA4 – visit_site_clicked | `{ cta:'<slug>-<variant>' }` |
| `quiz_cta_clicked` | Competitor-page CTA into `/` quiz | GA4 – quiz_cta_clicked | `{ ... }` |

`Conversion Linker`, `Google Ads Tag`, and `Google Ads – Remarketing` fire on All-Pages/Initialization, so they're covered automatically once GTM loads.

### The lead conversion — push `quiz_email_captured`, NOT `generate_lead`

Counter-intuitive but verified against the live container (2026-07-23): **the trigger event is `quiz_email_captured`**; GTM maps it to a GA4 event *named* `generate_lead` plus the Google Ads conversion. There is **no trigger for a dataLayer event literally named `generate_lead`** — pushing `generate_lead` fires nothing. Every email-capturing LP MUST push this on valid email submit, before the redirect:

```js
window.dataLayer.push({ event: 'quiz_email_captured', currency: 'USD', value: 1.0, user_data: { email: email } });
```

`user_data.email` feeds Google Ads enhanced conversions — always include it. Fire it only after email validation passes (don't log junk leads). Reference: `public/index.html:705`.

## Adding a new landing page — checklist

1. Copy from `public/index.html` (canonical) or the closest existing LP. Never from `login.html` — its submit handler is the simplified ES5 variant and is missing the organic-traffic branch.
2. Add the URL rewrite to `vercel.json`.
3. Add the page row to the table in this file.
4. Confirm the submit handler:
   - Reads `rtkclickid-store` cookie for the paid path
   - Calls `getGlValue()` and passes the result into `sub19` — **never** `pageParams.get('_gl')`
   - Branches to a direct-to-offer URL (decorated via `getDecoratedUrl`) when no cookie
   - Fires the **GTM-wired** events (see Tracking) — at minimum `quiz_email_captured` on valid email submit (the Google Ads conversion) and `quiz_start` on funnel entry. Never invent event names; only the ones with GTM triggers do anything.
   - Wraps `saveEmail` in `withTimeout` so the redirect can't stall
5. Test with a real ad click in incognito and verify the final URL has `_gl=1*<base64-ish-string>`, not `_gl=undefined`.

## Don't

- Don't edit `.html` files at the repo root — `public/` is authoritative; root duplicates are stale orphans.
- Don't read `_gl` from `window.location.search`. Always use `getGlValue()`.
- Don't block the redirect on `saveEmail` — capture loss is acceptable, redirect drop-off is not.
- Don't add new RedTrack click slots without also updating the offer URL template in the RedTrack dashboard (the `_gl={sub19}` macro must be there or this whole pipeline is moot).
