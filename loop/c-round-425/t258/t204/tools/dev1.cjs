const L = require('./lib.cjs'); const path = require('path');
const [PORT, Ws] = process.argv.slice(2); const W = +Ws;
const RULED = 'inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 font-semibold text-background transition-[background-color,transform] hover:scale-105 active:scale-[0.98]';
(async () => {
  const browser = await L.launch(); const R = {};
  for (const mode of ['shipped', 'ruled']) {
    const { page, ctx } = await L.newPage(browser, W);
    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load', timeout: 180000 }); await L.sleep(3000); await L.declineCookies(page);
    await page.evaluate(() => { const s = [...document.querySelectorAll('section')].find((x) => /Mixdown/i.test(x.textContent) && x.querySelector('a[href="/store"]')); window.__a = [...s.querySelectorAll('a[href="/store"]')].find((x) => /Browse the Collection/.test(x.textContent)); window.__a.scrollIntoView({ block: 'center', behavior: 'instant' }); });
    await L.sleep(3000);
    if (mode === 'ruled') await page.evaluate((c) => { window.__a.className = c; }, RULED);
    await L.sleep(300);
    const rd = () => page.evaluate(() => { const c = getComputedStyle(window.__a); return [c.transform, c.scale, c.transitionProperty, c.backgroundColor]; });
    const b = await page.evaluate(() => { const r = window.__a.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
    const rest = await rd(); await page.mouse.move(b[0], b[1]); const seq = []; for (const t of [20, 40, 80, 150, 340]) { await L.sleep(t - (seq.length ? [20, 40, 80, 150, 340][seq.length - 1] : 0)); seq.push([t, ...(await rd())]); }
    await page.mouse.down(); await L.sleep(300); const press = await rd(); await page.mouse.up();
    R[mode] = { rest, seq, press }; await ctx.close();
  }
  L.save(path.join(L.OUT, 'showcase', `dev1-${W}.json`), R); console.log(JSON.stringify(R, null, 0));
  await browser.close();
})();
