import { createRequire } from 'node:module';
import { writeFileSync, readFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = 'http://127.0.0.1:5173';
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-338';
const res = { startedUtc: new Date().toISOString() };
function parseWav(buf) {
  const out = { riff: buf.toString('ascii', 0, 4), wave: buf.toString('ascii', 8, 12), bytes: buf.length }; let p = 12;
  while (p + 8 <= buf.length) {
    const id = buf.toString('ascii', p, p + 4); const size = buf.readUInt32LE(p + 4);
    if (id === 'fmt ') { out.format = buf.readUInt16LE(p + 8); out.channels = buf.readUInt16LE(p + 10); out.rate = buf.readUInt32LE(p + 12); out.bits = buf.readUInt16LE(p + 22); }
    if (id === 'data') { out.dataOffset = p + 8; out.dataSizeHeader = size; out.dataSize = Math.min(size, buf.length - p - 8); break; }
    p += 8 + size + (size % 2);
  }
  out.frames = out.dataSize / (out.channels * out.bits / 8); out.duration = out.frames / out.rate;
  let peak = 0, nz = 0, sumsq = 0, cnt = 0, nonFinite = 0; const bps = out.bits / 8; const n = out.dataSize / bps;
  for (let i = 0; i < n; i++) { const o = out.dataOffset + i * bps; const x = out.format === 3 ? buf.readFloatLE(o) : bps === 2 ? buf.readInt16LE(o) / 32768 : bps === 3 ? buf.readIntLE(o, 3) / 8388608 : buf.readInt32LE(o) / 2147483648; if (!Number.isFinite(x)) { nonFinite++; continue; } if (x !== 0) nz++; peak = Math.max(peak, Math.abs(x)); sumsq += x * x; cnt++; }
  out.peak = Number(peak.toFixed(5)); out.nonzero = nz; out.samples = n; out.rmsDb = Number((10 * Math.log10(sumsq / cnt + 1e-20)).toFixed(2)); out.nonFinite = nonFinite;
  return out;
}
const tap = () => {
  const orig = AudioNode.prototype.connect; window.__c = { taps: 0, starts: 0 };
  AudioNode.prototype.connect = function (dest, ...rest) { const r = orig.call(this, dest, ...rest);
    try { if (dest instanceof AudioDestinationNode) { const ctx = this.context; if (!ctx.__an) { ctx.__an = ctx.createAnalyser(); ctx.__an.fftSize = 2048; window.__c.an = ctx.__an; } orig.call(this, ctx.__an); window.__c.taps++; } } catch (e) { window.__c.err = String(e); }
    return r; };
  const os = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (...a) { window.__c.starts++; return os.apply(this, a); };
};
const peak = (page) => page.evaluate(() => { const an = window.__c?.an; if (!an) return null; const a = new Float32Array(an.fftSize); an.getFloatTimeDomainData(a); let m = 0; for (const x of a) m = Math.max(m, Math.abs(x)); return Number(m.toFixed(4)); });
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const r = (res[vp] = { errors: [] });
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  await ctx.addInitScript(tap); await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => r.errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error' && !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource/i.test(m.text())) r.errors.push(`console: ${m.text().slice(0, 160)}`); });
  try {
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => /Demo collection ready/.test(document.body?.innerText || ''), null, { timeout: 180000 });
    await page.waitForTimeout(1000);
    r.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    await page.getByRole('button', { name: 'Add', exact: true }).first().click();
    await page.locator('[data-clip-kind="audio"]').first().waitFor(); await page.waitForTimeout(1200);
    const clip = page.locator('[data-clip-kind="audio"]').first();
    const track = () => clip.evaluate((el) => el.closest('[data-track-id]')?.getAttribute('data-track-id'));
    r.trackBefore = await track(); r.startBefore = await clip.getAttribute('data-clip-start');
    const box = await clip.getByTitle(/ — drag to move$/).boundingBox();
    const empty = await clip.evaluate((el) => { const own = el.closest('[data-track-id]'); const lanes = [...document.querySelectorAll('[data-track-id]')]; for (const lane of lanes.slice(lanes.indexOf(own) + 1)) { if (lane.contains(own) || own.contains(lane)) continue; const b = lane.getBoundingClientRect(); const y = b.top + b.height / 2; for (let x = Math.max(b.left, 0) + 4; x <= Math.min(b.right, innerWidth) - 4; x += 8) { const hit = document.elementFromPoint(x, y); if (hit && lane.contains(hit) && !hit.closest('[data-clip-kind]')) return { x, y, track: lane.getAttribute('data-track-id') }; } } return null; });
    r.target = empty;
    const play = page.locator('[data-testid="arrangement-transport"] button[data-playing]').first();
    await play.click(); await page.waitForTimeout(800);
    r.playingStart = await play.getAttribute('data-playing'); r.peakBeforeDrag = Math.max(...[await peak(page), (await page.waitForTimeout(100), await peak(page)), (await page.waitForTimeout(100), await peak(page))]);
    r.startsBefore = await page.evaluate(() => window.__c.starts);
    const x = box.x + 120, y = box.y + box.height / 2;
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 6, y); await page.waitForTimeout(200);
    const peaks = [];
    for (let i = 1; i <= 8; i++) { await page.mouse.move(x + 6 + i * 12, empty.y); await page.waitForTimeout(150); peaks.push(await peak(page)); }
    r.ghostDuringDrag = await page.locator('[data-testid="arrangement-lane-move-ghost"]').count();
    r.playingDuringDrag = await play.getAttribute('data-playing'); r.peaksDuringDrag = peaks; r.startsDuringDrag = await page.evaluate(() => window.__c.starts);
    await page.screenshot({ path: `${DIR}/shots/mid-drag-A-${vp}.png` });
    await page.mouse.up(); await page.waitForTimeout(800);
    r.trackAfter = await track(); r.startAfter = await clip.getAttribute('data-clip-start');
    r.playingAfterRelease = await play.getAttribute('data-playing');
    const pk = []; for (let i = 0; i < 5; i++) { await page.waitForTimeout(150); pk.push(await peak(page)); } r.peaksAfterRelease = pk;
    r.undoTitle = await page.locator('button[title^="Undo"]').first().getAttribute('title').catch(() => null);
    await page.screenshot({ path: `${DIR}/shots/after-release-A-${vp}.png` });
    await page.keyboard.press('Space'); await page.waitForTimeout(500);
    r.playingAfterSpace = await play.getAttribute('data-playing');
    await page.getByRole('button', { name: /^Export/ }).first().click(); await page.waitForTimeout(800);
    await page.locator('[data-testid="arrangement-export-format-wav"]').click().catch(() => {});
    const proj = page.locator('[data-testid="arrangement-export-scope-project"]'); if (await proj.count()) await proj.click().catch(() => {});
    const dl = page.waitForEvent('download', { timeout: 180000 });
    await page.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const d = await dl; const p = `/tmp/c338-smoke-${vp}.wav`; await d.saveAs(p);
    r.suggestedFilename = d.suggestedFilename(); r.wav = parseWav(readFileSync(p));
    r.clipStartAfter = r.startAfter;
  } catch (e) { r.exception = String(e).slice(0, 500); await page.screenshot({ path: `${DIR}/shots/smoke-exception-${vp}.png` }).catch(() => {}); }
  writeFileSync(`${DIR}/smoke338.json`, JSON.stringify(res, null, 1)); await ctx.close();
}
res.endedUtc = new Date().toISOString(); writeFileSync(`${DIR}/smoke338.json`, JSON.stringify(res, null, 1)); await browser.close();
console.log(JSON.stringify(res, null, 1));
