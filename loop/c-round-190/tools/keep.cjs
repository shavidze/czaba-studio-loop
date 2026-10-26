// C round 189 — KEEP-189 at 1440 and 375 after the loader (fresh context: loader shows, then wait, scroll, watch popup).
const L = require('./lib.cjs'); const D = require('./ld.cjs'); const path = require('path');
(async () => { const b = await L.chromium.launch({ headless: true }); const out = {};
  for (const W of [1440, 375]) { const { ctx, page, ev } = await D.fresh(b, W); await page.goto(L.BASE + '/', { waitUntil: 'load' }); const shown = await D.waitIns(page, 5000); await D.waitRem(page); await L.sleep(500);
    const t0 = Date.now(); await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.5)); let popAt = null; while (Date.now() - t0 < 15000) { if (await page.evaluate(() => !!document.querySelector('div.fixed.inset-0.z-\\[9999\\]'))) { popAt = Date.now() - t0; break; } await L.sleep(200); }
    const popText = popAt !== null ? await page.evaluate(() => document.querySelector('div.fixed.inset-0.z-\\[9999\\]').innerText.replace(/\s+/g, ' ').slice(0, 200)) : null;
    await page.screenshot({ path: path.join(__dirname, '..', 'shots', `keep-popup-${W}.png`) });
    const txt = await page.evaluate(() => document.body.innerText);
    out[W] = { loaderShown: shown, popupAfterScrollMs: popAt, popText, giftCards: /Browse Gift Cards/.test(txt), limited: (txt.match(/\bLimited\b/g) || []).length, freeSamplesNav: /Free Samples/.test(txt), pageerror: ev.pageerror.length };
    await ctx.close(); }
  await b.close(); L.save(path.join(__dirname, '..', 'out'), 'keep.json', out); console.log(JSON.stringify(out, null, 1)); })();
