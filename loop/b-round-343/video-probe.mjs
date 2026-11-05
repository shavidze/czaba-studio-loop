// B343 video-clip drag probe: PERF-DRAG-PREVIEW c5 premise at HEAD (from b-round-338/group-probe.mjs).
// Usage: node video-probe.mjs <base-url> <out.json> [width] [height] [video-file]
// Imports a repo mp4 through arrangement-video-input, waits for the clip, then for move / trim / fade
// (stopped, then playing) presses the clip's target and moves 60 steps over 120 px like the perf spec.
// Records per commit: rendered count, provider rendered + changed hooks, StudioWorkspace / ArrangementVideoDock rendered.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? 'video.json';
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);
const file = process.argv[6] ?? '/home/runner/czaba-project/store/public/videos/hero/10.mp4';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: { width, height } });
await context.addInitScript(() => {
  localStorage.setItem('czaba_analytics_consent', 'denied');
  const st = { recording: false, commits: [], starts: 0 };
  window.__b343 = st;
  const ns = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...a) { if (st.recording) st.starts += 1; return ns.apply(this, a); };
  const nameOf = (f) => { const t = f.type; if (!t) return ''; if (typeof t === 'function') return t.displayName || t.name || ''; if (t.render) return t.render.name || ''; if (t.type) return t.type.name || ''; return ''; };
  const findProvider = (fiber) => { const stack = [fiber]; while (stack.length) { const f = stack.pop(); if (nameOf(f) === 'ArrangementProvider') return f; if (f.sibling) stack.push(f.sibling); if (f.child) stack.push(f.child); } return null; };
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { supportsFiber: true, isDisabled: false, renderers: new Map(), inject(r) { const id = this.renderers.size + 1; this.renderers.set(id, r); return id; }, checkDCE() {}, onScheduleFiberRoot() {}, onPostCommitFiberRoot() {}, onCommitFiberUnmount() {},
    onCommitFiberRoot(_id, root) {
      if (!st.recording) return;
      const p = findProvider(root.current);
      const changed = []; if (p && p.alternate) { let a = p.memoizedState, b = p.alternate.memoizedState, i = 0; while (a && b) { const qa = a.queue; if (qa && 'lastRenderedState' in qa && !Object.is(a.memoizedState, b.memoizedState)) changed.push(i); a = a.next; b = b.next; i++; } }
      const tags = new Set([0, 1, 11, 14, 15]); const names = [];
      const visit = (fiber) => { let c = fiber.child; while (c) { const alt = c.alternate; const did = (c.flags & 1) === 1; if (tags.has(c.tag) && (alt === null || did)) names.push(nameOf(c) || `tag${c.tag}`); if (alt === null || c.child !== alt.child || did) visit(c); c = c.sibling; } };
      visit(root.current);
      st.commits.push({ providerRendered: p ? (p.flags & 1) === 1 : null, changed, rendered: names.length, workspaceRendered: names.includes('StudioWorkspace'), dockRendered: names.includes('ArrangementVideoDock') });
    } };
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => /Demo collection ready/.test(document.body.textContent ?? ''), null, { timeout: 120000 });
await page.waitForTimeout(1000);
const result = { viewport: `${width}x${height}`, file, pageErrors: errors };
result.undoBeforeImport = await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title');
await page.getByTestId('arrangement-video-input').setInputFiles(file);
const clip = page.locator('[data-clip-kind="video"]').first();
await clip.waitFor({ timeout: 60000 });
await page.waitForTimeout(4000);
result.undoAfterImport = await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title');
result.status = await page.evaluate(() => document.querySelector('[role="status"]')?.textContent ?? null);
const clipState = () => clip.evaluate((el) => ({ start: el.getAttribute('data-clip-start'), fadeIn: el.getAttribute('data-fade-in'), width: Math.round(el.getBoundingClientRect().width) }));
result.clipBefore = await clipState();
const target = (drag) => drag === 'move' ? clip.getByTitle(/ — drag to move$/) : drag === 'trim' ? clip.getByTitle('Trim — left edge', { exact: true }) : clip.getByTestId('arrangement-video-fade-in-handle');
result.targets = {};
for (const d of ['move', 'trim', 'fade']) result.targets[d] = await target(d).count();
const summarise = (commits, moves) => {
  const n = commits.length; const sum = commits.reduce((s, c) => s + (c.rendered ?? 0), 0);
  return { commits: n, moves, perMove: moves ? Number((sum / moves).toFixed(3)) : null, max: Math.max(0, ...commits.map((c) => c.rendered ?? 0)), providerRenders: commits.filter((c) => c.providerRendered).length, workspaceRenders: commits.filter((c) => c.workspaceRendered).length, dockRenders: commits.filter((c) => c.dockRendered).length, changedHooks: [...new Set(commits.flatMap((c) => c.changed))] };
};
for (const playing of [false, true]) {
  if (playing) { await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur()); await page.keyboard.press('Space'); await page.waitForTimeout(800); await page.keyboard.press('Home'); await page.waitForTimeout(600); }
  for (const drag of ['move', 'trim', 'fade']) {
    const key = `${drag}-${playing ? 'playing' : 'stopped'}`;
    const t = target(drag);
    if ((await t.count()) !== 1) { result[key] = { error: `target count ${await t.count()}` }; continue; }
    const box = await t.boundingBox();
    const x = drag === 'move' ? box.x + Math.min(200, box.width / 2) : box.x + box.width / 2;
    const y = box.y + box.height / 2;
    const before = await clipState();
    const undoBefore = await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title');
    await page.mouse.move(x, y); await page.mouse.down();
    await page.evaluate(() => { window.__b343.commits = []; window.__b343.starts = 0; window.__b343.recording = true; });
    await page.mouse.move(x + 60, y, { steps: 30 });
    const mid = await clipState();
    await page.mouse.move(x + 120, y, { steps: 30 });
    const moveCommits = await page.evaluate(() => { const c = window.__b343.commits; window.__b343.commits = []; return { c, starts: window.__b343.starts }; });
    await page.evaluate(() => { window.__b343.starts = 0; });
    await page.mouse.up(); await page.waitForTimeout(800);
    const rel = await page.evaluate(() => { window.__b343.recording = false; return { c: window.__b343.commits, starts: window.__b343.starts }; });
    const end = await clipState();
    const undoAfter = await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title');
    result[key] = { before, mid, end, undoBefore, undoAfter, move: summarise(moveCommits.c, 60), moveStarts: moveCommits.starts, release: summarise(rel.c, 0), releaseStarts: rel.starts, isPlaying: playing };
    if (undoAfter !== undoBefore) { await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur()); await page.keyboard.press('Control+z'); await page.waitForTimeout(800); }
    result[key].afterUndo = await clipState();
  }
  if (playing) { await page.keyboard.press('Space'); await page.waitForTimeout(500); }
}
writeFileSync(out, JSON.stringify(result, null, 1));
await browser.close();
console.log(out);
