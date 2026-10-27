const L = require('./lib.cjs');
const [port, W, method] = [process.argv[2], +process.argv[3], process.argv[4]];
(async () => {
  const browser = await L.launch(); const { page } = await L.newPage(browser, W, { suppress: true });
  await page.goto(`http://127.0.0.1:${port}/store`, { waitUntil: 'networkidle' }).catch(() => {});
  await L.declineCookies(page); await L.sleep(1500);
  await page.evaluate(() => window.scrollTo(0, 800)); await L.sleep(1500);
  await page.evaluate(() => { window.__log = []; const st = document.body.style; const desc = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'top');
    Object.defineProperty(st, 'top', { set(v) { window.__log.push(['top', v, window.scrollY, performance.now() | 0]); desc.set.call(this, v); }, get() { return desc.get.call(this); }, configurable: true });
    window.addEventListener('scroll', () => window.__log.push(['scroll', window.scrollY, performance.now() | 0]), true); });
  const before = await page.evaluate(() => scrollY);
  if (method === 'js') await page.evaluate(() => { [...document.querySelectorAll('header button')].find((e) => e.textContent.trim() === 'Sign In').click(); });
  else if (method === 'hover') { await page.locator('header').getByRole('button', { name: 'Sign In', exact: true }).first().hover(); await L.sleep(500); console.log('after hover y', await page.evaluate(() => scrollY)); await page.mouse.down(); await page.mouse.up(); }
  else await page.locator('header').getByRole('button', { name: 'Sign In', exact: true }).first().click();
  await L.sleep(800);
  console.log(method, 'before', before, 'top', await page.evaluate(() => document.body.style.top), JSON.stringify(await page.evaluate(() => window.__log.slice(0, 12))));
  await browser.close();
})();
