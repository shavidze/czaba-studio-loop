const { chromium, sleep, openStudio, arm, save } = require('./lib.cjs');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const net = []; const out = {};
  const { ctx, page } = await openStudio(browser, { width: 1440, height: 900 }, 'nfv-identity-1440x900', net);
  await arm(page);
  const who = () => page.evaluate(() => { const a = document.activeElement; const o = a && a.closest('[role=option]'); return { tag: a?.tagName, role: a?.getAttribute('role'), optionId: o?.getAttribute('data-source-id') ?? null, selfIsOption: a === o, isConnected: a?.isConnected }; });
  await page.locator('[data-testid=arrangement-video-expand]').click(); await sleep(1000);
  await page.locator('[role=option][aria-selected=true]').focus(); out.before = await who();
  await page.evaluate(() => { window.__el = document.activeElement; });
  await page.keyboard.press('Escape'); await sleep(1000);
  out.after = await who();
  out.sameNode = await page.evaluate(() => document.activeElement === window.__el);
  await browser.close(); out.net = net; save('nfv-identity.json', out); console.log(JSON.stringify(out));
})();
