// C round 255: SABA-B-10b fix-up rows (C, independent).
// usage: node c253.cjs <base> <outDir> [rowRegex] [onlyVp 1440|1280]
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = process.argv[2];
const outDir = process.argv[3];
const filter = process.argv[4] ? new RegExp(process.argv[4]) : null;
const onlyVp = process.argv[5] || null;
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, 'c255.json');
const R = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')) : { rows: {} };
R.base = BASE; R.started = new Date().toISOString();
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SHA = '1fea093b975946c800329006e1c9943560bf3ac3cb86e361f2cd4628ce033f94';

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
  window.__statusLog = [];
  const hook = () => {
    const s = document.querySelector('[data-testid="arrangement-status"]');
    if (!s) { requestAnimationFrame(hook); return; }
    new MutationObserver(() => window.__statusLog.push({ t: performance.now(), text: s.textContent })).observe(s, { childList: true, subtree: true, characterData: true });
  };
  document.addEventListener('DOMContentLoaded', hook);
};

const readWav = (buf) => {
  const ch = buf.readUInt16LE(22); const rate = buf.readUInt32LE(24); const ba = buf.readUInt16LE(32); const bits = buf.readUInt16LE(34);
  let off = 12; let dataOff = -1; let dataSize = 0;
  while (off < buf.length - 8) { const id = buf.toString('ascii', off, off + 4); const sz = buf.readUInt32LE(off + 4); if (id === 'data') { dataOff = off + 8; dataSize = sz; break; } off += 8 + sz; }
  const frames = dataSize / ba; const bps = bits / 8;
  const data = Array.from({ length: ch }, () => new Float64Array(frames));
  for (let f = 0; f < frames; f += 1) for (let c = 0; c < ch; c += 1) {
    const o = dataOff + f * ba + c * bps; let x;
    if (bits === 24) { let v = buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16); if (v & 0x800000) v -= 0x1000000; x = v / 8388608; } else if (bits === 16) { x = buf.readInt16LE(o) / 32768; } else { x = buf.readFloatLE(o); }
    data[c][f] = x;
  }
  return { ch, rate, bits, frames, data };
};
const wavInfo = (buf) => {
  const w = readWav(buf); let s = 0; let n = 0; let peak = 0; let nan = 0;
  for (const d of w.data) for (const x of d) { if (!Number.isFinite(x)) nan += 1; s += x * x; n += 1; const a = Math.abs(x); if (a > peak) peak = a; }
  return { bytes: buf.length, rate: w.rate, bits: w.bits, ch: w.ch, frames: w.frames, seconds: w.frames / w.rate, rmsDb: +(10 * Math.log10(s / n || 1e-20)).toFixed(2), peak: +peak.toFixed(4), nan, sha256: crypto.createHash('sha256').update(buf).digest('hex') };
};

const blur = (page) => page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
async function addPulse(page) {
  await page.locator('[data-source-id="demo-stem-pulse"]').first().click();
  await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await sleep(1000);
  await blur(page);
}
async function open(browser, vp, { pulse = true, zoom = true, rm = 'no-preference', base = BASE } = {}) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true, reducedMotion: rm });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => { const t = m.text(); if (/hydrat|Warning:|did not match/i.test(t)) errors.push('console:' + t.slice(0, 300)); });
  await page.goto(`${base}/studio-lab`, { waitUntil: "load" });
  await page.waitForFunction(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); return s && s.textContent.startsWith('Demo collection ready'); }, undefined, { timeout: 150000 });
  await sleep(800);
  const setup = {};
  if (pulse) {
    await addPulse(page);
    setup.status = await page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent);
    if (zoom) { for (let i = 0; i < 4; i += 1) { await page.keyboard.press('Equal'); await sleep(150); } await sleep(400); }
    setup.zoom = await page.evaluate(() => document.querySelector('[data-testid="arrangement-zoom-readout"]')?.textContent);
    setup.bpm = await page.evaluate(() => document.querySelector('[data-testid="arrangement-bars-ruler"]')?.getAttribute('data-bpm'));
  }
  return { ctx, page, errors, setup };
}
const st = (page) => page.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const a = document.activeElement;
  const f = q('[data-testid="arrangement-follow"]');
  const sc = q('[data-testid="arrangement-timeline-scroller"]');
  const pl = q('[data-testid="arrangement-playhead"]');
  return {
    t: performance.now(),
    ph: Number(q('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow')),
    pos: q('[data-testid="arrangement-position"]')?.textContent ?? null,
    m: q('[data-insert-marker]')?.getAttribute('data-insert-marker') ?? null,
    playing: !!q('button[aria-label="Pause"]'),
    follow: f?.getAttribute('data-follow-mode') ?? null, followText: f?.textContent ?? null, followTitle: f?.getAttribute('title') ?? null,
    status: q('[data-testid="arrangement-status"]')?.textContent ?? null,
    scrollLeft: sc?.scrollLeft ?? null,
    playheadX: pl ? +pl.getBoundingClientRect().x.toFixed(1) : null,
    selMarkers: [...document.querySelectorAll('[data-testid="arrangement-marker"]')].filter((m) => m.getAttribute('aria-current') === 'true').map((m) => m.getAttribute('data-marker-time') ?? m.getAttribute('aria-label')),
    markers: [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((m) => m.getAttribute('data-marker-time') ?? m.getAttribute('aria-label')),
    active: a && a !== document.body ? (a.getAttribute('data-testid') || '') + '|' + (a.getAttribute('aria-label') || a.tagName).slice(0, 60) : 'BODY',
    rms: Math.max(0, ...(window.__rms ? window.__rms() : [0])),
  };
});
const geo = (page) => page.evaluate(() => {
  const r = document.querySelector('[data-testid="arrangement-ruler"]').getBoundingClientRect();
  const b = document.querySelector('[data-testid="arrangement-bars-ruler"]')?.getBoundingClientRect();
  const s = document.querySelector('[data-testid="arrangement-bars-scrub-strip"]')?.getBoundingClientRect();
  const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]').getBoundingClientRect();
  const pps = parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent);
  const lane = (id) => { const x = document.querySelector(`[data-track-id="${id}"]`)?.getBoundingClientRect(); return x ? { y: x.y, h: x.height } : null; };
  const clip = document.querySelector('[data-track-id="music"] [data-clip-id]')?.getBoundingClientRect();
  return { rx: r.x, ry: r.y, rh: r.height, bx: b?.x, by: b?.y, bh: b?.height, sy: s?.y, sh: s?.height, scLeft: sc.left, scRight: sc.right, pps, sfx: lane('sfx'), music: lane('music'), clip: clip && { y: clip.y, h: clip.height } };
});
const hit = (page, x, y) => page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const t = e?.closest('[data-testid]'); return t ? t.getAttribute('data-testid') : e?.tagName ?? null; }, [x, y]);
// click at viewport x on a target band; refuse when elementFromPoint is not the named target
async function aimClick(page, x, y, want, mods) {
  const h = await hit(page, x, y);
  if (!want.includes(h)) throw new Error(`aim ${x.toFixed(0)},${y.toFixed(0)} hit ${h}, want ${want}`);
  if (mods) await page.keyboard.down(mods);
  await page.mouse.click(x, y);
  if (mods) await page.keyboard.up(mods);
  return h;
}
const lowerY = (g) => g.by + g.bh - 3;
const stripY = (g) => g.sy + g.sh / 2;
const secY = (g) => g.ry + g.rh / 2;
const safeX = (g) => g.scRight - 300; // right of the metronome toggle (A's aim note), well inside the scroller
async function key(page, k, wait = 300) { await page.keyboard.press(k); await sleep(wait); }
async function shot(page, name, k) { await page.screenshot({ path: path.join(outDir, `${name}-${k}.png`) }); }
const fmt = (s) => { const m = Math.floor(s / 60); const sec = s - m * 60; return `${String(m).padStart(2, '0')}:${sec.toFixed(3).padStart(6, '0')}`; };
const HEADB = BASE;
const MEDIA = '/home/runner/czaba-project/tmp/studio-real-loop/media/beeps-6s-vp9-opus.webm';
const lum = (c) => { const m = c.match(/\d+(\.\d+)?/g).map(Number); const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); };
const ratio = (a, b) => { const x = lum(a); const y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const INK = 'rgb(236, 230, 218)';
const L = (page) => page.evaluate(() => {
  const ls = document.querySelectorAll('[data-testid="arrangement-insert-marker"]'); const l = ls[0];
  const p = document.querySelector('[data-testid="arrangement-playhead"]');
  const o = { count: ls.length };
  if (l) { const b = l.getBoundingClientRect(); const cs = getComputedStyle(l); Object.assign(o, { hidden: l.hidden, display: cs.display, x: +b.x.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(1), top: +b.y.toFixed(1), bg: cs.backgroundColor, pe: cs.pointerEvents, anim: cs.animationName, opacity: cs.opacity, z: cs.zIndex, ariaHidden: l.getAttribute('aria-hidden'), tabindex: l.getAttribute('tabindex'), m: l.getAttribute('data-insert-marker'), parentSame: !!p && l.parentElement === p.parentElement, beforePlayhead: !!p && !!(l.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING) }); }
  if (p) { const b = p.getBoundingClientRect(); const cs = getComputedStyle(p); o.ph = { x: +b.x.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(1), top: +b.y.toFixed(1), bg: cs.backgroundColor, z: cs.zIndex, cls: p.className }; }
  o.pos = document.querySelector('[data-testid="arrangement-position"]')?.textContent ?? null;
  o.phv = Number(document.querySelector('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow'));
  o.playing = !!document.querySelector('button[aria-label="Pause"]');
  o.range = document.querySelectorAll('[data-testid="arrangement-range"]').length;
  return o;
});
const tickX = (page, label) => page.evaluate((label) => { const s = [...document.querySelectorAll('[data-testid="arrangement-ruler"] span')].find((e) => e.textContent.trim() === label); return s ? +s.parentElement.getBoundingClientRect().x.toFixed(2) : null; }, label);
async function pixel(page, x, y) {
  const buf = await page.screenshot({ clip: { x: Math.floor(x), y: Math.floor(y), width: 1, height: 1 } });
  return page.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = 1; c.height = 1; const g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, 1, 1).data; return `rgb(${d[0]}, ${d[1]}, ${d[2]})`; }, buf.toString('base64'));
}
async function origin(page) { const s = await L(page); const g = await geo(page); return { x0: s.ph.x, pps: g.pps, g }; }
async function laneClick(page, o, t, track = 'sfx') {
  const g = await geo(page); const ln = g[track]; const x = o.x0 + t * o.pps; const y = ln.y + ln.h / 2;
  const target = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return { lane: e?.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null, scrub: !!e?.closest('[data-testid="arrangement-bars-scrub-strip"]'), tid: e?.closest('[data-testid]')?.getAttribute('data-testid') ?? e?.tagName }; }, [x, y]);
  if (target.lane !== track || target.scrub) throw new Error('lane aim ' + JSON.stringify(target));
  await page.mouse.click(x, y); await sleep(350); return { x, y, target };
}
async function samplesOpacity(page) { const out = []; for (let i = 0; i < 24; i += 1) { out.push(Number(await page.evaluate(() => getComputedStyle(document.querySelector('[data-testid="arrangement-insert-marker"]')).opacity))); await sleep(100); } return out; }
const changes = (a) => a.reduce((n, v, i) => n + (i && v !== a[i - 1] ? 1 : 0), 0);
const minChanges2s = (a) => { let m = 99; for (let i = 0; i + 20 < a.length; i += 1) m = Math.min(m, changes(a.slice(i, i + 21))); return m; };
async function bgBehind(page, x, y) {
  return page.evaluate(([x, y]) => {
    const hide = [...document.querySelectorAll('[data-testid="arrangement-insert-marker"],[data-testid="arrangement-playhead"],[data-testid="arrangement-playhead-handle"]')];
    hide.forEach((e) => { e.dataset.cvis = e.style.visibility; e.style.visibility = 'hidden'; });
    let e = document.elementFromPoint(x, y); const id = e?.closest('[data-testid]')?.getAttribute('data-testid') ?? e?.tagName; let bg = null; const chain = [];
    while (e) { const c = getComputedStyle(e).backgroundColor; chain.push(c); const am = c.match(/\/\s*([\d.]+)\)$/) || c.match(/^rgba\([^)]*,\s*([\d.]+)\)$/); const alpha = am ? Number(am[1]) : 1; if (alpha >= 0.999) { bg = c; break; } e = e.parentElement; }
    hide.forEach((h) => { h.style.visibility = h.dataset.cvis; });
    return { id, bg, chain: chain.slice(0, 6) };
  }, [x, y]);
}


const ROWS = {
  async sheet(browser, vp, k) {
    const r = {};
    for (const [tag, base] of [['new', BASE], ['head', HEADB]]) {
      const { ctx, page, errors } = await open(browser, vp, { base, pulse: true, zoom: false });
      await page.keyboard.press('Shift+Slash'); await sleep(600);
      const d = await page.evaluate(() => {
        const dlg = document.querySelector('[role="dialog"]'); if (!dlg) return null;
        const rows = [...dlg.querySelectorAll('[data-shortcut-id]')].map((li) => ({ id: li.getAttribute('data-shortcut-id'), action: li.querySelector('span').textContent, keys: [...li.querySelectorAll('kbd')].map((x) => x.textContent), h: +li.getBoundingClientRect().height.toFixed(1) }));
        let sc = null; for (let e = dlg.querySelector('[data-shortcut-id]'); e; e = e.parentElement) { const cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight) { sc = { tag: e.tagName, sh: e.scrollHeight, ch: e.clientHeight, sw: e.scrollWidth, cw: e.clientWidth }; break; } }
        const tr = [...dlg.querySelectorAll('section')].find((s) => s.querySelector('h3')?.textContent === 'Transport');
        return { rows, sc, transport: tr ? [...tr.querySelectorAll('[data-shortcut-id]')].map((li) => li.getAttribute('data-shortcut-id')) : null, dlgSW: dlg.scrollWidth, dlgCW: dlg.clientWidth };
      });
      r[tag] = d; await shot(page, `sheet-${tag}`, k);
      // last row readable
      r[tag + 'Close'] = await page.evaluate(() => { const li = document.querySelector('[role="dialog"] [data-shortcut-id="close"]'); if (!li) return null; li.scrollIntoView({ block: 'nearest' }); const b = li.getBoundingClientRect(); let sc = li.parentElement; while (sc && !/(auto|scroll)/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement; const s = sc.getBoundingClientRect(); const cx = b.x + 20, cy = b.y + b.height / 2; const e = document.elementFromPoint(cx, cy); return { top: b.top, bottom: b.bottom, scTop: s.top, scBottom: s.bottom, inView: b.top >= s.top - 0.5 && b.bottom <= s.bottom + 0.5 && b.bottom <= innerHeight, hitInside: li.contains(e), text: li.textContent }; });
      await sleep(200); await shot(page, `sheet-close-row-${tag}`, k);
      await page.evaluate(() => { const li = document.querySelector('[role="dialog"] [data-shortcut-id]'); li?.scrollIntoView({ block: 'nearest' }); });
      const inp = page.locator('[role="dialog"] input').first(); if (await inp.count()) await inp.focus();
      await page.keyboard.type('insert marker'); await sleep(400);
      r[tag + 'Search'] = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] [data-shortcut-id]')].map((li) => li.getAttribute('data-shortcut-id')));
      await shot(page, `sheet-search-${tag}`, k);
      await page.keyboard.press('Escape'); await sleep(400);
      if (await page.locator('[role="dialog"]').count()) { await page.keyboard.press('Escape'); await sleep(400); }
      const act = () => page.evaluate(() => ({ open: !!document.querySelector('[role="dialog"]'), active: document.activeElement?.getAttribute('aria-label') || document.activeElement?.getAttribute('title') || document.activeElement?.textContent?.trim().slice(0, 40) || document.activeElement?.tagName }));
      r[tag + 'AfterEscKey'] = await act();
      // open by the footer button, Esc, focus back
      const btn = page.getByRole('button', { name: /Keyboard shortcuts/ }).first(); r[tag + 'BtnCount'] = await btn.count();
      if (r[tag + 'BtnCount']) { r[tag + 'BtnLabel'] = await btn.getAttribute('aria-label'); await btn.click(); await sleep(500); r[tag + 'OpenedByBtn'] = await page.locator('[role="dialog"]').count(); await page.keyboard.press('Escape'); await sleep(400); r[tag + 'AfterEscBtn'] = await act(); }
      r[tag + 'Errors'] = errors; await ctx.close();
    }
    const EXP = [['play-stop', 'Play from the insert marker or the selection start · Stop', ['Space']], ['continue-playback', 'Continue from where playback stopped', ['Shift+Space']], ['insert-marker-to-playhead', 'Move the insert marker to the playhead', ['Ctrl+Shift+Space']], ['back-to-start', 'Back to start (the insert marker too)', ['Home']], ['play-from-point', null, null], ['loop', null, null]];
    const by = Object.fromEntries((r.new?.rows || []).map((x) => [x.id, x]));
    r.textOk = EXP.every(([id, a, kk]) => by[id] && (a == null || (by[id].action === a && JSON.stringify(by[id].keys) === JSON.stringify(kk))));
    r.orderOk = JSON.stringify(r.new?.transport) === JSON.stringify(EXP.map((e) => e[0]));
    r.markerOk = by.marker?.action === 'Add a marker at the selection start, the insert marker, or the playhead while playing';
    const SEARCH = ['play-stop', 'insert-marker-to-playhead', 'back-to-start', 'split', 'marker', 'add-sound'];
    r.searchOk = SEARCH.every((id) => r.newSearch.includes(id)); r.searchExact = JSON.stringify([...r.newSearch].sort()) === JSON.stringify([...SEARCH].sort());
    r.boundOk = !!r.new?.sc && r.new.sc.sh <= 1260 && r.new.sc.ch === (k === '1440x900' ? 808 : 646) && r.new.sc.ch === r.head?.sc?.ch && r.new.sc.sw === r.new.sc.cw && r.new.dlgSW === r.new.dlgCW;
    const CH = ['play-stop', 'continue-playback', 'insert-marker-to-playhead', 'back-to-start', 'marker'];
    r.changedRows = CH.map((id) => ({ id, h: by[id]?.h ?? null })); r.changedOk = r.changedRows.every((x) => x.h != null && x.h <= 40);
    const hb = Object.fromEntries((r.head?.rows || []).map((x) => [x.id, x.h]));
    r.perRow = (r.new?.rows || []).map((x) => ({ id: x.id, head: hb[x.id] ?? null, new: x.h }));
    r.otherDiffs = r.perRow.filter((x) => !CH.includes(x.id) && x.head !== x.new);
    r.headOnly = (r.head?.rows || []).map((x) => x.id).filter((id) => !by[id]);
    r.escOk = !r.newAfterEscKey.open && !r.newAfterEscBtn?.open && /Keyboard shortcuts/.test(r.newAfterEscBtn?.active || '');
    r.closeOk = k !== '1280x720' || (r.newClose?.inView && r.newClose?.hitInside);
    r.pass = r.textOk && r.orderOk && r.markerOk && r.searchOk && r.boundOk && r.changedOk && r.otherDiffs.length === 0 && r.escOk && r.closeOk && r.newErrors.length === 0;
    return r;
  },
  async zorder(browser, vp, k) {
    const r = {};
    for (const [tag, base] of [['new', BASE], ['head', HEADB]]) {
      const { ctx, page, errors } = await open(browser, vp, { base, rm: 'reduce', zoom: false }); const x = {}; r[tag] = x; R.rows['zorder-partial@' + k] = r;
      await page.locator('[data-testid=arrangement-video-input]').first().setInputFiles(MEDIA);
      await page.waitForFunction(() => document.querySelectorAll('[data-clip-kind=video]').length > 0, null, { timeout: 30000 });
      await sleep(2500); await page.mouse.click(5, 5); await sleep(300); await blur(page);
      const o = await origin(page);
      await laneClick(page, o, 2);
      await key(page, 'Space', 1500); await key(page, 'Space', 500); await blur(page);
      x.s = await L(page); x.pps = o.pps; x.x0 = o.x0;
      const vc = await page.evaluate(() => { const c = document.querySelector('[data-clip-kind=video]'); const b = c.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; }); x.vclip = vc;
      // dock monitor geometry vs line extent
      x.dock = await page.evaluate(() => { const b = document.querySelector('[data-testid=arrangement-video-box]').getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
      x.dockOverlapsLines = x.dock.y + x.dock.h > x.s.ph.top && x.dock.y < x.s.ph.top + x.s.ph.h && x.dock.x < Math.max(x.s.x, x.s.ph.x) + 2 && x.dock.x + x.dock.w > Math.min(x.s.x, x.s.ph.x);
      // generic paint order probe: is element `sel` painted at (px,y) above what is under it?
      const order = async (sel, px, y) => {
        const vpw = page.viewportSize(); if (!(px >= 0 && y >= 0 && px < vpw.width && y < vpw.height)) return { outOfView: true, px, y };
        const all = await pixel(page, px, y);
        await page.evaluate((s) => document.querySelectorAll(s).forEach((e) => { e.style.visibility = 'hidden'; }), sel);
        const under = await pixel(page, px, y);
        await page.evaluate((s) => document.querySelectorAll(s).forEach((e) => { e.style.visibility = ''; }), sel);
        const hitT = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return (e?.getAttribute('data-testid') || e?.tagName) + '<' + (e?.closest('[data-clip-kind],[data-testid=arrangement-video-box]')?.getAttribute('data-clip-kind') || e?.closest('[data-testid=arrangement-video-box]')?.getAttribute('data-testid') || ''); }, [px, y]);
        return { all, under, above: all !== under, hit: hitT };
      };
      const LINE = '[data-testid=arrangement-insert-marker]'; const PH = '[data-testid=arrangement-playhead]';
      const lx = x.s.x + 0.5; const phx = x.s.ph.x + 0.5;
      // over video clip on the video lane (y below the fade handles)
      const yc = vc.y + vc.h * 0.75;
      x.clip = { lineVisible: !x.s.hidden, line: x.s.hidden ? null : await order(LINE, lx, yc), ph: await order(PH, phx, yc) };
      await shot(page, 'zorder-clip', `${k}-${tag}`);
      // floating video: expand, move over both lines with the drag handle arrows
      await page.locator('[data-testid=arrangement-video-expand]').click(); await sleep(900);
      const fb = async () => page.evaluate(() => { const b = document.querySelector('[data-testid=arrangement-video-box]').getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, pos: getComputedStyle(document.querySelector('[data-testid=arrangement-video-box]')).position, z: getComputedStyle(document.querySelector('[data-testid=arrangement-video-box]')).zIndex }; });
      x.float0 = await fb();
      const targetLeft = (x.s.hidden ? x.s.ph.x : Math.min(x.s.x, x.s.ph.x)) - 60; const n = Math.max(0, Math.round((targetLeft - x.float0.x) / 16));
      await page.locator('[data-testid=arrangement-video-drag]').focus();
      for (let i = 0; i < n; i += 1) await page.keyboard.press('ArrowRight');
      await sleep(400); x.float1 = await fb(); x.moves = n;
      await page.mouse.move(2, 2); await blur(page); await sleep(300);
      const s2 = await L(page); x.s2 = { x: s2.x, phx: s2.ph.x, hidden: s2.hidden, top: s2.top, h: s2.h };
      const fy = Math.min(x.float1.y + x.float1.h * 0.6, s2.ph.top + s2.ph.h - 4);
      x.floatProbeY = fy;
      x.floatCovers = { line: !s2.hidden && s2.x >= x.float1.x && s2.x <= x.float1.x + x.float1.w && fy >= x.float1.y && fy <= x.float1.y + x.float1.h && fy <= s2.top + s2.h, ph: s2.ph.x >= x.float1.x && s2.ph.x <= x.float1.x + x.float1.w };
      x.float = { line: s2.hidden ? null : await order(LINE, s2.x + 0.5, fy), ph: await order(PH, s2.ph.x + 0.5, fy) };
      await shot(page, 'zorder-float', `${k}-${tag}`);
      x.errors = errors; await ctx.close();
    }
    const n = r.new; const h = r.head;
    r.clipSame = n.clip.line && n.clip.line.above === n.clip.ph.above;
    r.clipEqHead = n.clip.ph.above === h.clip.ph.above;
    r.floatSame = n.float.line && n.float.line.above === n.float.ph.above;
    r.floatEqHead = n.float.ph.above === h.float.ph.above;
    r.floatHitVideo = /arrangement-video-box|VIDEO|arrangement-video/.test(n.float.line?.hit || '') && /arrangement-video/.test(n.float.ph.hit);
    r.pass = !n.s.hidden && n.s.m === '2.000' && Math.abs(n.s.ph.x - n.s.x) > 10 && n.floatCovers.line && n.floatCovers.ph && r.clipSame && r.clipEqHead && r.floatSame && r.floatEqHead && r.floatHitVideo && n.errors.length === 0;
    return r;
  },
};
const STANDALONE = {
  async _budget(browser, vp, k, base = BASE) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: false, base });
    const inv = () => page.evaluate(() => {
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
    const empty = await inv(); await shot(page, 'budget-empty', k);
    await addPulse(page);
    const demo = await inv(); await shot(page, 'budget-demo', k);
    await ctx.close();
    const exp = k.startsWith('1440x900') ? [85, 101] : [69, 85];
    return { empty: empty.length, demo: demo.length, exp, pass: empty.length === exp[0] && demo.length === exp[1], errors };
  },
  async smoke(browser, vp, k) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: true, zoom: false });
    const r = {}; r.s0 = await st(page);
    await key(page, 'Space', 1200); r.playing = await st(page);
    await key(page, 'Space', 400);
    await page.getByRole('button', { name: 'Export', exact: true }).first().click();
    const dlg = page.getByRole('dialog'); await dlg.waitFor();
    const dlP = page.waitForEvent('download', { timeout: 120000 });
    await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const dl = await dlP; const file = path.join(outDir, `smoke-${k}.wav`); await dl.saveAs(file);
    r.wav = wavInfo(fs.readFileSync(file)); fs.unlinkSync(file);
    r.errors = errors;
    r.pass = r.playing.playing && r.playing.ph > r.s0.ph && r.playing.rms > 0.001 && r.wav.sha256 === SHA && r.wav.nan === 0 && Math.abs(r.wav.seconds - 16) < 0.001 && errors.length === 0;
    await ctx.close(); return r;
  },
  async auth(browser, vp, k) {
    const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage(); const r = {};
    r.cookies0 = (await ctx.cookies()).length;
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' }); await page.waitForSelector('[data-testid="arrangement-ruler"]', { timeout: 150000 });
    r.labWorkspace = await page.locator('[data-testid="arrangement-timeline-scroller"]').count();
    r.labAuthUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' }); await sleep(3000);
    r.guard = await page.evaluate(() => ({ signIn: /Sign in required/i.test(document.body.innerText), audioSrc: document.querySelectorAll('audio[src]').length, workspace: !!document.querySelector('[data-testid=arrangement-ruler]') || !!document.querySelector('[data-testid=arrangement-timeline-scroller]') }));
    await shot(page, 'auth-guard', k);
    const api = `${BASE}/api/studio-token?product=middle-east&file=stem1.wav`;
    const a = await ctx.request.get(api, { failOnStatusCode: false }); r.tokenNoHeader = { status: a.status(), body: (await a.text()).slice(0, 160) };
    const b = await ctx.request.get(api, { failOnStatusCode: false, headers: { Authorization: 'Bearer fake.invalid.token' } }); r.tokenFake = { status: b.status(), body: (await b.text()).slice(0, 160) };
    r.pass = r.labWorkspace === 1 && r.labAuthUser === null && r.guard.signIn && r.guard.audioSrc === 0 && !r.guard.workspace && r.tokenNoHeader.status === 401 && r.tokenFake.status !== 200;
    await ctx.close(); return r;
  },
};
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  R.chromium = browser.version();
  const vps = [{ width: 1440, height: 900 }, { width: 1280, height: 720 }].filter((v) => !onlyVp || String(v.width) === onlyVp);
  for (const vp of vps) {
    const k = `${vp.width}x${vp.height}`;
    for (const [name, fn] of [...Object.entries(ROWS), ...Object.entries(STANDALONE)]) {
      if (filter && !filter.test(name)) continue;
            const t0 = Date.now(); const key2 = `${name}@${k}`;
      try { R.rows[key2] = await fn(browser, vp, k); } catch (e) { R.rows[key2] = { error: String(e).slice(0, 800) }; }
      R.rows[key2].ms = Date.now() - t0; save();
      const x = R.rows[key2];
      console.log(key2, 'pass=', x.pass, x.error ? x.error.slice(0, 300) : '');
    }
  }
  await browser.close(); R.finished = new Date().toISOString(); save();
})();
