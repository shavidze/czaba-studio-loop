// C round 202 — KEY-RING / RING-VISIBLE / CONTRAST sweep. node sweep.cjs <port> <W> [pages,comma]
const F = require('./fl.cjs');
const path = require('path');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : W === 1280 ? 720 : 812;
const ONLY = process.argv[4] ? process.argv[4].split(',') : null;
const BASE = `http://127.0.0.1:${PORT}`; const TAG = `${PORT === '5174' ? 'ref' : 'tree'}-${W}`;
const OUT = path.join(F.ROOT, 'out', 'sweep', TAG);
const PAGES = [
  { name: 'home', url: '/', max: 110 },
  { name: 'store', url: '/store', max: 90 },
  { name: 'product', url: '/products/pulse-loop-kit', max: 90 },
  { name: 'support', url: '/support', chat: true, max: 90 },
  { name: 'free', url: '/free-downloads', max: 90 },
  { name: 'gift', url: '/gift-cards', max: 90 },
  { name: 'hire', url: '/hire-us', max: 90 },
  { name: 'cart', url: '/cart', max: 70 },
  { name: 'palette', url: '/store', palette: true, max: 30 },
];
(async () => {
  const browser = await F.launch(); const R = { TAG, W, H, pages: {} };
  for (const P of PAGES) {
    if (ONLY && !ONLY.includes(P.name)) continue;
    const { ctx, page, log } = await F.newPage(browser, W, H);
    const r = { url: P.url };
    try {
      await page.goto(BASE + P.url, { waitUntil: 'load', timeout: 90000 }); await F.sleep(3000);
      await F.declineCookies(page); await F.sleep(600);
      if (P.chat) { await page.locator('button', { hasText: 'Live Chat' }).first().click({ timeout: 30000 }); await page.waitForSelector('#guest-name', { timeout: 15000 }); await F.sleep(1200); }
      if (P.palette) { await page.keyboard.press('Control+k'); await F.sleep(1000); r.paletteOpen = await page.evaluate(() => !!document.querySelector('.command-palette-input')); }
      await page.mouse.move(1, H - 2);
      // start from the top: focus the document start
      if (!P.palette && !P.chat) await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement && document.activeElement.blur && document.activeElement.blur(); });
      await F.sleep(300);
      r.stops = await F.tabSweep(page, path.join(OUT, P.name), W, H, { max: P.max, label: P.name });
      r.summary = r.stops.filter((s) => s.f).map((s) => ({ i: s.i, tag: s.f.tag, name: s.f.name, os: s.f.os, ow: s.f.ow, oo: s.f.oo, op: s.f.op, fs: s.f.focusSource, sides: s.ring ? s.ring.sides : null, contrast: s.ring ? s.ring.contrast : null, issues: F.judge(s) }));
    } catch (e) { r.err = String(e).slice(0, 300); }
    r.log = log; R.pages[P.name] = r;
    F.save(path.join(OUT, 'result.json'), R);
    const bad = (r.summary || []).filter((s) => s.issues && s.issues.length);
    console.log(TAG, P.name, 'stops', (r.summary || []).length, 'issues', bad.length, r.err || '');
    await ctx.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
