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
