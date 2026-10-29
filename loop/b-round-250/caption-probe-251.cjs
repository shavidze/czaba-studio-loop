// B round-251 planning probe: the library line above Add (C-R250-01). usage: node caption-probe-251.cjs <base> <out.json>
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const [base, outFile] = [process.argv[2], process.argv[3]];
const shotDir = path.join(path.dirname(outFile), 'shots-' + path.basename(outFile, '.json'));
fs.mkdirSync(shotDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = { base, started: new Date().toISOString(), rows: {} };
const save = () => fs.writeFileSync(outFile, JSON.stringify(R, null, 1));
const CAP = '[data-testid="arrangement-library-insert-marker"], [data-testid="arrangement-library-playhead"]';
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
const read = (page) => page.evaluate((sel) => {
  const span = document.querySelector(sel);
  const p = span?.closest('p');
  const pr = p?.getBoundingClientRect(); const sr = span?.getBoundingClientRect();
  const lib = document.querySelector('[data-testid="arrangement-library"]') || p?.closest('aside');
  return {
    testid: span?.getAttribute('data-testid') ?? null,
    line: p?.textContent ?? null,
    pBox: pr ? { w: pr.width, h: pr.height, top: pr.top, bottom: pr.bottom } : null,
    pClient: p ? { ch: p.clientHeight, sh: p.scrollHeight, cw: p.clientWidth, sw: p.scrollWidth } : null,
    spanBox: sr ? { top: sr.top, bottom: sr.bottom, left: sr.left, right: sr.right } : null,
    timeVisible: !!(pr && sr && sr.bottom <= pr.bottom + 0.5 && sr.right <= pr.right + 0.5 && sr.width > 0),
    lineCount: p ? (() => { const r = document.createRange(); r.selectNodeContents(p); return new Set([...r.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top))).size; })() : null,
    lineHeight: p ? getComputedStyle(p).lineHeight : null,
    libWidth: lib ? lib.getBoundingClientRect().width : null,
    marker: document.querySelector('[data-testid="arrangement-insert-marker"]')?.getAttribute('data-insert-marker') ?? null,
    playhead: Number(document.querySelector('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow')),
    playing: !!document.querySelector('button[aria-label="Pause"]'),
    status: document.querySelector('[data-testid="arrangement-status"]')?.textContent,
    clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => `${c.closest('[data-track-id]')?.getAttribute('data-track-id')}@${c.getAttribute('data-clip-start')}`),
  };
}, CAP);
async function laneClickAt(page, track, seconds) {
  const ruler = await page.getByTestId('arrangement-ruler').boundingBox();
  const pps = await page.evaluate(() => parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent));
  const box = await page.locator(`[data-track-id="${track}"]`).first().boundingBox();
  await page.mouse.click(ruler.x + seconds * pps, box.y + box.height / 2);
  await sleep(900);
}
(async () => {
  const browser = await chromium.launch();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const tag = `${vp.width}x${vp.height}`;
    for (const mode of ['stopped', 'playing', 'video']) {
      const { ctx, page, errors } = await open(browser, vp);
      const row = {};
      try {
        await laneClickAt(page, 'sfx', 3);
        await page.keyboard.press('Space'); await sleep(1500); await page.keyboard.press('Space'); await sleep(300);
        await page.locator('[data-source-id="demo-soft-impact"]').first().click(); await sleep(400);
        if (mode === 'video') {
          const v = await page.locator('[data-track-id="video"]').count();
          row.videoLane = v;
          if (v) {
            await page.locator('[data-track-id="video"] button[aria-pressed]').first().click(); await sleep(600);
          }
        }
        if (mode === 'playing') { await page.keyboard.press('Space'); await sleep(1000); }
        row.before = await read(page);
        await page.screenshot({ path: path.join(shotDir, `${mode}-before-${tag}.png`) });
        if (mode !== 'video') {
          await page.locator('button', { hasText: /^\+?\s*Add$/ }).last().click(); await sleep(600);
          row.after = await read(page);
        }
        if (mode === 'playing') { await page.keyboard.press('Space'); await sleep(300); }
      } catch (e) { row.error = String(e); }
      row.errors = errors;
      R.rows[`${mode}@${tag}`] = row; save();
      await ctx.close();
    }
  }
  await browser.close(); R.finished = new Date().toISOString(); save();
})();
