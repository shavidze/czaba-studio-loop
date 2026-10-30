// NO-SHIFT-205: popup element boxes + text per step. usage: node noshift.cjs <port> <W> <tag>
const L = require('./lib.cjs'); const path = require('path');
const [port, W, tag] = [process.argv[2], +process.argv[3], process.argv[4]];
const boxes = (page) => page.evaluate(() => {
  const fx = [...document.querySelectorAll('div.fixed')].find((x) => /FREE DOWNLOAD|CLAIM YOUR OFFER|mystery pack/i.test(x.innerText || ''));
  if (!fx) return null;
  const pick = [...fx.querySelectorAll('button, h2, input, span, p, form, div')];
  const o = {};
  pick.forEach((e, i) => { const r = e.getBoundingClientRect(); const k = `${i}:${e.tagName}:${(e.getAttribute('aria-label') || e.getAttribute('placeholder') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30)}`; o[k] = [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(2)); });
  const r = fx.getBoundingClientRect();
  return { root: [r.x, r.y, r.width, r.height], text: fx.innerText.replace(/\s+/g, ' ').trim(), els: o };
});
(async () => {
  const browser = await L.launch(); const { page, log } = await L.newPage(browser, W);
  await page.route('**/api/subscribe', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' }).catch(() => {});
  await L.declineCookies(page); await L.sleep(1200); await L.scrollTo55(page);
  await L.waitPopup(page); await L.sleep(1500);
  await page.mouse.move(1, 1);
  const out = { offer: await boxes(page) };
  await page.screenshot({ path: path.join(L.SHOTS, `noshift-offer-${tag}-${W}.png`) });
  await page.locator('div.fixed button').filter({ hasText: 'FREE DOWNLOAD' }).click(); await L.sleep(1500); await page.mouse.move(1, 1); await L.sleep(400);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  out.email = await boxes(page);
  await page.screenshot({ path: path.join(L.SHOTS, `noshift-email-${tag}-${W}.png`) });
  await page.locator('div.fixed input[type="email"]').fill('n205@example.com');
  await page.locator('div.fixed button').filter({ hasText: 'CONTINUE' }).click(); await L.sleep(1800); await page.mouse.move(1, 1);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  out.success = await boxes(page);
  await page.screenshot({ path: path.join(L.SHOTS, `noshift-success-${tag}-${W}.png`) });
  out.errors = log.errors;
  L.save(path.join(L.OUT, 'noshift', `${tag}-${W}.json`), out); console.log(tag, W, 'done', Object.keys(out.offer.els).length, Object.keys(out.email.els).length, Object.keys(out.success.els).length);
  await browser.close();
})();
