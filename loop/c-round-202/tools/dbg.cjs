const F = require('./fl.cjs');
(async () => { const b = await F.launch(); const { page } = await F.newPage(b, 1280, 720);
  await page.goto('http://127.0.0.1:5173/store', { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await F.sleep(500);
  const s = page.locator('input[placeholder^="Search packs"]').first(); const bb = await s.boundingBox();
  console.log(bb, await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e.tagName + ' ' + e.className.slice(0, 80); }, [bb.x + 30, bb.y + bb.height / 2]));
  await page.mouse.click(bb.x + 30, bb.y + bb.height / 2); await F.sleep(300);
  console.log(await page.evaluate(() => document.activeElement.tagName + ' ' + document.activeElement.getAttribute('placeholder')));
  await b.close(); })();
