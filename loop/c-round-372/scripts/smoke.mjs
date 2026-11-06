import { createRequire } from 'node:module';
import { writeFileSync, readFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = {};
const browser = await chromium.launch();
const ready = async (page) => {
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 120000 });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 });
  await page.waitForTimeout(1000);
};
const laneOf = (page) => page.evaluate(() => { const c = document.querySelector('[data-clip-id]'); return c ? c.closest('[data-track-id]')?.getAttribute('data-track-id') : null; });
const pos = (page) => page.getByTestId('arrangement-position').textContent().then((s) => s.trim());
const parseWav = (buf) => {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const tag = (o) => String.fromCharCode(buf[o], buf[o+1], buf[o+2], buf[o+3]);
  const r = { riff: tag(0), wave: tag(8), bytes: buf.length };
  let o = 12; let fmt, dataOff, dataLen;
  while (o + 8 <= buf.length) { const id = tag(o), sz = dv.getUint32(o+4, true); if (id === 'fmt ') fmt = { fmtTag: dv.getUint16(o+8,true), ch: dv.getUint16(o+10,true), sr: dv.getUint32(o+12,true), bits: dv.getUint16(o+22,true) }; if (id === 'data') { dataOff = o+8; dataLen = sz; break; } o += 8 + sz + (sz & 1); }
  Object.assign(r, fmt, { dataLen, declaredVsActual: dataOff + dataLen <= buf.length });
  const bps = fmt.bits / 8, n = Math.floor(Math.min(dataLen, buf.length - dataOff) / bps);
  let peak = 0, nz = 0, nan = 0, sumsq = 0;
  for (let i = 0; i < n; i++) { const p = dataOff + i * bps; let v; if (fmt.bits === 24) { v = (buf[p] | (buf[p+1] << 8) | (buf[p+2] << 16)); if (v & 0x800000) v -= 0x1000000; v /= 8388608; } else if (fmt.bits === 16) v = dv.getInt16(p, true) / 32768; else if (fmt.fmtTag === 3) v = dv.getFloat32(p, true); else v = 0; if (!Number.isFinite(v)) nan++; const a = Math.abs(v); if (a > peak) peak = a; if (a > 1e-6) nz++; sumsq += v*v; }
  r.frames = Math.floor(n / fmt.ch); r.seconds = r.frames / fmt.sr; r.peak = peak; r.nonZeroSamples = nz; r.nanOrInf = nan; r.rms = Math.sqrt(sumsq / Math.max(n,1));
  return r;
};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  const page = await ctx.newPage();
  const r = {}; out[`${w}x${h}`] = r;
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await ready(page);
  const hdr = page.getByTestId('arrangement-track-header').filter({ hasText: 'Stems' }).first();
  await hdr.getByText(/^Stems/).first().click();
  await page.getByRole('button', { name: 'All' }).first().click().catch(() => {});
  await page.getByTestId('arrangement-library-list').getByRole('option', { name: /Bass/ }).first().click();
  await page.waitForTimeout(250); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  r.clipCount = await page.locator('[data-clip-id]').count();
  r.startLane = await laneOf(page);
  const play = page.getByRole('button', { name: /^Play/ }).first();
  r.playingBefore = await play.getAttribute('data-playing');
  await play.click(); await page.waitForTimeout(1500);
  r.playingDuring = await play.getAttribute('data-playing');
  r.positionAfter1500 = await pos(page);
  await page.getByRole('button', { name: /^Stop/ }).first().click(); await page.waitForTimeout(400);
  r.playingAfter = await play.getAttribute('data-playing');
  // drag by name bar
  const lanes = await page.evaluate(() => [...document.querySelectorAll('[data-track-id]')].map((l) => { const b = l.getBoundingClientRect(); return { id: l.getAttribute('data-track-id'), y: b.y, h: b.height, x: b.x, hasClip: !!l.querySelector('[data-clip-id]') }; }));
  r.lanes = lanes.map((l) => l.id);
  const idx = lanes.findIndex((l) => l.id === r.startLane);
  const tIdx = idx + 1 < lanes.length ? idx + 1 : idx - 1;
  r.targetLane = lanes[tIdx].id;
  const bar = page.locator('[data-clip-id] > div').first();
  const bb = await bar.boundingBox();
  const sx = bb.x + 40, sy = bb.y + bb.height / 2;
  const dy = lanes[tIdx].y + Math.min(lanes[tIdx].h, 60) / 2 - (lanes[idx].y + (bb.y - lanes[idx].y) + bb.height / 2);
  await page.mouse.move(sx, sy); await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(sx, sy + (dy * i) / 12, { steps: 2 });
  await page.waitForTimeout(150); await page.mouse.up(); await page.waitForTimeout(500);
  r.laneAfterDrag = await laneOf(page);
  const undoBtn = page.locator('button[title^="Undo"]').first();
  r.undoTitle = await undoBtn.getAttribute('title'); r.statusAfterMove = await page.getByTestId('arrangement-status').textContent().catch(()=>null);
  await page.screenshot({ path: `c-round-372/screens/smoke-afterdrag-${w}x${h}.png` });
  await page.keyboard.press('Control+z'); await page.waitForTimeout(500);
  r.laneAfterUndo = await laneOf(page); r.statusAfterUndo = await page.getByTestId('arrangement-status').textContent().catch(()=>null);
  // export before reload (default WAV)
  const exportOnce = async (tag) => {
    await page.getByRole('button', { name: /^Export/ }).first().click(); await page.waitForTimeout(600);
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.getByRole('button', { name: /^Export WAV$/ }).first().click()]);
    const p = `c-round-372/exports/${tag}-${w}x${h}.wav`; await dl.saveAs(p);
    const info = parseWav(readFileSync(p)); info.suggested = dl.suggestedFilename(); return info;
  };
  // reload
  await page.reload({ waitUntil: 'networkidle' });
  await ready(page);
  r.afterReloadReadyStatus = await page.getByTestId('arrangement-status').textContent().catch(() => null);
  r.clipCountAfterReload = await page.locator('[data-clip-id]').count();
  await hdr.getByText(/^Stems/).first().click().catch(() => {});
  if (r.clipCountAfterReload === 0) {
    await page.getByTestId('arrangement-track-header').filter({ hasText: 'Stems' }).first().getByText(/^Stems/).first().click();
    await page.getByRole('button', { name: 'All' }).first().click().catch(() => {});
    await page.getByTestId('arrangement-library-list').getByRole('option', { name: /Bass/ }).first().click();
    await page.waitForTimeout(250); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  }
  const play2 = page.getByRole('button', { name: /^Play/ }).first();
  await play2.click(); await page.waitForTimeout(1500);
  r.positionAfterReloadPlay = await pos(page);
  r.playingAfterReload = await play2.getAttribute('data-playing');
  await page.getByRole('button', { name: /^Stop/ }).first().click(); await page.waitForTimeout(300);
  try { r.wav = await exportOnce('smoke'); } catch (e) { r.exportError = String(e).slice(0, 300); await page.screenshot({ path: `c-round-372/screens/smoke-exporterr-${w}x${h}.png` }); }
  await ctx.close();
}
await browser.close();
writeFileSync('c-round-372/smoke.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
