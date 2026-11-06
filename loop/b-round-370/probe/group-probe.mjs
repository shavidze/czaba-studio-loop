// B round 370 -> 371 baseline probe (L29 state recipe) for PERF-11c-i. Usage:
//   node group-probe.mjs <baseUrl> <outJson>
// Runs at 1440x900 and 1280x720. Records group-header behaviour and, through a
// React DevTools hook stub (dev build keeps component names), how often the
// ArrangementGroupHeader leaf renders when a lane OUTSIDE a folded group is muted.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const outPath = process.argv[3];
const hookScript = () => {
  const counts = new Map();
  const seen = new WeakMap();
  const nameOf = (t) => (typeof t === 'function' && typeof t.name === 'string' ? t.name : null);
  const walk = (root) => {
    const stack = [root];
    while (stack.length) {
      const f = stack.pop();
      if (!f) continue;
      const n = nameOf(f.type);
      if (n) {
        const prev = seen.get(f) ?? (f.alternate ? seen.get(f.alternate) : undefined);
        if (!prev || prev.p !== f.memoizedProps || prev.s !== f.memoizedState) counts.set(n, (counts.get(n) ?? 0) + 1);
        seen.set(f, { p: f.memoizedProps, s: f.memoizedState });
        if (f.alternate) seen.delete(f.alternate);
      }
      if (f.sibling) stack.push(f.sibling);
      if (f.child) stack.push(f.child);
    }
  };
  Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
    configurable: true,
    value: { isDisabled: false, supportsFiber: true, renderers: new Map(), inject: () => 1, checkDCE: () => undefined,
      onCommitFiberRoot: (_id, root) => walk(root.current), onCommitFiberUnmount: () => undefined, onPostCommitFiberRoot: () => undefined },
  });
  window.__renderCounts = counts;
};
const out = { base, at: new Date().toISOString() };
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = {}; out[`${w}x${h}`] = r;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(hookScript);
  const page = await ctx.newPage();
  try {
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 120000 });
    await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 });
    await page.waitForTimeout(800);
    const laneButtons = page.getByRole('button', { name: /— set as the active track/ });
    r.laneNames = (await laneButtons.allTextContents()).map((s) => s.trim());
    r.groupHeadersBefore = await page.getByTestId('arrangement-group-header').count();
    // Group the 2nd and 3rd lanes (Music + Stems in the demo order).
    await laneButtons.nth(1).click();
    await laneButtons.nth(2).click({ modifiers: ['Shift'] });
    await page.keyboard.press('Control+g');
    await page.waitForTimeout(400);
    r.groupHeadersAfter = await page.getByTestId('arrangement-group-header').count();
    r.groupName = (await page.getByTestId('arrangement-group-name').first().textContent())?.trim();
    const solo = page.getByTestId('arrangement-group-solo').first();
    const mute = page.getByTestId('arrangement-group-mute').first();
    r.soloInitial = await solo.getAttribute('data-solo');
    await solo.click(); await page.waitForTimeout(200);
    r.soloAfterClick = { data: await solo.getAttribute('data-solo'), aria: await solo.getAttribute('aria-pressed') };
    await solo.click(); await page.waitForTimeout(200);
    r.soloAfterSecondClick = await solo.getAttribute('data-solo');
    // Member lane solo -> group shows mixed (find lane solo buttons by accessible name).
    const laneSolo = page.getByRole('button', { name: new RegExp(`^Solo — ${(r.laneNames[1] ?? '').replace(/·.*$/, '').trim()}`) }).first();
    r.memberSoloFound = await laneSolo.count();
    if (r.memberSoloFound) {
      await laneSolo.click(); await page.waitForTimeout(200);
      r.soloAfterMemberSolo = { data: await solo.getAttribute('data-solo'), aria: await solo.getAttribute('aria-pressed') };
      await laneSolo.click(); await page.waitForTimeout(200);
      r.soloAfterMemberUnsolo = await solo.getAttribute('data-solo');
    }
    await mute.click(); await page.waitForTimeout(200);
    r.muteAfterClick = await mute.getAttribute('aria-pressed');
    await page.keyboard.press('Control+z'); await page.waitForTimeout(200);
    r.muteAfterUndo = await mute.getAttribute('aria-pressed');
    const vol = page.getByTestId('arrangement-group-volume').first();
    r.volumeBefore = await vol.inputValue();
    await vol.focus(); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(300);
    r.volumeAfterArrowDown = await vol.inputValue();
    await page.keyboard.press('Tab'); await page.waitForTimeout(200);
    await page.keyboard.press('Control+z'); await page.waitForTimeout(300);
    r.volumeAfterUndo = await vol.inputValue();
    // Rename with F2.
    const nameBtn = page.getByTestId('arrangement-group-name').first();
    await nameBtn.focus(); await page.keyboard.press('F2'); await page.waitForTimeout(150);
    r.renameInputFocused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    await page.keyboard.press('Control+a'); await page.keyboard.type('Drums'); await page.keyboard.press('Enter');
    await page.waitForTimeout(250);
    r.nameAfterRename = (await nameBtn.textContent())?.trim();
    r.focusAfterRename = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    // Fold, then mute a lane outside the group and count header renders.
    await page.getByTestId('arrangement-group-fold').first().click(); await page.waitForTimeout(300);
    r.foldedAria = await page.getByTestId('arrangement-group-fold').first().getAttribute('aria-expanded');
    r.overviewBlocks = await page.locator('[data-overview-clip-id]').count();
    const outsideName = (r.laneNames[3] ?? '').replace(/·.*$/, '').trim();
    const outsideMute = page.getByRole('button', { name: new RegExp(`^Mute — ${outsideName}`) }).first();
    r.outsideLane = outsideName;
    r.outsideMuteFound = await outsideMute.count();
    if (r.outsideMuteFound) {
      await page.evaluate(() => window.__renderCounts.clear());
      await outsideMute.click(); await page.waitForTimeout(300);
      r.outsideMutePressed = await outsideMute.getAttribute('aria-pressed');
      r.rendersOnOutsideMute = await page.evaluate(() => ({
        header: window.__renderCounts.get('ArrangementGroupHeader') ?? 0,
        wrapper: window.__renderCounts.get('ArrangementGroupHeaderWithSelectionInner') ?? 0,
        workspace: window.__renderCounts.get('StudioWorkspace') ?? 0,
      }));
    }
    await page.screenshot({ path: outPath.replace(/\.json$/, `-${w}.png`) });
  } catch (error) {
    r.error = String(error);
  }
  await ctx.close();
}
await browser.close();
writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
