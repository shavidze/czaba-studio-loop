const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const out = {};
(async () => {
  const browser = await chromium.launch();
  for (const [w, h] of [[1440, 900]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto('http://127.0.0.1:5173/studio-lab');
    await page.getByText('Demo collection ready').first().waitFor({ timeout: 150000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const r = {};
    const T = '[data-testid="arrangement-transport"]';
    r.buttons = await page.$$eval(`${T} button`, (bs) => bs.map((b) => ({ text: (b.textContent || '').trim().slice(0, 20), title: b.getAttribute('title'), disabled: b.disabled, ariaDisabled: b.getAttribute('aria-disabled') })));
    await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
    const stops = [];
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      const s = await page.evaluate(() => { const a = document.activeElement; const t = a && a.closest('[data-testid="arrangement-transport"]'); if (!t) return null; const cs = getComputedStyle(a); return { name: (a.getAttribute('aria-label') || a.textContent || a.tagName).trim().slice(0, 24), aria: a.getAttribute('aria-disabled'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, btnOpacity: cs.opacity }; });
      if (s && !stops.some((x) => x.name === s.name)) stops.push(s);
    }
    r.transportTabStops = stops;
    const soft = page.locator(`${T} button[aria-disabled="true"]`);
    r.softCount = await soft.count();
    const status = () => page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent?.trim());
    const statusBefore = await status();
    const noop = [];
    for (let i = 0; i < r.softCount; i++) {
      const b = soft.nth(i);
      const name = ((await b.getAttribute('aria-label')) || (await b.textContent()) || '').trim().slice(0, 20);
      const restBg = await b.evaluate((e) => getComputedStyle(e).backgroundColor);
      const childOpacity = await b.evaluate((e) => (e.firstElementChild ? getComputedStyle(e.firstElementChild).opacity : null));
      await b.hover(); await page.waitForTimeout(300);
      const hover = await b.evaluate((e) => ({ bg: getComputedStyle(e).backgroundColor, cursor: getComputedStyle(e).cursor }));
      await page.mouse.down(); await page.waitForTimeout(250);
      const pressed = await b.evaluate((e) => getComputedStyle(e).transform);
      await page.mouse.up();
      const activeAfterClick = await page.evaluate(() => document.activeElement?.tagName + ':' + (document.activeElement?.textContent || '').trim().slice(0, 12));
      await b.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
      noop.push({ name, restBg, hoverBg: hover.bg, cursor: hover.cursor, pressedTransform: pressed, childOpacity, activeAfterClick, statusSame: (await status()) === statusBefore });
    }
    r.noop = noop; r.cursorControl = await page.evaluate(() => { const host = document.querySelector('[data-testid="arrangement-transport"]'); const a = document.createElement('button'); a.disabled = true; a.className = 'disabled:cursor-not-allowed'; const b = document.createElement('button'); b.setAttribute('aria-disabled', 'true'); b.className = 'aria-disabled:cursor-not-allowed'; host.append(a, b); const res = { nativeDisabledWithDisabledCursorToken: getComputedStyle(a).cursor, ariaDisabledWithToken: getComputedStyle(b).cursor }; a.remove(); b.remove(); return res; });
    r.statusBefore = statusBefore; r.statusAfter = await status();
    await page.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/a-round-276/a276-${w}.png` });
    out[`${w}x${h}`] = r;
    await page.close();
  }
  await browser.close();
  require('fs').writeFileSync(__dirname + '/probe-1440.json', JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})();
