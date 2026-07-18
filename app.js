
const PRESETS=[10,12.5,15,20];
/* ===== SLIP READER KEY =====
   Free key (email only, no card): https://ocr.space/ocrapi/freekey
   Paste your key between the quotes below. "helloworld" works only for a quick test. */
const OCR_API_KEY='K84023989688957';
const SEED={"app": "ShiftLedger", "v": 1, "slips": [{"id": 1781615835170, "ts": 1781615835170, "bill": 420, "tip": 45, "pay": "card", "table": "6", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1781615877968, "ts": 1781615877968, "bill": 500, "tip": 80, "pay": "card", "table": "16", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1781695712834, "ts": 1781695712834, "bill": 754, "tip": 95, "pay": "card", "table": "33", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1781695786897, "ts": 1781695786897, "bill": 666, "tip": 74, "pay": "card", "table": "30", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1781696551296, "ts": 1781696551296, "bill": 376, "tip": 40, "pay": "card", "table": "37", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1781703766645, "ts": 1781703766645, "bill": 329, "tip": 21, "pay": "card", "table": "1", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1781790563985, "ts": 1781790563985, "bill": 1460, "tip": 140, "pay": "card", "table": "2", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1781790588841, "ts": 1781790588841, "bill": 200, "tip": 30, "pay": "card", "table": "4", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1781793585587, "ts": 1781793585587, "bill": 1551, "tip": 0, "pay": "card", "table": "19", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782137195580, "ts": 1782137195580, "bill": 585, "tip": 65, "pay": "card", "table": "31", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782137218624, "ts": 1782137218624, "bill": 2921, "tip": 299, "pay": "card", "table": "10", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782218692899, "ts": 1782218692899, "bill": 505, "tip": 45, "pay": "card", "table": "", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782218721064, "ts": 1782218721064, "bill": 615, "tip": 55, "pay": "card", "table": "", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782218745515, "ts": 1782218745515, "bill": 340, "tip": 35, "pay": "card", "table": "", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782218769818, "ts": 1782218769818, "bill": 680, "tip": 120, "pay": "card", "table": "", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782218805622, "ts": 1782218805622, "bill": 585, "tip": 65, "pay": "card", "table": "", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782224708508, "ts": 1782224708508, "bill": 854, "tip": 85, "pay": "card", "table": "33", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782297724752, "ts": 1782297724752, "bill": 525, "tip": 100, "pay": "card", "table": "44", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782300776687, "ts": 1782300776687, "bill": 660, "tip": 50, "pay": "card", "table": "18", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782412096146, "ts": 1782412096146, "bill": 335, "tip": 50, "pay": "card", "table": "", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782412129857, "ts": 1782412129857, "bill": 333, "tip": 37, "pay": "card", "table": "", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782412150045, "ts": 1782412150045, "bill": 1325, "tip": 175, "pay": "card", "table": "", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782412175870, "ts": 1782412175870, "bill": 1736, "tip": 204, "pay": "card", "table": "", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782412204234, "ts": 1782412204234, "bill": 810, "tip": 190, "pay": "card", "table": "", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782738030896, "ts": 1782738030896, "bill": 559, "tip": 11, "pay": "card", "table": "", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782738056779, "ts": 1782738056779, "bill": 225, "tip": 22, "pay": "card", "table": "", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782742531141, "ts": 1782742531141, "bill": 480, "tip": 70, "pay": "card", "table": "8", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782827472911, "ts": 1782827472912, "bill": 745, "tip": 80, "pay": "card", "table": "20", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782827494662, "ts": 1782827494662, "bill": 420, "tip": 42, "pay": "card", "table": "28", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782827533778, "ts": 1782827533778, "bill": 2640, "tip": 560, "pay": "card", "table": "2", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782904588263, "ts": 1782904588263, "bill": 1620, "tip": 280, "pay": "card", "table": "4", "suggPct": null, "suggAmt": null, "img": null}, {"id": 1782906931731, "ts": 1782906931731, "bill": 835, "tip": 85, "pay": "card", "table": "", "suggPct": null, "suggAmt": null, "img": null}], "cash": {"2026-06-16": {"adj": ""}, "2026-06-23": {"adj": ""}, "2026-06-22": {"adj": ""}, "2026-06-18": {"adj": ""}, "2026-06-17": {"adj": ""}, "2026-06-25": {"adj": ""}, "2026-06-30": {"adj": ""}}, "cfg": {"cur": "R"}};
const KEY='shiftledger.slips.v1', CASHKEY='shiftledger.cash.v1', CFGKEY='shiftledger.cfg.v1';
let slips=load(KEY,[]), cash=load(CASHKEY,{}), cfg=load(CFGKEY,{cur:'R'});
let editId=null, curPay='card', curPct=null, curImg=null;
let histRange='week', anRange='week', cashDay=todayKey();

function load(k,def){try{return JSON.parse(localStorage.getItem(k))??def}catch(e){return def}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
function persist(){
  if(!save(KEY,slips)){
    // storage full: drop photos oldest-first until the numbers fit, never lose the data
    const imgs=slips.filter(s=>s.img).sort((a,b)=>a.ts-b.ts);
    for(const s of imgs){s.img=null;if(save(KEY,slips))break}
    if(!save(KEY,slips))alert('Phone storage is full. Export a backup, then Full Reset to free space.');
  }
  save(CASHKEY,cash);save(CFGKEY,cfg);
}

const cur=()=>cfg.cur||'R';
function money(n){n=Number(n)||0;const neg=n<0;const[a,b]=Math.abs(n).toFixed(2).split('.');
  return (neg?'-':'')+cur()+' '+a.replace(/\B(?=(\d{3})+(?!\d))/g,' ')+'.'+b}
function pct(n){return (Math.round((Number(n)||0)*100)/100)+'%'}
function r2(n){return Math.round(((Number(n)||0)+1e-9)*100)/100}
function todayKey(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function keyOf(ts){return todayKey(new Date(ts))}
function hourOf(ts){return new Date(ts).getHours()}
const DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function prettyKey(k){const[y,m,d]=k.split('-').map(Number);const dt=new Date(y,m-1,d);return DOW[dt.getDay()]+' '+d+' '+MON[m-1]}
function prettyTime(ts){const d=new Date(ts);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}

function show(v){
  document.querySelectorAll('.view').forEach(s=>s.classList.toggle('active',s.id===v));
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('on',t.dataset.v===v));
  if(v==='today')renderToday();
  if(v==='history')renderHistory();
  if(v==='cashup')renderCash();
  if(v==='analytics')renderAnalytics();
  if(v==='settings'){document.getElementById('curSym').value=cur();document.getElementById('settingsName').value=cfg.waiterName||''}
}

/* ---------- summarise ---------- */
function summarise(list){
  let s={n:list.length,sales:0,tips:0,sugg:0,card:0,cash:0,largest:0,hiTip:0};
  list.forEach(x=>{s.sales+=x.bill;s.tips+=x.tip;s.sugg+=x.suggAmt||0;
    if(x.pay==='cash')s.cash+=x.bill;else s.card+=x.bill;
    s.largest=Math.max(s.largest,x.bill);s.hiTip=Math.max(s.hiTip,x.tip)});
  s.avg=s.sales>0?(s.tips/s.sales*100):0;
  s.spend=s.n>0?s.sales/s.n:0;
  return s;
}
function slipsForDay(k){return slips.filter(x=>keyOf(x.ts)===k)}
function rangeStart(range){const now=new Date();
  if(range==='today')return todayKey();
  if(range==='week'){const x=new Date();const d=(x.getDay()+6)%7;x.setDate(x.getDate()-d);return todayKey(x)}
  if(range==='month')return todayKey(new Date(now.getFullYear(),now.getMonth(),1));
  if(range==='30')return todayKey(new Date(Date.now()-29*864e5));
  if(range==='90')return todayKey(new Date(Date.now()-89*864e5));
  return '0000'}
function inRange(range){const start=rangeStart(range);return slips.filter(x=>range==='all'?true:keyOf(x.ts)>=start)}

/* ---------- TODAY ---------- */
function renderToday(){
  const d=new Date();document.getElementById('todayDate').textContent=DOW[d.getDay()]+' '+d.getDate()+' '+MON[d.getMonth()];
  const list=slipsForDay(todayKey()).sort((a,b)=>b.ts-a.ts);const s=summarise(list);
  document.getElementById('todaySales').textContent=money(s.sales);
  document.getElementById('todayTips').textContent=money(s.tips);
  document.getElementById('todayAvg').textContent=pct(s.avg);
  document.getElementById('todayTables').textContent=s.n;
  document.getElementById('todaySpend').textContent=money(s.spend);
  const el=document.getElementById('todayList');
  el.innerHTML=list.length?list.map(rowHtml).join(''):emptyHtml('No tables yet today','Tap Add slip after each table.');
}
function rowHtml(x){const wn=cfg.waiterName?(' · '+cfg.waiterName):'';return `<div class="line-item" onclick="openSlip(${x.id})">
  <div class="li-left"><span class="tag">${x.table?'T'+x.table:'—'}</span>
  <div><div>${money(x.bill)}</div><div class="small muted">${prettyTime(x.ts)} · ${x.pay}</div></div></div>
  <span class="mono" style="color:var(--amber)">+${money(x.tip)}</span></div>`}
function emptyHtml(t,b){return `<div class="empty"><b>${t}</b>${b}</div>`}

/* ---------- HISTORY ---------- */
function renderHistory(){
  const ranges=[['today','Today'],['week','This week'],['month','This month'],['all','All']];
  document.getElementById('histFilters').innerHTML=ranges.map(([v,l])=>
    `<button class="chip ${histRange===v?'on green':''}" onclick="histRange='${v}';renderHistory()">${l}</button>`).join('');
  const list=inRange(histRange);const s=summarise(list);
  document.getElementById('histSales').textContent=money(s.sales);
  document.getElementById('histTips').textContent=money(s.tips);
  document.getElementById('histTables').textContent=s.n;
  const days={};list.forEach(x=>{const k=keyOf(x.ts);(days[k]=days[k]||[]).push(x)});
  const keys=Object.keys(days).sort().reverse();
  document.getElementById('histDays').innerHTML=keys.length?keys.map(k=>{
    const ds=summarise(days[k]);
    return `<div style="margin-bottom:16px"><div class="row" style="margin-bottom:8px">
      <b style="font-size:17px">${prettyKey(k)}</b><span class="mono" style="color:var(--green)">${money(ds.sales)}</span></div>
      <div class="card">${days[k].sort((a,b)=>b.ts-a.ts).map(rowHtml).join('')}</div></div>`}).join(''):
    `<div class="card">${emptyHtml('Nothing in this range','Switch the filter or add a slip.')}</div>`;
}

/* ---------- CASH-UP ---------- */
function renderCash(){
  const active=[...new Set(slips.map(x=>keyOf(x.ts)))].sort().reverse();
  if(!active.includes(cashDay))cashDay=active[0]||todayKey();
  const days=active.length?active:[todayKey()];
  document.getElementById('cashDate').textContent=prettyKey(cashDay);
  document.getElementById('cashDays').innerHTML=days.slice(0,8).map(k=>
    `<button class="chip ${k===cashDay?'on green':''}" onclick="cashDay='${k}';renderCash()">${k.slice(5)}</button>`).join('');
  const s=summarise(slipsForDay(cashDay));
  document.getElementById('cuSlips').textContent=s.n;
  document.getElementById('cuSales').textContent=money(s.sales);
  document.getElementById('cuCard').textContent=money(s.card);
  document.getElementById('cuCash').textContent=money(s.cash);
  document.getElementById('cuSugg').textContent=money(s.sugg);
  document.getElementById('cuTips').textContent=money(s.tips);
  document.getElementById('cuAvg').textContent=pct(s.avg);
  const c=cash[cashDay]||{adj:'',notes:''};
  document.getElementById('cuAdj').value=c.adj||'';
  document.getElementById('cuNotes').value=c.notes||'';
  recalcCash();
}
function recalcCash(){const s=summarise(slipsForDay(cashDay));
  const adj=Number(document.getElementById('cuAdj').value)||0;
  document.getElementById('cuExpected').textContent=money(s.cash+adj);
  cash[cashDay]=cash[cashDay]||{};cash[cashDay].adj=document.getElementById('cuAdj').value;persist()}
function saveCashNotes(){cash[cashDay]=cash[cashDay]||{};cash[cashDay].notes=document.getElementById('cuNotes').value;persist()}

/* ---------- ANALYTICS ---------- */
function renderAnalytics(){
  const ranges=[['week','7 days'],['30','30 days'],['90','90 days']];
  document.getElementById('anFilters').innerHTML=ranges.map(([v,l])=>
    `<button class="chip ${anRange===v?'on green':''}" onclick="anRange='${v}';renderAnalytics()">${l}</button>`).join('');
  const list=inRange(anRange);const s=summarise(list);
  document.getElementById('anSalesTotal').textContent=money(s.sales);
  document.getElementById('anTipsTotal').textContent=money(s.tips);
  document.getElementById('anTipRate').textContent=pct(s.avg);
  document.getElementById('anSpend').textContent=money(s.spend);
  document.getElementById('anLargest').textContent=money(s.largest);
  document.getElementById('anHiTip').textContent=money(s.hiTip);
  document.getElementById('anCount').textContent=s.n;
  document.getElementById('anSalesChart').innerHTML=barChart(byDay(list,'bill'),'var(--green)');
  document.getElementById('anTipsChart').innerHTML=barChart(byDay(list,'tip'),'var(--amber)');
  document.getElementById('anHourChart').innerHTML=barChart(byHour(list),'var(--green)',120);
  document.getElementById('anInsights').innerHTML=insights(list);
}
function byDay(list,f){const m={};list.forEach(x=>{const k=keyOf(x.ts);m[k]=(m[k]||0)+x[f]});
  return Object.keys(m).sort().slice(-14).map(k=>({label:k.slice(5),value:m[k]}))}
function byHour(list){const c=Array(24).fill(0);list.forEach(x=>c[hourOf(x.ts)]++);
  return c.map((v,h)=>({label:h,value:v})).filter(p=>p.label>=8)}
function barChart(data,color,h){h=h||150;if(!data.length)return '<div class="small muted" style="padding:12px 0">No data yet.</div>';
  const W=320,pad=8,max=Math.max(1,...data.map(d=>d.value)),n=data.length,gap=6,bw=(W-pad*2-gap*(n-1))/n;
  let bars='';data.forEach((d,i)=>{const bh=d.value/max*(h-30),x=pad+i*(bw+gap),y=h-18-bh;
    bars+=`<rect x="${x}" y="${y}" width="${bw}" height="${Math.max(bh,1)}" rx="3" fill="${color}" opacity="0.9"/>`});
  const labels=data.map(d=>`<span>${d.label}</span>`).join('');
  return `<svg viewBox="0 0 ${W} ${h}"><line x1="0" y1="${h-18}" x2="${W}" y2="${h-18}" stroke="var(--line)"/>${bars}</svg>
    <div class="barlabels">${labels}</div>`}
function insights(list){
  if(list.length<3)return '<div class="small muted">Add a few more slips and insights appear here.</div>';
  const out=[];const c=Array(24).fill(0);list.forEach(x=>c[hourOf(x.ts)]++);
  const peak=c.indexOf(Math.max(...c));
  out.push(['🔥',`Busiest window is around ${String(peak).padStart(2,'0')}:00 — ${c[peak]} tables.`]);
  const wd={};list.forEach(x=>{const day=new Date(x.ts).getDay();const e=wd[day]||{t:0,s:0};e.t+=x.tip;e.s+=x.bill;wd[day]=e});
  let bestDay=-1,bestPct=-1,allT=0,allS=0;
  Object.keys(wd).forEach(day=>{allT+=wd[day].t;allS+=wd[day].s;const p=wd[day].s>0?wd[day].t/wd[day].s*100:0;if(p>bestPct){bestPct=p;bestDay=+day}});
  const overall=allS>0?allT/allS*100:0;
  if(bestDay>=0&&overall>0){const lift=r2((bestPct-overall)/overall*100);
    out.push(['💸',lift>5?`You earn ${lift}% more tips on ${['Sundays','Mondays','Tuesdays','Wednesdays','Thursdays','Fridays','Saturdays'][bestDay]} than your average day.`:`Your average tip rate is ${r2(overall)}%.`])}
  const s=summarise(list);out.push(['🍽️',`Average table spend is ${money(s.spend)} across ${s.n} tables.`]);
  return out.map(([i,t])=>`<div class="insight"><span style="font-size:18px">${i}</span><span>${t}</span></div>`).join('');
}

/* ---------- ADD/EDIT SLIP ---------- */
function openSlip(id){
  editId=id??null;curPay='card';curPct=null;
  document.getElementById('slipTitle').textContent=editId?'Edit slip':'New slip';
  document.getElementById('delBtn').style.display=editId?'flex':'none';
  const x=editId?slips.find(s=>s.id===editId):null;
  document.getElementById('fBill').value=x?x.bill:'';
  document.getElementById('fTable').value=x?(x.table||''):'';
  document.getElementById('fTip').value=x?x.tip:'';
  curPay=x?x.pay:'card';curPct=x?x.suggPct:null;setPay(curPay);
  curImg=x?(x.img||null):null;
  const tw=document.getElementById('slipThumbWrap');
  if(curImg){document.getElementById('slipThumb').src=curImg;tw.style.display='block'}else{tw.style.display='none'}
  document.getElementById('ocrStatus').textContent='';
  renderPresets();recalcSlip();
  document.getElementById('slipSheet').classList.add('open');
}
function closeSlip(){document.getElementById('slipSheet').classList.remove('open')}
function setPay(p){curPay=p;document.getElementById('payCard').classList.toggle('on',p==='card');
  document.getElementById('payCash').classList.toggle('on',p==='cash')}
function renderPresets(){const bill=Number(document.getElementById('fBill').value)||0;
  document.getElementById('tipPresets').innerHTML=PRESETS.map(p=>
    `<button class="chip ${curPct===p?'on amber':''}" onclick="applyPreset(${p})">${p}%</button>`).join('')}
function applyPreset(p){curPct=p;const bill=Number(document.getElementById('fBill').value)||0;
  document.getElementById('fTip').value=r2(bill*p/100);renderPresets();recalcSlip()}
function onTipEdit(){curPct=null;renderPresets();recalcSlip()}
function recalcSlip(){const bill=r2(document.getElementById('fBill').value),tip=r2(document.getElementById('fTip').value);
  document.getElementById('sumBill').textContent=money(bill);
  document.getElementById('sumTip').textContent=money(tip);
  document.getElementById('sumTotal').textContent=money(bill+tip);
  document.getElementById('tipPctNote').textContent=(bill>0&&tip>0)?`That's ${r2(tip/bill*100)}% of the bill.`:'';
  renderPresets()}
function saveSlip(){const bill=r2(document.getElementById('fBill').value);
  if(bill<=0){alert('Enter the bill amount first.');return}
  const tip=r2(document.getElementById('fTip').value);
  const suggAmt=curPct!=null?r2(bill*curPct/100):null;
  if(editId){const x=slips.find(s=>s.id===editId);Object.assign(x,{bill,tip,pay:curPay,
    table:document.getElementById('fTable').value.trim(),suggPct:curPct,suggAmt,img:curImg})}
  else{slips.push({id:Date.now(),ts:Date.now(),bill,tip,pay:curPay,
    table:document.getElementById('fTable').value.trim(),suggPct:curPct,suggAmt,img:curImg})}
  persist();closeSlip();show('today')}
function deleteSlip(){if(!confirm('Delete this slip?'))return;slips=slips.filter(s=>s.id!==editId);persist();closeSlip();show('today')}

/* ---------- PHOTO + OCR ---------- */
function downscale(file,maxW){return new Promise((res,rej)=>{
  const img=new Image(),url=URL.createObjectURL(file);
  img.onload=()=>{const sc=Math.min(1,maxW/img.width),w=Math.round(img.width*sc),h=Math.round(img.height*sc);
    const c=document.createElement('canvas');c.width=w;c.height=h;
    c.getContext('2d').drawImage(img,0,0,w,h);URL.revokeObjectURL(url);
    res(c.toDataURL('image/jpeg',0.6))};
  img.onerror=rej;img.src=url})}
function prep(file,maxW){return new Promise((res,rej)=>{
  const img=new Image(),url=URL.createObjectURL(file);
  img.onload=()=>{const sc=Math.min(1,maxW/img.width),w=Math.round(img.width*sc),h=Math.round(img.height*sc);
    const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,w,h);
    try{const d=ctx.getImageData(0,0,w,h),a=d.data;
      for(let i=0;i<a.length;i+=4){let g=0.299*a[i]+0.587*a[i+1]+0.114*a[i+2];g=(g-128)*1.35+128;
        g=g<0?0:g>255?255:g;a[i]=a[i+1]=a[i+2]=g}
      ctx.putImageData(d,0,0)}catch(e){}
    URL.revokeObjectURL(url);res(c.toDataURL('image/jpeg',0.7))};
  img.onerror=rej;img.src=url})}
let _stream=null;
function canvasFrom(src,maxW,gray){
  const sw=src.videoWidth||src.naturalWidth||src.width,sh=src.videoHeight||src.naturalHeight||src.height;
  const sc=Math.min(1,maxW/sw),w=Math.round(sw*sc),h=Math.round(sh*sc);
  const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(src,0,0,w,h);
  if(gray){try{const d=ctx.getImageData(0,0,w,h),a=d.data;for(let i=0;i<a.length;i+=4){let g=0.299*a[i]+0.587*a[i+1]+0.114*a[i+2];g=(g-128)*1.35+128;g=g<0?0:g>255?255:g;a[i]=a[i+1]=a[i+2]=g}ctx.putImageData(d,0,0)}catch(e){}}
  return c.toDataURL('image/jpeg',gray?0.7:0.6);
}
async function openCamera(){
  const st=document.getElementById('ocrStatus');
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){document.getElementById('slipPhoto').click();return}
  try{
    _stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
    const v=document.getElementById('camVideo');v.srcObject=_stream;await v.play();
    document.getElementById('camOverlay').style.display='flex';
  }catch(e){st.textContent='Camera blocked — using photo library instead.';document.getElementById('slipPhoto').click();}
}
function closeCamera(){
  if(_stream){_stream.getTracks().forEach(t=>t.stop());_stream=null}
  const v=document.getElementById('camVideo');v.srcObject=null;
  document.getElementById('camOverlay').style.display='none';
}
async function capturePhoto(){
  const v=document.getElementById('camVideo');if(!v.videoWidth){return}
  curImg=canvasFrom(v,900,false);
  const ocrData=canvasFrom(v,1300,true);
  closeCamera();
  document.getElementById('slipThumb').src=curImg;
  document.getElementById('slipThumbWrap').style.display='block';
  await runOCR(ocrData);
}
function readAsDataURL(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)})}
async function onPhoto(e){
  const st=document.getElementById('ocrStatus');
  const f=e.target&&e.target.files&&e.target.files[0];
  if(!f){st.textContent='⚠️ No photo came back from the camera. Tap the button again and choose Camera.';return}
  try{e.target.value=''}catch(_){}
  st.textContent='📸 Photo received ('+Math.round(f.size/1024)+' KB). Attaching…';
  let shown=false;
  try{const url=await readAsDataURL(f);
    document.getElementById('slipThumb').src=url;
    document.getElementById('slipThumbWrap').style.display='block';shown=true;
    curImg=url;
  }catch(_){}
  try{const small=await downscale(f,900);curImg=small;
    if(!shown){document.getElementById('slipThumb').src=small;document.getElementById('slipThumbWrap').style.display='block';shown=true}
  }catch(_){}
  if(!shown){st.textContent='⚠️ Could not open that photo file. Type the total below.';return}
  try{const ocrData=await prep(f,1300);await runOCR(ocrData);}
  catch(err){st.textContent='✓ Photo attached. Auto-read unavailable — type the total below.';}
}
async function runOCR(dataUrl){const st=document.getElementById('ocrStatus');
  st.textContent='🔎 Reading slip…';
  try{
    const fd=new FormData();
    fd.append('apikey',OCR_API_KEY);
    fd.append('base64Image',dataUrl);
    fd.append('language','eng');
    fd.append('scale','true');
    fd.append('OCREngine','2');
    const r=await fetch('https://api.ocr.space/parse/image',{method:'POST',body:fd});
    const j=await r.json();
    if(j.IsErroredOnProcessing)throw new Error((j.ErrorMessage&&j.ErrorMessage[0])||'reader error');
    const text=(j.ParsedResults&&j.ParsedResults[0]&&j.ParsedResults[0].ParsedText)||'';
    const p=parseSlip(text);
    if(p.total&&!Number(document.getElementById('fBill').value))document.getElementById('fBill').value=p.total;
    if(p.table&&!document.getElementById('fTable').value)document.getElementById('fTable').value=p.table;
    if(p.tip&&!Number(document.getElementById('fTip').value)){document.getElementById('fTip').value=p.tip;curPct=null}
    recalcSlip();
    const found=[p.total?'total':'',p.table?'table':'',p.tip?'tip':''].filter(Boolean).join(', ');
    st.textContent=found?`✓ Read ${found}. Check the fields before saving.`:`Read the slip but couldn't find clear fields — type the total below.`;
  }catch(err){st.textContent='Could not auto-read ('+(err.message||'network')+') — type the total below.';}}
function parseAmount(str){
  let s=String(str).replace(/[Rr\s]/g,'');
  if(s.indexOf('.')>=0 && s.indexOf(',')>=0){
    const dec=s.lastIndexOf('.')>s.lastIndexOf(',')?'.':',';const thou=dec==='.'?',':'.';
    s=s.split(thou).join('').replace(dec,'.');
  } else if(s.indexOf(',')>=0){
    s=/,\d{2}$/.test(s)?s.replace(/\./g,'').replace(',','.'):s.replace(/,/g,'');
  }
  const n=parseFloat(s);return isFinite(n)?n:null;
}
function amountsIn(line){const out=[],re=/(?:R\s?)?(\d[\d ,]*[.,]\d{2})/g;let m;
  while((m=re.exec(line))){const v=parseAmount(m[1]);if(v!=null)out.push(v)}return out}
// SA restaurant slips: VAT-inclusive (15%), "R" currency, TOTAL / TOTAL DUE / BALANCE DUE,
// SUBTOTAL + VAT lines, "Table"/"Tafel"/"Tbl", optional printed Tip/Gratuity, CHANGE/TENDERED lines.
function parseSlip(raw){
  const o={},text=(raw||'').replace(/\u00a0/g,' ');
  const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  for(const l of lines){const m=l.match(/\b(?:table|tafel|tbl)\b\.?\s*#?:?\s*(\d{1,3})/i);if(m){o.table=m[1];break}}
  for(const l of lines){if(/\b(gratuity|tip|service\s*charge)\b/i.test(l)){const a=amountsIn(l);if(a.length){o.tip=a[a.length-1];break}}}
  const strong=/\b(grand\s*total|total\s*due|balance\s*due|amount\s*due|total\s*inc)\b/i;
  const exclude=/\b(sub\s*-?\s*total|vat|change|tender|tendered|rounding|cash|card|received|paid|deposit|qty)\b/i;
  let total=null;
  for(const l of lines){if(strong.test(l)){const a=amountsIn(l);if(a.length){total=a[a.length-1];break}}}
  if(total==null)for(const l of lines){if(/\btotal\b/i.test(l)&&!/sub\s*-?\s*total/i.test(l)&&!/vat/i.test(l)){const a=amountsIn(l);if(a.length)total=a[a.length-1]}}
  if(total==null){let best=0;for(const l of lines){if(exclude.test(l))continue;for(const v of amountsIn(l))best=Math.max(best,v)}if(best>0)total=best}
  if(total!=null)o.total=Math.round(total*100)/100;
  const tm=text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);if(tm)o.time=tm[1].padStart(2,'0')+':'+tm[2];
  return o;
}

/* ---------- SETTINGS ---------- */
function deactivate(){
  if(!confirm('Deactivate ShiftLedger on this device? You will need your PIN to re-activate.'))return;
  localStorage.removeItem('shiftledger.pin.v1');
  location.reload();
}
function exportData(){const blob=new Blob([JSON.stringify({app:'ShiftLedger',v:1,slips,cash,cfg},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='shiftledger-backup-'+todayKey()+'.json';a.click()}
function importData(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{try{const d=JSON.parse(r.result);if(d.app!=='ShiftLedger')throw 0;
    if(!confirm('Replace all current data with this backup?'))return;
    slips=d.slips||[];cash=d.cash||{};cfg=d.cfg||{cur:'R'};persist();alert('Restored '+slips.length+' slips.');show('today')}
    catch(err){alert('That file is not a ShiftLedger backup.')}};r.readAsText(f);e.target.value=''}
function setCurrency(){cfg.cur=document.getElementById('curSym').value||'R';persist();show('settings')}
function fullReset(){if(!confirm('Erase everything on this phone? This cannot be undone.'))return;
  slips=[];cash={};persist();alert('All data erased.');show('today')}

// Photo input: wire via addEventListener (more reliable than inline handler on mobile)
(function(){var sp=document.getElementById('slipPhoto');if(sp)sp.addEventListener('change',onPhoto);})();
// Remove any old service worker + caches so updates always go live (no stale versions)
if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{});
  if(window.caches&&caches.keys)caches.keys().then(ks=>ks.forEach(k=>caches.delete(k))).catch(()=>{});
}
// One-time import of the pre-loaded month. Runs only on a fresh device; never overwrites existing data.
(function(){try{
  if(!localStorage.getItem('shiftledger.seeded.v1')){
    var cur=load(KEY,[]);
    if((!cur||cur.length===0)&&typeof SEED!=='undefined'&&SEED.slips){
      slips=SEED.slips; cash=SEED.cash||{}; cfg=SEED.cfg||cfg; persist();
    }
    localStorage.setItem('shiftledger.seeded.v1','1');
  }
}catch(e){}})();
/* ── WAITER NAME ── */
function saveName(){
  const v=document.getElementById('nameInput').value.trim();
  if(!v){alert('Please enter your name.');return}
  cfg.waiterName=v;persist();
  document.getElementById('nameModal').style.display='none';
  renderToday();
}
function updateWaiterName(v){cfg.waiterName=v.trim();persist();renderTodayWaiter()}
function renderTodayWaiter(){const el=document.getElementById('todayWaiter');if(el)el.textContent=cfg.waiterName?('👤 '+cfg.waiterName):''}
function checkFirstUse(){if(!cfg.waiterName){const m=document.getElementById('nameModal');m.style.display='flex'}}

/* ── SHIFT SUMMARY PDF ── */
function downloadShiftSummary(){
  const today=todayKey(new Date());
  const list=slipsForDay(today);
  const s=summarise(list);
  const d=new Date();
  const waiter=cfg.waiterName||'Waiter';
  const dateStr=DOW[d.getDay()]+' '+d.getDate()+' '+MON[d.getMonth()]+' '+d.getFullYear();
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({unit:'pt',format:'a4'});
  const W=doc.internal.pageSize.getWidth(),M=40;let y=M;
  // Header
  doc.setFillColor(14,20,19);doc.rect(0,0,W,90,'F');
  doc.setTextColor(61,220,151);doc.setFont('helvetica','bold');doc.setFontSize(22);doc.text('ShiftLedger',M,38);
  doc.setTextColor(237,243,240);doc.setFontSize(11);doc.text('Shift Summary',M,56);
  doc.setTextColor(138,155,149);doc.text(waiter+' · '+dateStr,M,72);
  y=110;doc.setTextColor(0);
  // Summary cards
  doc.setFont('helvetica','bold');doc.setFontSize(13);doc.setTextColor(30,30,30);
  doc.text('Shift Totals',M,y);y+=18;
  const rows=[
    ['Total sales', 'R '+s.totalSales.toFixed(2)],
    ['Tables served', String(s.slipCount)],
    ['Average spend', 'R '+s.avgSpend.toFixed(2)],
    ['Largest table', 'R '+s.largest.toFixed(2)],
    ['Total tips', 'R '+s.totalActualTips.toFixed(2)],
    ['Average tip %', s.avgTipPct.toFixed(1)+'%'],
    ['Card total', 'R '+s.cardTotal.toFixed(2)],
    ['Cash total', 'R '+s.cashTotal.toFixed(2)],
  ];
  doc.setFont('helvetica','normal');doc.setFontSize(11);
  rows.forEach(([k,v],i)=>{
    if(i%2===0)doc.setFillColor(245,246,248);else doc.setFillColor(255,255,255);
    doc.rect(M,y-12,W-2*M,18,'F');
    doc.setTextColor(90,90,90);doc.text(k,M+6,y);
    doc.setTextColor(20,20,20);doc.setFont('helvetica','bold');doc.text(v,W-M-6,y,{align:'right'});
    doc.setFont('helvetica','normal');y+=18;
  });
  y+=12;
  // Table breakdown
  doc.setFont('helvetica','bold');doc.setFontSize(13);doc.setTextColor(30,30,30);doc.text('Table Breakdown',M,y);y+=16;
  doc.setFontSize(10);doc.setTextColor(90,90,90);
  doc.text('Table',M,y);doc.text('Bill',M+90,y);doc.text('Tip',M+190,y);doc.text('Payment',M+270,y);doc.text('Time',W-M,y,{align:'right'});y+=4;
  doc.setDrawColor(200);doc.line(M,y,W-M,y);y+=14;
  const sorted=list.slice().sort((a,b)=>a.ts-b.ts);
  doc.setFont('helvetica','normal');doc.setTextColor(30,30,30);
  sorted.forEach(x=>{
    if(y>750){doc.addPage();y=M}
    const t=new Date(x.ts),time=String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0');
    doc.text(x.table?'T'+x.table:'—',M,y);
    doc.text('R '+x.bill.toFixed(2),M+90,y);
    doc.text('R '+x.tip.toFixed(2),M+190,y);
    doc.text(x.pay,M+270,y);
    doc.text(time,W-M,y,{align:'right'});
    y+=16;
  });
  // Footer
  const pages=doc.internal.getNumberOfPages();
  for(let i=1;i<=pages;i++){doc.setPage(i);doc.setFontSize(9);doc.setTextColor(180);doc.text('ShiftLedger · Generated '+new Date().toLocaleString(),M,doc.internal.pageSize.getHeight()-20)}
  if(list.length===0){alert('No tables captured today yet. Add some slips first.');return}
  doc.save('ShiftLedger-'+waiter.replace(/\s+/g,'-')+'-'+today+'.pdf');
}

/* ── ACCESS GATE ── */
const PINKEY='shiftledger.pin.v1';
function isActivated(){return localStorage.getItem(PINKEY)==='ACTIVE'}
function showPaywall(){document.getElementById('paywallScreen').style.display='flex'}
function hidePaywall(){document.getElementById('paywallScreen').style.display='none'}
function paywallSubscribe(){
  const name=encodeURIComponent(cfg.waiterName||'Waiter');
  window.location.href='/api/subscribe?name='+name;
}
async function activatePin(){
  const pin=(document.getElementById('pinInput').value||'').trim();
  const err=document.getElementById('pinError');
  if(pin.length!==6){err.textContent='Enter your 6-digit PIN.';return}
  err.textContent='Checking…';
  try{
    const r=await fetch('/api/activate?pin='+encodeURIComponent(pin));
    const j=await r.json();
    if(j.valid){localStorage.setItem(PINKEY,'ACTIVE');hidePaywall();checkFirstUse();renderToday();renderTodayWaiter();}
    else{err.textContent='PIN not found or expired. Check your email or contact support.'}
  }catch(e){err.textContent='Could not check PIN — try again when connected.'}
}
/* Check on return from PayFast */
if(window.location.search.includes('subscribed=1')){
  history.replaceState({},'',window.location.pathname);
  document.getElementById('pinError')&&(document.getElementById('pinError').textContent='');
  // Show a message — PIN will arrive by email
  setTimeout(()=>{
    const err=document.getElementById('pinError');
    if(err)err.textContent='Payment received! Your PIN is on its way to your email.';
    showPaywall();
  },300);
}
if(isActivated()){checkFirstUse();renderToday();renderTodayWaiter();}
else{showPaywall();}

