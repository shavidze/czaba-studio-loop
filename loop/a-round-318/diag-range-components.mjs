import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';

const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? '/tmp/a318-diag.json';

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
const body = clip.getByTitle('drag = time selection · click = insert marker', { exact: true });
const box = await body.boundingBox();
const x = box.x + 220;
const y = box.y + box.height * 0.6;
await page.mouse.move(x, y);
await page.mouse.down();
await page.mouse.move(x + 10, y, { steps: 5 });
await page.waitForTimeout(300);
await page.evaluate(() => {
  window.__a318.recording = true;
});
await page.mouse.move(x + 70, y, { steps: 30 });
await page.waitForTimeout(300);
const commits = await page.evaluate(() => {
  window.__a318.recording = false;
  return window.__a318.commits;
});
await page.mouse.up();
const counts = commits.map((c) => c.length);
const largest = commits.reduce((a, c) => (c.length > a.length ? c : a), []);
const tally = (list) => {
  const m = {};
  for (const n of list) m[n] = (m[n] ?? 0) + 1;
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
};
const small = commits.find((c) => c.length > 0 && c.length < largest.length) ?? [];
const result = {
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
