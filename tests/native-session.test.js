import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import { createHandler } from '../api/_native-session.js';
// Ephemeral mock cryptographic fixture; never saved, used externally or deployed.
const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
const PIN = '012345'; // invented fixture, NOT a live credential
const request = () => ({ method:'POST', headers:{'content-type':'application/json',origin:'https://localhost'}, query:{}, body:{pin:PIN} });
function setup(extra={}) {
 const commands=[]; let reads=0;
 const handler=createHandler({getPin:async()=>{reads++;return {active:true,mods:['shift','home','cur','road']};},durable:true,redis:async cmd=>{commands.push(cmd);return 1;},privateKeyPem,allowedOrigins:['https://localhost'],trustedIp:()=> '192.0.2.1',now:()=>1000000,...extra});
 return {commands,reads:()=>reads,run:async(req=request())=>{const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(v){this.code=v;return this;},json(v){this.body=v;return this;},end(){return this;}};await handler(req,res);return res;}};
}
test('signed session has bounded expiry, full existing modules and no PIN/PII',async()=>{const s=setup();const r=await s.run();assert.equal(r.code,200);const [h,p,sig]=r.body.token.split('.');assert.ok(verify(null,Buffer.from(h+'.'+p),publicKey,Buffer.from(sig,'base64url')));const data=JSON.parse(Buffer.from(p,'base64url'));assert.equal(data.exp-data.iat,43200);assert.equal(data.aud,'slipsync-android-private');assert.equal(data.iss,'slipsync-native');assert.deepEqual(data.modules,['shift','home','cur','road']);assert.ok(!JSON.stringify(data).includes(PIN));assert.ok(!JSON.stringify(s.commands).includes(PIN));assert.equal(s.commands.length,3);});
test('does not promote restricted modules',async()=>{const r=await setup({getPin:async()=>({active:true,mods:['shift']})}).run();assert.deepEqual(r.body.modules,['shift']);});
for(const [label,record] of [['unknown',null],['inactive',{active:false,mods:['shift']}],['malformed',{active:true,mods:['admin']}],['empty',{active:true,mods:[]}],['nonboolean',{active:'true',mods:['shift']}]] ) test(label+' fails uniformly',async()=>{const r=await setup({getPin:async()=>record}).run();assert.equal(r.code,401);assert.equal(r.body.error,'invalid_pin');});
test('rate limit fails before PIN read',async()=>{const s=setup({redis:async()=>1000});const r=await s.run();assert.equal(r.code,429);assert.equal(s.reads(),0);});
for(const extra of [{durable:false},{privateKeyPem:''},{trustedIp:()=>null},{redis:async()=>{throw Error('sensitive');}},{getPin:async()=>{throw Error('sensitive');}}]) test('configuration/outage fails closed without error leak',async()=>{const r=await setup(extra).run();assert.equal(r.code,503);assert.equal(r.body.error,'temporarily_unavailable');});
test('GET and query PIN rejected',async()=>{const r=request();r.method='GET';assert.equal((await setup().run(r)).code,405);r.query={pin:PIN};assert.equal((await setup().run(r)).code,400);});
test('strict allowed origins, no wildcard',async()=>{const r=request();r.headers.origin='https://evil.example';assert.equal((await setup().run(r)).code,403);});
test('native requests without Origin are accepted but not considered authenticated',async()=>{const r=request();delete r.headers.origin;assert.equal((await setup().run(r)).code,200);});
test('preflight has no credential permission',async()=>{const r=request();r.method='OPTIONS';const out=await setup().run(r);assert.equal(out.code,204);assert.equal(out.headers['Access-Control-Allow-Credentials'],undefined);});
test('bad body and non JSON rejected',async()=>{const r=request();r.body={pin:123456};assert.equal((await setup().run(r)).code,400);r.headers['content-type']='text/plain';assert.equal((await setup().run(r)).code,415);});

test('already blocked IP cannot consume global or per-PIN budgets',async()=>{
 const calls=[]; const counts=new Map();
 const s=setup({redis:async cmd=>{calls.push(cmd[3]);const n=(counts.get(cmd[3])||0)+1;counts.set(cmd[3],n);return n;}});
 for(let i=0;i<601;i++) await s.run();
 const global='native-session:rate:global';
 assert.equal(counts.get(global),20);
 assert.equal(calls.filter(k=>k.includes(':ip:')).length,601);
 assert.equal(calls.filter(k=>k.includes(':pin:')).length,20);
 const before=calls.length; assert.equal((await s.run()).code,429);
 assert.equal(calls.length,before+1); assert.equal(counts.get(global),20);
});
test('opaque subject has purpose-separated HMAC key',async()=>{const {createHmac}=await import('node:crypto');const r=await setup().run();const payload=JSON.parse(Buffer.from(r.body.token.split('.')[1],'base64url'));const subjectKey=createHmac('sha256',privateKeyPem).update('slipsync-native:subject:v1').digest();assert.equal(payload.sub,createHmac('sha256',subjectKey).update(PIN).digest('hex'));});
