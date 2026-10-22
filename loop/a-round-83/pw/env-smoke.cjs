const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const out = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-83/pw/';
const URL = 'http://127.0.0.1:5173/studio-lab';
async function overflow(page) {
  return page.getByTestId('arrangement-grid-control').evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
}
async function run(width, height, browser, full) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => errors.push('pageerror ' + String(e).slice(0, 200)));
  await page.goto(URL, { waitUntil: 'networkidle' });
  const result = { viewport: `${width}x${height}` };
  const select = page.getByTestId('arrangement-grid-division');
  const values = await select.locator('option').evaluateAll((os) => os.map((o) => o.value));
  result.overflowByDivision = {};
  for (const value of values) {
    await select.selectOption(value);
    result.overflowByDivision[value] = await overflow(page);
  }
  await select.selectOption(values[0]);
  const toggle = page.getByTestId('arrangement-envelope-toggle');
  result.toggleBox = await toggle.boundingBox();
  await toggle.click();
  result.afterButton = { pressed: await toggle.getAttribute('aria-pressed'), mode: await page.getByTestId('arrangement-grid-control').getAttribute('data-envelope-mode'), status: await page.getByTestId('arrangement-status').textContent() };
  await page.keyboard.press('a');
  result.afterKey = { pressed: await toggle.getAttribute('aria-pressed'), status: await page.getByTestId('arrangement-status').textContent() };
  if (full) {
    const option = page.locator('[role="option"][data-source-id]').first();
    await option.waitFor();
    await page.waitForTimeout(2500);
    await option.dblclick();
    const clip = page.locator('[data-clip-kind="audio"]').first();
    await clip.waitFor({ timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.keyboard.press('a');
    const editor = clip.locator('[data-testid="arrangement-clip-envelope-editor"]');
    await editor.waitFor();
    const eb = await editor.boundingBox();
    const cb = await clip.boundingBox();
    result.clipBox = cb; result.editorBox = eb;
    result.fadeHandlesInMode = await clip.locator('[data-testid^="arrangement-clip-fade-"][data-testid$="-handle"]').count();
    const posBefore = await page.getByTestId('arrangement-status').textContent();
    for (const dx of [150, 350, 550]) {
      await page.mouse.dblclick(eb.x + dx, eb.y + eb.height * 0.6);
      await page.waitForTimeout(150);
    }
    result.afterAdds = { envelope: await clip.getAttribute('data-envelope'), status: await page.getByTestId('arrangement-status').textContent(), undo: await page.locator('[data-testid="arrangement-undo"]').getAttribute('title').catch(() => null), range: await page.locator('[data-testid="arrangement-range-readout"]').textContent().catch(() => null) };
    const points = clip.locator('[data-testid="arrangement-clip-envelope-point"]');
    result.pointCount = await points.count();
    const mid = points.nth(1);
    const pb = await mid.boundingBox();
    const body = await editor.evaluate((el) => el.parentElement.getBoundingClientRect().toJSON());
    result.bodyBox = body;
    result.topAtMidPoint = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.getAttribute('data-testid'), [pb.x + pb.width / 2, pb.y + pb.height / 2]);
    await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2);
    await page.mouse.down();
    const targetDy = body.height * (1 - 0.2512);
    await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2 + targetDy / 2, { steps: 5 });
    result.statusDuringDrag = await page.getByTestId('arrangement-status').textContent();
    await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2 + targetDy, { steps: 5 });
    await page.mouse.up();
    result.afterDrag = { envelope: await clip.getAttribute('data-envelope'), gain: await mid.getAttribute('data-gain'), title: await mid.getAttribute('title'), status: await page.getByTestId('arrangement-status').textContent() };
    const pb2 = await mid.boundingBox();
    result.midPointCenterY_minus_bodyTop = pb2.y + pb2.height / 2 - body.y;
    result.expectedY = (1 - Number(result.afterDrag.gain)) * body.height;
    result.topAtLeftTrim = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.getAttribute('title'), [cb.x + 3, cb.y + cb.height * 0.6]);
    result.topAtEditorCenter = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.getAttribute('data-testid'), [eb.x + 250, eb.y + eb.height * 0.3]);
    await page.screenshot({ path: out + `a-r83-env-on-${width}.png` });
    await page.keyboard.press('a');
    result.modeOff = { points: await points.count(), line: await clip.locator('[data-testid="arrangement-clip-envelope-line"]').count(), editor: await editor.count() };
    await page.screenshot({ path: out + `a-r83-env-off-${width}.png` });
    // double-click delete in mode, after guard window
    await page.keyboard.press('a');
    await page.waitForTimeout(700);
    const pb3 = await points.nth(1).boundingBox();
    await page.mouse.dblclick(pb3.x + pb3.width / 2, pb3.y + pb3.height / 2);
    result.afterDelete = { envelope: await clip.getAttribute('data-envelope'), status: await page.getByTestId('arrangement-status').textContent() };
    await page.keyboard.press('Control+z');
    result.afterUndoDelete = await clip.getAttribute('data-envelope');
    // X1 in a real browser
    await page.keyboard.press('a');
    await page.waitForTimeout(200);
    await page.evaluate(() => { window.__dbl = 0; document.addEventListener('dblclick', () => { window.__dbl += 1; }, true); });
    await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
    const handle = clip.locator('[data-testid="arrangement-clip-fade-in-handle"]');
    const hb = await handle.boundingBox();
    await page.mouse.move(hb.x + 5, hb.y + 5);
    await page.mouse.down();
    await page.mouse.move(hb.x + 10, hb.y + 5, { steps: 3 });
    await page.mouse.up();
    const fadeAfterDrag = await clip.getAttribute('data-fade-in');
    await page.waitForTimeout(100);
    await page.mouse.click(hb.x + 10, hb.y + 5);
    await page.waitForTimeout(100);
    result.x1 = { fadeAfterDrag, fadeAfterQuickClick: await clip.getAttribute('data-fade-in'), dblclickEvents: await page.evaluate(() => window.__dbl) };
    await page.waitForTimeout(1000);
    const hb2 = await handle.boundingBox();
    await page.mouse.dblclick(hb2.x + 5, hb2.y + 5);
    result.x1.afterLateDblclick = await clip.getAttribute('data-fade-in');
  }
  result.errors = errors;
  if (full) await context.storageState({ path: '/home/runner/czaba-project/tmp/studio-real-loop/a-browse.json' });
  await context.close();
  return result;
}
(async () => {
  const browser = await chromium.launch();
  const warm = await browser.newContext();
  const wp = await warm.newPage();
  await wp.goto(URL, { waitUntil: 'networkidle' });
  await wp.waitForTimeout(2000);
  await warm.close();
  const results = [await run(1440, 900, browser, true), await run(1280, 720, browser, false)];
  console.log(JSON.stringify(results, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
