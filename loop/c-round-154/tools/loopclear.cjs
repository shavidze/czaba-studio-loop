// C round 153 — FUNC-SMOKE extra: does the LOOP label come back when the loop range is cleared (Ctrl+Z)? node loopclear.cjs <1440|1280>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const net = []; const res = { vp: W, steps: [] };
const st = (p) => p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-loop-strip]'); const lab = [...document.querySelectorAll('.tracking-label')].map((e) => ({ t: e.textContent, it: e.innerText, ls: getComputedStyle(e).letterSpacing, tt: getComputedStyle(e).textTransform })); return { strip: s && s.textContent.trim().slice(0, 80), labels: lab, times: (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent || null }; });
(async () => {
  const b = await L.launch();
  try {
    const { page: p } = await L.openStudio(b, X.VPS[W], `loopclear-${W}`, net);
    await L.setSnapOff(p); await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
    res.steps.push({ s: 'start', ...(await st(p)) });
    const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id;
    await X.rangeDrag(p, sfx, 4.4, 5.4); res.steps.push({ s: 'Ctrl+L on', status: await X.key(p, 'Control+l'), ...(await st(p)) });
    for (let i = 1; i <= 4; i++) { const status = await X.key(p, 'Control+z'); const v = await st(p); res.steps.push({ s: `Ctrl+Z #${i}`, status, undo: await X.undoTitle(p), ...v }); if (!v.times) break; }
    const strip = await p.locator('[data-testid=arrangement-loop-strip]').boundingBox(); if (strip) await p.screenshot({ path: path.join(L.SHOTS, `loopclear-${W}.png`), clip: { x: 280, y: strip.y - 30, width: 600, height: strip.height + 40 } });
  } catch (e) { res.error = String(e.stack || e); }
  res.net = X.netOk(net); fs.writeFileSync(path.join(L.OUT, `loopclear-${W}.json`), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 0).slice(0, 3000)); await b.close();
})();
