// B round-250 planning probe: edit commands vs the Insert Marker. usage: node edit-probe-250.cjs <base> <out.json> [caseRegex]
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
  await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 });
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
  range: !!document.querySelector('[data-testid="arrangement-range"]'),
  clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => `${c.closest('[data-track-id]')?.getAttribute('data-track-id')}@${c.getAttribute('data-clip-start')}`),
  markers: [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((m) => m.getAttribute('aria-label')),
  active: document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName,
}));
async function geo(page) {
  const ruler = await page.getByTestId('arrangement-ruler').boundingBox();
  const pps = await page.evaluate(() => parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent));
  return { ruler, pps };
}
async function rulerClickAt(page, seconds) {
  const { ruler, pps } = await geo(page);
  await page.mouse.click(ruler.x + seconds * pps, ruler.y + ruler.height / 2);
  await sleep(900);
}
async function laneClickAt(page, track, seconds) {
  const { ruler, pps } = await geo(page);
  const box = await page.locator(`[data-track-id="${track}"]`).first().boundingBox();
  await page.mouse.click(ruler.x + seconds * pps, box.y + box.height / 2);
  await sleep(900);
}
async function playStop(page, ms = 1500) {
  await page.keyboard.press('Space'); await sleep(ms); await page.keyboard.press('Space'); await sleep(300);
}
const cases = {
  async pastePlaying(page) {
    const out = {};
    const clip = page.locator('[data-clip-id]').first();
    const cb = await clip.boundingBox();
    const { ruler, pps } = await geo(page);
    await page.mouse.click(ruler.x + 8 * pps, cb.y + cb.height * 0.75); await sleep(900);
    await page.keyboard.press('Control+c'); await sleep(300); out.afterCopy = await st(page);
    await laneClickAt(page, 'sfx', 2); out.afterLane = await st(page);
    await page.keyboard.press('Space'); await sleep(1000); out.playing = await st(page);
    await page.keyboard.press('Control+v'); await sleep(500); out.afterPaste = await st(page);
    await page.keyboard.press('Space'); await sleep(300);
    return out;
  },
};
const _unusedOriginalCases = {
  async splitPlaying(page) {
    const out = {};
    const clip = page.locator('[data-clip-id]').first();
    const cb = await clip.boundingBox();
    const { ruler, pps } = await geo(page);
    await page.mouse.click(ruler.x + 5 * pps, cb.y + cb.height * 0.75); await sleep(900);
    await page.keyboard.press('Space'); await sleep(1500); out.playing = await st(page);
    await page.keyboard.press('Control+e'); await sleep(500); out.afterSplit = await st(page);
    await page.keyboard.press('Space'); await sleep(300);
    return out;
  },
  async addPlaying(page) {
    const out = {};
    await laneClickAt(page, 'sfx', 3);
    await page.keyboard.press('Space'); await sleep(1500); out.playing = await st(page);
    await page.locator('[data-source-id="demo-soft-impact"]').first().focus(); await sleep(150);
    await page.keyboard.press('Enter'); await sleep(700); out.afterEnter = await st(page);
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press('Space'); await sleep(300);
    return out;
  },
  async splitNoTarget(page) {
    const out = {};
    await laneClickAt(page, 'sfx', 3); out.afterLane = await st(page);
    out.selected = await page.evaluate(() => document.querySelectorAll('[data-clip-id][aria-pressed="true"], [data-clip-id][data-selected="true"]').length);
    await page.keyboard.press('Control+e'); await sleep(500); out.afterSplit = await st(page);
    out.box = await page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); const r = s.getBoundingClientRect(); return { h: r.height, sw: s.scrollWidth, cw: s.clientWidth }; });
    return out;
  },
  async paste(page) {
    const out = {};
    const clip = page.locator('[data-clip-id]').first();
    const cb = await clip.boundingBox();
    await page.mouse.click(cb.x + cb.width * 0.5, cb.y + cb.height * 0.75); await sleep(900);
    await page.keyboard.press('Control+c'); await sleep(400);
    out.afterCopy = await st(page);
    await laneClickAt(page, 'sfx', 2); out.afterLane = await st(page);
    await playStop(page); out.afterStop = await st(page);
    await page.keyboard.press('Control+v'); await sleep(600); out.afterPaste = await st(page);
    return out;
  },
  async split(page) {
    const out = {};
    const clip = page.locator('[data-clip-id]').first();
    const cb = await clip.boundingBox();
    const { ruler, pps } = await geo(page);
    await page.mouse.click(ruler.x + 5 * pps, cb.y + cb.height * 0.75); await sleep(900);
    out.afterClipClick = await st(page);
    await playStop(page); out.afterStop = await st(page);
    await page.keyboard.press('Control+e'); await sleep(600); out.afterSplit = await st(page);
    return out;
  },
  async markerM(page) {
    const out = {};
    await rulerClickAt(page, 2);
    await playStop(page); out.afterStop = await st(page);
    await page.keyboard.press('m'); await sleep(400);
    await page.keyboard.press('Enter'); await sleep(600); out.afterM = await st(page);
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press('Space'); await sleep(1200);
    await page.keyboard.press('m'); await sleep(300);
    await page.keyboard.press('Enter'); await sleep(500); out.afterPlayingM = await st(page);
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.keyboard.press('Space'); await sleep(300);
    return out;
  },
  async enterAdd(page) {
    const out = {};
    await laneClickAt(page, 'sfx', 3); out.afterLane = await st(page);
    await playStop(page); out.afterStop = await st(page);
    const row = page.locator('[data-source-id="demo-soft-impact"]').first();
    await row.focus(); await sleep(200);
    await page.keyboard.press('Enter'); await sleep(900); out.afterEnter = await st(page);
    return out;
  },
  async pastEnd(page) {
    const out = {};
    await rulerClickAt(page, 18); out.afterRuler = await st(page);
    await page.keyboard.press('Space'); await sleep(400); out.space = await st(page);
    await page.keyboard.press('Shift+Space'); await sleep(400); out.shiftSpace = await st(page);
    return out;
  },
  async gestureGuard(page) {
    const out = {};
    await rulerClickAt(page, 2);
    await playStop(page); out.afterStop = await st(page);
    const { ruler, pps } = await geo(page);
    const clip = await page.locator('[data-clip-id]').first().boundingBox();
    const y = clip.y + clip.height * 0.75;
    await page.mouse.move(ruler.x + 6 * pps, y);
    await page.mouse.down();
    await page.mouse.move(ruler.x + 7 * pps, y, { steps: 4 });
    await page.mouse.move(ruler.x + 8 * pps, y, { steps: 4 });
    await sleep(200);
    out.midDrag = await st(page);
    await page.keyboard.press('Control+Shift+Space'); await sleep(200);
    await page.keyboard.press('Home'); await sleep(200);
    out.afterKeysMidDrag = await st(page);
    await page.mouse.up(); await sleep(500);
    out.afterUp = await st(page);
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
