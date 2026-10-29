const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const base = process.argv[2];
const dir = process.argv[3];
(async () => {
  const out = {};
  const browser = await chromium.launch();
  const open = async (w, h) => {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    page.__errors = [];
    page.on('pageerror', (e) => page.__errors.push(String(e)));
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 90000 });
    return page;
  };
  const seed = async (page) => {
    await page.click('[data-source-id="demo-stem-pulse"]');
    await page.locator('button:enabled', { hasText: /^Add/ }).first().click();
    await page.waitForSelector('[data-testid="arrangement-bars-scrub-strip"]');
  };
  const read = async (page) => ({
    label: await page.locator('button[aria-label="Pause"], button[aria-label="Play"]').first().getAttribute('aria-label'),
    pos: await page.locator('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow'),
    status: await page.locator('[data-testid="arrangement-status"]').innerText(),
    scrollLeft: await page.evaluate(() => document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft),
    barsWidth: await page.evaluate(() => document.querySelector('[data-testid="arrangement-bars-ruler"]').getBoundingClientRect().width),
  });
  const logEvents = (page) => page.evaluate(() => {
    window.__ev = [];
    const root = document.querySelector('[data-testid="arrangement-bars-ruler"]');
    for (const type of ['pointerdown', 'pointerup', 'click', 'dblclick']) {
      root.addEventListener(type, (e) => window.__ev.push(`${type}:${e.target.getAttribute('data-testid') ?? e.target.tagName}`), true);
    }
  });
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const k = `${w}x${h}`;
    out[k] = {};
    let page = await open(w, h);
    await page.screenshot({ path: `${dir}/empty-${k}.png` });
    await seed(page);
    out[k].seeded = await read(page);
    await page.screenshot({ path: `${dir}/seeded-before-${k}.png` });
    await logEvents(page);
    let bars = await page.locator('[data-testid="arrangement-bars-ruler"]').boundingBox();
    await page.mouse.dblclick(bars.x + 3 * 40, bars.y + 4);
    await page.waitForTimeout(300);
    out[k].stripDbl = await read(page);
    out[k].stripDblEvents = await page.evaluate(() => window.__ev);
    await page.screenshot({ path: `${dir}/after-strip-dbl-${k}.png` });
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    out[k].afterSpaceStop = await read(page);
    await page.mouse.dblclick(bars.x + 6 * 40, bars.y + 15);
    await page.waitForTimeout(300);
    out[k].lowerDblStopped = await read(page);
    out[k].errors1 = page.__errors;
    await page.close();
    page = await open(w, h);
    await seed(page);
    await page.evaluate(() => { document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft = 300; });
    await page.waitForTimeout(200);
    bars = await page.locator('[data-testid="arrangement-bars-ruler"]').boundingBox();
    await page.mouse.click(bars.x + 15.95 * 40, bars.y + 4);
    await page.waitForTimeout(500);
    out[k].endClick = await read(page);
    await page.keyboard.press('Space');
    await page.waitForTimeout(400);
    out[k].endThenSpace = await read(page);
    out[k].errors2 = page.__errors;
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(`${dir}/../probe-out.json`, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})();
