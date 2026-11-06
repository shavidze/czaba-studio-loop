// usage: node js-probe.mjs <baseURL> <buildClientDir> <outJson>
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
const [base, clientDir, out] = process.argv.slice(2);
const markers = { firebase: /firebase|identitytoolkit/i, signalr: /HubConnectionBuilder|signalr/i, framer: /framer|AnimatePresence|motionValue|useReducedMotion/ };
const routes = { 'studio-lab': '/studio-lab', home: '/', 'studio-guard': '/studio/middle-east' };
const browser = await chromium.launch();
const result = {};
for (const [key, route] of Object.entries(routes)) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const reqs = new Map();
  cdp.on('Network.responseReceived', (e) => { if (e.type === 'Script') reqs.set(e.requestId, { url: e.response.url, enc: 0 }); });
  cdp.on('Network.loadingFinished', (e) => { const r = reqs.get(e.requestId); if (r) r.enc = e.encodedDataLength; });
  await page.goto(base + route, { waitUntil: 'load' });
  await page.waitForTimeout(4000);
  const scripts = [];
  let total = 0;
  const byMarker = { firebase: 0, signalr: 0, framer: 0 };
  for (const r of reqs.values()) {
    const u = new URL(r.url);
    const file = path.join(clientDir, u.pathname);
    let size = null, hits = [];
    if (fs.existsSync(file)) { const src = fs.readFileSync(file, 'utf8'); size = src.length; for (const [m, re] of Object.entries(markers)) if (re.test(src)) { hits.push(m); byMarker[m] += r.enc; } }
    scripts.push({ path: u.pathname, encoded: r.enc, raw: size, markers: hits });
    total += r.enc;
  }
  scripts.sort((a, b) => b.encoded - a.encoded);
  result[key] = { encodedTotal: total, count: scripts.length, encodedInChunksWithMarker: byMarker, scripts };
  await ctx.close();
}
await browser.close();
fs.writeFileSync(out, JSON.stringify(result, null, 1));
for (const [k, v] of Object.entries(result)) console.log(k, v.encodedTotal, v.count, JSON.stringify(v.encodedInChunksWithMarker));
