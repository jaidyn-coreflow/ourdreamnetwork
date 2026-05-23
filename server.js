const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const CSV_FILE = path.join(__dirname, 'emails.csv');

app.use(express.json());

// Mirror Vercel's clean-URL rewrites from vercel.json
app.get('/male-quiz',        (_req, res) => res.sendFile(path.join(__dirname, 'public', 'male.html')));
app.get('/top-sites',        (_req, res) => res.sendFile(path.join(__dirname, 'public', 'top-sites.html')));
app.get('/top-gay-ai-sites', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'top-gay-ai-sites.html')));
app.get('/top-ai-bf-sites',  (_req, res) => res.sendFile(path.join(__dirname, 'public', 'top-ai-bf-sites.html')));
app.get('/candy',            (_req, res) => res.sendFile(path.join(__dirname, 'public', 'candy.html')));
app.get('/joi',              (_req, res) => res.sendFile(path.join(__dirname, 'public', 'joi.html')));
app.get('/lovescape',        (_req, res) => res.sendFile(path.join(__dirname, 'public', 'lovescape.html')));
app.get('/girlfriendgpt',    (_req, res) => res.sendFile(path.join(__dirname, 'public', 'girlfriendgpt.html')));

app.use(express.static(path.join(__dirname, 'public')));

// Create CSV with headers if it doesn't exist
if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(CSV_FILE, 'Email,Mode,Gender,Answer1,Answer2,Answer3,MarketingConsent,Timestamp\n');
}

app.post('/api/save-email', (req, res) => {
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

  fs.appendFileSync(CSV_FILE, row + '\n');
  console.log('Saved:', email);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Emails saved to: ${CSV_FILE}`);
});
