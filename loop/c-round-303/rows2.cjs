// C303: H-SECOND (no-BPM second source), H-BUDGET (empty + one clip, same method as c-round-302/budget2.cjs), H-JOURNEY.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path');
const BASE = 'http://127.0.0.1:5173'; const DIR = __dirname; const SH = path.join(DIR, 'shots');
const HINT = 'Drag a clip by its name bar to move it.'; const GEO = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const status = (p) => p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null);
async function waitReady(p) { await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 120000 }); await sleep(600); }
const blur = (p) => p.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
function wavInfo(file) {
  const buf = fs.readFileSync(file); const fmt = { riff: buf.toString('ascii', 0, 4), wave: buf.toString('ascii', 8, 12), audioFormat: buf.readUInt16LE(20), ch: buf.readUInt16LE(22), rate: buf.readUInt32LE(24), bits: buf.readUInt16LE(34) };
  let o = 12; let dataLen = 0; while (o < buf.length - 8) { const id = buf.toString('ascii', o, o + 4); const len = buf.readUInt32LE(o + 4); if (id === 'data') { dataLen = len; break; } o += 8 + len; }
  const bps = fmt.bits / 8; const frames = dataLen / (fmt.ch * bps); let peak = 0, nz = 0, n = 0, nan = 0, sumsq = 0;
  for (let i = o + 8; i + bps <= o + 8 + dataLen; i += bps) { let v; if (fmt.audioFormat === 3) v = buf.readFloatLE(i); else if (fmt.bits === 16) v = buf.readInt16LE(i) / 32768; else if (fmt.bits === 24) v = buf.readIntLE(i, 3) / 8388608; else v = buf.readInt32LE(i) / 2147483648; if (!Number.isFinite(v)) { nan++; continue; } const a = Math.abs(v); if (a > peak) peak = a; if (a > 0) nz++; sumsq += v * v; n++; }
  return { ...fmt, bytes: buf.length, dataLen, dataFits: o + 8 + dataLen <= buf.length, frames, durationS: frames / fmt.rate, peak, rmsDb: 20 * Math.log10(Math.sqrt(sumsq / Math.max(1, n)) || 1e-12), nonzeroFrac: nz / Math.max(1, n), nan };
}
const budget = (p) => p.evaluate(() => {
  const tl = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); const lines = []; const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = walker.nextNode())) { const t = n.textContent.trim(); if (!t) continue; const el = n.parentElement; if (!el) continue; if (tl && tl.contains(el)) continue; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const rg = document.createRange(); rg.selectNodeContents(n); const rects = Array.from(rg.getClientRects()).filter((q) => q.width > 0 && q.height > 0 && q.bottom > 0 && q.top < innerHeight && q.right > 0 && q.left < innerWidth); if (!rects.length) continue;
    let op = 1; for (let e = el; e; e = e.parentElement) op *= Number(getComputedStyle(e).opacity); if (op === 0) continue; const ys = new Set(rects.map((q) => Math.round(q.top))); ys.forEach((y) => lines.push(`${y}|${t.slice(0, 60)}`)); }
  return { count: lines.length, rows: new Set(lines.map((l) => l.split('|')[0])).size, lines };
});
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const out = { at: new Date().toISOString(), vp: {} };
  const base = { empty: JSON.parse(fs.readFileSync(path.join(DIR, '../c-round-302/budget.json'))), clip: JSON.parse(fs.readFileSync(path.join(DIR, '../c-round-302/budget-clip.json'))) };
  { const c = await b.newContext(); const p = await c.newPage(); await p.goto(`${BASE}/studio-lab`).catch(() => {}); await waitReady(p).catch(() => {}); await c.close(); }
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const k = `${w}x${h}`; const R = {}; out.vp[k] = R; const save = () => fs.writeFileSync(path.join(DIR, 'rows2.json'), JSON.stringify(out, null, 1));
    // H-SECOND with a no-BPM source
    { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); await p.goto(`${BASE}/studio-lab`); await waitReady(p); await blur(p); await p.keyboard.press('Enter'); await sleep(1300);
      const first = await status(p); const o = p.locator('[role=option][data-source-id="demo-hero-music"]'); await o.scrollIntoViewIfNeeded(); await o.focus(); await p.keyboard.press('Enter'); await sleep(1300);
      const s = await status(p); const clips = await p.evaluate(() => [...document.querySelectorAll('[data-clip-kind]')].map((c) => parseFloat(c.style.left)));
      R.second = { first, status: s, clips, nameBar: (s.match(/name bar/g) || []).length, plainExact: /^“Hero Music[^”]*” added to the Music track at \d\d:\d\d\.\d\d\d( \(nearest free spot\))?\.$/.test(s) };
      await p.screenshot({ path: path.join(SH, `second-nobpm-${k}.png`) }); await ctx.close(); save(); }
    // H-BUDGET empty + one clip
    { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); await p.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' }); await waitReady(p); await sleep(300);
      const e = await budget(p); await p.screenshot({ path: path.join(SH, `budget-empty-${k}.png`) });
      await p.locator('[role=option][data-source-id="demo-stem-pulse"]').focus(); await p.keyboard.press('Enter'); await sleep(1200); await blur(p); await sleep(400);
      const c = await budget(p); await p.screenshot({ path: path.join(SH, `budget-clip-${k}.png`) });
      const he = base.empty[`a-${k}`], hc = base.clip[`a-${k}`];
      R.budget = { empty: { rows: e.rows, count: e.count, headRows: he.rows, headCount: he.count, onlyNew: e.lines.filter((l) => !he.lines.includes(l)), onlyHead: he.lines.filter((l) => !e.lines.includes(l)) }, clip: { rows: c.rows, count: c.count, headRows: hc.rows, headCount: hc.count, onlyNew: c.lines.filter((l) => !hc.lines.includes(l)), onlyHead: hc.lines.filter((l) => !c.lines.includes(l)) } };
      await ctx.close(); save(); }
    // H-JOURNEY
    { const ctx = await b.newContext({ viewport: { width: w, height: h }, acceptDownloads: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160))); const J = { steps: [] }; R.journey = J;
      const step = async (name, fn) => { try { const v = await fn(); J.steps.push({ name, ok: true, v }); } catch (e) { J.steps.push({ name, ok: false, err: String(e).slice(0, 200) }); } await p.screenshot({ path: path.join(SH, `journey-${J.steps.length}-${name}-${k}.png`) }); save(); };
      await step('home', async () => { await p.goto(`${BASE}/`, { waitUntil: 'networkidle' }); return p.url(); });
      await step('nav-studio', async () => { const nav = p.locator('header a[href="/studio-lab"]').filter({ visible: true }).first(); const t = (await nav.textContent()).trim(); await nav.click(); await p.waitForURL(/studio-lab/); await waitReady(p); return t; });
      await step('enter-add', async () => { await blur(p); await p.keyboard.press('Enter'); await sleep(1300); const s = await status(p); if (!s.endsWith(` ${HINT}`)) throw new Error(`no hint: ${s}`); return s; });
      await step('namebar-move', async () => { const clip = p.locator('[data-clip-kind="audio"]').first(); const cb = await clip.boundingBox(); const x = cb.x + 60, y = cb.y + 9; const l0 = parseFloat(await clip.evaluate((c) => c.style.left)); await p.mouse.move(x, y); await p.mouse.down(); for (let i = 1; i <= 10; i++) { await p.mouse.move(x + i * 10, y); await sleep(16); } await p.mouse.up(); await sleep(500); const l1 = parseFloat(await clip.evaluate((c) => c.style.left)); if (Math.abs(l1 - l0 - 100) > 12) throw new Error(`moved ${l1 - l0}`); return { l0, l1, status: await status(p) }; });
      await step('play', async () => { await blur(p); await p.keyboard.press('Home').catch(() => {}); await p.keyboard.press('Space'); await sleep(300); const s0 = await p.evaluate(() => ({ st: document.querySelector('[data-testid="arrangement-playback-state"]')?.textContent, clock: document.querySelector('[data-testid="arrangement-transport-centre"]')?.innerText.replace(/\s+/g, ' ') })); await sleep(1300); const s1 = await p.evaluate(() => ({ st: document.querySelector('[data-testid="arrangement-playback-state"]')?.textContent, clock: document.querySelector('[data-testid="arrangement-transport-centre"]')?.innerText.replace(/\s+/g, ' '), status: document.querySelector('[data-testid="arrangement-status"]')?.textContent })); if (s0.clock === s1.clock) throw new Error('clock did not advance'); return { s0, s1 }; });
      await step('stop', async () => { await p.getByRole('button', { name: /^Stop/ }).first().click(); await sleep(500); return p.evaluate(() => ({ st: document.querySelector('[data-testid="arrangement-playback-state"]')?.textContent, status: document.querySelector('[data-testid="arrangement-status"]')?.textContent })); });
      await step('export-wav', async () => { await p.getByRole('button', { name: 'Export', exact: true }).first().click(); const dlg = p.getByRole('dialog'); await dlg.waitFor(); await sleep(400); const dlP = p.waitForEvent('download', { timeout: 180000 }); await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click(); const dl = await dlP; const f = path.join('/tmp', `c303-${k}.wav`); await dl.saveAs(f); const info = wavInfo(f); fs.unlinkSync(f); await sleep(800); if (await p.getByRole('dialog').count()) await p.keyboard.press('Escape'); await sleep(300); if (!(info.nonzeroFrac > 0 && info.peak > 0 && info.nan === 0)) throw new Error('silent wav'); return { name: dl.suggestedFilename(), info }; });
      await step('back-czaba', async () => { await p.locator('[data-testid="arrangement-exit"]').click(); await p.waitForURL((u) => new URL(u).pathname === '/', { timeout: 30000 }); return p.url(); });
      J.geo = []; J.errors = errs; await ctx.close(); save(); }
  }
  fs.writeFileSync(path.join(DIR, 'rows2.json'), JSON.stringify(out, null, 1)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
