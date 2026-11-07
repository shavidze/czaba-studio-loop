// C round 203: newsletter fresh-click debug (why the 2nd click does not focus)
const F = require('./fl.cjs');
(async () => { const b = await F.launch(); const { ctx, page } = await F.newPage(b, 1280, 720);
  await page.goto(`http://127.0.0.1:${process.argv[2]}/`, { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page);
  const loc = page.locator('input[placeholder="Enter your email"]');
  for (let i = 0; i < 3; i++) {
    await loc.scrollIntoViewIfNeeded(); await F.sleep(1200); const bb = await loc.boundingBox();
    const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + ' ' + (e.className || '').toString().slice(0, 80) : null; }, [bb.x + 12, bb.y + bb.height / 2]);
    await page.mouse.click(bb.x + 12, bb.y + bb.height / 2); await F.sleep(300);
    const a = await page.evaluate(() => document.activeElement.tagName + ' ' + (document.activeElement.placeholder || ''));
    console.log(i, JSON.stringify(bb), 'hit', hit, 'active', a, 'scrollY', await page.evaluate(() => scrollY));
    if (i === 0) { await page.keyboard.press('Escape'); await F.sleep(300); console.log('esc', await page.evaluate(() => document.activeElement.tagName)); }
    if (i === 1) { await page.keyboard.press('ArrowDown'); await F.sleep(500); console.log('down', await page.evaluate(() => [document.activeElement.tagName, document.documentElement.dataset.focusSource, scrollY])); }
    await page.evaluate(() => document.activeElement.blur()); await F.sleep(200);
  }
  await b.close(); })();
