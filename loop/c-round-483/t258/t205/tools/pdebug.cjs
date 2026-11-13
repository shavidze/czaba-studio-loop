const L = require('./lib.cjs'); const path = require('path');
(async () => {
  const browser = await L.launch(); const { page, log } = await L.newPage(browser, 1280, { suppress: true });
  await page.goto(`http://127.0.0.1:${process.argv[2]}/studio-lab`, { waitUntil: 'networkidle' }); await L.sleep(3000); await L.declineCookies(page); await L.sleep(500);
  const add = page.locator('button').filter({ hasText: /^\s*Add\s*$/ }); console.log('add buttons', await add.count(), await add.last().textContent());
  await add.last().click(); await L.sleep(2000);
  console.log('status', await page.evaluate(() => document.body.innerText.match(/Nothing to play[^\n]*|end \d\d:\d\d\.\d{3}/g)));
  const pb = page.locator('button[aria-label="Play"]'); console.log('play disabled', await pb.isDisabled());
  await pb.click(); await L.sleep(1000);
  console.log('after click', await page.evaluate(() => [...document.querySelectorAll('button[aria-label]')].filter((x) => /^(Play|Pause)$/.test(x.getAttribute('aria-label'))).map((x) => x.getAttribute('aria-label'))), await page.evaluate(() => document.body.innerText.match(/\d\d:\d\d\.\d{3}/g).slice(0, 3)));
  await page.screenshot({ path: path.join(L.SHOTS, 'pdebug.png') }); console.log(JSON.stringify(log.errors));
  await browser.close();
})();
