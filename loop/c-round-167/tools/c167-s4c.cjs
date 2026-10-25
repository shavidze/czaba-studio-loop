// C round 167 — S4 Master Peak over-state contrast (canvas parse, measureSites copied verbatim from b-round-166/v3c4a-probe.cjs). node c167-s4c.cjs <W>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2];
const measureSites = ([buttons, fields]) => {
  const pickIn = (id) => (id === 'MASTER-MUTE' ? document.querySelector('button[aria-label="Master Mute"]') : document.querySelector(`[data-testid=${id}]`));
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true }); const parse = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = 'rgba(0,0,0,0)'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const over = (top, bottom) => { const a = top[3] + bottom[3] * (1 - top[3]); if (a === 0) return [0, 0, 0, 0]; return [0, 1, 2].map((i) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a).concat([a]); };
  const effBg = (e) => { const chain = []; for (let n = e; n; n = n.parentElement) chain.push(parse(getComputedStyle(n).backgroundColor)); let acc = [0, 0, 0, 1]; for (let i = chain.length - 1; i >= 0; i--) acc = over(chain[i], acc); return acc; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2); };
  const res = {};
  for (const id of [...buttons, ...fields]) {
    const e = pickIn(id); if (!e) { res[id] = { present: false }; continue; }
    const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
    const bg = effBg(e); let fg = parse(cs.color); const op = +cs.opacity; fg = over([...fg.slice(0, 3), fg[3] * op], bg);
    res[id] = { present: true, disabled: e.disabled === true, box: [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)], radius: cs.borderTopLeftRadius, borderColor: cs.borderTopColor, borderWidth: cs.borderTopWidth, bgOwn: cs.backgroundColor, bgEff: bg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), color: cs.color, opacity: op, contrast: ratio(fg, bg), cls: e.className };
  }
  return res;
};
const peakInfo = (p) => p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-master-peak]'); return { text: e.textContent.trim(), state: e.dataset.state }; });
(async () => {
  const b = await L.launch(); const net = []; const res = { W };
  const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c167s4c-${W}`, net); res.fonts = log.fontsReady.ok;
  for (const ln of ['music', 'stems', 'sfx']) await L.addAt(p, 'demo-middle-east', ln, 0);
  await p.focus('input[aria-label="Master Volume"]'); await p.keyboard.press('End'); await sleep(300); await L.blur(p);
  await L.seekTo(p, 0); await L.blur(p); await p.keyboard.press('Space');
  const t0 = Date.now(); while (Date.now() - t0 < 6000) { if ((await peakInfo(p)).state === 'over') break; await sleep(100); }
  await L.blur(p); await p.keyboard.press('Space'); await sleep(400);
  res.peak = await peakInfo(p);
  const m = async () => { const r = (await p.evaluate(measureSites, [['arrangement-master-peak'], []]))['arrangement-master-peak']; return { bgEff: r.bgEff, color: r.color, border: r.borderColor, contrast: r.contrast, state: (await peakInfo(p)).state }; };
  await p.mouse.move(2, 2); await sleep(450); res.rest = await m();
  const bb = await p.locator('[data-testid=arrangement-master-peak]').boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 3 }); await sleep(450); res.hover = await m();
  await p.mouse.down(); await sleep(450); res.active = await m(); await p.mouse.move(2, 2, { steps: 3 }); await sleep(100); await p.mouse.up(); await sleep(450); res.afterRelease = await peakInfo(p);
  await ctx.close(); res.net = X.netOk(net); await b.close();
  fs.writeFileSync(path.join(L.ROOT, 'out', 'func', `s4-contrast-${W}.json`), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
