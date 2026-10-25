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
      cats: [{ id: 'food', name: 'Food "Basics"', limit: 1000, type: 'must' }],
      tx: [{ id: 'synthetic', date: new Date().toISOString().slice(0, 10), store: 'Fictional, Store', cat: 'food', type: 'must', who: 'Test User', amt: 123.45, litres: '', note: 'quoted "note"' }],
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
  const dialog = { addEventListener() {}, showModal() {}, close() {} };
  const genericElement = {
    addEventListener() {},
    classList: { add() {}, remove() {}, toggle() {} },
    dataset: {},
    disabled: false,
    isConnected: true,
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
  vm.runInContext(`${appScript()}\n;globalThis.__send = send;globalThis.__csv = csv;globalThis.__pdf=pdf;globalThis.__save=save;globalThis.__readImg=readImg;globalThis.__S=S;`, context);
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

test('Home, Curator, and Road each generate an itemised PDF file with saved photos', async () => {
  const { context } = runAppForWhatsApp();
  const made = [];
  const shared = [];
  class FakePdf {
    constructor() { this.pages = 1; this.images = []; this.texts = []; this.wrapCalls = 0; made.push(this); }
    addImage(...args) { this.images.push(args); }
    addPage() { this.pages += 1; }
    getImageProperties() { return { width: 100, height: 200, fileType: 'JPEG' }; }
    output(kind) { assert.equal(kind, 'blob'); return { synthetic: 'pdf' }; }
    rect() {}
    setFillColor() {}
    setFont() {}
    setFontSize() {}
    splitTextToSize(value) { this.wrapCalls += 1; return [String(value)]; }
    text(value) { this.texts.push(String(value)); }
  }
  context.SlipSyncPDF = {
    async ensureEngine() { return FakePdf; },
    async shareOrDownload(file) { shared.push(file); return 'shared'; },
  };
  const date = new Date().toISOString().slice(0, 10);
  const photo = 'data:image/jpeg;base64,SYNTHETIC';
  context.__S.home.cats = [{ id: 'home-food', name: 'Home food', limit: 500, type: 'must' }];
  context.__S.home.tx = [{ id: 'h1', date, store: 'Synthetic Home Store', cat: 'home-food', type: 'must', amt: 45, img: photo }];
  context.__S.cur.tx[0].img = photo;
  context.__S.road.tx = [{ id: 'r1', date, store: 'Synthetic Fuel', cat: 'Fuel', reimb: true, amt: 75, img: photo }];
  context.__S.road.trips = [{ id: 'trip', date, from: 'A', to: 'B', purpose: 'Synthetic visit', km: 10 }];

  for (const mod of ['home', 'cur', 'road']) await context.__pdf(mod);

  assert.deepEqual(shared.map((file) => file.name), ['home', 'cur', 'road'].map((mod) => `SlipSync-${mod}-${new Date().toISOString().slice(0, 7)}.pdf`));
  assert.ok(shared.every((file) => file.type === 'application/pdf'));
  assert.equal(made.length, 3);
  assert.ok(made.every((doc) => doc.images.length === 1));
  assert.ok(made.every((doc) => doc.texts.includes('Itemised')));
  assert.ok(made.every((doc) => doc.wrapCalls > 0));
  assert.ok(made[2].texts.includes('Logbook'));
});

test('CSV export downloads a synthetic Curator ledger without external transmission', () => {
  const { context, downloads } = runAppForWhatsApp();

  context.__csv('cur');

  assert.deepEqual(downloads, [{ href: 'blob:synthetic-export', download: `SlipSync-cur-${new Date().toISOString().slice(0, 7)}.csv` }]);
  assert.equal(context.__lastFile.type, 'text/csv');
  assert.equal(context.__lastFile.parts[0], [
    '"Date","Store","Category","Priority","Who","Amount","Litres","Note"',
    `"${new Date().toISOString().slice(0, 10)}","Fictional, Store","Food ""Basics""","must","Test User","123.45","","quoted ""note"""`,
  ].join('\n'));
});

test('Suite storage failure is reported to the caller instead of silently claiming success', () => {
  const { context } = runAppForWhatsApp();
  context.localStorage.setItem = () => { throw Object.assign(new Error('full'), { name: 'QuotaExceededError' }); };
  assert.equal(context.__save(), false);
});

test('Suite photo read failure rejects instead of leaving the save flow hanging', async () => {
  const { context } = runAppForWhatsApp();
  context.FileReader = class FailedReader { readAsDataURL() { this.onerror(); } };
  await assert.rejects(context.__readImg({ size: 10 }), /Could not read the selected photo/);
});
