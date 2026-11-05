// B356 fade release names probe; based on b-round-346/names-probe-v2.mjs (C324 copy of a-round-324/probe/drag-names-probe.mjs, extended with trim-start and move drags (4 moves each, 10 px).
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? 'click-hooks-head.json';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => {
  localStorage.setItem('czaba_analytics_consent', 'denied');
  const st = { recording: false, commits: [] };
  window.__b321 = st;
  const nameOf = (f) => { const t = f.type; if (!t) return ''; if (typeof t === 'function') return t.displayName || t.name || ''; if (t.displayName) return t.displayName; if (t.render) return t.render.displayName || t.render.name || ''; if (t.type) return t.type.name || ''; return ''; };
  const desc = (v) => { if (v === null) return 'null'; if (Array.isArray(v)) return `array(${v.length}):${JSON.stringify(v).slice(0, 80)}`; if (typeof v === 'object') return `object{${Object.keys(v).slice(0, 6).join(',')}}`; return `${typeof v}:${String(v).slice(0, 80)}`; };
  const findProvider = (fiber) => { const stack = [fiber]; while (stack.length) { const f = stack.pop(); if (nameOf(f) === 'ArrangementProvider') return f; if (f.sibling) stack.push(f.sibling); if (f.child) stack.push(f.child); } return null; };
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { supportsFiber: true, isDisabled: false, renderers: new Map(), inject(r) { const id = this.renderers.size + 1; this.renderers.set(id, r); return id; }, checkDCE() {}, onScheduleFiberRoot() {}, onPostCommitFiberRoot() {}, onCommitFiberUnmount() {},
    onCommitFiberRoot(_id, root) {
      if (!st.recording) return;
      const p = findProvider(root.current);
      if (!p || !p.alternate) { st.commits.push({ provider: p ? 'mounted' : 'none' }); return; }
      const changed = []; let a = p.memoizedState, b = p.alternate.memoizedState, i = 0;
      while (a && b) { const qa = a.queue; if (qa && 'lastRenderedState' in qa && !Object.is(a.memoizedState, b.memoizedState)) changed.push({ hook: i, before: desc(b.memoizedState), after: desc(a.memoizedState) }); a = a.next; b = b.next; i++; }
      const tags = new Set([0, 1, 11, 14, 15]); const names = [];
      const visit = (fiber) => { let c = fiber.child; while (c) { const alt = c.alternate; const did = (c.flags & 1) === 1; if (tags.has(c.tag) && (alt === null || did)) names.push(nameOf(c) || `tag${c.tag}`); if (alt === null || c.child !== alt.child || did) visit(c); c = c.sibling; } };
      visit(root.current);
      st.commits.push({ providerRendered: (p.flags & 1) === 1, changed, rendered: names.length, names });
    } };
});
const page = await context.newPage();
await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 120000 });
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Add', exact: true }).first().click();
await page.locator('[data-clip-kind="audio"]').first().waitFor();
await page.waitForTimeout(1500);
const clip = page.locator('[data-clip-kind="audio"]').first();
const result = { base, runs: {} };
const commitsNow = () => page.evaluate(() => window.__b321.commits);
const startRec = () => page.evaluate(() => { window.__b321.commits = []; window.__b321.recording = true; });
const stopRec = () => page.evaluate(() => { window.__b321.recording = false; return window.__b321.commits; });
const grabOf = async (loc, centre) => loc.evaluate((el, centre) => { const b = el.getBoundingClientRect(); const y = b.top + b.height * (centre ? 0.5 : 0.6); if (centre) return { x: b.left + b.width / 2, y }; let first = null; for (let x = Math.max(b.left, 0) + 4; x < Math.min(b.right, innerWidth) - 4; x += 4) { const h = document.elementFromPoint(x, y); if (h && el.contains(h)) { first = x; break; } } return { x: first + 200, y }; }, centre);
const gesture = async (g) => { await page.mouse.move(g.x, g.y); await page.mouse.down(); await page.mouse.move(g.x + 60, g.y, { steps: 30 }); await page.mouse.move(g.x + 120, g.y, { steps: 30 }); };
const undoTitle = () => page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title');
for (const state of ['stopped', 'playing']) {
  for (const rep of [1, 2]) {
    if (state === 'playing') { await page.evaluate(() => document.activeElement?.blur?.()); await page.keyboard.press('Home'); await page.waitForTimeout(800); const playing = await page.getByRole('button', { name: /^Pause/ }).count(); if (!playing) { await page.keyboard.press('Space'); await page.waitForTimeout(800); } }
    const rg = await grabOf(clip.getByTitle('drag = time selection · click = insert marker', { exact: true }), false);
    await gesture(rg); await startRec(); await page.mouse.up(); await page.waitForTimeout(1200);
    result.runs[`range-${state}-${rep}`] = await stopRec();
    await page.mouse.click(rg.x, rg.y); await page.waitForTimeout(800);
    const undoBefore = await undoTitle();
    const fg = await grabOf(clip.getByTestId('arrangement-clip-fade-in-handle'), true);
    await gesture(fg); await page.waitForTimeout(100);
    result.runs[`fade-${state}-${rep}-statusBefore`] = await page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null);
    await startRec(); await page.mouse.up(); await page.waitForTimeout(1500);
    result.runs[`fade-${state}-${rep}`] = await stopRec();
    result.runs[`fade-${state}-${rep}-statusAfter`] = await page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null);
    result.runs[`fade-${state}-${rep}-active`] = await page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName} ${a.getAttribute('data-testid') ?? ''} ${a.getAttribute('aria-label') ?? ''}` : null; });
    if ((await undoTitle()) !== undoBefore) { await page.evaluate(() => document.activeElement?.blur?.()); await page.keyboard.press('Control+z'); await page.waitForTimeout(800); }
  }
}
writeFileSync(out, JSON.stringify(result, null, 1));
await browser.close();
