const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => { const b = await L.launch(); const out = {};
 for (const w of [1440, 1280]) { const { page: P, ctx } = await L.openStudio(b, X.VPS[w], 'dens' + w, []);
  out[w] = await P.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-track-height][aria-label="Height — ვიდეო"]'); const h = document.querySelector('[data-track-id="video"] [data-testid=arrangement-track-header]'); return { now: s.getAttribute('aria-valuenow'), hdrH: h.getBoundingClientRect().height, text: h.textContent }; });
  const s = P.locator('[data-testid=arrangement-track-height][aria-label="Height — ვიდეო"]'); await s.focus(); const steps = [];
  for (let i = 0; i < 6; i++) { await P.keyboard.press('ArrowDown'); await sleep(200); steps.push(await P.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-track-height][aria-label="Height — ვიდეო"]'); const h = document.querySelector('[data-track-id="video"] [data-testid=arrangement-track-header]'); return s.getAttribute('aria-valuenow') + ' ' + Math.round(h.getBoundingClientRect().height) + ' ' + h.textContent.includes('Original sound'); })); }
  out[w].grow = steps; await P.screenshot({ path: `../shots/video-header-grown-${w}.png` }); await ctx.close(); }
 console.log(JSON.stringify(out, null, 1)); await b.close(); })();
