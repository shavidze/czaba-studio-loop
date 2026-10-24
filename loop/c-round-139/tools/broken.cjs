const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => { const b = await L.launch(); const out = {};
 for (const w of [1440, 1280]) { const net = []; const { page: P, ctx } = await L.openStudio(b, X.VPS[w], 'broken' + w, net);
  await P.evaluate(() => { window.__notes = []; new MutationObserver(() => { for (const c of document.querySelectorAll('[data-clip-kind=video]')) { const t = c.textContent; if (!window.__notes.length || window.__notes.at(-1) !== t) window.__notes.push(t); } }).observe(document.body, { childList: true, subtree: true, characterData: true }); });
  await P.locator('[data-testid=arrangement-video-input]').first().setInputFiles(L.MEDIA + 'broken.mp4'); await sleep(6000);
  out[w] = { clips: await P.evaluate(() => [...document.querySelectorAll('[data-clip-kind=video]')].map((c) => c.textContent)), notes: await P.evaluate(() => window.__notes), status: await L.status(P), net: X.netOk(net) };
  await P.screenshot({ path: `../shots/broken-${w}.png` }); await ctx.close(); }
 console.log(JSON.stringify(out, null, 1)); await b.close(); })();
