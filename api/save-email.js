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
