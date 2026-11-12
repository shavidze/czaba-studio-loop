import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.argv[2] || 'http://127.0.0.1:5173';
const tag = process.argv[3] || 'head';
const res = {};
const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const o = {}; res[w] = o;
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
  await p.goto(base + '/store', { waitUntil: 'networkidle', timeout: 90000 }); await p.waitForTimeout(2500);
  o.ruleCount = await p.evaluate(() => { const want = ['.command-palette-trigger:hover', '.command-palette-input', '.command-palette-close:hover', '.command-palette-item', '.code-4', '.bg-brand', '.nav-loading-bar']; const n = Object.fromEntries(want.map((k) => [k, ''])); const walk = (rs) => { for (const r of rs) { if (r.cssRules) walk(r.cssRules); if (want.includes(r.selectorText)) n[r.selectorText] = r.style.getPropertyValue('color') || r.style.getPropertyValue('background') || 'present'; } }; for (const s of document.styleSheets) { try { walk(s.cssRules); } catch {} } return n; });
  const trig = p.locator('.command-palette-trigger').first();
  o.trigRest = await trig.evaluate((e) => getComputedStyle(e).color);
  const tb = await trig.boundingBox(); await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2); await p.waitForTimeout(400);
  o.trigHover = await trig.evaluate((e) => ({ c: getComputedStyle(e).color, parent: getComputedStyle(e.parentElement).color }));
  await p.screenshot({ path: `${tag}-trigger-hover-${w}.png`, clip: { x: 0, y: 0, width: w, height: 110 } });
  await p.mouse.click(tb.x + tb.width / 2, tb.y + tb.height / 2); await p.waitForTimeout(800);
  o.input = await p.evaluate(() => { const e = document.querySelector('.command-palette-input'); return e ? { c: getComputedStyle(e).color, parent: getComputedStyle(e.parentElement).color } : null; });
  const close = p.locator('.command-palette-close').first();
  if (await close.count()) { o.closeRest = await close.evaluate((e) => getComputedStyle(e).color); const cb = await close.boundingBox(); await p.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2); await p.waitForTimeout(400); o.closeHover = await close.evaluate((e) => ({ c: getComputedStyle(e).color, parent: getComputedStyle(e.parentElement).color })); }
  await p.waitForTimeout(800); o.itemsAtOpen = await p.evaluate(() => document.querySelectorAll('.command-palette-item').length); await p.keyboard.type('s', { delay: 50 }); await p.waitForTimeout(1500); const it = p.locator('.command-palette-item').first(); if (await it.count()) { const ib = await it.boundingBox(); await p.mouse.move(ib.x + 20, ib.y + ib.height / 2); await p.waitForTimeout(400); o.itemHover = await it.evaluate((e) => ({ c: getComputedStyle(e).color, parent: getComputedStyle(e.parentElement).color })); }
  o.results = await p.evaluate(() => [...document.querySelectorAll('.command-palette-item')].slice(0, 4).map((e) => ({ t: e.textContent.trim().slice(0, 30), c: getComputedStyle(e).color, parent: getComputedStyle(e.parentElement).color })));
  await p.screenshot({ path: `${tag}-palette-${w}.png` });
  await p.keyboard.press('Escape');
  await p.goto(base + '/no-such-page-xyz', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  o.code4 = await p.evaluate(() => [...document.querySelectorAll('.code-4')].map((e) => ({ c: getComputedStyle(e).color, parent: getComputedStyle(e.parentElement).color })));
  await p.screenshot({ path: `${tag}-404-${w}.png` });
  for (const r of ['/search', '/account/login']) { await p.goto(base + r, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200); o[r] = await p.evaluate(() => [...document.querySelectorAll('p[style]')].map((e) => ({ t: e.textContent.trim().slice(0, 40), c: getComputedStyle(e).color }))); await p.screenshot({ path: `${tag}${r.replace(/\//g, '-')}-${w}.png` }); }
  await p.close();
}
console.log(JSON.stringify(res, null, 1)); await b.close();
