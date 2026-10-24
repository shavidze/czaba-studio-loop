// FOLLOW addendum: Fit / Z-less X press during playback pauses Follow; observer must record NV17 and the action's own status.
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
(async () => {
  const b = await L.launch(); const out = {}; const net = [];
  for (const w of [1440, 1280]) {
    const { ctx, page: p } = await L.openStudio(b, X.VPS[w], `fitplay-${w}`, net);
    await L.setSnapOff(p); await L.addAt(p, 'demo-stem-pulse', 'stems', 0); await p.keyboard.press('Escape'); await L.blur(p);
    await p.evaluate(() => { const o = document.querySelector('[data-testid=arrangement-status]'); window.__r = []; new MutationObserver(() => window.__r.push(o.textContent.trim())).observe(o, { childList: true, subtree: true, characterData: true }); });
    const play = p.locator('[data-testid=arrangement-fit]').locator('xpath=../..').locator('button').first();
    await play.click(); await sleep(800); await L.blur(p);
    const m0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-follow]').dataset.followMode);
    await p.click('[data-testid=arrangement-fit]'); await sleep(500); await L.blur(p);
    const st = await p.evaluate(() => ({ mode: document.querySelector('[data-testid=arrangement-follow]').dataset.followMode, title: document.querySelector('[data-testid=arrangement-follow]').title, rec: window.__r.slice() }));
    await p.keyboard.press('x'); await sleep(500);
    const st2 = await p.evaluate(() => ({ mode: document.querySelector('[data-testid=arrangement-follow]').dataset.followMode, rec: window.__r.slice() }));
    await play.click(); await sleep(300);
    out[w] = { modeBefore: m0, afterFit: st, afterX: st2 };
    await ctx.close();
  }
  out.net = X.netOk(net); L.save(L.OUT, 'fitplay.json', out); console.log(JSON.stringify(out, null, 1)); await b.close();
})();
