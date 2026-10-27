const F = require('./fl.cjs'); const path = require('path');
const PORT = process.argv[2]; const W = 375, H = 812;
const eff = (sel) => { const out = []; for (const a of document.querySelectorAll(sel)) { let o = 1, n = a; while (n && n.nodeType === 1) { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; } out.push([a.textContent.trim().slice(0, 14), +o.toFixed(2), getComputedStyle(a).visibility]); } return out; };
(async () => {
  const browser = await F.launch(); const { ctx, page } = await F.newPage(browser, W, H, {}); const log = [];
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' }); await F.sleep(3500); await F.declineCookies(page);
  const tog = page.locator('button[aria-label="Toggle menu"]');
  log.push(['closed', await tog.getAttribute('aria-expanded'), await page.evaluate(eff, '#header-mobile-menu a, #header-mobile-menu button')]);
  await tog.focus(); await page.keyboard.press('Enter'); await F.sleep(500);
  log.push(['open', await tog.getAttribute('aria-expanded'), await page.evaluate(eff, '#header-mobile-menu a, #header-mobile-menu button')]);
  const seq = []; for (let i = 0; i < 6; i++) { await page.keyboard.press('Tab'); await F.sleep(200); seq.push(await page.evaluate(() => document.activeElement.textContent.trim().slice(0, 14))); } log.push(['tab in open', seq]);
  await tog.focus(); await page.keyboard.press('Enter'); await F.sleep(100); log.push(['closing t+100', await page.evaluate(eff, '#header-mobile-menu a')]);
  await F.sleep(500); log.push(['closed t+600', await page.evaluate(eff, '#header-mobile-menu a')]);
  // showcase reveal by scroll only
  await page.evaluate(() => document.activeElement.blur());
  const cta = page.locator('section a[href="/store"]', { hasText: 'Browse the Collection' }).last();
  const y = await cta.evaluate((a) => a.getBoundingClientRect().top + scrollY);
  await page.mouse.wheel(0, 0); await page.evaluate((yy) => window.scrollTo(0, yy - 500), y); await F.sleep(2500);
  log.push(['showcase scroll', await cta.evaluate((a) => { let o = 1, n = a; while (n && n.nodeType === 1) { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; } return +o.toFixed(2); }), await page.evaluate(() => { const s = [...document.querySelectorAll('section')].find((x) => x.textContent.includes('Personal Mixdown')); return s && s.getBoundingClientRect().height; })]);
  await page.screenshot({ path: path.join(__dirname, '..', 'out', `showcase-scroll-${PORT}-375.png`) });
  F.save(path.join(__dirname, '..', 'out', `mobile-${PORT}.json`), log); for (const l of log) console.log(JSON.stringify(l));
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
