// usage: [BASE=http://127.0.0.1:5173] node overview-hooks.mjs <abs out dir>  -> <out>/overview-hooks.json + overview-<w>.png (element) + full-<w>.png
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2];
if (!out) { console.error('out dir required'); process.exit(2); }
mkdirSync(out, { recursive: true });
const br = await chromium.launch();
const result = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const c = await br.newContext({ viewport: { width: w, height: h } });
  const p = await c.newPage();
  await p.goto((process.env.BASE ?? 'http://127.0.0.1:5173') + '/studio-lab', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
  await p.getByText('Demo collection ready').first().waitFor({ timeout: 120000 }).catch(() => {});
  const read = () => p.evaluate(() => {
    const ov = document.querySelector('[data-testid="arrangement-overview"]');
    if (!ov) return null;
    const r = ov.getBoundingClientRect();
    const lanes = [...ov.querySelectorAll('[data-overview-lane]')];
    return {
      state: ov.getAttribute('data-overview-state'),
      bbox: [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 100) / 100),
      outline: ov.querySelectorAll('[data-testid="arrangement-overview-outline"]').length,
      outlineParentIsRoot: ov.querySelector('[data-testid="arrangement-overview-outline"]')?.parentElement === ov,
      lanesContainer: ov.querySelectorAll('[data-testid="arrangement-overview-lanes"]').length,
      laneIds: lanes.map((l) => l.getAttribute('data-overview-lane')),
      trackIds: [...document.querySelectorAll('[data-track-id]')].map((t) => t.getAttribute('data-track-id')).filter((v, i, a) => a.indexOf(v) === i),
      barsPerLane: lanes.map((l) => l.querySelectorAll('[data-overview-bar]').length),
      barIds: [...ov.querySelectorAll('[data-overview-bar]')].map((b) => b.getAttribute('data-overview-bar')),
      clipIds: [...document.querySelectorAll('[data-clip-id]')].map((c) => c.getAttribute('data-clip-id')).filter((v, i, a) => a.indexOf(v) === i),
      childCount: ov.children.length,
      overlayClass: ov.children[0]?.className ?? null,
    };
  });
  const empty = await read();
  await p.screenshot({ path: `${out}/overview-empty-${w}.png`, clip: await p.getByTestId('arrangement-overview').boundingBox() });
  await p.getByTestId('arrangement-library-list').getByRole('option').first().click();
  await p.keyboard.press('Enter');
  await p.waitForSelector('[data-clip-id]');
  await p.mouse.move(2, h - 2);
  await p.waitForTimeout(800);
  const full = await read();
  await p.screenshot({ path: `${out}/overview-full-${w}.png`, clip: await p.getByTestId('arrangement-overview').boundingBox() });
  await p.screenshot({ path: `${out}/full-${w}.png` });
  result[w] = { empty, full };
  await c.close();
}
await br.close();
writeFileSync(`${out}/overview-hooks.json`, JSON.stringify(result, null, 1));
console.log(JSON.stringify(result));
