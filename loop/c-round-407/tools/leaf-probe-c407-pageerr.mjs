// B round 406 -> 407 probe: copy of b-round-405/probe/leaf-probe-406.mjs; LEAVES + ArrangementVideoDockViewInner, ArrangementVideoCaption (PERF-11c-iii-d-ii).
// B round 405 -> 406 probe (copy of b-round-378/probe/leaf-probe-379.mjs, unchanged steps) for the PERF-11c-iii-d HEAD baseline.
// B round 378 -> 379 probe (copy of b-round-377/probe/leaf-probe-378.mjs). Change: LEAVES + ArrangementMarkerRowViewInner (PERF-11c-iii-c2b).
// B round 375 -> 376 probe (copy of b-round-374/probe/leaf-probe-375.mjs). Changes: LEAVES + round-376 transport group names;
// nameOf reads displayName first (forwardRef/memo objects): the old probe keyed forwardRef by render.name, so
// ArrangementMarkerRow (anonymous forwardRef arrow + displayName) always read 0 (B-R375-PROBE-FORWARDREF-NAME).
// Usage: node leaf-probe.mjs <baseUrl> <outJson>
// Counts, per interaction, how many times each useArrangement() leaf renders
// (React DevTools hook stub, dev build keeps names). 1440x900 and 1280x720.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const outPath = process.argv[3];
const LEAVES = ['StudioWorkspace', 'ArrangementTransport', 'ArrangementLibrary', 'ArrangementLibraryPreview',
  'ArrangementVideoDock', 'ArrangementMarkerRow', 'ArrangementLoopBrace', 'ArrangementLane', 'ArrangementMaster',
  'ArrangementExportDialog', 'ArrangementStatusTextInner', 'ArrangementLibraryViewInner', 'ArrangementLibraryPreviewViewInner', 'ArrangementMasterViewInner',
  'ArrangementTransportViewInner', 'ArrangementTransportEditGroupInner', 'ArrangementTransportCentreGroupInner', 'ArrangementTransportViewGroupInner',
  'ArrangementTransportPlayStopInner', 'ArrangementProjectEndTextInner', 'ArrangementLoopBraceViewInner', 'ArrangementMarkerRowViewInner', 'ArrangementVideoDockViewInner', 'ArrangementVideoCaption'];
const hookScript = () => {
  const counts = new Map();
  const seen = new WeakMap();
  const nameOf = (t) => {
    if (typeof t === 'function') return typeof t.displayName === 'string' && t.displayName ? t.displayName : t.name || null;
    if (t && typeof t === 'object') {
      if (typeof t.displayName === 'string' && t.displayName) return t.displayName;
      if (t.render && typeof t.render.name === 'string' && t.render.name) return t.render.name;
    }
    return null;
  };
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
const out = { base, at: new Date().toISOString(), leaves: LEAVES };
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = { steps: {} }; out[`${w}x${h}`] = r;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(hookScript);
  const page = await ctx.newPage(); r.pageErrors = []; page.on('pageerror', (e) => r.pageErrors.push(String(e)));
  const reset = () => page.evaluate(() => window.__renderCounts.clear());
  const read = () => page.evaluate((names) => Object.fromEntries(names.map((n) => [n, window.__renderCounts.get(n) ?? 0])), LEAVES);
  const step = async (name, fn, settle = 500) => {
    await page.waitForTimeout(400);
    await reset();
    await fn();
    await page.waitForTimeout(settle);
    r.steps[name] = await read();
  };
  try {
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
    await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 });
    await page.waitForTimeout(800);
    await step('idle-1s', async () => { await page.waitForTimeout(1000); });
    const bass = page.getByRole('option', { name: /Bass/ }).first();
    r.bassOptions = await bass.count();
    await step('add-bass-enter', async () => { await bass.click(); await page.keyboard.press('Enter'); }, 1500);
    await step('zoom-in-key', async () => { await page.keyboard.press('='); });
    await step('zoom-out-key', async () => { await page.keyboard.press('-'); });
    await step('space-play', async () => { await page.keyboard.press('Space'); }, 300);
    await step('playing-1s', async () => { await page.waitForTimeout(1000); }, 0);
    await step('space-stop', async () => { await page.keyboard.press('Space'); }, 300);
    const mute = page.getByRole('button', { name: /^Mute — / }).first();
    r.muteFound = await mute.count();
    if (r.muteFound) {
      await step('lane-mute-click', async () => { await mute.click(); });
      await step('undo-ctrl-z', async () => { await page.keyboard.press('Control+z'); });
    }
    const transport = page.getByTestId('arrangement-transport');
    await step('transport-undo-button', async () => { await transport.getByRole('button', { name: /^Undo/ }).click(); });
    await step('transport-redo-button', async () => { await transport.getByRole('button', { name: /^Redo/ }).click(); });
    const preview = page.getByRole('button', { name: /^Preview|Play preview/ }).first();
    r.previewFound = await preview.count();
    if (r.previewFound) {
      await step('library-preview-start', async () => { await preview.click(); });
      await step('library-preview-stop', async () => { await preview.click(); });
    }
    await page.screenshot({ path: outPath.replace(/\.json$/, `-${w}.png`) });
  } catch (e) {
    r.error = String(e);
  }
  await ctx.close();
}
await browser.close();
writeFileSync(outPath, JSON.stringify(out, null, 1));
