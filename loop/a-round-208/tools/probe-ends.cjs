const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const a=[...document.querySelectorAll('button')].find(b=>b.textContent?.trim()==='Add'); return a && !a.disabled && document.querySelector('[data-testid="arrangement-library-preview-wave"] rect'); }, undefined, { timeout: 180000, polling: 500 });
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.waitForTimeout(2000);
  const names = ['Volume — Music', 'Pan — Music', 'Master Volume'];
  for (const name of names) {
    const s = page.getByRole('slider', { name, exact: true });
    const box = await s.boundingBox();
    const attrs = await s.evaluate((e) => ({ min: e.min, max: e.max, step: e.step, value: e.value }));
    const y = box.y + box.height / 2;
    const out = [];
    for (const f of [0.5]) {
      await page.mouse.move(box.x + box.width * f, y); await page.mouse.down(); out.push(await s.inputValue());
      for (const g of [0.05, 0.95, 1.0]) { await page.mouse.move(box.x + box.width * g, y, { steps: 10 }); out.push(`${g}:${await s.inputValue()}`); }
      await page.mouse.up();
    }
    console.log(name, JSON.stringify(attrs), out.join(' '));
  }
  await browser.close();
})();
