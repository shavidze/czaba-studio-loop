import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const out = process.argv[2] ?? 'probe-l46.json';
const browser = await chromium.launch();
const results = {};
const status = (page) =>
  page.evaluate(() => {
    const s = document.querySelector('[data-testid="arrangement-status"]');
    return s ? (s.textContent ?? '').trim() : null;
  });
const overviewHidden = (page) =>
  page.evaluate(() => document.querySelector('[data-timeline-overview]') === null);
const active = (page) =>
  page.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return 'BODY';
    return `${a.tagName}|${a.getAttribute('aria-label') ?? (a.textContent ?? '').trim().slice(0, 40)}`;
  });
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const v = `${w}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 90000 });
  await page.waitForTimeout(1000);
  const r = { errors };
  await page.evaluate(() => {
    window.__keys = [];
    window.addEventListener(
      'keydown',
      (e) =>
        window.__keys.push({
          code: e.code,
          ctrl: e.ctrlKey,
          meta: e.metaKey,
          alt: e.altKey,
          shift: e.shiftKey,
          altGraph: e.getModifierState('AltGraph'),
          trusted: e.isTrusted,
        }),
      true,
    );
  });
  await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
  r.p1_hiddenBefore = await overviewHidden(page);
  await page.keyboard.press('Meta+Alt+KeyO');
  await page.waitForTimeout(300);
  r.p1_metaAltO = { hidden: await overviewHidden(page), status: await status(page) };
  await page.keyboard.press('Meta+Alt+KeyO');
  await page.waitForTimeout(300);
  r.p1_metaAltO_back = { hidden: await overviewHidden(page), status: await status(page) };
  await page.keyboard.press('Meta+KeyZ');
  r.p1_keys = await page.evaluate(() => window.__keys.slice());
  const synth = (alt) =>
    page.evaluate((altGraph) => {
      const e = new KeyboardEvent('keydown', {
        key: 'o',
        code: 'KeyO',
        ctrlKey: true,
        altKey: true,
        modifierAltGraph: altGraph,
        bubbles: true,
        cancelable: true,
      });
      const notPrevented = document.body.dispatchEvent(e);
      return { notPrevented, altGraphState: e.getModifierState('AltGraph') };
    }, alt);
  r.p2_altGraph = { dispatch: await synth(true) };
  await page.waitForTimeout(300);
  r.p2_altGraph.hidden = await overviewHidden(page);
  r.p2_control = { dispatch: await synth(false) };
  await page.waitForTimeout(300);
  r.p2_control.hidden = await overviewHidden(page);
  r.p2_control.status = await status(page);
  await synth(false);
  await page.waitForTimeout(300);
  r.p2_restored = await overviewHidden(page);
  await page.locator('[data-timeline-overview]').focus();
  r.p3_before = await active(page);
  await page.keyboard.press('Control+Alt+KeyO');
  r.p3_activeAfter = await active(page);
  r.p3_ring = await page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; const c = getComputedStyle(a); return { outlineStyle: c.outlineStyle, outlineWidth: c.outlineWidth, outlineOffset: c.outlineOffset, outlineColor: c.outlineColor, focusVisible: a.matches(':focus-visible') }; });
  await page.waitForTimeout(600);
  r.p3_status = await status(page);
  r.p3_aria = await page.locator('[data-testid="arrangement-video-dock"]').ariaSnapshot().catch((e) => String(e));
  await page.keyboard.press('Control+Alt+KeyO');
  await page.waitForTimeout(300);
  r.p3_restored = await overviewHidden(page);
  const shortcuts = page.getByRole('button', { name: /Keyboard shortcuts/ }).first();
  const lane = page.locator('[data-grid-seconds]:not([data-testid])').first();
  const box = await lane.boundingBox();
  const x = box.x + Math.min(400, box.width - 20);
  const y = box.y + box.height / 2;
  await shortcuts.focus();
  r.p4_rightBefore = await active(page);
  await page.mouse.click(x, y, { button: 'right' });
  await page.waitForTimeout(300);
  r.p4_rightMenu = await page.locator('[role="menu"]').count();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  r.p4_rightAfterEsc = await active(page);
  await shortcuts.focus();
  r.p4_ctrlBefore = await active(page);
  await page.keyboard.down('Control');
  await page.mouse.move(x, y);
  await page.mouse.down({ button: 'left' });
  r.p4_ctrlAfterDown = await active(page);
  await page.mouse.up({ button: 'left' });
  await page.keyboard.up('Control');
  r.p4_ctrlMenuNative = await page.locator('[role="menu"]').count();
  await page.evaluate(
    ({ x: cx, y: cy }) => {
      const el = document.elementFromPoint(cx, cy);
      el?.dispatchEvent(
        new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          clientX: cx,
          clientY: cy,
          button: 0,
          ctrlKey: true,
        }),
      );
    },
    { x, y },
  );
  await page.waitForTimeout(300);
  r.p4_ctrlMenu = await page.locator('[role="menu"]').count();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  r.p4_ctrlAfterEsc = await active(page);
  const search = page.locator('input[type="search"], input[type="text"]').first();
  r.p5_field = await search.evaluate((e) => `${e.type}|${e.getAttribute('aria-label') ?? e.getAttribute('placeholder')}`);
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
    const afterDown = await active(page);
    if (mode === 'ctrl') {
      await page.evaluate(({ x: cx, y: cy }) => {
        document.elementFromPoint(cx, cy)?.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: cx, clientY: cy, button: 0, ctrlKey: true }));
      }, { x, y });
    }
    await page.waitForTimeout(300);
    const menu = await page.locator('[role="menu"]').count();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    r[`p5_${mode}`] = { before, afterDown, menu, afterEsc: await active(page) };
  }
  results[v] = r;
  await ctx.close();
}
await browser.close();
writeFileSync(out, JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
