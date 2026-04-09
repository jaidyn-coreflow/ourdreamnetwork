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
