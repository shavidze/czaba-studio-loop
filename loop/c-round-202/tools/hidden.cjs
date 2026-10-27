// C round 202 — HIDDEN-FOCUS (R99), CARD-RING (R96), Browse-the-Collection settle. node hidden.cjs <port> <W>
const F = require('./fl.cjs');
const path = require('path'); const fs = require('fs');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : W === 1280 ? 720 : 812;
const BASE = `http://127.0.0.1:${PORT}`; const TAG = `${PORT === '5174' ? 'ref' : 'tree'}-${W}`;
const SH = path.join(F.ROOT, 'shots', 'hidden', TAG); fs.mkdirSync(SH, { recursive: true });
const overlayOf = (page) => page.evaluate(() => {
  const a = document.activeElement; if (!a) return null;
  const ov = a.closest('div.absolute.inset-0');
  const eff = (n) => { let o = 1; while (n && n.nodeType === 1) { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; } return +o.toFixed(3); };
  return { active: a.getAttribute('aria-label') || a.textContent.trim().slice(0, 30), activeEff: eff(a), overlayOwn: ov ? +getComputedStyle(ov).opacity : null, overlayCls: ov ? ov.className.slice(0, 60) : null };
});
const allOverlays = (page) => page.evaluate(() => [...document.querySelectorAll('button[aria-label="Play preview"]')].map((b) => { const ov = b.closest('div.absolute.inset-0'); return ov ? +getComputedStyle(ov).opacity : null; }));
(async () => {
  const browser = await F.launch(); const R = { TAG };
  const { ctx, page } = await F.newPage(browser, W, H, { deviceScaleFactor: 3 });
  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 120000 }); await F.sleep(3500); await F.declineCookies(page); await F.sleep(500);
  await page.mouse.move(2, H - 2);
  R.previewCount = await page.locator('button[aria-label="Play preview"]').count();
  R.previewVisibleCount = await page.evaluate(() => [...document.querySelectorAll('button[aria-label="Play preview"]')].filter((b) => b.offsetParent).length);
  // Tab through: record each Play preview / card link / Browse focus
  R.stops = [];
  await page.evaluate(() => { window.scrollTo(0, 0); });
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press('Tab'); await F.sleep(500);
    const d = await F.describeActive(page);
    if (!d) continue;
    if (/Play preview/.test(d.name) || d.tag === 'A' && /\/products\//.test(await page.evaluate(() => document.activeElement.getAttribute('href') || '')) || /Browse the Collection/.test(d.name)) {
      const ov = await overlayOf(page);
      const rec = { i, name: d.name.slice(0, 40), tag: d.tag, os: d.os, ow: d.ow, oo: d.oo, oc: d.oc, bs: d.bs.slice(0, 60), op: d.op, box: d.box, ov, display: await page.evaluate(() => getComputedStyle(document.activeElement).display) };
      if (/Browse/.test(d.name)) { await F.sleep(2500); rec.opAfter3s = (await F.describeActive(page)).op; await page.screenshot({ path: path.join(SH, `browse-${i}.png`) }); }
      if (d.box[1] >= 0 && d.box[1] + d.box[3] <= H) {
        const clip = F.clipFor(d.box, W, H, 10); await page.screenshot({ path: path.join(SH, `stop-${i}-f.png`), clip });
        rec.shot = `stop-${i}-f.png`;
      }
      R.stops.push(rec);
      if (/Play preview/.test(d.name) && R.stops.filter((s) => /Play/.test(s.name)).length === 1) {
        // Tab away then measure overlay returns to 0
        await page.keyboard.press('Tab'); await F.sleep(600); R.firstAway = { all: await allOverlays(page), active: (await F.describeActive(page) || {}).name };
        await page.keyboard.press('Shift+Tab'); await F.sleep(600); R.firstBack = await overlayOf(page);
        await page.keyboard.press('Tab'); await F.sleep(400);
      }
    }
  }
  // Hover behaviour: hover the first card image; overlay opacity
  await page.evaluate(() => document.activeElement && document.activeElement.blur()); await F.sleep(300);
  const b0 = page.locator('button[aria-label="Play preview"]').filter({ visible: true }).first();
  if (await b0.count()) { await b0.scrollIntoViewIfNeeded(); await F.sleep(600); const bb = await b0.boundingBox(); await page.mouse.move(bb.x + 5, bb.y - 30); await F.sleep(800); R.hover = await allOverlays(page); await page.mouse.move(2, 2); await F.sleep(800); R.unhover = await allOverlays(page); }
  // Card boxes (CARD-RING / NO-SHIFT)
  await page.evaluate(() => window.scrollTo(0, 0)); await F.sleep(800);
  R.cardBoxes = await page.evaluate(() => [...document.querySelectorAll('a[href^="/products/"]')].slice(0, 12).map((a) => { const r = a.getBoundingClientRect(); const art = a.closest('article,div'); const g = a.parentElement && a.parentElement.parentElement ? a.parentElement.parentElement.getBoundingClientRect() : null; return { href: a.getAttribute('href'), x: +r.x.toFixed(1), y: +(r.y + scrollY).toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), parent: g && [+g.x.toFixed(1), +(g.y + scrollY).toFixed(1), +g.width.toFixed(1), +g.height.toFixed(1)] }; }));
  F.save(path.join(F.ROOT, 'out', 'hidden', `${TAG}.json`), R);
  console.log(JSON.stringify({ TAG, n: R.previewCount, vis: R.previewVisibleCount, stops: R.stops.map((s) => [s.i, s.name.slice(0, 18), s.op, s.ov && s.ov.overlayOwn, s.os, s.display, s.opAfter3s]), away: R.firstAway, back: R.firstBack, hover: R.hover, unhover: R.unhover }));
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
