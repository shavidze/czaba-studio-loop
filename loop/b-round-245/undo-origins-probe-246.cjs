// B round-246 planning probe: Undo/Redo paths that remove a focused element. usage: node undo-origins-probe-246.cjs <base> <outFile>
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const base = process.argv[2];
const outFile = process.argv[3];
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
  await sleep(600);
  return { ctx, page, errors };
}
const desc = (page) => page.evaluate(() => {
  const a = document.activeElement;
  if (!a || a === document.body) return { el: 'BODY' };
  return { el: a.getAttribute('data-testid') || a.tagName, label: a.getAttribute('aria-label') || a.textContent.trim().slice(0, 40), focusVisible: a.matches(':focus-visible'), outline: getComputedStyle(a).outline };
});
const status = (page) => page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent);
const flags = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((e) => e.getAttribute('aria-label')));
const addFlag = async (page) => { await page.evaluate(() => document.body.focus()); await page.keyboard.press('KeyM'); await sleep(400); await page.keyboard.press('Enter'); await sleep(400); };
(async () => {
  const browser = await chromium.launch();
  for (const vp of (process.env.ONLY_VP === '1440' ? [{ width: 1440, height: 900 }] : [{ width: 1440, height: 900 }, { width: 1280, height: 720 }])) {
    const k = `${vp.width}x${vp.height}`;
    for (const name of (process.env.ONLY_ROW ? [process.env.ONLY_ROW] : ['addUndo', 'addUndoNeighbour', 'deleteRedo', 'moveUndo', 'addUndoThenRedo', 'groupUndo', 'ungroupRedo'])) {
      const key = `${name}@${k}`;
      try {
        const { ctx, page, errors } = await open(browser, vp);
        const row = {};
        if (name === 'addUndo') {
          await addFlag(page); row.focus = await desc(page); row.before = await flags(page);
          await page.keyboard.press('Control+z'); await sleep(500);
        } else if (name === 'addUndoNeighbour') {
          await addFlag(page); await page.keyboard.press('ArrowRight'); await sleep(400);
          row.afterNudge = await flags(page);
          await addFlag(page); row.focus = await desc(page); row.before = await flags(page);
          await page.keyboard.press('Control+z'); await sleep(500);
        } else if (name === 'deleteRedo') {
          await addFlag(page); await page.keyboard.press('Delete'); await sleep(400);
          row.afterDelete = { flags: await flags(page), focus: await desc(page) };
          await page.keyboard.press('Control+z'); await sleep(500);
          row.afterUndo = { flags: await flags(page), focus: await desc(page) };
          await page.getByTestId('arrangement-marker').first().focus(); await sleep(200);
          row.focus = await desc(page); row.before = await flags(page);
          await page.keyboard.press('Control+Shift+z'); await sleep(500);
        } else if (name === 'moveUndo') {
          await addFlag(page); await page.keyboard.press('ArrowRight'); await sleep(400);
          row.focus = await desc(page); row.before = await flags(page);
          await page.keyboard.press('Control+z'); await sleep(500);
        } else if (name === 'addUndoThenRedo') {
          await addFlag(page); await page.keyboard.press('Control+z'); await sleep(500);
          row.afterUndo = { flags: await flags(page), focus: await desc(page) };
          row.before = await flags(page);
          await page.keyboard.press('Control+Shift+z'); await sleep(500);
        } else {
          const sel = '[data-testid=arrangement-track-header] button[aria-label*="— set as the active track"]';
          const names = page.locator(sel);
          await names.nth(1).click(); await sleep(300); await names.nth(2).click({ modifiers: ['Control'] }); await sleep(300);
          await page.keyboard.press('Control+g'); await sleep(600);
          if (name === 'ungroupRedo') {
            await page.getByTestId('arrangement-group-name').focus(); await page.keyboard.press('Control+Shift+g'); await sleep(600);
            row.afterUngroup = { groups: await page.getByTestId('arrangement-group-row').count(), focus: await desc(page), status: await status(page) };
            await page.keyboard.press('Control+z'); await sleep(600);
            row.afterUndo = { groups: await page.getByTestId('arrangement-group-row').count(), focus: await desc(page) };
            await page.getByTestId('arrangement-group-name').focus().catch(() => {}); await sleep(200);
            row.focus = await desc(page); row.groupsBefore = await page.getByTestId('arrangement-group-row').count();
            await page.keyboard.press('Control+Shift+z'); await sleep(600);
          } else {
            await page.getByTestId('arrangement-group-name').focus(); await sleep(200);
            row.focus = await desc(page); row.groupsBefore = await page.getByTestId('arrangement-group-row').count();
            await page.keyboard.press('Control+z'); await sleep(600);
          }
          row.groupsAfter = await page.getByTestId('arrangement-group-row').count();
        }
        row.after = await flags(page); row.focusAfter = await desc(page); row.status = await status(page);
        await page.screenshot({ path: `shots/${name}-${k}.png` });
        R.rows[key] = { ...row, errors };
        await ctx.close();
      } catch (e) { R.rows[key] = { error: String(e).slice(0, 300) }; }
      save();
      console.log(key, JSON.stringify(R.rows[key]).replace(/"outline":"[^"]*",?/g, '').slice(0, 600));
    }
  }
  await browser.close(); save();
})();
