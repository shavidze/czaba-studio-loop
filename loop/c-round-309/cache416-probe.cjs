// C309 own probe: does a public-cacheable 416/206 poison Chromium's HTTP cache for a later plain GET? Server log is truth.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs'); const http = require('node:http');
(async () => { const [base, logFile, outFile] = process.argv.slice(2);
 const readLog = () => fs.readFileSync(logFile, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
 const pagePort = Number(new URL(base).port) + 100; const ps = http.createServer((q, r) => { r.writeHead(200, { 'Content-Type': 'text/html' }); r.end('<!doctype html><body>p</body>'); });
 await new Promise((r) => ps.listen(pagePort, '127.0.0.1', r));
 const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); await p.goto(`http://127.0.0.1:${pagePort}/`);
 const u = `${base}/preview/mall/preview.wav?c416=1`; const out = { steps: [] };
 const step = async (name, init) => { const n = readLog().length; const js = await p.evaluate(async ([u, init]) => { const r = await fetch(u, init); const bb = await r.arrayBuffer(); return { status: r.status, bytes: bb.byteLength, cr: r.headers.get('content-range') }; }, [u, init]); out.steps.push({ name, js, server: readLog().slice(n).map((e) => ({ status: e.status, range: e.range, inm: !!e.ifNoneMatch, bytes: e.bodyBytes })) }); };
 await step('416 default cache', { headers: { Range: 'bytes=999999999-' } });
 await step('plain GET default cache after 416', {});
 await step('206 default cache', { headers: { Range: 'bytes=0-9' } });
 await step('plain GET default cache after 206', {});
 await b.close(); ps.close(); fs.writeFileSync(outFile, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); })();
