const { createRequire } = require('node:module');
const fs = require('node:fs');
const req = createRequire('/tmp/b216-probe/package.json');
const { chromium } = req('@playwright/test');
const routes = ['/studio-lab', '/', '/studio/middle-east'];
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = [];
  for (let run = 1; run <= 3; run++) for (const route of routes) {
    const t0 = Date.now();
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    const reqs = new Map();
    cdp.on('Network.responseReceived', (e) => { reqs.set(e.requestId, { url: e.response.url, type: e.type, status: e.response.status, encoded: 0, decoded: 0 }); });
    cdp.on('Network.dataReceived', (e) => { const r = reqs.get(e.requestId); if (r) r.decoded += e.dataLength; });
    cdp.on('Network.loadingFinished', (e) => { const r = reqs.get(e.requestId); if (r) { r.encoded = e.encodedDataLength; r.done = true; } });
    const bodies = [];
    page.on('response', async (resp) => { if (resp.request().resourceType() === 'script') { try { bodies.push({ url: resp.url(), len: (await resp.body()).length }); } catch {} } });
    const resp = await page.goto(`http://127.0.0.1:5197${route}`, { waitUntil: 'load', timeout: 60000 });
    let readyOk = null;
    if (route === '/studio-lab') {
      readyOk = await page.waitForFunction(() => { const a = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Add'); return !!(a && !a.disabled && document.querySelector('[data-testid="arrangement-library-preview-wave"] rect')); }, undefined, { timeout: 60000 }).then(() => true, () => false);
      await page.waitForTimeout(2000);
    } else {
      await page.waitForTimeout(5000);
    }
    const res = await page.evaluate(() => performance.getEntriesByType('resource').filter((e) => e.initiatorType === 'script' || /\.m?js(\?|$)/.test(e.name)).map((e) => ({ name: e.name, transfer: e.transferSize, encoded: e.encodedBodySize, decoded: e.decodedBodySize })));
    const nav = await page.evaluate(() => { const n = performance.getEntriesByType('navigation')[0]; return { transfer: n.transferSize, decoded: n.decodedBodySize }; });
    const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 300);
    const loading = await page.getByText(/Loading…|Loading\.\.\./).count();
    const scripts = [...reqs.values()].filter((r) => r.type === 'Script');
    const own = scripts.filter((r) => r.url.startsWith('http://127.0.0.1:5197'));
    const third = scripts.filter((r) => !r.url.startsWith('http://127.0.0.1:5197'));
    const failed = [...reqs.values()].filter((r) => r.status >= 400).map((r) => `${r.status} ${r.url}`);
    out.push({ run, route, status: resp.status(), readyOk, ms: Date.now() - t0,
      cdp: { count: scripts.length, encoded: scripts.reduce((s, r) => s + r.encoded, 0), decoded: scripts.reduce((s, r) => s + r.decoded, 0), ownCount: own.length, ownEncoded: own.reduce((s, r) => s + r.encoded, 0), ownDecoded: own.reduce((s, r) => s + r.decoded, 0), thirdParty: third.map((r) => ({ url: r.url, enc: r.encoded, dec: r.decoded })), notFinished: scripts.filter((r) => !r.done).length },
      bodyBytes: bodies.reduce((s, b) => s + b.len, 0), bodyCount: bodies.length,
      resourceTiming: { count: res.length, transfer: res.reduce((s, e) => s + e.transfer, 0), encoded: res.reduce((s, e) => s + e.encoded, 0), decoded: res.reduce((s, e) => s + e.decoded, 0) },
      nav, failed, loadingText: loading, text, files: own.map((r) => `${r.url.split('/').pop()} ${r.encoded}/${r.decoded}`) });
    await context.close();
  }
  fs.writeFileSync(__dirname + '/js-bytes.json', JSON.stringify(out, null, 1));
  for (const r of out) console.log(r.run, r.route, r.status, 'ready', r.readyOk, 'scripts', r.cdp.count, 'enc', r.cdp.encoded, 'dec', r.cdp.decoded, 'own', r.cdp.ownEncoded, r.cdp.ownDecoded, 'body', r.bodyBytes, 'RT', JSON.stringify(r.resourceTiming), 'third', r.cdp.thirdParty.length, 'unfinished', r.cdp.notFinished, 'loading', r.loadingText, 'ms', r.ms);
  const s = out.filter((r) => r.run === 1);
  for (const r of s) console.log('\n', r.route, 'failed:', r.failed.slice(0, 8), '\n text:', r.text, '\n third:', JSON.stringify(r.cdp.thirdParty));
  await browser.close();
})();
