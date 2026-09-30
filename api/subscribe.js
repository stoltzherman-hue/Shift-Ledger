/**
 * GET /api/subscribe?name=Sipho&modules=home,road&billing=monthly|annual
 * Price is computed here from the plan — any amount sent by the browser is ignored.
 */
import crypto from 'crypto';
import { resolvePlan, price, LABEL } from './_plans.js';

const MERCHANT_ID  = process.env.PAYFAST_MERCHANT_ID  || '33889659';
const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || 'voqia5jbq80wd';
const PASSPHRASE   = process.env.PAYFAST_PASSPHRASE; // REQUIRED — set in Vercel, never in code
const APP_URL      = (process.env.APP_URL || 'https://slipsync.africa').replace(/\/$/, '');

export default function handler(req, res) {
  if (!PASSPHRASE) return res.status(500).send('Payments not configured: set PAYFAST_PASSPHRASE in Vercel.');
  const q = req.query || {};
  const name = String(q.name || 'SlipSync user').slice(0, 60);
  const annual = q.billing === 'annual';
  const { plan, mods } = resolvePlan(q.modules);
  const amount = price(plan, annual);

  const data = {
    merchant_id: MERCHANT_ID, merchant_key: MERCHANT_KEY,
    return_url: `${APP_URL}/app?subscribed=1`,
    cancel_url: `${APP_URL}/app`,
    notify_url: `${APP_URL}/api/notify`,
    amount, item_name: LABEL[plan] + (annual ? ' (yearly)' : ''),
    item_description: 'Modules: ' + mods.join(', '),
    custom_str1: name, custom_str2: String(plan), custom_str3: mods.join(','), custom_str4: annual ? 'annual' : 'monthly',
    subscription_type: '1', billing_date: new Date().toISOString().slice(0, 10),
    recurring_amount: amount, frequency: annual ? '6' : '3', cycles: '0',
  };
  const sig = Object.entries(data).filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim()).replace(/%20/g, '+')}`).join('&')
    + `&passphrase=${encodeURIComponent(PASSPHRASE.trim()).replace(/%20/g, '+')}`;
  const signature = crypto.createHash('md5').update(sig).digest('hex');
  return res.redirect(302, 'https://www.payfast.co.za/eng/process?' + new URLSearchParams({ ...data, signature }));
}
