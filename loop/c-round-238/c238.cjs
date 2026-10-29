// C round 238: copy of C round 237 c237.cjs (smoke + auth rows), output c238.json
// usage: node c236.cjs <outDir> [rowFilter]
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = process.env.C237_BASE || 'http://127.0.0.1:5173';
const HEAD_BASE = 'http://127.0.0.1:5174';
const outDir = process.argv[2];
const filter = process.argv[3] ? new RegExp(process.argv[3]) : null;
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, 'c238.json');
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

const END16 = 'Playhead (00:16.000) is past the end of the project (00:16.000) — there is nothing to play here. Home returns to 0.';
const ROWS = {  async strip41(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const b = await bars(page); const p = await pps(page);
    const st0 = await page.evaluate(() => window.__starts.length);
    const s = await clickAndSample(page, b.x + 4.1 * p, b.y + 4, 1200);
    const r = { pps: p, liveStarts: await page.evaluate((n) => window.__starts.slice(n).filter((x) => !x.offline).map((x) => +x.offset.toFixed(4)), st0), labels: s.labels, after: await S(page), rms: await page.evaluate(() => Math.max(0, ...window.__rms())) };
    await page.keyboard.press('Space'); await sleep(200);
    r.errors = errors; await ctx.close(); return r;
  },
  async previewEnd(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const scroll = (v) => page.evaluate((v) => { document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft = v; }, v);
    await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(300);
    const t = page.locator('[data-testid="arrangement-library-preview-toggle"]');
    const lab = () => t.evaluate((x) => x.textContent.trim());
    const r = { before: await lab() };
    await t.click(); await sleep(700); r.on = await lab(); r.rmsOn = await page.evaluate(() => Math.max(0, ...window.__rms()));
    await scroll(300); await sleep(300);
    const b = await bars(page); const p = await pps(page);
    await clickAt(page, b.x + 15.95 * p, b.y + 4); await sleep(700);
    r.afterEnd = await lab(); r.main = await S(page); r.exact = r.main.status === END16; r.rmsAfter = await page.evaluate(() => Math.max(0, ...window.__rms()));
    await page.screenshot({ path: path.join(outDir, `preview-end-${key}.png`) });
    r.errors = errors; await ctx.close(); return r;
  },
  async staleStatus(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const scroll = (v) => page.evaluate((v) => { document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft = v; }, v);
    await scroll(400); await sleep(300);
    const b = await bars(page); const p = await pps(page);
    await clickAt(page, b.x + 20 * p, b.y + 4); await sleep(500);
    const r = { at20: await S(page) };
    await scroll(0); await sleep(300); const b2 = await bars(page);
    await clickAt(page, b2.x + 2 * p, b2.y + 4); await sleep(1000);
    r.thenStrip2 = await S(page);
    await page.screenshot({ path: path.join(outDir, `stale-status-${key}.png`) });
    r.errors = errors; await ctx.close(); return r;
  },
  async loop14(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const scroll = (v) => page.evaluate((v) => { document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft = v; }, v);
    await scroll(300); await sleep(300);
    const clip = page.locator('[data-clip-kind="audio"]').first(); const cb = await clip.boundingBox(); const p = cb.width / 16;
    await page.mouse.move(cb.x + 14 * p, cb.y + cb.height - 6); await page.mouse.down(); for (let i = 1; i <= 10; i += 1) await page.mouse.move(cb.x + (14 + 0.19 * i) * p, cb.y + cb.height - 6); await page.mouse.up(); await sleep(300);
    await page.keyboard.press('Control+l'); await sleep(400);
    await page.keyboard.press('Escape'); await page.mouse.click(5, 5); await sleep(200);
    const eb = await page.locator('[data-testid="arrangement-loop-end-edge"]').first().boundingBox(); const ex = eb.x + eb.width / 2; const ey = eb.y + eb.height / 2;
    await page.mouse.move(ex, ey); await page.mouse.down(); for (let i = 1; i <= 10; i += 1) await page.mouse.move(ex + i * 0.2 * p, ey); await page.mouse.up(); await sleep(400);
    const r = { loop: await page.evaluate(() => document.querySelector('[data-testid="arrangement-loop-times"]').textContent) };
    const b = await bars(page);
    const st0 = await page.evaluate(() => window.__starts.length);
    const s = await clickAndSample(page, b.x + 15.95 * p, b.y + 4, 3000);
    r.starts = await page.evaluate((n) => window.__starts.slice(n).filter((x) => !x.offline).map((x) => ({ offset: +x.offset.toFixed(3), when: +x.when.toFixed(3), ctxTime: +x.ctxTime.toFixed(3) })), st0);
    r.pos = s.samples.filter((_, i) => i % 5 === 0).map((x) => [Math.round(x.dt), x.pos, x.label]);
    r.status = (await S(page)).status;
    r.errors = errors; await ctx.close(); return r;
  },
  async dblStrip(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    await page.evaluate(() => { window.__ev = []; const br = document.querySelector('[data-testid="arrangement-bars-ruler"]'); for (const t of ['pointerdown', 'pointerup', 'click', 'dblclick']) br.addEventListener(t, (e) => window.__ev.push(`${t}:${e.target.getAttribute('data-testid')}`), true); });
    const b = await bars(page); const p = await pps(page);
    const r = { pps: p, before: await S(page) };
    await page.screenshot({ path: path.join(outDir, `shot-before-${key}.png`) });
    const st0 = await page.evaluate(() => { window.__labels = []; return window.__starts.length; });
    const n0 = await page.evaluate(() => window.__up.length);
    await page.mouse.dblclick(b.x + 3 * p, b.y + 4);
    const samples = []; const t1 = Date.now();
    while (Date.now() - t1 < 900) { samples.push(await page.evaluate((n) => { const h = document.querySelector('[data-testid="arrangement-playhead-handle"]'); const up = window.__up[n]; return { dt: up ? performance.now() - up.t : null, pos: Number(h.getAttribute('aria-valuenow')), label: window.__playBtn.getAttribute('aria-label') }; }, n0 + 1)); await sleep(60); }
    r.samples = samples;
    r.events = await page.evaluate(() => window.__ev);
    r.labels = await page.evaluate(() => window.__labels);
    r.liveStarts = await page.evaluate((n) => window.__starts.slice(n).filter((x) => !x.offline).map((x) => ({ offset: +x.offset.toFixed(4), when: x.when, ctxTime: x.ctxTime })), st0);
    r.after = await S(page);
    r.rms = await page.evaluate(() => Math.max(0, ...window.__rms()));
    r.impliedStart = samples.filter((x) => x.label === 'Pause' && x.dt > 300).map((x) => +(x.pos - x.dt / 1000).toFixed(3));
    await page.screenshot({ path: path.join(outDir, `shot-after-strip-dbl-${key}.png`) });
    r.errors = errors; await ctx.close(); return r;
  },
  async dblLower(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    let b = await bars(page);
    await page.mouse.dblclick(b.x + 6 * 40, b.y + 15); await sleep(500);
    const r = { stopped: await S(page) };
    await page.keyboard.press('x'); await sleep(300); await page.mouse.click(5, 5); await sleep(200);
    r.afterX = await S(page);
    await page.keyboard.press('Space'); await sleep(500);
    b = await bars(page);
    await page.evaluate(() => { window.__labels = []; });
    await page.mouse.dblclick(b.x + 6 * 40, b.y + 15); await sleep(500);
    r.playing = await S(page); r.playingLabels = await page.evaluate(() => window.__labels);
    await page.keyboard.press('x'); await sleep(300); await page.mouse.click(5, 5); await page.keyboard.press('Space'); await sleep(300);
    const b3 = await bars(page); const x0 = b3.x + 500; const y0 = b3.y + 15;
    await page.mouse.move(x0, y0); await page.mouse.down(); for (let i = 1; i <= 6; i += 1) await page.mouse.move(x0 - i * 20, y0); await page.mouse.up();
    const afterDrag = await S(page);
    await page.mouse.dblclick(x0 - 120, y0); await sleep(500);
    r.guard = { afterDrag, afterDbl: await S(page) };
    // strip press-then-drag then strip dblclick within 300ms
    const b4 = await bars(page); const y4 = b4.y + 4; const x4 = b4.x + 500;
    await page.mouse.move(x4, y4); await page.mouse.down(); for (let i = 1; i <= 6; i += 1) await page.mouse.move(x4 - i * 20, y4); await page.mouse.up();
    const st0 = await page.evaluate(() => window.__starts.length);
    const afterStripDrag = await S(page);
    await page.mouse.dblclick(x4 - 120, y4); await sleep(500);
    r.stripGuard = { afterStripDrag, afterDbl: await S(page), liveStarts: await page.evaluate((n) => window.__starts.slice(n).filter((x) => !x.offline).map((x) => +x.offset.toFixed(3)), st0) };
    r.errors = errors; await ctx.close(); return r;
  },
  async end(browser, vp, key) {
    const r = {};
    const scroll = (page, v) => page.evaluate((v) => { document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft = v; }, v);
    {
      const { ctx, page, errors } = await open(browser, vp);
      await addBtn(page, 'demo-stem-pulse');
      await scroll(page, 300); await sleep(400);
      const b = await bars(page); const p = await pps(page);
      const st0 = await page.evaluate(() => window.__starts.length);
      const s = await clickAndSample(page, b.x + 15.95 * p, b.y + 4, 900);
      r.click = { ...(await S(page)), labels: s.labels, anyPause: s.samples.some((x) => x.label === 'Pause'), liveStarts: await page.evaluate((n) => window.__starts.slice(n).filter((x) => !x.offline).length, st0) };
      r.clickExact = r.click.status === END16;
      const st1 = await page.evaluate(() => window.__starts.length);
      await page.keyboard.press('Space'); await sleep(600);
      r.space = { ...(await S(page)), liveStarts: await page.evaluate((n) => window.__starts.slice(n).filter((x) => !x.offline).map((x) => +x.offset.toFixed(3)), st1) };
      await page.keyboard.press('Space'); await sleep(200);
      await page.screenshot({ path: path.join(outDir, `end-${key}.png`) });
      r.errors1 = errors; await ctx.close();
    }
    {
      // space-related neighbours: Space past the end, Space at end
      const { ctx, page, errors } = await open(browser, vp);
      await addBtn(page, 'demo-stem-pulse');
      await scroll(page, 400); await sleep(300);
      const sr = await secs(page); const p = await pps(page);
      await clickAt(page, sr.x + 20 * p, sr.y + 14); await sleep(300);
      await page.mouse.click(5, 5);
      await page.keyboard.press('Space'); await sleep(500);
      r.spacePastEnd = await S(page);
      r.errors2 = errors; await ctx.close();
    }
    {
      // loop 2-6 active, strip at 15.95 -> not playing; strip at 3 -> plays and wraps
      const { ctx, page, errors } = await open(browser, vp);
      await addBtn(page, 'demo-stem-pulse');
      const clip = page.locator('[data-clip-kind="audio"]').first(); const cb = await clip.boundingBox(); const p = cb.width / 16;
      await page.mouse.move(cb.x + 2 * p, cb.y + cb.height - 6); await page.mouse.down(); for (let i = 1; i <= 10; i += 1) await page.mouse.move(cb.x + (2 + 0.4 * i) * p, cb.y + cb.height - 6); await page.mouse.up(); await sleep(300);
      await page.keyboard.press('Control+l'); await sleep(400);
      r.loop26Status = (await S(page)).status;
      await page.keyboard.press('Escape'); await page.mouse.click(5, 5); await sleep(200);
      await scroll(page, 300); await sleep(300);
      let b = await bars(page);
      const s = await clickAndSample(page, b.x + 15.95 * p, b.y + 4, 700);
      r.loop26End = { ...(await S(page)), anyPause: s.samples.some((x) => x.label === 'Pause'), labels: s.labels };
      r.loop26EndExact = r.loop26End.status === END16;
      await scroll(page, 0); await sleep(300); b = await bars(page);
      const s2 = await clickAndSample(page, b.x + 3 * p, b.y + 4, 4200);
      r.loop26At3 = { maxPos: Math.max(...s2.samples.map((x) => x.pos)), minPosLate: Math.min(...s2.samples.filter((x) => x.dt > 3200).map((x) => x.pos)), last: s2.samples.at(-1) };
      await page.keyboard.press('Space'); await sleep(200);
      r.errors3 = errors; await ctx.close();
    }
    {
      // try a loop that reaches past the project end (14-18): select 14-16 on the clip, Ctrl+L, drag the loop end edge right by 2 s
      const { ctx, page, errors } = await open(browser, vp);
      await addBtn(page, 'demo-stem-pulse');
      await scroll(page, 300); await sleep(300);
      const clip = page.locator('[data-clip-kind="audio"]').first(); const cb = await clip.boundingBox(); const p = cb.width / 16;
      await page.mouse.move(cb.x + 14 * p, cb.y + cb.height - 6); await page.mouse.down(); for (let i = 1; i <= 10; i += 1) await page.mouse.move(cb.x + (14 + 0.19 * i) * p, cb.y + cb.height - 6); await page.mouse.up(); await sleep(300);
      await page.keyboard.press('Control+l'); await sleep(400);
      r.loop14Status = (await S(page)).status;
      await page.keyboard.press('Escape'); await page.mouse.click(5, 5); await sleep(200);
      const edge = page.locator('[data-testid="arrangement-loop-end-edge"]').first();
      if (await edge.count()) {
        const eb = await edge.boundingBox(); const ex = eb.x + eb.width / 2; const ey = eb.y + eb.height / 2;
        await page.mouse.move(ex, ey); await page.mouse.down(); for (let i = 1; i <= 10; i += 1) await page.mouse.move(ex + i * 0.2 * p, ey); await page.mouse.up(); await sleep(400);
        r.loop14Times = await page.evaluate(() => (document.querySelector('[data-testid="arrangement-loop-times"]') || {}).textContent || null);
        r.loop14AfterEdge = (await S(page)).status;
      } else r.loop14Times = 'no end edge';
      const b = await bars(page);
      const st0 = await page.evaluate(() => window.__starts.length);
      const s = await clickAndSample(page, b.x + 15.95 * p, b.y + 4, 1200);
      r.loop14Click = { ...(await S(page)), anyPause: s.samples.some((x) => x.label === 'Pause'), liveStarts: await page.evaluate((n) => window.__starts.slice(n).filter((x) => !x.offline).map((x) => +x.offset.toFixed(3)), st0), maxPos: Math.max(...s.samples.map((x) => x.pos)) };
      r.errors4 = errors; await ctx.close();
    }
    {
      // library preview running, strip click at the end -> preview stopped, not playing, past-end status
      const { ctx, page, errors } = await open(browser, vp);
      await addBtn(page, 'demo-stem-pulse');
      await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(300);
      const t = page.locator('[data-testid="arrangement-library-preview-toggle"]');
      const lab = () => t.evaluate((x) => ({ label: x.getAttribute('aria-label'), pressed: x.getAttribute('aria-pressed') }));
      r.previewBefore = await lab();
      await t.click(); await sleep(700); r.previewOn = await lab();
      await scroll(page, 300); await sleep(300);
      const b = await bars(page); const p = await pps(page);
      await clickAt(page, b.x + 15.95 * p, b.y + 4); await sleep(600);
      r.previewAfterEnd = await lab(); r.previewMain = await S(page); r.previewExact = r.previewMain.status === END16;
      // and preview + strip click inside -> preview stops, playback starts
      await t.click(); await sleep(700); r.previewOn2 = await lab();
      await scroll(page, 0); await sleep(300); const b2 = await bars(page);
      await clickAt(page, b2.x + 2 * p, b2.y + 4); await sleep(600);
      r.previewAfterInside = await lab(); r.previewMain2 = await S(page);
      await page.screenshot({ path: path.join(outDir, `preview-end-${key}.png`) });
      r.errors5 = errors; await ctx.close();
    }
    return r;
  },
  async race(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const b = await bars(page); const p = await pps(page);
    await page.evaluate(() => { window.__labels = []; window.__st = []; const s = document.querySelector('[data-testid="arrangement-status"]'); new MutationObserver(() => window.__st.push(s.textContent)).observe(s, { childList: true, subtree: true, characterData: true }); });
    const st0 = await page.evaluate(() => window.__starts.length);
    const ts = [];
    for (let k = 1; k <= 10; k += 1) { ts.push(Date.now()); await page.mouse.click(b.x + k * p, b.y + 4); await sleep(80); }
    await sleep(400);
    const r = { intervals: ts.slice(1).map((t, i) => t - ts[i]), labels: await page.evaluate(() => window.__labels), statuses: await page.evaluate(() => window.__st), final: await S(page) };
    r.playLabelSeen = r.labels.some((x) => x.label === 'Play');
    r.fitSeen = r.statuses.some((x) => x.startsWith('Fit:'));
    r.liveStarts = await page.evaluate((n) => window.__starts.slice(n).filter((x) => !x.offline).map((x) => +x.offset.toFixed(3)), st0);
    r.errors = errors; await ctx.close(); return r;
  },
  async spaceEmpty(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await page.mouse.click(5, 5);
    await page.keyboard.press('Space'); await sleep(400);
    const r = { s: await S(page) };
    r.exact = r.s.status === NOTHING;
    r.errors = errors; await ctx.close(); return r;
  },
  async noTempoDbl(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-soft-impact');
    const r = await page.evaluate(() => { const br = document.querySelector('[data-testid="arrangement-bars-ruler"]'); return { strips: document.querySelectorAll('[data-testid="arrangement-bars-scrub-strip"]').length, title: br.getAttribute('title'), cursor: getComputedStyle(br).cursor }; });
    r.s0 = await S(page);
    const b = await bars(page);
    await page.mouse.dblclick(b.x + 200, b.y + 4); await sleep(500); r.dbl4 = await S(page);
    await page.mouse.dblclick(b.x + 240, b.y + 15); await sleep(500); r.dbl15 = await S(page);
    r.errors = errors; await ctx.close(); return r;
  },

  async stripStopped(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const b = await bars(page); const p = await pps(page);
    const r = { tempo: await page.inputValue('[data-testid="arrangement-tempo-input"]'), pps: p, before: await S(page), rmsIdle: await page.evaluate(() => Math.max(0, ...window.__rms())) };
    const starts0 = await page.evaluate(() => window.__starts.length);
    const s = await clickAndSample(page, b.x + 4.1 * p, b.y + 4, 1200);
    r.samples = s.samples; r.labels = s.labels;
    r.liveStarts = await page.evaluate((n) => window.__starts.slice(n).filter((x) => !x.offline).map((x) => ({ offset: x.offset, when: x.when, ctxTime: x.ctxTime })), starts0);
    const firstPause = s.samples.find((x) => x.label === 'Pause');
    r.playingWithinMs = firstPause ? firstPause.dt : null;
    r.minPosWhilePlaying = Math.min(...s.samples.filter((x) => x.label === 'Pause').map((x) => x.pos));
    r.impliedStart = s.samples.filter((x) => x.label === 'Pause' && x.dt > 300).map((x) => +(x.pos - x.dt / 1000).toFixed(3));
    r.maxRms = Math.max(...s.samples.map((x) => x.rms));
    await page.screenshot({ path: path.join(outDir, `strip-stopped-${key}.png`) });
    r.errors = errors; await ctx.close(); return r;
  },
  async stripPlaying(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const b = await bars(page); const p = await pps(page);
    await clickAt(page, b.x + 1.0 * p, b.y + 4); await sleep(900);
    const r = { before: await S(page) };
    const toggles0 = await page.evaluate(() => window.__starts.length);
    const s = await clickAndSample(page, b.x + 8.2 * p, b.y + 4, 900);
    r.samples = s.samples; r.labels = s.labels;
    r.labelNotPlay = s.samples.every((x) => x.label === 'Pause') && s.labels.every((x) => x.label === 'Pause');
    r.offsetErr = s.samples.filter((x) => x.dt > 150).map((x) => +((x.pos - 8 - x.dt / 1000) * 1000).toFixed(1));
    r.liveStarts = await page.evaluate((n) => window.__starts.slice(n).filter((x) => !x.offline).map((x) => x.offset), toggles0);
    r.maxRms = Math.max(...s.samples.map((x) => x.rms));
    r.errors = errors; await ctx.close(); return r;
  },
  async lower(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const b = await bars(page); const p = await pps(page);
    await clickAt(page, b.x + 6.3 * p, b.y + 15); await sleep(500);
    const r = { stopped: await S(page) };
    await page.keyboard.press('Space'); await sleep(700);
    r.playingBefore = await S(page);
    const s = await clickAndSample(page, b.x + 10.2 * p, b.y + 15, 900);
    r.labelsDuring = s.labels; r.allPause = s.samples.every((x) => x.label === 'Pause');
    r.offsetErr = s.samples.filter((x) => x.dt > 150).map((x) => +((x.pos - 10 - x.dt / 1000) * 1000).toFixed(1));
    r.errors = errors; await ctx.close(); return r;
  },
  async alt(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const b = await bars(page); const p = await pps(page);
    const st0 = await page.evaluate(() => window.__starts.length);
    const s = await clickAndSample(page, b.x + 4.3 * p, b.y + 4, 900, ['Alt']);
    const r = { liveStarts: await page.evaluate((n) => window.__starts.slice(n).filter((x) => !x.offline).map((x) => x.offset), st0), impliedStart: s.samples.filter((x) => x.label === 'Pause' && x.dt > 300).map((x) => +(x.pos - x.dt / 1000).toFixed(3)), playing: s.samples.at(-1).label };
    await page.keyboard.press('Space'); await sleep(400);
    await clickAt(page, b.x + 6.3 * p, b.y + 15, ['Alt']); await sleep(400);
    r.lowerAlt = await S(page);
    r.errors = errors; await ctx.close(); return r;
  },
  async drag(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const r = { s0: await S(page) };
    const drag = async (y, dx, dy) => {
      const b = await bars(page); const x0 = b.x + 600; const y0 = b.y + y;
      await page.mouse.move(x0, y0); await page.mouse.down();
      for (let i = 1; i <= 10; i += 1) await page.mouse.move(x0 + (dx * i) / 10, y0 + (dy * i) / 10);
      await page.mouse.up(); await sleep(500);
      return S(page);
    };
    r.lowerH = await drag(15, -200, 0);
    r.stripH = await drag(4, -200, 0);
    r.vert = await drag(15, 0, 60);
    r.starts = await page.evaluate(() => window.__starts.filter((x) => !x.offline).length);
    r.errors = errors; await ctx.close(); return r;
  },
  async dbl(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const b = await bars(page);
    await page.mouse.dblclick(b.x + 300, b.y + 15); await sleep(500);
    const r = { lower: await S(page) };
    await page.keyboard.press('x'); await sleep(300);
    await page.mouse.click(5, 5); await sleep(200);
    const b2 = await bars(page);
    await page.mouse.dblclick(b2.x + 300, b2.y + 4); await sleep(500);
    r.strip = await S(page);
    // drag-then-dblclick guard on bars ruler
    await page.keyboard.press('x'); await sleep(300);
    const b3 = await bars(page); const x0 = b3.x + 500; const y0 = b3.y + 15;
    await page.mouse.move(x0, y0); await page.mouse.down(); for (let i = 1; i <= 6; i += 1) await page.mouse.move(x0 - i * 20, y0); await page.mouse.up();
    const afterDrag = await S(page);
    await page.mouse.dblclick(x0 - 120, y0); await sleep(500);
    r.guard = { afterDrag, afterDbl: await S(page) };
    r.errors = errors; await ctx.close(); return r;
  },
  async edge(browser, vp, key) {
    const r = {};
    {
      const { ctx, page, errors } = await open(browser, vp);
      await addBtn(page, 'demo-stem-pulse');
      await page.evaluate(() => { document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft = 400; }); await sleep(400);
      const b = await bars(page); const p = await pps(page);
      await clickAt(page, b.x + 20 * p, b.y + 4); await sleep(700);
      r.pastEnd = await S(page); r.pastEndExact = r.pastEnd.status === PLAYPASTEND || (r.pastEnd.status || '').includes(PLAYPASTEND);
      r.pastEndErrors = errors; await ctx.close();
    }
    {
      const { ctx, page, errors } = await open(browser, vp);
      await setTempo(page, '90');
      await page.mouse.click(5, 5);
      const b = await bars(page);
      await clickAt(page, b.x + 100, b.y + 4); await sleep(600);
      r.empty = await S(page); r.emptyExact = (r.empty.status || '').includes(NOTHING);
      r.emptyErrors = errors; await ctx.close();
    }
    {
      // strip click that snaps to exactly the project end (16.000)
      const { ctx, page, errors } = await open(browser, vp);
      await addBtn(page, 'demo-stem-pulse');
      await page.evaluate(() => { document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft = 300; }); await sleep(400);
      const b = await bars(page); const p = await pps(page);
      const s = await clickAndSample(page, b.x + 15.95 * p, b.y + 4, 900);
      r.atEnd = { first: s.samples[0], last: s.samples.at(-1), status: (await S(page)).status };
      r.atEndErrors = errors; await ctx.close();
    }
    return r;
  },
  async noTempo(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-soft-impact');
    const r = await page.evaluate(() => { const br = document.querySelector('[data-testid="arrangement-bars-ruler"]'); return { strips: document.querySelectorAll('[data-testid="arrangement-bars-scrub-strip"]').length, title: br.getAttribute('title'), cursor: getComputedStyle(br).cursor, touch: getComputedStyle(br).touchAction, text: br.textContent, bpm: br.getAttribute('data-bpm') }; });
    r.s0 = await S(page);
    const b = await bars(page);
    await clickAt(page, b.x + 200, b.y + 4); await sleep(400); r.afterStrip = await S(page);
    await clickAt(page, b.x + 240, b.y + 15); await sleep(400); r.afterLower = await S(page);
    await page.mouse.move(b.x + 600, b.y + 15); await page.mouse.down(); for (let i = 1; i <= 10; i += 1) await page.mouse.move(b.x + 600 - i * 20, b.y + 15); await page.mouse.up(); await sleep(400);
    r.afterDrag = await S(page);
    r.errors = errors; await ctx.close(); return r;
  },
  async seconds(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const s = await secs(page); const p = await pps(page);
    const r = { title: await page.getAttribute('[data-testid="arrangement-ruler"]', 'title') };
    await clickAt(page, s.x + 3.175 * p, s.y + 14); await sleep(400);
    r.click = await S(page);
    // pan drag on seconds ruler
    const x0 = s.x + 600; const y0 = s.y + 14;
    await page.mouse.move(x0, y0); await page.mouse.down(); for (let i = 1; i <= 10; i += 1) await page.mouse.move(x0 - i * 20, y0); await page.mouse.up(); await sleep(400);
    r.pan = await S(page);
    await page.mouse.move(x0, y0); await page.mouse.down(); for (let i = 1; i <= 10; i += 1) await page.mouse.move(x0, y0 + i * 6); await page.mouse.up(); await sleep(400);
    r.zoom = await S(page);
    // drag-then-dblclick guard
    await page.mouse.move(x0, y0); await page.mouse.down(); for (let i = 1; i <= 6; i += 1) await page.mouse.move(x0 + i * 20, y0); await page.mouse.up();
    const pre = await S(page);
    await page.mouse.dblclick(x0 + 120, y0); await sleep(400);
    r.guard = { pre, post: await S(page) };
    await sleep(500);
    const s2 = await secs(page);
    await page.mouse.dblclick(s2.x + 200, s2.y + 14); await sleep(500);
    r.dblFit = await S(page);
    // playhead handle drag + arrows
    await page.keyboard.press('Home'); await sleep(300);
    const h = await page.locator('[data-testid="arrangement-playhead-handle"]').boundingBox();
    const hx = h.x + h.width / 2; const hy = h.y + h.height / 2;
    await page.mouse.move(hx, hy); await page.mouse.down(); for (let i = 1; i <= 10; i += 1) await page.mouse.move(hx + i * 10, hy); await page.mouse.up(); await sleep(300);
    r.handleDrag = await S(page);
    await page.locator('[data-testid="arrangement-playhead-handle"]').focus(); await page.keyboard.press('ArrowRight'); await sleep(300);
    r.handleArrow = await S(page);
    r.errors = errors; await ctx.close(); return r;
  },
  async zones(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await addBtn(page, 'demo-stem-pulse');
    const b = await bars(page);
    const x = b.x + 300;
    const r = await page.evaluate(({ x, y }) => {
      const at4 = document.elementFromPoint(x, y + 4); const at15 = document.elementFromPoint(x, y + 15); const at9 = document.elementFromPoint(x, y + 9.5); const at11 = document.elementFromPoint(x, y + 10.5);
      const st = document.querySelector('[data-testid="arrangement-bars-scrub-strip"]'); const br = document.querySelector('[data-testid="arrangement-bars-ruler"]');
      const sr = st.getBoundingClientRect(); const rr = br.getBoundingClientRect();
      return { at4: at4 && at4.getAttribute('data-testid'), at9: at9 && at9.getAttribute('data-testid'), at11: at11 && at11.getAttribute('data-testid'), at15: at15 && at15.getAttribute('data-testid'), stripH: getComputedStyle(st).height, stripW: sr.width, rulerW: rr.width, stripTop: sr.top - rr.top, stripTitle: st.getAttribute('title'), stripAria: st.getAttribute('aria-hidden'), rulerTitle: br.getAttribute('title'), cursorStrip: getComputedStyle(st).cursor, cursorRuler: getComputedStyle(br).cursor, touch: getComputedStyle(br).touchAction, bgRest: getComputedStyle(st).backgroundColor, strips: document.querySelectorAll('[data-testid="arrangement-bars-scrub-strip"]').length, text: st.textContent };
    }, { x, y: b.y });
    await page.mouse.move(x, b.y + 4); await sleep(300);
    r.bgHover = await page.evaluate(() => getComputedStyle(document.querySelector('[data-testid="arrangement-bars-scrub-strip"]')).backgroundColor);
    await page.screenshot({ path: path.join(outDir, `zone-strip-hover-${key}.png`), clip: { x: Math.max(0, x - 200), y: b.y - 30, width: 400, height: 70 } });
    await page.mouse.move(x, b.y + 15); await sleep(300);
    r.bgLowerHover = await page.evaluate(() => getComputedStyle(document.querySelector('[data-testid="arrangement-bars-scrub-strip"]')).backgroundColor);
    await page.screenshot({ path: path.join(outDir, `zone-lower-hover-${key}.png`), clip: { x: Math.max(0, x - 200), y: b.y - 30, width: 400, height: 70 } });
    await page.mouse.move(x, b.y + 4); await sleep(200);
    await page.screenshot({ path: path.join(outDir, `full-seeded-strip-hover-${key}.png`) });
    r.errors = errors; await ctx.close(); return r;
  },
  async sheet(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await page.mouse.click(5, 5);
    await page.keyboard.press('Shift+Slash'); await sleep(500);
    const dlg = page.getByRole('dialog');
    const r = { open: await dlg.count() };
    r.text = (await dlg.first().innerText()).slice(0, 3000);
    const t = r.text; r.order = { back: t.indexOf('Back to start'), play: t.indexOf('Play from a point (needs a BPM)'), keys: t.indexOf('Click the top strip of the bars ruler'), loop: t.indexOf('Loop the selection') };
    await page.screenshot({ path: path.join(outDir, `sheet-${key}.png`) });
    const filt = dlg.locator('input').first();
    if (await filt.count()) { await filt.fill('play'); await sleep(300); r.filtered = (await dlg.first().innerText()).slice(0, 1500); await page.screenshot({ path: path.join(outDir, `sheet-filter-${key}.png`) }); }
    r.errors = errors; await ctx.close(); return r;
  },
  async budget(browser, vp, key) {
    const out = {};
    for (const [tag, base] of [['head', HEAD_BASE], ['work', BASE]]) {
      for (const id of [null, 'demo-stem-pulse']) {
        const { ctx, page } = await open(browser, vp, base);
        if (id) await addBtn(page, id); else { await page.mouse.click(5, 5); await sleep(200); }
        out[`${tag}-${id || 'empty'}`] = await inventory(page);
        await page.screenshot({ path: path.join(outDir, `budget-${tag}-${id || 'empty'}-${key}.png`) });
        await ctx.close();
      }
    }
    const res = {};
    for (const st of ['empty', 'demo-stem-pulse']) {
      const a = out[`head-${st}`]; const b = out[`work-${st}`];
      res[st] = { head: a.length, work: b.length, onlyWork: b.filter((x) => !a.includes(x)), onlyHead: a.filter((x) => !b.includes(x)) };
    }
    return res;
  },
  async neighbours(browser, vp, key) {
    const r = {};
    {
      // follow pause on bars drag during playback
      const { ctx, page, errors } = await open(browser, vp);
      await addBtn(page, 'demo-stem-pulse');
      r.followBtn = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /follow/i.test(b.getAttribute('aria-label') || b.textContent || b.title)).map((b) => ({ label: b.getAttribute('aria-label'), pressed: b.getAttribute('aria-pressed'), text: b.textContent.trim().slice(0, 30), title: b.title })));
      await page.keyboard.press('Space'); await sleep(500);
      const b = await bars(page); const x0 = b.x + 600; const y0 = b.y + 15;
      await page.mouse.move(x0, y0); await page.mouse.down(); for (let i = 1; i <= 10; i += 1) await page.mouse.move(x0 - i * 20, y0); await page.mouse.up(); await sleep(300);
      r.followAfterBarsDrag = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => /follow/i.test(b.getAttribute('aria-label') || b.textContent || b.title)).map((b) => ({ pressed: b.getAttribute('aria-pressed'), cls: b.getAttribute('data-follow') || b.getAttribute('data-state') })));
      r.followStatus = (await S(page)).status; r.followPlaying = (await S(page)).label;
      r.followErrors = errors; await ctx.close();
    }
    {
      // loop: set a time selection 2..6 on the clip with the seconds ruler? use L on a selection via clip select + L
      const { ctx, page, errors } = await open(browser, vp);
      await addBtn(page, 'demo-stem-pulse');
      const clip = page.locator('[data-clip-kind="audio"]').first(); const cb = await clip.boundingBox(); const p = cb.width / 16;
      await page.mouse.move(cb.x + 2 * p, cb.y + cb.height - 6); await page.mouse.down(); for (let i = 1; i <= 10; i += 1) await page.mouse.move(cb.x + (2 + 0.4 * i) * p, cb.y + cb.height - 6); await page.mouse.up(); await sleep(300);
      r.selStatus = (await S(page)).status;
      await page.keyboard.press('Control+l'); await sleep(400);
      r.loopStatus = (await S(page)).status;
      r.loopAttr = await page.evaluate(() => { const l = document.querySelector('[data-testid*="loop"]'); return l ? { id: l.getAttribute('data-testid'), active: l.getAttribute('data-loop-active') || l.getAttribute('aria-pressed') } : null; });
      await page.keyboard.press('Escape'); await page.mouse.click(5, 5); await sleep(200);
      const b = await bars(page);
      const s = await clickAndSample(page, b.x + 3 * p, b.y + 4, 4500);
      r.loopInside = { maxPos: Math.max(...s.samples.map((x) => x.pos)), minPosLate: Math.min(...s.samples.filter((x) => x.dt > 3200).map((x) => x.pos)), last: s.samples.at(-1) };
      await page.keyboard.press('Space'); await sleep(300);
      const s2 = await clickAndSample(page, b.x + 9 * p, b.y + 4, 1500);
      r.loopOutside = { first: s2.samples[2], last: s2.samples.at(-1), status: (await S(page)).status };
      r.loopErrors = errors; await ctx.close();
    }
    {
      // library preview stops on strip click
      const { ctx, page, errors } = await open(browser, vp);
      await addBtn(page, 'demo-stem-pulse');
      const prev = page.locator('[data-testid="arrangement-library-preview"] button').first();
      r.previewBtn = await prev.count() ? await prev.getAttribute('aria-label') : null;
      if (await prev.count()) { await prev.click(); await sleep(700); r.previewBefore = await page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-library-preview"] button')].map((b) => b.getAttribute('aria-label'))); }
      const b = await bars(page); const p = await pps(page);
      await clickAt(page, b.x + 2 * p, b.y + 4); await sleep(600);
      r.previewAfter = await page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-library-preview"] button')].map((b) => b.getAttribute('aria-label')));
      r.previewMain = await S(page);
      r.previewErrors = errors; await ctx.close();
    }
    {
      // longtask observer during strip-started playback
      const { ctx, page, errors } = await open(browser, vp);
      await addBtn(page, 'demo-stem-pulse');
      await page.evaluate(() => { window.__lt = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({ type: 'longtask', buffered: false }); });
      const b = await bars(page); const p = await pps(page);
      await clickAt(page, b.x + 1 * p, b.y + 4); await sleep(3000);
      r.longTasks = await page.evaluate(() => window.__lt);
      r.perfErrors = errors; await ctx.close();
    }
    return r;
  },
  async smoke(browser, vp, key) {
    const { ctx, page, errors } = await open(browser, vp);
    await page.screenshot({ path: path.join(outDir, `full-empty-${key}.png`) });
    await addBtn(page, 'demo-stem-pulse');
    await page.screenshot({ path: path.join(outDir, `full-seeded-${key}.png`) });
    const r = { s0: await S(page) };
    await page.keyboard.press('Space'); await sleep(800); r.afterSpace = await S(page);
    r.rms = await page.evaluate(() => Math.max(0, ...window.__rms()));
    await page.keyboard.press('Space'); await sleep(400); r.afterSpace2 = await S(page);
    await page.getByRole('button', { name: 'Export', exact: true }).first().click();
    const dlg = page.getByRole('dialog'); await dlg.waitFor(); r.dialog = true;
    const dlP = page.waitForEvent('download', { timeout: 90000 });
    await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const dl = await dlP; const file = path.join(outDir, `export-${key}.wav`); await dl.saveAs(file);
    r.wav = wavInfo(fs.readFileSync(file)); fs.unlinkSync(file);
    r.errors = errors; await ctx.close(); return r;
  },
  async headLatency(browser, vp, key) {
    const out = {};
    for (const [tag, base] of [['head', HEAD_BASE], ['work', BASE]]) {
      const { ctx, page, errors } = await open(browser, vp, base);
      await addBtn(page, 'demo-stem-pulse');
      const p = await pps(page);
      await page.keyboard.press('Space'); await sleep(700);
      const sr = await secs(page);
      const st0 = await page.evaluate(() => window.__starts.length);
      const s = await clickAndSample(page, sr.x + 8 * p, sr.y + 14, 900);
      out[tag] = { liveStarts: await page.evaluate((n) => window.__starts.slice(n).filter((x) => !x.offline).map((x) => x.offset), st0), offsetErr: s.samples.filter((x) => x.dt > 150).map((x) => +((x.pos - 8 - x.dt / 1000) * 1000).toFixed(1)), errors };
      await ctx.close();
    }
    return out;
  },
  async auth(browser, vp, key) {
    const ctx = await browser.newContext({ viewport: vp });
    const page = await ctx.newPage();
    const r = {};
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
    await page.waitForSelector('[data-testid="arrangement-ruler"]', { timeout: 120000 });
    r.labWorkspace = true;
    r.labAuthUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' }); await sleep(3000);
    r.guard = await page.evaluate(() => ({ path: location.pathname, signIn: /Sign in required/i.test(document.body.innerText), audioSrc: document.querySelectorAll('audio[src]').length, workspace: !!document.querySelector('[data-testid=arrangement-ruler]') }));
    await page.screenshot({ path: path.join(outDir, `auth-guard-${key}.png`) });
    const api = `${BASE}/api/studio-token?product=middle-east&file=stem1.wav`;
    const a = await ctx.request.get(api, { failOnStatusCode: false });
    const b = await ctx.request.get(api, { headers: { Authorization: 'Bearer fake.c235' }, failOnStatusCode: false });
    r.tokenNoHeader = { status: a.status(), body: (await a.text()).slice(0, 160) };
    r.tokenFake = { status: b.status(), body: (await b.text()).slice(0, 160) };
    await ctx.close(); return r;
  },
};

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  R.chromium = browser.version();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const key = `${vp.width}x${vp.height}`;
    for (const [name, fn] of Object.entries(ROWS)) {
      if (filter && !filter.test(name)) continue;
      const t0 = Date.now();
      try { R.rows[`${name}@${key}`] = await fn(browser, vp, key); } catch (e) { R.rows[`${name}@${key}`] = { error: String(e).slice(0, 800) }; }
      R.rows[`${name}@${key}`].ms = Date.now() - t0;
      save();
      console.log(name, key, 'done', Date.now() - t0);
    }
  }
  await browser.close();
  R.finished = new Date().toISOString();
  save();
})();
