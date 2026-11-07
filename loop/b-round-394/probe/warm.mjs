import { open } from '../../c-round-382/lib.mjs';
const o = await open(process.argv[2], 1440, 900); await o.page.waitForTimeout(5000);
console.log(await o.page.evaluate(() => !!document.querySelector('[data-testid="arrangement-status"]'))); await o.browser.close();
