/**
 * Generates a PayFast-signed subscription redirect URL server-side.
 * The passphrase never touches the browser.
 * GET /api/subscribe?name=Sipho → redirects to PayFast with valid signature.
 */
import crypto from 'crypto';

const MERCHANT_ID  = '33889659';
const MERCHANT_KEY = 'voqia5jbq80wd';
const PASSPHRASE   = process.env.PAYFAST_PASSPHRASE || 'Vida-app-2026';
const APP_URL      = process.env.APP_URL || 'https://shift-ledger-jcaw.vercel.app';

export default function handler(req, res) {
  const name = (req.query && req.query.name) || 'Waiter';
  const today = new Date().toISOString().slice(0, 10);

  // Build the payment data object — order matters for signature
  const data = {
    merchant_id:       MERCHANT_ID,
    merchant_key:      MERCHANT_KEY,
    return_url:        `${APP_URL}?subscribed=1`,
    cancel_url:        APP_URL,
    notify_url:        `${APP_URL}/api/notify`,
    amount:            '49.00',
    item_name:         'ShiftLedger Pro',
    item_description:  'Monthly shift ledger subscription',
    custom_str1:       name,
    subscription_type: '1',
    billing_date:      today,
    recurring_amount:  '49.00',
    frequency:         '3',
    cycles:            '0',
  };

  // Build signature string — all non-empty fields, URL-encoded, joined with &
  const sigString = Object.entries(data)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v)).replace(/%20/g, '+')}`)
    .join('&');

  const withPassphrase = PASSPHRASE
    ? `${sigString}&passphrase=${encodeURIComponent(PASSPHRASE).replace(/%20/g, '+')}`
    : sigString;

  const signature = crypto.createHash('md5').update(withPassphrase).digest('hex');

  // Build the PayFast URL
  const params = new URLSearchParams({ ...data, signature });
  const pfUrl = `https://www.payfast.co.za/eng/process?${params.toString()}`;

  return res.redirect(302, pfUrl);
}
