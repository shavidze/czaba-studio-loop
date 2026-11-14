// Round 516 (NONBRAND N4) probe: Home special-offer links + LeadMagnet Close.
// Usage: node n4-probe.mjs <baseUrl> <outDir>
// Per width (1440x900, 1280x720, 375x812): the two special-offer links (box, parent width, radius, weight, colours, href, text,
// hover and keyboard-focus outline), then the LeadMagnet popup opened by exit intent (scroll 55 %, document mouseleave):
// Close box, centre distance to the top/right viewport edges, glyph box, colours, contrast vs the dialog background,
// title, focus on open, keyboard focus outline, hover, overlap with the CZABA wordmark, horizontal overflow, click closes.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2];
const out = path.resolve(process.argv[3]);
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SIZES = [[1440, 900], [1280, 720], [375, 812]];
const res = { base, widths: {}, errors: [] };

function lum(c) {
  const m = c.match(/[\d.]+/g).map(Number);
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]);
}
const ratio = (a, b) => { const x = lum(a), y = lum(b); return +(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2)); };
const r1 = (v) => +v.toFixed(1);

const READ_LINK = (name) => {
  const a = [...document.querySelectorAll('a')].find((x) => x.textContent.trim() === name);
  if (!a) return { missing: name };
  const cs = getComputedStyle(a);
  const r = a.getBoundingClientRect();
  const p = a.parentElement.getBoundingClientRect();
  return { href: a.getAttribute('href'), text: a.textContent.trim(), box: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(1)), parentW: +p.width.toFixed(1),
    radius: cs.borderTopLeftRadius, weight: cs.fontWeight, size: cs.fontSize, bg: cs.backgroundColor, color: cs.color, border: cs.borderTopColor,
    pad: cs.padding, fv: a.matches(':focus-visible'), os: cs.outlineStyle, ow: cs.outlineWidth, oc: cs.outlineColor, oo: cs.outlineOffset, lines: Math.round(r.height / parseFloat(cs.lineHeight || '24')) };
};
const READ_CLOSE = () => {
  const d = document.querySelector('[role="dialog"]');
  if (!d) return { missing: 'dialog' };
  const b = [...d.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === 'Close');
  if (!b) return { missing: 'Close' };
  const cs = getComputedStyle(b);
  const r = b.getBoundingClientRect();
  const g = b.querySelector('svg').getBoundingClientRect();
  const word = [...d.querySelectorAll('span')].find((s) => s.textContent.trim() === 'CZABA');
  const w = word ? word.getBoundingClientRect() : null;
  const overlap = !!w && !(r.right <= w.left || w.right <= r.left || r.bottom <= w.top || w.bottom <= r.top);
  const a = document.activeElement;
  return { tag: b.tagName, type: b.getAttribute('type'), title: b.getAttribute('title'), box: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(1)),
    centreFromTop: +(r.y + r.height / 2).toFixed(1), centreFromRight: +(innerWidth - (r.x + r.width / 2)).toFixed(1),
    glyph: [g.width, g.height].map((v) => +v.toFixed(1)), glyphCentreFromTop: +(g.y + g.height / 2).toFixed(1), glyphCentreFromRight: +(innerWidth - (g.x + g.width / 2)).toFixed(1),
    color: cs.color, bg: cs.backgroundColor, dialogBg: getComputedStyle(d).backgroundColor, radius: cs.borderTopLeftRadius, transform: cs.transform,
    isActive: a === b, fv: b.matches(':focus-visible'), os: cs.outlineStyle, ow: cs.outlineWidth, oc: cs.outlineColor, oo: cs.outlineOffset,
    wordmarkOverlap: overlap, hScroll: document.documentElement.scrollWidth > innerWidth };
};

const browser = await chromium.launch();
for (const [w, h] of SIZES) {
  const row = {};
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 640, isMobile: w < 640 });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
  const page = await ctx.newPage();
  await page.route(/googletagmanager\.com|google-analytics\.com/, (r) => r.abort());
  page.on('pageerror', (e) => res.errors.push(`${w}: ${String(e).slice(0, 200)}`));
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 });
  await sleep(2500);
  const gift = page.getByRole('link', { name: 'Browse Gift Cards', exact: true });
  await gift.scrollIntoViewIfNeeded();
  await sleep(1500);
  row.gift = await page.evaluate(READ_LINK, 'Browse Gift Cards');
  row.collection = await page.evaluate(READ_LINK, 'View Collection');
  await gift.hover();
  await sleep(300);
  row.giftHover = await page.evaluate(READ_LINK, 'Browse Gift Cards');
  await gift.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await sleep(300);
  row.giftKeyboard = await page.evaluate(READ_LINK, 'Browse Gift Cards');
  const sec = await gift.evaluateHandle((a) => a.closest('section'));
  await sec.asElement().screenshot({ path: path.join(out, `offers-${w}.png`) });
  // LeadMagnet: exit intent after a 55 % scroll
  await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.55));
  await sleep(1500);
  await page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0, clientX: 10 })));
  let opened = false;
  for (let i = 0; i < 20 && !opened; i++) { await sleep(500); opened = await page.evaluate(() => !!document.querySelector('[role="dialog"]')); }
  if (!opened) {
    for (let i = 0; i < 22 && !opened; i++) { await sleep(500); opened = await page.evaluate(() => !!document.querySelector('[role="dialog"]')); }
  }
  row.popupOpened = opened;
  if (opened) {
    await sleep(800);
    row.closeOnOpen = await page.evaluate(READ_CLOSE);
    row.closeContrast = row.closeOnOpen.color ? ratio(row.closeOnOpen.color, row.closeOnOpen.dialogBg) : null;
    await page.screenshot({ path: path.join(out, `popup-${w}.png`) });
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await sleep(300);
    row.closeKeyboard = await page.evaluate(READ_CLOSE);
    const box = row.closeOnOpen.box;
    await page.mouse.move(box[0] + box[2] / 2, box[1] + box[3] / 2);
    await sleep(400);
    row.closeHover = await page.evaluate(READ_CLOSE);
    row.closeHoverContrast = ratio(row.closeHover.color, row.closeHover.bg === 'rgba(0, 0, 0, 0)' ? row.closeHover.dialogBg : row.closeHover.bg);
    await page.screenshot({ path: path.join(out, `popup-close-hover-${w}.png`), clip: { x: Math.max(0, box[0] - 40), y: 0, width: Math.min(w - Math.max(0, box[0] - 40), 140), height: 120 } });
    await page.mouse.down();
    await sleep(80);
    row.closePressed = await page.evaluate(READ_CLOSE);
    await page.mouse.up();
    await sleep(600);
    row.closedAfterClick = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
    row.afterCloseActive = await page.evaluate(() => { const a = document.activeElement; return a ? { tag: a.tagName, name: (a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 30), fv: a.matches(':focus-visible') } : null; });
    row.afterCloseScrollY = await page.evaluate(() => Math.round(scrollY));
  }
  res.widths[w] = row;
  await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(out, 'n4.json'), JSON.stringify(res, null, 1));
for (const [w, r] of Object.entries(res.widths)) {
  console.log(w, 'gift', r.gift?.box, r.gift?.radius, r.gift?.weight, 'parentW', r.gift?.parentW, '| popup', r.popupOpened,
    r.closeOnOpen ? ['box', r.closeOnOpen.box, 'c', r.closeOnOpen.centreFromTop, r.closeOnOpen.centreFromRight, 'glyphC', r.closeOnOpen.glyphCentreFromTop, r.closeOnOpen.glyphCentreFromRight, 'active', r.closeOnOpen.isActive, 'contrast', r.closeContrast, 'kbd', r.closeKeyboard?.fv, r.closeKeyboard?.ow, 'closed', r.closedAfterClick].join(' ') : '');
}
console.log('errors', res.errors.length);
