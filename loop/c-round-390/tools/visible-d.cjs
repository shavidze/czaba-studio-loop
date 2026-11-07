// B round 305: d strings of every clip waveform whose box intersects the timeline viewport, after 30 clips and N '-' keys.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const [base, out, W = '1440', H = '900', keys = '3'] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: Number(W), height: Number(H) } });
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /^Demo collection ready/ }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByTestId('arrangement-clip-waveform').first().waitFor();
  const box = await page.locator('[data-clip-id]').first().boundingBox();
  await page.mouse.click(box.x + 20, box.y + 6);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let i = 1; i < 30; i++) await page.keyboard.press('Control+d');
  await page.waitForTimeout(1000);
  const read = () => page.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]').getBoundingClientRect(); return [...document.querySelectorAll('[data-clip-id]')].map((c) => { const r = c.getBoundingClientRect(); const svg = c.querySelector('[data-testid=arrangement-clip-waveform]'); return { id: c.getAttribute('data-clip-id'), vis: r.right > sc.left + 224 && r.left < sc.right, vb: svg && svg.getAttribute('viewBox'), d: svg && svg.querySelector('path').getAttribute('d') }; }).filter((x) => x.vis).map((x) => ({ id: x.id, vb: x.vb, len: x.d.length, d: x.d })); });
  const res = { keys: [] };
  for (let i = 0; i <= Number(keys); i++) { if (i) { await page.keyboard.press('-'); await page.waitForTimeout(400); } res.keys.push(await read()); }
  for (let i = 0; i < Number(keys); i++) { await page.keyboard.press('='); await page.waitForTimeout(400); }
  res.back = await read();
  fs.writeFileSync(out, JSON.stringify(res));
  console.log(res.keys.map((k) => k.map((x) => x.vb + ':' + x.len).join(',')).join(' | '), '| back', res.back.map((x) => x.vb + ':' + x.len).join(','));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
