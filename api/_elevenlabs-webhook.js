import { createHmac, timingSafeEqual } from 'node:crypto';
const MAX_BYTES=1024*1024;
// Verify/discard only. No event persistence, forwarding, or application logging.
// Signature wire format matches ElevenLabs official SDK: HMAC-SHA256(timestamp.rawBody).
export function createWebhookHandler({secret=process.env.SLIPSYNC_ELEVENLABS_WEBHOOK_SECRET,now=()=>Math.floor(Date.now()/1000)}={}) {
 return async function handle(request) {
  const headers={'Cache-Control':'no-store','Pragma':'no-cache','Content-Type':'application/json'};
  const reply=(status,error)=>Response.json(error?{error}:{received:true},{status,headers});
  if(new URL(request.url).search) return reply(400,'invalid_request');
  if(request.method!=='POST')return new Response('{"error":"method_not_allowed"}',{status:405,headers:{...headers,Allow:'POST'}});
  if(typeof secret!=='string'||!secret.length)return reply(503,'temporarily_unavailable');
  if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||'')||request.headers.has('content-encoding'))return reply(415,'json_required');
  const signature=request.headers.get('elevenlabs-signature')||'';
  if(signature.length>512)return reply(400,'invalid_request');
  const parts=signature.split(',').map(x=>x.trim());
  const ts=parts.filter(x=>/^t=\d{1,12}$/.test(x));const sig=parts.filter(x=>/^v0=[0-9a-fA-F]{64}$/.test(x));
  if(parts.length!==2||ts.length!==1||sig.length!==1)return reply(400,'invalid_request');
  const timestamp=ts[0].slice(2);const seconds=Number(timestamp);const current=now();
  // Official SDK permits 30 minute delivery delay; reject >60s future clock skew too.
  // Replays inside this window are harmless repeated discards, not deduplicated storage.
  if(!Number.isSafeInteger(seconds)||!Number.isFinite(current)||seconds<current-1800||seconds>current+60)return reply(401,'invalid_signature');
  const length=request.headers.get('content-length');
  if(length!==null&&(!/^\d+$/.test(length)||Number(length)>MAX_BYTES))return reply(413,'body_too_large');
  let reader,timer;
  try {
   const chunks=[];let size=0,timedOut=false;
   reader=request.body?.getReader();
   timer=setTimeout(()=>{timedOut=true;reader?.cancel().catch(()=>{});},5000);
   if(reader)while(true){const chunk=await reader.read();if(timedOut)return reply(400,'invalid_request');if(chunk.done)break;size+=chunk.value.byteLength;if(size>MAX_BYTES){reader.cancel().catch(()=>{});return reply(413,'body_too_large');}chunks.push(Buffer.from(chunk.value));}
   const raw=Buffer.concat(chunks);
   const expected=createHmac('sha256',secret).update(timestamp+'.').update(raw).digest();
   const supplied=Buffer.from(sig[0].slice(3),'hex');
   if(!timingSafeEqual(expected,supplied))return reply(401,'invalid_signature');
   const event=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw));
   if(!event||typeof event!=='object'||Array.isArray(event))return reply(400,'invalid_request');
   // Deliberately do not read/log transcript, audio, identifiers, or analysis fields.
   return reply(200);
  } catch {return reply(400,'invalid_request');}
  finally {clearTimeout(timer);reader?.releaseLock();}
 };
}
