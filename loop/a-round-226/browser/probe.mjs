import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-226/browser';
const url = 'http://127.0.0.1:5173/studio-lab';
const result = { url, date: new Date().toISOString(), viewports: {} };
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const key = `${w}x${h}`;
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
  await page.waitForTimeout(1500);
  const measure = () => page.evaluate(() => {
    const footer = document.querySelector('[data-testid="arrangement-status"]')?.closest('footer');
    const btn = document.querySelector('button[aria-label="Keyboard shortcuts (?)"]');
    const row = btn?.parentElement;
    const scroller = document.querySelector('[data-testid="arrangement-timeline-scroller"]');
    const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
    return {
      footer: r(footer), row: r(row), button: r(btn), kbd: r(btn?.querySelector('kbd')),
      hint: !!document.querySelector('[data-testid="arrangement-shortcut-hint"]'),
      scrollerClientHeight: scroller?.clientHeight ?? null,
      footerText: footer?.innerText ?? null,
    };
  });
  const contrast = (sel, hover) => page.evaluate(([sel]) => {
    const parse = (c) => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m[3] ?? 1 }; };
    const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const el = document.querySelector(sel);
    if (!el) return null;
    const fg = parse(getComputedStyle(el).color);
    let node = el; let bg = null;
    while (node && node instanceof Element) { const c = parse(getComputedStyle(node).backgroundColor); if (c.a > 0.99) { bg = c; break; } node = node.parentElement; }
    if (!bg) bg = { r: 0, g: 0, b: 0, a: 1 };
    const L1 = lum(fg), L2 = lum(bg);
    return { color: getComputedStyle(el).color, bg: `rgb(${bg.r},${bg.g},${bg.b})`, ratio: +((Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)).toFixed(2), fontSize: getComputedStyle(el).fontSize };
  }, [sel]);
  const v = { errors };
  v.S0 = await measure();
  await page.screenshot({ path: `${out}/after-S0-${key}.png` });
  v.footerContrast = { rest: await contrast('button[aria-label="Keyboard shortcuts (?)"]'), restKbd: await contrast('button[aria-label="Keyboard shortcuts (?)"] kbd') };
  await page.hover('button[aria-label="Keyboard shortcuts (?)"]');
  await page.waitForTimeout(300);
  v.footerContrast.hover = await contrast('button[aria-label="Keyboard shortcuts (?)"]');
  v.footerContrast.hoverKbd = await contrast('button[aria-label="Keyboard shortcuts (?)"] kbd');
  await page.mouse.move(5, h - 200);

  await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => undefined);
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.keyboard.press('Shift+Slash');
  await page.waitForTimeout(500);
  const dialog = page.getByRole('dialog', { name: 'Keyboard shortcuts' });
  v.openFromBody = { open: await dialog.count(), activeIsSearch: await page.evaluate(() => document.activeElement?.getAttribute('aria-label')) };
  await page.screenshot({ path: `${out}/sheet-open-${key}.png` });
  v.sheetContrast = {
    subline: await contrast('[role="dialog"] h2 + p'),
    action: await contrast('[role="dialog"] li span'),
    chip: await contrast('[role="dialog"] li kbd'),
    heading: await contrast('[role="dialog"] h3'),
  };
  v.minFont = await page.evaluate(() => Math.min(...Array.from(document.querySelectorAll('[role="dialog"] *')).filter((e) => e.childNodes.length && Array.from(e.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim())).map((e) => parseFloat(getComputedStyle(e).fontSize))));
  v.fitRow = await page.evaluate(() => {
    const li = document.querySelector('[data-shortcut-id="fit"]');
    const kbds = Array.from(li.querySelectorAll('kbd')).map((k) => ({ sw: k.scrollWidth, cw: k.clientWidth, h: k.getBoundingClientRect().height }));
    const box = document.querySelector('[role="dialog"] > div');
    return { kbds, liH: li.getBoundingClientRect().height, sheetScrollW: box.scrollWidth, sheetClientW: box.clientWidth, sheetScrollH: box.scrollHeight, sheetClientH: box.clientHeight };
  });
  const cdp = await context.newCDPSession(page);
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '[role="dialog"] h2 + p' });
  v.sublineFonts = await cdp.send('CSS.enable').then(() => cdp.send('CSS.getPlatformFontsForNode', { nodeId }));
  v.sublineText = await page.locator('[role="dialog"] h2 + p').innerText();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  v.escClose = { open: await dialog.count(), active: await page.evaluate(() => document.activeElement?.getAttribute('aria-label')) };
  await page.keyboard.press('Shift+Slash');
  await page.waitForTimeout(400);
  await page.keyboard.press('Tab');
  v.tabToClose = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  v.closeFocusVisible = await page.evaluate(() => { const a = document.activeElement; const s = getComputedStyle(a); return { fv: a.matches(':focus-visible'), outline: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor }; });
  await page.keyboard.press('Space');
  await page.waitForTimeout(400);
  v.spaceOnClose = { open: await dialog.count(), playing: await page.locator('[data-testid="arrangement-status"]').innerText() };
  await page.keyboard.press('Shift+Slash');
  await page.waitForTimeout(300);
  await page.mouse.click(10, 10);
  await page.waitForTimeout(300);
  v.backdrop = { open: await dialog.count(), active: await page.evaluate(() => document.activeElement?.getAttribute('aria-label')) };
  await page.click('button[aria-label="Keyboard shortcuts (?)"]');
  await page.waitForTimeout(300);
  v.clickOpen = await dialog.count();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  v.pointerPressRing = await page.evaluate(() => { const a = document.activeElement; return { label: a?.getAttribute('aria-label'), fv: a?.matches(':focus-visible') }; });
  const lib = page.getByRole('searchbox', { name: 'Search the library' });
  await lib.focus();
  await page.keyboard.press('Shift+Slash');
  await page.waitForTimeout(300);
  v.libraryTyped = { value: await lib.inputValue(), open: await dialog.count() };
  await lib.fill('');
  await page.keyboard.press('Escape');
  const add = page.getByRole('button', { name: /^Add/ }).first();
  if (await add.count()) { await add.click(); await page.waitForTimeout(800); }
  v.S1 = await measure();
  await page.screenshot({ path: `${out}/after-S1-${key}.png` });
  const clip = page.locator('[data-clip-id]').first();
  const video = page.locator('[data-track-id]').first();
  const cb = await clip.boundingBox(); const vb = await video.boundingBox();
  if (cb && vb) {
    await page.mouse.move(cb.x + 20, cb.y + 6);
    await page.mouse.down();
    await page.mouse.move(cb.x + 40, cb.y + 30, { steps: 4 });
    await page.mouse.move(cb.x + 40, vb.y + vb.height / 2, { steps: 6 });
    await page.waitForTimeout(300);
    v.drag = await page.evaluate(() => {
      const hint = document.querySelector('[data-testid="arrangement-lane-move-hint"]');
      const r = hint?.getBoundingClientRect();
      const footer = document.querySelector('[data-testid="arrangement-status"]')?.closest('footer');
      return { hint: hint?.innerText ?? null, hintH: r?.height ?? null, sw: hint?.scrollWidth, cw: hint?.clientWidth, selectedClip: !!document.querySelector('[data-testid="arrangement-selected-clip"]'), footerH: footer?.getBoundingClientRect().height };
    });
    await page.screenshot({ path: `${out}/drag-${key}.png` });
    await page.keyboard.press('Escape');
    await page.mouse.up();
  }
  result.viewports[key] = v;
  await context.close();
}
await browser.close();
writeFileSync(`${out}/probe-after.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
