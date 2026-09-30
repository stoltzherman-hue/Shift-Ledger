/** GET /api/activate?pin=123456 → {valid, name, plan, modules} */
import { getPin } from './_store.js';
import { MODULES } from './_plans.js';
const MASTER = (process.env.MASTER_PINS || '100100').split(',').map(s => s.trim());
const hits = new Map(); // light brute-force brake per instance

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0];
  const h = hits.get(ip) || { n: 0, t: Date.now() }; if (Date.now() - h.t > 6e5) { h.n = 0; h.t = Date.now(); }
  if (++h.n > 20) { hits.set(ip, h); return res.status(429).json({ valid: false, error: 'Too many attempts. Try again in 10 minutes.' }); }
  hits.set(ip, h);
  const pin = String((req.query && req.query.pin) || '').trim();
  if (!/^\d{6}$/.test(pin)) return res.status(400).json({ valid: false, error: 'PIN must be 6 digits' });
  if (MASTER.includes(pin)) return res.status(200).json({ valid: true, name: 'Owner', plan: 'all', modules: MODULES });
  const r = await getPin(pin).catch(() => null);
  if (r && r.active && r.mods) return res.status(200).json({ valid: true, name: r.name, plan: r.plan, modules: r.mods });
  return res.status(200).json({ valid: false });
}
