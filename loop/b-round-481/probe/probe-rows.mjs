// B round 474: sketch-side probe for round-475 rows C7-C11. usage: node probe-rows.mjs <base> <tag>
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.argv[2]; const tag = process.argv[3];
const b = await chromium.launch(); const res = {};
const init = () => { try { localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} };
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const o = {}; res[w] = o;
  let p = await b.newPage({ viewport: { width: w, height: h } }); await p.addInitScript(init);
  await p.route(/\.(jpg|jpeg|png|webp)(\?.*)?$/, (r) => r.abort());
  await p.goto(base + '/', { waitUntil: 'networkidle', timeout: 90000 }); await p.waitForSelector('article .aspect-square', { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(2500);
  o.c7 = await p.evaluate(() => { const e = document.querySelector('article .aspect-square'); if (!e) return null; const r = e.getBoundingClientRect(); return { bg: getComputedStyle(e).backgroundColor, w: r.width, h: r.height }; });
  await p.close();
  p = await b.newPage({ viewport: { width: w, height: h } }); await p.addInitScript(init);
  await p.goto(base + '/', { waitUntil: 'networkidle', timeout: 90000 }); await p.waitForTimeout(2500);
  await p.evaluate(() => { const e = [...document.querySelectorAll('article h3')][1]; e.closest('article').scrollIntoView({ block: 'center', behavior: 'instant' }); });
  await p.waitForTimeout(1500);
  const h3 = p.locator('article h3').nth(1); const bb = await h3.boundingBox();
  o.c8 = { box: bb, before: await h3.evaluate((e) => getComputedStyle(e).color), scaleBefore: await h3.evaluate((e) => getComputedStyle(e.closest('article').firstElementChild).scale) };
  if (bb && bb.y > 0 && bb.y < h) { await p.mouse.move(bb.x + 20, bb.y + bb.height / 2); await p.waitForTimeout(700); o.c8.after = await h3.evaluate((e) => getComputedStyle(e).color); o.c8.cardTransform = await h3.evaluate((e) => getComputedStyle(e.closest('article').firstElementChild).scale); }
  o.c8.primaryOrCardClasses = await p.evaluate(() => [...document.querySelectorAll('article *')].filter((e) => /(^|\s|:)(bg|text)-(primary|card)\b/.test(e.getAttribute('class') || '')).length);
  await p.mouse.move(5, h - 5); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1200);
  const link = p.getByRole('link', { name: 'Collections' }).first();
  o.c9 = { linkCount: await p.getByRole('link', { name: 'Collections' }).count() };
  const headerBefore = await p.evaluate(() => { const e = document.querySelector('header'); const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; });
  const stripBefore = await p.screenshot({ clip: { x: 0, y: 0, width: w, height: 4 } });
  let release; const gate = new Promise((r) => { release = r; });
  await p.route((u) => u.searchParams.has('_data'), async (r) => { await gate; await r.continue(); });
  await link.click(); await p.waitForTimeout(600);
  o.c9.pending = await p.evaluate(() => { const e = document.querySelector('.nav-loading-bar'); if (!e) return { nodes: 0 }; const s = getComputedStyle(e); const r = e.getBoundingClientRect(); return { nodes: document.querySelectorAll('.nav-loading-bar').length, display: s.display, bgImage: s.backgroundImage, w: r.width, h: r.height, anim: s.animationName }; });
  o.c9.headerPending = await p.evaluate(() => { const e = document.querySelector('header'); const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; });
  o.c9.headerBefore = headerBefore;
  const stripPending = await p.screenshot({ clip: { x: 0, y: 0, width: w, height: 4 } });
  o.c9.stripEqual = Buffer.compare(stripBefore, stripPending) === 0;
  release(); await p.waitForTimeout(2500); o.c9.after = p.url();
  for (const r of ['/search', '/account/login']) { await p.goto(base + r, { waitUntil: 'networkidle' }); await p.waitForTimeout(1000); o['c10' + r] = await p.evaluate(() => [...document.querySelectorAll('p[style]')].map((e) => getComputedStyle(e).color)); }
  await p.goto(base + '/store', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  o.c11 = await p.evaluate(() => { const a = document.createElement('div'); a.className = 'artist-photo-border'; const g = document.createElement('div'); g.className = 'artist-photo-glow'; document.body.append(a, g); return { border: getComputedStyle(a).borderTopColor, glow: getComputedStyle(g).backgroundImage }; });
  await p.close();
}
console.log(JSON.stringify(res, null, 1)); await b.close();
