// B round-249 planning probe: Insert Marker model. usage: node im-probe-249.cjs <base> <out.json> [caseRegex]
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const [base, outFile, caseRe] = [process.argv[2], process.argv[3], new RegExp(process.argv[4] || '.')];
const shotDir = path.join(path.dirname(outFile), 'shots-' + path.basename(outFile, '.json'));
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
  await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 120000 });
  await sleep(800);
  await page.locator('[data-source-id="demo-stem-pulse"]').first().click();
  await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await sleep(900);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  return { ctx, page, errors };
}
const st = (page) => page.evaluate(() => ({
  playhead: Number(document.querySelector('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow')),
  marker: document.querySelector('[data-testid="arrangement-insert-marker"]')?.getAttribute('data-insert-marker') ?? null,
  playing: !!document.querySelector('button[aria-label="Pause"]'),
  status: document.querySelector('[data-testid="arrangement-status"]').textContent,
  active: document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName,
}));
async function rulerClickAt(page, seconds) {
  const box = await page.getByTestId('arrangement-ruler').boundingBox();
  const pps = await page.evaluate(() => parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent));
  await page.mouse.click(box.x + seconds * pps, box.y + box.height / 2);
  await sleep(900);
}
async function laneClickAt(page, seconds) {
  const ruler = await page.getByTestId('arrangement-ruler').boundingBox();
  const pps = await page.evaluate(() => parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent));
  const box = await page.locator('[data-track-id="sfx"]').boundingBox();
  await page.mouse.click(ruler.x + seconds * pps, box.y + box.height / 2);
  await sleep(900);
}
const cases = {
  async restart(page) {
    const out = {};
    await rulerClickAt(page, 2); out.afterClick = await st(page);
    await page.keyboard.press('Space'); await sleep(1500); await page.keyboard.press('Space'); await sleep(300);
    out.afterStop = await st(page);
    await page.keyboard.press('Space'); await sleep(250); out.afterSpace2 = await st(page);
    await page.keyboard.press('Space'); await sleep(300); out.end = await st(page);
    return out;
  },
  async shiftContinue(page) {
    const out = {};
    await rulerClickAt(page, 2);
    await page.keyboard.press('Space'); await sleep(1500); await page.keyboard.press('Space'); await sleep(300);
    out.afterStop = await st(page);
    await page.keyboard.press('Shift+Space'); await sleep(250); out.afterShift = await st(page);
    await page.keyboard.press('Space'); await sleep(300); out.end = await st(page);
    return out;
  },
  async ctrlShift(page) {
    const out = {};
    await rulerClickAt(page, 2);
    await page.keyboard.press('Space'); await sleep(1500); await page.keyboard.press('Space'); await sleep(300);
    out.afterStop = await st(page);
    await page.keyboard.press('Control+Shift+Space'); await sleep(300); out.afterCS = await st(page);
    await page.keyboard.press('Space'); await sleep(250); out.afterSpace = await st(page);
    await page.keyboard.press('Space'); await sleep(300); out.end = await st(page);
    return out;
  },
  async clickWhilePlaying(page) {
    const out = {};
    await rulerClickAt(page, 1);
    await page.keyboard.press('Space'); await sleep(800);
    out.before = await st(page);
    await laneClickAt(page, 6); out.afterLane = await st(page);
    await rulerClickAt(page, 8); out.afterRuler = await st(page);
    await page.keyboard.press('Home'); await sleep(300); out.afterHome = await st(page);
    await rulerClickAt(page, 5); out.afterRuler5 = await st(page);
    await page.getByRole('button', { name: 'Back to start' }).click(); await sleep(300); out.afterBack = await st(page);
    await page.keyboard.press('Space'); await sleep(300); out.afterStop = await st(page);
    await page.keyboard.press('Space'); await sleep(250); out.afterSpace = await st(page);
    await page.keyboard.press('Space'); await sleep(300);
    return out;
  },
  async ctrlShiftOnPlayButton(page) {
    const out = {};
    const play = page.getByRole('button', { name: 'Play', exact: true });
    await play.focus(); out.before = await st(page);
    await page.keyboard.press('Control+Shift+Space'); await sleep(600); out.after = await st(page);
    return out;
  },
};
(async () => {
  const browser = await chromium.launch();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    for (const [name, fn] of Object.entries(cases)) {
      if (!caseRe.test(name)) continue;
      const key = `${name}@${vp.width}`;
      const { ctx, page, errors } = await open(browser, vp);
      try { R.rows[key] = await fn(page); } catch (e) { R.rows[key] = { error: String(e) }; }
      R.rows[key].pageErrors = errors;
      await page.screenshot({ path: path.join(shotDir, `${key}.png`) });
      await ctx.close(); save();
    }
  }
  await browser.close(); save();
})();
