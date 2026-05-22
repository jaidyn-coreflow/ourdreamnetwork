# /login landing page

**Date:** 2026-05-22
**Status:** Design approved, ready for implementation plan

## Goal

Add a new ad-funnel landing page served at `/login` that captures a visitor's email and forwards them to the existing affiliate offer at `clk.ourdreamnetwork.com/click/1`. The page is framed as a "log in for bonus dreamcoins" offer — not a real authentication flow.

## Scope

One new file plus one config change:

- `public/login.html` — the landing page itself
- `vercel.json` — add a `/login` → `/login.html` rewrite alongside the existing rewrites for `/candy`, `/top-sites`, etc.

Per project convention (memory: "Vercel deploys from public/"), the new HTML file lives in `public/` only. No root-level duplicate.

## Out of scope

- Real authentication (no password, no session, no user record).
- Gender split / quiz routing — this page is generic and routes directly to the affiliate offer.
- New shared CSS or JS modules — styles are inline in the page, matching the structure of `index.html`, `male.html`, `top-sites.html`, etc.
- Changes to `/api/save-email`, the Apps Script, the Google Sheet, or the affiliate redirect pipeline.
- Terms / Privacy disclaimer text under the form (explicitly declined).
- Listicle-style content, FAQ, hero sections — single card only.

## Page layout

A single centered dark card on the existing pink-radial-glow background.

**Background**: Reuse the ambient radial-gradient pink glow already defined in `index.html` (the `radial-gradient(ellipse, rgba(219,39,119,0.08) 0%, transparent 70%)` pattern on `#0a0a0a`). No new image asset.

**Card contents** (top to bottom):

1. **Logo** — `public/ourdreamnetworklogo.svg`, centered, ~180–220px wide on desktop, scaled down on mobile.
2. **Headline (H1)** — text: `Enter Your Email For 50 bonus dreamcoins on ourdream`. White, bold, centered. Use the same H1 treatment used elsewhere on the site (system-ui font stack, generous line-height). Pink accent (`#F17BB6`) is not required on this headline, but `ourdream` and `dreamcoins` may be wrapped in an accent span at implementer's discretion if it improves visual hierarchy.
3. **Email input** — full-width, rounded, dark fill, white text, placeholder `your@email.com`, `type="email"`, `required`, `autocomplete="email"`, `inputmode="email"`. Pink (`#F17BB6`) focus ring.
4. **Submit button** — full-width pink pill (`#F17BB6` background, white text, bold), label `Submit`. Subtle hover/active states matching the existing CTA buttons used on `index.html` and the listicle pages.
5. **Inline error slot** — hidden by default; shown in pink (`#F17BB6` or a lighter validation pink) when client-side validation fails.

The card uses a dark fill (e.g., `#161616` or `rgba(20,20,20,0.95)`), rounded corners (~16px), generous padding (~32px), and sits centered both vertically and horizontally in the viewport on desktop; on mobile it pins near the top with appropriate safe-area padding.

No header navbar, no footer, no other page chrome. The card is the entire page.

## Submit behavior

When the user submits the form (button click or Enter key):

1. **Validate** the email client-side. Use HTML5 `type="email"` plus a basic regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`). If invalid or empty, show the inline error (e.g., "Please enter a valid email") and do nothing else — no API call, no redirect.

2. **Build the redirect URL**:
   - Decode the base64-encoded affiliate base URL using the same `REDTRACK_BASE_B64` constant pattern used in `top-sites.html` (the constant `aHR0cHM6Ly9jbGsub3VyZHJlYW1uZXR3b3JrLmNvbS9jbGljay8x` decodes to `https://clk.ourdreamnetwork.com/click/1`).
   - Append `sub11=login` to identify this page as the traffic source in RedTrack reporting.
   - If the `rtkclickid-store` cookie is present, append `clickid=<value>` (URL-decoded from the cookie value). This matches the click-id pass-through behavior documented in memory (`project_quiz-redirect-architecture.md`) — `clickid` must be on the URL, not the cookie, by the time it hits RedTrack.
   - If a `_gl` query param is present on the current page URL (GA4 cross-domain linker), append `sub19=<_gl>` so cross-domain attribution is preserved.

3. **Fire-and-forget save**: send a `POST /api/save-email` with `{ email }` as JSON. Do **not** await the response in the redirect path. Race the fetch against a ~600ms timeout — when either resolves (or rejects), proceed to the redirect. A Sheets outage or network blip must not block the affiliate conversion.

4. **Fire GTM dataLayer event** `login_submit` (matches the snake_case convention introduced in commit `e84e67b`). Include `has_clickid: <boolean>` and `redirect_url: <built url>` in the event payload, mirroring the shape of the existing `quiz_redirect` event in `top-sites.html`.

5. **Redirect**: `window.location.href = url`.

Steps 3, 4, and 5 should not block each other in a way that delays the redirect noticeably — fire 3 immediately, fire 4 synchronously, then resolve 5 when the race in 3 settles.

## Files changed

- **New**: `public/login.html`
- **Modified**: `vercel.json` — add `{ "source": "/login", "destination": "/login.html" }` to the `rewrites` array

No other files are touched. No changes to `api/save-email.js`, the Apps Script, or any shared JS/CSS (there is no shared CSS in this project today; each page is self-contained).

## Open questions

None. All open items resolved during brainstorm:
- Logo: existing `ourdreamnetworklogo.svg`
- Headline copy: `Enter Your Email For 50 bonus dreamcoins on ourdream`
- Single Submit button (no separate Create/Login split)
- No Terms/Privacy disclaimer line
- `sub11=login` attribution tag
- GTM event name: `login_submit`
