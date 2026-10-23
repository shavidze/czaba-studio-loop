const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|localhost:5199|firebase|Download the React DevTools/i;
(async () => {
  const browser = await chromium.launch({ headless: true });
  const out = { utc: new Date().toISOString(), head: "1fe3ba2", steps: [], errors: [], forbidden: [] };
  for (const kind of ['collapse', 'expand', 'clear']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();
    page.on('console', (m) => { if ((m.type() === 'error') && !NOISE.test(m.text())) out.errors.push(kind + ' ' + m.text().slice(0, 200)); });
    page.on('pageerror', (e) => out.errors.push(kind + ' pageerror ' + String(e).slice(0, 200)));
    page.on('request', (q) => { if (/studio-token|recording-|\/api\/download|r2|workers\.dev/.test(q.url()) || q.headers().authorization) out.forbidden.push(q.url()); });
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
    await sleep(2500);
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
    const t0 = Date.now();
    while (Date.now() - t0 < 90000) { const n = await page.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].filter((o) => /იტვირთება…/.test(o.textContent)).length); if (n === 0) break; await sleep(250); }
    await sleep(500);
    const st = (label) => page.evaluate((label) => ({ label, active: document.activeElement ? (document.activeElement.getAttribute('data-testid') || document.activeElement.getAttribute('aria-label') || document.activeElement.tagName) : null, clips: document.querySelectorAll('[data-clip-id]').length, collapsed: document.querySelector('[data-testid=arrangement-library]')?.dataset.collapsed, status: document.querySelector('[data-testid=arrangement-status]')?.textContent ?? null }), label);
    const o = page.locator('[role=option][data-source-id="demo-middle-east"]');
    await o.focus(); await sleep(150); await page.keyboard.press('ArrowDown'); await sleep(150);
    out.steps.push({ kind, ...(await st('after selecting a library item')) });
    if (kind === 'collapse') { await page.focus('[data-testid=arrangement-library-collapse]'); }
    if (kind === 'expand') { await page.click('[data-testid=arrangement-library-collapse]'); await sleep(300); await page.focus('[data-testid=arrangement-library-expand]'); }
    if (kind === 'clear') { await page.fill('[data-testid=arrangement-library-search]', 'mid'); await sleep(300); await page.focus('[data-testid=arrangement-library-search-clear]'); }
    out.steps.push({ kind, ...(await st('focused button')) });
    await page.keyboard.press('Enter'); await sleep(500);
    out.steps.push({ kind, ...(await st('after Enter 1')) });
    await page.keyboard.press('Enter'); await sleep(900);
    out.steps.push({ kind, ...(await st('after Enter 2')) });
    await page.screenshot({ path: `lib-${kind}-1280x720.png` });
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync('lib-focus-probe-result.json', JSON.stringify(out, null, 1));
  for (const s of out.steps) console.log(JSON.stringify(s));
  console.log('errors', out.errors.length, 'forbidden', out.forbidden.length);
})();
