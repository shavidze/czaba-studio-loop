// C round 236: SABA-B-11a-FIX-1 browser verification (derived from c235.cjs helpers).
// usage: node c236.cjs <outDir> [rowFilter]
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = process.env.C236_BASE || 'http://127.0.0.1:5173';
const HEAD_BASE = 'http://127.0.0.1:5174';
const outDir = process.argv[2];
const filter = process.argv[3] ? new RegExp(process.argv[3]) : null;
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, 'c236.json');
const R = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')) : { rows: {} };
R.started = new Date().toISOString();
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const INIT = () => {
  window.__taps = [];
  window.__starts = [];
  window.__labels = [];
  window.__up = [];
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
  const st = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (when, offset, duration) {
    try { window.__starts.push({ t: performance.now(), when, offset, duration, ctxTime: this.context.currentTime, offline: this.context instanceof OfflineAudioContext }); } catch (e) {}
    return st.apply(this, arguments);
  };
  window.__rms = () => window.__taps.map((a) => { const d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return Math.sqrt(s / d.length); });
  window.addEventListener('pointerup', (e) => window.__up.push({ t: performance.now(), ts: e.timeStamp }), true);
  const watch = () => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Play' || b.getAttribute('aria-label') === 'Pause');
    if (!btn) { setTimeout(watch, 200); return; }
    window.__playBtn = btn;
    new MutationObserver(() => window.__labels.push({ t: performance.now(), label: btn.getAttribute('aria-label') })).observe(btn, { attributes: true, attributeFilter: ['aria-label'] });
  };
  document.addEventListener('DOMContentLoaded', watch);
};

async function open(browser, vp, base = BASE) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Add/.test(x.textContent.trim())); return b && !b.disabled; }, undefined, { timeout: 120000 });
  await page.waitForFunction(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); return s && s.textContent.startsWith('Demo collection ready'); }, undefined, { timeout: 120000 });
  await sleep(500);
  return { ctx, page, errors };
}
async function addBtn(page, id) {
  await page.locator(`[data-source-id="${id}"]`).first().click();
  await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await sleep(700);
  await page.mouse.click(5, 5); await sleep(200);
}
async function setTempo(page, v) {
  const t = page.locator('[data-testid="arrangement-tempo-input"]');
  await t.click(); await t.fill(v); await page.keyboard.press('Enter'); await sleep(400);
}
const bars = (page) => page.locator('[data-testid="arrangement-bars-ruler"]').boundingBox();
const secs = (page) => page.locator('[data-testid="arrangement-ruler"]').boundingBox();
const S = (page) => page.evaluate(() => {
  const h = document.querySelector('[data-testid="arrangement-playhead-handle"]');
  const s = document.querySelector('[data-testid="arrangement-status"]');
  const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]');
  const br = document.querySelector('[data-testid="arrangement-bars-ruler"]');
  return {
    pos: h ? Number(h.getAttribute('aria-valuenow')) : null,
    label: window.__playBtn ? window.__playBtn.getAttribute('aria-label') : null,
    status: s ? s.textContent : null,
    scrollLeft: sc ? sc.scrollLeft : null,
    barsWidth: br ? br.getBoundingClientRect().width : null,
    follow: (document.querySelector('[data-testid*="follow"]') || {}).getAttribute ? document.querySelector('[data-testid*="follow"]').getAttribute('aria-pressed') : null,
  };
});
const pps = async (page) => { const c = page.locator('[data-clip-kind="audio"]').first(); if (await c.count()) { const b = await c.boundingBox(); return b.width / 16; } return 40; };
async function clickAt(page, x, y, mods = []) {
  for (const m of mods) await page.keyboard.down(m);
  await page.mouse.click(x, y);
  for (const m of mods) await page.keyboard.up(m);
}
// sample position/label for ms after a click; returns samples with dt from pointerup
async function clickAndSample(page, x, y, ms, mods = []) {
  const n0 = await page.evaluate(() => { window.__labels = []; return window.__up.length; });
  await clickAt(page, x, y, mods);
  const samples = [];
  const t1 = Date.now();
  while (Date.now() - t1 < ms) {
    samples.push(await page.evaluate((n) => { const h = document.querySelector('[data-testid="arrangement-playhead-handle"]'); const up = window.__up[n]; return { dt: up ? performance.now() - up.t : null, pos: Number(h.getAttribute('aria-valuenow')), label: window.__playBtn.getAttribute('aria-label'), rms: Math.max(0, ...window.__rms()) }; }, n0));
    await sleep(60);
  }
  const labels = await page.evaluate(() => window.__labels);
  return { samples, labels };
}
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
    const region = el.closest('[data-testid]') ? el.closest('[data-testid]').getAttribute('data-testid') : el.tagName;
    rows.push(`${region}|${own.slice(0, 140)}`);
  }
  return rows;
});
const PLAYPASTEND = 'Playhead (00:20.000) is past the end of the project (00:16.000) — there is nothing to play here. Home returns to 0.';
const NOTHING = 'Nothing to play — add a clip from the library first.';
const FIT = 'Fit: the entire project is visible (00:16.000). X goes back.';

