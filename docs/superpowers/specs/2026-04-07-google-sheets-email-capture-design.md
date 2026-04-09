# Google Sheets Email Capture — Design

**Date:** 2026-04-07
**Status:** Design (pending implementation plan)
**Author:** brainstormed with Claude

## Problem

The production email-capture endpoint (`/api/save-email`) has a 100% error rate. Every form submission fails with:

> `BlobError: Vercel Blob: Cannot use public access on a private store. The store is configured with private access.`

Root cause: `api/save-email.js` calls `put()` with `access: 'public'` against a blob store (`ourdreamnetwork-blob`) that was provisioned as private. The code and the store have never been compatible, so no email has ever been saved to production.

On top of the access mismatch, the existing design is fundamentally fragile for this use case:

- **Read-modify-write on every request** — the handler fetches the whole CSV, appends one row, and uploads it back. Concurrent submissions will silently overwrite each other.
- **CSV in a blob** — not queryable, not shareable, not easy to review leads in.

## Goal

Replace the broken Vercel Blob storage path with a reliable write into a **Google Sheet** owned by the user. The sheet becomes the single source of truth for lead captures in production. Local development keeps its existing CSV-based flow untouched.

## Non-goals

- Automated tests. The project has no existing test infrastructure; manual verification is sufficient for a single happy path plus two validation rejections.
- Form spam protection (rate limiting, captcha, honeypot). The `/api/save-email` endpoint stays publicly accessible as it is today. If spam becomes a problem, that is a separate fix.
- Migrating historical data. Production has never saved a row. Local `emails.csv` contains only 3 test rows and stays as-is.
- Changes to the frontend contract. `public/index.html` still POSTs the same JSON shape to `/api/save-email`.
- Changing the local dev flow. `server.js` keeps writing to `emails.csv`.

## Target sheet

- **URL:** https://docs.google.com/spreadsheets/d/1Z4PTVoJ_UFfxg_jK2wLbsQUP-gqi_Wa04UxrFJeBK7w/edit
- **Spreadsheet ID:** `1Z4PTVoJ_UFfxg_jK2wLbsQUP-gqi_Wa04UxrFJeBK7w`
- **Tab name:** `Sheet1`
- **Columns (row 1 headers, in order):**

| # | Column | Source |
|---|---|---|
| 1 | Timestamp | Vercel function, ISO 8601 UTC |
| 2 | Email | Request body |
| 3 | Mode | Request body (`companion` / `romance` / `adventure`) |
| 4 | Gender | Request body `answers[0]` when mode is `companion` or `romance`; empty otherwise |
| 5 | Answer 1 | Request body (mode-dependent offset) |
| 6 | Answer 2 | Request body (mode-dependent offset) |
| 7 | Answer 3 | Request body (mode-dependent offset) |
| 8 | Marketing Consent | Request body checkbox (`Yes` / `No`) |
| 9 | Country | `x-vercel-ip-country` request header (Vercel-injected) |
| 10 | User Agent | `user-agent` request header |

## Architecture

```
Browser (public/index.html saveEmail())
        │ POST { email, mode, answers, marketingConsent }
        ▼
Vercel Function  /api/save-email   (api/save-email.js)
        │
        │ 1. Parse + validate body
        │ 2. Normalize answers (mode-dependent gender/answer mapping)
        │ 3. Read x-vercel-ip-country, user-agent headers
        │ 4. Build full 10-field row payload
        │ 5. Attach shared secret
        │
        │ fetch(SHEETS_WEBHOOK_URL, POST JSON)
        ▼
Google Apps Script Web App (bound to the sheet)
        │
        │ 1. Parse e.postData.contents
        │ 2. Verify payload.secret === ScriptProperties.WEBHOOK_SECRET
        │ 3. Append row to Sheet1 in the 10-column order above
        │
        ▼
Google Sheet
```

### Why route through the Vercel function instead of having the browser POST directly to Apps Script

1. The shared secret stays server-side — the browser cannot leak it.
2. `x-vercel-ip-country` is injected by Vercel's edge; the browser cannot set it.
3. The frontend contract (`/api/save-email`) does not change — zero edits to `public/index.html`.
4. Same-origin requests avoid CORS complications with `script.google.com`.

## Components

### 1. `apps-script/append-row.gs` — Google Apps Script Web App

Lives in the Apps Script editor bound to the target sheet. A copy is committed to the repo at `apps-script/append-row.gs` for version control and code review. The repo copy is the canonical source; the Apps Script editor is updated by copy-paste from the repo file.

**Responsibilities:**

- Export `doPost(e)` as the HTTP handler.
- Parse `e.postData.contents` as JSON. On parse failure → return `{ ok: false, error: "bad_json" }`.
- Read `WEBHOOK_SECRET` from `PropertiesService.getScriptProperties()`.
- Verify `payload.secret === WEBHOOK_SECRET`. On mismatch → return `{ ok: false, error: "unauthorized" }` (no further detail).
- Validate that `payload.email` and `payload.mode` are non-empty strings. On failure → return `{ ok: false, error: "invalid_payload" }`.
- Build a 10-element row in column order:
  `[timestamp, email, mode, gender, answer1, answer2, answer3, marketingConsent, country, userAgent]`.
- Call `SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet1').appendRow(row)`.
- On success → return `{ ok: true }`.
- On any unexpected exception → log via `Logger.log` and return `{ ok: false, error: "append_failed" }`. Do not re-throw (a thrown exception produces an HTML error page, which the Vercel function cannot parse cleanly).

**Important — Apps Script response quirk:**

Google Apps Script Web Apps **always** return HTTP 200 for normal function returns. The script cannot set non-200 status codes. Thrown exceptions produce an HTML error page (not JSON) with an unpredictable status. Therefore:

- All responses — success and failure — use HTTP 200 with a JSON body.
- The `ok` field in the response body is the real success/failure signal, not the HTTP status.
- The script must catch all its own exceptions internally and convert them into `{ ok: false, error: "..." }` responses.

All returns use `ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON)`.

**Configuration:**

- `SHEET_ID` — hard-coded constant at the top of the script (the spreadsheet ID above).
- `TAB_NAME` — hard-coded constant, value `"Sheet1"`.
- `WEBHOOK_SECRET` — stored in Script Properties (Project Settings → Script Properties), not in code.

**Test helper:**

Include a `testAppend()` function in the script (not reachable via HTTP) that calls the same append logic with a synthetic payload. Used manually from the Apps Script editor to validate sheet wiring before the Vercel function is deployed.

**Deployment settings:**

- **Execute as:** Me (the owner of the sheet).
- **Who has access:** Anyone. (Apps Script's "Anyone with a Google account" option is not usable — Vercel functions have no Google account. The shared secret is the only access control.)

**Known Apps Script quirk:**

Apps Script Web Apps cannot read request headers — only the body and query string. Therefore the shared secret travels inside the JSON body as `payload.secret`, not in an `Authorization` or `X-Webhook-Secret` header. This is a deliberate tradeoff, not an oversight.

### 2. `api/save-email.js` — Vercel function (full rewrite)

Replaces the existing broken blob-based implementation. No changes to the module signature or HTTP contract — still `POST /api/save-email`, still accepts the same JSON body, still returns `{ success: true }` on success.

**Responsibilities:**

- Reject non-`POST` methods with 405.
- Parse and validate `req.body`. Required fields: `email` (non-empty string), `mode` (non-empty string). On failure → 400.
- Normalize answers the same way the current code does:
  - For `mode === 'companion'` or `'romance'`: `gender = answers[0]`, `a1 = answers[1]`, `a2 = answers[2]`, `a3 = answers[3]`.
  - Otherwise: `gender = ''`, `a1 = answers[0]`, `a2 = answers[1]`, `a3 = answers[2]`.
  - Any missing answer defaults to `''`.
- Compute `consent` as `marketingConsent ? 'Yes' : 'No'`.
- Compute `timestamp = new Date().toISOString()`.
- Read `country = req.headers['x-vercel-ip-country'] || ''`.
- Read `userAgent = req.headers['user-agent'] || ''`.
- Build the forward payload:
  ```js
  {
    secret: process.env.SHEETS_WEBHOOK_SECRET,
    timestamp, email, mode, gender,
    answer1: a1, answer2: a2, answer3: a3,
    marketingConsent: consent,
    country, userAgent
  }
  ```
- `fetch(process.env.SHEETS_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), redirect: 'follow' })`.
  - `redirect: 'follow'` is required: Apps Script Web App URLs issue a 302 to the actual `script.googleusercontent.com/macros/echo` URL. Node's `fetch` follows by default, but set it explicitly for clarity.
- Read the response body as text, then `JSON.parse` it. Because Apps Script always returns HTTP 200 regardless of success or failure, success is determined by parsing the body and checking `body.ok === true` — not by the HTTP status alone.
- **Failure conditions** (any of these → return 500 with `{ error: 'Failed to save' }` and `console.error('Sheets webhook error:', { status, body })`):
  - The `fetch` call throws (network error, timeout).
  - Response status is not 2xx.
  - Response body is not valid JSON (indicates Apps Script returned an HTML error page).
  - Parsed body does not have `ok === true`.
- On success (`body.ok === true`): return 200 with `{ success: true }`.
- Wrap the whole handler in try/catch so any unexpected exception is logged with `console.error` and results in a 500 instead of a function crash.

**Environment variables (new):**

| Name | Scope | Description |
|---|---|---|
| `SHEETS_WEBHOOK_URL` | Production, Preview, Development | The Apps Script Web App deployment URL |
| `SHEETS_WEBHOOK_SECRET` | Production, Preview, Development | 32-byte hex string, matches the Apps Script `WEBHOOK_SECRET` Script Property |

**Environment variables (removed):**

- `BLOB_READ_WRITE_TOKEN` — no longer referenced by any code after this change. Safe to delete from the Vercel project. Deletion is a manual dashboard step, not a code change.

### 3. `server.js` — local dev server (unchanged)

Keeps writing to `./emails.csv` as it does today. Rationale:

- Dev submissions must not pollute the real leads sheet.
- Local testing must not depend on network access to Google or a valid webhook secret.
- One source of truth per environment is cleaner than sharing state across dev/prod.

No edits to `server.js`. No edits to `emails.csv`.

### 4. `scripts/smoke-post.js` — smoke test helper (new)

A small Node script (~20 lines, zero dependencies) that POSTs a synthetic payload to any `/api/save-email` URL. Used to re-verify the end-to-end path without touching the real form UI.

**Usage:**

```bash
node scripts/smoke-post.js https://ourdreamnetwork.com/api/save-email
node scripts/smoke-post.js http://localhost:3000/api/save-email
```

The synthetic payload uses an obviously fake email like `smoke-test-<timestamp>@example.invalid` so sheet rows from smoke tests are easy to spot and delete.

### 5. Cleanup

- **`package.json`** — remove `"@vercel/blob": "^2.3.1"` from `dependencies`.
- **`package-lock.json`** — regenerated by `npm install` to drop `@vercel/blob` and its transitive deps.
- **`node_modules/@vercel/blob/`** — auto-removed by `npm install`.
- **Vercel dashboard (manual):**
  - Delete `BLOB_READ_WRITE_TOKEN` from project env vars.
  - Delete the `ourdreamnetwork-blob` blob store (Storage tab → store → Settings → Delete). Recommended to avoid future confusion; not strictly required.

## Auth & security

### Shared secret transport

Apps Script Web Apps cannot read HTTP headers, so the shared secret is carried in the JSON request body as `payload.secret`. Apps Script compares it to the `WEBHOOK_SECRET` Script Property. Mismatch → HTTP 200 with `{ ok: false, error: "unauthorized" }` (see the Apps Script response quirk in the component section — the script cannot return non-200 status codes).

### Secret generation

32-byte URL-safe random string, generated locally during setup:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The same value goes into:

1. Google Apps Script: Project Settings → Script Properties → `WEBHOOK_SECRET`.
2. Vercel: project Settings → Environment Variables → `SHEETS_WEBHOOK_SECRET` (Production, Preview, Development).

### Threat model

**What this design protects against:**

- URL leakage. If the Apps Script Web App URL is exposed in a screenshot, git commit, or browser devtools, callers still cannot append rows without the secret.
- Bots scanning Google's `/macros/s/` URL space. They hit the endpoint, fail the secret check, and get nothing.

**What this design does not protect against:**

- Form spam from real browsers hitting `/api/save-email` directly. The secret is server-side; the public endpoint is still open. If this becomes a problem, the fix is rate limiting / Turnstile / honeypot field — a separate concern, out of scope.
- Compromise of the Vercel project. An attacker with env var access can read the secret. At that point the broader system is compromised.
- Denial-of-service by flooding the sheet. Apps Script Web Apps have quota limits (daily invocations and execution time). A determined attacker could burn the quota. Out of scope.

### PII handling

Emails + quiz answers are PII.

- The target Google Sheet must **not** be publicly shared. Sharing should be restricted to the owner's account (and any collaborators they explicitly add) — **not** "anyone with link".
- Privacy policy review is out of scope per user decision. The user is expected to ensure the existing privacy policy covers email and quiz data collection.

## Data flow — worked example

**Input from browser:**

```json
{
  "email": "jane@example.com",
  "mode": "companion",
  "answers": ["female", "mysterious", "adventure", "listener"],
  "marketingConsent": true
}
```

**Vercel function builds and forwards:**

```json
{
  "secret": "<hex-secret>",
  "timestamp": "2026-04-07T18:23:11.000Z",
  "email": "jane@example.com",
  "mode": "companion",
  "gender": "female",
  "answer1": "mysterious",
  "answer2": "adventure",
  "answer3": "listener",
  "marketingConsent": "Yes",
  "country": "US",
  "userAgent": "Mozilla/5.0 ..."
}
```

**Apps Script appends to Sheet1:**

| Timestamp | Email | Mode | Gender | Answer 1 | Answer 2 | Answer 3 | Marketing Consent | Country | User Agent |
|---|---|---|---|---|---|---|---|---|---|
| 2026-04-07T18:23:11.000Z | jane@example.com | companion | female | mysterious | adventure | listener | Yes | US | Mozilla/5.0 ... |

## Error handling

**Vercel function** (HTTP status codes are under our control):

| Failure | Response | Logging |
|---|---|---|
| Non-POST method | 405 `{ error: 'Method not allowed' }` | none |
| Missing/invalid `email` or `mode` | 400 `{ error: 'Email and mode are required' }` | none |
| `fetch` to Apps Script throws | 500 `{ error: 'Failed to save' }` | `console.error('Sheets webhook error:', err)` |
| Apps Script non-2xx status | 500 `{ error: 'Failed to save' }` | `console.error('Sheets webhook error:', { status, body })` |
| Apps Script response not valid JSON | 500 `{ error: 'Failed to save' }` | `console.error('Sheets webhook error: non-JSON response', { status, body })` |
| Apps Script body `ok !== true` | 500 `{ error: 'Failed to save' }` | `console.error('Sheets webhook error:', { status, parsed })` |

**Apps Script** (all responses are HTTP 200 with a JSON body — see the Apps Script response quirk above):

| Failure | Response body | Logging |
|---|---|---|
| JSON parse failure | `{ ok: false, error: 'bad_json' }` | `Logger.log('bad_json')` |
| Secret mismatch | `{ ok: false, error: 'unauthorized' }` | `Logger.log('auth fail')` |
| Missing required field | `{ ok: false, error: 'invalid_payload' }` | `Logger.log('invalid_payload')` |
| `appendRow` throws | `{ ok: false, error: 'append_failed' }` | `Logger.log(err)` |

The browser-side `fetch` in `public/index.html:1255` already swallows errors silently (`.catch(err => console.error('Failed to save email:', err))`). This design does not change that behavior — a failed save is still invisible to the user. The operator debugs via Vercel function logs.

## Testing strategy

No automated tests. Manual verification in this order:

1. **Local sanity check.** Run `node server.js`, submit the form at `http://localhost:3000`, confirm a row appears in `./emails.csv`. Validates that the rewrite of `api/save-email.js` did not break the frontend → backend contract. Does not touch Google Sheets.
2. **Apps Script standalone test.** In the Apps Script editor, run the `testAppend()` helper function manually. Confirms the script + sheet wiring works before Vercel is involved.
3. **Vercel preview deploy.** `vercel deploy` (preview). Run `node scripts/smoke-post.js <preview-url>/api/save-email` to post a synthetic payload. Confirm a row lands in the sheet with a `smoke-test-*@example.invalid` email. Check `vercel logs --environment preview --status-code 500` is empty.
4. **Vercel production deploy.** Only after step 3 is green: `vercel deploy --prod`. Run `scripts/smoke-post.js` against the production URL, then submit one real form through the live site. Confirm both rows. Watch `vercel logs --environment production` for 5 minutes.

Rollback plan for step 4: if production errors return, revert the git commit and redeploy. The old blob code was already broken, so "rollback" means going back to zero emails captured, not a regression.

## Operational setup (manual, performed by user during execution)

These steps happen during plan execution, not design. Listed here for completeness.

1. Open the target sheet → Extensions → Apps Script.
2. Paste the contents of `apps-script/append-row.gs`.
3. Project Settings → Script Properties → add `WEBHOOK_SECRET` with the generated hex value.
4. Deploy → New deployment → Type: Web app → Execute as: Me → Who has access: Anyone → Deploy.
5. Copy the Web App URL.
6. Vercel dashboard → project Settings → Environment Variables:
   - Add `SHEETS_WEBHOOK_URL` = the URL from step 5 (Production, Preview, Development).
   - Add `SHEETS_WEBHOOK_SECRET` = the same hex value from step 3 (Production, Preview, Development).
7. Deploy: `vercel deploy --prod` (or merge to `main` if auto-deploy is configured).
8. Verify with the form + smoke-post.
9. Delete `BLOB_READ_WRITE_TOKEN` env var.
10. Delete `ourdreamnetwork-blob` blob store.

## Files touched

**New:**

- `apps-script/append-row.gs` — the Apps Script source, version controlled.
- `scripts/smoke-post.js` — smoke test helper.
- `docs/superpowers/specs/2026-04-07-google-sheets-email-capture-design.md` — this document.

**Modified:**

- `api/save-email.js` — full rewrite, no blob code.
- `package.json` — remove `@vercel/blob` dependency.
- `package-lock.json` — regenerated.

**Unchanged:**

- `public/index.html` — frontend contract is preserved.
- `server.js` — local dev flow is preserved.
- `emails.csv` — local test data is preserved.
- `vercel.json` — no routing changes needed.

## Open questions

None. All decisions are locked per the brainstorming session.
