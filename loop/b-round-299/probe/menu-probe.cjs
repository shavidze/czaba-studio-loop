const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const base = process.argv[2]; const tag = process.argv[3]; const out = __dirname;
const active = (page) => page.evaluate(() => { const a = document.activeElement; return { tag: a?.tagName, role: a?.getAttribute('role'), id: a?.getAttribute('data-source-id'), text: a?.textContent?.trim().slice(0, 40) }; });
(async () => {
  const browser = await chromium.launch();
  const result = { base, tag, viewports: {} };
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const r = {}; const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' }).catch(() => {});
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent?.includes('ready'), null, { timeout: 30000 }).catch(() => {});
    await page.evaluate(() => { window.__ctx = []; window.addEventListener('contextmenu', (e) => window.__ctx.push({ t: e.target?.closest?.('[data-source-id]')?.getAttribute('data-source-id') ?? e.target?.tagName, prevented: e.defaultPrevented })); window.__blur = 0; window.addEventListener('blur', () => { window.__blur += 1; }); });
    const mapped = page.locator('[role="option"][data-source-id="demo-middle-east"]');
    const unmapped = page.locator('[role="option"][data-source-id="demo-hero-music"]');
    await unmapped.click({ button: 'right' });
    await page.waitForTimeout(200);
    r.unmappedMenus = await page.getByRole('menu').count();
    await page.keyboard.press('Escape');
    await mapped.click({ button: 'right' });
    await page.waitForTimeout(200);
    r.mappedMenus = await page.getByRole('menu').count();
    r.items = await page.getByRole('menuitem').count();
    r.item = await page.getByRole('menuitem', { name: 'View in store' }).evaluate((a) => ({ tag: a.tagName, href: a.getAttribute('href'), target: a.target, rel: a.rel, focusVisible: a.matches(':focus-visible'), outline: getComputedStyle(a).outlineStyle + ' ' + getComputedStyle(a).outlineWidth })).catch((e) => String(e));
    r.activeOpen = await active(page);
    r.menuBox = await page.getByRole('menu').boundingBox();
    await page.screenshot({ path: `${out}/shots/${tag}-menu-${w}.png` });
    r.ctx = await page.evaluate(() => window.__ctx);
    const popupP = ctx.waitForEvent('page', { timeout: 10000 }).catch(() => null);
    await page.getByRole('menuitem', { name: 'View in store' }).click();
    const popup = await popupP;
    r.popupUrl = popup ? popup.url() : null;
    if (popup) { await popup.waitForLoadState('domcontentloaded').catch(() => {}); r.popupUrl = popup.url(); r.popupOpener = await popup.evaluate(() => window.opener === null); }
    await page.waitForTimeout(300);
    r.menusAfterClick = await page.getByRole('menu').count();
    r.activeAfterClick = await active(page);
    r.blurCount = await page.evaluate(() => window.__blur);
    if (popup) await popup.close();
    await page.bringToFront();
    // keyboard: Shift+F10 then Enter
    await mapped.focus();
    await page.keyboard.press('Shift+F10');
    await page.waitForTimeout(200);
    r.kbdMenus = await page.getByRole('menu').count();
    r.kbdActive = await active(page);
    r.kbdItemFocusVisible = await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { fv: a.matches(':focus-visible'), outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor }; });
    await page.screenshot({ path: `${out}/shots/${tag}-kbd-menu-${w}.png` });
    const popup2P = ctx.waitForEvent('page', { timeout: 10000 }).catch(() => null);
    await page.keyboard.press('Enter');
    const popup2 = await popup2P;
    r.enterPopupUrl = popup2 ? popup2.url() : null;
    if (popup2) { await popup2.waitForLoadState('domcontentloaded').catch(() => {}); r.enterPopupUrl = popup2.url(); await popup2.close(); }
    await page.waitForTimeout(300);
    r.activeAfterEnter = await active(page);
    r.clips = await page.locator('[data-testid^="arrangement-clip"]').count();
    r.errors = errors;
    result.viewports[w] = r;
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(`${out}/menu-${tag}.json`, JSON.stringify(result, null, 1));
  console.log(JSON.stringify(result, null, 1));
})();
