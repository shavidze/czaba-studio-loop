import { createRequire } from 'node:module';
import { rmSync, writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [base, vw, vh, profile, outFile] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4]), process.argv[5], process.argv[6]];
rmSync(profile, { recursive: true, force: true });
const ctx = await chromium.launchPersistentContext(profile, { viewport: { width: vw, height: vh } });
const page = ctx.pages()[0] ?? (await ctx.newPage());
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
const out = { base, viewport: `${vw}x${vh}` };
async function open(label, { disableHttpCache = false, offline = false } = {}) {
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: disableHttpCache });
  const reqs = [];
  const onReq = (r) => { if (/\.mp3/.test(r.url())) reqs.push({ url: r.url().replace(/^https?:\/\/[^/]+/, ''), headers: r.headers() }); };
  page.on('request', onReq);
  await cdp.send('Network.setBlockedURLs', { urls: offline ? ['*.mp3'] : [] });
  await page.goto(base, { waitUntil: 'load', timeout: 120000 });
  const t0 = Date.now();
  const status = await page.waitForFunction(() => { const t = document.body?.innerText ?? ''; const m = t.match(/Demo collection ready[^\n]*|\d+ sounds? in the demo collection failed[^\n]*/); return m ? m[0] : null; }, null, { timeout: 120000 }).then((h) => h.jsonValue()).catch((e) => 'TIMEOUT ' + String(e).slice(0, 80));
  await page.waitForTimeout(2500);
  page.off('request', onReq);
  out[label] = {
    status,
    waitMs: Date.now() - t0,
    requests: reqs.map((r) => ({ url: r.url, ifNoneMatch: r.headers['if-none-match'] ?? null, ifModifiedSince: r.headers['if-modified-since'] ?? null })),
    resources: await page.evaluate(() => performance.getEntriesByType('resource').filter((e) => /\.mp3/.test(e.name)).map((e) => ({ name: e.name.replace(location.origin, ''), initiator: e.initiatorType, status: e.responseStatus, transferSize: e.transferSize, encodedBodySize: e.encodedBodySize }))),
    idb: await page.evaluate(async () => { const dbs = (await indexedDB.databases()).map((d) => d.name); if (!dbs.includes('czaba-stem-cache-v2')) return { dbs, records: null }; const db = await new Promise((res, rej) => { const r = indexedDB.open('czaba-stem-cache-v2'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); const recs = await new Promise((res) => { const r = db.transaction('entries').objectStore('entries').getAll(); r.onsuccess = () => res(r.result); }); db.close(); return { dbs, records: recs.map((x) => ({ key: x.key, size: x.size, etag: x.etag, lastModified: x.lastModified })) }; }),
    opfs: await page.evaluate(async () => { const root = await navigator.storage.getDirectory(); const out = {}; for await (const [name, h] of root.entries()) { if (h.kind === 'directory') { out[name] = []; for await (const [n, f] of h.entries()) out[name].push({ n, size: (await f.getFile()).size }); } else out[name] = 'file'; } return out; }),
    failedText: await page.evaluate(() => /failed to load/.test(document.body?.innerText ?? '')),
  };
  await cdp.send('Network.setBlockedURLs', { urls: [] });
  writeFileSync(outFile, JSON.stringify(out, null, 1));
}
await open('cold');
await open('warm-httpcache-on');
await open('warm-httpcache-off', { disableHttpCache: true });
await open('mp3-blocked-reopen', { disableHttpCache: true, offline: true });
await page.evaluate(async () => { const root = await navigator.storage.getDirectory(); for await (const name of root.keys()) await root.removeEntry(name, { recursive: true }); await new Promise((r) => { const q = indexedDB.deleteDatabase('czaba-stem-cache-v2'); q.onsuccess = q.onerror = q.onblocked = () => r(); }); });
await open('after-clear', { disableHttpCache: true });
writeFileSync(outFile, JSON.stringify(out, null, 1));
await ctx.close();
