import { createPrivateKey, createHmac, sign } from 'node:crypto';
const MODULES = ['shift', 'home', 'cur', 'road'];
const TTL = 12 * 60 * 60;
const LUA = `local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n`;
const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');

// Dependency injected for unit tests. Never pass real credentials to the tests.
export function createHandler({ getPin, durable, redis, privateKeyPem, allowedOrigins = [], trustedIp, now = () => Date.now() }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Vary', 'Origin');
    const fail = (status, error) => res.status(status).json({ valid: false, error });
    // Even rejected URLs can have been logged by the host: client must NEVER put PINs here.
    if (req.query && Object.keys(req.query).length) return fail(400, 'query_not_supported');
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.includes(origin)) return fail(403, 'origin_not_allowed');
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'POST');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(204).end();
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS');
      return fail(405, 'method_not_allowed');
    }
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) return fail(415, 'json_required');
    // Deployment/body parser must also cap incoming raw bodies at 1 KiB.
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body) || Object.keys(req.body).length !== 1 || typeof req.body.pin !== 'string' || !/^\d{6}$/.test(req.body.pin)) return fail(400, 'invalid_request');
    if (!durable || !privateKeyPem || !redis || !trustedIp) return fail(503, 'temporarily_unavailable');
    try {
      const key = createPrivateKey(privateKeyPem);
      if (key.asymmetricKeyType !== 'ed25519') throw new Error('configuration');
      const ip = trustedIp(req);
      if (!ip || typeof ip !== 'string') throw new Error('trusted address unavailable');
      // Keyed hashes keep raw PIN/IP values out of Redis rate-limit key names.
      const purposeKey = purpose => createHmac('sha256', privateKeyPem).update('slipsync-native:' + purpose + ':v1').digest();
      const digest = (purpose, value) => createHmac('sha256', purposeKey(purpose)).update(value).digest('hex');
      // Gate each client first: already-blocked clients cannot consume shared budget.
      const limits = [['ip:' + digest('ip', ip), 20], ['global', 600], ['pin:' + digest('pin-rate', req.body.pin), 10]];
      for (const [bucket, limit] of limits) {
        const count = await redis(['EVAL', LUA, '1', 'native-session:rate:' + bucket, '600']);
        if (!Number.isInteger(count) || count < 1) throw new Error('rate limit unavailable');
        if (count > limit) { res.setHeader('Retry-After', '600'); return fail(429, 'try_later'); }
      }
      const record = await getPin(req.body.pin);
      // No master override. No record mutation. Unknown and inactive are indistinguishable.
      if (!record || record.active !== true || !Array.isArray(record.mods) || !record.mods.length || record.mods.some(m => !MODULES.includes(m))) return fail(401, 'invalid_pin');
      const modules = [...new Set(record.mods)];
      const iat = Math.floor(now() / 1000);
      const exp = iat + TTL;
      const payload = { iss: 'slipsync-native', aud: 'slipsync-android-private', sub: digest('subject', req.body.pin), iat, exp, modules };
      const signingInput = b64({ alg: 'EdDSA', typ: 'JWT', kid: 'native-v1' }) + '.' + b64(payload);
      const token = signingInput + '.' + sign(null, Buffer.from(signingInput), key).toString('base64url');
      return res.status(200).json({ valid: true, token, expiresAt: exp, modules });
    } catch {
      // Do not log request body, thrown Redis errors, tokens, or PIN values.
      return fail(503, 'temporarily_unavailable');
    }
  };
}
