// A round 253 browser check (adapted from c-round-252/c252.cjs helpers).
// usage: node c252.cjs <base> <outDir> [rowRegex] [onlyVp 1440|1280]
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = process.argv[2];
const outDir = process.argv[3];
const filter = process.argv[4] ? new RegExp(process.argv[4]) : null;
const onlyVp = process.argv[5] || null;
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, 'a253.json');
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
async function open(browser, vp, { pulse = true, zoom = true } = {}) {
  const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => { const t = m.text(); if (/hydrat|Warning:|did not match/i.test(t)) errors.push('console:' + t.slice(0, 300)); });
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
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
const PAUSED_TXT = (t) => `Insert marker at ${t} — playback continues, Follow paused. Stop, then Space plays from here.`;
const PLAYING_TXT = (t) => `Insert marker at ${t} — playback continues. Stop, then Space plays from here.`;
const RESUMED = 'Follow is following the playback position again.';
const FOLLOW_PAUSED = 'Follow paused by manual navigation. Press Follow, or stop playback, to resume it.';
const STOPPED = (t) => `Stopped — Space plays from the insert marker at ${t}.`;
const PAUSED_TITLE = 'Follow paused — press Follow, or stop playback, to resume';
const logLen = (page) => page.evaluate(() => window.__statusLog.length);
const logFrom = (page, n) => page.evaluate((n) => window.__statusLog.slice(n).map((x) => x.text), n);
const markerFmt = (m) => fmt(Number(m));

async function seq(browser, vp, k, name, body) {
  const { ctx, page, errors, setup } = await open(browser, vp);
  const row = { setup };
  try { await body(page, row); } catch (e) { row.error = String(e); }
  row.pageErrors = errors;
  await shot(page, name, k);
  R.rows[`${name}-${k}`] = row; save();
  await ctx.close();
}
async function stopAndRead(page, row) {
  const n = await logLen(page);
  await key(page, 'Space', 600);
  row.afterStop = await st(page);
  row.writesAtStop = await logFrom(page, n);
}

(async () => {
  const browser = await chromium.launch();
  for (const [k, vp] of [['1440', { width: 1440, height: 900 }], ['1280', { width: 1280, height: 720 }]]) {
    if (onlyVp && onlyVp !== k) continue;
    await seq(browser, vp, k, 'pause-stop', async (page, row) => {
      await key(page, 'Space', 1200);
      const g = await geo(page);
      row.aim = await aimClick(page, safeX(g), lowerY(g), ['arrangement-bars-ruler']);
      await sleep(400);
      row.paused = await st(page);
      await stopAndRead(page, row);
      const t = markerFmt(row.afterStop.m);
      row.pass = row.paused.status === PAUSED_TXT(markerFmt(row.paused.m)) && row.paused.followTitle === PAUSED_TITLE &&
        !row.afterStop.playing && row.afterStop.follow === 'on' && row.afterStop.followText === 'Follow' &&
        row.afterStop.status === STOPPED(t) && row.paused.m === row.afterStop.m && row.writesAtStop.length === 1 && row.writesAtStop[0] === STOPPED(t);
    });
    await seq(browser, vp, k, 'off-stop', async (page, row) => {
      await page.locator('[data-testid="arrangement-follow"]').click(); await sleep(200); await blur(page);
      row.followBefore = (await st(page)).follow;
      await key(page, 'Space', 1200);
      const g = await geo(page);
      row.aim = await aimClick(page, safeX(g), lowerY(g), ['arrangement-bars-ruler']);
      await sleep(400);
      row.playingState = await st(page);
      await stopAndRead(page, row);
      const t = markerFmt(row.afterStop.m);
      row.pass = row.followBefore === 'off' && row.playingState.status === PLAYING_TXT(markerFmt(row.playingState.m)) &&
        row.afterStop.follow === 'off' && row.afterStop.status === STOPPED(t) && row.writesAtStop.length === 1;
    });
    await seq(browser, vp, k, 'scroll-stop', async (page, row) => {
      await key(page, 'Space', 1200);
      await page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); s.scrollLeft += 200; });
      await sleep(500);
      row.paused = await st(page);
      await stopAndRead(page, row);
      const t = markerFmt(row.afterStop.m);
      row.pass = row.paused.follow === 'paused' && row.paused.status === FOLLOW_PAUSED && row.paused.followTitle === PAUSED_TITLE &&
        row.afterStop.follow === 'on' && row.afterStop.status === STOPPED(t) && row.writesAtStop.length === 1;
    });
    await seq(browser, vp, k, 'plain-stop', async (page, row) => {
      await key(page, 'Space', 1500);
      row.playing = await st(page);
      await stopAndRead(page, row);
      row.pass = row.playing.playing && !row.afterStop.playing && row.writesAtStop.length === 0 && row.afterStop.status === row.playing.status;
    });
  }
  await browser.close();
  R.finished = new Date().toISOString(); save();
  for (const [n, r] of Object.entries(R.rows)) console.log(n, r.pass, r.error ?? '', r.afterStop?.status ?? '', JSON.stringify(r.writesAtStop ?? []), r.pageErrors?.length);
})();
