/**
 * Owner-only PIN viewer. Go to /api/admin-pins to see all subscribers.
 * No auth — keep this URL private. Add ?deactivate=PIN to deactivate.
 */
import fs from 'fs';
const PIN_FILE='/tmp/sl_pins.json';
function pins(){try{return JSON.parse(fs.readFileSync(PIN_FILE,'utf8'));}catch(e){return {}}}
function savePins(p){try{fs.writeFileSync(PIN_FILE,JSON.stringify(p,null,2),'utf8');}catch(e){}}

export default function handler(req,res){
  const p=pins();
  if(req.query&&req.query.deactivate){
    const pin=req.query.deactivate;
    const entry=Object.entries(p).find(([,v])=>v.pin===pin);
    if(entry){p[entry[0]].active=false;savePins(p);}
    return res.status(200).json({ok:true,deactivated:pin});
  }
  const list=Object.values(p).map(x=>({name:x.name,email:x.email,pin:x.pin,active:x.active,created:x.created}));
  res.setHeader('Content-Type','application/json');
  return res.status(200).json({subscribers:list,total:list.length,active:list.filter(x=>x.active).length});
}
