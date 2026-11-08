// B round 412 -> 413 probe (PERF-15b-ii; copy of b-round-410/probe/peaks-before-ready-411.mjs plus two streamed modes). Usage: node peaks-before-ready-411.mjs <baseUrl> <outJson> <WxH> <mode>
// mode: real  = peaks served by the app (public/peaks), /middle-east.mp3 held until the preview is measured
//       404   = /peaks/middle-east.peaks.json answered 404 (negative: HEAD path)
//       nolength       = /peaks/middle-east.peaks.json re-routed to a local chunked server (no content-length): the real file padded with spaces to 5 MiB (over the 4 MiB cap)
//       nolength-small = same server, the real file unpadded (under the cap), still without content-length
//       8bit  = /peaks/middle-east.peaks.json answered with an 8-bit copy of the real file (placeholder; worker still runs)
// Records: peaks fetch/xhr requests; page errors; the Middle East preview (rects, aria-disabled) while its audio is held;
// every peaks-worker 'begin' message (length, sampleRate) via a Worker.prototype.postMessage wrapper; the preview after ready.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const outPath = process.argv[3];
const [w, h] = (process.argv[4] ?? '1440x900').split('x').map(Number);
const mode = process.argv[5] ?? 'real';
const SOURCE = 'demo-middle-east';
const out = { base, mode, at: new Date().toISOString(), viewport: `${w}x${h}`, peaksRequests: [], pageErrors: [] };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: w, height: h } });
await ctx.addInitScript(() => {
  window.__peaksBegins = [];
  const original = Worker.prototype.postMessage;
  Worker.prototype.postMessage = function (message, ...rest) {
    if (message && message.type === 'begin') window.__peaksBegins.push({ length: message.length, sampleRate: message.sampleRate, t: performance.now() });
    return original.call(this, message, ...rest);
  };
});
const page = await ctx.newPage();
page.on('pageerror', (e) => out.pageErrors.push(String(e)));
page.on('request', (r) => { if (/peaks/i.test(r.url()) && ['fetch', 'xhr'].includes(r.resourceType())) out.peaksRequests.push(r.url()); });
let release;
const held = new Promise((resolve) => { release = resolve; });
await page.route('**/middle-east.mp3', async (route) => { await held; await route.continue(); });
if (mode === '404') {
  await page.route('**/peaks/middle-east.peaks.json', (route) => route.fulfill({ status: 404, body: 'not found' }));
} else if (mode === 'nolength' || mode === 'nolength-small') {
  const realText = readFileSync(new URL('../fixtures/middle-east.peaks.json', import.meta.url), 'utf8');
  const target = mode === 'nolength' ? 5 * 1024 * 1024 : 0;
  out.streamServer = { bodyBytes: Math.max(target, Buffer.byteLength(realText)), contentLength: null, sentBytes: 0, closedEarly: false };
  const server = createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
    let sent = 0;
    const chunk = Buffer.alloc(64 * 1024, 32);
    res.on('close', () => { out.streamServer.sentBytes = sent; out.streamServer.closedEarly = !res.writableFinished; });
    res.write(realText); sent += Buffer.byteLength(realText);
    const pump = () => {
      while (sent < target) { sent += chunk.length; if (!res.write(chunk)) { res.once('drain', pump); return; } }
      res.end();
    };
    pump();
  });
  await new Promise((resolve) => server.listen(5175, '127.0.0.1', resolve));
  process.on('exit', () => server.close());
  await page.route('**/peaks/middle-east.peaks.json', (route) => route.continue({ url: 'http://127.0.0.1:5175/middle-east.peaks.json' }));
} else if (mode === 'gzip-big' || mode === 'gzip-small') {
  const realText = readFileSync(new URL('../fixtures/middle-east.peaks.json', import.meta.url), 'utf8');
  const decoded = mode === 'gzip-big' ? realText + ' '.repeat(5 * 1024 * 1024 - Buffer.byteLength(realText)) : realText;
  const body = gzipSync(Buffer.from(decoded));
  out.gzip = { decodedBytes: Buffer.byteLength(decoded), encodedBytes: body.length };
  await page.route('**/peaks/middle-east.peaks.json', (route) => route.fulfill({ status: 200, headers: { 'content-type': 'application/json', 'content-encoding': 'gzip', 'content-length': String(body.length) }, body }));
} else if (mode === '8bit') {
  const real = JSON.parse(readFileSync(new URL('../fixtures/middle-east.peaks.json', import.meta.url), 'utf8'));
  const eight = { ...real, bits: 8, data: real.data.map((v) => Math.max(-128, Math.min(127, Math.round(v / 256)))) };
  await page.route('**/peaks/middle-east.peaks.json', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(eight) }));
}
const wave = page.locator('[data-testid="arrangement-library-preview-wave"]');
const readPreview = async () => ({
  rects: await wave.locator('svg rect').count(),
  ariaDisabled: await wave.getAttribute('aria-disabled'),
  title: await wave.getAttribute('title'),
  tabIndex: await wave.getAttribute('tabindex'),
  cursor: await wave.evaluate((el) => getComputedStyle(el).cursor),
  opacity: await wave.evaluate((el) => getComputedStyle(el).opacity),
  heights: await wave.locator('svg rect').evaluateAll((els) => els.map((e) => Number(e.getAttribute('height')))),
});
try {
  await page.goto(`${base}/studio-lab`, { waitUntil: 'domcontentloaded' });
  const row = page.locator(`[data-source-id="${SOURCE}"]`).first();
  await row.waitFor({ timeout: 120000 });
  await row.click();
  const t0 = Date.now();
  let held1 = await readPreview();
  while (Date.now() - t0 < 15000 && held1.rects === 0) { await page.waitForTimeout(250); held1 = await readPreview(); }
  out.whileAudioHeld = { ...held1, waitedMs: Date.now() - t0 };
  out.beginsWhileHeld = await page.evaluate(() => window.__peaksBegins.slice());
  await page.screenshot({ path: outPath.replace(/\.json$/, '-held.png') });
  release();
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 });
  await page.waitForTimeout(1500);
  await row.click();
  await page.waitForTimeout(400);
  out.afterReady = await readPreview();
  out.begins = await page.evaluate(() => window.__peaksBegins.slice());
  out.middleEastBegins = out.begins.filter((b) => Math.abs(b.length / b.sampleRate - 101.352) < 0.05).length;
  out.heroBegins = out.begins.filter((b) => Math.abs(b.length / b.sampleRate - 150.372) < 0.05).length;
  await page.screenshot({ path: outPath.replace(/\.json$/, '-ready.png') });
} catch (e) {
  out.error = String(e);
}
await browser.close();
await new Promise((resolve) => setTimeout(resolve, 300));
writeFileSync(outPath, JSON.stringify(out, null, 1));
const brief = (p) => p && { rects: p.rects, ariaDisabled: p.ariaDisabled, opacity: p.opacity, title: p.title, cursor: p.cursor, tabIndex: p.tabIndex };
console.log(JSON.stringify({ mode, viewport: out.viewport, error: out.error, whileAudioHeld: brief(out.whileAudioHeld), afterReady: brief(out.afterReady), middleEastBegins: out.middleEastBegins, heroBegins: out.heroBegins, beginsTotal: out.begins?.length, peaksRequests: out.peaksRequests, pageErrors: out.pageErrors.length, streamServer: out.streamServer, gzip: out.gzip }));
process.exit(0);
