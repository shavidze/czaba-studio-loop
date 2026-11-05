const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path');
const BASE = 'http://127.0.0.1:5173'; const SH = path.join(__dirname, 'shots');
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const tag = `${w}x${h}`; const R = {}; const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
    const errors = []; p.on('pageerror', (e) => errors.push(String(e).slice(0, 140)));
    await p.goto(`${BASE}/products/middle-east`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
    R.p1 = { url: p.url(), title: await p.title(), h1: (await p.locator('h1').first().textContent().catch(() => null))?.trim() };
    await p.screenshot({ path: path.join(SH, `journey-1-product-${tag}.png`) });
    const link = p.getByRole('link', { name: /Try it in the Studio/i }).first();
    R.p1.tryLink = { count: await p.getByRole('link', { name: /Try it in the Studio/i }).count(), href: await link.getAttribute('href').catch(() => null), target: await link.getAttribute('target').catch(() => null) };
    await link.click();
    await p.waitForURL(/studio-lab/, { timeout: 20000 });
    await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 45000 }).catch(() => {});
    await p.waitForTimeout(800);
    R.p2 = { url: p.url(), active: await p.evaluate(() => ({ id: document.activeElement?.getAttribute('data-source-id'), sel: document.activeElement?.getAttribute('aria-selected') })), status: await p.locator('[data-testid="arrangement-status"]').textContent() };
    await p.screenshot({ path: path.join(SH, `journey-2-studio-${tag}.png`) });
    const o = p.locator('[role="option"][data-source-id="demo-middle-east"]'); const bb = await o.boundingBox();
    await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2, { button: 'right' }); await p.waitForTimeout(300);
    R.p3 = { menus: await p.getByRole('menu').count() };
    await p.screenshot({ path: path.join(SH, `journey-3-menu-${tag}.png`) });
    const pP = ctx.waitForEvent('page', { timeout: 10000 }).catch(() => null);
    await p.getByRole('menuitem', { name: 'View in store' }).click();
    const np = await pP;
    if (np) {
      await np.waitForLoadState('networkidle').catch(() => {}); await np.waitForTimeout(1500);
      R.p4 = { url: np.url(), opener: await np.evaluate(() => window.opener === null), title: await np.title(), h1: (await np.locator('h1').first().textContent().catch(() => null))?.trim(), tryLink: await np.getByRole('link', { name: /Try it in the Studio/i }).count() };
      await np.screenshot({ path: path.join(SH, `journey-4-newtab-${tag}.png`) }); await np.close();
    } else R.p4 = null;
    await p.bringToFront(); await p.waitForTimeout(300);
    R.studioAfter = { url: p.url(), menus: await p.getByRole('menu').count(), active: await p.evaluate(() => document.activeElement?.getAttribute('data-source-id')) };
    R.errors = errors; out[tag] = R; await ctx.close();
  }
  fs.writeFileSync(path.join(__dirname, 'journey.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); await b.close();
})();
