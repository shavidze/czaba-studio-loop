// C round 258: grid/tempo/strip regression rows. Helpers = c-round-241/c241.cjs l.1-206 verbatim (resultFile renamed); rows new. usage: node grid258.cjs <outDir> [rowRegex]
// C round 241: independent browser verification of SABA-B-11b stage 2a (copied helpers from c240.cjs).
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
const resultFile = path.join(outDir, 'grid258.json');
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


// ---------- C round 258 rows ----------
const ST = (page) => page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const play = q('button[aria-label="Play"]');
  return { ph: Number(q('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow')), m: q('[data-insert-marker]')?.getAttribute('data-insert-marker') ?? null, playing: play?.dataset.playing === 'true', status: q('[data-testid="arrangement-status"]')?.textContent ?? null, t: performance.now() };
});
const barsBox = (page) => page.locator('[data-testid="arrangement-bars-ruler"]').boundingBox();
const rulerBox = (page) => page.locator('[data-testid="arrangement-ruler"]').boundingBox();
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const LEAD = 0.05;
async function playFrom(page, x, y, expStart, label) {
  const t0 = Date.now(); await page.mouse.click(x, y); await sleep(350); const s = await ST(page); const el = (Date.now() - t0) / 1000;
  return { label, s, elapsed: +el.toFixed(3), ok: s.playing && s.ph >= expStart - 0.01 && s.ph <= expStart + el + LEAD + 0.05 };
}
const ROWS258 = {
  async tempo(browser, vp, k) {
    const r = {};
    { const { ctx, page, errors } = await open(browser, vp); await blur(page); r.mount = await G(page);
      await addBtn(page, 'demo-stem-pulse'); r.pulse = await G(page);
      r.barsMarks = await page.locator('[data-testid="arrangement-bars-mark"]').count();
      r.tempoInput = await page.inputValue('[data-testid="arrangement-tempo-input"]');
      await page.screenshot({ path: path.join(outDir, `tempo-pulse-${k}.png`) }); r.errors1 = errors; await ctx.close(); }
    { const { ctx, page, errors } = await open(browser, vp); await blur(page);
      await addBtn(page, 'demo-soft-impact'); r.impact = await G(page);
      r.impactTempo = await page.inputValue('[data-testid="arrangement-tempo-input"]');
      r.impact120 = await page.evaluate(() => /120\s*BPM/.test(document.body.innerText) || [...document.querySelectorAll('[title],[aria-label]')].some((e) => /120\s*BPM/.test((e.getAttribute('title') || '') + (e.getAttribute('aria-label') || ''))));
      r.errors2 = errors; await ctx.close(); }
    r.checks = { pulseBpm: r.pulse.bpm === '120' && r.tempoInput === '120', pulseSnap: r.pulse.snap === 'on', bars: r.barsMarks > 0, pulseGrid: r.pulse.division === '1/2' && r.pulse.mode === 'adaptive', impactNoTempo: !r.impact.bpm && r.impactTempo === '', impactGrid: r.impact.division === '1' && r.impact.snap === 'off', no120: !r.impact120, errors: r.errors1.length + r.errors2.length === 0 };
    r.pass = Object.values(r.checks).every(Boolean); return r;
  },
  async strip(browser, vp, k) {
    const r = {};
    const { ctx, page, errors } = await open(browser, vp); await blur(page);
    await addBtn(page, 'demo-stem-pulse'); await page.mouse.click(5, 5); await sleep(200);
    const b = await barsBox(page); const p = 40; r.grid = await G(page);
    r.stripY = b.y + 4; r.lowerY = b.y + 15; r.hitStrip = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('[data-testid]')?.getAttribute('data-testid'), [b.x + 4.1 * p, b.y + 4]);
    r.a = await playFrom(page, b.x + 4.1 * p, b.y + 4, 4.0, 'strip4.1');
    await key(page, 'Space', 400); r.aStop = await ST(page);
    // lower zone stopped at 6.3
    await page.mouse.click(b.x + 6.3 * p, b.y + 15); await sleep(400); r.b = await ST(page);
    // seconds ruler click unchanged (stopped): marker + playhead
    const rb = await rulerBox(page); await page.mouse.click(rb.x + 2 * p, rb.y + rb.height / 2); await sleep(400); r.c = await ST(page);
    // strip double-click at 3 -> playing from 3, no Fit status
    await page.mouse.dblclick(b.x + 3 * p, b.y + 4); await sleep(350); r.d = await ST(page);
    await key(page, 'Space', 400);
    // lower zone double-click -> Fit
    await page.mouse.dblclick(b.x + 9 * p, b.y + 15); await sleep(500); r.e = await ST(page);
    await key(page, 'KeyX', 400);
    // strip click at 15.95 -> playPastEnd status, not playing
    await page.evaluate(() => { document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft = 0; }); await sleep(200);
    const b2 = await barsBox(page); const scl = await page.evaluate(() => document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft);
    const x1595 = b2.x + 15.95 * p; r.x1595 = x1595; r.vw = vp.width;
    if (x1595 < vp.width - 2) { await page.mouse.click(x1595, b2.y + 4); await sleep(500); r.f = await ST(page); }
    else { await page.evaluate(() => { document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft = 300; }); await sleep(300); const b3 = await barsBox(page); await page.mouse.click(b3.x + 15.95 * p, b3.y + 4); await sleep(500); r.f = await ST(page); }
    await page.screenshot({ path: path.join(outDir, `strip-${k}.png`) });
    r.errors = errors; await ctx.close();
    // no tempo: bars ruler inert
    { const o = await open(browser, vp); await blur(o.page); await addBtn(o.page, 'demo-soft-impact'); await o.page.mouse.click(5, 5);
      const bb = await barsBox(o.page); r.nt0 = await ST(o.page); r.ntStrips = await o.page.locator('[data-testid="arrangement-bars-scrub-strip"]').count();
      await o.page.mouse.click(bb.x + 200, bb.y + 4); await sleep(400); r.nt1 = await ST(o.page);
      await o.page.mouse.click(bb.x + 240, bb.y + 15); await sleep(400); r.nt2 = await ST(o.page); r.errors2 = o.errors; await o.ctx.close(); }
    r.checks = {
      stripPlays: r.a.ok,
      lowerSetsMarker: !r.b.playing && r.b.m !== null && near(Number(r.b.m), Number(r.b.ph), 0.001),
      secondsRuler: !r.c.playing && r.c.m === '2.000' && near(r.c.ph, 2, 0.001),
      dblStrip: r.d.playing && r.d.ph >= 2.99 && r.d.ph <= 3.0 + 0.5 && !/^Fit/.test(r.d.status || ''),
      dblLowerFit: /^Fit/.test(r.e.status || ''),
      pastEnd: !r.f.playing && /past the end/.test(r.f.status || ''),
      noTempoInert: r.ntStrips === 0 && r.nt1.ph === r.nt0.ph && r.nt2.ph === r.nt0.ph && r.nt1.m === r.nt0.m && r.nt2.m === r.nt0.m && !r.nt1.playing,
      errors: errors.length + r.errors2.length === 0,
    };
    r.lowerMarker = r.b.m; r.pass = Object.values(r.checks).every(Boolean); return r;
  },
  async adapt(browser, vp, k) {
    const r = {};
    { const { ctx, page, errors } = await open(browser, vp); await blur(page); r.mount = await G(page); const s0 = r.mount.status;
      for (let i = 0; i < 4; i += 1) await key(page, 'Equal', 200);
      r.zoom4 = await G(page); r.zoom4inv = inv(r.zoom4); r.zoomStatusSame = r.zoom4.status === s0;
      await key(page, 'Digit5', 300); r.fixed = await G(page); r.errors1 = errors; await ctx.close(); }
    { const { ctx, page, errors } = await open(browser, vp); await blur(page); await key(page, 'Digit1', 300); r.one = await G(page);
      await seedEnter(page, 'demo-synth-mix'); await blur(page); r.oneSeed = await G(page); r.errors2 = errors; await ctx.close(); }
    r.checks = {
      mount: r.mount.mode === 'adaptive' && r.mount.division === '1',
      zoom4: r.zoom4.division === '0.25' && r.zoom4inv.period !== null && r.zoom4inv.period >= 24 - 0.5,
      zoomNoStatus: r.zoomStatusSame,
      fixed: r.fixed.mode === 'fixed' && /^Fixed grid — .+ at every zoom \(5\)$/.test(r.fixed.status || ''),
      one: r.one.division === '0.5' && r.one.status === 'Grid: 0.5 s (Snap off)',
      hand: r.oneSeed.mode === 'adaptive' && r.oneSeed.division === '0.5' && /Snap on — grid 0\.5 s \(G\)/.test(r.oneSeed.status || ''),
      errors: r.errors1.length + r.errors2.length === 0,
    };
    r.pass = Object.values(r.checks).every(Boolean); return r;
  },
  async hiddenSnap(browser, vp, k) {
    const r = {};
    const { ctx, page, errors } = await open(browser, vp); await blur(page);
    await key(page, 'KeyG', 250);
    const m = await openMenu(page); await m.getByRole('menuitemradio', { name: '0.1 s', exact: true }).click(); await sleep(300);
    r.g40 = await G(page);
    const rb = await rulerBox(page); const t = 2.137;
    await page.mouse.click(rb.x + t * 40, rb.y + rb.height / 2); await sleep(400); r.c40 = await ST(page);
    r.paused40 = await page.evaluate(() => [...document.querySelectorAll('[data-snap-paused]')].map((e) => e.getAttribute('data-snap-paused')));
    await key(page, 'Equal', 300); await key(page, 'Equal', 300); // 40 -> 62.5 px/s
    r.g60 = await G(page); r.pps60 = await page.evaluate(() => document.querySelector('[data-testid="arrangement-zoom-readout"]')?.textContent);
    const pps = parseFloat(r.pps60);
    const rb2 = await rulerBox(page); await page.mouse.click(rb2.x + t * pps, rb2.y + rb2.height / 2); await sleep(400); r.c60 = await ST(page);
    r.paused60 = await page.evaluate(() => [...document.querySelectorAll('[data-snap-paused]')].map((e) => e.getAttribute('data-snap-paused')));
    r.errors = errors; await ctx.close();
    // SA-28 record only: adaptive `3` on 1/4 at 120 BPM and 4 px/s
    { const o = await open(browser, vp); await blur(o.page); await addBtn(o.page, 'demo-stem-pulse'); await o.page.mouse.click(5, 5);
      for (let i = 0; i < 20; i += 1) { const z = await o.page.evaluate(() => parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]')?.textContent)); if (z <= 4.1) break; await key(o.page, 'Minus', 150); }
      r.sa28zoom = await o.page.evaluate(() => document.querySelector('[data-testid="arrangement-zoom-readout"]')?.textContent);
      r.sa28before = await G(o.page); await key(o.page, 'Digit3', 300); r.sa28after = await G(o.page); await o.ctx.close(); }
    r.checks = {
      fixed01: r.g40.division === '0.1' && r.g40.mode === 'fixed' && r.g40.snap === 'on',
      freeAt40: r.c40.m !== null && Math.abs(Number(r.c40.m) - t) < 0.03 && r.paused40.includes('true'),
      snapsAt60: r.c60.m !== null && Math.abs(Number(r.c60.m) / 0.1 - Math.round(Number(r.c60.m) / 0.1)) < 1e-6 && !r.paused60.includes('true'),
      errors: errors.length === 0,
    };
    r.pass = Object.values(r.checks).every(Boolean); return r;
  },
  async focus242(browser, vp, k) {
    const r = {}; const { ctx, page, errors } = await open(browser, vp); await blur(page);
    r.tabs = await tabTo(page, 'arrangement-snap-toggle');
    const m = await openMenu(page); r.opened = !!m; await key(page, 'Escape', 400);
    r.active = await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { testid: a.getAttribute('data-testid'), tag: a.tagName, fv: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth}` }; });
    // BPM menu fits (seeded): the grid menu with the musical family
    await seedEnter(page, 'demo-synth-mix'); await blur(page);
    const m2 = await openMenu(page); r.bpmMenu = m2 ? await menuInfo(page, m2) : null; if (m2) { await page.screenshot({ path: path.join(outDir, `bpm-menu-${k}.png`) }); await key(page, 'Escape'); }
    r.errors = errors; await ctx.close();
    r.checks = { focusBack: r.opened && r.active.testid === 'arrangement-snap-toggle' && r.active.fv && /solid/.test(r.active.outline), bpmMenuFits: !!r.bpmMenu && r.bpmMenu.fits === true, errors: errors.length === 0 };
    r.pass = Object.values(r.checks).every(Boolean); return r;
  },
};
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  R.chromium = browser.version();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`;
    for (const [name, fn] of Object.entries(ROWS258)) {
      if (filter && !filter.test(name)) continue;
      const t0 = Date.now();
      try { R.rows[`${name}@${k}`] = await fn(browser, vp, k); } catch (e) { R.rows[`${name}@${k}`] = { error: String(e).slice(0, 800) }; }
      R.rows[`${name}@${k}`].ms = Date.now() - t0; save();
      const x = R.rows[`${name}@${k}`];
      console.log(`${name}@${k}`, 'pass=', x.pass, JSON.stringify(x.checks || {}), x.error ? x.error.slice(0, 300) : '');
    }
  }
  await browser.close(); R.finished = new Date().toISOString(); save();
})();
