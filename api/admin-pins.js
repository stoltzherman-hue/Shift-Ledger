/**
 * Owner-only subscriber list. Requires ?key=<ADMIN_KEY> (set ADMIN_KEY in Vercel).
 * ?key=...&deactivate=123456 deactivates a PIN.
 */
import { listPins, getPin, putPin } from './_store.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const key = process.env.ADMIN_KEY;
  if (!key || (req.query || {}).key !== key) return res.status(401).json({ error: 'unauthorised' });
  const d = (req.query || {}).deactivate;
  if (d) { const r = await getPin(d); if (r) { r.active = false; await putPin(d, r); } return res.json({ ok: true, deactivated: d }); }
  const list = (await listPins()).filter(x => /^\d{6}$/.test(x.pin));
  return res.json({ total: list.length, active: list.filter(x => x.active).length, subscribers: list.map(({ pin, name, email, plan, mods, billing, active, paidAt }) => ({ pin, name, email, plan, mods, billing, active, paidAt })) });
}
