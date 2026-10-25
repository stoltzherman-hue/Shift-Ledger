const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

function source() {
  return fs.readFileSync(new URL('../pdf-support.js', `file://${__filename}`), 'utf8');
}

function runtime(overrides = {}) {
  const appended = [];
  const clicked = [];
  const revoked = [];
  const context = {
    console,
    setTimeout(fn, delay) { if (!delay) fn(); return 1; },
    clearTimeout() {},
    URL: {
      createObjectURL() { return 'blob:synthetic-pdf'; },
      revokeObjectURL(url) { revoked.push(url); },
    },
    document: {
      head: {
        appendChild(script) {
          appended.push(script.src);
          if (overrides.onAppend) overrides.onAppend(script, context, appended.length);
        },
      },
      createElement(tag) {
        if (tag === 'script') return {};
        if (tag === 'a') return { click() { clicked.push({ href: this.href, download: this.download }); }, remove() {} };
        throw new Error(`unexpected element ${tag}`);
      },
      body: { appendChild() {} },
    },
    navigator: overrides.navigator || {},
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source(), context);
  return { context, appended, clicked, revoked };
}

test('PDF engine loading is shared across repeated requests and falls back after a source error', async () => {
  let constructor;
  const { context, appended } = runtime({
    onAppend(script, window, count) {
      if (count === 1) return script.onerror(new Error('local unavailable'));
      constructor = class SyntheticPdf {};
      window.jspdf = { jsPDF: constructor };
      script.onload();
    },
  });

  const first = context.SlipSyncPDF.ensureEngine();
  const second = context.SlipSyncPDF.ensureEngine();
  assert.equal(await first, constructor);
  assert.equal(await second, constructor);
  assert.equal(appended.length, 2);
  assert.match(appended[0], /\/vendor\/jspdf\.umd\.min\.js$/);
});

test('PDF file sharing uses the native file share sheet when available', async () => {
  const shared = [];
  const file = { name: 'SlipSync-cur-2026-10.pdf', type: 'application/pdf' };
  const { context, clicked } = runtime({ navigator: {
    canShare(payload) { return payload.files[0] === file; },
    async share(payload) { shared.push(payload); },
  } });

  const outcome = await context.SlipSyncPDF.shareOrDownload(file, { title: file.name, text: 'Synthetic statement' });
  assert.equal(outcome, 'shared');
  assert.equal(shared.length, 1);
  assert.equal(shared[0].files[0], file);
  assert.equal(clicked.length, 0);
});

test('cancelling the native share sheet does not create an unwanted download', async () => {
  const file = { name: 'SlipSync-home-2026-10.pdf', type: 'application/pdf' };
  const cancel = Object.assign(new Error('cancelled'), { name: 'AbortError' });
  const { context, clicked } = runtime({ navigator: {
    canShare() { return true; },
    async share() { throw cancel; },
  } });

  assert.equal(await context.SlipSyncPDF.shareOrDownload(file, { title: file.name }), 'cancelled');
  assert.equal(clicked.length, 0);
});

test('unsupported or failed native sharing downloads the same PDF file as a fallback', async () => {
  const file = { name: 'SlipSync-road-2026-10.pdf', type: 'application/pdf' };
  const { context, clicked, revoked } = runtime({ navigator: {
    canShare() { return true; },
    async share() { throw new Error('share unavailable'); },
  } });

  assert.equal(await context.SlipSyncPDF.shareOrDownload(file, { title: file.name }), 'downloaded');
  assert.deepEqual(clicked, [{ href: 'blob:synthetic-pdf', download: file.name }]);
  assert.deepEqual(revoked, ['blob:synthetic-pdf']);
});

test('all four module pages use the shared local-first PDF support', () => {
  const app = fs.readFileSync(new URL('../app.html', `file://${__filename}`), 'utf8');
  const shift = fs.readFileSync(new URL('../shift.html', `file://${__filename}`), 'utf8');
  for (const html of [app, shift]) {
    assert.match(html, /src="\/vendor\/jspdf\.umd\.min\.js"/);
    assert.match(html, /src="\/pdf-support\.js"/);
  }
  assert.match(app, /Send text via WhatsApp/);
  assert.match(shift, /Share shift summary \(PDF\)/);
});
