const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const cdpBase = process.env.SLIPSYNC_CDP_URL;
const appBase = process.env.SLIPSYNC_APP_URL || 'http://127.0.0.1:4175';
const downloadRoot = process.env.SLIPSYNC_DOWNLOAD_DIR || path.join(process.env.TEMP || '.', 'slipsync-browser-downloads');

class CdpClient {
  constructor(url) {
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.socket = new WebSocket(url);
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const waiter = this.pending.get(message.id);
        if (!waiter) return;
        this.pending.delete(message.id);
        if (message.error) waiter.reject(new Error(message.error.message));
        else waiter.resolve(message.result);
        return;
      }
      const callbacks = this.listeners.get(message.method) || [];
      callbacks.slice().forEach((callback) => callback(message.params));
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const response = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return response;
  }

  once(method, predicate = () => true, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const callback = (params) => {
        if (!predicate(params)) return;
        clearTimeout(timer);
        this.listeners.set(method, (this.listeners.get(method) || []).filter((item) => item !== callback));
        resolve(params);
      };
      this.listeners.set(method, [...(this.listeners.get(method) || []), callback]);
      const timer = setTimeout(() => {
        this.listeners.set(method, (this.listeners.get(method) || []).filter((item) => item !== callback));
        reject(new Error(`Timed out waiting for CDP event ${method}`));
      }, timeoutMs);
    });
  }

  close() { this.socket.close(); }
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(client, expression, timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await evaluate(client, expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for: ${expression}`);
}

async function navigate(client, url) {
  const loaded = client.once('Page.loadEventFired');
  await client.send('Page.navigate', { url });
  await loaded;
}

async function nextDownload(client, downloadDir, action) {
  const began = client.once('Browser.downloadWillBegin');
  try { await action(); }
  catch (error) { began.catch(() => {}); throw error; }
  const download = await began;
  const completed = await client.once('Browser.downloadProgress', (event) => event.guid === download.guid && event.state === 'completed');
  return { ...download, path: completed.filePath || path.join(downloadDir, download.suggestedFilename) };
}

test('real Chrome exercises SlipSync UI, persistence, exports, and failure paths', { skip: !cdpBase }, async (t) => {
  fs.mkdirSync(downloadRoot, { recursive: true });
  const downloadDir = fs.mkdtempSync(path.join(downloadRoot, 'run-'));
  const targets = await (await fetch(`${cdpBase}/json/list`)).json();
  const pageTarget = targets.find((target) => target.type === 'page');
  assert.ok(pageTarget?.webSocketDebuggerUrl, 'Chrome should expose a debuggable page');
  const client = new CdpClient(pageTarget.webSocketDebuggerUrl);
  t.after(() => client.close());
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloadDir, eventsEnabled: true });

  const suiteState = {
    home: {
      cfg: { income: 1000, members: 'Test User' },
      cats: [{ id: 'food', name: 'Food "Basics"', limit: 1000, type: 'must' }],
      tx: [{ id: 'synthetic', date: new Date().toISOString().slice(0, 10), store: 'Fictional, Store', cat: 'food', type: 'must', who: 'Test User', amt: 123.45, litres: '', note: 'quoted "note"' }],
    },
    cur: { cfg: { client: 'Fictional Client', email: '', wa: '082 123 4567', float: 1000, me: 'Test User' }, cats: [], tx: [] },
    road: { cfg: { mode: 'allowance', allowance: 0, rate: 4.95, name: '', company: '', mgr: '', email: '', wa: '', home: '' }, tx: [], trips: [] },
    ui: { mod: 'cur' },
    acct: { picked: ['cur'], trialStart: Date.now(), plan: 'all', mods: ['home', 'cur', 'road', 'shift'], annual: false },
  };
  await navigate(client, `${appBase}/`);
  await waitFor(client, `location.origin === ${JSON.stringify(new URL(appBase).origin)} && document.readyState === 'complete'`);
  await evaluate(client, `localStorage.removeItem('slipsync.suite.v1');sessionStorage.removeItem('__slipsyncRuntimeSeeded')`);
  await client.send('Page.addScriptToEvaluateOnNewDocument', { source: `
    if (!sessionStorage.getItem('__slipsyncRuntimeSeeded')) {
      localStorage.setItem('slipsync.suite.v1', ${JSON.stringify(JSON.stringify(suiteState))});
      sessionStorage.setItem('__slipsyncRuntimeSeeded','1');
    }
    window.__opened = [];
    window.__alerts = [];
    window.open = (...args) => { window.__opened.push(args); return null; };
    window.alert = (message) => window.__alerts.push(String(message));
  ` });

  await t.test('repeated WhatsApp clicks use intercepted native opening and dialogs still reopen', async () => {
    await navigate(client, `${appBase}/app`);
    const result = await evaluate(client, `(() => {
      const send = document.querySelector('[data-act="send-wa"]');
      send.click(); send.click();
      const setup = document.querySelector('[data-act="setup"]');
      setup.click(); const firstOpen = document.querySelector('#dlg').open;
      document.querySelector('#dlg button[value="cancel"]').click(); const firstClosed = !document.querySelector('#dlg').open;
      setup.click(); const reopened = document.querySelector('#dlg').open;
      document.querySelector('#dlg button[value="cancel"]').click();
      return { calls: window.__opened, firstOpen, firstClosed, reopened, finalClosed: !document.querySelector('#dlg').open };
    })()`);
    assert.equal(result.calls.length, 2);
    result.calls.forEach(([url, target]) => {
      assert.match(url, /^https:\/\/wa\.me\/27821234567\?text=/);
      assert.equal(target, '_blank');
    });
    assert.deepEqual({ firstOpen: result.firstOpen, firstClosed: result.firstClosed, reopened: result.reopened, finalClosed: result.finalClosed },
      { firstOpen: true, firstClosed: true, reopened: true, finalClosed: true });
  });

  await t.test('delayed photo reads cannot duplicate saves or commit after cancel and reopen', async () => {
    const result = await evaluate(client, `(async () => {
      const originalReadImg=readImg,photo='data:image/jpeg;base64,SYNTHETIC_DELAYED';
      S.cur.cats=[{id:'supplies',name:'Supplies',limit:1000,type:'must'}];
      const fill=amount=>{document.querySelector('#dlgBody [name="amt"]').value=String(amount);document.querySelector('#dlgBody [name="store"]').value='Synthetic Delayed Store'};
      window.__photoResolvers=[];readImg=()=>new Promise(resolve=>window.__photoResolvers.push(resolve));
      const before=S.cur.tx.length;
      addSlip('cur');fill(10);
      const saveButton=document.querySelector('#dlgBody button.pri');saveButton.click();saveButton.click();
      const firstResolvers=window.__photoResolvers.splice(0);firstResolvers.forEach(resolve=>resolve(photo));
      await new Promise(resolve=>setTimeout(resolve,0));
      const afterDouble=S.cur.tx.length;

      addSlip('cur');fill(20);document.querySelector('#dlgBody button.pri').click();
      document.querySelector('#dlgBody button[value="cancel"]').click();
      document.querySelector('[data-act="setup"]').click();
      const secondResolvers=window.__photoResolvers.splice(0);secondResolvers.forEach(resolve=>resolve(photo));
      await new Promise(resolve=>setTimeout(resolve,0));
      const outcome={before,afterDouble,afterCancel:S.cur.tx.length,dialogOpen:document.querySelector('#dlg').open,heading:document.querySelector('#dlgBody h3').textContent};
      document.querySelector('#dlgBody button[value="cancel"]').click();readImg=originalReadImg;return outcome;
    })()`);
    assert.deepEqual(result, { before: 0, afterDouble: 1, afterCancel: 1, dialogOpen: true, heading: 'Client & float' });
  });

  await t.test('Suite quota failure keeps the submitted form open and does not append the slip', async () => {
    const result = await evaluate(client, `(async () => {
      window.__alerts=[];const before=S.cur.tx.length,original=Storage.prototype.setItem;
      S.cur.cats=[{id:'supplies',name:'Supplies',limit:1000,type:'must'}];
      addSlip('cur');document.querySelector('#dlgBody [name="amt"]').value='88';document.querySelector('#dlgBody [name="store"]').value='Synthetic Quota Store';
      Storage.prototype.setItem=function(key,value){if(key==='slipsync.suite.v1')throw new DOMException('full','QuotaExceededError');return original.call(this,key,value)};
      document.querySelector('#dlgBody button.pri').click();await new Promise(resolve=>setTimeout(resolve,0));Storage.prototype.setItem=original;
      const outcome={before,after:S.cur.tx.length,open:document.querySelector('#dlg').open,amount:document.querySelector('#dlgBody [name="amt"]').value,alert:window.__alerts.at(-1)};
      document.querySelector('#dlgBody button[value="cancel"]').click();return outcome;
    })()`);
    assert.deepEqual(result, { before: 1, after: 1, open: true, amount: '88', alert: 'SlipSync could not save this slip because browser storage is full or unavailable. Existing saved slips and photos were not changed. Export a backup and free space safely, then retry.' });
  });

  await t.test('delayed PDF loading snapshots module and month and ignores repeated requests', async () => {
    await evaluate(client, `(() => {
      const canvas=document.createElement('canvas');canvas.width=80;canvas.height=120;
      const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,80,120);ctx.fillStyle='#111';ctx.fillText('SYNTHETIC',5,40);
      const state=JSON.parse(localStorage.getItem('slipsync.suite.v1')),date=new Date().toISOString().slice(0,10);
      state.cur.cats=[{id:'supplies',name:'Supplies',limit:1000,type:'must'}];state.cur.tx=[{id:'c1',date,store:'Synthetic Curator Store',cat:'supplies',type:'must',amt:234.56,img:canvas.toDataURL('image/jpeg',0.8)}];state.ui.mod='cur';
      localStorage.setItem('slipsync.suite.v1',JSON.stringify(state));location.reload();
    })()`);
    await waitFor(client, `document.readyState==='complete' && Boolean(window.jspdf && SlipSyncPDF)`);
    await evaluate(client, `Object.defineProperty(navigator,'canShare',{value:()=>false,configurable:true})`);
    const download = await nextDownload(client, downloadDir, () => evaluate(client, `(() => {
      const engine=window.jspdf.jsPDF;window.__pdfOutputCount=0;window.__originalEnsure=SlipSyncPDF.ensureEngine;window.__originalShare=SlipSyncPDF.shareOrDownload;
      let release;SlipSyncPDF.ensureEngine=()=>new Promise(resolve=>{release=resolve});SlipSyncPDF.shareOrDownload=async(...args)=>{window.__pdfOutputCount++;return window.__originalShare(...args)};
      pdf('cur');document.querySelector('#mPrev').click();document.querySelector('.mods button[data-m="home"]').click();pdf('home');setTimeout(()=>release(engine),20);
    })()`));
    const text = fs.readFileSync(download.path).toString('latin1').replace(/\xA0/g, ' ');
    assert.equal(download.suggestedFilename, `SlipSync-cur-${new Date().toISOString().slice(0, 7)}.pdf`);
    assert.match(text, /Purchases statement/);
    assert.match(text, /Float: R 1 000,00/);
    assert.match(text, /Spent: R 234,56/);
    assert.match(text, /Balance: R 765,44/);
    const outputs = await evaluate(client, `window.__pdfOutputCount`);
    assert.equal(outputs, 1);
    await evaluate(client, `SlipSyncPDF.ensureEngine=window.__originalEnsure;SlipSyncPDF.shareOrDownload=window.__originalShare;location.reload()`);
    await waitFor(client, `document.readyState==='complete' && Boolean(window.jspdf && SlipSyncPDF)`);
  });

  await t.test('Suite PDF failure shows an actionable error and releases the busy button', async () => {
    const result = await evaluate(client, `(async () => {
      document.querySelector('.mods button[data-m="cur"]').click();const original=SlipSyncPDF.shareOrDownload;SlipSyncPDF.shareOrDownload=async()=>{throw new Error('Synthetic share failure')};
      await pdf('cur');SlipSyncPDF.shareOrDownload=original;const button=document.querySelector('[data-act="pdf"]');return{toast:document.querySelector('#toast').textContent,disabled:button.disabled,label:button.textContent};
    })()`);
    assert.deepEqual(result, { toast: 'Synthetic share failure', disabled: false, label: 'Share PDF statement' });
  });

  await t.test('Home, Curator, and Road create real itemised photo PDFs with download fallback', async () => {
    await evaluate(client, `(() => {
      const canvas=document.createElement('canvas');canvas.width=80;canvas.height=120;
      const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,80,120);ctx.fillStyle='#111';ctx.fillText('SYNTHETIC',5,40);
      const photo=canvas.toDataURL('image/jpeg',0.8),date=new Date().toISOString().slice(0,10);
      const state=JSON.parse(localStorage.getItem('slipsync.suite.v1'));
      state.home.tx=[{id:'h1',date,store:'Synthetic Home Store',cat:'food',type:'must',who:'Test User',amt:123.45,img:photo}];
      state.cur.cats=[{id:'supplies',name:'Supplies',limit:1000,type:'must'}];
      state.cur.tx=[{id:'c1',date,store:'Synthetic Curator Store',cat:'supplies',type:'must',amt:234.56,img:photo}];
      state.road.tx=[{id:'r1',date,store:'Synthetic Fuel',cat:'Fuel',reimb:true,amt:345.67,img:photo}];
      state.road.trips=[{id:'t1',date,from:'A',to:'B',purpose:'Synthetic client visit',km:10}];
      localStorage.setItem('slipsync.suite.v1',JSON.stringify(state));location.reload();
    })()`);
    await waitFor(client, `document.readyState==='complete' && Boolean(window.jspdf && SlipSyncPDF)`);
    await evaluate(client, `Object.defineProperty(navigator,'canShare',{value:()=>false,configurable:true})`);
    const expectedText = { home: /Family budget/, cur: /Purchases statement/, road: /SlipSync Road/ };
    for (const mod of ['home','cur','road']) {
      await evaluate(client, `document.querySelector('.mods button[data-m="${mod}"]').click()`);
      const download = await nextDownload(client, downloadDir, () => evaluate(client, `document.querySelector('[data-act="pdf"]').click()`));
      assert.equal(download.suggestedFilename, `SlipSync-${mod}-${new Date().toISOString().slice(0, 7)}.pdf`);
      const pdf = fs.readFileSync(download.path);
      const text = pdf.toString('latin1');
      assert.ok(pdf.length > 3000, `${mod} PDF should contain real document bytes`);
      assert.ok((text.match(/\/Type \/Page\b/g) || []).length >= 2, `${mod} PDF should include a photo page`);
      assert.ok((text.match(/\/Subtype \/Image\b/g) || []).length >= 1, `${mod} PDF should contain a receipt image object`);
      assert.match(text, expectedText[mod]);
      assert.match(text, /Itemised/);
    }
  });

  await t.test('Road reimbursement PDF contains the total claim and full logbook', async () => {
    await evaluate(client, `S.road.cfg.mode='reimb';S.road.cfg.rate=4.95;document.querySelector('.mods button[data-m="road"]').click()`);
    const download = await nextDownload(client, downloadDir, () => evaluate(client, `document.querySelector('[data-act="pdf"]').click()`));
    const text = fs.readFileSync(download.path).toString('latin1');
    assert.match(text, /TOTAL CLAIM/);
    assert.match(text, /Business km/);
    assert.match(text, /Logbook/);
  });

  await t.test('Road SARS logbook CSV downloads the synthetic trip', async () => {
    const download = await nextDownload(client, downloadDir, () => evaluate(client, `document.querySelector('[data-act="csv"]').click()`));
    assert.equal(download.suggestedFilename, `SlipSync-logbook-${new Date().toISOString().slice(0, 7)}.csv`);
    const csv = fs.readFileSync(download.path, 'utf8');
    assert.match(csv, /^"Date","From","To","Business reason","Odometer start","Odometer end","Km","Value at rate"/);
    assert.match(csv, /"A","B","Synthetic client visit"/);
  });

  await t.test('Purchase statement offers a real PDF File to the native share API', async () => {
    const payload = await evaluate(client, `(async () => {
      window.__sharedPdf=null;
      Object.defineProperty(navigator,'canShare',{value:p=>Boolean(p&&p.files&&p.files[0]&&p.files[0].type==='application/pdf'),configurable:true});
      Object.defineProperty(navigator,'share',{value:async p=>{const f=p.files[0];window.__sharedPdf={name:f.name,type:f.type,size:f.size,title:p.title,text:p.text}},configurable:true});
      document.querySelector('.mods button[data-m="cur"]').click();
      await pdf('cur');return window.__sharedPdf;
    })()`);
    assert.equal(payload.name, `SlipSync-cur-${new Date().toISOString().slice(0, 7)}.pdf`);
    assert.equal(payload.type, 'application/pdf');
    assert.ok(payload.size > 3000);
    assert.match(payload.text, /^Purchases statement/);
  });

  await t.test('CSV export uses a real browser download', async () => {
    await evaluate(client, `document.querySelector('.mods button[data-m="home"]').click()`);
    await evaluate(client, `Object.defineProperty(navigator,'canShare',{value:()=>false,configurable:true})`);
    const download = await nextDownload(client, downloadDir, () => evaluate(client, `document.querySelector('[data-act="csv"]').click()`));
    assert.match(download.suggestedFilename, /^SlipSync-home-\d{4}-\d{2}\.csv$/);
    const csv = fs.readFileSync(download.path, 'utf8');
    assert.equal(csv, [
      '"Date","Store","Category","Priority","Who","Amount","Litres","Note"',
      `"${new Date().toISOString().slice(0, 10)}","Synthetic Home Store","Food ""Basics""","must","Test User","123.45","",""`,
    ].join('\n'));
  });

  await t.test('module link and browser Back preserve synthetic suite data', async () => {
    await evaluate(client, `document.querySelector('.mods button[data-m="shift"]').click();document.querySelector('a[href="/shift"]').click()`);
    await waitFor(client, `location.pathname === '/shift'`);
    await evaluate(client, 'history.back()');
    await waitFor(client, `location.pathname === '/app'`);
    assert.equal(await evaluate(client, `JSON.parse(localStorage.getItem('slipsync.suite.v1')).cur.cfg.client`), 'Fictional Client');
  });

  const today = new Date();
  const slips = [
    { id: 101, ts: today.getTime(), bill: 100, tip: 10, pay: 'card', table: '1', suggPct: null, suggAmt: null, img: null },
    { id: 102, ts: today.getTime() + 1, bill: 200, tip: 25, pay: 'cash', table: '2', suggPct: null, suggAmt: null, img: null },
  ];
  await navigate(client, `${appBase}/shift`);
  await evaluate(client, `(() => {
    const canvas=document.createElement('canvas');canvas.width=80;canvas.height=120;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,80,120);ctx.fillStyle='#111';ctx.fillText('SYNTHETIC',5,40);
    const imageOne=canvas.toDataURL('image/jpeg',0.8);
    ctx.fillStyle='#f5c542';ctx.fillRect(0,0,80,120);ctx.fillStyle='#111';ctx.fillText('SECOND',5,70);
    const imageTwo=canvas.toDataURL('image/jpeg',0.8);
    const records=${JSON.stringify(slips)};records[0].img=imageOne;records[1].img=imageTwo;
    localStorage.setItem('shiftledger.slips.v1',JSON.stringify(records));localStorage.setItem('shiftledger.cfg.v1',JSON.stringify({cur:'R',waiterName:'Test Waiter'}));
  })()`);
  await navigate(client, `${appBase}/shift`);

  await t.test('synthetic photos persist across reload and render when a slip reopens', async () => {
    assert.equal(await evaluate(client, `JSON.parse(localStorage.getItem('shiftledger.slips.v1')).filter(x=>x.img&&x.img.startsWith('data:image/')).length`), 2);
    const display = await evaluate(client, `(() => { openSlip(101); const w=document.querySelector('#slipThumbWrap'); return {shown:w.style.display,src:document.querySelector('#slipThumb').src.slice(0,22)} })()`);
    assert.equal(display.shown, 'block');
    assert.match(display.src, /^data:image\/jpeg;base64/);
    await evaluate(client, 'closeSlip()');
  });

  await t.test('Shift backup JSON preserves both synthetic photos', async () => {
    const download = await nextDownload(client, downloadDir, () => evaluate(client, 'exportData()'));
    assert.match(download.suggestedFilename, /^shiftledger-backup-\d{4}-\d{2}-\d{2}\.json$/);
    const backup = JSON.parse(fs.readFileSync(download.path, 'utf8'));
    assert.equal(backup.app, 'SlipSync Shift');
    assert.equal(backup.slips.length, 2);
    assert.equal(backup.slips.filter((slip) => typeof slip.img === 'string' && slip.img.startsWith('data:image/')).length, 2);
  });

  await t.test('quota failure preserves stored photos, rolls back the slip, and keeps unsaved form visible', async () => {
    const result = await evaluate(client, `(() => {
      const before=localStorage.getItem('shiftledger.slips.v1');openSlip();
      document.querySelector('#fBill').value='333';document.querySelector('#fTip').value='33';document.querySelector('#fTable').value='9';
      curImg='data:image/jpeg;base64,UNSAVED';
      const original=Storage.prototype.setItem;
      Storage.prototype.setItem=function(key,value){if(key==='shiftledger.slips.v1')throw new DOMException('full','QuotaExceededError');return original.call(this,key,value)};
      saveSlip();Storage.prototype.setItem=original;
      return {same:localStorage.getItem('shiftledger.slips.v1')===before,count:slips.length,sheet:document.querySelector('#slipSheet').classList.contains('open'),bill:document.querySelector('#fBill').value,alert:window.__alerts.at(-1)};
    })()`);
    assert.deepEqual(result, { same: true, count: 2, sheet: true, bill: '333', alert: 'Shift could not save your latest changes because browser storage is full or unavailable. Existing saved slip photos have NOT been deleted. Export a backup from Settings and free storage safely before adding more slips.' });
    await evaluate(client, 'closeSlip()');
  });

  await t.test('real jsPDF creates a multi-photo PDF with image objects and pages', async () => {
    await waitFor(client, `Boolean(window.jspdf && window.jspdf.jsPDF)`, 15000);
    const download = await nextDownload(client, downloadDir, () => evaluate(client, 'downloadShiftSummary()'));
    const pdf = fs.readFileSync(download.path);
    const text = pdf.toString('latin1');
    assert.equal((text.match(/\/Type \/Page\b/g) || []).length, 3);
    assert.ok((text.match(/\/Subtype \/Image\b/g) || []).length >= 2);
    assert.ok(pdf.length > 3000);
  });

  await t.test('missing-photo PDF adds an availability page and empty slip hides the thumbnail', async () => {
    await evaluate(client, `(() => {const records=JSON.parse(localStorage.getItem('shiftledger.slips.v1'));records[1].img=null;localStorage.setItem('shiftledger.slips.v1',JSON.stringify(records));location.reload()})()`);
    await waitFor(client, `document.readyState === 'complete' && typeof downloadShiftSummary === 'function'`);
    const hidden = await evaluate(client, `(() => {openSlip(102);return document.querySelector('#slipThumbWrap').style.display})()`);
    assert.equal(hidden, 'none');
    await evaluate(client, 'closeSlip()');
    const download = await nextDownload(client, downloadDir, () => evaluate(client, 'downloadShiftSummary()'));
    const text = fs.readFileSync(download.path).toString('latin1');
    assert.equal((text.match(/\/Type \/Page\b/g) || []).length, 3);
    assert.equal((text.match(/\/Subtype \/Image\b/g) || []).length, 1);
    assert.match(text, /Slip photo availability/);
  });

  await t.test('local PDF engine loads when every remote script is blocked', async () => {
    await client.send('Network.enable');
    await client.send('Network.setBlockedURLs', { urls: ['https://*'] });
    await navigate(client, `${appBase}/app`);
    await waitFor(client, `Boolean(window.jspdf && window.jspdf.jsPDF && window.SlipSyncPDF)`);
    const sources = await evaluate(client, `[...document.scripts].map(script=>script.src)`);
    assert.ok(sources.some((src) => src.endsWith('/vendor/jspdf.umd.min.js')));
    assert.ok(sources.some((src) => src.endsWith('/pdf-support.js')));
    await client.send('Network.setBlockedURLs', { urls: [] });
  });

  const screenshot = await client.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(path.join(downloadDir, 'slipsync-synthetic-runtime.png'), Buffer.from(screenshot.data, 'base64'));
});
