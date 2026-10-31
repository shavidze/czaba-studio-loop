const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const [base, out, vw, vh] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: Number(vw || 1440), height: Number(vh || 900) } });
  await page.goto(base + '/studio-lab', { waitUntil: 'load' });
  await page.getByTestId('arrangement-status').filter({ hasText: /^Demo collection ready/ }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByTestId('arrangement-clip-waveform').first().waitFor();
  const clip = page.locator('[data-clip-id]').first();
  const box = await clip.boundingBox();
  await page.mouse.click(box.x + 20, box.y + 6);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let i = 0; i < 29; i++) await page.keyboard.press('Control+d');
  await page.waitForTimeout(1000);
  await page.getByTestId('arrangement-envelope-toggle').click();
  const editor = clip.getByTestId('arrangement-clip-envelope-editor');
  const eb = await editor.boundingBox();
  await page.mouse.dblclick(eb.x + Math.min(300, eb.width * 0.3), eb.y + eb.height * 0.4);
  await page.waitForTimeout(500);
  const pointsAfterAdd = await clip.getByTestId('arrangement-clip-envelope-point').count();
  const status = await page.getByTestId('arrangement-status').textContent();
  const lines = await page.getByTestId('arrangement-clip-envelope-line').count();
  await page.evaluate(() => { window.__m = { points: 0, viewBox: 0 }; const mo = new MutationObserver((ms) => { for (const m of ms) window.__m[m.attributeName]++; }); for (const s of document.querySelectorAll('[data-testid=arrangement-clip-envelope-line]')) mo.observe(s, { subtree: true, attributes: true, attributeFilter: ['points', 'viewBox'] }); });
  const align = async () => clip.evaluate((root) => {
    const svg = root.querySelector('[data-testid=arrangement-clip-envelope-line]'); const pt = root.querySelector('[data-testid=arrangement-clip-envelope-point]');
    if (!svg || !pt) return null; const sb = svg.getBoundingClientRect(); const vbw = Number(svg.getAttribute('viewBox').split(' ')[2]);
    const xs = svg.querySelector('polyline').getAttribute('points').split(' ').map((p) => Number(p.split(',')[0]));
    const pb = pt.getBoundingClientRect(); const centre = pb.left + pb.width / 2; const vertex = sb.left + xs[1] * (sb.width / vbw);
    return { centre: +centre.toFixed(2), vertex: +vertex.toFixed(2), delta: +Math.abs(centre - vertex).toFixed(3), viewBox: svg.getAttribute('viewBox') };
  });
  const steps = [{ zoom: await page.getByRole('slider', { name: 'Zoom (px/s)' }).getAttribute('aria-valuetext'), align: await align(), mut: { ...(await page.evaluate(() => window.__m)) } }];
  for (let k = 0; k < 3; k++) {
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press('='); await page.waitForTimeout(400);
    steps.push({ zoom: await page.getByRole('slider', { name: 'Zoom (px/s)' }).getAttribute('aria-valuetext'), align: await align(), mut: { ...(await page.evaluate(() => window.__m)) } });
  }
  await page.keyboard.press('Control+z'); await page.waitForTimeout(400);
  const pointsAfterUndo = await clip.getByTestId('arrangement-clip-envelope-point').count();
  const r = { viewport: [vw, vh], linesInEnvMode: lines, pointsAfterAdd, statusAfterAdd: status, steps, pointsAfterUndo };
  require('fs').writeFileSync(out, JSON.stringify(r, null, 1)); console.log(JSON.stringify(r));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
