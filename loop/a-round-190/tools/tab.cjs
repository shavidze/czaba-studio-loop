const L = require('./lib.cjs'); const D = require('./ld.cjs'); const fs = require('fs'); const path = require('path');
(async () => {
  const b = await L.chromium.launch({ headless: true }); const out = [];
  for (const W of [375, 1440]) for (const key of (process.env.KEYS || 'Tab,Shift+Tab,Escape,ArrowDown').split(',')) {
    const { ctx, page, ev } = await D.fresh(b, W);
    await page.goto(L.BASE + '/', { waitUntil: 'commit' }); const url0 = L.BASE + '/';
    await D.waitIns(page, 15000); const at = await D.waitSince(page, 300);
    const tKey = await page.evaluate(() => performance.now());
    await page.keyboard.press(key);
    let goneMs = null; try { await page.waitForFunction(() => !document.querySelector('[data-testid=entrance-loader]'), null, { timeout: 2000, polling: 'raf' }); } catch {}
    const r = await page.evaluate((tk) => { const rem = window.__ld.rem[0]; const a = document.activeElement; const rc = a ? a.getBoundingClientRect() : null; return { remAfterKeyMs: rem ? Math.round(rem - tk) : null, durMs: rem ? Math.round(rem - window.__ld.ins[0]) : null, active: a ? a.tagName + '.' + String(a.className).slice(0, 40) + ' "' + (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 30) + '"' : null, isBody: a === document.body, rect: rc ? [Math.round(rc.x), Math.round(rc.y), Math.round(rc.width), Math.round(rc.height)] : null, inViewport: rc ? rc.width > 0 && rc.height > 0 && rc.bottom > 0 && rc.top < innerHeight && rc.right > 0 && rc.left < innerWidth : false, plays: window.__ld.plays.length, scrollY: Math.round(scrollY), landmark: a && a.closest ? (a.closest('footer,header,nav,main,[role=dialog],[role=region]') || {}).tagName || null : null, inCookie: !!(a && a.closest && a.closest('[class*=fixed]')), url: location.href }; }, tKey);
    const row = { W, key, keyAtMs: Math.round(at), ...r, urlUnchanged: r.url === url0, pageerror: ev.pageerror.length }; out.push(row); console.log(JSON.stringify(row)); await ctx.close();
  }
  await b.close(); fs.writeFileSync(path.join(__dirname, '..', 'out', process.env.KEYS ? 'keys-after-shifttab.json' : 'keys-after.json'), JSON.stringify(out, null, 2));
})();
