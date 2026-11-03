// C321 STUDIO-SMOKE-321: fresh anonymous context per viewport; add Bass (Enter), Play 1.5 s, data-playing false->true->false,
// real audio-graph tap (analyser on every node connected to destination), body-drag range readout, WAV export parse.
import { createRequire } from 'node:module';
import { writeFileSync, readFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = 'http://127.0.0.1:5173';
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-321';
const res = { startedUtc: new Date().toISOString() };
const save = () => writeFileSync(`${DIR}/smoke321.json`, JSON.stringify(res, null, 1));
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
  const orig = AudioNode.prototype.connect;
  window.__c321 = { taps: 0, peaks: [] };
  AudioNode.prototype.connect = function (dest, ...rest) {
    const r = orig.call(this, dest, ...rest);
    try {
      if (dest instanceof AudioDestinationNode) {
        const ctx = this.context;
        if (!ctx.__c321an) { ctx.__c321an = ctx.createAnalyser(); ctx.__c321an.fftSize = 2048; window.__c321.an = ctx.__c321an; }
        orig.call(this, ctx.__c321an); window.__c321.taps++;
      }
    } catch (e) { window.__c321.err = String(e); }
    return r;
  };
};
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const r = (res[vp] = { errors: [] });
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  await ctx.addInitScript(tap);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => r.errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error' && !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource/i.test(m.text())) r.errors.push(`console: ${m.text().slice(0, 160)}`); });
  try {
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 180000 });
    await page.waitForTimeout(1000);
    r.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    const hdr = page.getByTestId('arrangement-track-header').filter({ hasText: 'Stems' }).first();
    await hdr.getByText(/^Stems/).first().click(); await page.waitForTimeout(250);
    r.active = ((await page.getByText(/Active track:/).first().textContent().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
    await page.getByRole('button', { name: 'All' }).first().click().catch(() => {});
    await page.getByTestId('arrangement-library-list').getByRole('option', { name: /Bass/ }).first().click(); await page.waitForTimeout(250);
    await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
    r.clips = await page.locator('[data-clip-id]').evaluateAll((cs) => cs.map((c) => ({ text: c.textContent.trim().slice(0, 60), start: c.getAttribute('data-clip-start'), track: c.closest('[data-track-id]')?.getAttribute('data-track-id') })));
    r.status = (await page.getByTestId('arrangement-status').textContent())?.trim();
    const play = page.locator('[data-testid="arrangement-transport"] button[data-playing]').first();
    r.playingBefore = await play.getAttribute('data-playing');
    r.playLabelBefore = await play.getAttribute('aria-label');
    await play.click();
    const t0 = Date.now(); const peaks = [];
    while (Date.now() - t0 < 1500) { await page.waitForTimeout(100); peaks.push(await page.evaluate(() => { const an = window.__c321?.an; if (!an) return null; const a = new Float32Array(an.fftSize); an.getFloatTimeDomainData(a); let m = 0; for (const x of a) m = Math.max(m, Math.abs(x)); return Number(m.toFixed(4)); })); }
    r.playingDuring = await play.getAttribute('data-playing');
    r.positionAfter1500 = (await page.getByTestId('arrangement-position').textContent())?.trim();
    r.graphTaps = await page.evaluate(() => window.__c321?.taps ?? null);
    r.analyserPeaks = peaks; r.analyserMaxPeak = Math.max(0, ...peaks.filter((x) => x !== null));
    await page.screenshot({ path: `${DIR}/shots/smoke-playing-${vp}.png` });
    await play.click(); await page.waitForTimeout(500);
    r.playingAfter = await play.getAttribute('data-playing');
    r.positionAfterStop = (await page.getByTestId('arrangement-position').textContent())?.trim();
    const clip = await page.locator('[data-clip-id]').first().boundingBox();
    const y = clip.y + clip.height * 0.7;
    r.rangeBefore = await page.evaluate(() => (document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? null));
    await page.mouse.move(clip.x + 60, y); await page.mouse.down();
    await page.mouse.move(clip.x + 160, y, { steps: 6 });
    r.rangeMid = await page.evaluate(() => (document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? null));
    await page.mouse.move(clip.x + clip.width - 20, y, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(400);
    r.rangeAfter = await page.evaluate(() => (document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? '').replace(/\s+/g, ' ').trim());
    r.overlays = await page.evaluate(() => [...document.querySelectorAll('[data-range-start]')].map((o) => `${o.getAttribute('data-range-start')}-${o.getAttribute('data-range-end')}`));
    await page.screenshot({ path: `${DIR}/shots/smoke-range-${vp}.png` });
    await page.keyboard.press('Escape'); await page.waitForTimeout(250); await page.keyboard.press('Escape'); await page.waitForTimeout(250);
    await page.getByRole('button', { name: /^Export/ }).first().click(); await page.waitForTimeout(800);
    r.exportDialog = (await page.getByRole('dialog').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 500);
    await page.locator('[data-testid="arrangement-export-format-wav"]').click().catch(() => {});
    const proj = page.locator('[data-testid="arrangement-export-scope-project"]');
    if (await proj.count()) await proj.click().catch(() => {});
    await page.screenshot({ path: `${DIR}/shots/smoke-export-${vp}.png` });
    const dl = page.waitForEvent('download', { timeout: 180000 });
    await page.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const d = await dl; const p = `/tmp/c321-smoke-${vp}.wav`; await d.saveAs(p);
    r.suggestedFilename = d.suggestedFilename();
    r.wav = parseWav(readFileSync(p));
  } catch (e) { r.exception = String(e).slice(0, 400); await page.screenshot({ path: `${DIR}/shots/smoke-exception-${vp}.png` }).catch(() => {}); }
  save(); await ctx.close();
}
res.endedUtc = new Date().toISOString(); save(); await browser.close();
console.log(JSON.stringify(res, null, 1));
