import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const out = process.argv[2] ?? 'probe-meta.json';
const browser = await chromium.launch();
const results = {};
const state = (page) =>
  page.evaluate(() => {
    const loop = document.querySelector('button[aria-keyshortcuts="Control+L Meta+L"]');
    const status = document.querySelector('[data-testid="arrangement-status"]');
    return {
      clips: document.querySelectorAll('[data-clip-id]').length,
      loopPressed: loop?.getAttribute('aria-pressed') ?? null,
      loopDisabled: loop ? loop.disabled : null,
      status: status ? (status.textContent ?? '').trim() : null,
    };
  });
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  for (const mod of ['Control', 'Meta']) {
    const v = `${w}x${h}-${mod}`;
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
    await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 90000 });
    await page.waitForTimeout(1000);
    const r = { errors, steps: [] };
    const step = async (name) => {
      await page.waitForTimeout(250);
      r.steps.push({ name, ...(await state(page)) });
    };
    await step('start');
    await page.getByRole('option').first().focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
    await step('enter-adds-clip');
    await page.locator('body').click({ position: { x: 2, y: 2 } }).catch(() => {});
    await page.keyboard.press(`${mod}+KeyZ`);
    await step('undo');
    await page.keyboard.press(`${mod}+Shift+KeyZ`);
    await step('redo-shift-z');
    await page.keyboard.press(`${mod}+KeyZ`);
    await step('undo-2');
    await page.keyboard.press(`${mod}+KeyY`);
    await step('redo-y');
    const clip = page.locator('[data-clip-id]').first();
    const box = await clip.boundingBox();
    r.clipBox = box;
    r.hitMid = await page.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e ? `${e.tagName}|${e.getAttribute('data-testid')}|${e.getAttribute('aria-label')}` : null; }, { x: box.x + 300, y: box.y + box.height / 2 });
    await page.mouse.click(box.x + 300, box.y + box.height / 2);
    await step('click-clip-middle');
    await page.keyboard.press(`${mod}+KeyE`);
    await step('split');
    const b2 = await page.locator('[data-clip-id]').first().boundingBox();
    await page.mouse.move(b2.x + 100, b2.y + b2.height / 2);
    await page.mouse.down();
    await page.mouse.move(b2.x + 400, b2.y + b2.height / 2, { steps: 8 });
    await page.mouse.up();
    await step('drag-time-selection');
    await page.keyboard.press(`${mod}+KeyL`);
    await step('loop');
    await page.keyboard.press(`${mod}+KeyL`);
    await step('loop-again');
    results[v] = r;
    await ctx.close();
  }
}
await browser.close();
writeFileSync(out, JSON.stringify(results, null, 1));
for (const [v, r] of Object.entries(results)) {
  console.log(v, JSON.stringify(r.errors), r.hitMid, JSON.stringify(r.clipBox));
  for (const s of r.steps) console.log('  ', s.name, s.clips, s.loopPressed, s.loopDisabled, (s.status ?? '').slice(0, 90));
}
