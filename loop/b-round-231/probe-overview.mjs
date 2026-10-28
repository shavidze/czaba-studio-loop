import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] || 'http://127.0.0.1:5173';
const out = process.argv[3] || '.';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const res = {};
async function open(ctx) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
  await page.waitForFunction(() => {
    const add = [...document.querySelectorAll('button')].find((b) => /^Add/.test(b.textContent.trim()));
    return add && !add.disabled;
  }, undefined, { timeout: 90000 });
  await page.waitForTimeout(800);
  return { page, errors };
}
const measure = (page) => page.evaluate(() => {
  const t = (id) => document.querySelector(`[data-testid="${id}"]`);
  const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [+r.x.toFixed(1), +r.y.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; };
  const ov = t('arrangement-overview');
  const dock = t('arrangement-video-dock');
  const sc = t('arrangement-timeline-scroller');
  const capRow = ov?.parentElement?.firstElementChild ?? null;
  const vis = (el) => el ? getComputedStyle(el).visibility + '/' + getComputedStyle(el).display + '/' + getComputedStyle(el).opacity : null;
  const kids = dock ? [...dock.children].map((c) => ({ tag: c.tagName, testid: c.getAttribute('data-testid'), box: box(c) })) : [];
  return {
    clips: document.querySelectorAll('[data-clip-id]').length,
    dock: box(dock), dockKids: kids, overview: box(ov), overviewCls: ov?.className, frame: box(t('arrangement-overview-frame')), frameVis: vis(t('arrangement-overview-frame')),
    playhead: box(t('arrangement-overview-playhead')), capRow: box(capRow), capRowCls: capRow?.className, capText: capRow?.textContent,
    scrollerClientHeight: sc?.clientHeight, scroller: box(sc),
    scrollerTabIndex: sc?.tabIndex, ariaNow: ov?.getAttribute('aria-valuenow'), ariaMax: ov?.getAttribute('aria-valuemax'), ariaText: ov?.getAttribute('aria-valuetext'), title: ov?.title, extent: ov?.getAttribute('data-extent'),
    active: document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName,
    status: t('arrangement-status')?.textContent,
  };
});
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const { page, errors } = await open(ctx);
  const r = {};
  r.empty = await measure(page);
  await page.screenshot({ path: `${out}/S0-${vp}.png` });
  await page.locator('[data-testid="arrangement-overview"]').screenshot({ path: `${out}/ov-empty-${vp}.png` });
  // Ctrl+Alt+O at baseline, body focus
  await page.mouse.click(5, 5);
  await page.keyboard.press('Control+Alt+KeyO');
  await page.waitForTimeout(300);
  r.afterCtrlAltO = await measure(page);
  // focus overview then Ctrl+Alt+O
  await page.locator('[data-testid="arrangement-overview"]').focus();
  await page.keyboard.press('Control+Alt+KeyO');
  await page.waitForTimeout(300);
  r.afterCtrlAltOOnOverview = await measure(page);
  // simulate hidden overview: display none
  await page.evaluate(() => { document.querySelector('[data-testid="arrangement-overview"]').style.display = 'none'; });
  await page.waitForTimeout(200);
  r.simHiddenEmpty = await measure(page);
  await page.evaluate(() => { document.querySelector('[data-testid="arrangement-overview"]').style.display = ''; });
  // add one clip via Enter
  await page.mouse.click(5, 5);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  r.oneClip = await measure(page);
  await page.screenshot({ path: `${out}/S1-${vp}.png` });
  await page.locator('[data-testid="arrangement-overview"]').screenshot({ path: `${out}/ov-clip-${vp}.png` });
  await page.evaluate(() => { document.querySelector('[data-testid="arrangement-overview"]').style.display = 'none'; });
  await page.waitForTimeout(200);
  r.simHiddenClip = await measure(page);
  await page.evaluate(() => { document.querySelector('[data-testid="arrangement-overview"]').style.display = ''; });
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(500);
  r.afterUndo = await measure(page);
  // focusables near overview
  r.tabOrder = await page.evaluate(() => {
    const ov = document.querySelector('[data-testid="arrangement-overview"]');
    const all = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter((e) => e.tabIndex >= 0 && !e.disabled);
    const i = all.indexOf(ov);
    return all.slice(Math.max(0, i - 3), i + 4).map((e) => (e.getAttribute('data-testid') || e.getAttribute('aria-label') || e.tagName));
  });
  r.errors = errors;
  res[vp] = r;
  await ctx.close();
}
writeFileSync(`${out}/baseline.json`, JSON.stringify(res, null, 1));
await browser.close();
console.log('ok');
