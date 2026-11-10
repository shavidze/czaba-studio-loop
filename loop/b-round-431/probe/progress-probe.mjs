// B round 431 -> 432 (SABA-B-12 stage 2b): Export dialog <progress> in real Chromium, both states.
// Hold recipes (proved at HEAD 1197dcb, b-round-431/probe/head/): indeterminate = page.route stall of the
// mp3-encoder.client module request, then release (MP3 must still download); determinate = CDP CPU throttling
// during a WAV render. Pixels are sampled from real screenshots decoded in a blank page canvas.
// usage: BASE=http://127.0.0.1:5173 OUT=<abs dir> [CPU=20] node progress-probe.mjs
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const OUT = process.env.OUT;
const CPU = Number(process.env.CPU ?? 20);
mkdirSync(OUT, { recursive: true });
const result = { base: BASE, cpu: CPU, started: new Date().toISOString(), cells: {} };
const browser = await chromium.launch();
const decoder = await (await browser.newContext()).newPage();
async function pixels(buf) {
  return decoder.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    const at = (x, y) => { const i = (y * c.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
    return { w: c.width, h: c.height, row: Array.from({ length: c.width }, (_, x) => at(x, Math.floor(c.height / 2))), corner: at(0, 0), cornerIn: at(1, 1) };
  }, buf.toString('base64'));
}
async function openDialog(page) {
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 180000 });
  await page.waitForTimeout(800);
  await page.getByRole('option').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  await page.evaluate(() => document.activeElement?.blur());
  await page.getByRole('button', { name: 'Export', exact: true }).first().click();
  await page.getByRole('dialog').waitFor();
  await page.waitForTimeout(400);
}
const readBar = (page) => page.evaluate(() => {
  const p = document.querySelector('[data-testid="arrangement-export-progress"]');
  if (!p) return null;
  const cs = getComputedStyle(p);
  const r = p.getBoundingClientRect();
  return { tag: p.tagName, hasValue: p.hasAttribute('value'), value: p.hasAttribute('value') ? p.value : null, indeterminate: p.matches(':indeterminate'), appearance: cs.appearance, bg: cs.backgroundColor, opacity: cs.opacity, animationName: cs.animationName, radius: cs.borderTopLeftRadius, x: r.x, y: r.y, w: r.width, h: r.height, label: document.querySelector('[data-testid="arrangement-export-progress-label"]')?.textContent ?? null, valuetext: p.getAttribute('aria-valuetext'), arialabel: p.getAttribute('aria-label'), t: performance.now() };
});
async function barShot(page, file) {
  const box = await page.locator('[data-testid="arrangement-export-progress"]').boundingBox().catch(() => null);
  if (!box) return null;
  const pad = 6;
  await page.screenshot({ path: path.join(OUT, file), clip: { x: box.x - pad, y: box.y - pad, width: box.width + 2 * pad, height: box.height + 2 * pad } });
  const buf = await page.screenshot({ clip: { x: box.x, y: box.y, width: box.width, height: box.height } });
  return { box, px: await pixels(buf) };
}
async function indeterminateRun(cell, key, W, H, opts) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, acceptDownloads: true, reducedMotion: opts.reducedMotion ?? 'no-preference', forcedColors: opts.forcedColors ?? 'none' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => cell.pageErrors.push(`${opts.tag}: ${String(e).slice(0, 300)}`));
  let release;
  const gate = new Promise((r) => { release = r; });
  let stalled = 0;
  await page.route(/mp3-encoder\.client/, async (route) => { stalled++; await gate; await route.continue(); });
  await openDialog(page);
  await page.locator('[data-testid="arrangement-export-format-mp3"]').check({ force: true });
  const dl = page.waitForEvent('download', { timeout: 240000 }).catch(() => null);
  await page.getByRole('dialog').getByRole('button', { name: /^Export MP3/ }).click();
  await page.waitForFunction(() => { const p = document.querySelector('[data-testid="arrangement-export-progress"]'); return p && !p.hasAttribute('value'); }, undefined, { timeout: 120000 });
  const samples = [];
  for (let i = 0; i < 5; i++) { samples.push(await readBar(page)); await page.waitForTimeout(400); }
  const shot = await barShot(page, `${key}-${opts.tag}.png`);
  await page.screenshot({ path: path.join(OUT, `${key}-${opts.tag}-dialog.png`) });
  release();
  const file = await dl;
  await ctx.close();
  return { stalled, samples, shot, download: file ? file.suggestedFilename() : null };
}
for (const [W, H] of [[1440, 900], [1280, 720]]) {
  const key = `${W}x${H}`;
  const cell = { pageErrors: [] };
  result.cells[key] = cell;
  {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, acceptDownloads: true });
    const page = await ctx.newPage();
    await openDialog(page);
    await page.locator('[data-testid="arrangement-export-format-mp3"]').check({ force: true });
    const dl = page.waitForEvent('download', { timeout: 240000 }).catch(() => null);
    await page.getByRole('dialog').getByRole('button', { name: /^Export MP3/ }).click();
    const file = await dl;
    cell.warmupMp3 = file ? file.suggestedFilename() : null;
    await ctx.close();
  }
  cell.indeterminate = await indeterminateRun(cell, key, W, H, { tag: 'indeterminate' });
  cell.reducedMotion = await indeterminateRun(cell, key, W, H, { tag: 'indeterminate-reduced', reducedMotion: 'reduce' });
  cell.forcedColors = await indeterminateRun(cell, key, W, H, { tag: 'indeterminate-forced', forcedColors: 'active' });
  {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, acceptDownloads: true });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => cell.pageErrors.push(`determinate: ${String(e).slice(0, 300)}`));
    await openDialog(page);
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    const dl = page.waitForEvent('download', { timeout: 240000 }).catch(() => null);
    await page.getByRole('dialog').getByRole('button', { name: 'Export WAV', exact: true }).click();
    const samples = [];
    const shots = [];
    for (let i = 0; i < 600 && shots.length < 6; i++) {
      const s = await readBar(page);
      if (s) samples.push(s);
      if (s && s.hasValue && s.value >= 0.15 && s.value <= 0.85) {
        const before = await readBar(page);
        const sh = await barShot(page, `${key}-determinate-${shots.length}.png`);
        const after = await readBar(page);
        if (before && after && sh) {
          const row = sh.px.row;
          let fillEnd = -1;
          for (let x = 0; x < row.length; x++) if (row[x][0] > 150) fillEnd = x;
          const phase = (q) => (q.label ?? '').split(' ')[0];
          shots.push({ before: before.value, after: after.value, samePhase: phase(before) === phase(after), label: before.label, width: row.length, fillPx: fillEnd + 1, fillColour: row[Math.max(0, Math.floor((fillEnd + 1) / 2))], trackColour: row[row.length - 4], corner: sh.px.corner, h: before.h, radius: before.radius, appearance: before.appearance, tag: before.tag, green: row.filter((p) => p[1] > p[0] + 40 && p[1] > p[2] + 40).length });
        }
      }
      if (!s && samples.length > 0) break;
      await page.waitForTimeout(30);
    }
    cell.determinate = { samples: samples.length, shots };
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const file = await dl;
    cell.wavDownload = file ? file.suggestedFilename() : null;
    cell.barAfterDone = await readBar(page);
    await ctx.close();
  }
  {
    // record only: determinate bar under emulated forced colours (TL-R432-07); compared with HEAD, not asserted
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, acceptDownloads: true, forcedColors: 'active' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => cell.pageErrors.push(`forced-determinate: ${String(e).slice(0, 300)}`));
    await openDialog(page);
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    const dl = page.waitForEvent('download', { timeout: 240000 }).catch(() => null);
    await page.getByRole('dialog').getByRole('button', { name: 'Export WAV', exact: true }).click();
    let rec = null;
    for (let i = 0; i < 600 && !rec; i++) {
      const s = await readBar(page);
      if (s && s.hasValue && s.value >= 0.15 && s.value <= 0.85) {
        const sh = await barShot(page, `${key}-forced-determinate.png`);
        if (sh) {
          const colours = {};
          for (const p of sh.px.row) colours[p.join(',')] = (colours[p.join(',')] ?? 0) + 1;
          rec = { appearance: s.appearance, value: s.value, colours };
        }
      }
      if (!s && i > 50) break;
      await page.waitForTimeout(30);
    }
    cell.forcedDeterminate = rec;
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await dl;
    await ctx.close();
  }
}
await browser.close();
writeFileSync(path.join(OUT, 'progress-probe.json'), JSON.stringify(result, null, 1));
console.log('done', OUT);
