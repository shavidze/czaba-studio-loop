const L = require('./lib.cjs');
const [PORT, Ws] = process.argv.slice(2); const W = +Ws;
(async () => {
  const browser = await L.launch(); const { page } = await L.newPage(browser, W);
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load', timeout: 180000 }); await L.sleep(3000); await L.declineCookies(page);
  const anc = () => page.evaluate(() => { const s = [...document.querySelectorAll('section')].find((x) => /Mixdown/i.test(x.textContent) && x.querySelector('a[href="/store"]')); const a = [...s.querySelectorAll('a[href="/store"]')].find((x) => /Browse the Collection/.test(x.textContent)); window.__a = a; const out = []; let n = a; while (n && n.nodeType === 1) { const o = getComputedStyle(n).opacity; if (o !== '1') out.push([n.tagName, (n.className || '').toString().slice(0, 60), o, n === s ? 'SECTION' : s.contains(n) ? 'in' : 'outside']); n = n.parentElement; } return out; });
  console.log('before', JSON.stringify(await anc()));
  await page.evaluate(() => window.__a.focus({ preventScroll: true })); await L.sleep(2500);
  console.log('after focus', JSON.stringify(await anc()), await page.evaluate(() => document.activeElement === window.__a));
  await browser.close();
})();
