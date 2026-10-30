// NO-SHIFT-204: header boxes, closed mobile wrapper, showcase CTA block. node noshift.cjs <port> <W> <label>
const L = require('./lib.cjs'); const path = require('path');
const [PORT, Ws, LABEL] = process.argv.slice(2); const W = +Ws;
(async () => {
  const browser = await L.launch(); const R = {};
  for (const [pg, signedIn] of [['/', false], ['/store', true]]) {
    const { page, ctx } = await L.newPage(browser, W, { signedIn });
    await page.goto(`http://127.0.0.1:${PORT}${pg}`, { waitUntil: 'load', timeout: 180000 }); await L.sleep(3000); await L.declineCookies(page); await L.sleep(500); await page.mouse.move(2, L.H(W) - 2); await L.sleep(400);
    const hdr = await page.evaluate(() => { const h = document.querySelector('header'); const sy = scrollY; return [...h.querySelectorAll('*')].filter((e) => !(e instanceof SVGElement) || e.tagName === 'svg').map((e) => { const r = e.getBoundingClientRect(); const t = (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 18); return [e.tagName + ':' + t, [r.x, r.y + sy, r.width, r.height].map((v) => +v.toFixed(1)), getComputedStyle(e).visibility]; }); });
    R[`header${pg}${signedIn ? '-in' : ''}`] = hdr;
    if (pg === '/') {
      const sc = await page.evaluate(async () => { const s = [...document.querySelectorAll('section')].find((x) => /Mixdown/i.test(x.textContent) && x.querySelector('a[href="/store"]')); const a = [...s.querySelectorAll('a[href="/store"]')].find((x) => /Browse the Collection/.test(x.textContent)); a.scrollIntoView({ block: 'center', behavior: 'instant' }); return true; });
      await L.sleep(3000);
      R.showcase = await page.evaluate(() => { const sy = scrollY; const s = [...document.querySelectorAll('section')].find((x) => /Mixdown/i.test(x.textContent) && x.querySelector('a[href="/store"]')); const a = [...s.querySelectorAll('a[href="/store"]')].find((x) => /Browse the Collection/.test(x.textContent)); const bx = (e) => { const r = e.getBoundingClientRect(); return [r.x, r.y + sy, r.width, r.height].map((v) => +v.toFixed(1)); }; const wrap = a.closest('.text-center'); return { section: bx(s), h2: bx(s.querySelector('h2')), cta: bx(a), ctaWrap: bx(wrap), span: bx(a.querySelector('span')), svg: bx(a.querySelector('svg')), features: [...s.querySelectorAll('h3')].map(bx), docH: document.documentElement.scrollHeight }; });
    }
    await ctx.close();
  }
  L.save(path.join(L.OUT, 'noshift', `${LABEL}-${W}.json`), R); console.log(LABEL, W, 'ok');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
