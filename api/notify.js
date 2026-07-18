/**
 * PayFast ITN handler for ShiftLedger.
 * Called by PayFast on every successful subscription payment.
 * Generates a 6-digit PIN, stores it, logs it, and sends
 * an email notification to the owner via mailto trigger.
 */
import crypto from 'crypto';
import fs from 'fs';

const OWNER = 'stoltzherman@gmail.com';
const MERCHANT_ID = '33889659';
const PIN_FILE = '/tmp/sl_pins.json';

function pins() {
  try { return JSON.parse(fs.readFileSync(PIN_FILE,'utf8')); } catch(e) { return {}; }
}
function savePins(p) { try { fs.writeFileSync(PIN_FILE,JSON.stringify(p),'utf8'); } catch(e){} }
function genPin() { return String(Math.floor(100000+Math.random()*900000)); }

export default async function handler(req,res) {
  if(req.method!=='POST') return res.status(405).end();
  const b=req.body||{};
  if(b.merchant_id && b.merchant_id!==MERCHANT_ID) return res.status(400).end();
  if((b.payment_status||'')!=='COMPLETE') return res.status(200).json({ok:true});

  const email=(b.email_address||'').trim();
  const name=b.custom_str1?decodeURIComponent(b.custom_str1):'Waiter';
  const pfId=b.pf_payment_id||String(Date.now());

  const p=pins();
  let pin=genPin();
  const used=Object.values(p).map(x=>x.pin);
  while(used.includes(pin)) pin=genPin();
  p[pfId]={pin,email,name,created:new Date().toISOString(),active:true};
  savePins(p);

  // Always log — visible in Vercel function logs
  console.log(`SHIFTLEDGER_SUBSCRIBER name=${name} email=${email} pin=${pin} pfId=${pfId}`);

  // Notify owner via SendGrid/Resend if configured, else log only
  const RESEND_KEY=process.env.RESEND_API_KEY;
  if(RESEND_KEY && email) {
    // Email the waiter their PIN
    try {
      await fetch('https://api.resend.com/emails',{
        method:'POST',
        headers:{'Authorization':'Bearer '+RESEND_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({
          from:'ShiftLedger <onboarding@resend.dev>',
          to:[email],
          subject:'Your ShiftLedger PIN',
          text:`Hi ${name},\n\nWelcome to ShiftLedger Pro!\n\nYour PIN: ${pin}\n\nOpen the app and tap "Activate PIN" to get started.\n\nR49/month — cancel anytime.\n\nShiftLedger`
        })
      });
    } catch(e) { console.error('Resend waiter email failed:',e.message); }
    // Also notify owner
    try {
      await fetch('https://api.resend.com/emails',{
        method:'POST',
        headers:{'Authorization':'Bearer '+RESEND_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({
          from:'ShiftLedger <onboarding@resend.dev>',
          to:[OWNER],
          subject:`New ShiftLedger subscriber: ${name}`,
          text:`New subscriber!\n\nName: ${name}\nEmail: ${email}\nPIN: ${pin}\nPayFast ID: ${pfId}\n\nLog into PayFast to confirm payment.`
        })
      });
    } catch(e) { console.error('Resend owner email failed:',e.message); }
  }

  return res.status(200).json({ok:true});
}
