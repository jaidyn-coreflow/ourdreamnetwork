const { put, head } = require('@vercel/blob');

const CSV_NAME = 'emails.csv';
const HEADERS = 'Email,Mode,Gender,Answer1,Answer2,Answer3,MarketingConsent,Timestamp\n';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, mode, answers, marketingConsent } = req.body;

  if (!email || !mode) {
    return res.status(400).json({ error: 'Email and mode are required' });
  }

  const hasGender = mode === 'companion' || mode === 'romance';
  const gender = hasGender ? (answers[0] || '') : '';
  const a1 = hasGender ? (answers[1] || '') : (answers[0] || '');
  const a2 = hasGender ? (answers[2] || '') : (answers[1] || '');
  const a3 = hasGender ? (answers[3] || '') : (answers[2] || '');
  const consent = marketingConsent ? 'Yes' : 'No';
  const timestamp = new Date().toISOString();

  const row = [email, mode, gender, a1, a2, a3, consent, timestamp]
    .map(v => '"' + String(v).replace(/"/g, '""') + '"')
    .join(',');

  try {
    // Try to fetch existing CSV
    let existing = HEADERS;
    try {
      const meta = await head(CSV_NAME, { token: process.env.BLOB_READ_WRITE_TOKEN });
      const response = await fetch(meta.url);
      existing = await response.text();
    } catch (e) {
      // File doesn't exist yet, start with headers
    }

    // Append new row and save
    const updated = existing + row + '\n';
    await put(CSV_NAME, updated, {
      access: 'public',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Blob storage error:', error);
    return res.status(500).json({ error: 'Failed to save' });
  }
};
