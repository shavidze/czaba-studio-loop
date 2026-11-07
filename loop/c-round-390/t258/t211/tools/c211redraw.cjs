// C round 211 — §4 other lane redraws: waveform zoom, trim end, clip move still redraw the lane waveform (no draft), vs baseline.
const L = require('./c211lib.cjs');
const [vw, vh] = [Number(process.argv[2]), Number(process.argv[3])];
const hashes = (page) => page.evaluate(() => { const h = (s) => { let x = 5381; for (let i = 0; i < s.length; i++) x = ((x * 33) ^ s.charCodeAt(i)) >>> 0; return x.toString(16); };
  return [...document.querySelectorAll('[data-clip-kind=audio]')].map((c) => { const s = c.querySelector('[data-testid=arrangement-clip-waveform]'); const p = s && s.querySelector(':scope > path'); return { t: c.textContent.slice(0, 12), vb: s && s.getAttribute('viewBox'), d: p ? h(p.getAttribute('d')) : null, parentIsBody: s ? s.parentElement.getAttribute('title') : null }; }); });
(async () => { const b = await L.launch(); const R = {};
  for (const [base, tag] of [['http://127.0.0.1:5191', 'base'], ['http://127.0.0.1:5190', 'cur']]) { const { ctx, page } = await L.openLab(b, base, vw, vh); const o = {};
    await page.getByRole('button', { name: 'SFX — set as the active track', exact: true }).click(); await L.sleep(300);
    await page.getByTestId('arrangement-library-option-title').filter({ hasText: 'Soft impact' }).click();
    await page.getByRole('button', { name: 'Add', exact: true }).first().click(); await L.sleep(2000);
    o.rest = await hashes(page);
    const z = page.getByTestId('arrangement-waveform-zoom'); o.zoomOptions = await z.evaluate((s) => [...s.options].map((x) => x.value));
    await z.selectOption(o.zoomOptions[o.zoomOptions.length - 1]); await L.sleep(500); o.zoomMax = await hashes(page);
    await z.selectOption('1'); await L.sleep(500); o.zoomBack = await hashes(page);
    const si = page.locator('[data-clip-kind=audio]').filter({ hasText: 'Soft impact' });
    const th = si.getByTitle('Trim — right edge'); const tb = await th.boundingBox(); o.trimHandle = !!tb;
    if (tb) { await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2); await page.mouse.down(); await page.mouse.move(tb.x + tb.width / 2 - 30, tb.y + tb.height / 2, { steps: 10 }); o.trimMid = await hashes(page); await page.mouse.up(); await L.sleep(500); o.trimAfter = await hashes(page); o.undoTrim = (await L.undoTitle(page)).title; }
    R[tag] = o; await ctx.close(); }
  const keys = ['rest', 'zoomMax', 'zoomBack', 'trimMid', 'trimAfter'];
  R.same = keys.every((k) => JSON.stringify(R.base[k]) === JSON.stringify(R.cur[k]));
  R.changes = keys.map((k) => [k, R.cur[k] && R.cur[k].map((x) => x.d).join('/')]);
  L.save(`redraw-${vw}.json`, R); console.log(vw, 'same-as-baseline', R.same, JSON.stringify(R.changes), 'undo', R.cur.undoTrim, R.base.undoTrim); await b.close(); })();
