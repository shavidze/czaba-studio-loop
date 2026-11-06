// B round 373 -> 374 (record only): per-leaf subtree render sizes on one commit (lane mute click, zoom key).
// Usage: node subtree-probe.mjs <baseUrl> <outJson>
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2]; const outPath = process.argv[3];
const hookScript = () => {
  const LEAVES = new Set(['ArrangementTransport', 'ArrangementLibrary', 'ArrangementLibraryPreview', 'ArrangementVideoDock',
    'ArrangementMarkerRow', 'ArrangementLoopBrace', 'ArrangementLane', 'ArrangementMaster', 'ArrangementExportDialog']);
  const counts = new Map(); const seen = new WeakMap();
  const nameOf = (t) => (typeof t === 'function' && t.name) ? t.name : (t && typeof t === 'object' && t.render && t.render.name) ? t.render.name : (t && typeof t === 'object' && t.type && t.type.name) ? t.type.name : null;
  const walk = (root) => {
    const stack = [[root, 'outside']];
    while (stack.length) {
      const [f, owner] = stack.pop(); if (!f) continue;
      const n = nameOf(f.type); let own = owner;
      if (n && LEAVES.has(n) && owner === 'outside-or-workspace') own = n;
      if (n && LEAVES.has(n) && (owner === 'outside' || owner === 'StudioWorkspace')) own = n;
      if (n === 'StudioWorkspace') own = 'StudioWorkspace';
      if (n) {
        const prev = seen.get(f) ?? (f.alternate ? seen.get(f.alternate) : undefined);
        if (!prev || prev.p !== f.memoizedProps || prev.s !== f.memoizedState) counts.set(own, (counts.get(own) ?? 0) + 1);
        seen.set(f, { p: f.memoizedProps, s: f.memoizedState }); if (f.alternate) seen.delete(f.alternate);
      }
      if (f.sibling) stack.push([f.sibling, owner]);
      if (f.child) stack.push([f.child, own]);
    }
  };
  Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', { configurable: true, value: { isDisabled: false, supportsFiber: true, renderers: new Map(), inject: () => 1, checkDCE: () => undefined, onCommitFiberRoot: (_id, root) => walk(root.current), onCommitFiberUnmount: () => undefined, onPostCommitFiberRoot: () => undefined } });
  window.__sub = counts;
};
const out = { base, at: new Date().toISOString() };
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = {}; out[`${w}x${h}`] = r;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); await ctx.addInitScript(hookScript);
  const page = await ctx.newPage();
  const reset = () => page.evaluate(() => window.__sub.clear());
  const read = () => page.evaluate(() => Object.fromEntries([...window.__sub.entries()]));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 });
  await page.waitForTimeout(800);
  await page.getByRole('option', { name: /Bass/ }).first().click(); await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
  for (const [name, fn] of [['zoom-in-key', () => page.keyboard.press('=')], ['lane-mute-click', () => page.getByRole('button', { name: /^Mute — / }).first().click()], ['undo', () => page.keyboard.press('Control+z')]]) {
    await page.waitForTimeout(400); await reset(); await fn(); await page.waitForTimeout(500); r[name] = await read();
  }
  await ctx.close();
}
await browser.close(); writeFileSync(outPath, JSON.stringify(out, null, 1));
