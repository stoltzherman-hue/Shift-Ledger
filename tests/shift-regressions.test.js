const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(new URL('../app.js', `file://${__filename}`), 'utf8');

function functionSource(name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `missing function ${name}`);
  const brace = source.indexOf('{', start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = brace; i < source.length; i += 1) {
    const char = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue; }
    if (char === '{') depth += 1;
    if (char === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`unterminated function ${name}`);
}

function storageHarness({ initialSlips, failSlipWrites }) {
  const values = new Map([
    ['shiftledger.slips.v1', JSON.stringify(initialSlips)],
    ['shiftledger.cash.v1', '{}'],
    ['shiftledger.cfg.v1', '{"cur":"R"}'],
  ]);
  const alerts = [];
  const fields = {
    fBill: { value: '250' },
    fTip: { value: '30' },
    fTable: { value: '12' },
  };
  const context = {
    alert(message) { alerts.push(message); },
    closeSlip() {},
    document: { getElementById(id) { return fields[id]; } },
    localStorage: {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) {
        if (failSlipWrites && key === 'shiftledger.slips.v1') throw new Error('QuotaExceededError');
        values.set(key, value);
      },
    },
    show() {},
    todayKey() { return '2026-10-25'; },
  };
  vm.createContext(context);
  const storageStart = source.indexOf("const KEY='shiftledger.slips.v1'");
  const storageEnd = source.indexOf('const cur=', storageStart);
  const storageCode = source.slice(storageStart, storageEnd);
  vm.runInContext(`${storageCode}\n${functionSource('saveSlip')}\nfunction r2(n){return Math.round(((Number(n)||0)+1e-9)*100)/100}`, context);
  return {
    alerts,
    values,
    saveWithPhoto(photo) {
      vm.runInContext(`curImg=${JSON.stringify(photo)};saveSlip();globalThis.__slips=JSON.parse(JSON.stringify(slips));`, context);
      return JSON.parse(JSON.stringify(context.__slips));
    },
  };
}

test('quota failure keeps every previously saved photo and rolls back the interrupted slip', () => {
  const original = [{ id: 1, ts: 1, bill: 100, tip: 10, pay: 'card', table: '1', img: 'data:image/jpeg;base64,ORIGINAL' }];
  const harness = storageHarness({ initialSlips: original, failSlipWrites: true });

  const inMemory = harness.saveWithPhoto('data:image/jpeg;base64,NEW');

  assert.deepEqual(inMemory, original);
  assert.deepEqual(JSON.parse(harness.values.get('shiftledger.slips.v1')), original);
  assert.equal(harness.alerts.length, 1);
  assert.match(harness.alerts[0], /photos have NOT been deleted/);
});

test('repeated successful saves keep the original and newly attached photos', () => {
  const original = [{ id: 1, ts: 1, bill: 100, tip: 10, pay: 'card', table: '1', img: 'data:image/jpeg;base64,ORIGINAL' }];
  const harness = storageHarness({ initialSlips: original, failSlipWrites: false });

  harness.saveWithPhoto('data:image/jpeg;base64,FIRST');
  const afterSecondSave = harness.saveWithPhoto('data:image/jpeg;base64,SECOND');

  assert.deepEqual(afterSecondSave.map((slip) => slip.img), [
    'data:image/jpeg;base64,ORIGINAL',
    'data:image/jpeg;base64,FIRST',
    'data:image/jpeg;base64,SECOND',
  ]);
  assert.deepEqual(JSON.parse(harness.values.get('shiftledger.slips.v1')), afterSecondSave);
  assert.deepEqual(harness.alerts, []);
});

test('Shift PDF export includes each persisted synthetic photo and downloads the file', () => {
  const saved = [];
  class FakePdf {
    constructor() {
      this.pages = 1;
      this.images = [];
      this.internal = {
        pageSize: { getWidth: () => 595, getHeight: () => 842 },
        getNumberOfPages: () => this.pages,
      };
      saved.push(this);
    }
    addImage(...args) { this.images.push(args); }
    addPage() { this.pages += 1; }
    getImageProperties() { return { width: 100, height: 200, fileType: 'JPEG' }; }
    save(name) { this.savedAs = name; }
    line() {}
    rect() {}
    setDrawColor() {}
    setFillColor() {}
    setFont() {}
    setFontSize() {}
    setPage() {}
    setTextColor() {}
    text() {}
  }
  const day = '2026-10-25';
  const slips = [
    { id: 1, ts: Date.UTC(2026, 9, 25, 10), bill: 100, tip: 10, pay: 'card', table: '1', img: 'data:image/jpeg;base64,ONE' },
    { id: 2, ts: Date.UTC(2026, 9, 25, 11), bill: 200, tip: 20, pay: 'cash', table: '2', img: 'data:image/jpeg;base64,TWO' },
  ];
  const alerts = [];
  const context = {
    alert(message) { alerts.push(message); },
    cfg: { waiterName: 'Test Waiter' },
    console,
    Date,
    DOW: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    MON: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    slipsForDay(key) { return key === day ? slips : []; },
    summarise(list) {
      const sales = list.reduce((sum, slip) => sum + slip.bill, 0);
      const tips = list.reduce((sum, slip) => sum + slip.tip, 0);
      return { n: list.length, sales, tips, spend: sales / list.length, largest: 200, avg: tips / sales * 100, card: 100, cash: 200 };
    },
    todayKey() { return day; },
    window: { jspdf: { jsPDF: FakePdf } },
  };
  vm.createContext(context);
  vm.runInContext(`${functionSource('downloadShiftSummary')}\ndownloadShiftSummary();`, context);

  assert.equal(saved.length, 1);
  assert.equal(saved[0].images.length, 2);
  assert.equal(saved[0].pages, 3);
  assert.equal(saved[0].savedAs, 'ShiftLedger-Test-Waiter-2026-10-25.pdf');
  assert.deepEqual(alerts, []);
});
