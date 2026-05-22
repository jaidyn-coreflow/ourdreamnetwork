# /login Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a new ad-funnel landing page at `/login` that captures a visitor's email and forwards them to the existing affiliate offer (`clk.ourdreamnetwork.com/click/1`), framed as a "50 bonus dreamcoins" hook.

**Architecture:** Single static HTML file in `public/` (project convention — see memory `project_vercel-public-source-of-truth`). Inline `<style>` and `<script>` blocks matching how `index.html`, `male.html`, and the listicle pages are structured. One new rewrite in `vercel.json`. Reuses the existing `/api/save-email` endpoint for capture and the existing base64-encoded `clk.ourdreamnetwork.com/click/1` pattern for affiliate redirect.

**Tech Stack:** Static HTML/CSS/JS, deployed via Vercel. Email pipeline: `/api/save-email` → Apps Script → Google Sheet (memory `project_email-capture-architecture`). Analytics: GTM dataLayer events.

**Spec:** `docs/superpowers/specs/2026-05-22-login-landing-design.md`

---

## File structure

- **Create:** `public/login.html` — the entire landing page (HTML + inline CSS + inline JS).
- **Modify:** `vercel.json` — add one rewrite entry mapping `/login` → `/login.html`.

No other files touched. No new dependencies, no shared CSS, no new API routes.

---

### Task 1: Scaffold the page (HTML + brand styling + visible card, no submit logic yet)

**Files:**
- Create: `public/login.html`

- [ ] **Step 1: Create `public/login.html`** with the full HTML structure, brand styling, logo, headline, email input, submit button, and inline error element. No submit-handler JS yet — the form will reload the page on submit, which is fine for this step.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>Log in | Ourdreamnetwork</title>
<meta name="description" content="Log in to ourdream and claim 50 bonus dreamcoins.">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
<link rel="dns-prefetch" href="https://clk.ourdreamnetwork.com">

<!-- Google Tag Manager (deferred to window load; events queued pre-load) -->
<script>
window.dataLayer = window.dataLayer || [];
addEventListener('load', function () {
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-5VRS8QPJ');
});
</script>
<!-- End Google Tag Manager -->

<style>
* { box-sizing: border-box; }
body {
  margin: 0;
  background: #0a0a0a;
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
  min-height: 100dvh;
  -webkit-font-smoothing: antialiased;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

/* Ambient pink-radial glow (matches index.html) */
.lp-ambient { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.lp-ambient::before {
  content: ''; position: absolute; top: -20%; left: -10%; width: 60%; height: 60%;
  background: radial-gradient(ellipse, rgba(219,39,119,0.10) 0%, transparent 70%);
  animation: lp-drift 20s ease-in-out infinite;
}
.lp-ambient::after {
  content: ''; position: absolute; bottom: -20%; right: -10%; width: 50%; height: 50%;
  background: radial-gradient(ellipse, rgba(219,39,119,0.08) 0%, transparent 70%);
  animation: lp-drift 25s ease-in-out infinite reverse;
}
@keyframes lp-drift {
  0%, 100% { transform: translate(0,0); }
  33% { transform: translate(5%,-3%); }
  66% { transform: translate(-3%,5%); }
}

.lp-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  background: rgba(20,20,20,0.95);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 32px 28px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
@media (min-width: 768px) {
  .lp-card { padding: 40px 36px; }
}

.lp-logo { display: block; width: 200px; max-width: 70%; height: auto; margin: 0 auto 24px; }
@media (min-width: 768px) { .lp-logo { width: 240px; margin-bottom: 28px; } }

.lp-h1 {
  font-size: 22px;
  line-height: 1.25;
  font-weight: 800;
  text-align: center;
  margin: 0 0 24px;
  letter-spacing: -0.01em;
}
.lp-h1-accent { color: #F17BB6; }
@media (min-width: 768px) { .lp-h1 { font-size: 26px; margin-bottom: 28px; } }

.lp-field { margin: 0 0 14px; }
.lp-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 16px;
  font-family: inherit;
  color: #fff;
  background: #0f0f0f;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  -webkit-appearance: none;
}
.lp-input::placeholder { color: rgba(255,255,255,0.35); }
.lp-input:focus {
  border-color: #F17BB6;
  box-shadow: 0 0 0 3px rgba(241,123,182,0.18);
}

.lp-error {
  display: none;
  font-size: 13px;
  color: #F17BB6;
  margin: -6px 0 12px;
  text-align: left;
}

.lp-submit {
  width: 100%;
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 700;
  font-family: inherit;
  color: #fff;
  background: #F17BB6;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s, transform 0.05s;
  -webkit-appearance: none;
}
.lp-submit:hover { background: #ec6aa9; }
.lp-submit:active { transform: translateY(1px); }
.lp-submit:disabled { opacity: 0.7; cursor: not-allowed; }
</style>
</head>
<body>

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5VRS8QPJ" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

<div class="lp-ambient" aria-hidden="true"></div>

<main class="lp-card">
  <img class="lp-logo" src="/ourdreamnetworklogo.svg" alt="ourdreamnetwork">
  <h1 class="lp-h1">Enter Your Email For <span class="lp-h1-accent">50 bonus dreamcoins</span> on ourdream</h1>

  <form id="login-form" novalidate>
    <div class="lp-field">
      <input
        id="email"
        class="lp-input"
        type="email"
        name="email"
        placeholder="your@email.com"
        autocomplete="email"
        inputmode="email"
        required
        aria-label="Email address">
    </div>
    <div id="login-error" class="lp-error" role="alert"></div>
    <button id="submit-btn" class="lp-submit" type="submit">Submit</button>
  </form>
</main>

</body>
</html>
```

- [ ] **Step 2: Verify the page renders correctly in a local browser**

Run: `node server.js` (or whatever local-dev command the repo uses — see `server.js` and `package.json`). Then open `http://localhost:3000/login.html` (the rewrite is added in Task 3, so use the `.html` path for this step).

Expected:
- Dark background with subtle pink radial-glow ambient effect.
- Centered dark card.
- ourdreamnetwork logo at top, centered.
- Headline "Enter Your Email For **50 bonus dreamcoins** on ourdream" (the bolded portion in pink `#F17BB6`).
- Email input with pink focus ring when clicked.
- Pink "Submit" button below.
- Responsive: card stays centered and readable down to ~360px viewport width.

Take a screenshot or visually confirm. If anything looks off (logo missing, glow not visible, layout broken), fix inline before continuing.

- [ ] **Step 3: Commit**

```bash
git add public/login.html
git commit -m "Scaffold /login landing page (HTML + brand styling)"
```

---

### Task 2: Wire up the submit handler (validation + email capture + affiliate redirect + GTM)

**Files:**
- Modify: `public/login.html` — append a `<script>` block just before `</body>`.

- [ ] **Step 1: Add the submit-handler script** just before `</body>` (after the `</main>` closing tag):

```html
<script>
(function () {
  // Base64 of "https://clk.ourdreamnetwork.com/click/1" — same pattern as top-sites.html.
  var REDTRACK_BASE_B64 = 'aHR0cHM6Ly9jbGsub3VyZHJlYW1uZXR3b3JrLmNvbS9jbGljay8x';
  var SAVE_EMAIL_TIMEOUT_MS = 600;

  var form = document.getElementById('login-form');
  var emailInput = document.getElementById('email');
  var errorEl = document.getElementById('login-error');
  var submitBtn = document.getElementById('submit-btn');

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }

  function clearError() {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }

  function buildRedirectUrl() {
    var base = atob(REDTRACK_BASE_B64);
    var url = new URL(base);
    url.searchParams.set('sub11', 'login');

    var cookieMatch = document.cookie.match(/(?:^|;\s*)rtkclickid-store=([^;]+)/);
    if (cookieMatch) {
      url.searchParams.set('clickid', decodeURIComponent(cookieMatch[1]));
    }

    var pageParams = new URLSearchParams(window.location.search);
    var gl = pageParams.get('_gl');
    if (gl) {
      url.searchParams.set('sub19', gl);
    }

    return url.toString();
  }

  function track(event, payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: event }, payload || {}));
  }

  function saveEmail(email) {
    return fetch('/api/save-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, mode: 'login' }),
    });
  }

  // Resolve when either the promise settles or the timeout fires — whichever is first.
  function withTimeout(promise, ms) {
    return new Promise(function (resolve) {
      var done = false;
      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        resolve();
      }, ms);
      promise.then(
        function () { if (done) return; done = true; clearTimeout(timer); resolve(); },
        function () { if (done) return; done = true; clearTimeout(timer); resolve(); }
      );
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var email = (emailInput.value || '').trim();
    if (!isValidEmail(email)) {
      showError('Please enter a valid email address.');
      emailInput.focus();
      return;
    }
    clearError();
    submitBtn.disabled = true;

    var redirectUrl = buildRedirectUrl();
    var hasClickId = /(?:^|;\s*)rtkclickid-store=/.test(document.cookie);

    track('login_submit', {
      redirect_url: redirectUrl,
      has_clickid: hasClickId,
    });

    withTimeout(saveEmail(email).catch(function () { /* swallow — must not block redirect */ }), SAVE_EMAIL_TIMEOUT_MS)
      .then(function () {
        window.location.href = redirectUrl;
      });
  });
})();
</script>
```

This script goes immediately after the `</main>` element and immediately before `</body>` in `public/login.html`.

- [ ] **Step 2: Verify validation rejects bad input**

Reload `http://localhost:3000/login.html`. With the email field empty, click Submit.

Expected:
- Inline error "Please enter a valid email address." appears in pink under the input.
- The page does NOT navigate.
- No network request to `/api/save-email` is fired (verify in DevTools Network tab).

Then type `notanemail` and click Submit. Same expected behavior.

Then type a real-looking email like `test@example.com` — proceed to next step (do NOT click Submit yet unless you want to test the live redirect).

- [ ] **Step 3: Verify the submit flow end-to-end against the local dev server**

In DevTools Network tab, enable "Preserve log". Type `test@example.com` and click Submit.

Expected:
- A `POST /api/save-email` request appears in Network tab with payload `{"email":"test@example.com","mode":"login"}`. The response status depends on whether `SHEETS_WEBHOOK_URL` / `SHEETS_WEBHOOK_SECRET` are set in your local env — if not, expect a 500; that is OK for this verification because the redirect must happen regardless.
- Within ~600ms the page navigates to `https://clk.ourdreamnetwork.com/click/1?sub11=login` (the URL bar should change before the affiliate site loads).
- A `login_submit` event was pushed to `dataLayer` (check `window.dataLayer` in the console before navigation, or check the GTM Preview/debug view if connected).

If the redirect does not happen within ~1 second, something is wrong with the timeout race — fix before committing.

- [ ] **Step 4: Verify clickid pass-through**

In DevTools console, set a fake RedTrack cookie:
```js
document.cookie = 'rtkclickid-store=' + encodeURIComponent('test-click-id-abc123') + '; path=/';
```

Reload the page, submit a valid email.

Expected: the redirect URL is `https://clk.ourdreamnetwork.com/click/1?sub11=login&clickid=test-click-id-abc123`.

Clean up: `document.cookie = 'rtkclickid-store=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';`

- [ ] **Step 5: Commit**

```bash
git add public/login.html
git commit -m "Add submit handler for /login (capture + affiliate redirect)"
```

---

### Task 3: Add the `/login` rewrite to `vercel.json`

**Files:**
- Modify: `vercel.json` — add one entry to the `rewrites` array.

- [ ] **Step 1: Read the current `vercel.json`** to see existing rewrites (so the new entry follows the same formatting).

Run: `cat vercel.json`

Expected current content (as of plan-writing time):
```json
{
  "buildCommand": "",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    { "source": "/api/save-email", "destination": "/api/save-email" },
    { "source": "/male-quiz", "destination": "/male.html" },
    { "source": "/top-sites", "destination": "/top-sites.html" },
    { "source": "/top-gay-ai-sites", "destination": "/top-gay-ai-sites.html" },
    { "source": "/top-ai-bf-sites", "destination": "/top-ai-bf-sites.html" },
    { "source": "/candy", "destination": "/candy.html" }
  ]
}
```

- [ ] **Step 2: Add the `/login` rewrite** as the last entry in the `rewrites` array.

Edit `vercel.json` so the `rewrites` array becomes:

```json
"rewrites": [
  { "source": "/api/save-email", "destination": "/api/save-email" },
  { "source": "/male-quiz", "destination": "/male.html" },
  { "source": "/top-sites", "destination": "/top-sites.html" },
  { "source": "/top-gay-ai-sites", "destination": "/top-gay-ai-sites.html" },
  { "source": "/top-ai-bf-sites", "destination": "/top-ai-bf-sites.html" },
  { "source": "/candy", "destination": "/candy.html" },
  { "source": "/login", "destination": "/login.html" }
]
```

- [ ] **Step 3: Validate JSON syntax**

Run: `node -e "JSON.parse(require('fs').readFileSync('vercel.json', 'utf8')); console.log('vercel.json is valid JSON');"`
Expected output: `vercel.json is valid JSON`

- [ ] **Step 4: Commit**

```bash
git add vercel.json
git commit -m "Add /login rewrite for new landing page"
```

---

### Task 4: Smoke-test the deployed preview

**Files:** None modified.

- [ ] **Step 1: Push the branch and let Vercel build a preview**

```bash
git push -u origin HEAD
```

Wait for Vercel to finish the preview deployment (check the GitHub PR or `vercel ls` for the URL). Preview URLs are protected — per memory `reference_vercel-preview-protection`, use `vercel curl --deployment <url>` for any scripted curls, but a normal browser hit works because the protection is auth-cookie based.

- [ ] **Step 2: Open the preview `/login` URL in a browser**

Visit `https://<preview-deployment>.vercel.app/login` (NOT `/login.html` — confirm the rewrite works).

Expected:
- Page loads (no 404).
- Visual matches what you saw locally in Task 1, Step 2.

- [ ] **Step 3: Submit a real test email against the preview**

Use an obviously-test email like `smoke-login-<timestamp>@example.invalid` so it's easy to find and delete from the Google Sheet later. Submit the form.

Expected:
- Redirect to `https://clk.ourdreamnetwork.com/click/1?sub11=login` (plus `clickid` if a real RedTrack cookie is set, plus `sub19=<_gl>` if you arrived with a GA4 cross-domain param).
- A new row appears in the Google Sheet with `email = smoke-login-<timestamp>@example.invalid`, `mode = login`, blank gender/answers, `marketingConsent = No`.

Verify the row in the Sheet, then delete the test row.

- [ ] **Step 4: Verify GTM dataLayer event fired**

If you have GTM Preview/Debug mode connected to the container `GTM-5VRS8QPJ`, confirm a `login_submit` event was recorded with `redirect_url` and `has_clickid` properties. If you don't have Preview connected, open DevTools on the preview page, type `window.dataLayer` in console before submitting, then submit — confirm an entry like `{event: 'login_submit', redirect_url: '...', has_clickid: false}` was pushed.

- [ ] **Step 5: Done — open or merge the PR**

If working on a branch with an open PR, post a summary comment with: preview URL, screenshot of the rendered page, and a note that smoke-test succeeded. Otherwise merge to `main` to ship.

---

## Notes for the implementing engineer

- **No test framework exists in this repo.** `npm test` exits 1 by design. The only automated test is `scripts/smoke-post.js` for the email API. Verification for this work is inline browser checks + a manual smoke against the deployed preview. Do not invent or wire up Jest/Playwright/etc. — the user has explicitly preferred inline verification for mechanical work like this (memory: `feedback_review-ceremony`).
- **`public/` is the source of truth.** Per memory `project_vercel-public-source-of-truth`, never create a root-level duplicate of `login.html`. Edit only `public/login.html`.
- **`/api/save-email` requires both `email` and `mode`.** The handler validates that both are non-empty strings (`api/save-email.js:22-27`); a missing or empty `mode` returns HTTP 400. This plan submits `mode: 'login'`, which the handler accepts and writes to the Sheet with blank gender/answers (it only extracts a gender when `mode === 'companion'` or `'romance'`).
- **The affiliate URL must keep the base64 indirection.** Don't put the raw `clk.ourdreamnetwork.com/click/1` URL in the page source — use the `REDTRACK_BASE_B64` constant and `atob()`, matching the existing pattern in `public/top-sites.html`.
- **`clickid` must be on the URL, not in a cookie, by the time it hits RedTrack.** Per memory `project_quiz-redirect-architecture`, always copy from `rtkclickid-store` cookie → `clickid` URL param at redirect time.
