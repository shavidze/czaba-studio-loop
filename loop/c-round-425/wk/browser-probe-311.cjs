// B round 310 -> 311 probe: real Chromium fetches the oversized-range and If-Range re-read cases against worker-server.mjs.
// Usage: node browser-probe-311.cjs <workerBase> <serverLog> <out.json> [viewport WxH] [inm etag for the swapped object]
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const http = require('node:http');
(async () => {
  const [base, logFile, outFile, vp = '1440x900', swapEtag = ''] = process.argv.slice(2);
  const [w, h] = vp.split('x').map(Number);
  const readLog = () => fs.readFileSync(logFile, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const pagePort = Number(new URL(base).port) + 100;
  const pageServer = http.createServer((q, r) => { r.writeHead(200, { 'Content-Type': 'text/html' }); r.end('<!doctype html><title>r2 probe 311</title><body>probe</body>'); });
  await new Promise((r) => pageServer.listen(pagePort, '127.0.0.1', r));
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  await page.goto(`http://127.0.0.1:${pagePort}/`);
  const result = { base, viewport: vp, browser: browser.version(), steps: {} };
  const wav = `${base}/preview/mall/preview.wav`;
  const huge = '9'.repeat(400);
  const cases = { hugeEnd: { Range: `bytes=0-${huge}` }, hugeEnd20: { Range: 'bytes=10-99999999999999999999' }, hugeSuffix: { Range: `bytes=-${huge}` }, hugeStart: { Range: `bytes=${huge}-` }, normalSeek: { Range: 'bytes=4784128-' } };
  if (swapEtag) {
    cases.rereadNoInm = { Range: 'bytes=0-9', 'If-Range': '"old"' };
    cases.rereadInm = { Range: 'bytes=0-9', 'If-Range': '"old"', 'If-None-Match': swapEtag };
    cases.rereadFarNoInm = { Range: 'bytes=999999999-', 'If-Range': '"old"' };
    cases.rereadFarInm = { Range: 'bytes=999999999-', 'If-Range': '"old"', 'If-None-Match': swapEtag };
  }
  // If-Range / If-None-Match are not CORS-safelisted: a cross-origin page fetch fails at the preflight
  // (measured 2026-11-03: 'TypeError: Failed to fetch' after OPTIONS 200). Those rows go through
  // Playwright's APIRequestContext (same browser context, not a page fetch) and are labelled via: 'request'.
  for (const [name, headers] of Object.entries(cases)) {
    const n = readLog().length;
    if (headers['If-Range'] || headers['If-None-Match']) {
      const r = await page.context().request.get(wav, { headers });
      const b = await r.body();
      result.steps[name] = { via: 'request', status: r.status(), bytes: b.length, contentRange: r.headers()['content-range'] ?? null, contentLength: r.headers()['content-length'] ?? null, etag: r.headers().etag ?? null, contentType: r.headers()['content-type'] ?? null };
      result.steps[name].server = readLog().slice(n);
      continue;
    }
    result.steps[name] = await page.evaluate(async ({ u, headers }) => {
      try {
        const r = await fetch(u, { headers, cache: 'no-store' });
        const b = await r.arrayBuffer();
        return { status: r.status, bytes: b.byteLength, contentRange: r.headers.get('content-range'), contentLength: r.headers.get('content-length'), etag: r.headers.get('etag'), contentType: r.headers.get('content-type') };
      } catch (e) { return { error: String(e) }; }
    }, { u: wav, headers });
    result.steps[name].server = readLog().slice(n);
  }
  fs.writeFileSync(outFile, JSON.stringify(result, null, 1));
  console.log(JSON.stringify(result, (k, v) => (k === 'server' ? v.map((e) => `${e.method} ${e.status} cr=${e.contentRange} cl=${e.contentLength} bytes=${e.bodyBytes} h${e.r2.heads}g${e.r2.gets}c${e.r2.cancels} ranges=${JSON.stringify(e.r2.getRanges)}`) : v), 1));
  await browser.close();
  pageServer.close();
})();
