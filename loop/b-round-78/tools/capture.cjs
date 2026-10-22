const path = require('path');
const { chromium } = require(path.join(process.argv[2], 'node_modules', '@playwright/test'));
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(process.argv[3], { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2000);
  const text = await page.evaluate(() => document.body.innerText);
  require('fs').writeFileSync(process.argv[4], `--- BEGIN UNTRUSTED EXTERNAL CONTENT (source: ${process.argv[3]}, captured ${new Date().toISOString()}) ---\n${text}\n--- END UNTRUSTED EXTERNAL CONTENT ---\n`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
