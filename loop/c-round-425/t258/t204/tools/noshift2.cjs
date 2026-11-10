// NO-SHIFT-204 showcase, transform-free layout boxes (offset chain) + opacity state.
const L = require('./lib.cjs'); const path = require('path');
const [PORT, Ws, LABEL] = process.argv.slice(2); const W = +Ws;
(async () => {
  const browser = await L.launch(); const { page } = await L.newPage(browser, W);
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load', timeout: 180000 }); await L.sleep(3000); await L.declineCookies(page);
  await page.evaluate(() => { const s = [...document.querySelectorAll('section')].find((x) => /Mixdown/i.test(x.textContent) && x.querySelector('a[href="/store"]')); window.__s = s; window.__a = [...s.querySelectorAll('a[href="/store"]')].find((x) => /Browse the Collection/.test(x.textContent)); window.__a.scrollIntoView({ block: 'center', behavior: 'instant' }); });
  await L.sleep(3000);
  const R = await page.evaluate(() => { const lb = (e) => { let x = 0, y = 0, n = e; while (n) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return [x, y, e.offsetWidth, e.offsetHeight]; }; const s = window.__s, a = window.__a; const op = (e) => getComputedStyle(e).opacity; return { section: lb(s), h2: lb(s.querySelector('h2')), cta: lb(a), ctaParent: lb(a.parentElement), ctaParentOpacity: op(a.parentElement), headerOpacity: op(s.querySelector('h2').parentElement), span: lb(a.querySelector('span')), feats: [...s.querySelectorAll('h3')].slice(-3).map(lb) }; });
  L.save(path.join(L.OUT, 'noshift', `layout-${LABEL}-${W}.json`), R); console.log(LABEL, W, JSON.stringify(R));
  await browser.close();
})();
