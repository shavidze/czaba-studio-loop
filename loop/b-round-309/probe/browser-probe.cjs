// B round 308 -> 309 probe: real Chromium against worker-server.mjs.
// Usage: node browser-probe.cjs <workerBase e.g. http://127.0.0.1:8791> <serverLog> <out.json> [viewport WxH]
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');

(async () => {
  const [base, logFile, outFile, vp = '1440x900'] = process.argv.slice(2);
  const [w, h] = vp.split('x').map(Number);
  const readLog = () => fs.readFileSync(logFile, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const http = require('node:http');
  const pagePort = Number(new URL(base).port) + 100;
  const pageServer = http.createServer((q, r) => { r.writeHead(200, { 'Content-Type': 'text/html' }); r.end('<!doctype html><title>r2 probe</title><body>probe</body>'); });
  await new Promise((r) => pageServer.listen(pagePort, '127.0.0.1', r));
  const pageOrigin = `http://127.0.0.1:${pagePort}/`;
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await context.newPage();
  await page.goto(pageOrigin);
  const result = { base, pageOrigin, viewport: vp, browser: browser.version(), steps: {} };
  const mark = () => readLog().length;
  const since = (n) => readLog().slice(n);
  const wav = `${base}/preview/mall/preview.wav`;
  const cover = `${base}/mall/cover.jpg`;

  let n = mark();
  result.steps.firstFetch = await page.evaluate(async (u) => { const r = await fetch(u); const b = await r.arrayBuffer(); return { status: r.status, bytes: b.byteLength, etag: r.headers.get('etag'), cacheControl: r.headers.get('cache-control') }; }, wav);
  result.steps.firstFetch.server = since(n);

  n = mark();
  result.steps.revalidate = await page.evaluate(async (u) => { const r = await fetch(u, { cache: 'no-cache' }); const b = await r.arrayBuffer(); return { status: r.status, bytes: b.byteLength, etag: r.headers.get('etag') }; }, wav);
  result.steps.revalidate.server = since(n);

  n = mark();
  result.steps.rangeFetch = await page.evaluate(async (u) => { const r = await fetch(u, { headers: { Range: 'bytes=1000-1999' }, cache: 'no-store' }); const b = await r.arrayBuffer(); return { status: r.status, bytes: b.byteLength, contentRange: r.headers.get('content-range') }; }, wav);
  result.steps.rangeFetch.server = since(n);

  n = mark();
  result.steps.unsatisfiable = await page.evaluate(async (u) => { const r = await fetch(u, { headers: { Range: 'bytes=999999999-' }, cache: 'no-store' }); await r.arrayBuffer(); return { status: r.status, contentRange: r.headers.get('content-range') }; }, wav);
  result.steps.unsatisfiable.server = since(n);

  n = mark();
  result.steps.head = await page.evaluate(async (u) => { const r = await fetch(u, { method: 'HEAD', cache: 'no-store' }); return { status: r.status, length: r.headers.get('content-length') }; }, wav);
  result.steps.head.server = since(n);

  const page2 = await context.newPage();
  await page2.goto(pageOrigin);
  n = mark();
  result.steps.audioSeek = await page2.evaluate(async (u) => {
    const a = new Audio();
    a.preload = 'metadata';
    a.src = u;
    await new Promise((res, rej) => { a.onloadedmetadata = res; a.onerror = () => rej(new Error('audio error ' + (a.error && a.error.code))); setTimeout(() => rej(new Error('metadata timeout')), 15000); });
    const duration = a.duration;
    a.muted = true;
    a.currentTime = 50;
    await new Promise((res) => { a.onseeked = res; setTimeout(res, 8000); });
    await a.play().catch(() => {});
    const t0 = a.currentTime;
    await new Promise((r) => setTimeout(r, 1500));
    const t1 = a.currentTime;
    a.pause();
    return { duration, t0, t1, advanced: t1 > t0, error: a.error ? a.error.code : null };
  }, `${wav}?a=1`).catch((e) => ({ error: String(e) }));
  result.steps.audioSeek.server = since(n);

  n = mark();
  result.steps.coverTwice = await page.evaluate(async (u) => { const a = await fetch(u, { cache: 'no-cache' }); await a.arrayBuffer(); const b = await fetch(u, { cache: 'no-cache' }); const bb = await b.arrayBuffer(); return { first: a.status, second: b.status, secondBytes: bb.byteLength, etag: b.headers.get('etag') }; }, cover);
  result.steps.coverTwice.server = since(n);

  await browser.close();
  pageServer.close();
  fs.writeFileSync(outFile, JSON.stringify(result, null, 1));
  console.log(JSON.stringify(result, (k, v) => (k === 'server' ? v.map((e) => `${e.method} ${e.status} range=${e.range} inm=${e.ifNoneMatch ? 'y' : 'n'} cr=${e.contentRange} bytes=${e.bodyBytes}`) : v), 1));
})();
