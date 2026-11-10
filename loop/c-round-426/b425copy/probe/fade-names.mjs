// B round 423 -> 424 probe (C-R423-01 diagnosis): during a fade-in handle drag (stopped, 60 steps +120 px, as
// PERF-1b-i), record per commit the NAMES of the fibers that perf/lib/instrumentation.ts counts
// (tags 0,1,11,14,15 with alternate === null or PerformedWork). Dev build keeps names. 1440x900 only.
// Usage: node fade-names.mjs <baseUrl> <outJson> [drag=fade|trim]
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const outPath = process.argv[3];
const drag = process.argv[4] ?? 'fade';
const hook = () => {
  const tags = new Set([0, 1, 11, 14, 15]);
  const nameOf = (f) => {
    const t = f.type;
    if (f.tag === 14 || f.tag === 15) {
      const inner = t && (t.type ?? t);
      const n = inner && (inner.displayName || inner.name || (inner.render && inner.render.name));
      return `Memo(${n || '?'})#${f.tag}`;
    }
    if (typeof t === 'function') return t.displayName || t.name || '?';
    if (t && typeof t === 'object') return t.displayName || (t.render && t.render.name) || '?obj';
    return '?';
  };
  window.__commits = [];
  window.__rec = false;
  const visit = (fiber, out) => {
    let child = fiber.child;
    while (child) {
      const alt = child.alternate;
      const did = (child.flags & 1) === 1;
      if (tags.has(child.tag) && (alt === null || did)) out.push(nameOf(child));
      if (alt === null || child.child !== alt.child || did) visit(child, out);
      child = child.sibling;
    }
  };
  Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
    configurable: true,
    value: { isDisabled: false, supportsFiber: true, renderers: new Map(), inject: () => 1, checkDCE: () => undefined,
      onCommitFiberRoot: (_id, root) => { if (!window.__rec) return; const out = []; visit(root.current, out); window.__commits.push(out); },
      onCommitFiberUnmount: () => undefined, onPostCommitFiberRoot: () => undefined },
  });
};
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.addInitScript(hook);
await page.goto(`${base}/studio-lab`, { waitUntil: 'domcontentloaded' });
await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 90000 });
await page.getByRole('button', { name: 'Add', exact: true }).first().click();
const clip = page.locator('[data-clip-kind="audio"]').first();
await clip.waitFor({ timeout: 30000 });
await page.waitForTimeout(2500);
const target = drag === 'trim' ? clip.getByTitle('Trim — left edge', { exact: true }) : clip.getByTestId('arrangement-clip-fade-in-handle');
await target.hover();
const box = await target.boundingBox();
const x = box.x + box.width / 2;
const y = box.y + box.height * (drag === 'trim' ? 0.6 : 0.5);
await page.mouse.move(x, y);
await page.mouse.down();
await page.waitForTimeout(300);
await page.evaluate(() => { window.__rec = true; });
for (let i = 1; i <= 60; i += 1) {
  await page.mouse.move(x + (120 * i) / 60, y);
  await page.waitForTimeout(16);
}
await page.waitForTimeout(200);
await page.evaluate(() => { window.__rec = false; });
await page.mouse.up();
const commits = await page.evaluate(() => window.__commits);
const freq = new Map();
for (const c of commits) for (const n of c) freq.set(n, (freq.get(n) ?? 0) + 1);
const sizes = commits.map((c) => c.length);
const out = { base, drag, at: new Date().toISOString(), commits: commits.length, maxSize: Math.max(0, ...sizes),
  meanSize: sizes.reduce((a, b) => a + b, 0) / Math.max(1, sizes.length), freq: Object.fromEntries([...freq].sort((a, b) => b[1] - a[1])),
  sample: commits.slice(0, 3), errors };
writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ commits: out.commits, maxSize: out.maxSize, meanSize: out.meanSize, freq: out.freq, errors }, null, 1));
await browser.close();
