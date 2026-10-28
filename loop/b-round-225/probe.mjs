import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';

const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = '/home/runner/czaba-project/tmp/studio-real-loop/b-round-225';
const url = 'http://127.0.0.1:5173/studio-lab';
const result = { url, date: new Date().toISOString(), viewports: {} };

const browser = await chromium.launch();
for (const [w, h] of [
  [1440, 900],
  [1280, 720],
]) {
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
  await page.waitForTimeout(1500);
  const key = `${w}x${h}`;
  const measure = () =>
    page.evaluate(() => {
      const box = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      };
      const footer = document.querySelector('[data-testid="arrangement-status"]')?.closest('footer');
      const fr = footer?.getBoundingClientRect();
      const scroller = document.querySelector('[data-testid="arrangement-timeline-scroller"]');
      return {
        footer: fr ? { y: fr.y, h: fr.height } : null,
        shortcutHint: box('[data-testid="arrangement-shortcut-hint"]'),
        status: box('[data-testid="arrangement-status"]'),
        reserve: box('[data-testid="arrangement-selected-clip-reserve"]'),
        scrollerClientHeight: scroller?.clientHeight ?? null,
        footerText: footer ? footer.innerText : null,
      };
    });
  const v = { empty: await measure(), errors };
  await page.screenshot({ path: `${out}/before-empty-${key}.png` });

  const volume = page.locator('input[aria-label^="Volume — "]').first();
  const readValue = () => volume.evaluate((el) => Number(el.value));
  await volume.focus();
  const v0 = await readValue();
  await page.keyboard.press('PageDown');
  await page.waitForTimeout(200);
  const v1 = await readValue();
  await page.keyboard.press('PageUp');
  await page.waitForTimeout(200);
  const v2 = await readValue();
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);
  const v3 = await readValue();
  v.fader = {
    label: await volume.getAttribute('aria-label'),
    step: await volume.getAttribute('step'),
    min: await volume.getAttribute('min'),
    max: await volume.getAttribute('max'),
    start: v0,
    afterPageDown: v1,
    afterPageUp: v2,
    afterArrowDown: v3,
  };
  await page.keyboard.press('ArrowUp');

  const scroller = page.locator('[data-testid="arrangement-timeline-scroller"]');
  const sb = await scroller.boundingBox();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2);
  const s0 = await scroller.evaluate((el) => el.scrollLeft);
  await page.keyboard.down('Shift');
  await page.mouse.wheel(0, 400);
  await page.keyboard.up('Shift');
  await page.waitForTimeout(400);
  const s1 = await scroller.evaluate((el) => el.scrollLeft);
  v.shiftWheel = { before: s0, after: s1 };

  await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => undefined);
  await page.keyboard.press('Shift+Slash');
  await page.waitForTimeout(300);
  v.questionBefore = {
    dialogs: await page.locator('[role="dialog"]').count(),
    status: await page.locator('[data-testid="arrangement-status"]').innerText(),
  };

  const add = page.getByRole('button', { name: /^Add/ }).first();
  if (await add.count()) {
    await add.click();
    await page.waitForTimeout(800);
  }
  v.demo = await measure();
  await page.screenshot({ path: `${out}/before-demo-${key}.png` });
  result.viewports[key] = v;
  await context.close();
}
await browser.close();
writeFileSync(`${out}/probe-before.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
