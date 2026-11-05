// C324 copy of a-round-324/probe/drag-names-probe.mjs, extended with trim-start and move drags (4 moves each, 10 px).
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? 'click-hooks-head.json';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: {width:1280,height:720} });
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
await page.getByTestId('arrangement-video-input').setInputFiles('/home/runner/czaba-project/store/public/videos/hero/1.mp4');
const clip = page.locator('[data-clip-kind="video"]').first();
await clip.waitFor(); await page.waitForTimeout(1500);
await page.evaluate(() => document.activeElement?.blur?.());
for (let i = 0; i < 16; i++) { const b = await clip.getByTitle(/ — drag to move$/).boundingBox(); if ((b?.width ?? 0) >= 480) break; await page.keyboard.press('='); await page.waitForTimeout(400); }
const result = {};
const rec = async (label, act) => { await page.evaluate(() => { window.__b321.commits = []; window.__b321.recording = true; }); await act(); await page.waitForTimeout(600); result[label] = await page.evaluate(() => { window.__b321.recording = false; return window.__b321.commits; }); };
const dragRec = async (label, loc) => { const b = await loc.first().boundingBox({ timeout: 5000 }); console.error(label, JSON.stringify(b)); const x = b.x + Math.min(b.width / 2, 40), y = b.y + b.height / 2; await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 4, y); await page.waitForTimeout(300); await rec(label, async () => { for (let i = 1; i <= 4; i++) { await page.mouse.move(x + 4 + i * 10, y); await page.waitForTimeout(120); } }); await rec(label + '-release', async () => { await page.mouse.up(); }); await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(600); };
await dragRec('video-trim', clip.getByTitle('Trim — left edge', { exact: true }));
await dragRec('video-fade', clip.getByTestId('arrangement-video-fade-in-handle'));
await dragRec('video-move', clip.getByTitle(/ — drag to move$/));
writeFileSync(out, JSON.stringify(result, null, 1));
await browser.close();
