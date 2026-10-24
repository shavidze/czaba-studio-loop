const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => { const b = await L.launch(); const out = {};
 for (const w of [1440, 1280]) { const net = []; const { page: P, ctx } = await L.openStudio(b, X.VPS[w], 'ungroup' + w, net);
  const foc = () => P.evaluate(() => { const a = document.activeElement; return a ? { tid: a.getAttribute('data-testid'), label: a.getAttribute('aria-label'), track: a.closest('[data-track-id]')?.dataset.trackId } : null; });
  await P.click(L.nameSel('music')); await sleep(200); await P.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(200);
  await P.keyboard.press('Control+g'); await sleep(500);
  const a = { groups: await P.evaluate(() => document.querySelectorAll('[data-testid=arrangement-group-row]').length), focus: await foc() };
  await P.keyboard.press('Control+Shift+g'); await sleep(500);
  const c = { groups: await P.evaluate(() => document.querySelectorAll('[data-testid=arrangement-group-row]').length), focus: await foc(), status: await L.status(P) };
  await P.keyboard.press('Control+z'); await sleep(500);
  const d = { groups: await P.evaluate(() => document.querySelectorAll('[data-testid=arrangement-group-row]').length), focus: await foc() };
  await P.keyboard.press('Control+Shift+z'); await sleep(500);
  const e = { groups: await P.evaluate(() => document.querySelectorAll('[data-testid=arrangement-group-row]').length), focus: await foc() };
  out[w] = { afterCtrlG: a, afterUngroup: c, afterUndo: d, afterRedo: e, net: X.netOk(net) }; await ctx.close(); }
 console.log(JSON.stringify(out, null, 1)); await b.close(); })();
