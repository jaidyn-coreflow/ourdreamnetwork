const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const CSV_FILE = path.join(__dirname, 'emails.csv');

app.use(express.json());
app.use(express.static(__dirname));

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
  console.log(`Quiz: http://localhost:${PORT}/arcade-quiz.html`);
  console.log(`Emails saved to: ${CSV_FILE}`);
});
