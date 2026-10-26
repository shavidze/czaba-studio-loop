// C round 193 — pixel check of input boundaries (newsletter on /, search on /store, hire-us fields) tree vs HEAD. node inputs.cjs <W>
const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path'); const { decode } = require('./png.cjs');
const W = +process.argv[2]; const VPS = { 1440: [1440, 900], 1280: [1280, 720], 375: [375, 812] };
const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const SH = path.join(L.ROOT, 'shots', 'inputs'); fs.mkdirSync(SH, { recursive: true });
(async () => { const b = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text'] }); const res = {};
  for (const [tag, base] of [['tree', 'http://127.0.0.1:5173'], ['head', 'http://127.0.0.1:5174']]) for (const [pg, url, sel] of [['newsletter', '/', 'input[placeholder="Enter your email"]'], ['search', '/store', 'input[placeholder^="Search packs"]'], ['hireus-name', '/hire-us', 'form input']]) {
    const ctx = await b.newContext({ viewport: { width: VPS[W][0], height: VPS[W][1] }, deviceScaleFactor: 2 }); await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} }); const page = await ctx.newPage();
    await page.goto(base + url, { waitUntil: 'load' }); await page.waitForFunction(() => document.querySelector('footer'), null, { timeout: 60000 }).catch(() => {}); await L.sleep(3000);
    const el = page.locator(sel).filter({ hasNot: page.locator('xpath=ancestor::div[contains(@class,"fixed")]') }).last(); if (!(await el.count())) { res[tag + ':' + pg] = { missing: sel }; await ctx.close(); continue; }
    await page.evaluate((q) => { const e = [...document.querySelectorAll(q)].find((x) => !x.closest('div.fixed')) || document.querySelector(q); e.scrollIntoView({ block: 'center' }); }, sel); await L.sleep(1500); await page.locator('div.fixed.inset-0.z-\\[9999\\] button[aria-label=Close]').click({ timeout: 1000 }).catch(() => {}); await L.sleep(300); const cls = await el.evaluate((e) => ({ cls: e.className, bw: getComputedStyle(e).borderTopWidth, bc: getComputedStyle(e).borderTopColor, bg: getComputedStyle(e).backgroundColor }));
    const bb = await el.boundingBox(); const clip = { x: Math.max(0, bb.x - 8), y: Math.max(0, bb.y - 8), width: Math.min(bb.width + 16, VPS[W][0] - Math.max(0, bb.x - 8)), height: bb.height + 16 };
    const f = path.join(SH, `${W}-${tag}-${pg}.png`); await page.mouse.move(1, 1); await L.sleep(300); await page.screenshot({ path: f, clip });
    const im = decode(fs.readFileSync(f)); const s = 2; const yMid = Math.round((bb.y + bb.height / 2 - clip.y) * s); const xMid = Math.round((bb.x + bb.width / 2 - clip.x) * s);
    const outside = im.px(Math.round((bb.x - clip.x - 4) * s) < 0 ? 2 : Math.round((bb.x - clip.x - 4) * s), yMid); const topOutside = im.px(xMid, 4);
    const border = im.px(xMid, Math.round((bb.y - clip.y) * s) + 1); const inside = im.px(xMid, Math.round((bb.y - clip.y) * s) + 10);
    // focus state
    await el.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await L.sleep(400); const fcls = await el.evaluate((e) => ({ fv: e.matches(':focus-visible'), bc: getComputedStyle(e).borderTopColor, outline: getComputedStyle(e).outlineStyle + ' ' + getComputedStyle(e).outlineWidth + ' ' + getComputedStyle(e).outlineColor }));
    const ff = path.join(SH, `${W}-${tag}-${pg}-focus.png`); await page.screenshot({ path: ff, clip });
    res[tag + ':' + pg] = { ...cls, px: { outsideLeft: outside, outsideTop: topOutside, borderTop: border, insideTop: inside }, borderVsOutsideTop: ratio(border, topOutside), fillVsOutsideTop: ratio(inside, topOutside), focus: fcls, method: 'pixel, DPR2 screenshot crop' };
    await ctx.close(); }
  await b.close(); L.save(L.OUT, `inputs-${W}.json`, res); for (const [k, v] of Object.entries(res)) console.log(W, k, v.missing || `border ${v.bc} ${v.bw} px ${v.px.borderTop} vs outside ${v.px.outsideTop} = ${v.borderVsOutsideTop}; fill ${v.px.insideTop} vs outside = ${v.fillVsOutsideTop}; focus ${JSON.stringify(v.focus)}`); })();
