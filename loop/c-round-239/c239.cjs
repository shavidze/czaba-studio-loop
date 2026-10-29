// C round 239: independent browser verification of SABA-B-11b stage 1 (adaptive grid).
// usage: node c239.cjs <outDir> [rowFilter]
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = 'http://127.0.0.1:5173';
const HEAD_BASE = 'http://127.0.0.1:5174';
const outDir = process.argv[2];
const filter = process.argv[3] ? new RegExp(process.argv[3]) : null;
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, 'c239.json');
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

const ROWS = {
  async adaptSec(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    await blur(page);
    const steps = [];
    const push = async (step) => { const g = await G(page); steps.push({ step, ...g, inv: inv(g) }); };
    await push('mount');
    await page.screenshot({ path: path.join(outDir, `shot-mount-${key_}.png`) });
    for (let i = 1; i <= 6; i += 1) { await key(page, 'Equal'); await push(`=${i}`); if (i === 4) await page.screenshot({ path: path.join(outDir, `shot-zoom4-adaptive-${key_}.png`) }); }
    for (let i = 1; i <= 10; i += 1) { await key(page, 'Minus'); await push(`-${i}`); }
    const r = { steps, errors };
    await ctx.close();
    return r;
  },
  async mode(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    await blur(page);
    const steps = [];
    const push = async (step) => { const g = await G(page); steps.push({ step, ...g, inv: inv(g) }); };
    await push('mount');
    await key(page, 'Digit5'); await push('5');
    await page.screenshot({ path: path.join(outDir, `shot-fixed-${key_}.png`) });
    for (let i = 1; i <= 3; i += 1) { await key(page, 'Equal'); await push(`=${i} fixed`); }
    await key(page, 'Digit5'); await push('5 again');
    for (let i = 1; i <= 3; i += 1) { await key(page, 'Minus'); await push(`-${i} adaptive`); }
    const sel = page.locator('[data-testid="arrangement-grid-division"]');
    await sel.hover(); await sleep(1200);
    await page.screenshot({ path: path.join(outDir, `shot-select-hover-${key_}.png`) });
    await sel.selectOption('0.1'); await sleep(300); await blur(page);
    await push('select 0.1');
    for (let i = 1; i <= 3; i += 1) { await key(page, 'Minus'); await push(`-${i} after select`); }
    const r = { steps, errors };
    await ctx.close();
    return r;
  },
  async density(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    await blur(page);
    const steps = [];
    const push = async (step) => { const g = await G(page); steps.push({ step, ...g, inv: inv(g) }); };
    await push('mount');
    for (let i = 1; i <= 3; i += 1) { await key(page, 'Digit1'); await push(`1 x${i}`); }
    for (let i = 1; i <= 5; i += 1) { await key(page, 'Digit2'); await push(`2 x${i}`); }
    // reviewer gap probe: mirror case (wide density at a widest end, then zoom in, then 1)
    for (let i = 1; i <= 12; i += 1) { await key(page, 'Minus', 120); }
    await push('-12');
    for (let i = 1; i <= 8; i += 1) { await key(page, 'Equal', 120); }
    await push('=8');
    await key(page, 'Digit1'); await push('1 after zoom');
    const r = { steps, errors };
    await ctx.close();
    return r;
  },
  async musical(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    const steps = [];
    const push = async (step) => { const g = await G(page); steps.push({ step, ...g, inv: inv(g) }); };
    await push('mount');
    await seedEnter(page, 'demo-synth-mix');
    await push('seed');
    await blur(page);
    for (let i = 1; i <= 5; i += 1) { await key(page, 'Equal'); await push(`=${i}`); }
    await key(page, 'Digit3'); await push('3');
    for (let i = 1; i <= 3; i += 1) { await key(page, 'Minus'); await push(`-${i} triplet`); }
    await key(page, 'Digit3'); await push('3 again');
    await key(page, 'Digit5'); await push('5 fixed');
    await key(page, 'Digit5'); await push('5 adaptive');
    await page.screenshot({ path: path.join(outDir, `shot-musical-${key_}.png`) });
    const r = { steps, errors };
    await ctx.close();
    return r;
  },
  async keys(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    const r = {};
    const mode = async () => (await G(page)).mode;
    // library search
    const search = page.getByLabel('Search the library');
    await search.click(); let m0 = await mode(); await key(page, 'Digit5');
    r.search = { value: await search.inputValue(), modeSame: (await mode()) === m0 };
    await search.fill(''); await blur(page);
    // marker name editor
    await key(page, 'KeyM', 400);
    const mi = page.locator('[data-testid="arrangement-marker-name-input"]');
    r.markerEditor = { open: await mi.count() };
    if (await mi.count()) { m0 = await mode(); await mi.focus(); await key(page, 'Digit5'); r.markerEditor.value = await mi.inputValue(); r.markerEditor.modeSame = (await mode()) === m0; await key(page, 'Escape', 300); }
    await blur(page);
    // BPM field
    const t = page.locator('[data-testid="arrangement-tempo-input"]');
    r.bpm = { present: await t.count() };
    if (await t.count()) { await t.click(); await t.fill(''); m0 = await mode(); await key(page, 'Digit5'); r.bpm.value = await t.inputValue(); r.bpm.modeSame = (await mode()) === m0; await key(page, 'Escape', 300); }
    await blur(page);
    // Export open
    await page.getByRole('button', { name: 'Export', exact: true }).first().click();
    const dlg = page.getByRole('dialog'); await dlg.waitFor({ timeout: 10000 });
    m0 = await mode(); const g0 = await G(page);
    await key(page, 'Digit5');
    const g1 = await G(page);
    r.exportOpen = { modeSame: g1.mode === m0, divisionSame: g1.division === g0.division, statusSame: g1.status === g0.status, dialogOpen: await dlg.isVisible() };
    await key(page, 'Escape', 400); await blur(page);
    // focused select at the load zoom
    const sel = page.locator('[data-testid="arrangement-grid-division"]');
    await sel.focus(); m0 = await mode(); const v0 = await sel.inputValue();
    await key(page, 'Digit5');
    r.select = { before: m0, after: await mode(), valueBefore: v0, valueAfter: await sel.inputValue(), focus: await page.evaluate(() => document.activeElement?.getAttribute('data-testid')), status: (await G(page)).status };
    await key(page, 'Digit5'); r.select.after2 = await mode();
    await blur(page);
    // Ctrl+5
    await page.evaluate(() => { window.__keys = []; });
    m0 = await mode();
    await page.keyboard.press('Control+Digit5'); await sleep(300);
    r.ctrl5 = { modeSame: (await mode()) === m0, events: await page.evaluate(() => window.__keys.filter((k) => k.code === 'Digit5')) };
    // held 5
    await page.evaluate(() => { window.__keys = []; });
    const mc0 = (await G(page)).modeChanges; m0 = await mode();
    await page.keyboard.down('Digit5'); await sleep(60);
    for (let i = 0; i < 4; i += 1) { await page.keyboard.down('Digit5'); await sleep(60); }
    await page.keyboard.up('Digit5'); await sleep(300);
    r.held = { modeChanges: (await G(page)).modeChanges - mc0, modeFlipped: (await mode()) !== m0, events: await page.evaluate(() => window.__keys.filter((k) => k.code === 'Digit5')) };
    // shortcut sheet: ? opens, row present, search finds it, 5 typed into sheet search
    await blur(page);
    await page.keyboard.press('Shift+Slash'); await sleep(500);
    const sheet = page.getByRole('dialog');
    r.sheet = { open: await sheet.count() };
    if (await sheet.count()) {
      const txt = await sheet.innerText();
      r.sheet.hasRow = /Adaptive \/ fixed grid/.test(txt);
      const groups = await sheet.evaluate((d) => [...d.querySelectorAll('section')].map((s) => s.innerText.replace(/\s+/g, ' ').slice(0, 600)));
      r.sheet.gridGroup = groups.find((s) => /Adaptive \/ fixed grid/.test(s)) || null;
      const ss = page.getByLabel('Search shortcuts');
      m0 = await mode();
      await ss.click(); await key(page, 'Digit5');
      r.sheet.search5 = { value: await ss.inputValue(), modeSame: (await mode()) === m0 };
      await ss.fill('adaptive'); await sleep(300);
      r.sheet.searchAdaptive = (await sheet.innerText()).replace(/\s+/g, ' ').slice(0, 500);
      await page.screenshot({ path: path.join(outDir, `shot-sheet-adaptive-${key_}.png`) });
      await key(page, 'Escape', 400);
    }
    r.errors = errors;
    await ctx.close();
    return r;
  },
  async snap(browser, vp, key_) {
    const { ctx, page, errors } = await open(browser, vp);
    const r = { phases: [] }; const window_dbg = []; r.dbg = window_dbg;
    await addBtn(page, 'demo-stem-pulse');
    let g = await G(page);
    if (g.snap !== 'on') { await key(page, 'KeyG'); g = await G(page); }
    r.snapState = g.snap; r.after = { division: g.division, mode: g.mode, bpm: g.bpm };
    for (const phase of ['load', 'zoom4']) {
      if (phase === 'zoom4') { for (let i = 0; i < 4; i += 1) await key(page, 'Equal', 150); }
      g = await G(page);
      const grid = Number(g.seconds);
      const p = { phase, division: g.division, gridSeconds: grid, mode: g.mode };
      const clip = page.locator('[data-clip-kind="audio"]').first();
      await clip.scrollIntoViewIfNeeded();
      const s0 = (await clipInfo(page))[0].start;
      const pps = inv(g).rulerPps;
      p.pps = pps;
      const drag = async (dxSec, alt) => {
        const b = await clip.boundingBox();
        const scb = await page.locator('[data-testid="arrangement-timeline-scroller"]').boundingBox();
        const hb = await page.locator('[data-testid="arrangement-track-header"]').first().boundingBox();
        const x = Math.max(b.x, hb.x + hb.width) + 40; const y = b.y + 6;
        window_dbg.push(await page.evaluate(([px, py]) => { const e = document.elementFromPoint(px, py); return { x: px, y: py, tag: e && e.tagName, tid: e && (e.closest('[data-testid]') || {}).getAttribute && e.closest('[data-testid]').getAttribute('data-testid'), cls: e && String(e.className).slice(0, 80) }; }, [x, y]));
        window_dbg.push({ clip: b, scroller: scb });
        if (alt) await page.keyboard.down('Alt');
        await page.mouse.move(x, y); await page.mouse.down();
        for (let i = 1; i <= 8; i += 1) { await page.mouse.move(x + (dxSec * pps * i) / 8, y); await sleep(20); }
        await page.mouse.up();
        if (alt) await page.keyboard.up('Alt');
        await sleep(400);
        return (await clipInfo(page))[0].start;
      };
      const dx = grid * 1.37;
      r.phases.push(p);
      p.dragStart = s0; p.dragTo = await drag(dx, false); p.dragOnGrid = isMult(p.dragTo, grid); p.dragMoved = p.dragTo !== s0;
      p.statusAfterDrag = (await G(page)).status;
      if (!p.dragMoved) { p.error = 'drag did not move'; await page.screenshot({ path: path.join(outDir, `snap-nomove-${key_}.png`) }); continue; }
      await key(page, 'Control+KeyZ', 400); p.undo = (await clipInfo(page))[0]?.start; p.undoRestored = Math.abs(p.undo - s0) < 1e-3;
      p.altTo = await drag(dx, true); p.altOffGrid = !isMult(p.altTo, grid);
      if (p.altTo !== s0) await key(page, 'Control+KeyZ', 400);
      // nudge
      const b = await clip.boundingBox();
      const scb2 = await page.locator('[data-testid="arrangement-timeline-scroller"]').boundingBox();
      const hb2 = await page.locator('[data-testid="arrangement-track-header"]').first().boundingBox();
      await page.mouse.click(Math.max(b.x, hb2.x + hb2.width) + 40, b.y + 6); await sleep(300);
      const n0 = (await clipInfo(page))[0].start;
      await key(page, 'ArrowRight', 400);
      p.nudge = { from: n0, to: (await clipInfo(page))[0].start };
      p.nudge.onGrid = isMult(p.nudge.to, grid); p.nudge.moved = p.nudge.to !== n0;
      if (p.nudge.moved) await key(page, 'Control+KeyZ', 400);
      // ruler click
      const rb = await page.locator('[data-testid="arrangement-ruler"]').boundingBox();
      const hbR = await page.locator('[data-testid="arrangement-track-header"]').first().boundingBox();
      const visStart = (hbR.x + hbR.width - rb.x) / pps;
      const tClick = Math.ceil(Math.max(0, visStart)) + grid * 2.37;
      await page.mouse.click(rb.x + tClick * pps, rb.y + rb.height / 2); await sleep(400);
      const pos = await page.evaluate(() => Number(document.querySelector('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow')));
      p.ruler = { clickT: tClick, pos, onGrid: isMult(pos, grid), nearest: Math.abs(pos - tClick) <= grid / 2 + 0.02 };
      await page.keyboard.down('Alt'); await page.mouse.click(rb.x + tClick * pps, rb.y + rb.height / 2); await page.keyboard.up('Alt'); await sleep(400);
      p.rulerAlt = await page.evaluate(() => Number(document.querySelector('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow')));
      p.rulerAltOffGrid = !isMult(p.rulerAlt, grid);
      await blur(page);
    }
    if (vp.width === 1440) {
      // zoom during drag (probe, not a row)
      const clip = page.locator('[data-clip-kind="audio"]').first();
      const b = await clip.boundingBox(); const hb3 = await page.locator('[data-testid="arrangement-track-header"]').first().boundingBox(); const x = Math.max(b.x, hb3.x + hb3.width) + 20; const y = b.y + 6;
      const g0 = await G(page);
      await page.mouse.move(x, y); await page.mouse.down();
      await page.mouse.move(x + 30, y); await sleep(50);
      await page.keyboard.press('Minus'); await sleep(200);
      const g1 = await G(page);
      await page.mouse.move(x + 60, y); await sleep(50); await page.mouse.move(x + 90, y); await sleep(50);
      await page.mouse.up(); await sleep(400);
      const st = (await clipInfo(page))[0].start;
      r.zoomDuringDrag = { before: g0.division, after: g1.division, gridAfter: Number(g1.seconds), start: st, onGridAfter: isMult(st, Number(g1.seconds)), onGridBefore: isMult(st, Number(g0.seconds)) };
    }
    r.errors = errors;
    await ctx.close();
    return r;
  },
  async budget(browser, vp, key_) {
    const out = {};
    for (const [tag, base] of [['head', HEAD_BASE], ['work', BASE]]) {
      const { ctx, page, errors } = await open(browser, vp, base);
      const empty = await inventory(page);
      await page.screenshot({ path: path.join(outDir, `budget-${tag}-empty-${key_}.png`) });
      await addBtn(page, 'demo-stem-pulse');
      const demo = await inventory(page);
      await page.screenshot({ path: path.join(outDir, `budget-${tag}-demo-${key_}.png`) });
      out[tag] = { empty, demo, errors };
      await ctx.close();
    }
    const diff = (a, b) => ({ onlyHead: a.filter((x) => !b.includes(x)), onlyWork: b.filter((x) => !a.includes(x)) });
    out.cmp = { empty: { head: out.head.empty.length, work: out.work.empty.length, ...diff(out.head.empty, out.work.empty) }, demo: { head: out.head.demo.length, work: out.work.demo.length, ...diff(out.head.demo, out.work.demo) } };
    return out;
  },
  async smoke(browser, vp, key_) {
    const out = {};
    for (const [tag, base] of [['work', BASE], ['head', HEAD_BASE]]) {
      const { ctx, page, errors } = await open(browser, vp, base);
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
      const dl = await dlP; const file = path.join(outDir, `export-${tag}-${key_}.wav`); await dl.saveAs(file);
      r.wav = wavInfo(fs.readFileSync(file)); fs.unlinkSync(file);
      r.errors = errors; out[tag] = r;
      await ctx.close();
    }
    out.shaEqual = out.work.wav.sha256 === out.head.wav.sha256;
    return out;
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
