/**
 * Owner-only. Requires ?key=<ADMIN_KEY>.
 *  list:        /api/admin-pins?key=...
 *  deactivate:  &deactivate=123456
 *  issue PIN:   &issue=1&email=a@b.com&name=Sipho&modules=home[,road]   (manual recovery / comps)
 */
import crypto from 'crypto';
import { listPins, getPin, putPin } from './_store.js';
import { resolvePlan } from './_plans.js';
import { mail } from './notify.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const q = req.query || {}, key = process.env.ADMIN_KEY;
  if (!key || q.key !== key) return res.status(401).json({ error: 'unauthorised' });
  if (q.deactivate) { const r = await getPin(q.deactivate); if (r) { r.active = false; await putPin(q.deactivate, r); } return res.json({ ok: true, deactivated: q.deactivate }); }
  if (q.issue) {
    const { plan, mods } = resolvePlan(q.modules); const name = String(q.name || 'SlipSync user').slice(0, 60), email = String(q.email || '').trim();
    let pin; do { pin = String(crypto.randomInt(100000, 1000000)); } while (await getPin(pin));
    await putPin(pin, { name, email, plan, mods, billing: 'manual', active: true, paidAt: new Date().toISOString() });
    await mail(email, 'Your SlipSync PIN', `Hi ${name},\n\nWelcome to SlipSync.\n\nYour PIN: ${pin}\nYour plan: ${plan === 'all' ? 'All-Access' : mods.join(' + ')}\n\nOpen www.slipsync.africa/app, tap "I already have a PIN", and you're in.\n\nThe shift doesn't lie.\nhello@slipsync.africa`);
    return res.json({ ok: true, pin, plan, mods, emailedTo: email || null });
  }
  const list = (await listPins()).filter(x => /^\d{6}$/.test(x.pin));
  return res.json({ total: list.length, active: list.filter(x => x.active).length, subscribers: list.map(({ pin, name, email, plan, mods, billing, active, paidAt }) => ({ pin, name, email, plan, mods, billing, active, paidAt })) });
}
