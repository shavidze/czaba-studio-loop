const L = require('./lib258.cjs'); const { fs, path } = L;
(async () => { const b = await L.chromium.launch(); const out = {};
for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) { const k = `${vp.width}x${vp.height}`;
  for (const pulse of [false, true]) { const { ctx, page, errors } = await L.open(b, vp, { pulse, zoom: false });
    out[`${k}-${pulse ? 'clip' : 'empty'}`] = await page.evaluate(() => [...document.querySelectorAll('button')].filter((x) => /^(Undo|Redo|Loop|Back to start|Play|Stop|Split|Delete|Follow|Zoom|Fit|Export)/.test(x.getAttribute('title') || '')).map((x) => ({ name: x.getAttribute('aria-label') || x.textContent.trim(), title: x.getAttribute('title'), aks: x.getAttribute('aria-keyshortcuts') })));
    out[`${k}-${pulse ? 'clip' : 'empty'}-errors`] = errors.length; await ctx.close(); } }
fs.writeFileSync(path.join(__dirname, '..', 'out', 'rrsheet', 'titles2.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out['1440x900-empty']), JSON.stringify(out['1280x720-clip'])); await b.close(); })();
