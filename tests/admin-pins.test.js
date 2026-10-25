const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

function loadHandler({ adminKey = 'test-admin-key', existingPins = [] } = {}) {
  const records = new Map(existingPins.map(({ pin, ...record }) => [pin, record]));
  const writes = [];
  const mailCalls = [];
  const context = {
    console,
    crypto: { randomInt() { return 654321; } },
    Date,
    process: { env: { ADMIN_KEY: adminKey } },
    async listPins() { return [...records].map(([pin, record]) => ({ pin, ...record })); },
    async getPin(pin) { return records.get(pin) || null; },
    async putPin(pin, record) { records.set(pin, record); writes.push({ pin, record }); },
    async mail(...args) { mailCalls.push(args); },
  };
  vm.createContext(context);

  const plans = fs.readFileSync(new URL('../api/_plans.js', `file://${__filename}`), 'utf8')
    .replaceAll('export ', '');
  vm.runInContext(plans, context);

  const endpoint = fs.readFileSync(new URL('../api/admin-pins.js', `file://${__filename}`), 'utf8')
    .replace(/^import .*;\r?\n/gm, '')
    .replace('export default async function handler', 'async function handler');
  vm.runInContext(`${endpoint}\nglobalThis.__handler = handler;`, context);

  return { handler: context.__handler, mailCalls, records, writes };
}

function response() {
  return {
    body: undefined,
    headers: {},
    statusCode: 200,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('POST issuance accepts bearer auth and persists exact all-module complimentary access', async () => {
  const { handler, mailCalls, records, writes } = loadHandler();
  const res = response();

  await handler({
    method: 'POST',
    headers: { authorization: 'Bearer test-admin-key' },
    query: {},
    body: { issue: '1', modules: 'shift,home,cur,road' },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(JSON.parse(JSON.stringify(res.body)), {
    ok: true,
    pin: '654321',
    plan: 'all',
    mods: ['shift', 'home', 'cur', 'road'],
    emailedTo: null,
  });
  assert.equal(writes.length, 1);
  const stored = records.get('654321');
  assert.equal(stored.name, 'SlipSync user');
  assert.equal(stored.email, '');
  assert.equal(stored.plan, 'all');
  assert.deepEqual([...stored.mods], ['shift', 'home', 'cur', 'road']);
  assert.equal(stored.billing, 'manual');
  assert.equal(stored.active, true);
  assert.equal(Object.hasOwn(stored, 'expiresAt'), false);
  assert.equal(mailCalls.length, 0);
});

test('bad or missing bearer auth cannot mutate PIN storage', async () => {
  for (const authorization of ['Bearer wrong-key', undefined]) {
    const { handler, mailCalls, writes } = loadHandler();
    const res = response();

    await handler({
      method: 'POST',
      headers: authorization ? { authorization } : {},
      query: {},
      body: { issue: '1', modules: 'shift,home,cur,road' },
    }, res);

    assert.equal(res.statusCode, 401);
    assert.deepEqual({ ...res.body }, { error: 'unauthorised' });
    assert.equal(writes.length, 0);
    assert.equal(mailCalls.length, 0);
  }
});

test('existing GET query-key clients remain compatible', async () => {
  const { handler, writes } = loadHandler({
    existingPins: [{ pin: '123456', name: 'Existing', active: true, plan: 'all', mods: ['shift', 'home', 'cur', 'road'], billing: 'manual' }],
  });
  const res = response();

  await handler({ method: 'GET', headers: {}, query: { key: 'test-admin-key' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.total, 1);
  assert.equal(res.body.active, 1);
  assert.equal(res.body.subscribers[0].pin, '123456');
  assert.equal(writes.length, 0);
});
