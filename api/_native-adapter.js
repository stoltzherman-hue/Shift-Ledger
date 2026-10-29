import { isIP } from 'node:net';
import { createHandler } from './_native-session.js';
const failStore = () => new Error('store_unavailable');
// This adapter is only for verified direct Vercel ingress, never a generic proxy.
export function trustedVercelIp(headers, env) {
  const ip = headers['x-vercel-forwarded-for'];
  if (env.VERCEL !== '1' || typeof ip !== 'string' || !isIP(ip)) throw Error('trusted_address_unavailable');
  return isIP(ip) === 6 ? new URL('http://[' + ip + ']').hostname.slice(1,-1) : ip;
}
async function limitedStream(stream, limit, signal) {
  if (!stream) return '';
  const reader=stream.getReader(); const chunks=[]; let size=0;
  const abort=()=>{reader.cancel().catch(()=>{});};
  signal.addEventListener('abort',abort,{once:true});
  try {
    while(true) {
      if(signal.aborted) throw Error('timeout');
      const {done,value}=await reader.read();
      if(signal.aborted) throw Error('timeout');
      if(done) break;
      size+=value.byteLength;
      if(size>limit) { reader.cancel().catch(()=>{}); throw Error('too_large'); }
      chunks.push(Buffer.from(value));
    }
    return new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks));
  } finally { signal.removeEventListener('abort',abort); reader.releaseLock(); }
}
export async function readLimitedBody(request) {
  const length=request.headers.get('content-length');
  if(length!==null && (!/^\d+$/.test(length)||Number(length)>1024)) throw Error('too_large');
  const control=new AbortController();const timer=setTimeout(()=>control.abort(),2000);
  try {return await limitedStream(request.body,1024,control.signal);} finally {clearTimeout(timer);}
}
export function createRedisClient(env, fetcher=fetch) {
  // Match legacy precedence; never change the existing store or use its /tmp fallback.
  const endpoint=env.UPSTASH_REDIS_REST_URL||env.KV_REST_API_URL;
  const token=env.UPSTASH_REDIS_REST_TOKEN||env.KV_REST_API_TOKEN;
  const url=new URL(endpoint);
  if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||!token) throw failStore();
  return async command=>{
    const control=new AbortController();const timer=setTimeout(()=>control.abort(),2000);
    try {
      const response=await fetcher(url.href,{method:'POST',redirect:'error',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(command),signal:control.signal});
      if(!response.ok) throw failStore();
      const json=JSON.parse(await limitedStream(response.body,16384,control.signal));
      if(!json||typeof json!=='object'||Array.isArray(json)||json.error!==undefined||!Object.hasOwn(json,'result')) throw failStore();
      return json.result;
    } catch {throw failStore();} finally {clearTimeout(timer);}
  };
}
export function createWebHandler(env=process.env, fetcher=fetch) {
  return async request=>{
    const headers=new Headers({'Cache-Control':'no-store','Pragma':'no-cache','Vary':'Origin'});
    const failure=(status,error)=>Response.json({valid:false,error},{status,headers});
    const origin=request.headers.get('origin');
    if(origin&&origin!=='https://localhost') return failure(403,'origin_not_allowed');
    if(origin) headers.set('Access-Control-Allow-Origin',origin);
    if(new URL(request.url).search) return failure(400,'query_not_supported');
    if(request.method==='OPTIONS') {headers.set('Access-Control-Allow-Methods','POST');headers.set('Access-Control-Allow-Headers','Content-Type');return new Response(null,{status:204,headers});}
    if(request.method!=='POST') {headers.set('Allow','POST, OPTIONS');return failure(405,'method_not_allowed');}
    if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type')||'')) return failure(415,'json_required');
    if(request.headers.has('content-encoding')) return failure(415,'encoding_not_supported');
    let body;
    try {
      const raw=await readLimitedBody(request);
      // A deliberately narrow JSON grammar rejects duplicate fields and escaped aliases.
      if(!/^\s*\{\s*"pin"\s*:\s*"[0-9]{6}"\s*\}\s*$/.test(raw)) return failure(400,'invalid_request');
      body=JSON.parse(raw);
    } catch(error) {return failure(error.message==='too_large'?413:400,'invalid_request');}
    try {
      const redis=createRedisClient(env,fetcher);
      const getPin=async pin=>{const value=await redis(['GET','pin:'+pin]);if(value===null)return null;if(typeof value!=='string')throw failStore();return JSON.parse(value);};
      const core=createHandler({getPin,durable:true,redis,privateKeyPem:env.SLIPSYNC_NATIVE_PRIVATE_KEY,allowedOrigins:['https://localhost'],trustedIp:h=>trustedVercelIp(h.headers,env)});
      let status=200,output=null;
      const res={setHeader:(k,v)=>headers.set(k,v),status(n){status=n;return this;},json(value){output=value;return this;},end(){return this;}};
      await core({method:request.method,headers:Object.fromEntries(request.headers),query:{},body},res);
      return output===null?new Response(null,{status,headers}):Response.json(output,{status,headers});
    } catch {return failure(503,'temporarily_unavailable');}
  };
}
