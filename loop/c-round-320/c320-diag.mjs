import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';

const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? '/tmp/c320-diag.json';
const scenario = process.argv[4] ?? 'range';

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => {
  localStorage.setItem('czaba_analytics_consent', 'denied');
  const commits = [];
  window.__a318 = { commits, recording: false };
  const tags = new Set([0, 1, 11, 14, 15]);
  const nameOf = (fiber) => {
    const type = fiber.type;
    if (!type) return `tag${fiber.tag}`;
    if (typeof type === 'function') return type.displayName || type.name || 'anon';
    if (type.displayName) return type.displayName;
    if (type.render) return type.render.displayName || type.render.name || 'forwardRef';
    if (type.type) return type.type.displayName || type.type.name || 'memo';
    return 'unknown';
  };
  const collect = (root) => {
    const names = [];
    const visit = (fiber) => {
      let child = fiber.child;
      while (child) {
        const alt = child.alternate;
        const didWork = (child.flags & 1) === 1;
        if (tags.has(child.tag) && (alt === null || didWork)) {
          const chain = [];
          let up = child.return;
          while (up && chain.length < 2) {
            if (tags.has(up.tag)) chain.push(nameOf(up));
            up = up.return;
          }
          names.push(`${nameOf(child)} < ${chain.join(' < ')}`);
        }
        if (alt === null || child.child !== alt.child || didWork) visit(child);
        child = child.sibling;
      }
    };
    visit(root.current);
    return names;
  };
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true,
    isDisabled: false,
    renderers: new Map(),
    inject(renderer) {
      const id = this.renderers.size + 1;
      this.renderers.set(id, renderer);
      return id;
    },
    checkDCE() {},
    onScheduleFiberRoot() {},
    onCommitFiberRoot(_id, root) {
      if (window.__a318.recording) commits.push(collect(root));
    },
    onCommitFiberUnmount() {},
    onPostCommitFiberRoot() {},
  };
});
const page = await context.newPage();
await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(
  () => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''),
  null,
  { timeout: 120000 },
);
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Add', exact: true }).first().click();
await page.locator('[data-clip-kind="audio"]').first().waitFor();
await page.waitForTimeout(1500);
const clip = page.locator('[data-clip-kind="audio"]').first();
const target = scenario === 'range' ? clip.getByTitle('drag = time selection · click = insert marker', { exact: true }) : clip.getByTitle(/ — drag to move$/);
const box = await target.boundingBox();
const x = box.x + (scenario === 'range' ? 220 : 120);
const y = box.y + box.height * (scenario === 'range' ? 0.6 : 0.5);
let commits;
if (scenario === 'zoom30') {
  await page.mouse.click(x, y); await page.waitForTimeout(300);
  for (let i = 0; i < 29; i++) { await page.keyboard.press('Control+KeyD'); await page.waitForTimeout(60); }
  await page.waitForTimeout(1500);
  const n = await page.locator('[data-clip-kind="audio"]').count();
  await page.evaluate(() => { window.__a318.recording = true; });
  await page.keyboard.press('Equal'); await page.waitForTimeout(800);
  commits = await page.evaluate(() => { window.__a318.recording = false; return window.__a318.commits; });
  commits.clipCount = n;
} else if (scenario === 'click') {
  // deselect first via empty point far right on last lane, then click the header (as interact.click)
  const lanes = page.locator('[data-track-id]');
  const lb = await lanes.last().boundingBox();
  await page.mouse.click(lb.x + lb.width * 0.8, lb.y + lb.height / 2);
  await page.waitForTimeout(500);
  await page.evaluate(() => { window.__a318.recording = true; });
  await page.mouse.click(x, y);
  await page.waitForTimeout(500);
  commits = await page.evaluate(() => { window.__a318.recording = false; return window.__a318.commits; });
} else {
  await page.mouse.move(x, y);
  await page.waitForTimeout(300);
  await page.evaluate(() => { window.__a318.recording = true; });
  await page.mouse.down();
  await page.mouse.move(x + 60, y, { steps: 30 });
  await page.waitForTimeout(300);
  commits = await page.evaluate(() => { window.__a318.recording = false; return window.__a318.commits; });
  await page.mouse.up();
}
const counts = commits.map((c) => c.length);
const largest = commits.reduce((a, c) => (c.length > a.length ? c : a), []);
const tally = (list) => {
  const m = {};
  for (const n of list) m[n] = (m[n] ?? 0) + 1;
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
};
const small = commits.find((c) => c.length > 0 && c.length < largest.length) ?? [];
const all = commits.map((c) => ({ size: c.length, names: tally(c) }));
const firstFew = commits.slice(0, 6).map((c) => ({ size: c.length, top: tally(c).slice(0, 40) }));
const result = {
  scenario,
  clipCount: commits.clipCount ?? null,
  all,
  firstFew,
  base,
  commits: commits.length,
  moves: 30,
  componentsSum: counts.reduce((a, b) => a + b, 0),
  countsHistogram: tally(counts.map(String)),
  largest: tally(largest),
  smaller: tally(small),
};
const fs = await import('node:fs');
fs.writeFileSync(out, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
