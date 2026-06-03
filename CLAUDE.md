# CLAUDE.md

Repo-level instructions for Claude Code. Read this before touching any landing page.

## What this repo is

Static-site marketing surface for `ourdreamnetwork.com`. A collection of paid-ad landing pages (quiz, listicles, competitor-comparison pages, login) that capture email + redirect users to the `ourdream.ai` product through RedTrack for attribution.

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
| `/male-quiz` | `male.html` | Male-companion quiz funnel | Yes |
| `/login` | `login.html` | Email-gate landing page | Yes |
| `/top-sites` | `top-sites.html` | Listicle (top AI sites) | Yes |
| `/top-gay-ai-sites` | `top-gay-ai-sites.html` | Listicle (gay AI sites) | Yes |
| `/top-ai-bf-sites` | `top-ai-bf-sites.html` | Listicle (AI boyfriend sites) | Yes |
| `/top-ai-companions` | `top-ai-companions.html` | Listicle (AI companion sites) | Yes |
| `/candy` | `candy.html` | Competitor comparison (Candy AI) | Yes |
| `/joi` | `joi.html` | Competitor comparison (Joi AI) | Yes |
| `/lovescape` | `lovescape.html` | Competitor comparison (Lovescape) | Yes |
| `/girlfriendgpt` | `girlfriendgpt.html` | Competitor comparison (GirlfriendGPT) | Yes |
| `/ai-roleplay` | (separate Next.js zone — `ai-roleplay/`) | AI roleplay character catalogue + chat funnel | Yes |
| `/privacy`, `/terms` | `privacy.html`, `terms.html` | Legal | No (no submit) |

When the user adds a new LP, update both this table and `vercel.json`.

**`/ai-roleplay` is NOT a `public/*.html` page.** It is a standalone Next.js app living in `ai-roleplay/` (App Router, `basePath: '/ai-roleplay'`), deployed as its **own Vercel project** and proxied in via two `vercel.json` rewrites (`/ai-roleplay` and `/ai-roleplay/:path*` → the zone's deployment URL). This is Vercel Multi-Zones — the existing static pages, the `/` quiz, and `/api/save-email.js` are untouched. The zone reuses romantasy's character components (reskinned to the `index.html` dark-pink theme). Its CTAs open an email-capture modal ("Free Trial Offer — 5 messages free") that reuses the SAME RedTrack/`getGlValue` funnel as the static LPs, but redirects to each character's `ourdream.ai/chat/<slug>` via a dedicated RedTrack slot `/click/2` (the quiz uses `/click/1`). Funnel events fire with `source: 'ai-roleplay'`. Edit the zone in `ai-roleplay/src/...`; it has its own build (`cd ai-roleplay && npm run build`).

**Competitor-comparison pages (`/candy`, `/joi`, `/lovescape`, `/girlfriendgpt`) do NOT capture email or use the redirect funnel below.** Their CTAs are plain `<a href="/?…">` links into the same-domain quiz at `/`, which owns the offer redirect. On load they only rewrite each `[data-quiz-cta]` anchor's href to forward inbound query params (`utm_*`, `gclid`, `cmpid`, …) and fire a `quiz_cta_clicked` dataLayer event. No email form, no modal, no `getGlValue`/RedTrack on these pages — the `rtkclickid-store` cookie (set on `cookiedomain=ourdreamnetwork.com`) persists same-domain to the quiz, which handles the cross-domain `_gl`/RedTrack hop. See `public/candy.html` (all four share identical markup, differing only in copy).

## The redirect funnel — how every email-capturing LP must work

Every email-capturing LP (quiz, listicles, login) submits the user into the same pipeline:

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

- GTM container: `GTM-5VRS8QPJ` (loaded deferred on `window.load` on every LP)
- Standard dataLayer events fired by LPs: `quiz_email_captured`, `quiz_redirect`, `quiz_start`, `quiz_step`
- New LPs must fire `quiz_email_captured` and `quiz_redirect` with `source: '<page-slug>'` so funnels segment correctly in GA4

## Adding a new landing page — checklist

1. Copy from `public/index.html` (canonical) or the closest existing LP. Never from `login.html` — its submit handler is the simplified ES5 variant and is missing the organic-traffic branch.
2. Add the URL rewrite to `vercel.json`.
3. Add the page row to the table in this file.
4. Confirm the submit handler:
   - Reads `rtkclickid-store` cookie for the paid path
   - Calls `getGlValue()` and passes the result into `sub19` — **never** `pageParams.get('_gl')`
   - Branches to a direct-to-offer URL (decorated via `getDecoratedUrl`) when no cookie
   - Fires `quiz_email_captured` and `quiz_redirect` with a unique `source` value
   - Wraps `saveEmail` in `withTimeout` so the redirect can't stall
5. Test with a real ad click in incognito and verify the final URL has `_gl=1*<base64-ish-string>`, not `_gl=undefined`.

## Don't

- Don't edit `.html` files at the repo root — `public/` is authoritative; root duplicates are stale orphans.
- Don't read `_gl` from `window.location.search`. Always use `getGlValue()`.
- Don't block the redirect on `saveEmail` — capture loss is acceptable, redirect drop-off is not.
- Don't add new RedTrack click slots without also updating the offer URL template in the RedTrack dashboard (the `_gl={sub19}` macro must be there or this whole pipeline is moot).
