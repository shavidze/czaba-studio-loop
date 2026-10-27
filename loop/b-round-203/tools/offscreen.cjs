const F = require('./fl.cjs'); const path = require('path');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : W === 1280 ? 720 : 812; const RM = process.argv[4] === 'rm';
const pg = process.env.PG || '/';
(async () => {
  const browser = await F.launch(); const { ctx, page } = await F.newPage(browser, W, H, RM ? { reducedMotion: 'reduce' } : {});
  if (RM) await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`http://127.0.0.1:${PORT}${pg}`, { waitUntil: 'load' }); await F.sleep(3500); await F.declineCookies(page); await page.mouse.move(2, H - 2);
  const res = { fwd: [], back: [] };
  const st = () => { const a = document.activeElement; const r = a.getBoundingClientRect(); return { name: (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 24), top: Math.round(r.top), bottom: Math.round(r.bottom), off: r.bottom <= 0 || r.top >= innerHeight, sy: Math.round(scrollY), lenis: document.documentElement.className.includes('lenis') }; };
  for (let i = 0; i < 45; i++) { await page.keyboard.press('Tab'); await F.sleep(1200); res.fwd.push(await page.evaluate(st)); }
  for (let i = 0; i < 20; i++) { await page.keyboard.press('Shift+Tab'); await F.sleep(1200); res.back.push(await page.evaluate(st)); }
  F.save(path.join(__dirname, '..', 'out', `offscreen-${PORT}-${W}${RM ? '-rm' : ''}${pg.replace(/\//g, '_')}.json`), res);
  console.log(PORT, W, RM ? 'reduced' : '', pg, 'lenis', res.fwd[0].lenis, 'fwd off', res.fwd.filter((s) => s.off).length, '/', res.fwd.length, 'back off', res.back.filter((s) => s.off).length, '/', res.back.length, JSON.stringify(res.back.filter((s) => s.off).slice(0, 3)));
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
