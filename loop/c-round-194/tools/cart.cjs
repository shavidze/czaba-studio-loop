// C round 193 — S7 attempt: add to cart -> /cart -> Remove -> ConfirmDialog; record variant (destructive vs default) and colours. tree only (+head colours). node cart.cjs
const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path');
const SH = path.join(L.ROOT, 'shots', 'cart'); fs.mkdirSync(SH, { recursive: true });
(async () => { const b = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text'] }); const res = {};
  for (const [tag, base] of [['tree', 'http://127.0.0.1:5173'], ['head', 'http://127.0.0.1:5174']]) { const r = res[tag] = { steps: [] };
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }); await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} }); const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(String(e).slice(0, 200))); const api = []; page.on('response', (q) => { if (/\/api\/cart/.test(q.url())) api.push(q.request().method() + ' ' + q.url().replace(/^https?:\/\/[^/]+/, '') + ' ' + q.status()); });
    await page.goto(base + '/products/middle-east', { waitUntil: 'load' }); await page.waitForFunction(() => document.querySelector('footer'), null, { timeout: 60000 }).catch(() => {}); await L.sleep(3000);
    const add = page.locator('button', { hasText: 'Add to Cart' }).first(); r.addBtn = await add.count(); if (r.addBtn) { await add.click(); await L.sleep(2500); r.steps.push('clicked Add to Cart'); }
    await page.goto(base + '/cart', { waitUntil: 'load' }); await page.waitForFunction(() => document.querySelector('footer'), null, { timeout: 60000 }).catch(() => {}); await L.sleep(3000);
    r.cartText = (await page.evaluate(() => document.querySelector('main') ? document.querySelector('main').innerText : '')).replace(/\s+/g, ' ').slice(0, 300);
    const rm = page.locator('main button[aria-label*="Remove" i], main button:has-text("Remove")').first(); r.removeBtn = await rm.count();
    if (r.removeBtn) { await rm.click(); await L.sleep(1200); r.dialog = await page.evaluate(() => { const d = document.querySelector('[role=dialog], [role=alertdialog]'); if (!d) return null; const btns = [...d.querySelectorAll('button')].map((x) => ({ text: x.innerText.trim(), cls: String(x.className).slice(0, 200), color: getComputedStyle(x).color, bg: getComputedStyle(x).backgroundColor })); return { text: d.innerText.replace(/\s+/g, ' ').slice(0, 200), btns }; }); await page.screenshot({ path: path.join(SH, `${tag}-confirm.png`) }); }
    r.api = api; r.errs = errs; await page.screenshot({ path: path.join(SH, `${tag}-cart.png`) }); await ctx.close(); }
  await b.close(); L.save(L.OUT, 'cart.json', res); console.log(JSON.stringify(res, null, 1).slice(0, 3000)); })();
