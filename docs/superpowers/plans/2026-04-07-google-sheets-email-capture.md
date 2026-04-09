# Google Sheets Email Capture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken Vercel Blob email-capture path with a Google Apps Script webhook that appends rows to a Google Sheet.

**Architecture:** Browser → Vercel function `/api/save-email` → Apps Script Web App (shared secret in body) → Google Sheet. The Vercel function stays as the only endpoint the browser talks to and acts as a trusted proxy that enriches the payload with `x-vercel-ip-country`, `user-agent`, and the shared secret.

**Tech Stack:** Node.js (Vercel Functions, native `fetch`), Google Apps Script (V8 runtime), Google Sheets.

**Spec:** `docs/superpowers/specs/2026-04-07-google-sheets-email-capture-design.md`

**Target sheet:**
- Spreadsheet ID: `1Z4PTVoJ_UFfxg_jK2wLbsQUP-gqi_Wa04UxrFJeBK7w`
- Tab: `Sheet1`
- Columns (in order): `Timestamp, Email, Mode, Gender, Answer 1, Answer 2, Answer 3, Marketing Consent, Country, User Agent`

**Testing approach:** No automated tests (project has no test infrastructure). Manual verification at every milestone via `testAppend()` in the Apps Script editor, `node scripts/smoke-post.js`, and real form submissions on preview + production deployments.

---

## File Structure

**New files:**
- `apps-script/append-row.gs` — Apps Script source, version controlled. The canonical copy; the Apps Script editor is updated by copy-paste from this file.
- `scripts/smoke-post.js` — ~40-line Node script that POSTs a synthetic payload to `/api/save-email` with an obviously-fake `smoke-test-*@example.invalid` email for easy identification.

**Modified files:**
- `api/save-email.js` — full rewrite. No blob code. Becomes a thin proxy to the Apps Script webhook.
- `package.json` — remove `@vercel/blob` dependency.
- `package-lock.json` — regenerated via `npm install`.

**Unchanged files:** `public/index.html`, `server.js`, `emails.csv`, `vercel.json`.

---

## Task 1: Generate the shared webhook secret

**Files:** none (local terminal only)

- [ ] **Step 1: Generate a 32-byte hex secret**

Run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Expected output: a 64-character lowercase hex string, for example:
```
a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
```

- [ ] **Step 2: Save the secret somewhere temporarily**

Copy it into a text buffer (password manager, temporary note — not into a git-tracked file). This exact value goes into two places later: the Apps Script `WEBHOOK_SECRET` Script Property (Task 3) and the Vercel `SHEETS_WEBHOOK_SECRET` env var (Task 5). They must match byte-for-byte.

**Do not commit it. Do not paste it into any file in this repo.**

---

## Task 2: Create the Apps Script source file

**Files:**
- Create: `apps-script/append-row.gs`

- [ ] **Step 1: Create the `apps-script/` directory**

Run:
```bash
mkdir -p apps-script
```

- [ ] **Step 2: Write `apps-script/append-row.gs`**

Create the file with exactly this content:

```javascript
/**
 * Google Apps Script Web App that appends email-capture rows to a Google Sheet.
 *
 * Deployment: Extensions → Apps Script in the target sheet. Paste this file,
 * set the WEBHOOK_SECRET Script Property, deploy as a Web App with
 * "Execute as: Me" and "Who has access: Anyone", then copy the Web App URL
 * into the SHEETS_WEBHOOK_URL env var on Vercel.
 *
 * IMPORTANT — Apps Script Web App quirk:
 * Apps Script Web Apps always return HTTP 200 for normal function returns.
 * The script cannot set non-200 status codes. Therefore success/failure is
 * encoded in the JSON body's `ok` field, not in the HTTP status. All
 * exceptions are caught internally and converted into
 * { ok: false, error: "..." } responses.
 */

const SHEET_ID = '1Z4PTVoJ_UFfxg_jK2wLbsQUP-gqi_Wa04UxrFJeBK7w';
const TAB_NAME = 'Sheet1';

function doPost(e) {
  try {
    // Parse body
    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      Logger.log('bad_json: ' + parseErr);
      return jsonResponse({ ok: false, error: 'bad_json' });
    }

    // Verify shared secret
    const expectedSecret = PropertiesService
      .getScriptProperties()
      .getProperty('WEBHOOK_SECRET');
    if (!expectedSecret || payload.secret !== expectedSecret) {
      Logger.log('auth fail');
      return jsonResponse({ ok: false, error: 'unauthorized' });
    }

    // Validate required fields
    if (
      typeof payload.email !== 'string' || payload.email.length === 0 ||
      typeof payload.mode !== 'string' || payload.mode.length === 0
    ) {
      Logger.log('invalid_payload');
      return jsonResponse({ ok: false, error: 'invalid_payload' });
    }

    // Build row in column order: Timestamp, Email, Mode, Gender,
    // Answer 1, Answer 2, Answer 3, Marketing Consent, Country, User Agent
    const row = [
      payload.timestamp || '',
      payload.email,
      payload.mode,
      payload.gender || '',
      payload.answer1 || '',
      payload.answer2 || '',
      payload.answer3 || '',
      payload.marketingConsent || '',
      payload.country || '',
      payload.userAgent || '',
    ];

    const sheet = SpreadsheetApp
      .openById(SHEET_ID)
      .getSheetByName(TAB_NAME);
    if (!sheet) {
      Logger.log('append_failed: sheet tab "' + TAB_NAME + '" not found');
      return jsonResponse({ ok: false, error: 'append_failed' });
    }
    sheet.appendRow(row);

    return jsonResponse({ ok: true });
  } catch (err) {
    Logger.log('append_failed: ' + err);
    return jsonResponse({ ok: false, error: 'append_failed' });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Manual test helper. Run from the Apps Script editor (Run > testAppend) to
 * verify the script can write to the sheet before deploying as a Web App.
 * Not reachable over HTTP.
 */
function testAppend() {
  const secret = PropertiesService
    .getScriptProperties()
    .getProperty('WEBHOOK_SECRET');
  if (!secret) {
    throw new Error('WEBHOOK_SECRET Script Property is not set');
  }

  const fakePayload = {
    secret: secret,
    timestamp: new Date().toISOString(),
    email: 'test-append-' + Date.now() + '@example.invalid',
    mode: 'companion',
    gender: 'female',
    answer1: 'mysterious',
    answer2: 'adventure',
    answer3: 'listener',
    marketingConsent: 'Yes',
    country: 'US',
    userAgent: 'testAppend()',
  };
  const fakeEvent = {
    postData: { contents: JSON.stringify(fakePayload) },
  };
  const result = doPost(fakeEvent);
  Logger.log('testAppend result: ' + result.getContent());
}
```

- [ ] **Step 3: Commit**

```bash
git add apps-script/append-row.gs
git commit -m "Add Apps Script webhook for email capture"
```

---

## Task 3: Deploy the Apps Script to Google (manual)

**Files:** none (happens entirely in the Google Sheets / Apps Script UI)

- [ ] **Step 1: Open the Apps Script editor bound to the sheet**

Open the target sheet: https://docs.google.com/spreadsheets/d/1Z4PTVoJ_UFfxg_jK2wLbsQUP-gqi_Wa04UxrFJeBK7w/edit

Click **Extensions → Apps Script**. A new tab opens with the Apps Script editor. There will be a default file called `Code.gs` with an empty `myFunction()`.

- [ ] **Step 2: Replace the default code**

Select all contents of `Code.gs` and delete. Paste the full contents of `apps-script/append-row.gs` (from Task 2).

Click the floppy-disk **Save** icon (or ⌘S / Ctrl+S).

- [ ] **Step 3: Set the WEBHOOK_SECRET Script Property**

In the Apps Script editor, click the gear icon **Project Settings** on the left sidebar.

Scroll to the **Script Properties** section. Click **Add script property**.

- Property: `WEBHOOK_SECRET`
- Value: *the hex secret generated in Task 1, Step 1*

Click **Save script properties**.

- [ ] **Step 4: Verify the Script Property is set**

Still on the Project Settings page, confirm `WEBHOOK_SECRET` appears in the Script Properties list (the value is hidden behind dots).

- [ ] **Step 5: Authorize the script to access the sheet**

Go back to the editor view. In the top bar, select the function dropdown (says "Select function"), choose `testAppend`, then click **Run**.

On the first run, Google will prompt for permissions. Click **Review permissions** → select your Google account → click **Advanced** → **Go to (unsafe)** → **Allow**. (This is Google's standard warning for unverified Apps Scripts. The script only writes to the one sheet you own.)

After authorization, `testAppend` will run. Check:
1. The **Execution log** at the bottom of the editor shows a line like `testAppend result: {"ok":true}`.
2. The target sheet has a new row with `test-append-<timestamp>@example.invalid` in the Email column.

If `testAppend result` shows anything other than `{"ok":true}`, stop here and debug before continuing. Common causes:
- `unauthorized` → `WEBHOOK_SECRET` Script Property was not saved correctly
- `append_failed: sheet tab "Sheet1" not found` → tab is not named `Sheet1`
- permission denied → authorization flow was not completed

- [ ] **Step 6: Deploy as a Web App**

Click the blue **Deploy** button in the top right → **New deployment**.

Click the gear icon next to "Select type" → **Web app**.

Fill in:
- **Description:** `ourdreamnetwork email capture v1`
- **Execute as:** Me (`<your-email>@...`)
- **Who has access:** **Anyone** (NOT "Anyone with a Google account" — Vercel functions have no Google account)

Click **Deploy**.

- [ ] **Step 7: Copy and save the Web App URL**

After deployment, Google shows a **Web app URL**. It looks like:

```
https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec
```

Copy it. This is the value for `SHEETS_WEBHOOK_URL` in Task 5. Save it to the same temporary note you used for the secret in Task 1.

Click **Done**.

- [ ] **Step 8: Delete the test row**

Open the sheet, find the row created by `testAppend` (the one with `test-append-*@example.invalid`), and delete it so it doesn't show up in real lead data.

---

## Task 4: Verify the deployed Apps Script endpoint with curl

**Files:** none (terminal verification)

- [ ] **Step 1: Post a valid request with the correct secret**

Replace `<WEB_APP_URL>` with the URL from Task 3 Step 7, and `<SECRET>` with the hex secret from Task 1.

```bash
curl -L -X POST '<WEB_APP_URL>' \
  -H 'Content-Type: application/json' \
  -d '{
    "secret": "<SECRET>",
    "timestamp": "2026-04-07T00:00:00.000Z",
    "email": "curl-test@example.invalid",
    "mode": "companion",
    "gender": "female",
    "answer1": "mysterious",
    "answer2": "adventure",
    "answer3": "listener",
    "marketingConsent": "Yes",
    "country": "US",
    "userAgent": "curl"
  }'
```

Note the `-L` flag: Apps Script Web Apps return a 302 redirect to `script.googleusercontent.com`, and `curl` needs `-L` to follow it.

Expected output:
```json
{"ok":true}
```

Verify the new row appears in the sheet with `curl-test@example.invalid`.

- [ ] **Step 2: Post a request with a wrong secret (negative test)**

```bash
curl -L -X POST '<WEB_APP_URL>' \
  -H 'Content-Type: application/json' \
  -d '{
    "secret": "wrong",
    "email": "curl-test@example.invalid",
    "mode": "companion"
  }'
```

Expected output:
```json
{"ok":false,"error":"unauthorized"}
```

Verify **no new row** appears in the sheet.

- [ ] **Step 3: Post a request with missing fields (negative test)**

```bash
curl -L -X POST '<WEB_APP_URL>' \
  -H 'Content-Type: application/json' \
  -d '{"secret": "<SECRET>"}'
```

Expected output:
```json
{"ok":false,"error":"invalid_payload"}
```

- [ ] **Step 4: Delete the `curl-test@example.invalid` row from the sheet**

Open the sheet, delete the row created in Step 1 so it doesn't pollute the real data.

---

## Task 5: Add the new environment variables to Vercel

**Files:** none (Vercel dashboard + CLI)

- [ ] **Step 1: Add `SHEETS_WEBHOOK_URL` to all environments**

Run:
```bash
npx vercel@latest env add SHEETS_WEBHOOK_URL
```

The CLI will prompt:
- Value: *paste the Web App URL from Task 3 Step 7*
- Environments: select **Production, Preview, Development** (use arrow keys + space to toggle, then Enter to confirm)

- [ ] **Step 2: Add `SHEETS_WEBHOOK_SECRET` to all environments**

Run:
```bash
npx vercel@latest env add SHEETS_WEBHOOK_SECRET
```

- Value: *paste the hex secret from Task 1 Step 1* (the same one you put in the Apps Script WEBHOOK_SECRET Script Property)
- Environments: Production, Preview, Development

- [ ] **Step 3: Verify both env vars are listed**

Run:
```bash
npx vercel@latest env ls
```

Expected: the output includes both `SHEETS_WEBHOOK_URL` and `SHEETS_WEBHOOK_SECRET` for all three environments. (Values are shown as "Encrypted".)

Example expected output (relevant rows):
```
 name                       value               environments                        created
 SHEETS_WEBHOOK_SECRET      Encrypted           Production, Preview, Development    just now
 SHEETS_WEBHOOK_URL         Encrypted           Production, Preview, Development    just now
 BLOB_READ_WRITE_TOKEN      Encrypted           Production, Preview, Development    29d ago
```

(Do not delete `BLOB_READ_WRITE_TOKEN` yet — that happens in Task 10.)

---

## Task 6: Rewrite `api/save-email.js` and drop the `@vercel/blob` dependency

**Files:**
- Modify: `api/save-email.js` (full rewrite)
- Modify: `package.json:22` (remove dependency line)
- Modify: `package-lock.json` (regenerated)

- [ ] **Step 1: Overwrite `api/save-email.js` with the new implementation**

Replace the entire contents of `api/save-email.js` with:

```javascript
/**
 * Forwards email-capture submissions to a Google Apps Script webhook that
 * appends a row to a Google Sheet.
 *
 * Environment variables (required):
 *   SHEETS_WEBHOOK_URL     — the Apps Script Web App deployment URL
 *   SHEETS_WEBHOOK_SECRET  — shared secret, matches Apps Script WEBHOOK_SECRET
 *
 * Apps Script Web Apps always return HTTP 200 regardless of success or
 * failure, so we cannot rely on the HTTP status code alone. Success is
 * determined by parsing the response body and checking body.ok === true.
 */

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, mode, answers, marketingConsent } = req.body || {};

    if (
      typeof email !== 'string' || email.length === 0 ||
      typeof mode !== 'string' || mode.length === 0
    ) {
      return res.status(400).json({ error: 'Email and mode are required' });
    }

    const answerArr = Array.isArray(answers) ? answers : [];
    const hasGender = mode === 'companion' || mode === 'romance';
    const gender = hasGender ? (answerArr[0] || '') : '';
    const a1 = hasGender ? (answerArr[1] || '') : (answerArr[0] || '');
    const a2 = hasGender ? (answerArr[2] || '') : (answerArr[1] || '');
    const a3 = hasGender ? (answerArr[3] || '') : (answerArr[2] || '');
    const consent = marketingConsent ? 'Yes' : 'No';
    const timestamp = new Date().toISOString();
    const country = req.headers['x-vercel-ip-country'] || '';
    const userAgent = req.headers['user-agent'] || '';

    const webhookUrl = process.env.SHEETS_WEBHOOK_URL;
    const webhookSecret = process.env.SHEETS_WEBHOOK_SECRET;
    if (!webhookUrl || !webhookSecret) {
      console.error('Sheets webhook not configured: missing SHEETS_WEBHOOK_URL or SHEETS_WEBHOOK_SECRET');
      return res.status(500).json({ error: 'Failed to save' });
    }

    const payload = {
      secret: webhookSecret,
      timestamp,
      email,
      mode,
      gender,
      answer1: a1,
      answer2: a2,
      answer3: a3,
      marketingConsent: consent,
      country,
      userAgent,
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Sheets webhook error:', { status: response.status, body: responseText });
      return res.status(500).json({ error: 'Failed to save' });
    }

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Sheets webhook error: non-JSON response', { status: response.status, body: responseText });
      return res.status(500).json({ error: 'Failed to save' });
    }

    if (parsed.ok !== true) {
      console.error('Sheets webhook error:', { status: response.status, parsed });
      return res.status(500).json({ error: 'Failed to save' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Sheets webhook error:', err);
    return res.status(500).json({ error: 'Failed to save' });
  }
};
```

- [ ] **Step 2: Remove `@vercel/blob` from `package.json`**

Open `package.json` and delete the line:
```json
"@vercel/blob": "^2.3.1",
```

The `dependencies` block should go from:
```json
  "dependencies": {
    "@vercel/blob": "^2.3.1",
    "express": "^5.2.1"
  }
```

to:
```json
  "dependencies": {
    "express": "^5.2.1"
  }
```

- [ ] **Step 3: Regenerate the lockfile**

Run:
```bash
npm install
```

Expected: `npm` removes `@vercel/blob` and its transitive deps (`throttleit`, `async-retry`, `retry`, `undici`, `is-node-process`, `is-buffer`). The `node_modules/@vercel/blob/` directory is deleted.

Verify:
```bash
ls node_modules/@vercel/blob 2>&1
```
Expected: `ls: node_modules/@vercel/blob: No such file or directory`

- [ ] **Step 4: Syntax-check the new function**

Run:
```bash
node --check api/save-email.js && echo OK
```

Expected output:
```
OK
```

- [ ] **Step 5: Commit**

```bash
git add api/save-email.js package.json package-lock.json
git commit -m "Rewrite /api/save-email to forward to Google Sheets webhook"
```

---

## Task 7: Create the smoke-post helper script

**Files:**
- Create: `scripts/smoke-post.js`

- [ ] **Step 1: Create the `scripts/` directory**

Run:
```bash
mkdir -p scripts
```

- [ ] **Step 2: Write `scripts/smoke-post.js`**

Create the file with exactly this content:

```javascript
#!/usr/bin/env node
/**
 * Smoke test for /api/save-email.
 *
 * Posts a synthetic payload with a smoke-test-<timestamp>@example.invalid
 * email so test rows in the Google Sheet are easy to spot and delete.
 *
 * Usage:
 *   node scripts/smoke-post.js <url>
 *
 * Examples:
 *   node scripts/smoke-post.js https://ourdreamnetwork.com/api/save-email
 *   node scripts/smoke-post.js http://localhost:3000/api/save-email
 *
 * Exits 0 on 2xx response, 1 otherwise.
 */

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/smoke-post.js <url>');
  process.exit(1);
}

const payload = {
  email: `smoke-test-${Date.now()}@example.invalid`,
  mode: 'companion',
  answers: ['female', 'mysterious', 'adventure', 'listener'],
  marketingConsent: true,
};

(async () => {
  console.log('POST', url);
  console.log('Payload:', JSON.stringify(payload));
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Body:   ${body}`);
    process.exit(res.ok ? 0 : 1);
  } catch (err) {
    console.error('smoke-post error:', err);
    process.exit(1);
  }
})();
```

- [ ] **Step 3: Syntax-check the script**

Run:
```bash
node --check scripts/smoke-post.js && echo OK
```

Expected output:
```
OK
```

- [ ] **Step 4: Commit**

```bash
git add scripts/smoke-post.js
git commit -m "Add smoke-post helper for /api/save-email"
```

---

## Task 8: Local sanity check against `server.js`

**Files:** none (local runtime verification)

This verifies that the local dev path (`server.js` writing to `emails.csv`) still works after the Vercel function rewrite. `server.js` is unchanged, but the check is cheap and catches accidental frontend breakage.

- [ ] **Step 1: Start the local dev server**

In one terminal:
```bash
node server.js
```

Expected output:
```
Server running at http://localhost:3000
Quiz: http://localhost:3000/arcade-quiz.html
Emails saved to: /Users/.../ourdreamnetwork/emails.csv
```

Leave this running.

- [ ] **Step 2: Smoke-post against the local server**

In a second terminal:
```bash
node scripts/smoke-post.js http://localhost:3000/api/save-email
```

Expected output (approximate):
```
POST http://localhost:3000/api/save-email
Payload: {"email":"smoke-test-...@example.invalid","mode":"companion","answers":["female","mysterious","adventure","listener"],"marketingConsent":true}
Status: 200
Body:   {"success":true}
```

- [ ] **Step 3: Verify a row was appended to `emails.csv`**

Run:
```bash
tail -1 emails.csv
```

Expected: a line containing `smoke-test-*@example.invalid` with mode `companion`, gender `female`, answers `mysterious,adventure,listener`, consent `Yes`, and a current timestamp.

- [ ] **Step 4: Stop the dev server**

Press Ctrl+C in the first terminal.

- [ ] **Step 5: Do not commit `emails.csv`**

`emails.csv` is untracked and contains test data. Leave it unstaged — we are not tracking it. Confirm with:
```bash
git status
```
Expected: `emails.csv` is listed under "Untracked files". Do **not** `git add` it.

---

## Task 9: Deploy to a Vercel preview and verify end-to-end

**Files:** none (deploys + verification)

- [ ] **Step 1: Deploy a preview**

Run:
```bash
npx vercel@latest deploy
```

The CLI will print a preview URL like:
```
✅ Production: https://ourdreamnetwork-xxxxxxxxx-jaidyn-6492s-projects.vercel.app
```

(Despite the "Production:" label on the line, `vercel deploy` without `--prod` deploys to preview.)

Copy the preview URL.

- [ ] **Step 2: Smoke-post against the preview**

Run (substitute `<PREVIEW_URL>`):
```bash
node scripts/smoke-post.js <PREVIEW_URL>/api/save-email
```

Expected output:
```
Status: 200
Body:   {"success":true}
```

- [ ] **Step 3: Verify the row appears in the sheet**

Open the target sheet: https://docs.google.com/spreadsheets/d/1Z4PTVoJ_UFfxg_jK2wLbsQUP-gqi_Wa04UxrFJeBK7w/edit

Confirm a new row with `smoke-test-*@example.invalid` in the Email column. Check that:
- Timestamp is populated and roughly "now"
- Mode: `companion`
- Gender: `female`
- Answers 1–3: `mysterious`, `adventure`, `listener`
- Marketing Consent: `Yes`
- Country: populated (may be a 2-letter code like `US`, `GB`, or blank if Vercel couldn't resolve the IP)
- User Agent: populated (will be Node's fetch user agent, e.g. `node` or similar)

- [ ] **Step 4: Check preview logs for errors**

Run:
```bash
npx vercel@latest logs --environment preview --status-code 500 --since 10m
```

Expected: no results, or only old errors from before this deployment. No new "Sheets webhook error" lines.

- [ ] **Step 5: Negative test — submit the real form on the preview URL**

Open `<PREVIEW_URL>` in a browser. Go through the quiz flow (pick a mode, answer questions, submit with an email like `preview-test@example.com`).

- [ ] **Step 6: Verify the form submission row lands in the sheet**

Check the sheet. A new row should appear with `preview-test@example.com`, the mode you picked, the answers you picked, your real country (resolved from your IP), and your real browser user agent.

- [ ] **Step 7: If any step failed, stop here and debug**

Do not proceed to production until preview is green. To debug, check:
```bash
npx vercel@latest logs --environment preview --expand --since 10m
```

Common issues:
- `Sheets webhook not configured` → env vars not set for Preview environment; re-run Task 5 Step 3 to verify
- `Sheets webhook error: non-JSON response` → Apps Script deployment is broken; re-run Task 4 curl tests
- `Sheets webhook error: { parsed: { ok: false, error: "unauthorized" } }` → `SHEETS_WEBHOOK_SECRET` on Vercel does not match the Apps Script `WEBHOOK_SECRET` Script Property

- [ ] **Step 8: Delete the test rows from the sheet**

Delete the `smoke-test-*@example.invalid` and `preview-test@example.com` rows from the sheet.

---

## Task 10: Deploy to production and verify

**Files:** none

- [ ] **Step 1: Deploy to production**

Run:
```bash
npx vercel@latest deploy --prod
```

Expected: the CLI prints a production URL. The real custom domain `https://ourdreamnetwork.com` will start routing to this new deployment within seconds.

- [ ] **Step 2: Smoke-post against production**

Run:
```bash
node scripts/smoke-post.js https://ourdreamnetwork.com/api/save-email
```

Expected output:
```
Status: 200
Body:   {"success":true}
```

- [ ] **Step 3: Verify the row in the sheet**

Same verification as Task 9 Step 3, but look for the newest `smoke-test-*@example.invalid` row.

- [ ] **Step 4: Submit one real form on production**

Open https://ourdreamnetwork.com in a browser. Complete the quiz with a test email you control (e.g. `<your-name>+prodtest@gmail.com`). Submit.

- [ ] **Step 5: Verify the real-form row appears in the sheet**

Within a few seconds, a new row should appear with your test email, the mode/answers you picked, your real country, and your real browser user agent.

- [ ] **Step 6: Watch production logs for 5 minutes**

In a terminal:
```bash
npx vercel@latest logs --environment production --expand --since 10m
```

Scroll back through any recent `/api/save-email` entries. There should be zero "Sheets webhook error" lines.

Also check the Vercel Functions dashboard — the Error % should drop from 100% toward 0% as new requests come in.

- [ ] **Step 7: Delete the test rows from the sheet**

Delete the `smoke-test-*@example.invalid` and `<your-name>+prodtest@gmail.com` rows.

- [ ] **Step 8: If production has errors, roll back**

If production is still erroring:
```bash
git log --oneline -5
git revert <commit-sha-from-task-6>
git push
```

Then re-run `npx vercel@latest deploy --prod` to redeploy the reverted state. The site will return to the pre-fix state (still broken, but no worse).

---

## Task 11: Cleanup — remove the old blob env var and delete the blob store

**Files:** none (all Vercel dashboard)

This happens only after Task 10 is fully green.

- [ ] **Step 1: Delete the `BLOB_READ_WRITE_TOKEN` env var**

Run:
```bash
npx vercel@latest env rm BLOB_READ_WRITE_TOKEN
```

The CLI will prompt for the environment(s) to remove it from — select **all three** (Production, Preview, Development).

Confirm with:
```bash
npx vercel@latest env ls
```
Expected: `BLOB_READ_WRITE_TOKEN` no longer appears.

- [ ] **Step 2: Delete the `ourdreamnetwork-blob` blob store**

This is a dashboard-only action (no CLI command for it).

1. Open https://vercel.com → the `ourdreamnetwork` project → **Storage** tab.
2. Click `ourdreamnetwork-blob`.
3. Click **Settings** (or the three-dot menu).
4. Scroll to the **Delete** section.
5. Confirm the delete by typing the store name if prompted.

- [ ] **Step 3: Final verification**

Submit one more real form on https://ourdreamnetwork.com. Confirm a new row appears in the sheet. This proves nothing was broken by removing the blob env var or store.

- [ ] **Step 4: Delete the final test row from the sheet**

---

## Task 12: Update the project task tracker and wrap up

**Files:** none

- [ ] **Step 1: Mark all plan tasks complete**

If you were tracking this work with the `TaskCreate`/`TaskUpdate` tools, mark all plan tasks as completed.

- [ ] **Step 2: Shred the shared secret from your temporary note**

Delete the hex secret and the Web App URL from wherever you temporarily saved them in Task 1 / Task 3. The canonical copies now live in:
- Google Apps Script Script Properties (`WEBHOOK_SECRET`)
- Vercel env vars (`SHEETS_WEBHOOK_URL`, `SHEETS_WEBHOOK_SECRET`)

- [ ] **Step 3: Announce "done"**

Report to the user: production `/api/save-email` is now writing to the Google Sheet. Error rate should be 0%. Old blob path is fully cleaned up.

---

## Summary of commits produced by this plan

In order:
1. `Add Apps Script webhook for email capture` (Task 2) — adds `apps-script/append-row.gs`
2. `Rewrite /api/save-email to forward to Google Sheets webhook` (Task 6) — rewrites `api/save-email.js`, drops `@vercel/blob` dep, regenerates lockfile
3. `Add smoke-post helper for /api/save-email` (Task 7) — adds `scripts/smoke-post.js`

No commits for Tasks 1, 3, 4, 5, 8, 9, 10, 11, 12 — those are generating secrets, dashboard / CLI ops, manual verification, or cleanup.
