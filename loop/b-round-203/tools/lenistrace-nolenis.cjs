const F = require('./fl.cjs'); const path = require('path');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : W === 1280 ? 720 : 812;
(async () => {
  const browser = await F.launch(); const { ctx, page } = await F.newPage(browser, W, H, {});
  let stubbed = 0; await page.route(/\/deps\/lenis\.js/, (route) => { stubbed++; route.fulfill({ status: 200, contentType: 'application/javascript', body: 'export default class Lenis { constructor(){} raf(){} destroy(){} on(){} scrollTo(){} };' }); });
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' }); await F.sleep(3500); await F.declineCookies(page); await page.mouse.move(2, H - 2);
  const st = () => { const a = document.activeElement; const r = a.getBoundingClientRect(); return [(a.textContent || a.tagName).trim().slice(0, 18), Math.round(scrollY), Math.round(r.top), r.bottom <= 0 || r.top >= innerHeight ? 'OFF' : 'on']; };
  const log = []; log.push(['start', await page.evaluate(st), 'stubbed', stubbed, 'htmlClass', await page.evaluate(() => document.documentElement.className)]);
  await page.keyboard.press('End'); await F.sleep(2500); log.push(['End', await page.evaluate(st), await page.evaluate(() => document.documentElement.scrollHeight)]);
  for (let i = 0; i < 16; i++) { await page.keyboard.press('Shift+Tab'); const a = await page.evaluate(st); await F.sleep(1500); log.push(['S-Tab', a, await page.evaluate(st)]); }
  F.save(path.join(__dirname, '..', 'out', `lenistrace-nolenis-${PORT}-${W}.json`), log); for (const l of log) console.log(JSON.stringify(l));
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
