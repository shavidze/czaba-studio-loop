import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = 'http://127.0.0.1:5173';
const OUT = path.dirname(new URL(import.meta.url).pathname);
const browser = await chromium.launch();
const results = { meta: {}, l46: {} };

const status = (page) =>
  page.evaluate(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').trim());
const overviewPresent = (page) => page.evaluate(() => document.querySelector('[data-timeline-overview]') !== null);
const active = (page) =>
  page.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return 'BODY';
    return `${a.tagName}|${a.getAttribute('aria-label') ?? (a.textContent ?? '').trim().slice(0, 40)}`;
  });
const state = (page) =>
  page.evaluate(() => {
    const loop = [...document.querySelectorAll('button')].filter((b) => b.getAttribute('aria-keyshortcuts') === 'Control+L Meta+L');
    return {
      clips: document.querySelectorAll('[data-clip-id]').length,
      loopButtons: loop.length,
      loopPressed: loop[0]?.getAttribute('aria-pressed') ?? null,
      status: (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').trim(),
    };
  });
async function open(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 90000 });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    window.__keys = [];
    window.addEventListener('keydown', (e) => window.__keys.push({ key: e.key, code: e.code, ctrl: e.ctrlKey, meta: e.metaKey, alt: e.altKey, shift: e.shiftKey, altGraph: e.getModifierState('AltGraph'), trusted: e.isTrusted }), true);
  });
  return { ctx, page, errors };
}

for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`;
  // CC-META: one fresh context per modifier
  for (const mod of ['Control', 'Meta']) {
    const { ctx, page, errors } = await open(w, h);
    const r = { steps: [] };
    const step = async (name) => {
      await page.waitForTimeout(300);
      r.steps.push({ name, ...(await state(page)) });
    };
    await step('start');
    await page.getByRole('option').first().focus();
    r.optionFocused = await active(page);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);
    await step('1-enter');
    r.activeBeforeZ = await active(page);
    await page.keyboard.press(`${mod}+KeyZ`);
    await step('2-z');
    await page.keyboard.press(`${mod}+Shift+KeyZ`);
    await step('3-shift-z');
    await page.keyboard.press(`${mod}+KeyZ`);
    await step('4-z');
    await page.keyboard.press(`${mod}+KeyY`);
    await step('5-y');
    const box = await page.locator('[data-clip-id]').first().boundingBox();
    r.clipBox = box;
    await page.mouse.click(box.x + 300, box.y + box.height / 2);
    await step('6-click');
    await page.keyboard.press(`${mod}+KeyE`);
    await step('7-e');
    const b2 = await page.locator('[data-clip-id]').first().boundingBox();
    await page.mouse.move(b2.x + 100, b2.y + b2.height / 2);
    await page.mouse.down();
    await page.mouse.move(b2.x + 400, b2.y + b2.height / 2, { steps: 8 });
    await page.mouse.up();
    await step('8-drag');
    await page.keyboard.press(`${mod}+KeyL`);
    await step('9-l');
    await page.screenshot({ path: path.join(OUT, `meta-${mod}-loop-${vp}.png`) });
    await page.keyboard.press(`${mod}+KeyL`);
    await step('10-l');
    r.keys = (await page.evaluate(() => window.__keys)).filter((k) => ['KeyZ', 'KeyY', 'KeyE', 'KeyL'].includes(k.code));
    r.errors = errors;
    results.meta[`${vp}-${mod}`] = r;
    await ctx.close();
  }

  // CC-ALTGR, CC-SR-ORDER, CC-CTRLCLICK in one fresh context
  const { ctx, page, errors } = await open(w, h);
  const r = {};
  await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
  const synth = (alt) =>
    page.evaluate((altGraph) => {
      const init = { key: 'o', code: 'KeyO', ctrlKey: true, altKey: true, bubbles: true, cancelable: true };
      if (altGraph) init.modifierAltGraph = true;
      const e = new KeyboardEvent('keydown', init);
      const notPrevented = document.body.dispatchEvent(e);
      return { notPrevented, altGraphState: e.getModifierState('AltGraph') };
    }, alt);
  r.altgr_before = { overview: await overviewPresent(page), status: await status(page) };
  r.altgr_1 = await synth(true);
  await page.waitForTimeout(400);
  r.altgr_1.overview = await overviewPresent(page);
  r.altgr_1.status = await status(page);
  r.altgr_2 = await synth(false);
  await page.waitForTimeout(400);
  r.altgr_2.overview = await overviewPresent(page);
  r.altgr_2.status = await status(page);
  await synth(false);
  await page.waitForTimeout(400);
  r.altgr_restored = await overviewPresent(page);
  await page.keyboard.press('Control+Alt+KeyO');
  await page.waitForTimeout(400);
  r.altgr_3a = { overview: await overviewPresent(page), status: await status(page) };
  await page.keyboard.press('Control+Alt+KeyO');
  await page.waitForTimeout(400);
  r.altgr_3b = { overview: await overviewPresent(page), status: await status(page) };

  // CC-SR-ORDER
  await page.locator('[data-timeline-overview]').focus();
  r.sr_before = await active(page);
  await page.keyboard.press('Control+Alt+KeyO');
  r.sr_active = await active(page);
  r.sr_ring = await page.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return null;
    const c = getComputedStyle(a);
    return { outlineStyle: c.outlineStyle, outlineWidth: c.outlineWidth, outlineOffset: c.outlineOffset, outlineColor: c.outlineColor, focusVisible: a.matches(':focus-visible') };
  });
  await page.waitForTimeout(600);
  r.sr_status = await status(page);
  r.sr_overviewPresent = await overviewPresent(page);
  r.sr_aria = await page.locator('[data-testid="arrangement-video-dock"]').ariaSnapshot().catch((e) => String(e));
  await page.screenshot({ path: path.join(OUT, `sr-order-${vp}.png`) });
  await page.keyboard.press('Control+Alt+KeyO');
  await page.waitForTimeout(400);
  r.sr_restored = await overviewPresent(page);

  // CC-CTRLCLICK
  const search = page.getByRole('searchbox', { name: 'Search the library' }).or(page.getByRole('textbox', { name: 'Search the library' })).first();
  r.cc_field = await search.evaluate((e) => `${e.tagName}|${e.type}|${e.getAttribute('aria-label') ?? e.getAttribute('placeholder')}`);
  const lane = page.locator('[data-grid-seconds]:not([data-testid])').first();
  const box = await lane.boundingBox();
  const x = box.x + Math.min(400, box.width - 20);
  const y = box.y + box.height / 2;
  r.cc_point = { x, y, laneBox: box };
  for (const mode of ['right', 'ctrl']) {
    await search.focus();
    const before = await active(page);
    if (mode === 'right') {
      await page.mouse.click(x, y, { button: 'right' });
    } else {
      await page.keyboard.down('Control');
      await page.mouse.move(x, y);
      await page.mouse.down({ button: 'left' });
      await page.mouse.up({ button: 'left' });
      await page.keyboard.up('Control');
    }
    const afterPress = await active(page);
    const nativeMenu = await page.locator('[role="menu"]').count();
    if (mode === 'ctrl') {
      await page.evaluate(({ cx, cy }) => {
        document.elementFromPoint(cx, cy)?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: cx, clientY: cy, button: 0, ctrlKey: true }));
      }, { cx: x, cy: y });
    }
    await page.waitForTimeout(400);
    const menu = await page.locator('[role="menu"]').count();
    const afterOpen = await active(page);
    await page.screenshot({ path: path.join(OUT, `ctrlclick-${mode}-menu-${vp}.png`) });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    r[`cc_${mode}`] = { before, afterPress, menuBeforeContextmenu: nativeMenu, menu, afterOpen, afterEsc: await active(page), menuAfterEsc: await page.locator('[role="menu"]').count() };
  }
  r.errors = errors;
  results.l46[vp] = r;
  await ctx.close();
}
await browser.close();
writeFileSync(path.join(OUT, 'cc.json'), JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
