import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2];
const outPath = process.argv[3];
const browser = await chromium.launch();
const out = { base, startedUtc: new Date().toISOString() };
const read = (page) =>
  page.evaluate(() => {
    const clip = document.querySelector('[data-clip-id]');
    const pts = [...document.querySelectorAll('[data-testid="arrangement-clip-envelope-point"]')].map((p) => {
      const r = p.getBoundingClientRect();
      const body = p.parentElement.getBoundingClientRect();
      return { time: p.dataset.time, gain: p.dataset.gain, title: p.getAttribute('title'), depth: +((r.top + r.height / 2 - body.top) / body.height).toFixed(4) };
    });
    return {
      envelope: clip?.getAttribute('data-envelope'),
      mode: document.querySelector('[data-envelope-mode]')?.getAttribute('data-envelope-mode'),
      status: (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').trim(),
      line: document.querySelector('[data-testid="arrangement-clip-envelope-line"] polyline')?.getAttribute('points'),
      pts,
    };
  });
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = (out[`${w}x${h}`] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 120000 });
  await page.waitForTimeout(1000);
  await page.getByRole('option').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  await page.evaluate(() => document.activeElement?.blur());
  await page.getByTestId('arrangement-envelope-toggle').click();
  await page.waitForTimeout(300);
  const ed = await page.getByTestId('arrangement-clip-envelope-editor').first().boundingBox();
  r.editor = ed;
  await page.mouse.dblclick(ed.x + 20, ed.y + 5);
  await page.waitForTimeout(300);
  await page.mouse.dblclick(ed.x + 420, ed.y + 5);
  await page.waitForTimeout(300);
  r.afterAdd = await read(page);
  const last = page.getByTestId('arrangement-clip-envelope-point').last();
  const lb = await last.boundingBox();
  await page.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2);
  await page.mouse.down();
  await page.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2 + 10, { steps: 2 });
  await page.mouse.move(lb.x + lb.width / 2, lb.y + 400, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(400);
  r.afterBottom = await read(page);
  await page.mouse.dblclick(ed.x + 220, ed.y + 5);
  await page.waitForTimeout(300);
  r.afterMid = await read(page);
  const first = page.getByTestId('arrangement-clip-envelope-point').first();
  const fb = await first.boundingBox();
  const body = r.afterMid.pts.length ? null : null;
  const bodyH = await page.evaluate(() => document.querySelector('[data-testid="arrangement-clip-envelope-point"]').parentElement.getBoundingClientRect().height);
  r.bodyHeight = bodyH;
  await page.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2);
  await page.mouse.down();
  await page.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2 + bodyH / 4, { steps: 4 });
  r.duringQuarter = await read(page);
  await page.mouse.up();
  await page.waitForTimeout(300);
  r.afterQuarter = await read(page);
  await page.screenshot({ path: outPath.replace(/\.json$/, `-${w}x${h}.png`) });
  r.errors = errors;
  await ctx.close();
}
out.finishedUtc = new Date().toISOString();
writeFileSync(outPath, JSON.stringify(out, null, 1));
await browser.close();
console.log('done');
