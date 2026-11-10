// PERF-14b sketch probe (B round 398->399 planning).
// Usage: node frames200.cjs <baseURL> <out.json> [viewport WxH]
// Builds 200 clips (Add, name-bar click, Ctrl+D x199 waited on the lane data-clip-count), then samples a
// visible-gap check on EVERY animation frame while: 10 zoom keys (5 '-', 5 '='), 40 '-' to minimum zoom,
// scroll to the middle, 4 page steps. Then: Ctrl+A (select all) mounted count; a held name-bar press on a
// mounted clip while the timeline scrolls 2 pages (gesture pin), release, one more page; page errors.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const [base, out, vp = '1440x900'] = process.argv.slice(2);
const [w, h] = vp.split('x').map(Number);
const audio = '[data-clip-kind="audio"]';

function gapFn() {
  const ruler = document.querySelector('[data-testid="arrangement-ruler"]');
  let scroller = ruler?.parentElement ?? null;
  while (scroller && !(scroller.scrollWidth > scroller.clientWidth && ['auto', 'scroll'].includes(getComputedStyle(scroller).overflowX))) scroller = scroller.parentElement;
  if (!scroller) return 'no scroller';
  const box = scroller.getBoundingClientRect();
  const headerWidth = document.querySelector('[data-testid="arrangement-track-header"]')?.getBoundingClientRect().width ?? 0;
  const laneLeft = box.left + headerWidth;
  const clips = [...document.querySelectorAll('[data-clip-kind="audio"]')];
  const placed = clips.map((c) => { const r = c.getBoundingClientRect(); return { r, start: Number(c.dataset.clipStart) }; }).sort((a, b) => a.start - b.start);
  const count = Math.max(0, ...[...document.querySelectorAll('[data-track-id][data-clip-count]')].map((l) => Number(l.getAttribute('data-clip-count'))));
  if (count === 0) return null;
  const first = placed[0];
  const second = placed.find((c) => first && c.start > first.start);
  const pps = first && second ? (second.r.left - first.r.left) / (second.start - first.start) : null;
  const endX = first && pps ? first.r.left - first.start * pps + count * first.r.width : null;
  const right = endX === null ? box.right : Math.min(box.right, endX);
  const vis = placed.filter(({ r }) => r.width > 0 && r.right > laneLeft && r.left < box.right && r.bottom > box.top && r.top < box.bottom).sort((a, b) => a.r.left - b.r.left);
  if (vis.length === 0) return `none ${Math.round(laneLeft)}-${Math.round(right)}`;
  if (vis[0].r.left > laneLeft + 1 && vis[0].start > 0) return `left ${Math.round(vis[0].r.left)}`;
  if (vis[vis.length - 1].r.right < right - 1) return `right ${Math.round(vis[vis.length - 1].r.right)}<${Math.round(right)}`;
  for (let i = 1; i < vis.length; i += 1) if (vis[i].r.left - vis[i - 1].r.right > 1) return `hole ${vis[i - 1].start}-${vis[i].start}`;
  return null;
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  await context.addInitScript(`window.__gapFn = ${gapFn.toString()};`);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 180000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /Demo collection ready/ }).waitFor({ timeout: 120000 });
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator(audio).first().waitFor();
  const bar = page.locator(audio).first().getByTitle(/ — drag to move$/).first();
  const b = await bar.boundingBox();
  await page.mouse.click(b.x + Math.min(20, b.width / 2), b.y + b.height / 2);
  await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));
  for (let n = 1; n < 200; n += 1) {
    await page.keyboard.press('Control+d');
    await page.waitForFunction((want) => Math.max(...[...document.querySelectorAll('[data-track-id][data-clip-count]')].map((l) => Number(l.getAttribute('data-clip-count')))) >= want, n + 1, { timeout: 30000 });
  }
  await page.waitForFunction(() => Math.max(...[...document.querySelectorAll('[data-track-id][data-clip-count]')].map((l) => Number(l.getAttribute('data-clip-count')))) === 200, null, { timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    window.__frames = { n: 0, gaps: [] };
    const tick = () => { window.__frames.n += 1; const g = window.__gapFn(); if (g) window.__frames.gaps.push(g); window.__frameId = requestAnimationFrame(tick); };
    window.__frameId = requestAnimationFrame(tick);
  });
  const result = { base, viewport: vp };
  const keys = [...Array(5).fill('-'), ...Array(5).fill('=')];
  for (const key of keys) { await page.keyboard.press(key); await page.waitForTimeout(250); }
  for (let i = 0; i < 40; i += 1) { await page.keyboard.press('-'); await page.waitForTimeout(60); }
  await page.waitForTimeout(800);
  const scrollBy = (mode) => page.evaluate((m) => {
    let s = document.querySelector('[data-testid="arrangement-ruler"]')?.parentElement ?? null;
    while (s && !(s.scrollWidth > s.clientWidth && ['auto', 'scroll'].includes(getComputedStyle(s).overflowX))) s = s.parentElement;
    s.scrollLeft = m === 'middle' ? Math.round((s.scrollWidth - s.clientWidth) / 2) : s.scrollLeft + s.clientWidth;
    return s.scrollLeft;
  }, mode);
  result.scrolls = [await scrollBy('middle')];
  await page.waitForTimeout(400);
  for (let i = 0; i < 4; i += 1) { result.scrolls.push(await scrollBy('page')); await page.waitForTimeout(300); }
  result.frames = await page.evaluate(() => { cancelAnimationFrame(window.__frameId); return { n: window.__frames.n, gapFrames: window.__frames.gaps.length, firstGaps: window.__frames.gaps.slice(0, 5) }; });
  result.afterScroll = await page.evaluate(() => ({ mounted: document.querySelectorAll('[data-clip-kind="audio"]').length, page: document.querySelectorAll('*').length, gap: window.__gapFn() }));
  await scrollBy('middle');
  await page.waitForTimeout(400);
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(600);
  result.selectAll = await page.evaluate(() => ({ mounted: document.querySelectorAll('[data-clip-kind="audio"]').length, selectedMounted: document.querySelectorAll('[data-clip-kind="audio"][data-selected="true"], [data-clip-kind="audio"][aria-selected="true"]').length, page: document.querySelectorAll('*').length }));
  await page.mouse.click(5, h - 5).catch(() => {});
  await page.keyboard.press('Escape');
  const id = await page.evaluate(() => {
    const ruler = document.querySelector('[data-testid="arrangement-ruler"]');
    let s = ruler?.parentElement ?? null;
    while (s && !(s.scrollWidth > s.clientWidth && ['auto', 'scroll'].includes(getComputedStyle(s).overflowX))) s = s.parentElement;
    const box = s.getBoundingClientRect();
    const laneLeft = box.left + (document.querySelector('[data-testid="arrangement-track-header"]')?.getBoundingClientRect().width ?? 0);
    const pick = [...document.querySelectorAll('[data-clip-kind="audio"]')].find((c) => { const r = c.getBoundingClientRect(); return r.left > laneLeft + 10 && r.left + 30 < box.right; });
    return pick?.getAttribute('data-clip-id') ?? null;
  });
  result.heldClipId = id;
  const target = page.locator('[data-clip-id="' + id + '"]');
  const tb = await target.getByTitle(/ — drag to move$/).first().boundingBox();
  await page.mouse.move(tb.x + 10, tb.y + tb.height / 2);
  await page.mouse.down();
  await page.mouse.move(tb.x + 14, tb.y + tb.height / 2, { steps: 2 });
  await page.waitForTimeout(150);
  result.heldStatus = await page.getByTestId('arrangement-status').textContent();
  result.scrollsHeld = [await scrollBy('page'), await scrollBy('page')];
  await page.waitForTimeout(500);
  result.heldMounted = await page.evaluate((i) => document.querySelectorAll(`[data-clip-id="${i}"]`).length, id);
  await page.mouse.up();
  await page.waitForTimeout(400);
  result.afterReleaseMounted = await page.evaluate((i) => document.querySelectorAll(`[data-clip-id="${i}"]`).length, id);
  await scrollBy('page');
  await page.waitForTimeout(400);
  result.afterNextPageMounted = await page.evaluate((i) => document.querySelectorAll(`[data-clip-id="${i}"]`).length, id);
  result.statusAfterHeld = await page.getByTestId('arrangement-status').textContent();
  result.modelAfter = await page.evaluate(() => Math.max(...[...document.querySelectorAll('[data-track-id][data-clip-count]')].map((l) => Number(l.getAttribute('data-clip-count')))));
  result.pageErrors = errors;
  await page.screenshot({ path: out.replace(/\.json$/, '.png') });
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  console.log(JSON.stringify(result));
  await browser.close();
})();
