// Baseline recipe for R423-MARKER-SEEK (INFO-C404-MARKER-SEEK-RECIPE). Usage: OUT=<dir> node marker-seek.cjs
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const OUT = process.env.OUT || __dirname + '/out';
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const res = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const tag = `${w}x${h}`;
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
    const t = (id) => p.evaluate((i) => document.querySelector(`[data-testid="${i}"]`)?.textContent?.trim() ?? null, id);
    const R = { errs };
    try {
      await p.goto(BASE + '/studio-lab', { waitUntil: 'load' });
      await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 120000 });
      await p.waitForTimeout(800);
      await p.locator('[role=option][data-source-id="demo-synth-mix"]').click();
      await p.keyboard.press('Enter');
      await p.waitForTimeout(1500);
      const ruler = p.locator('[data-testid="arrangement-ruler"]');
      const box = await ruler.boundingBox();
      await p.mouse.click(box.x + 352, box.y + box.height / 2);
      await p.waitForTimeout(400);
      R.posAfterRulerClick = await t('arrangement-position');
      if (!process.env.NOMARKER) await p.getByRole('button', { name: /^Add marker/ }).click();
      await p.waitForTimeout(400);
      const flags = p.locator('[data-testid="arrangement-marker"]');
      R.markers = await flags.count();
      R.flagLabel = R.markers ? await flags.first().getAttribute('aria-label') : null;
      R.editorOpen = await p.locator('[data-testid="arrangement-marker-name-input"]').count();
      if (R.editorOpen) { await p.keyboard.press('Enter'); await p.waitForTimeout(400); }
      R.markers = await flags.count();
      R.flagLabel = R.markers ? await flags.first().getAttribute('aria-label') : null;
      R.statusAfterAdd = await t('arrangement-status');
      await p.mouse.click(box.x + 110, box.y + box.height / 2);
      await p.waitForTimeout(400);
      R.posAfterSecondClick = await t('arrangement-position');
      await p.keyboard.press('Home');
      await p.waitForTimeout(400);
      R.posAfterHome = await t('arrangement-position');
      await p.getByRole('button', { name: /^Next marker/ }).click();
      await p.waitForTimeout(500);
      R.posAfterNext = await t('arrangement-position');
      R.status = await t('arrangement-status');
      await p.screenshot({ path: `${OUT}/marker-seek${process.env.NOMARKER ? '-nomarker' : ''}-${tag}.png` });
    } catch (e) {
      R.error = String(e).slice(0, 300);
    }
    res[tag] = R;
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync(`${OUT}/marker-seek${process.env.NOMARKER ? '-nomarker' : ''}.json`, JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));
})();
