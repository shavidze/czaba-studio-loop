const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const out = {};
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto('http://127.0.0.1:5173/studio-lab', { timeout: 180000 });
    await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 180000 });
    const play = page.getByRole('button', { name: 'Play', exact: true });
    const r = { count: await play.count(), before: await play.getAttribute('data-playing') };
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.locator('[data-clip-kind="audio"]').first().waitFor();
    r.clips = await page.locator('[data-clip-kind="audio"]').count();
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press('Space');
    await page.waitForTimeout(1500);
    r.afterSpace1 = await play.getAttribute('data-playing');
    await page.keyboard.press('Space');
    await page.waitForTimeout(1500);
    r.afterSpace2 = await play.getAttribute('data-playing');
    out[`${w}x${h}`] = r;
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(out));
})();
