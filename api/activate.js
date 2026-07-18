/**
 * PIN activation check for ShiftLedger.
 * Called by the app when a waiter enters their PIN.
 * Returns {valid: true} if PIN exists and is active.
 */
import fs from 'fs';

const PIN_FILE = '/tmp/sl_pins.json';

function pins() {
  try { return JSON.parse(fs.readFileSync(PIN_FILE,'utf8')); } catch(e) { return {}; }
}

export default function handler(req,res) {
  res.setHeader('Access-Control-Allow-Origin','*');
  const pin=(req.query&&req.query.pin||'').trim();
  if(!pin || pin.length!==6) return res.status(400).json({valid:false,error:'bad pin'});

  const p=pins();
  const match=Object.values(p).find(x=>x.pin===pin && x.active);
  if(match) {
    console.log(`PIN_ACTIVATED name=${match.name} email=${match.email}`);
    return res.status(200).json({valid:true,name:match.name});
  }
  return res.status(200).json({valid:false});
}
