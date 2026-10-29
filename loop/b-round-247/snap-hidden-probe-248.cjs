// B round-248 planning probe: snap over hidden grid lines. usage: node snap-hidden-probe-248.cjs <base> <outFile> [shotDir]
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const base = process.argv[2];
const outFile = process.argv[3];
const shotDir = process.argv[4] || path.join(path.dirname(outFile), 'shots');
fs.mkdirSync(shotDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = { base, started: new Date().toISOString(), rows: {} };
const save = () => fs.writeFileSync(outFile, JSON.stringify(R, null, 1));

async function open(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(
    () => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'),
    undefined,
    { timeout: 120000 },
  );
  await sleep(800);
  return { ctx, page, errors };
}
const grid = (page) =>
  page.evaluate(() => {
    const c = document.querySelector('[data-testid="arrangement-grid-control"]');
    const snap = document.querySelector('[data-testid="arrangement-snap-toggle"]');
    const sel = document.querySelector('[data-testid="arrangement-grid-division"]');
    return {
      snap: c.dataset.snap,
      snapPaused: c.dataset.snapPaused ?? null,
      division: c.dataset.gridDivision,
      seconds: Number(c.dataset.gridSeconds),
      mode: c.dataset.gridMode,
      lines: c.dataset.gridLines,
      laneLines: [...document.querySelectorAll('[data-track-id] [data-grid-lines]')].map((e) => e.dataset.gridLines).join(','),
      zoom: document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent,
      snapTitle: snap.title,
      selectTitle: sel.title,
      status: document.querySelector('[data-testid="arrangement-status"]').textContent,
    };
  });
const playhead = (page) => page.evaluate(() => Number(document.querySelector('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow')));
async function setZoomSlider(page, position) {
  await page.evaluate((pos) => {
    const input = document.querySelector('[data-testid="arrangement-zoom"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, String(pos));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, position);
  await sleep(300);
}
async function zoomTo(page, targetPx) {
  const max = await page.evaluate(() => Number(document.querySelector('[data-testid="arrangement-zoom"]').max));
  let lo = 0;
  let hi = max;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    await setZoomSlider(page, mid);
    const z = parseFloat((await grid(page)).zoom);
    if (z >= targetPx) hi = mid; else lo = mid + 1;
  }
  await setZoomSlider(page, lo);
  return { pos: lo, zoom: (await grid(page)).zoom };
}
async function rulerClick(page, frac, alt = false) {
  const box = await page.getByTestId('arrangement-ruler').boundingBox();
  const x = box.x + box.width * frac;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  if (alt) { await page.keyboard.down('Alt'); await sleep(150); }
  await page.mouse.down();
  await page.mouse.up();
  if (alt) await page.keyboard.up('Alt');
  await sleep(400);
  return { x: Math.round(x - box.x), t: await playhead(page) };
}
async function addBtn(page, id) {
  await page.locator(`[data-source-id="${id}"]`).first().click();
  await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await sleep(900);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
}
async function chooseDivision(page, id) {
  await page.getByTestId('arrangement-grid-division').selectOption(id);
  await sleep(400);
}
const CASES = {
  atLoad: async (page, row) => { row.grid = await grid(page); },
  minZoomAdaptive: async (page, row) => {
    row.before = await grid(page);
    await setZoomSlider(page, 0);
    row.grid = await grid(page);
    row.click = await rulerClick(page, 0.37);
    row.clickAlt = await rulerClick(page, 0.53, true);
  },
  fixed01Hidden: async (page, row) => {
    await chooseDivision(page, '0.1');
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press('g'); await sleep(400);
    row.grid = await grid(page);
    row.click = await rulerClick(page, 0.3711);
    row.click2 = await rulerClick(page, 0.4433);
    row.clickAlt = await rulerClick(page, 0.3711, true);
    await page.keyboard.press('g'); await sleep(400);
    row.gridSnapOff = await grid(page);
    row.altClickSnapOff = await rulerClick(page, 0.3711, true);
  },
  fixed01Visible: async (page, row) => {
    await chooseDivision(page, '0.1');
    row.sliderPos = await zoomTo(page, 60);
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press('g'); await sleep(400);
    row.grid = await grid(page);
    row.click = await rulerClick(page, 0.3711);
    await page.keyboard.press('g'); await sleep(400);
    row.altClickSnapOff = await rulerClick(page, 0.3711, true);
  },
  musical132Hidden: async (page, row) => {
    await addBtn(page, 'demo-stem-pulse');
    row.afterAdd = await grid(page);
    await chooseDivision(page, '1/32');
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    row.grid = await grid(page);
    row.click = await rulerClick(page, 0.3711);
    row.sliderPos = await zoomTo(page, 100);
    row.gridVisible = await grid(page);
    row.clickVisible = await rulerClick(page, 0.3711);
  },
  nudgeHidden: async (page, row) => {
    await addBtn(page, 'demo-stem-pulse');
    await chooseDivision(page, '0.25');
    row.sliderPos = await zoomTo(page, 20);
    const clip = page.locator('[data-clip-id]').last();
    const id = await clip.getAttribute('data-clip-id');
    const box = await clip.boundingBox();
    await page.mouse.click(box.x + Math.min(30, box.width / 2), box.y + 6); await sleep(400);
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    const snapNow = (await grid(page)).snap;
    if (snapNow !== 'on') { await page.keyboard.press('g'); await sleep(400); }
    row.clip = id;
    row.grid = await grid(page);
    row.start0 = await clip.getAttribute('data-clip-start');
    await page.keyboard.press('ArrowRight'); await sleep(350);
    row.start1 = await clip.getAttribute('data-clip-start');
    await page.keyboard.press('ArrowRight'); await sleep(350);
    row.start2 = await clip.getAttribute('data-clip-start');
    row.status = (await grid(page)).status;
    row.sliderPos2 = await zoomTo(page, 40);
    row.gridVisible = await grid(page);
    await page.keyboard.press('ArrowRight'); await sleep(350);
    row.start3 = await clip.getAttribute('data-clip-start');
  },
};
(async () => {
  const browser = await chromium.launch();
  const only = process.argv[5] ? new RegExp(process.argv[5]) : null;
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    for (const [name, fn] of Object.entries(CASES)) {
      if (only && !only.test(name)) continue;
      const key = `${name}@${vp.width}`;
      const row = {};
      let ctx;
      try {
        const o = await open(browser, vp);
        ctx = o.ctx;
        await fn(o.page, row);
        row.errors = o.errors;
        await o.page.screenshot({ path: path.join(shotDir, `${key}.png`) });
      } catch (e) {
        row.fail = String(e).slice(0, 400);
      }
      R.rows[key] = row;
      save();
      if (ctx) await ctx.close();
    }
  }
  await browser.close();
  R.finished = new Date().toISOString();
  save();
})();
