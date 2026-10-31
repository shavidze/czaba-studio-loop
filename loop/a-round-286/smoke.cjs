const { chromium } = require('@playwright/test');
(async () => {
  const dir = process.argv[2];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const result = {};
  for (const handle of ['door-slams', 'middle-east']) {
    await page.goto(`http://127.0.0.1:5173/products/${handle}`, { waitUntil: 'load' });
    await page.getByText('Total Price').waitFor(); await page.waitForTimeout(1500);
    const panel = page.getByText('Total Price').locator('xpath=../..');
    const add = page.getByRole('button', { name: 'Add to Cart' });
    const buy = page.getByRole('button', { name: 'Buy Now' });
    result[handle] = {
      panelText: (await panel.innerText()).replace(/\s+/g, ' '),
      bodyHas000: (await page.locator('body').innerText()).includes('$0.00'),
      addAriaDisabled: await add.getAttribute('aria-disabled'),
      addDisabled: await add.isDisabled(),
      buyAriaDisabled: await buy.getAttribute('aria-disabled'),
      buyDisabled: await buy.isDisabled(),
      complimentary: await page.getByText('Complimentary Download').count(),
    };
    await page.screenshot({ path: `${dir}/a-${handle}-1440.png` });
  }
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
