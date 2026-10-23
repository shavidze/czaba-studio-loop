const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<div id="t" tabindex="0">x</div>');
  await page.evaluate(() => { window.log = []; document.addEventListener('keydown', (e) => window.log.push(e.key + ':' + e.repeat)); });
  await page.focus('#t');
  for (let i = 0; i < 4; i++) await page.keyboard.down('ArrowLeft');
  await page.keyboard.up('ArrowLeft');
  await page.keyboard.down('Control');
  for (let i = 0; i < 3; i++) await page.keyboard.down('ArrowRight');
  await page.keyboard.up('ArrowRight'); await page.keyboard.up('Control');
  await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft');
  console.log(JSON.stringify(await page.evaluate(() => window.log)));
  await browser.close();
})();
