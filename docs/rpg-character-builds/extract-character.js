#!/usr/bin/env node
// Pull a live ourdream.ai character build out of its /chat/<slug> page.
//
//   node extract-character.js <slug> > build.json
//
// The chat page server-renders the whole character record into the RSC flight
// payload, so this needs no DB credentials. Long fields (scenario, extraDetails,
// personalityDetails) arrive as `$<id>` refs pointing at separate flight chunks,
// which this resolves.

const SLUG = process.argv[2];
if (!SLUG) {
  console.error('usage: node extract-character.js <chat-slug>');
  process.exit(1);
}

function flightStream(html) {
  let s = '';
  for (const m of html.matchAll(/self\.__next_f\.push\((\[.*?\])\)<\/script>/gs)) {
    try {
      const a = JSON.parse(m[1]);
      if (a[0] === 1 && typeof a[1] === 'string') s += a[1];
    } catch {}
  }
  return s;
}

// `<id>:T<hexlen>,<payload>` is length-prefixed in BYTES and is NOT newline-terminated —
// the next chunk id abuts it directly. A newline-splitting parser silently drops every
// chunk that follows a text chunk, which is exactly where the big fields live.
function chunkTable(stream) {
  const table = {};
  const buf = Buffer.from(stream, 'utf8');
  let p = 0;
  while (p < buf.length) {
    const m = /^([0-9a-f]+):/.exec(buf.slice(p, p + 24).toString('utf8'));
    if (!m) {
      const nl = buf.indexOf(0x0a, p);
      if (nl < 0) break;
      p = nl + 1;
      continue;
    }
    const q = p + Buffer.byteLength(m[0], 'utf8');
    const t = /^T([0-9a-f]+),/.exec(buf.slice(q, q + 16).toString('utf8'));
    if (t) {
      const len = parseInt(t[1], 16);
      const start = q + Buffer.byteLength(t[0], 'utf8');
      table[m[1]] = buf.slice(start, start + len).toString('utf8');
      p = start + len;
      if (buf[p] === 0x0a) p++;
    } else {
      let nl = buf.indexOf(0x0a, q);
      if (nl < 0) nl = buf.length;
      table[m[1]] = buf.slice(q, nl).toString('utf8');
      p = nl + 1;
    }
  }
  return table;
}

function objectAt(s, start) {
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (esc) { esc = false; continue; }
    if (c === '\\') { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) { try { return JSON.parse(s.slice(start, i + 1)); } catch { return null; } }
    }
  }
  return null;
}

// The slug sits on BOTH the scenario wrapper and the character inside it — pick by field.
function candidates(s, slug) {
  const needle = `"displayId":"${slug}"`;
  const found = [];
  let at = s.indexOf(needle);
  while (at >= 0) {
    let start = s.lastIndexOf('{', at);
    for (let up = 0; up < 8 && start >= 0; up++) {
      const o = objectAt(s, start);
      if (o) found.push(o);
      start = s.lastIndexOf('{', start - 1);
    }
    at = s.indexOf(needle, at + needle.length);
  }
  return found;
}

const deref = (v, t) => (typeof v === 'string' && /^\$[0-9a-f]+$/.test(v) ? (t[v.slice(1)] ?? v) : v);
const unwrapDate = (v) => (typeof v === 'string' && v.startsWith('$D') ? v.slice(2) : v);

(async () => {
  const res = await fetch(`https://ourdream.ai/chat/${SLUG}`, {
    headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0 Safari/537.36' },
  });
  if (!res.ok) { console.error(`fetch failed: ${res.status}`); process.exit(1); }

  const stream = flightStream(await res.text());
  const table = chunkTable(stream);
  const all = candidates(stream, SLUG);
  const ch = all.find((o) => 'personality' in o && 'characterImagePrompt' in o);
  const sc = all.find((o) => 'premise' in o) || {};
  if (!ch) { console.error('character record not found'); process.exit(1); }

  const out = {};
  for (const [k, v] of Object.entries(ch)) out[k] = unwrapDate(deref(v, table));
  out._scenario = {
    premise: deref(sc.premise, table),
    privateDetails: deref(sc.privateDetails, table),
    isGroupChat: sc.isGroupChat,
    uniformGender: sc.uniformGender,
    uniformStyle: sc.uniformStyle,
    likeCount: sc.likeCount,
    estimatedMessageCount: sc.estimatedMessageCount,
  };
  if (Array.isArray(out.initialMessages)) {
    out.initialMessages = out.initialMessages.map((turn) =>
      (Array.isArray(turn) ? turn : [turn]).map((p) => ({ ...p, content: deref(p.content, table) })),
    );
  }
  console.log(JSON.stringify(out, null, 2));
})();
