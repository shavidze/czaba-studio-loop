// B round 433 -> 434 (SABA-B-12 stage 3b): Studio dialog scrollbars in real Chromium with visible scrollbars.
// usage: node scrollbar-probe.mjs <base> <outdir> [exp]
//   exp = none (as served) | studio (in-page experiment: scroller gets STUDIO_SCROLLBAR_CLASS tokens + inline scrollbar-color/width auto)
//         | studio-only-classes (classes added, standard properties left as served)
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? 'head';
const exp = process.argv[4] ?? 'none';
fs.mkdirSync(out, { recursive: true });
const STUDIO = fs.readFileSync('/home/runner/czaba-project/store/app/components/arrangement/studio-scrollbar.ts', 'utf8')
  .match(/'([^']+)'/g).map((s) => s.slice(1, -1)).filter((s) => !/\s/.test(s));
const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
const results = { exp, chromium: browser.version() };

async function pixels(page, clip) {
  const buf = await page.screenshot({ clip });
  return page.evaluate(async (b64) => {
    const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
    const c = new OffscreenCanvas(img.width, img.height);
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, img.width, img.height).data;
    let teal = 0; let warmThumb = 0; let maxLum = 0; let bright = 0;
    for (let i = 0; i < d.length; i += 4) {
      const [r, gg, b] = [d[i], d[i + 1], d[i + 2]];
      if (gg - r > 30 && b - r > 30 && Math.abs(gg - b) < 60) teal++;
      if (r > 110 && r >= gg && gg >= b && r - b < 40) warmThumb++;
      if (r > 200 && gg > 200 && b > 200) bright++;
      maxLum = Math.max(maxLum, r + gg + b);
    }
    return { w: img.width, h: img.height, teal, warmThumb, bright, maxLum };
  }, buf.toString('base64'));
}

async function scroller(page, sel) {
  return page.evaluate(({ sel, exp, STUDIO }) => {
    const start = document.querySelector(sel);
    let n = start;
    while (n && !(n.scrollHeight > n.clientHeight && ['auto', 'scroll'].includes(getComputedStyle(n).overflowY))) n = n.parentElement;
    const dlgPanel = start.closest('[role="dialog"]')?.firstElementChild ?? null;
    const t = n ?? dlgPanel;
    if (!t) return null;
    if (exp === 'studio' || exp === 'studio-only-classes') {
      t.classList.add(...STUDIO);
      if (exp === 'studio') { t.style.scrollbarColor = 'auto'; t.style.scrollbarWidth = 'auto'; }
    }
    t.setAttribute('data-b434-scroller', '1');
    const cs = getComputedStyle(t);
    const r = t.getBoundingClientRect();
    return { overflows: !!n, cls: t.className, scrollHeight: t.scrollHeight, clientHeight: t.clientHeight, offsetWidth: t.offsetWidth, clientWidth: t.clientWidth,
      barWidth: t.offsetWidth - t.clientWidth - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth),
      scrollbarColor: cs.scrollbarColor, scrollbarWidth: cs.scrollbarWidth, scrollbarGutter: cs.scrollbarGutter,
      box: { x: r.x, y: r.y, w: r.width, h: r.height } };
  }, { sel, exp, STUDIO });
}

for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const key = `${w}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForSelector('[data-testid="arrangement-library"]', { timeout: 180000 });
  await page.waitForTimeout(800);
  const r = {};
  // studio scroller reference (library list) - the target look
  r.libraryRef = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[data-testid="arrangement-library"] *')].find((n) => n.scrollHeight > n.clientHeight && getComputedStyle(n).overflowY === 'auto');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { scrollbarColor: cs.scrollbarColor, scrollbarWidth: cs.scrollbarWidth, barWidth: el.offsetWidth - el.clientWidth };
  });
  // --- shortcut sheet
  await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
  await page.keyboard.press('Shift+Slash');
  const search = page.getByRole('searchbox', { name: 'Search shortcuts' });
  await search.waitFor({ timeout: 10000 });
  await page.waitForTimeout(300);
  r.sheet = await scroller(page, '[role="dialog"] input[type="search"]');
  r.sheetInputBox = await search.boundingBox();
  await page.waitForTimeout(200);
  const b = r.sheet.box;
  const strip = { x: b.x + b.w - 14, y: b.y + 4, width: 13, height: Math.min(b.h - 8, 300) };
  r.sheetStrip = await pixels(page, strip);
  await page.screenshot({ path: `${out}/${key}-sheet-full.png` });
  await page.screenshot({ path: `${out}/${key}-sheet-edge.png`, clip: { x: b.x + b.w - 60, y: b.y, width: 60, height: Math.min(b.h, 400) } });
  // hover thumb
  await page.mouse.move(b.x + b.w - 5, b.y + 30);
  await page.waitForTimeout(200);
  r.sheetStripHover = await pixels(page, strip);
  // two-column wrap neighbour: number of distinct column x positions of group headings
  r.sheetColumns = await page.evaluate(() => {
    const hs = [...document.querySelectorAll('[role="dialog"] h3')];
    return { headings: hs.length, xs: [...new Set(hs.map((x) => Math.round(x.getBoundingClientRect().x)))] };
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  // --- export dialog (add one clip so Export is enabled)
  await page.getByRole('option').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  await page.evaluate(() => document.activeElement?.blur());
  await page.getByRole('button', { name: 'Export', exact: true }).first().click();
  await page.getByRole('dialog').waitFor();
  await page.waitForTimeout(400);
  r.exportDialog = await scroller(page, '[role="dialog"] h2');
  await page.screenshot({ path: `${out}/${key}-export-full.png` });
  {
    const eb = r.exportDialog.box;
    const estrip = { x: eb.x + eb.w - 14, y: eb.y + 4, width: 13, height: Math.min(eb.h - 8, 300) };
    r.exportStrip = await pixels(page, estrip);
    await page.screenshot({ path: `${out}/${key}-export-edge.png`, clip: { x: eb.x + eb.w - 60, y: eb.y, width: 60, height: Math.min(eb.h, 400) } });
    r.exportFocusInDialog = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
  }
  r.errors = errors;
  results[key] = r;
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/scrollbar.json`, JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
