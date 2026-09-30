/**
 * PayFast ITN. Verified three ways before a PIN is issued:
 * 1) signature with passphrase, 2) PayFast server-side validate call, 3) amount matches the plan price.
 */
import crypto from 'crypto';
import { getPin, putPin } from './_store.js';
import { resolvePlan, price } from './_plans.js';

const OWNER = process.env.OWNER_EMAIL || 'stoltzherman@gmail.com';
const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '33889659';
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE;
const FROM = process.env.MAIL_FROM || 'SlipSync <onboarding@resend.dev>';

const enc = v => encodeURIComponent(String(v).trim()).replace(/%20/g, '+');
function paramString(b) { return Object.keys(b).filter(k => k !== 'signature').map(k => `${k}=${enc(b[k] ?? '')}`).join('&'); }
const genPin = () => String(crypto.randomInt(100000, 1000000));

export async function mail(to, subject, text) {
  const key = process.env.RESEND_API_KEY; if (!key || !to) { console.error('MAIL_SKIPPED', !key ? 'no RESEND_API_KEY' : 'no recipient'); return; }
  try {
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: FROM, to: [to], subject, text }) });
    const t = await r.text(); console.log('MAIL', r.status, to, t.slice(0, 200));
  } catch (e) { console.error('MAIL_FAIL', e.message); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  // IMPORTANT: on Vercel the function is frozen once it responds, so do all work BEFORE replying.
  const b = req.body || {};
  try {
    if (b.merchant_id !== MERCHANT_ID) throw new Error('merchant mismatch');
    const ps = paramString(b);
    const expect = crypto.createHash('md5').update(PASSPHRASE ? `${ps}&passphrase=${enc(PASSPHRASE)}` : ps).digest('hex');
    if (expect !== b.signature) throw new Error('bad signature');
    const v = await fetch('https://www.payfast.co.za/eng/query/validate', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: ps });
    if ((await v.text()).trim() !== 'VALID') throw new Error('validate failed');
    if (b.payment_status === 'CANCELLED' && b.token) {
      const idx = await getPin('sub-' + b.token);
      if (idx) { const r = await getPin(idx.pin); if (r) { r.active = false; r.cancelledAt = new Date().toISOString(); await putPin(idx.pin, r); } }
      console.log('SLIPSYNC_CANCELLED token=' + b.token); return res.status(200).end();
    }
    if (b.payment_status !== 'COMPLETE') { console.log('ITN_STATUS', b.payment_status); return res.status(200).end(); }

    const { plan, mods } = resolvePlan(b.custom_str3);
    const annual = b.custom_str4 === 'annual';
    if (Math.abs(parseFloat(b.amount_gross) - parseFloat(price(plan, annual))) > 0.01) throw new Error('amount mismatch ' + b.amount_gross);

    const token = b.token || b.pf_payment_id; // subscription token stays the same on renewals
    const name = b.custom_str1 || 'SlipSync user', email = (b.email_address || '').trim();
    // Renewal: reuse the existing PIN for this subscription
    let pin = null, renewal = false;
    if (b.token) { const idx = await getPin('sub-' + b.token); if (idx) { pin = idx.pin; renewal = true; } }
    if (!pin) { do { pin = genPin(); } while (await getPin(pin)); }
    const rec = { name, email, plan, mods, billing: annual ? 'annual' : 'monthly', token, active: true, paidAt: new Date().toISOString() };
    await putPin(pin, rec);
    if (b.token) await putPin('sub-' + b.token, { pin });
    console.log(`SLIPSYNC_PAYMENT name=${name} plan=${plan} mods=${mods} pin=${pin}`);
    if (renewal) return res.status(200).end(); // renewals keep the same PIN, no new email
    await mail(email, 'Your SlipSync PIN', `Hi ${name},\n\nWelcome to SlipSync.\n\nYour PIN: ${pin}\nYour plan: ${plan === 'all' ? 'All-Access' : mods.join(' + ')}\n\nOpen slipsync.africa/app, tap "Enter PIN", and you're in.\n\nThe shift doesn't lie.\nhello@slipsync.africa`);
    await mail(OWNER, `New SlipSync subscriber: ${name} (${plan})`, `Name: ${name}\nEmail: ${email}\nPlan: ${plan} (${mods.join(',')}) ${annual ? 'yearly' : 'monthly'}\nAmount: R${b.amount_gross}\nPIN: ${pin}`);
  } catch (e) { console.error('ITN_REJECTED', e.message, JSON.stringify({ id: b.pf_payment_id, amt: b.amount_gross })); }
  return res.status(200).end();
}
