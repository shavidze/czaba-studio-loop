// C round 202 — CSS-CONTROLS (AudioPlayer sliders), POINTER, typing ring, mobile menu. node pointer.cjs <port> <W>
const F = require('./fl.cjs');
const path = require('path'); const fs = require('fs');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : W === 1280 ? 720 : 812;
const BASE = `http://127.0.0.1:${PORT}`; const TAG = `${PORT === '5174' ? 'ref' : 'tree'}-${W}`;
const SH = path.join(F.ROOT, 'shots', 'pointer', TAG); fs.mkdirSync(SH, { recursive: true });
const attr = (p) => p.evaluate(() => document.documentElement.getAttribute('data-focus-source'));
const pick = (d) => d && { name: d.name.slice(0, 30), os: d.os, ow: d.ow, oo: d.oo, bs: d.bs.slice(0, 50), bc: d.bc.split('|')[0], fv: d.fv, fs: d.focusSource };
(async () => {
  const browser = await F.launch(); const R = { TAG };
  // --- CSS-CONTROLS: AudioPlayer sliders after starting a preview on /products/pulse-loop-kit
  if (W !== 375) {
    const { ctx, page } = await F.newPage(browser, W, H, { deviceScaleFactor: 2 });
    await page.goto(BASE + '/products/pulse-loop-kit', { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await F.sleep(500);
    const pb = page.locator('button[aria-label="Play preview"]').filter({ visible: true }).first();
    R.previewBtns = await page.locator('button[aria-label="Play preview"]').count();
    if (await pb.count()) { await pb.click(); await F.sleep(4000); }
    R.sliders = {};
    for (const cls of ['audio-player-progress', 'audio-player-volume-slider']) {
      const loc = page.locator('.' + cls).first();
      if (!(await loc.count()) || !(await loc.isVisible())) { R.sliders[cls] = 'not-visible'; continue; }
      const b = await loc.boundingBox(); const clip = F.clipFor([b.x, b.y, b.width, b.height], W, H, 8);
      await page.evaluate(() => document.activeElement && document.activeElement.blur()); await F.sleep(300);
      await page.screenshot({ path: path.join(SH, `${cls}-u.png`), clip });
      await loc.focus(); await page.keyboard.press('Shift+Tab'); await F.sleep(200); await page.keyboard.press('Tab'); await F.sleep(600);
      const d = await F.describeActive(page);
      await page.screenshot({ path: path.join(SH, `${cls}-f.png`), clip });
      const isIt = await page.evaluate((c) => document.activeElement.classList.contains(c), cls);
      const box = [b.x, b.y, b.width, b.height];
      // ring stats with DSF2: scale clip coordinates
      const st = ringStats2(path.join(SH, `${cls}-f.png`), path.join(SH, `${cls}-u.png`), clip, box);
      R.sliders[cls] = { isIt, ...pick(d), ring: st };
    }
    // mouse click on slider: ring?
    const vol = page.locator('.audio-player-volume-slider').first();
    if (await vol.count() && await vol.isVisible()) { const b = await vol.boundingBox(); await page.mouse.click(b.x + b.width * 0.5, b.y + b.height / 2); await F.sleep(400); R.sliderMouse = { attr: await attr(page), ...pick(await F.describeActive(page)) }; }
    await ctx.close();
  }
  // --- POINTER on fresh load
  {
    const { ctx, page } = await F.newPage(browser, W, H);
    await page.goto(BASE + '/store', { waitUntil: 'load' }); await F.sleep(3000);
    R.freshAttr = await attr(page);
    await page.keyboard.press('Tab'); await F.sleep(400); R.firstTab = { attr: await attr(page), ...pick(await F.describeActive(page)) };
    await F.declineCookies(page); await F.sleep(500);
    const targets = W === 375 ? [['search', 'input[placeholder^="Search packs"]'], ['card', 'a[href^="/products/"]']] : [['search', 'input[placeholder^="Search packs"]'], ['navLink', 'header a[href="/store"]'], ['button', 'header button:has-text("Sign In")'], ['card', 'a[href^="/products/"]']];
    R.clicks = {};
    for (const [n, sel] of targets) {
      const loc = page.locator(sel).first(); if (!(await loc.count()) || !(await loc.isVisible())) { R.clicks[n] = 'not-visible'; continue; }
      if (n === 'card' || n === 'navLink') { await loc.evaluate((e) => e.addEventListener('click', (ev) => ev.preventDefault(), { once: true })); }
      const b = await loc.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + Math.min(b.height / 2, 60)); await F.sleep(400);
      const afterClick = { attr: await attr(page), ...pick(await F.describeActive(page)) };
      if (n === 'button') { await page.keyboard.press('Escape'); await F.sleep(600); }
      await page.keyboard.press('Tab'); await F.sleep(400);
      const afterTab = { attr: await attr(page), ...pick(await F.describeActive(page)) };
      R.clicks[n] = { afterClick, afterTab };
    }
    // typing ring: click search, type a printable char
    const s = page.locator('input[placeholder^="Search packs"]').first();
    const b = await s.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await F.sleep(300);
    const t0 = { attr: await attr(page), ...pick(await F.describeActive(page)) };
    await page.keyboard.type('m'); await F.sleep(400);
    const t1 = { attr: await attr(page), ...pick(await F.describeActive(page)) };
    await page.screenshot({ path: path.join(SH, 'typing-search.png'), clip: F.clipFor([b.x, b.y, b.width, b.height], W, H, 10) });
    R.typing = { search: { click: t0, afterKey: t1 } };
    await ctx.close();
  }
  // newsletter on / (click + type), plus mobile menu at 375
  {
    const { ctx, page } = await F.newPage(browser, W, H);
    await page.goto(BASE + '/', { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await F.sleep(500);
    const n = page.locator('input[placeholder="Enter your email"]').first();
    if (await n.count()) { await n.scrollIntoViewIfNeeded(); await F.sleep(1500); const b = await n.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await F.sleep(400); const c = { attr: await attr(page), ...pick(await F.describeActive(page)) }; await page.keyboard.type('a'); await F.sleep(300); R.typing.newsletter = { click: c, afterKey: { attr: await attr(page), ...pick(await F.describeActive(page)) } }; }
    if (W === 375) {
      await page.evaluate(() => window.scrollTo(0, 0)); await F.sleep(800);
      const menu = page.locator('header button[aria-label*="menu" i]').first();
      R.menuBtn = await menu.count();
      if (R.menuBtn) {
        const mb = await menu.boundingBox(); await page.mouse.click(mb.x + mb.width / 2, mb.y + mb.height / 2); await F.sleep(1000);
        R.menuStops = [];
        for (let i = 0; i < 14; i++) { await page.keyboard.press('Tab'); await F.sleep(400); const d = await F.describeActive(page); if (!d) continue; R.menuStops.push({ ...pick(d), op: d.op, box: d.box }); }
        await page.screenshot({ path: path.join(SH, 'mobile-menu-tab.png') });
      }
    }
    await ctx.close();
  }
  F.save(path.join(F.ROOT, 'out', 'pointer', `${TAG}.json`), R);
  console.log(JSON.stringify(R, null, 0).slice(0, 4000));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });

function ringStats2(fFile, uFile, clip, box) {
  const { decode } = require('./png.cjs');
  const Fi = decode(fs.readFileSync(fFile)); const U = decode(fs.readFileSync(uFile)); const s = Fi.w / clip.width;
  const [bx, by, bw, bh] = box; const sides = { top: 0, bottom: 0, left: 0, right: 0 }; const ring = []; const out = [];
  for (let y = 0; y < Fi.h; y++) for (let x = 0; x < Fi.w; x++) {
    const X = clip.x + (x + 0.5) / s, Y = clip.y + (y + 0.5) / s; const f = Fi.px(x, y), u = U.px(x, y);
    const d = Math.abs(f[0] - u[0]) + Math.abs(f[1] - u[1]) + Math.abs(f[2] - u[2]);
    const inside = X > bx && X < bx + bw && Y > by && Y < by + bh; if (inside) continue;
    const dx = X < bx ? bx - X : X > bx + bw ? X - bx - bw : 0; const dy = Y < by ? by - Y : Y > by + bh ? Y - by - bh : 0;
    if (Math.max(dx, dy) <= 5 && d > 24 && F.isBrass(f)) { ring.push(f); out.push(u); if (Y < by) sides.top++; else if (Y > by + bh) sides.bottom++; else if (X < bx) sides.left++; else sides.right++; }
  }
  const lumS = (a) => a.sort((p, q) => (p[0] + p[1] + p[2]) - (q[0] + q[1] + q[2]))[Math.floor(a.length / 2)];
  const rm = ring.length ? lumS(ring) : null, om = out.length ? lumS(out) : null;
  return { sides, ringMed: rm, outsideMed: om, contrast: rm && om ? F.contrast(rm, om) : null };
}
