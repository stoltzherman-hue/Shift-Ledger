/**
 * PIN store. Uses Upstash Redis (REST) when UPSTASH_REDIS_REST_URL/TOKEN are set —
 * persistent across all serverless instances. Falls back to /tmp (NOT durable) and logs loudly.
 */
import fs from 'fs';
const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOK  = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const TMP  = '/tmp/sl_pins.json';

async function redis(cmd) {
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: 'Bearer ' + TOK, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  const j = await r.json(); if (j.error) throw new Error(j.error); return j.result;
}
const tmpAll = () => { try { return JSON.parse(fs.readFileSync(TMP, 'utf8')); } catch (e) { return {}; } };

export const durable = !!(URL_ && TOK);

export async function getPin(pin) {
  if (durable) { const v = await redis(['GET', 'pin:' + pin]); return v ? JSON.parse(v) : null; }
  return tmpAll()['pin:' + pin] || null;
}
export async function putPin(pin, rec) {
  if (durable) { await redis(['SET', 'pin:' + pin, JSON.stringify(rec)]); await redis(['SADD', 'pins', pin]); return; }
  console.warn('PIN_STORE_NOT_DURABLE — set up Upstash Redis in Vercel. pin=' + pin);
  const a = tmpAll(); a['pin:' + pin] = rec; try { fs.writeFileSync(TMP, JSON.stringify(a)); } catch (e) {}
}
export async function pinExists(pin) { return !!(await getPin(pin)); }
export async function listPins() {
  if (durable) { const ps = await redis(['SMEMBERS', 'pins']); const out = []; for (const p of ps) { const r = await getPin(p); if (r) out.push({ pin: p, ...r }); } return out; }
  return Object.entries(tmpAll()).map(([k, v]) => ({ pin: k.slice(4), ...v }));
}
