// SHOWCASE (b3): instant jump to bottom (like restored scroll / anchor), then Shift+Tab 1.2 s apart.
const L = require('./lib.cjs'); const path = require('path');
const [PORT, Ws, LABEL, MODE] = process.argv.slice(2); const W = +Ws;
(async () => {
  const browser = await L.launch(); const { page } = await L.newPage(browser, W);
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load', timeout: 180000 }); await L.sleep(3000); await L.declineCookies(page); await L.sleep(300);
  await page.evaluate(() => { const s = [...document.querySelectorAll('section')].find((x) => /Mixdown/i.test(x.textContent) && x.querySelector('a[href="/store"]')); window.__s = s; window.__a = [...s.querySelectorAll('a[href="/store"]')].find((x) => /Browse the Collection/.test(x.textContent)); });
  if (MODE === 'reload') { await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await L.sleep(1500); await page.reload({ waitUntil: 'load' }); await L.sleep(3500); await page.evaluate(() => { const s = [...document.querySelectorAll('section')].find((x) => /Mixdown/i.test(x.textContent) && x.querySelector('a[href="/store"]')); window.__s = s; window.__a = [...s.querySelectorAll('a[href="/store"]')].find((x) => /Browse the Collection/.test(x.textContent)); }); }
  else { await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await L.sleep(1500); }
  const startY = await page.evaluate(() => Math.round(scrollY));
  let n = 0; for (; n < 30; n++) { await page.keyboard.press('Shift+Tab'); await L.sleep(1200); if (await page.evaluate(() => document.activeElement === window.__a)) break; }
  const EFF = () => page.evaluate(() => { const out = []; let o = 1, n = window.__a; while (n && n.nodeType === 1) { const v = parseFloat(getComputedStyle(n).opacity); if (v < 1) out.push([n === window.__s ? 'SECTION' : window.__s.contains(n) ? 'in' : 'outside', v]); o *= v; n = n.parentElement; } const r = window.__a.getBoundingClientRect(); return { eff: +o.toFixed(3), below1: out, top: Math.round(r.top), onScreen: r.bottom > 0 && r.top < innerHeight, focused: document.activeElement === window.__a, scrollY: Math.round(scrollY) }; });
  const t0 = Date.now(); let first = null; while (Date.now() - t0 < 2500) { const e = await EFF(); if (!first && e.eff >= 0.99) first = Date.now() - t0; await L.sleep(100); }
  const last = await EFF(); await L.sleep(3000); const at5s = await EFF();
  await page.screenshot({ path: path.join(L.SHOTS, `showcase-b3-${MODE}-${LABEL}-${W}.png`) });
  const R = { PORT, W, LABEL, MODE, startY, shiftTabs: n + 1, firstMs: first, last, at5s, popup: await L.popupOpen(page) };
  L.save(path.join(L.OUT, 'showcase', `b3-${MODE}-${LABEL}-${W}.json`), R); console.log(JSON.stringify(R));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
