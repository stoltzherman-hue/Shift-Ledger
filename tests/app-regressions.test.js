const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

function appScript() {
  const html = fs.readFileSync(new URL('../app.html', `file://${__filename}`), 'utf8');
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match, 'app.html should contain its classic inline application script');
  return match[1].split('/* ============ WIRING ============ */')[0];
}

function suiteState() {
  return {
    home: { cfg: { income: 0, members: 'Me' }, cats: [], tx: [] },
    cur: {
      cfg: { client: 'Fictional Client', email: '', wa: '082 123 4567', float: 1000, me: 'Test User' },
      cats: [],
      tx: [],
    },
    road: {
      cfg: { mode: 'allowance', allowance: 0, rate: 4.95, name: '', company: '', mgr: '', email: '', wa: '', home: '' },
      tx: [],
      trips: [],
    },
    ui: { mod: 'cur' },
    acct: { picked: ['cur'], trialStart: Date.now(), plan: 'all', mods: ['home', 'cur', 'road', 'shift'], annual: false },
  };
}

function runAppForWhatsApp() {
  const dialogBody = {
    addEventListener() {},
    querySelector() { return { innerHTML: '' }; },
    querySelectorAll() { return []; },
  };
  const dialog = { showModal() {}, close() {} };
  const genericElement = {
    addEventListener() {},
    classList: { add() {}, remove() {}, toggle() {} },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    setAttribute() {},
    style: {},
  };
  const nativeOpenCalls = [];
  const downloads = [];
  const context = {
    console,
    Date,
    encodeURIComponent,
    history: { replaceState() {} },
    location: { href: '', pathname: '/app', search: '' },
    localStorage: {
      getItem(key) { return key === 'slipsync.suite.v1' ? JSON.stringify(suiteState()) : null; },
      setItem() {},
      removeItem() {},
    },
    document: {
      createElement(tag) {
        if (tag === 'a') return { click() { downloads.push({ href: this.href, download: this.download }); } };
        return genericElement;
      },
      documentElement: { dataset: {} },
      querySelector(selector) {
        if (selector === '#dlg') return dialog;
        if (selector === '#dlgBody') return dialogBody;
        return genericElement;
      },
      querySelectorAll() { return []; },
    },
    File: class FakeFile {
      constructor(parts, name, options) { this.parts = parts; this.name = name; this.type = options.type; }
    },
    navigator: {},
    open(...args) { nativeOpenCalls.push(args); },
    scrollTo() {},
    setTimeout() { return 1; },
    clearTimeout() {},
    URL: { createObjectURL(file) { context.__lastFile = file; return 'blob:synthetic-export'; } },
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(`${appScript()}\n;globalThis.__send = send;globalThis.__csv = csv;`, context);
  context.__send('cur', 'wa');
  return { context, downloads, nativeOpenCalls, dialogBody };
}

test('Send via WhatsApp uses the browser opener with the encoded wa.me URL', () => {
  const { nativeOpenCalls, dialogBody } = runAppForWhatsApp();

  assert.equal(nativeOpenCalls.length, 1);
  assert.match(nativeOpenCalls[0][0], /^https:\/\/wa\.me\/27821234567\?text=/);
  assert.equal(nativeOpenCalls[0][1], '_blank');
  assert.equal(dialogBody.innerHTML, undefined);
});

test('CSV export downloads a synthetic Curator ledger without external transmission', () => {
  const { context, downloads } = runAppForWhatsApp();

  context.__csv('cur');

  assert.deepEqual(downloads, [{ href: 'blob:synthetic-export', download: `SlipSync-cur-${new Date().toISOString().slice(0, 7)}.csv` }]);
  assert.equal(context.__lastFile.type, 'text/csv');
  assert.match(context.__lastFile.parts[0], /^"Date","Store","Category","Priority","Who","Amount","Litres","Note"$/);
});
