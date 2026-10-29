// B round-247 planning probe: history steps that remove/move a focused group-row element. usage: node group-origins-probe-247.cjs <base> <outFile> [shotDir]
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const base = process.argv[2];
const outFile = process.argv[3];
const shotDir = process.argv[4] || path.join(path.dirname(outFile), 'shots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = { base, started: new Date().toISOString(), rows: {} };
const save = () => fs.writeFileSync(outFile, JSON.stringify(R, null, 1));
const NAME = '[data-testid=arrangement-track-header] button[aria-label*="— set as the active track"]';
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
  const row = a.closest('[data-track-id], [data-group-id]');
  const cs = getComputedStyle(a);
  return { el: a.getAttribute('data-testid') || a.tagName, label: (a.getAttribute('aria-label') || a.textContent.trim()).slice(0, 60), row: row ? (row.dataset.groupId ? 'group:' + row.dataset.groupId : 'track:' + row.dataset.trackId) : null, focusVisible: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` };
});
const status = (page) => page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent);
const rows = (page) => page.evaluate(() => [...document.querySelectorAll('[data-track-id], [data-group-id]')].filter((e) => e.matches('[data-testid=arrangement-group-row]') || e.querySelector('[data-testid=arrangement-track-header]')).map((e) => (e.dataset.groupId ? 'G:' + e.dataset.groupId + '@' + e.dataset.groupDepth : 'T:' + e.dataset.trackId)));
const groups = (page) => page.getByTestId('arrangement-group-row').count();
async function group(page, a, b) {
  const names = page.locator(NAME);
  await names.nth(a).click(); await sleep(300);
  await names.nth(b).click({ modifiers: ['Control'] }); await sleep(300);
  await page.keyboard.press('Control+g'); await sleep(600);
}
const CASES = {
  groupUndo: async (page, row) => { await group(page, 1, 2); await page.getByTestId('arrangement-group-name').focus(); return 'Control+z'; },
  groupUndoNatural: async (page, row) => { await group(page, 1, 2); row.focusAfterGroup = await desc(page); return 'Control+z'; },
  ungroupPrecedence: async (page, row) => {
    await group(page, 1, 2);
    await page.locator(NAME).nth(3).click({ modifiers: ['Control'] }); await sleep(300); await page.keyboard.press('Control+g'); await sleep(600);
    await page.getByTestId('arrangement-group-name').nth(1).click({ modifiers: ['Control'] }); await sleep(300);
    row.selected = await page.evaluate(() => [...document.querySelectorAll('[data-group-selected=true]')].length);
    await page.getByTestId('arrangement-group-name').nth(1).focus(); return 'Control+Shift+g';
  },
  groupUndoTab: async (page, row) => { await group(page, 1, 2); await page.getByTestId('arrangement-group-fold').focus(); await page.keyboard.press('Tab'); await sleep(300); row.afterTab = await desc(page); return 'Control+z'; },
  volumeStepUndo: async (page, row) => {
    await group(page, 1, 2); const v = page.getByTestId('arrangement-group-volume'); await v.focus();
    await page.keyboard.press('ArrowUp'); await sleep(150); await page.keyboard.press('ArrowUp'); await sleep(400);
    row.afterSteps = { value: await v.inputValue(), title: await v.getAttribute('title'), status: await status(page), undo: await page.getByRole('button', { name: /^Undo/ }).getAttribute('aria-label') };
    return 'Control+z';
  },
  gridMenuUndo: async (page, row) => {
    await group(page, 1, 2); await page.getByTestId('arrangement-group-name').focus();
    const lane = page.locator('[data-track-id=sfx]').first(); const box = await lane.boundingBox();
    await page.mouse.click(box.x + box.width - 80, box.y + box.height / 2, { button: 'right' }); await sleep(500);
    row.menuOpen = await page.locator('[role=menu]').count(); row.menuFocus = await desc(page);
    return 'Control+z';
  },
  volumeStepDownUndo: async (page, row) => {
    await group(page, 1, 2); const v = page.getByTestId('arrangement-group-volume'); await v.focus();
    row.beforeSteps = { value: await v.inputValue(), title: await v.getAttribute('title') };
    await page.keyboard.press('ArrowDown'); await sleep(150); await page.keyboard.press('ArrowDown'); await sleep(400);
    row.afterSteps = { value: await v.inputValue(), title: await v.getAttribute('title'), status: await status(page), focus: await desc(page) };
    await page.keyboard.press('Control+z'); await sleep(600);
    row.afterFirstUndo = { groups: await groups(page), status: await status(page), focus: await desc(page), value: await v.inputValue().catch(() => null) };
    return 'Control+z';
  },
  collapseFocusReg: async (page, row) => {
    await group(page, 1, 2); await page.getByTestId('arrangement-group-name').click(); await sleep(300);
    await page.locator(NAME).nth(1).focus(); row.memberFocus = await desc(page);
    await page.keyboard.press('KeyU'); await sleep(700);
    row.afterU = { focus: await desc(page), rows: await rows(page) };
    return 'NONE';
  },
  groupUndoY: async (page, row) => {
    await group(page, 1, 2); await page.getByTestId('arrangement-group-name').focus(); await page.keyboard.press('Control+Shift+g'); await sleep(600);
    row.afterUngroup = { focus: await desc(page), groups: await groups(page) };
    await page.keyboard.press('Control+z'); await sleep(600);
    row.afterUndoUngroup = { focus: await desc(page), groups: await groups(page) };
    await page.getByTestId('arrangement-group-name').focus(); return 'Control+y';
  },
  ungroupRedo: async (page, row) => {
    await group(page, 1, 2); await page.getByTestId('arrangement-group-name').focus(); await page.keyboard.press('Control+Shift+g'); await sleep(600);
    await page.keyboard.press('Control+z'); await sleep(600);
    await page.getByTestId('arrangement-group-name').focus(); return 'Control+Shift+z';
  },
  foldFocusUndo: async (page) => { await group(page, 1, 2); await page.getByTestId('arrangement-group-fold').focus(); return 'Control+z'; },
  muteFocusUndo: async (page) => { await group(page, 1, 2); await page.getByTestId('arrangement-group-mute').focus(); return 'Control+z'; },
  volumeFocusUndo: async (page) => { await group(page, 1, 2); await page.getByTestId('arrangement-group-volume').focus(); return 'Control+z'; },
  collapsedUndo: async (page, row) => { await group(page, 1, 2); await page.getByTestId('arrangement-group-fold').click(); await sleep(700); row.collapsedRows = await rows(page); await page.getByTestId('arrangement-group-name').focus(); return 'Control+z'; },
  memberFocusUndo: async (page) => { await group(page, 1, 2); await page.locator(NAME).nth(2).focus(); return 'Control+z'; },
  nonAdjacentRefused: async (page, row) => { await group(page, 1, 3); row.groupedRows = await rows(page); await page.locator(NAME).nth(3).focus(); row.focusedMember = await desc(page); return 'Control+z'; },
  nestedOuterUndo: async (page, row) => {
    await group(page, 1, 2);
    await page.locator(NAME).nth(3).click({ modifiers: ['Control'] }); await sleep(300); await page.keyboard.press('Control+g'); await sleep(600);
    row.nestedRows = await rows(page);
    await page.getByTestId('arrangement-group-name').first().focus(); return 'Control+z';
  },
  nestedInnerUndo: async (page, row) => {
    await group(page, 1, 2);
    await page.locator(NAME).nth(3).click({ modifiers: ['Control'] }); await sleep(300); await page.keyboard.press('Control+g'); await sleep(600);
    row.nestedRows = await rows(page);
    await page.getByTestId('arrangement-group-name').nth(1).focus(); return 'Control+z';
  },
  ungroupUndo: async (page, row) => { await group(page, 1, 2); await page.getByTestId('arrangement-group-name').focus(); await page.keyboard.press('Control+Shift+g'); await sleep(600); row.afterUngroup = { focus: await desc(page) }; return 'Control+z'; },
  groupRedoMember: async (page, row) => { await group(page, 1, 2); await page.keyboard.press('Control+z'); await sleep(600); await page.locator(NAME).nth(1).focus(); return 'Control+Shift+z'; },
  renameUndo: async (page) => { await group(page, 1, 2); await page.getByTestId('arrangement-group-name').focus(); await page.keyboard.press('F2'); await sleep(300); await page.keyboard.type('Bus'); await page.keyboard.press('Enter'); await sleep(500); await page.getByTestId('arrangement-group-name').focus(); return 'Control+z'; },
  noStealOtherTrack: async (page) => { await group(page, 1, 2); await page.locator(NAME).nth(0).focus(); return 'Control+z'; },
  noStealBody: async (page) => { await group(page, 1, 2); await page.getByTestId('arrangement-group-name').focus(); await sleep(150); await page.getByTestId('arrangement-status').click(); return 'Control+z'; },
  transportUndo: async (page) => { await group(page, 1, 2); return 'BUTTON:Undo'; },
  markerMenuUndo: async (page, row) => {
    await page.evaluate(() => document.body.focus()); await page.keyboard.press('KeyM'); await sleep(400); await page.keyboard.press('Enter'); await sleep(400);
    await page.getByTestId('arrangement-marker').first().click({ button: 'right' }); await sleep(500);
    row.menuFocus = await desc(page); return 'Control+z';
  },
};
(async () => {
  const browser = await chromium.launch();
  const vps = process.env.ONLY_VP === '1440' ? [{ width: 1440, height: 900 }] : process.env.ONLY_VP === '1280' ? [{ width: 1280, height: 720 }] : [{ width: 1440, height: 900 }, { width: 1280, height: 720 }];
  fs.mkdirSync(shotDir, { recursive: true });
  for (const vp of vps) {
    const k = `${vp.width}x${vp.height}`;
    for (const name of (process.env.ONLY_ROW ? process.env.ONLY_ROW.split(',') : Object.keys(CASES))) {
      const key = `${name}@${k}`;
      try {
        const { ctx, page, errors } = await open(browser, vp);
        const row = { rowsStart: await rows(page) };
        const action = await CASES[name](page, row);
        await sleep(200);
        row.focus = await desc(page); row.rowsBefore = await rows(page); row.groupsBefore = await groups(page);
        if (action === 'NONE') { } else if (action === 'BUTTON:Undo') { await page.getByRole('button', { name: /^Undo/ }).click(); } else { await page.keyboard.press(action); }
        await sleep(700);
        row.action = action; row.focusAfter = await desc(page); row.rowsAfter = await rows(page); row.groupsAfter = await groups(page); row.status = await status(page);
        row.markers = await page.getByTestId('arrangement-marker').count(); row.history = { undo: await page.getByRole('button', { name: /^Undo/ }).getAttribute('aria-label').catch(() => null), redo: await page.getByRole('button', { name: /^Redo/ }).getAttribute('aria-label').catch(() => null) }; row.menuAfter = await page.locator('[role=menu]').count();
        await page.screenshot({ path: path.join(shotDir, `${name}-${k}.png`) });
        R.rows[key] = { ...row, errors };
        await ctx.close();
      } catch (e) { R.rows[key] = { error: String(e).slice(0, 400) }; }
      save();
      const r = R.rows[key];
      console.log(key, r.error ? r.error : `${JSON.stringify(r.focus)} --${r.action}--> ${JSON.stringify(r.focusAfter)} groups ${r.groupsBefore}->${r.groupsAfter} | ${r.status}`.replace(/,"outline":"[^"]*"/g, ''));
    }
  }
  await browser.close(); save();
})();
