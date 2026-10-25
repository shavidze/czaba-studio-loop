// C round 167 — SURF-V3C4A / BOX-V3C4A / CONTRAST-V3C4A. node c167-surf.cjs <1440|1280> <attempt>
// measureSites copied verbatim from b-round-166/v3c4a-probe.cjs (canvas colour parse), extended only by a separate computed-style reader.
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'surf'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'surf'); fs.mkdirSync(SHD, { recursive: true });
const BUTTONS = ['arrangement-snap-toggle', 'arrangement-envelope-toggle', 'arrangement-metronome-toggle', 'arrangement-marker-add', 'arrangement-marker-prev', 'arrangement-marker-next', 'arrangement-master-peak', 'MASTER-MUTE'];
const FIELDS = ['arrangement-tempo-input', 'arrangement-grid-division', 'arrangement-waveform-zoom'];
const sel = (id) => (id === 'MASTER-MUTE' ? 'button[aria-label="Master Mute"]' : `[data-testid=${id}]`);
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
const extra = (ids) => {
  const pickIn = (id) => (id === 'MASTER-MUTE' ? document.querySelector('button[aria-label="Master Mute"]') : document.querySelector(`[data-testid=${id}]`));
  const o = {};
  for (const id of ids) { const e = pickIn(id); if (!e) continue; const cs = getComputedStyle(e); o[id] = { tp: cs.transitionProperty, td: cs.transitionDuration, tf: cs.transitionTimingFunction, radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius], bw: [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth], pressed: e.getAttribute('aria-pressed'), state: e.getAttribute('data-state'), label: e.getAttribute('aria-label') }; }
  return o;
};
const rawBoxes = (ids) => { const pickIn = (id) => (id === 'MASTER-MUTE' ? document.querySelector('button[aria-label="Master Mute"]') : document.querySelector(`[data-testid=${id}]`)); const o = {}; for (const id of ids) { const e = pickIn(id); if (!e) continue; const r = e.getBoundingClientRect(); o[id] = [r.x, r.y, r.width, r.height]; } return o; };
async function hoverActive(p, ids) {
  const out = {};
  for (const id of ids) {
    const loc = p.locator(sel(id)).first(); if (!(await loc.count())) continue;
    const bb = await loc.boundingBox(); const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
    const hit = await p.evaluate(({ x, y, s }) => { const t = document.elementFromPoint(x, y); return !!(t && t.closest(s)); }, { x: cx, y: cy, s: sel(id) });
    await p.mouse.move(cx, cy, { steps: 3 }); await sleep(450);
    const h = (await p.evaluate(measureSites, [[id], []]))[id];
    await p.mouse.down(); await sleep(450);
    const a = (await p.evaluate(measureSites, [[id], []]))[id];
    await p.mouse.move(2, 2, { steps: 3 }); await sleep(100); await p.mouse.up(); await sleep(450);
    const after = (await p.evaluate(measureSites, [[id], []]))[id]; const ex = (await p.evaluate(extra, [id]))[id];
    out[id] = { hit, hover: { bgEff: h.bgEff, bgOwn: h.bgOwn, color: h.color, contrast: h.contrast, borderColor: h.borderColor }, active: { bgEff: a.bgEff, bgOwn: a.bgOwn, color: a.color, contrast: a.contrast, borderColor: a.borderColor }, afterRelease: { bgEff: after.bgEff, pressed: ex.pressed, state: ex.state } };
  }
  return out;
}
async function capture(p, name) {
  await p.mouse.move(2, 2); await sleep(500);
  const rest = await p.evaluate(measureSites, [BUTTONS, FIELDS]);
  const ex = await p.evaluate(extra, [...BUTTONS, ...FIELDS]);
  const raw = await p.evaluate(rawBoxes, [...BUTTONS, ...FIELDS]);
  await p.screenshot({ path: path.join(SHD, `surf-${W}-${ATT}-${name}.png`) });
  const ha = await hoverActive(p, BUTTONS);
  return { rest, extra: ex, raw, ha };
}
async function prepS3(p) {
  await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(150);
  await p.click('[data-testid=arrangement-envelope-toggle]'); await sleep(150);
  await p.fill('[data-testid=arrangement-tempo-input]', '120'); await p.press('[data-testid=arrangement-tempo-input]', 'Enter'); await sleep(250);
  await p.click('[data-testid=arrangement-metronome-toggle]'); await sleep(150);
  await p.click('button[aria-label="Master Mute"]'); await sleep(150);
}
async function crops(p, name) {
  const regions = { marker: ['arrangement-marker-add', 'arrangement-marker-next'], metronome: ['arrangement-metronome-toggle', 'arrangement-metronome-toggle'], master: ['MASTER-MUTE', 'arrangement-master-peak'], snapenv: ['arrangement-snap-toggle', 'arrangement-waveform-zoom'] };
  const out = {};
  for (const [k, [a, b]] of Object.entries(regions)) { const ba = await p.locator(sel(a)).first().boundingBox(); const bb = await p.locator(sel(b)).first().boundingBox(); const x = Math.min(ba.x, bb.x) - 6, y = Math.min(ba.y, bb.y) - 6; const clip = { x, y, width: Math.max(ba.x + ba.width, bb.x + bb.width) - x + 6, height: Math.max(ba.y + ba.height, bb.y + bb.height) - y + 6 }; const f = path.join(SHD, `crop4x-${W}-${ATT}-${name}-${k}.png`); await p.screenshot({ path: f, clip }); out[k] = path.relative(L.ROOT, f); }
  return out;
}
(async () => {
  const b = await L.launch(); const net = []; const res = { W, attempt: ATT, utc: new Date().toISOString() };
  // main context: S0, S3, S5
  { const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c167surf-${W}-${ATT}`, net);
    res.fonts = log.fontsReady; res.fontBad = log.fontResp.filter((r) => r.s !== 200).length + log.fontFail.length;
    await p.mouse.move(2, 2); await sleep(300);
    res.S0 = await capture(p, 'S0');
    await prepS3(p); res.S3prepStatus = await L.status(p);
    res.S3 = await capture(p, 'S3');
    // S5 marker name editor open
    await L.blur(p); await p.keyboard.press('m'); await sleep(500);
    res.S5 = await p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-marker-name-input]'); if (!e) return null; const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return { radius: cs.borderTopLeftRadius, radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius], borderColor: cs.borderTopColor, borderWidth: cs.borderTopWidth, box: [r.x, r.y, r.width, r.height], focused: document.activeElement === e, cls: e.className }; });
    await p.screenshot({ path: path.join(SHD, `surf-${W}-${ATT}-S5.png`) });
    await p.keyboard.press('Escape'); await sleep(300);
    await ctx.close(); }
  // reduced motion context
  { const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `c167rm-${W}-${ATT}`, net, { reducedMotion: 'reduce' });
    res.reducedMotion = { matches: await p.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), S0: await p.evaluate(extra, BUTTONS) };
    await prepS3(p); res.reducedMotion.S3 = await p.evaluate(extra, BUTTONS);
    await ctx.close(); }
  // 4x crops context (layout identical; DPR 4 only)
  { const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `c167crop-${W}-${ATT}`, net, { deviceScaleFactor: 4 });
    await p.mouse.move(2, 2); await sleep(500); res.crops = { S0: await crops(p, 'S0') };
    res.cropRawS0 = await p.evaluate(rawBoxes, [...BUTTONS, ...FIELDS]);
    await prepS3(p); await p.mouse.move(2, 2); await sleep(500); res.crops.S3 = await crops(p, 'S3');
    await ctx.close(); }
  res.net = X.netOk(net); res.netRaw = net.map((n) => ({ label: n.label, errors: n.errors, forbidden: n.forbidden, auth: n.authHeaders, hyd: n.hydration, noise: n.noise, fontBad: n.fontResp.filter((r) => r.s !== 200).length + n.fontFail.length }));
  await b.close();
  fs.writeFileSync(path.join(OUTD, `surf-${W}-${ATT}.json`), JSON.stringify(res, null, 1));
  console.log('done', W, ATT, JSON.stringify(res.net));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
