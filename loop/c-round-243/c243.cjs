// C round 243: independent browser verification of C-R242-01 fix (round-242 C helpers) (helpers copied from c-round-241/c241.cjs).
// usage: node c241.cjs <outDir> [rowFilter]
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = 'http://127.0.0.1:5173';
const HEAD_BASE = 'http://127.0.0.1:5174';
const outDir = process.argv[2];
const filter = process.argv[3] ? new RegExp(process.argv[3]) : null;
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, 'c243.json');
const R = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')) : { rows: {} };
R.started = new Date().toISOString();
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SECONDS = ['10', '5', '2', '1', '0.5', '0.25', '0.1'];
const STRAIGHT = ['bar', '1/2', '1/4', '1/8', '1/16', '1/32'];
const TRIPLET = ['1/2T', '1/4T', '1/8T', '1/16T', '1/32T'];
const BEATS = { bar: 4, '1/2': 2, '1/4': 1, '1/8': 0.5, '1/16': 0.25, '1/32': 0.125, '1/2T': 4 / 3, '1/4T': 2 / 3, '1/8T': 1 / 3, '1/16T': 1 / 6, '1/32T': 1 / 12 };
const secOf = (id, bpm) => (id in BEATS ? (BEATS[id] * 60) / bpm : Number(id));
const familyOf = (id) => (SECONDS.includes(id) ? SECONDS : STRAIGHT.includes(id) ? STRAIGHT : TRIPLET);
const SUF_A = ' · Adaptive: follows zoom — 5 for fixed';
const SUF_F = ' · Fixed at every zoom — 5 for adaptive';

const INIT = () => {
  window.__taps = [];
  const orig = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (target, ...rest) {
    const res = orig.call(this, target, ...rest);
    try {
      if (target instanceof AudioDestinationNode && !(this.context instanceof OfflineAudioContext)) {
        const a = this.context.createAnalyser(); a.fftSize = 2048; orig.call(this, a); window.__taps.push(a);
      }
    } catch (e) {}
    return res;
  };
  window.__rms = () => window.__taps.map((a) => { const d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return Math.sqrt(s / d.length); });
  window.__keys = [];
  window.addEventListener('keydown', (e) => { setTimeout(() => window.__keys.push({ code: e.code, ctrl: e.ctrlKey, repeat: e.repeat, prevented: e.defaultPrevented, target: e.target && e.target.tagName }), 0); }, true);
};

async function open(browser, vp, base = BASE) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); return s && s.textContent.startsWith('Demo collection ready'); }, undefined, { timeout: 120000 });
  await sleep(600);
  await page.evaluate(() => {
    window.__live = 0; window.__modeChanges = 0;
    const live = document.querySelector('output[aria-live]');
    if (live) new MutationObserver((rs) => { for (const r of rs) if (r.type === 'childList') window.__live += 1; }).observe(live, { childList: true, subtree: true, characterData: true });
    else window.__live = -1;
    const g = document.querySelector('[data-testid="arrangement-grid-control"]');
    new MutationObserver(() => { window.__modeChanges += 1; }).observe(g, { attributes: true, attributeFilter: ['data-grid-mode'] });
  });
  return { ctx, page, errors };
}
const blur = (page) => page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });

const G = (page) => page.evaluate(() => {
  const g = document.querySelector('[data-testid="arrangement-grid-control"]');
  const s = document.querySelector('[data-testid="arrangement-status"]');
  const br = document.querySelector('[data-testid="arrangement-bars-ruler"]');
  const sel = document.querySelector('[data-testid="arrangement-grid-division"]');
  const bodies = [...document.querySelectorAll('[data-track-id] [data-grid-seconds]')];
  const periods = bodies.map((b) => { const m = /([\d.]+)px\)\s*$/.exec((b.style.backgroundImage || '').trim()) || /transparent 1px ([\d.]+)px/.exec(b.style.backgroundImage || ''); return m ? Number(m[1]) : null; });
  const bodySecs = [...new Set(bodies.map((b) => b.getAttribute('data-grid-seconds')))];
  const ruler = document.querySelector('[data-testid="arrangement-ruler"]');
  const ticks = ruler ? [...ruler.querySelectorAll('span')].map((sp) => ({ text: sp.textContent.trim(), left: parseFloat(sp.parentElement.style.left) })).filter((t) => /\d/.test(t.text) && Number.isFinite(t.left)) : [];
  return {
    division: g?.getAttribute('data-grid-division'), seconds: g?.getAttribute('data-grid-seconds'), mode: g?.getAttribute('data-grid-mode'),
    lines: g?.getAttribute('data-grid-lines'), snap: g?.getAttribute('data-snap'), bpm: br?.getAttribute('data-bpm') ?? null,
    selectValue: sel?.value, title: sel?.getAttribute('title'), aria: sel?.getAttribute('aria-keyshortcuts'),
    status: s?.textContent ?? null, periods, bodySecs, ticks: ticks.slice(0, 4), live: window.__live, modeChanges: window.__modeChanges,
  };
});
const parseT = (t) => { const m = /^(?:(\d+):)?(\d+)(?:[.:](\d+))?$/.exec(t); if (!m) return null; return (m[1] ? Number(m[1]) * 60 : 0) + Number(m[2]) + (m[3] ? Number(`0.${m[3]}`) : 0); };
function inv(g) {
  const sec = Number(g.seconds);
  const p = g.periods.find((x) => x !== null) ?? null;
  const bpm = g.bpm ? Number(g.bpm) : null;
  let rulerPps = null;
  const tk = g.ticks.map((t) => ({ t: parseT(t.text), left: t.left })).filter((t) => t.t !== null);
  if (tk.length >= 2 && tk[1].t !== tk[0].t) rulerPps = (tk[1].left - tk[0].left) / (tk[1].t - tk[0].t);
  const pps = rulerPps;
  const fam = familyOf(g.division);
  const idx = fam.indexOf(g.division);
  const spacing = pps ? sec * pps : null;
  const finer = idx < fam.length - 1 ? secOf(fam[idx + 1], bpm) * pps : null;
  return {
    period: p, rulerPps, spacing, periodMatches: p !== null && spacing !== null ? Math.abs(p - spacing) <= 0.5 : null,
    secMatches: Math.abs(secOf(g.division, bpm) - sec) < 1e-6,
    ge24: spacing !== null ? spacing >= 24 - 1e-6 : null,
    finerLt24: finer === null ? 'family-end' : finer < 24,
    widestEnd: idx === 0,
  };
}

async function addBtn(page, id) {
  await page.locator(`[data-source-id="${id}"]`).first().click();
  await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await sleep(800);
  await blur(page);
}
async function seedEnter(page, id) {
  const row = page.locator(`[data-source-id="${id}"]`).first();
  const btn = row.locator('button').first();
  const target = (await btn.count()) ? btn : row;
  await target.focus();
  await page.keyboard.press('Enter');
  await sleep(1500);
}
async function key(page, k, wait = 200) { await page.keyboard.press(k); await sleep(wait); }

const wavInfo = (buf) => {
  const ch = buf.readUInt16LE(22); const rate = buf.readUInt32LE(24); const ba = buf.readUInt16LE(32); const bits = buf.readUInt16LE(34);
  let off = 12; let dataOff = -1; let dataSize = 0;
  while (off < buf.length - 8) { const id = buf.toString('ascii', off, off + 4); const sz = buf.readUInt32LE(off + 4); if (id === 'data') { dataOff = off + 8; dataSize = sz; break; } off += 8 + sz; }
  const frames = dataSize / ba; const bps = bits / 8;
  let s = 0; let n = 0; let peak = 0; let nan = 0;
  for (let f = 0; f < frames; f += 1) for (let c = 0; c < ch; c += 1) {
    const o = dataOff + f * ba + c * bps; let x;
    if (bits === 24) { let v = buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16); if (v & 0x800000) v -= 0x1000000; x = v / 8388608; } else if (bits === 16) { x = buf.readInt16LE(o) / 32768; } else { x = buf.readFloatLE(o); }
    if (!Number.isFinite(x)) nan += 1;
    s += x * x; n += 1; const a = Math.abs(x); if (a > peak) peak = a;
  }
  return { rate, bits, ch, frames, seconds: frames / rate, rmsDb: +(10 * Math.log10(s / n || 1e-20)).toFixed(2), peak: +peak.toFixed(4), nan, sha256: crypto.createHash('sha256').update(buf).digest('hex') };
};
const inventory = (page) => page.evaluate(() => {
  const rows = [];
  const vis = (el) => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false; } const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; };
  for (const el of document.body.querySelectorAll('*')) {
    if (['SCRIPT', 'STYLE', 'svg', 'path', 'OPTION'].includes(el.tagName)) continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
    if (!own || el.closest('.sr-only') || !vis(el)) continue;
    if (el.closest('[data-testid="arrangement-timeline-scroller"]')) continue;
    if (el.closest('[data-testid="arrangement-status"]')) continue;
    const region = el.closest('[data-testid]') ? el.closest('[data-testid]').getAttribute('data-testid') : el.tagName;
    rows.push(`${region}|${own.slice(0, 140)}`);
  }
  return rows;
});
const clipInfo = (page) => page.evaluate(() => [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => ({ start: Number(c.getAttribute('data-clip-start')), id: c.getAttribute('data-clip-id') })));
const isMult = (x, g) => Math.abs(x / g - Math.round(x / g)) * g < 0.0015;

const SEC_FAM = [10, 5, 2, 1, 0.5, 0.25, 0.1];
const secLabel = (v) => `${v} s`;
const baseIdx = (pps) => { for (let i = SEC_FAM.length - 1; i >= 0; i -= 1) if (SEC_FAM[i] * pps >= 24 - 1e-6) return i; return 0; };
const pickIdx = (pps, d) => Math.min(SEC_FAM.length - 1, Math.max(0, baseIdx(pps) - d));
function makeSim() {
  const s = { pps: 40, d: 0 };
  s.zoom = (k) => { s.pps = k === 'Equal' ? Math.min(320, s.pps * 1.25) : Math.max(0.5, s.pps / 1.25); };
  s.press = (k, snap) => {
    const step = k === 'Digit1' ? -1 : 1;
    const c = pickIdx(s.pps, s.d);
    const n = c - step;
    if (n < 0 || n >= SEC_FAM.length) return { division: String(SEC_FAM[c]), status: k === 'Digit1' ? `The grid is already at its narrowest — ${secLabel(SEC_FAM.at(-1))} (1)` : `The grid is already at its widest — ${secLabel(SEC_FAM[0])} (2)`, kind: 'end' };
    let x = s.d + step;
    while (x >= -2 && x <= 2 && pickIdx(s.pps, x) === c) x += step;
    if (x < -2 || x > 2) return { division: String(SEC_FAM[c]), status: k === 'Digit1' ? `The adaptive grid is already at its narrowest density — now ${secLabel(SEC_FAM[c])} (1)` : `The adaptive grid is already at its widest density — now ${secLabel(SEC_FAM[c])} (2)`, kind: 'limit' };
    s.d = x;
    return { division: String(SEC_FAM[pickIdx(s.pps, x)]), status: `Grid: ${secLabel(SEC_FAM[pickIdx(s.pps, x)])} (Snap ${snap})`, kind: 'step' };
  };
  s.expectDivision = () => String(SEC_FAM[pickIdx(s.pps, s.d)]);
  return s;
}
const REFUSAL = /^(The grid is already at its (narrowest|widest) — .+ \([12]\)|The adaptive grid is already at its (narrowest|widest) density — now .+ \([12]\))$/;
async function runSeq(page, seq) {
  const sim = makeSim();
  const steps = [];
  let prev = await G(page);
  steps.push({ step: 'mount', division: prev.division, mode: prev.mode, status: prev.status, simDivision: sim.expectDivision() });
  for (const k of seq) {
    if (k === 'Equal' || k === 'Minus') {
      sim.zoom(k); await key(page, k, 150);
      const g = await G(page);
      steps.push({ step: k, division: g.division, mode: g.mode, live: g.live, liveChanged: g.live !== prev.live, simDivision: sim.expectDivision(), simPps: +sim.pps.toFixed(4), rulerPps: inv(g).rulerPps, periodMatches: inv(g).periodMatches, zoomOk: g.division === sim.expectDivision() });
      prev = g; continue;
    }
    const exp = sim.press(k, prev.snap === 'on' ? 'on' : 'off');
    await key(page, k, 220);
    const g = await G(page);
    const fam = SEC_FAM.map(String);
    const moved = Math.abs(fam.indexOf(g.division) - fam.indexOf(prev.division)) === 1;
    const refusal = REFUSAL.test(g.status || '');
    const swallowed = g.division === prev.division && g.status === prev.status;
    steps.push({ step: k, division: g.division, mode: g.mode, status: g.status, moved, refusal, swallowed, okPress: (moved && !refusal) || (refusal && g.division === prev.division), simDivision: exp.division, simStatus: exp.status, simKind: exp.kind, matchesSim: g.division === exp.division && g.status === exp.status, storedDensityAfter: sim.d });
    prev = g;
  }
  return steps;
}
const rep = (k, n) => Array(n).fill(k);

async function openMenu(page){const pt=await page.evaluate(()=>{const vw=window.innerWidth,vh=window.innerHeight;for(const body of document.querySelectorAll('[data-track-id] [data-grid-lines]')){const r=body.getBoundingClientRect();for(const fx of [0.9,0.75,0.6,0.45,0.3]){const x=r.left+r.width*fx,y=r.top+r.height/2;if(x<=0||x>=vw-20||y<=0||y>=vh-10)continue;const hit=document.elementFromPoint(x,y);if(hit===body)return {x,y};}}return null;});if(!pt)return null;await page.mouse.click(pt.x,pt.y,{button:'right'});await sleep(350);const m=page.getByTestId('arrangement-grid-menu');if(!(await m.count()))return null;return m;}
async function menuInfo(page,m){const box=await m.boundingBox();const vp=page.viewportSize();const info=await m.evaluate((el)=>{const radios=[...el.querySelectorAll('[role=menuitemradio]')];const groups=[...el.querySelectorAll('fieldset')].map(g=>({legend:g.querySelector('legend')?.textContent??null,radios:[...g.querySelectorAll('[role=menuitemradio]')].map(r=>r.textContent.trim())}));const all=[...el.querySelectorAll('[role^=menuitem]')].map(x=>({role:x.getAttribute('role'),text:x.textContent.trim(),checked:x.getAttribute('aria-checked')}));const a=document.activeElement;return {radioCount:radios.length,checked:radios.filter(r=>r.getAttribute('aria-checked')==='true').map(r=>r.textContent.trim()),groups,all,hr:el.querySelectorAll('hr').length,focused:a?.textContent?.trim()??null,focusedInMenu:el.contains(a),focusVisible:a?a.matches(':focus-visible'):null,scrollH:el.scrollHeight,clientH:el.clientHeight};});return {...info,box,top:box?.y,height:box?.height,spareBottom:box?vp.height-(box.y+box.height):null,fits:box?box.y>=0&&box.y+box.height<=vp.height&&box.x>=0&&box.x+box.width<=vp.width:null};}
async function axDesc(page){const cdp=await page.context().newCDPSession(page);await cdp.send('Accessibility.enable');const {nodes}=await cdp.send('Accessibility.getFullAXTree');const n=nodes.find(x=>x.role?.value==='combobox'&&x.name?.value==='Grid division');await cdp.detach();return n?{name:n.name?.value,description:n.description?.value??null}:null;}
const activeDesc=(page)=>page.evaluate(()=>{const a=document.activeElement;return a?{tag:a.tagName,testid:a.getAttribute('data-testid'),text:(a.textContent||'').trim().slice(0,40),role:a.getAttribute('role'),focusVisible:a.matches(':focus-visible')}:null;});
async function tabTo(page,testid){await page.evaluate(()=>{document.body.focus();});for(let i=1;i<=120;i+=1){await page.keyboard.press('Tab');const t=await page.evaluate(()=>document.activeElement?.getAttribute('data-testid'));if(t===testid)return i;}return -1;}

const OLD = {
  async hand(browser, vp, key_) {
    const out = {};
    for (const [tag, pre] of [['a', 'Digit1']]) {
      const { ctx, page, errors } = await open(browser, vp);
      await blur(page);
      const r = { mount: await G(page) };
      if (pre) { await key(page, pre, 250); r.afterKey = await G(page); }
      await seedEnter(page, 'demo-synth-mix'); await blur(page);
      r.afterSeed = await G(page);
      await page.screenshot({ path: path.join(outDir, `hand-${tag}-${key_}.png`) });
      r.errors = errors;
      out[tag] = r;
      await ctx.close();
    }
    return out;
  },
  async menuGroups(browser, vp, key_) {
    const out = {};
    const { ctx, page, errors } = await open(browser, vp);
    await blur(page);
    let m = await openMenu(page);
    out.mount = m ? await menuInfo(page, m) : null;
    if (m) { await page.screenshot({ path: path.join(outDir, `menu-mount-${key_}.png`) }); await key(page, 'Escape'); }
    await seedEnter(page, 'demo-synth-mix'); await blur(page);
    out.seedGrid = await G(page);
    m = await openMenu(page);
    out.bpm = m ? await menuInfo(page, m) : null;
    if (m) { await page.screenshot({ path: path.join(outDir, `menu-bpm-${key_}.png`) }); await key(page, 'Escape'); }
    await blur(page);
    await key(page, 'Digit3', 250);
    out.tripGrid = await G(page);
    m = await openMenu(page);
    out.triplet = m ? await menuInfo(page, m) : null;
    if (m) { await page.screenshot({ path: path.join(outDir, `menu-triplet-${key_}.png`) }); await key(page, 'Escape'); }
    out.errors = errors;
    await ctx.close();
    return out;
  },
  async menuCheck(browser, vp, key_) {
    const out = {};
    const one = async (tag, pre) => {
      const { ctx, page, errors } = await open(browser, vp);
      await blur(page);
      if (pre) await pre(page);
      await blur(page);
      const m = await openMenu(page);
      out[tag] = m ? await menuInfo(page, m) : null;
      out[tag].grid = await G(page);
      if (m) { await page.screenshot({ path: path.join(outDir, `check-${tag}-${key_}.png`) }); await key(page, 'Escape'); }
      out[tag].errors = errors;
      await ctx.close();
    };
    await one('a', null);
    await one('b', async (page) => { await key(page, 'Digit5', 250); });
    await one('c', async (page) => { const m = await openMenu(page); await m.getByRole('menuitemradio', { name: '0.25 s', exact: true }).click(); await sleep(300); });
    await one('d', async (page) => { await seedEnter(page, 'demo-synth-mix'); });
    return out;
  },
  async menuChoose(browser, vp, key_) {
    const out = {};
    { // (a)
      const { ctx, page, errors } = await open(browser, vp); await blur(page);
      const r = { tabs: await tabTo(page, 'arrangement-snap-toggle') };
      r.before = await G(page);
      const m = await openMenu(page);
      await m.getByRole('menuitemradio', { name: 'Narrow', exact: true }).click(); await sleep(300);
      r.after = await G(page);
      r.menuOpen = await page.getByTestId('arrangement-grid-menu').count();
      r.active = await activeDesc(page);
      r.zoom = [];
      const sim = makeSim(); sim.d = -1;
      for (let i = 1; i <= 3; i += 1) {
        sim.zoom('Equal'); await key(page, 'Equal', 200);
        const g = await G(page);
        const iv = inv(g);
        r.zoom.push({ step: `=${i}`, division: g.division, mode: g.mode, period: iv.period, rulerPps: iv.rulerPps, simPps: sim.pps, expectNarrow: sim.expectDivision(), expectMedium: String(SEC_FAM[pickIdx(sim.pps, 0)]), ok: g.division === sim.expectDivision() });
      }
      await page.screenshot({ path: path.join(outDir, `choose-a-${key_}.png`) });
      r.errors = errors; out.a = r; await ctx.close();
    }
    { // (b)
      const { ctx, page, errors } = await open(browser, vp); await blur(page);
      await key(page, 'Digit5', 250);
      const r = { fixed: await G(page) };
      const m = await openMenu(page);
      await m.getByRole('menuitemradio', { name: 'Wide', exact: true }).click(); await sleep(300);
      r.after = await G(page);
      r.titleAdaptive = (r.after.title || '').endsWith(SUF_A);
      r.errors = errors; out.b = r; await ctx.close();
    }
    { // (c)
      const { ctx, page, errors } = await open(browser, vp); await blur(page);
      const m = await openMenu(page);
      const r = { onOpen: await activeDesc(page) };
      await page.keyboard.press('ArrowDown'); await sleep(150);
      r.afterDown1 = await activeDesc(page);
      r.ring = await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, boxShadow: cs.boxShadow }; });
      await page.screenshot({ path: path.join(outDir, `choose-c-ring-${key_}.png`) });
      await page.keyboard.press('ArrowDown'); await sleep(150);
      r.afterDown2 = await activeDesc(page);
      await page.keyboard.press('Enter'); await sleep(300);
      r.after = await G(page);
      r.menuOpen = await page.getByTestId('arrangement-grid-menu').count();
      r.errors = errors; out.c = r; await ctx.close();
    }
    { // (d)
      const { ctx, page, errors } = await open(browser, vp); await blur(page);
      const m = await openMenu(page);
      await m.getByRole('menuitemradio', { name: 'Narrow', exact: true }).click(); await sleep(300);
      const r = { narrow: await G(page) };
      await seedEnter(page, 'demo-synth-mix'); await blur(page);
      r.after = await G(page);
      r.errors = errors; out.d = r; await ctx.close();
    }
    return out;
  },
  async key4(browser, vp, key_) {
    const r = {};
    const { ctx, page, errors } = await open(browser, vp); await blur(page);
    r.mount = await G(page);
    r.snapAria = await page.getByTestId('arrangement-snap-toggle').getAttribute('aria-keyshortcuts');
    r.snapTitle = await page.getByTestId('arrangement-snap-toggle').getAttribute('title');
    await key(page, 'Digit4', 250); r.on = await G(page);
    await key(page, 'Digit4', 250); r.off = await G(page);
    await page.keyboard.down('Digit4'); await sleep(60); await page.keyboard.down('Digit4'); await sleep(60); await page.keyboard.down('Digit4'); await sleep(60); await page.keyboard.up('Digit4'); await sleep(250);
    r.held = await G(page);
    r.heldKeys = await page.evaluate(() => window.__keys.filter((k) => k.code === 'Digit4').slice(-3));
    r.heldOneFlip = r.off.snap !== r.held.snap;
    const snapBeforeCtrl = r.held.snap;
    await page.keyboard.press('Control+Digit4'); await sleep(250);
    r.ctrl = await G(page); r.ctrlKey = await page.evaluate(() => window.__keys.filter((k) => k.code === 'Digit4' && k.ctrl).slice(-1)[0]);
    r.ctrlOk = r.ctrl.snap === snapBeforeCtrl && r.ctrlKey && r.ctrlKey.prevented === false;
    // fields
    const field = async (name, focusFn, k) => {
      const before = await G(page);
      const el = await focusFn();
      await page.keyboard.press(k); await sleep(200);
      const val = await el.evaluate((e) => e.value);
      const after = await G(page);
      const res = { before: { snap: before.snap, mode: before.mode, division: before.division }, after: { snap: after.snap, mode: after.mode, division: after.division }, value: val, unchanged: before.snap === after.snap && before.mode === after.mode && before.division === after.division };
      await page.keyboard.press('Escape'); await sleep(200);
      return res;
    };
    const lib = async () => { const e = page.getByTestId('arrangement-library-search'); await e.click(); await e.fill(''); return e; };
    r.library4 = await field('library', lib, 'Digit4');
    r.library5 = await field('library', lib, 'Digit5');
    await page.getByTestId('arrangement-library-search').fill(''); await blur(page);
    const bpm = async () => { const e = page.getByTestId('arrangement-tempo-input'); await e.click(); await e.fill(''); return e; };
    r.bpm4 = await field('bpm', bpm, 'Digit4');
    r.bpm1 = await field('bpm', bpm, 'Digit1');
    await page.getByTestId('arrangement-tempo-input').fill(''); await page.keyboard.press('Enter'); await sleep(200); await blur(page);
    const marker = async () => { await blur(page); await page.keyboard.press('KeyM'); await sleep(300); const e = page.getByTestId('arrangement-marker-name-input'); await e.waitFor({ timeout: 5000 }); await e.fill(''); return e; };
    r.marker4 = await field('marker', marker, 'Digit4');
    r.marker2 = await field('marker', marker, 'Digit2');
    await blur(page);
    // ? sheet
    await page.keyboard.press('Shift+Slash'); await sleep(400);
    r.sheetOpen = await page.getByRole('dialog').count();
    const s = page.getByRole('dialog').locator('input[type="search"]');
    r.sheetActiveIsSearch = await s.evaluate((e) => e === document.activeElement);
    const before = await G(page);
    await s.click(); await page.keyboard.press('Digit4'); await sleep(300);
    r.sheet4 = { value: await s.inputValue(), snapUnchanged: (await G(page)).snap === before.snap };
    r.sheetRows = await page.getByRole('dialog').evaluate((d) => [...d.querySelectorAll('[data-shortcut-id]')].filter((x) => x.getBoundingClientRect().height > 0).map((x) => ({ id: x.getAttribute('data-shortcut-id'), text: x.textContent.trim().slice(0, 80), kbds: [...x.querySelectorAll('kbd')].map((k) => k.textContent.trim()) })));
    await page.screenshot({ path: path.join(outDir, `sheet-4-${key_}.png`) });
    await s.fill(''); await page.keyboard.press('Digit5'); await sleep(250);
    { const g5 = await G(page); r.sheet5 = { value: await s.inputValue(), gridUnchanged: g5.division === before.division && g5.snap === before.snap && g5.mode === before.mode }; }
    await s.fill(''); await sleep(200);
    r.sheetSnapRow = await page.getByRole('dialog').evaluate((d) => { const x = d.querySelector('[data-shortcut-id="snap"]'); return x ? { text: x.textContent.trim(), kbds: [...x.querySelectorAll('kbd')].map((k) => k.textContent.trim()) } : null; });
    await page.keyboard.press('Escape'); await sleep(300);
    r.sheetClosed = (await page.getByRole('dialog').count()) === 0;
    // Export open
    await blur(page);
    const beforeExp = await G(page);
    await page.getByRole('button', { name: 'Export', exact: true }).first().click(); await sleep(500);
    r.exportOpen = await page.getByRole('dialog').count();
    await page.keyboard.press('Digit4'); await sleep(250);
    const afterExp = await G(page);
    r.export4 = { before: beforeExp.snap, after: afterExp.snap, unchanged: beforeExp.snap === afterExp.snap && beforeExp.division === afterExp.division && beforeExp.mode === afterExp.mode };
    await page.keyboard.press('Escape'); await sleep(300); await blur(page);
    // focused select
    const sel = page.getByTestId('arrangement-grid-division');
    await sel.focus(); await sleep(100);
    const bs = await G(page);
    await page.keyboard.press('Digit4'); await sleep(250);
    const as = await G(page);
    r.select4keys = await page.evaluate(() => window.__keys.filter((k) => k.code === 'Digit4' && k.target === 'SELECT'));
    r.select4 = { before: { snap: bs.snap, value: bs.selectValue, division: bs.division, mode: bs.mode }, after: { snap: as.snap, value: as.selectValue, division: as.division, mode: as.mode, status: as.status }, key: await page.evaluate(() => window.__keys.filter((k) => k.code === 'Digit4').slice(-1)[0]) };
    r.selectAria = as.aria;
    await blur(page);
    await seedEnter(page, 'demo-synth-mix'); await blur(page);
    r.bpmAria = (await G(page)).aria;
    r.statusesWithBad = await page.evaluate(() => document.body.innerHTML.match(/\((G 4|4)\)/g) || []);
    r.errors = errors; await ctx.close();
    return r;
  },
  async s4ax(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp); await blur(page);
    const r = { adaptive: await axDesc(page) };
    await key(page, 'Digit5', 250);
    r.fixed = await axDesc(page);
    r.ok = /Adaptive: follows zoom/.test(r.adaptive?.description || '') && /Fixed at every zoom/.test(r.fixed?.description || '');
    r.errors = errors; await ctx.close();
    return r;
  },
  async menuReg(browser, vp, key_) {
    const r = {};
    { const { ctx, page, errors } = await open(browser, vp); await blur(page);
      r.tabs = await tabTo(page, 'arrangement-snap-toggle');
      const before = await G(page);
      const m = await openMenu(page); r.opened = !!m;
      await page.keyboard.press('Escape'); await sleep(300);
      const after = await G(page);
      r.esc = { closed: (await page.getByTestId('arrangement-grid-menu').count()) === 0, unchanged: before.division === after.division && before.mode === after.mode && before.snap === after.snap && before.status === after.status, active: await activeDesc(page) };
      // right-click header
      const hdr = page.getByTestId('arrangement-track-header').first();
      await page.evaluate(() => { window.__ctx = null; window.addEventListener('contextmenu', (e) => { setTimeout(() => { window.__ctx = e.defaultPrevented; }, 0); }, { once: true }); });
      await hdr.click({ button: 'right', position: { x: 20, y: 10 } }); await sleep(300);
      r.header = { gridMenu: await page.getByTestId('arrangement-grid-menu').count(), defaultPrevented: await page.evaluate(() => window.__ctx) };
      await page.keyboard.press('Escape');
      r.errors1 = errors; await ctx.close(); }
    { const { ctx, page, errors } = await open(browser, vp);
      await addBtn(page, 'demo-stem-pulse');
      const pos = () => page.evaluate(() => Number(document.querySelector('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow')));
      const playing = () => page.evaluate(() => document.querySelector('button[aria-label="Pause"]') !== null);
      await page.keyboard.press('Space'); await sleep(700);
      r.play = { playing: await playing(), p0: await pos() };
      const m = await openMenu(page);
      await m.getByRole('menuitemradio', { name: '0.25 s', exact: true }).click(); await sleep(500);
      r.play.afterChoose = { playing: await playing(), p1: await pos(), g: await G(page), rms: await page.evaluate(() => Math.max(0, ...window.__rms())) };
      await sleep(500); r.play.p2 = await pos();
      r.play.ok = r.play.afterChoose.playing && r.play.p2 > r.play.afterChoose.p1 && r.play.afterChoose.g.division === '0.25' && r.play.afterChoose.rms > 0.001;
      await page.keyboard.press('Space'); await sleep(400);
      // swallow: open menu, click Play (outside) -> only closes; next click on Play plays
      await blur(page);
      const playBtn = page.getByRole('button', { name: 'Play', exact: true }).first();
      const m2 = await openMenu(page); r.swallow = { opened: !!m2 };
      await playBtn.click(); await sleep(500);
      r.swallow.afterFirst = { menu: await page.getByTestId('arrangement-grid-menu').count(), playing: await playing() };
      await playBtn.click(); await sleep(600);
      r.swallow.afterSecond = { playing: await playing() };
      r.swallow.ok = r.swallow.afterFirst.menu === 0 && !r.swallow.afterFirst.playing && r.swallow.afterSecond.playing;
      await page.keyboard.press('Space');
      r.errors2 = errors; await ctx.close(); }
    return r;
  },
  async gridReg(browser, vp, key_) {
    const out = {};
    { const { ctx, page, errors } = await open(browser, vp); await blur(page);
      const steps = []; const push = async (step) => { const g = await G(page); steps.push({ step, division: g.division, mode: g.mode, status: g.status, live: g.live, inv: inv(g) }); };
      await push('mount'); for (let i = 1; i <= 6; i += 1) { await key(page, 'Equal'); await push(`=${i}`); }
      for (let i = 1; i <= 10; i += 1) { await key(page, 'Minus'); await push(`-${i}`); }
      out.adaptSec = { steps, errors }; await ctx.close(); }
    { const { ctx, page, errors } = await open(browser, vp); await blur(page);
      const steps = []; const push = async (step) => { const g = await G(page); steps.push({ step, division: g.division, mode: g.mode, status: g.status }); };
      await push('mount'); for (let i = 1; i <= 3; i += 1) { await key(page, 'Digit1'); await push(`1 x${i}`); }
      for (let i = 1; i <= 5; i += 1) { await key(page, 'Digit2'); await push(`2 x${i}`); }
      out.density = { steps, errors }; await ctx.close(); }
    const ref = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'c-round-239', 'out', 'c239.json'), 'utf8')).rows;
    const r1 = ref[`adaptSec@${key_}`].steps; const r2 = ref[`density@${key_}`].steps.slice(0, 9);
    out.cmpAdapt = out.adaptSec.steps.map((s, i) => ({ step: s.step, div: s.division, ref: r1[i]?.division, same: s.division === r1[i]?.division }));
    out.cmpDensity = out.density.steps.map((s, i) => ({ step: s.step, same: s.division === r2[i]?.division && s.status === r2[i]?.status, status: s.status, ref: r2[i]?.status }));
    const zl = out.adaptSec.steps.map((s) => s.live);
    out.liveOnZoom = { first: zl[0], last: zl.at(-1) };
    return out;
  },
  async budget(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    const empty = await inventory(page);
    await page.screenshot({ path: path.join(outDir, `budget-empty-${key_}.png`) });
    await addBtn(page, 'demo-stem-pulse');
    const demo = await inventory(page);
    await page.screenshot({ path: path.join(outDir, `budget-demo-${key_}.png`) });
    await ctx.close();
    const ref = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'c-round-239', 'out', 'c239.json'), 'utf8')).rows[`budget@${key_}`].work;
    const diff = (a, b) => ({ onlyRef: a.filter((x) => !b.includes(x)), onlyNow: b.filter((x) => !a.includes(x)) });
    return { empty: empty.length, demo: demo.length, refEmpty: ref.empty.length, refDemo: ref.demo.length, dEmpty: diff(ref.empty, empty), dDemo: diff(ref.demo, demo), errors };
  },
  async smoke(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const r = {};
    const pos = () => page.evaluate(() => Number(document.querySelector('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow')));
    r.pos0 = await pos();
    await page.keyboard.press('Space'); await sleep(900); r.posPlaying = await pos();
    r.rms = await page.evaluate(() => Math.max(0, ...window.__rms()));
    await page.keyboard.press('Space'); await sleep(400); r.posPaused = await pos(); await sleep(400); r.posPaused2 = await pos();
    await page.getByRole('button', { name: 'Export', exact: true }).first().click();
    const dlg = page.getByRole('dialog'); await dlg.waitFor();
    const dlP = page.waitForEvent('download', { timeout: 90000 });
    await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const dl = await dlP; const file = path.join(outDir, `export-${key_}.wav`); await dl.saveAs(file);
    r.wav = wavInfo(fs.readFileSync(file)); fs.unlinkSync(file);
    r.shaExpected = r.wav.sha256 === '1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94';
    r.errors = errors; await ctx.close();
    return r;
  },
  async auth(browser, vp, key_) {
    const ctx = await browser.newContext({ viewport: vp });
    const page = await ctx.newPage();
    const r = {};
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
    await page.waitForSelector('[data-testid="arrangement-ruler"]', { timeout: 120000 });
    r.labWorkspace = true;
    r.labAuthUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' }); await sleep(3000);
    r.guard = await page.evaluate(() => ({ path: location.pathname, signIn: /Sign in required/i.test(document.body.innerText), audioSrc: document.querySelectorAll('audio[src]').length, workspace: !!document.querySelector('[data-testid=arrangement-ruler]') }));
    await page.screenshot({ path: path.join(outDir, `auth-guard-${key_}.png`) });
    const api = `${BASE}/api/studio-token?product=middle-east&file=stem1.wav`;
    const a = await ctx.request.get(api, { failOnStatusCode: false });
    r.tokenNoHeader = { status: a.status(), body: (await a.text()).slice(0, 160) };
    await ctx.close(); return r;
  },
};


const FOCUS_LOG = () => {
  window.__f = [];
  const d = (e) => (e && e.getAttribute ? (e.getAttribute('data-testid') || `${e.tagName}:${(e.textContent || '').trim().slice(0, 14)}`) : String(e));
  const act = () => d(document.activeElement);
  document.addEventListener('focusin', (e) => window.__f.push(`in:${d(e.target)}`), true);
  document.addEventListener('focusout', (e) => window.__f.push(`out:${d(e.target)}`), true);
  for (const t of ['pointerdown', 'mousedown', 'contextmenu']) window.addEventListener(t, (e) => window.__f.push(`${t}[b${e.button}] active=${act()} target=${d(e.target)}`), true);
};
const startLog = (page) => page.evaluate(FOCUS_LOG);
const getLog = (page) => page.evaluate(() => window.__f);
const ringOf = (page) => page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { testid: a.getAttribute('data-testid'), tag: a.tagName, focusVisible: a.matches(':focus-visible'), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineOffset: cs.outlineOffset }; });
async function emptyLanePoints(page) {
  return page.evaluate(() => { const pts = []; for (const body of document.querySelectorAll('[data-track-id] [data-grid-lines]')) { const r = body.getBoundingClientRect(); for (const fx of [0.9, 0.75, 0.6, 0.45, 0.3]) { const x = r.left + r.width * fx; const y = r.top + r.height / 2; if (x <= 0 || x >= innerWidth - 20 || y <= 0 || y >= innerHeight - 10) continue; if (document.elementFromPoint(x, y) === body) { pts.push({ x, y, track: body.closest('[data-track-id]').getAttribute('data-track-id') }); break; } } } return pts; });
}
const SNAP = 'arrangement-snap-toggle';

const ROWS242 = {
  async focus(browser, vp, key_) {
    const out = {};
    for (const action of ['escape', 'division', 'width', 'escapeMusic']) {
      const { ctx, page, errors } = await open(browser, vp); await blur(page);
      const r = { tabs: await tabTo(page, SNAP) };
      r.before = await G(page);
      await startLog(page);
      let m;
      if (action === 'escapeMusic') { const pm = (await emptyLanePoints(page)).find((q) => q.track === 'music'); r.point = pm; await page.mouse.click(pm.x, pm.y, { button: 'right' }); await sleep(350); m = (await page.getByTestId('arrangement-grid-menu').count()) ? page.getByTestId('arrangement-grid-menu') : null; } else { m = await openMenu(page); }
      r.opened = !!m; r.inMenu = await activeDesc(page);
      if (action.startsWith('escape')) await page.keyboard.press('Escape');
      if (action === 'division') await m.getByRole('menuitemradio', { name: '0.5 s', exact: true }).click();
      if (action === 'width') await m.getByRole('menuitemradio', { name: 'Narrow', exact: true }).click();
      await sleep(400);
      r.menuOpen = await page.getByTestId('arrangement-grid-menu').count();
      r.final = await ringOf(page);
      r.after = await G(page);
      r.log = await getLog(page);
      r.ok = r.opened && r.menuOpen === 0 && r.final.testid === SNAP;
      await page.screenshot({ path: path.join(outDir, `focus-${action}-${key_}.png`) });
      r.errors = errors; out[action] = r; await ctx.close();
    }
    return out;
  },
  async focusClip(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp); await blur(page);
    await seedEnter(page, 'demo-synth-mix'); await blur(page);
    const r = { seed: await G(page) };
    r.tabs = await tabTo(page, SNAP);
    const pt = await page.evaluate(() => { for (const c of document.querySelectorAll('[data-clip-kind="audio"]')) { const cr = c.getBoundingClientRect(); const hdr = c.firstElementChild.getBoundingClientRect(); for (const fx of [0.5, 0.35, 0.65, 0.2, 0.8]) for (const fy of [0.6, 0.75, 0.5]) { const x = cr.left + cr.width * fx; const y = cr.top + cr.height * fy; if (x <= 0 || x >= innerWidth - 20 || y <= hdr.bottom + 1 || y >= innerHeight - 10) continue; const hit = document.elementFromPoint(x, y); if (hit && c.contains(hit) && !c.firstElementChild.contains(hit) && !hit.closest('button,input,[tabindex],[role=slider]')) return { x, y, clip: c.getAttribute('data-clip-id'), hit: hit.tagName + '.' + String(hit.className).slice(0, 60) }; } } return null; });
    r.point = pt;
    if (!pt) { r.info = 'no clip-body point found'; r.errors = errors; await ctx.close(); return r; }
    await startLog(page);
    await page.mouse.click(pt.x, pt.y, { button: 'right' }); await sleep(400);
    const m = page.getByTestId('arrangement-grid-menu');
    r.opened = (await m.count()) > 0;
    if (r.opened) { r.menu = await menuInfo(page, m); await page.screenshot({ path: path.join(outDir, `focus-clip-menu-${key_}.png`) }); }
    await page.keyboard.press('Escape'); await sleep(400);
    r.menuOpen = await m.count();
    r.final = await ringOf(page);
    r.log = await getLog(page);
    r.ok = r.opened && r.menuOpen === 0 && r.final.testid === SNAP;
    await page.screenshot({ path: path.join(outDir, `focus-clip-${key_}.png`) });
    r.errors = errors; await ctx.close();
    return r;
  },
  async reposition(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp); await blur(page);
    const r = { tabs: await tabTo(page, SNAP) };
    const pts = await emptyLanePoints(page);
    r.points = pts;
    await startLog(page);
    await page.mouse.click(pts[0].x, pts[0].y, { button: 'right' }); await sleep(400);
    r.firstBox = await page.getByTestId('arrangement-grid-menu').boundingBox();
    r.afterFirst = await activeDesc(page);
    const mb = r.firstBox;
    const far = await page.evaluate(([bx]) => { for (const body of document.querySelectorAll('[data-track-id] [data-grid-lines]')) { const r = body.getBoundingClientRect(); for (const fx of [0.15, 0.25, 0.35]) { const x = r.left + r.width * fx; const y = r.top + r.height / 2; if (x <= 0 || x >= bx - 30 || y <= 0 || y >= innerHeight - 10) continue; if (document.elementFromPoint(x, y) === body) return { x, y, track: body.closest('[data-track-id]').getAttribute('data-track-id') }; } } return null; }, [mb.x]);
    r.secondPoint = far;
    const p2 = far;
    await page.mouse.click(p2.x, p2.y, { button: 'right' }); await sleep(400);
    r.afterSecond = { menu: await page.getByTestId('arrangement-grid-menu').count(), box: await page.getByTestId('arrangement-grid-menu').boundingBox().catch(() => null), active: await activeDesc(page) };
    await page.screenshot({ path: path.join(outDir, `reposition-${key_}.png`) });
    await page.keyboard.press('Escape'); await sleep(400);
    r.menuOpen = await page.getByTestId('arrangement-grid-menu').count();
    r.final = await ringOf(page);
    r.log = await getLog(page);
    r.ok = r.menuOpen === 0 && r.final.testid === SNAP;
    r.errors = errors; await ctx.close();
    return r;
  },
  async marquee(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const r = {};
    const sel = () => page.evaluate(() => [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => ({ id: c.getAttribute('data-clip-id'), selected: c.className.includes('ring-2') })));
    { const pts0 = await emptyLanePoints(page); const pm = pts0.find((q) => q.track !== 'video') || pts0[0]; await page.mouse.click(pm.x, pm.y); await sleep(300); r.clearClick = pm; }
    r.before = await sel();
    const geo = await page.evaluate(() => { const c = document.querySelector('[data-clip-kind="audio"]'); const lane = c.parentElement.closest('[data-grid-lines]') || c.parentElement; const cr = c.getBoundingClientRect(); const lr = lane.getBoundingClientRect(); return { clip: { l: cr.left, r: cr.right, t: cr.top, b: cr.bottom }, lane: { l: lr.left, r: lr.right, t: lr.top, b: lr.bottom }, laneIsGrid: lane.hasAttribute('data-grid-lines') }; });
    r.geo = geo;
    const sx = Math.min(geo.clip.r + 60, innerW(vp) - 40); const sy = geo.lane.t + 3;
    r.startHit = await page.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); return h ? (h.getAttribute('data-testid') || h.tagName) + (h.hasAttribute('data-grid-lines') ? '[lane-body]' : '') : null; }, [sx, sy]);
    await page.mouse.move(sx, sy); await page.mouse.down();
    await page.mouse.move((sx + geo.clip.l) / 2, (geo.clip.t + geo.clip.b) / 2, { steps: 5 });
    await page.mouse.move(geo.clip.l + 10, geo.clip.b - 3, { steps: 5 });
    r.marqueeVisible = await page.getByTestId('arrangement-marquee').count();
    await page.screenshot({ path: path.join(outDir, `marquee-drag-${key_}.png`) });
    await page.mouse.up(); await sleep(300);
    r.after = await sel();
    r.status = (await G(page)).status;
    r.ok = r.marqueeVisible > 0 && r.after.some((c) => c.selected) && !r.before.some((c) => c.selected);
    r.errors = errors; await ctx.close();
    return r;
  },
  menuReg: OLD.menuReg,
  async faderInfo(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp); await blur(page);
    await addBtn(page, 'demo-stem-pulse');
    const r = {};
    await page.evaluate(() => document.body.focus());
    let found = null;
    for (let i = 1; i <= 150; i += 1) { await page.keyboard.press('Tab'); const a = await page.evaluate(() => { const e = document.activeElement; return e && e.tagName === 'INPUT' && e.type === 'range' && e.closest('[data-testid="arrangement-track-header"]') ? (e.getAttribute('aria-label') || 'range') : null; }); if (a) { found = { tabs: i, label: a }; break; } }
    r.fader = found;
    if (!found) { r.info = 'no track-header range reached'; await ctx.close(); return r; }
    const pts = await emptyLanePoints(page);
    await startLog(page);
    await page.mouse.click(pts[0].x, pts[0].y, { button: 'right' }); await sleep(400);
    r.opened = await page.getByTestId('arrangement-grid-menu').count();
    await page.keyboard.press('Escape'); await sleep(400);
    r.final = await activeDesc(page);
    r.finalLabel = await page.evaluate(() => document.activeElement.getAttribute('aria-label'));
    r.log = await getLog(page);
    r.errors = errors; await ctx.close();
    return r;
  },
  async spot(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp); await blur(page);
    const r = {};
    const m = await openMenu(page);
    r.menu = m ? await menuInfo(page, m) : null;
    await page.keyboard.press('Escape'); await sleep(300); await blur(page);
    await key(page, 'Digit4', 250); r.on = (await G(page)).status;
    await key(page, 'Digit4', 250); r.off = (await G(page)).status;
    r.ax = await axDesc(page);
    r.bad = await page.evaluate(() => document.body.innerHTML.match(/\((G 4|4)\)/g) || []);
    r.errors = errors; await ctx.close();
    return r;
  },
  budget: OLD.budget,
  smoke: OLD.smoke,
  auth: OLD.auth,
};
function innerW(vp) { return vp.width; }

// ---------- round 243 rows ----------
const isTrackFader = () => { const e = document.activeElement; return !!(e && e.tagName === 'INPUT' && e.type === 'range' && e.closest('[data-testid="arrangement-track-header"]')); };
async function tabUntil(page, pred, max = 170) {
  await page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); document.body.focus(); });
  for (let i = 1; i <= max; i += 1) { await page.keyboard.press('Tab'); if (await page.evaluate(pred)) return i; }
  return -1;
}
const fullActive = (page) => page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return { el: 'BODY' }; const cs = getComputedStyle(a); return { el: a.getAttribute('data-testid') || a.tagName, tag: a.tagName, type: a.getAttribute('type'), label: (a.getAttribute('aria-label') || '').slice(0, 90), focusVisible: a.matches(':focus-visible'), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineOffset: cs.outlineOffset, boxShadow: cs.boxShadow.slice(0, 80) }; });
const braceInfo = (page) => page.evaluate(() => { const b = document.querySelector('[data-testid="arrangement-loop-brace"]'); return b ? { left: b.style.left, width: b.style.width, label: b.getAttribute('aria-label'), enabled: b.getAttribute('data-loop-enabled') } : null; });
const clipsInfo = (page) => page.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((c) => ({ id: c.getAttribute('data-clip-id'), start: c.getAttribute('data-clip-start'), selected: String(c.className).includes('ring-2') })));
const markersInfo = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((m) => ({ id: m.getAttribute('data-marker-id'), time: m.getAttribute('data-marker-time') })));
const statusText = (page) => page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null);
const tempoInfo = (page) => page.evaluate(() => { const i = document.querySelector('[data-testid="arrangement-tempo-input"]'); const br = document.querySelector('[data-testid="arrangement-bars-ruler"]'); return { value: i?.value ?? null, bpm: br?.getAttribute('data-bpm') ?? null }; });

// brass pixel count on the 4px band around the active element, from a page screenshot (PNG decode via canvas in a blank page is heavy; use CDP screenshot clip + node PNG parse)
const zlib = require('node:zlib');
function decodePng(buf) {
  let off = 8; let w = 0; let h = 0; let ct = 0; const idat = [];
  while (off < buf.length) { const len = buf.readUInt32BE(off); const type = buf.toString('ascii', off + 4, off + 8); const data = buf.subarray(off + 8, off + 8 + len); if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; } else if (type === 'IDAT') idat.push(data); else if (type === 'IEND') break; off += 12 + len; }
  const bpp = ct === 6 ? 4 : 3; const raw = zlib.inflateSync(Buffer.concat(idat)); const stride = w * bpp; const out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y += 1) { const f = raw[y * (stride + 1)]; for (let x = 0; x < stride; x += 1) { const a = x >= bpp ? out[y * stride + x - bpp] : 0; const b = y > 0 ? out[(y - 1) * stride + x] : 0; const c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0; let v = raw[y * (stride + 1) + 1 + x]; if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) { const p = a + b - c; const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; } out[y * stride + x] = v & 255; } }
  return { w, h, bpp, px: out };
}
async function brassBand(page, file) {
  const box = await page.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const pad = 4; const clip = { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.w + 2 * pad, height: box.h + 2 * pad };
  const buf = await page.screenshot({ clip, path: file });
  const { w, h, bpp, px } = decodePng(buf);
  let brass = 0; let band = 0;
  for (let y = 0; y < h; y += 1) for (let x = 0; x < w; x += 1) { const o = (y * w + x) * bpp; const r = px[o]; const g = px[o + 1]; const b = px[o + 2]; const isBrass = r > 120 && g > 90 && r - b > 45 && r >= g && g > b; if (!isBrass) continue; brass += 1; const edge = x < pad + 4 || y < pad + 4 || x >= w - pad - 4 || y >= h - pad - 4; if (edge) band += 1; }
  return { box, brass, band };
}

const ORIGIN = {
  async fader(page) { await addBtn(page, 'demo-stem-pulse'); return { tabs: await tabUntil(page, isTrackFader) }; },
  async tempoBpm(page) { await addBtn(page, 'demo-stem-pulse'); return { tabs: await tabUntil(page, () => document.activeElement?.getAttribute('data-testid') === 'arrangement-tempo-input') }; },
  async tempo(page) { return { tabs: await tabUntil(page, () => document.activeElement?.getAttribute('data-testid') === 'arrangement-tempo-input') }; },
  async brace(page) {
    await addBtn(page, 'demo-stem-pulse');
    const bb = await page.locator('[data-clip-kind="audio"]').last().boundingBox();
    const y = bb.y + bb.height * 0.7;
    await page.mouse.move(bb.x + bb.width * 0.3, y); await page.mouse.down();
    await page.mouse.move(bb.x + bb.width * 0.4, y, { steps: 5 }); await page.mouse.move(bb.x + bb.width * 0.5, y, { steps: 5 }); await page.mouse.up(); await sleep(300);
    await page.keyboard.press('Control+l'); await sleep(500);
    return { tabs: await tabUntil(page, () => !!document.activeElement?.closest('[data-testid="arrangement-loop-brace"]')), braces: await page.getByTestId('arrangement-loop-brace').count() };
  },
  async markerFlag(page) { await page.evaluate(() => document.body.focus()); await key(page, 'KeyM', 500); await key(page, 'Enter', 500); return { tabs: 0 }; },
};

async function originCycle(browser, vp, key_, name, action) {
  const { ctx, page, errors } = await open(browser, vp);
  const r = { origin: name, action };
  Object.assign(r, await ORIGIN[name](page));
  r.before = await fullActive(page);
  r.beforeGrid = await G(page); r.beforeBrace = await braceInfo(page); r.beforeClips = await clipsInfo(page); r.beforeMarkers = await markersInfo(page); r.beforeTempo = await tempoInfo(page); r.beforeStatus = await statusText(page);
  const pts = await emptyLanePoints(page); r.point = pts[0];
  await startLog(page);
  await page.mouse.click(pts[0].x, pts[0].y, { button: 'right' }); await sleep(400);
  r.opened = await page.getByTestId('arrangement-grid-menu').count();
  r.inMenu = await activeDesc(page);
  if (action === 'escape') await page.keyboard.press('Escape'); else await page.getByTestId('arrangement-grid-menu').getByRole('menuitemradio', { name: action, exact: true }).click();
  await sleep(450);
  r.menuOpen = await page.getByTestId('arrangement-grid-menu').count();
  r.final = await fullActive(page);
  r.sameAsBefore = await page.evaluate(() => true) && r.final.el === r.before.el && r.final.label === r.before.label;
  r.afterGrid = await G(page); r.afterTempo = await tempoInfo(page); r.afterStatus = await statusText(page); r.afterMarkers = await markersInfo(page); r.afterBrace = await braceInfo(page); r.afterClips = await clipsInfo(page);
  r.log = await getLog(page);
  r.ring = r.final.el !== 'BODY' ? await brassBand(page, path.join(outDir, `ring-${name}-${action.replace(/\W/g, '')}-${key_}.png`)) : null;
  await page.screenshot({ path: path.join(outDir, `origin-${name}-${action.replace(/\W/g, '')}-${key_}.png`) });
  if (name === 'brace' && action === 'escape') { // C-BRACE-KEYS-243 (a)
    await key(page, 'ArrowRight', 400);
    r.keysA = { brace: await braceInfo(page), clips: await clipsInfo(page), active: await fullActive(page), status: await statusText(page) };
    r.keysA.loopMoved = r.keysA.brace?.left !== r.afterBrace?.left; r.keysA.clipsUnchanged = JSON.stringify(r.keysA.clips.map((c) => c.start)) === JSON.stringify(r.afterClips.map((c) => c.start));
  }
  if (name === 'markerFlag' && action === 'escape') { await key(page, 'ArrowRight', 400); r.markerArrow = { markers: await markersInfo(page), active: await fullActive(page), status: await statusText(page) }; }
  if (r.ring) { await page.evaluate(() => document.activeElement.blur()); await sleep(200); r.ringBlurredControl = await page.evaluate(() => null); }
  r.errors = errors; await ctx.close();
  r.ok = r.opened > 0 && r.menuOpen === 0 && r.final.el !== 'BODY' && r.sameAsBefore && (action !== 'escape' || r.final.focusVisible === true) && (action === 'escape' ? true : r.afterGrid.seconds === '0.5');
  return r;
}

const ROWS = {
  async origins(browser, vp, key_) {
    const out = {};
    for (const [n, acts] of [['fader', ['escape', '0.5 s']], ['tempo', ['escape']], ['tempoBpm', ['escape']], ['brace', ['escape']], ['markerFlag', ['escape']]]) for (const a of acts) {
      try { out[`${n}/${a}`] = await originCycle(browser, vp, key_, n, a); } catch (e) { out[`${n}/${a}`] = { error: String(e).slice(0, 600) }; }
      console.log(' ', n, a, out[`${n}/${a}`].final?.el ?? out[`${n}/${a}`].error);
    }
    return out;
  },
  async braceLeft(browser, vp, key_) { // C-BRACE-KEYS-243 (b)
    const { ctx, page, errors } = await open(browser, vp);
    const r = await ORIGIN.brace(page);
    r.before = await fullActive(page); r.brace0 = await braceInfo(page); r.clips0 = await clipsInfo(page);
    const hdr = await page.evaluate(() => { const c = document.querySelector('[data-clip-kind="audio"]'); const h = c.firstElementChild.getBoundingClientRect(); return { x: h.left + Math.min(40, h.width / 3), y: h.top + h.height / 2, hit: (() => { const e = document.elementFromPoint(h.left + Math.min(40, h.width / 3), h.top + h.height / 2); return e ? e.tagName + '.' + String(e.className).slice(0, 50) : null; })() }; });
    r.hdr = hdr;
    await page.mouse.click(hdr.x, hdr.y); await sleep(400);
    r.afterClick = { active: await fullActive(page), clips: await clipsInfo(page), brace: await braceInfo(page) };
    await key(page, 'ArrowRight', 400);
    r.afterArrow = { active: await fullActive(page), clips: await clipsInfo(page), brace: await braceInfo(page), status: await statusText(page) };
    r.ok = r.before.el === 'arrangement-loop-brace' && r.afterClick.active.el !== 'arrangement-loop-brace' && r.afterClick.clips.some((c) => c.selected) && r.afterArrow.clips[0].start !== r.afterClick.clips[0].start && r.afterArrow.brace.left === r.afterClick.brace.left;
    await page.screenshot({ path: path.join(outDir, `brace-left-${key_}.png`) });
    r.errors = errors; await ctx.close(); return r;
  },
  focus: ROWS242.focus,
  async focusClipFader(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp); await blur(page);
    await seedEnter(page, 'demo-synth-mix'); await blur(page);
    const r = { tabs: await tabUntil(page, isTrackFader) };
    r.before = await fullActive(page);
    const pt = await page.evaluate(() => { for (const c of document.querySelectorAll('[data-clip-kind="audio"]')) { const cr = c.getBoundingClientRect(); const hdr = c.firstElementChild.getBoundingClientRect(); for (const fx of [0.5, 0.35, 0.65, 0.2, 0.8]) for (const fy of [0.6, 0.75, 0.5]) { const x = cr.left + cr.width * fx; const y = cr.top + cr.height * fy; if (x <= 0 || x >= innerWidth - 20 || y <= hdr.bottom + 1 || y >= innerHeight - 10) continue; const hit = document.elementFromPoint(x, y); if (hit && c.contains(hit) && !c.firstElementChild.contains(hit) && !hit.closest('button,input,[tabindex],[role=slider]')) return { x, y, clip: c.getAttribute('data-clip-id') }; } } return null; });
    r.point = pt;
    await startLog(page);
    await page.mouse.click(pt.x, pt.y, { button: 'right' }); await sleep(400);
    r.opened = await page.getByTestId('arrangement-grid-menu').count(); r.inMenu = await activeDesc(page);
    await key(page, 'Escape', 400);
    r.menuOpen = await page.getByTestId('arrangement-grid-menu').count();
    r.final = await fullActive(page); r.log = await getLog(page);
    r.ok = r.opened > 0 && r.menuOpen === 0 && r.final.el === r.before.el && r.final.label === r.before.label && r.final.focusVisible;
    await page.screenshot({ path: path.join(outDir, `focus-clip-fader-${key_}.png`) });
    r.errors = errors; await ctx.close(); return r;
  },
  async repositionFader(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const r = { tabs: await tabUntil(page, isTrackFader) }; r.before = await fullActive(page);
    const pts = await emptyLanePoints(page); r.points = pts;
    await startLog(page);
    await page.mouse.click(pts[0].x, pts[0].y, { button: 'right' }); await sleep(400);
    const mb = await page.getByTestId('arrangement-grid-menu').boundingBox(); r.firstBox = mb;
    const far = await page.evaluate(([bx]) => { for (const body of document.querySelectorAll('[data-track-id] [data-grid-lines]')) { const q = body.getBoundingClientRect(); for (const fx of [0.15, 0.25, 0.35]) { const x = q.left + q.width * fx; const y = q.top + q.height / 2; if (x <= 0 || x >= bx - 30 || y <= 0 || y >= innerHeight - 10) continue; if (document.elementFromPoint(x, y) === body) return { x, y }; } } return null; }, [mb.x]);
    r.second = far;
    await page.mouse.click(far.x, far.y, { button: 'right' }); await sleep(400);
    r.afterSecond = { menu: await page.getByTestId('arrangement-grid-menu').count(), box: await page.getByTestId('arrangement-grid-menu').boundingBox().catch(() => null), active: await activeDesc(page) };
    await key(page, 'Escape', 400);
    r.menuOpen = await page.getByTestId('arrangement-grid-menu').count(); r.final = await fullActive(page); r.log = await getLog(page);
    r.ok = r.menuOpen === 0 && r.final.el === r.before.el && r.final.label === r.before.label;
    await page.screenshot({ path: path.join(outDir, `reposition-fader-${key_}.png`) });
    r.errors = errors; await ctx.close(); return r;
  },
  reposition: ROWS242.reposition,
  menuReg: ROWS242.menuReg,
  marquee: ROWS242.marquee,
  async headerInfo(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const r = { tabs: await tabUntil(page, isTrackFader) }; r.before = await fullActive(page);
    const hdr = page.getByTestId('arrangement-track-header').first();
    const hb = await hdr.boundingBox(); r.hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + ':' + (e.getAttribute('data-testid') || '') : null; }, [hb.x + 20, hb.y + 10]);
    await page.evaluate(() => { window.__ctx = null; window.addEventListener('contextmenu', (e) => { setTimeout(() => { window.__ctx = e.defaultPrevented; }, 0); }, { once: true }); });
    await startLog(page);
    await page.mouse.click(hb.x + 20, hb.y + 10, { button: 'right' }); await sleep(400);
    r.gridMenu = await page.getByTestId('arrangement-grid-menu').count(); r.defaultPrevented = await page.evaluate(() => window.__ctx);
    r.afterRight = await fullActive(page);
    await key(page, 'Escape', 300); r.afterEsc = await fullActive(page); r.log = await getLog(page);
    // stale-ref probe: then a lane right-click with BODY focused → menu → Escape: where does focus go?
    await page.evaluate(() => document.body.focus());
    const pts = await emptyLanePoints(page);
    await page.mouse.click(pts[0].x, pts[0].y, { button: 'right' }); await sleep(400);
    r.stale = { opened: await page.getByTestId('arrangement-grid-menu').count() };
    await key(page, 'Escape', 400); r.stale.final = await fullActive(page);
    r.errors = errors; await ctx.close(); return r;
  },
  async headerPlain(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const r = { tabs: await tabUntil(page, isTrackFader) }; r.before = await fullActive(page);
    r.pt = await page.evaluate(() => { for (const h of document.querySelectorAll('[data-testid="arrangement-track-header"]')) { const b = h.getBoundingClientRect(); for (let y = b.top + 3; y < b.bottom - 3; y += 4) for (let x = b.left + 3; x < b.right - 3; x += 6) { const e = document.elementFromPoint(x, y); if (e && h.contains(e) && !e.closest('button,input,select,a,[tabindex]')) return { x, y, hit: e.tagName + '.' + String(e.className).slice(0, 40), inScroller: !!h.closest('[data-testid="arrangement-timeline-scroller"]') }; } } return null; });
    await page.evaluate(() => { window.__ctx = null; window.addEventListener('contextmenu', (e) => { setTimeout(() => { window.__ctx = e.defaultPrevented; }, 0); }, { once: true }); });
    await startLog(page);
    await page.mouse.click(r.pt.x, r.pt.y, { button: 'right' }); await sleep(400);
    r.gridMenu = await page.getByTestId('arrangement-grid-menu').count(); r.defaultPrevented = await page.evaluate(() => window.__ctx);
    r.afterRight = await fullActive(page); r.log = await getLog(page);
    const pts = await emptyLanePoints(page);
    await page.mouse.click(pts[0].x, pts[0].y, { button: 'right' }); await sleep(400);
    r.next = { opened: await page.getByTestId('arrangement-grid-menu').count() };
    await key(page, 'Escape', 400); r.next.final = await fullActive(page);
    r.errors = errors; await ctx.close(); return r;
  },
  async markerEditor(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    await page.evaluate(() => document.body.focus()); await key(page, 'KeyM', 500);
    const r = { before: await fullActive(page), markersBefore: (await markersInfo(page)).length };
    const pts = await emptyLanePoints(page);
    await page.mouse.click(pts[0].x, pts[0].y, { button: 'right' }); await sleep(400);
    r.opened = await page.getByTestId('arrangement-grid-menu').count();
    await key(page, 'Escape', 400);
    r.final = await fullActive(page); r.markersAfter = (await markersInfo(page)).length;
    await page.screenshot({ path: path.join(outDir, `marker-editor-${key_}.png`) });
    r.errors = errors; await ctx.close(); return r;
  },
  budget: OLD.budget,
  smoke: OLD.smoke,
  auth: OLD.auth,
};

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  R.chromium = browser.version();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`;
    for (const [name, fn] of Object.entries(ROWS)) {
      if (filter && !filter.test(name)) continue;
      const t0 = Date.now();
      try { R.rows[`${name}@${k}`] = await fn(browser, vp, k); } catch (e) { R.rows[`${name}@${k}`] = { error: String(e).slice(0, 800) }; }
      R.rows[`${name}@${k}`].ms = Date.now() - t0;
      save();
      console.log(name, k, 'done', Date.now() - t0);
    }
  }
  await browser.close();
  R.finished = new Date().toISOString();
  save();
})();
