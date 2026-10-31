const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const base = process.argv[2]; const nDup = Number(process.argv[3] || 29);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + '/studio-lab', { waitUntil: 'load' });
  await page.getByTestId('arrangement-status').filter({ hasText: /^Demo collection ready/ }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByTestId('arrangement-clip-waveform').first().waitFor();
  const box = await page.locator('[data-clip-id]').first().boundingBox();
  await page.mouse.click(box.x + 20, box.y + 6);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let i = 0; i < nDup; i++) await page.keyboard.press('Control+d');
  await page.waitForTimeout(1000);
  const census = () => page.evaluate(() => { const m = {}; for (const e of document.querySelectorAll('*')) { let k = e.getAttribute('data-testid'); let p = e; while (!k && p.parentElement) { p = p.parentElement; k = p.getAttribute('data-testid') && ('in:' + p.getAttribute('data-testid')); } k = k || 'none'; m[k] = (m[k] || 0) + 1; } return m; });
  const clipInfo = await page.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].slice(0,2).map(e => ({ w: e.getBoundingClientRect().width, start: e.getAttribute('data-clip-start'), vb: e.querySelector('[data-testid=arrangement-clip-waveform]')?.getAttribute('viewBox') })));
  const a = await census();
  const res = [];
  for (let i = 0; i < 5; i++) { await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.keyboard.press('='); await page.waitForTimeout(400);
    res.push(await page.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].slice(0,1).map(e => ({ w: Math.round(e.getBoundingClientRect().width), vb: e.querySelector('[data-testid=arrangement-clip-waveform]')?.getAttribute('viewBox') })))); }
  const b = await census();
  const diff = Object.entries(b).map(([k, v]) => [k, v - (a[k] || 0)]).filter(([, d]) => d !== 0).sort((x, y) => Math.abs(y[1]) - Math.abs(x[1])).slice(0, 12);
  console.log(JSON.stringify({ clipInfo, perStep: res, diff }, null, 0));
  await browser.close();
})();
