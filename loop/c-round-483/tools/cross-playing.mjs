// B337 cross-lane behaviour + names probe (round 338 c3-ii), from b-round-334/cross-lane-probe.mjs.
// Usage: node cross-lane-probe.mjs <base-url> <out.json> [width] [height]
// Records, on the first demo audio clip dragged by its name bar: per-commit rendered counts and provider hook changes
// (dev build only), the lane-move ghosts, the source clip dimming, the readout hint (plain and Shift), a release on the
// next lane with the Undo title, Ctrl+Z, and an Esc-cancelled cross-lane drag.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? 'cross-lane.json';
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: { width, height } });
await context.addInitScript(() => {
  localStorage.setItem('czaba_analytics_consent', 'denied');
  const st = { recording: false, commits: [] };
  window.__b337 = st;
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
      st.commits.push({ providerRendered: (p.flags & 1) === 1, changed, rendered: names.length, workspaceRendered: names.includes('StudioWorkspace') });
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
await page.waitForTimeout(1500);
await page.locator('body').evaluate(() => document.activeElement && document.activeElement.blur());
await page.keyboard.press('Space'); await page.waitForTimeout(700);
const playBefore = await page.locator('[data-playing]').first().getAttribute('data-playing');
const clip = page.locator('[data-clip-kind="audio"]').first();
const box = await clip.getByTitle(/ — drag to move$/).boundingBox();
const empty = await clip.evaluate((el) => { const own = el.closest('[data-track-id]'); const lanes = [...document.querySelectorAll('[data-track-id]')]; for (const lane of lanes.slice(lanes.indexOf(own) + 1)) { if (lane.contains(own) || own.contains(lane)) continue; const b = lane.getBoundingClientRect(); const y = b.top + b.height / 2; for (let x = Math.max(b.left, 0) + 4; x <= Math.min(b.right, innerWidth) - 4; x += 8) { const hit = document.elementFromPoint(x, y); if (hit && lane.contains(hit) && !hit.closest('[data-clip-kind]')) return { x, y, track: lane.getAttribute('data-track-id') }; } } return null; });
if (!empty || !box) throw new Error(`no empty lane point (${JSON.stringify(empty)}) or no name bar (${JSON.stringify(box)})`);
const result = { viewport: `${width}x${height}`, playBefore };
const rec = async (label, act) => {
  await page.evaluate(() => { window.__b337.commits = []; window.__b337.recording = true; });
  await act();
  await page.waitForTimeout(600);
  result[label] = await page.evaluate(() => { window.__b337.recording = false; return window.__b337.commits; });
};
const ghostState = () => page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-lane-move-ghost"]')].map((g) => ({ track: g.closest('[data-track-id]')?.getAttribute('data-track-id'), blocked: g.getAttribute('data-blocked'), start: g.getAttribute('data-ghost-start') })));
const readout = () => page.evaluate(() => ({
  hint: document.querySelector('[data-testid="arrangement-lane-move-hint"]')?.textContent ?? null,
  refusal: document.querySelector('[data-testid="arrangement-lane-move-refusal"]')?.textContent ?? null,
  selected: document.querySelector('[data-testid="arrangement-selected-clip"]')?.textContent ?? null,
}));
const sourceDimmed = () => clip.evaluate((el) => el.className.split(/\s+/).includes('opacity-40'));
const clipTrack = () => clip.evaluate((el) => el.closest('[data-track-id]')?.getAttribute('data-track-id'));
const clipStart = () => clip.getAttribute('data-clip-start');
await page.mouse.click(empty.x, empty.y); await page.waitForTimeout(600);
result.ownTrack = await clipTrack(); result.emptyTrack = empty.track; result.startBefore = await clipStart();
result.readoutBefore = await readout();
const x = box.x + 120, y = box.y + box.height / 2;
// gesture 1: same lane -> next lane (plain, then Shift) -> release on the next lane
await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 4, y); await page.waitForTimeout(300);
await rec('same-lane-moves', async () => { for (let i = 1; i <= 4; i++) { await page.mouse.move(x + 4 + i * 10, y); await page.waitForTimeout(120); } });
await rec('cross-enter', async () => { await page.mouse.move(x + 44, empty.y); await page.waitForTimeout(120); });
result.ghostsCrossEnter = await ghostState();
await rec('cross-lane-moves', async () => { for (let i = 1; i <= 4; i++) { await page.mouse.move(x + 44 + i * 10, empty.y); await page.waitForTimeout(120); } });
result.ghostsCross = await ghostState();
result.readoutCross = await readout();
result.sourceDimmedCross = await sourceDimmed();
await page.keyboard.down('Shift'); await page.mouse.move(x + 94, empty.y); await page.waitForTimeout(200);
result.readoutShift = await readout(); result.ghostsShift = await ghostState();
await page.keyboard.up('Shift'); await page.mouse.move(x + 98, empty.y); await page.waitForTimeout(200);
result.readoutUnshift = await readout();
await rec('release', async () => { await page.mouse.up(); });
result.trackAfterRelease = await clipTrack(); result.startAfterRelease = await clipStart();
result.ghostsAfterRelease = await ghostState(); result.readoutAfterRelease = await readout(); result.sourceDimmedAfterRelease = await sourceDimmed();
result.undoTitle = await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title');
await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(600);
result.trackAfterUndo = await clipTrack(); result.startAfterUndo = await clipStart();
// gesture 2: next lane, then Escape -> nothing changes
const box2 = await clip.getByTitle(/ — drag to move$/).boundingBox();
const x2 = box2.x + 120, y2 = box2.y + box2.height / 2;
await page.mouse.move(x2, y2); await page.mouse.down(); await page.mouse.move(x2 + 4, y2); await page.waitForTimeout(200);
await page.mouse.move(x2 + 24, empty.y); await page.waitForTimeout(200);
result.ghostsEscBefore = await ghostState();
await page.keyboard.press('Escape'); await page.waitForTimeout(300);
result.ghostsAfterEsc = await ghostState(); result.readoutAfterEsc = await readout();
await page.mouse.up(); await page.waitForTimeout(400);
result.trackAfterEsc = await clipTrack(); result.startAfterEsc = await clipStart();
result.undoTitleAfterEsc = await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title');
result.playAfter = await page.locator("[data-playing]").first().getAttribute("data-playing"); result.pageErrors = errors;
writeFileSync(out, JSON.stringify(result, null, 1));
await browser.close();
