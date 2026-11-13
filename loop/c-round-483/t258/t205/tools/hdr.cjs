const L = require('./lib.cjs');
(async () => {
  const browser = await L.launch(); const { page } = await L.newPage(browser, 1280, { suppress: true });
  await page.goto(`http://127.0.0.1:${process.argv[2]}/store`, { waitUntil: 'networkidle' }).catch(() => {});
  await L.declineCookies(page); await L.sleep(1500);
  for (const y of [0, 800]) { await page.evaluate((v) => window.scrollTo(0, v), y); await L.sleep(1500);
    console.log(y, JSON.stringify(await page.evaluate(() => { const h = document.querySelector('header'); const r = h.getBoundingClientRect(); const cs = getComputedStyle(h); const b = [...h.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Sign In'); const br = b.getBoundingClientRect(); return { y: scrollY, pos: cs.position, transform: cs.transform, hdr: [r.top, r.height], btn: [br.top, br.height], vis: getComputedStyle(b).visibility, op: cs.opacity }; }))); }
  await browser.close();
})();
