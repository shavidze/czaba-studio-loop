// B338 group (multi-selection) move probe for PERF-DRAG-PREVIEW c4-i premise, from c-round-389/cross-lane-probe.mjs.
// Usage: node group-probe.mjs <base-url> <out.json> [width] [height] [collapse:0|1]
// Two selected audio clips on the music lane (Add, Ctrl+D, Ctrl+click the first); a press on the first clip's name bar.
// Records per commit: rendered count, provider rendered + changed hook indexes, StudioWorkspace / ArrangementGroupHeader
// rendered, and the top component names; plus ghosts, status line, clip tracks/starts, Undo titles.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? 'group.json';
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);
const collapse = process.argv[6] === '1';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: { width, height } });
await context.addInitScript(() => {
  localStorage.setItem('czaba_analytics_consent', 'denied');
  const st = { recording: false, commits: [] };
  window.__b338 = st;
  const nameOf = (f) => { const t = f.type; if (!t) return ''; if (typeof t === 'function') return t.displayName || t.name || ''; if (t.render) return t.render.name || ''; if (t.type) return t.type.name || ''; return ''; };
  const findProvider = (fiber) => { const stack = [fiber]; while (stack.length) { const f = stack.pop(); if (nameOf(f) === 'ArrangementProvider') return f; if (f.sibling) stack.push(f.sibling); if (f.child) stack.push(f.child); } return null; };
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { supportsFiber: true, isDisabled: false, renderers: new Map(), inject(r) { const id = this.renderers.size + 1; this.renderers.set(id, r); return id; }, checkDCE() {}, onScheduleFiberRoot() {}, onPostCommitFiberRoot() {}, onCommitFiberUnmount() {},
    onCommitFiberRoot(_id, root) {
      if (!st.recording) return;
      const p = findProvider(root.current);
      if (!p || !p.alternate) { st.commits.push({ provider: p ? 'mounted' : 'none' }); return; }
      const changed = []; let a = p.memoizedState, b = p.alternate.memoizedState, i = 0;
      while (a && b) { const qa = a.queue; if (qa && 'lastRenderedState' in qa && !Object.is(a.memoizedState, b.memoizedState)) changed.push(i); a = a.next; b = b.next; i++; }
      const tags = new Set([0, 1, 11, 14, 15]); const names = [];
      const visit = (fiber) => { let c = fiber.child; while (c) { const alt = c.alternate; const did = (c.flags & 1) === 1; if (tags.has(c.tag) && (alt === null || did)) names.push(nameOf(c) || `tag${c.tag}`); if (alt === null || c.child !== alt.child || did) visit(c); c = c.sibling; } };
      visit(root.current);
      const counts = {}; for (const n of names) counts[n] = (counts[n] ?? 0) + 1;
      const top = Object.entries(counts).sort((x, y) => y[1] - x[1]).slice(0, 8).map(([n, c]) => `${n}:${c}`);
      st.commits.push({ providerRendered: (p.flags & 1) === 1, changed, rendered: names.length, workspaceRendered: names.includes('StudioWorkspace'), groupHeaderRendered: counts.ArrangementGroupHeader ?? 0, top });
    } };
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => /Demo collection ready/.test(document.body.textContent ?? ''), null, { timeout: 120000 });
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Add', exact: true }).first().click();
await page.locator('[data-clip-kind="audio"]').first().waitFor();
await page.waitForTimeout(1200);
const clips = page.locator('[data-clip-kind="audio"]');
const first = clips.first();
const nameBar = (loc) => loc.getByTitle(/ — drag to move$/);
const b0 = await nameBar(first).boundingBox();
await page.mouse.click(b0.x + 40, b0.y + b0.height / 2); await page.waitForTimeout(300);
await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
await page.keyboard.press('Control+d'); await page.waitForTimeout(800);
const result = { viewport: `${width}x${height}`, collapse, clipCount: await clips.count() };
await page.keyboard.down('Control'); await page.mouse.click(b0.x + 40, b0.y + b0.height / 2); await page.keyboard.up('Control');
await page.waitForTimeout(500);
result.selectedCount = await page.locator('[data-clip-kind="audio"][aria-selected="true"], [data-clip-kind="audio"][data-selected="true"]').count();
result.selectedReadout = await page.evaluate(() => document.querySelector('[data-testid="arrangement-selected-clip"]')?.textContent ?? null);
if (collapse) {
  const toggle = page.locator('[data-group-collapsed], [aria-expanded]').filter({ has: page.locator(':scope') });
  result.groupToggles = await page.evaluate(() => [...document.querySelectorAll('button[aria-expanded]')].map((b) => b.getAttribute('aria-label') || b.textContent).slice(0, 10));
  const groupBtn = page.locator('button[aria-expanded="true"]').filter({ hasText: /Stems|stems/ }).first();
  const n = await groupBtn.count();
  if (n) { await groupBtn.click(); await page.waitForTimeout(600); }
  result.collapsedGroups = await page.locator('[data-group-collapsed="true"]').count();
}
const rec = async (label, act) => {
  await page.evaluate(() => { window.__b338.commits = []; window.__b338.recording = true; });
  await act();
  await page.waitForTimeout(600);
  result[label] = await page.evaluate(() => { window.__b338.recording = false; return window.__b338.commits; });
};
const state = () => page.evaluate(() => ({
  clips: [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => ({ track: c.closest('[data-track-id]')?.getAttribute('data-track-id'), start: c.getAttribute('data-clip-start') })),
  ghosts: [...document.querySelectorAll('[data-testid="arrangement-lane-move-ghost"]')].map((g) => ({ track: g.closest('[data-track-id]')?.getAttribute('data-track-id'), blocked: g.getAttribute('data-blocked'), start: g.getAttribute('data-ghost-start') })),
  status: document.querySelector('[role="status"]')?.textContent ?? null,
  hint: document.querySelector('[data-testid="arrangement-lane-move-hint"]')?.textContent ?? null,
}));
const empty = await first.evaluate((el) => { const own = el.closest('[data-track-id]'); const lanes = [...document.querySelectorAll('[data-track-id]')]; for (const lane of lanes.slice(lanes.indexOf(own) + 1)) { if (lane.contains(own) || own.contains(lane)) continue; const b = lane.getBoundingClientRect(); if (b.height < 10) continue; const y = b.top + b.height / 2; for (let x = Math.max(b.left, 0) + 4; x <= Math.min(b.right, innerWidth) - 4; x += 8) { const hit = document.elementFromPoint(x, y); if (hit && lane.contains(hit) && !hit.closest('[data-clip-kind]')) return { x, y, track: lane.getAttribute('data-track-id') }; } } return null; });
result.emptyTrack = empty?.track ?? null;
result.before = await state();
const bx = await nameBar(first).boundingBox();
const x = bx.x + 40, y = bx.y + bx.height / 2;
await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 4, y); await page.waitForTimeout(300);
await rec('same-lane-moves', async () => { for (let i = 1; i <= 4; i++) { await page.mouse.move(x + 4 + i * 10, y); await page.waitForTimeout(120); } });
result.midSame = await state();
if (empty) {
  await rec('cross-enter', async () => { await page.mouse.move(x + 44, empty.y); await page.waitForTimeout(120); });
  await rec('cross-lane-moves', async () => { for (let i = 1; i <= 4; i++) { await page.mouse.move(x + 44 + i * 10, empty.y); await page.waitForTimeout(120); } });
  result.midCross = await state();
  await rec('back-moves', async () => { await page.mouse.move(x + 84, y); await page.waitForTimeout(120); for (let i = 1; i <= 3; i++) { await page.mouse.move(x + 84 + i * 10, y); await page.waitForTimeout(120); } });
}
await rec('release', async () => { await page.mouse.up(); });
result.afterRelease = await state();
result.undoTitle = await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title');
await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(600);
result.afterUndo = await state();
// blocked: group at start 0 dragged left
const by = await nameBar(first).boundingBox();
const x3 = by.x + 40, y3 = by.y + by.height / 2;
await page.mouse.move(x3, y3); await page.mouse.down(); await page.mouse.move(x3 - 4, y3); await page.waitForTimeout(300);
await rec('blocked-moves', async () => { for (let i = 1; i <= 4; i++) { await page.mouse.move(x3 - 4 - i * 10, y3); await page.waitForTimeout(120); } });
result.midBlocked = await state();
await rec('blocked-release', async () => { await page.mouse.up(); });
result.afterBlocked = await state();
result.undoTitleAfterBlocked = await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title');
result.pageErrors = errors;
writeFileSync(out, JSON.stringify(result, null, 1));
await browser.close();
