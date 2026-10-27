const L = require('./lib.cjs'); const path = require('path');
const [PORT, LABEL] = process.argv.slice(2);
(async () => {
  const browser = await L.launch(); const { page } = await L.newPage(browser, 1280); const R = {};
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load', timeout: 180000 }); await L.sleep(3000); await L.declineCookies(page); await L.sleep(300);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click(); await L.sleep(800);
  R.signIn = await page.evaluate(() => ({ emailInputs: document.querySelectorAll('input[type="email"]').length, headings: [...document.querySelectorAll('h2,h3')].filter((h) => /sign in|welcome/i.test(h.textContent)).length }));
  await page.keyboard.press('Escape'); await L.sleep(500);
  R.cart = await page.evaluate(() => { const a = document.querySelector('header a[href="/cart"]'); return a && { label: a.getAttribute('aria-label') || a.textContent.trim(), tag: a.tagName }; });
  R.palette = await page.evaluate(() => !!document.querySelector('header button[aria-label*="Search"], header button[title*="Search"]') || [...document.querySelectorAll('header button')].some((b) => /Search/.test(b.textContent + (b.getAttribute('aria-label') || ''))));
  await page.locator('header button', { hasText: /Search/ }).first().click().catch(() => {}); await L.sleep(600);
  R.paletteOpen = await page.evaluate(() => !!document.querySelector('input[placeholder*="earch"]') && [...document.querySelectorAll('input')].some((i) => document.activeElement === i));
  await page.keyboard.press('Escape'); await L.sleep(300);
  R.latestReleasesCta = await page.evaluate(() => [...document.querySelectorAll('a[href="/store"]')].filter((a) => /Browse the Collection/.test(a.textContent)).map((a) => [a.closest('section') ? (a.closest('section').querySelector('h2') || {}).textContent : null, a.tabIndex]));
  L.save(path.join(L.OUT, `adjacent-${LABEL}.json`), R); console.log(LABEL, JSON.stringify(R)); await browser.close();
})();
