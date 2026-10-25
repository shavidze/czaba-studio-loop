// C round 167 — Triplets checked icon (C-R166-TRIPLET-CHECKED-BROWSER). node c167-trip.cjs <W> <att>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'func'); const SHD = path.join(L.ROOT, 'shots', 'func');
const menuState = (p) => p.evaluate(() => { const m = document.querySelector('[data-testid=arrangement-grid-menu]'); if (!m) return null; return [...m.querySelectorAll('[role^=menuitem]')].map((e) => `${e.textContent.trim()}:${e.getAttribute('aria-checked')}:${e.querySelectorAll('svg.lucide-check').length}`); });
const openMenu = async (p) => { const body = p.locator('[data-track-id="music"] [data-grid-seconds]').first(); const bb = await body.boundingBox(); await p.mouse.click(bb.x + 300, bb.y + bb.height / 2, { button: 'right' }); await p.waitForSelector('[data-testid=arrangement-grid-menu]', { timeout: 5000 }); await sleep(300); };
(async () => {
  const b = await L.launch(); const net = []; const res = { W, ATT };
  const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c167trip-${W}-${ATT}`, net); res.fonts = log.fontsReady.ok;
  await p.click('[data-testid=arrangement-tempo-input]'); await p.keyboard.press('Control+A'); await p.keyboard.type('120'); await p.keyboard.press('Enter'); await sleep(400); await L.blur(p);
  await openMenu(p); res.open0 = await menuState(p);
  await p.locator('[data-testid=arrangement-grid-menu] [role^=menuitem]', { hasText: /^1\/8$/ }).first().click(); await sleep(400); res.s18 = await L.status(p);
  await openMenu(p); res.open18 = await menuState(p);
  await p.locator('[data-testid=arrangement-grid-menu] [role^=menuitem]', { hasText: /Triplets/ }).first().click(); await sleep(400); res.sTrip = await L.status(p);
  await openMenu(p); res.openTrip = await menuState(p);
  await p.screenshot({ path: path.join(SHD, `trip-${W}-${ATT}-checked.png`) });
  await p.keyboard.press('Escape'); await sleep(300);
  await ctx.close(); res.net = X.netOk(net); await b.close();
  fs.writeFileSync(path.join(OUTD, `trip-${W}-${ATT}.json`), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
