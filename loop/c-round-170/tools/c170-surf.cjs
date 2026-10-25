// C round 170 — SURF-V3C4C2 / BOX-V3C4C2 / CONTRAST-V3C4C2. No DOM swap: measures the shipped classes.
// node c170-surf.cjs <1440|1280> <attempt> [reduce|crops]
// SITES, measureSites and D0-D2 recipes from b-round-169/v3c4c2-probe.cjs (D1 picks the music clip at 1 s explicitly);
// hover/active with a real mouse (button released off-target, so no click fires), per c-round-169/tools/c169-surf.cjs.
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1'; const REDUCE = process.argv[4] === 'reduce'; const CROPS = process.argv[4] === 'crops';
const OUTD = path.join(L.ROOT, 'out', 'surf'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'surf'); fs.mkdirSync(SHD, { recursive: true });
const SITES = {
  'detail-apply': ['[data-testid=arrangement-detail-apply]', 'surf'],
  'detail-reset': ['[data-testid=arrangement-detail-clip-gain-reset]', 'surf'],
  'detail-toggle': ['[data-testid=arrangement-detail-toggle]', 'surf'],
  'detail-start': ['[data-testid=arrangement-detail-start]', 'radius'],
  'detail-end': ['[data-testid=arrangement-detail-end]', 'radius'],
  'detail-gain-input': ['[data-testid=arrangement-detail-clip-gain-input]', 'radius'],
  'detail-fader': ['[data-testid=arrangement-detail-clip-gain-fader]', 'none'],
};
const measureSites = (sites) => {
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true }); const parse = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = 'rgba(0,0,0,0)'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const over = (top, bottom) => { const a = top[3] + bottom[3] * (1 - top[3]); if (a === 0) return [0, 0, 0, 0]; return [0, 1, 2].map((i) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a).concat([a]); };
  const effBg = (e) => { const chain = []; for (let n = e; n; n = n.parentElement) chain.push(parse(getComputedStyle(n).backgroundColor)); let acc = [0, 0, 0, 1]; for (let i = chain.length - 1; i >= 0; i--) acc = over(chain[i], acc); return acc; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2); };
  const res = {};
  for (const [id, [sel]] of Object.entries(sites)) {
    const e = document.querySelector(sel); if (!e) { res[id] = { present: false }; continue; }
    const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
    const bg = effBg(e); const parentBg = e.parentElement ? effBg(e.parentElement) : bg; let fg = parse(cs.color); const op = +cs.opacity; fg = over([...fg.slice(0, 3), fg[3] * op], bg);
    const rawBg = parse(cs.backgroundColor);
    res[id] = { present: true, disabled: e.disabled === true, expanded: e.getAttribute('aria-expanded'), box: [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)], radius: cs.borderTopLeftRadius, radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].join(' '), borderColor: cs.borderTopColor, borderColors: [cs.borderTopColor, cs.borderRightColor, cs.borderBottomColor, cs.borderLeftColor].join(' | '), borderWidth: cs.borderTopWidth, tProp: cs.transitionProperty, tDur: cs.transitionDuration, tFn: cs.transitionTimingFunction, rawBg: rawBg.map((v, i) => (i < 3 ? v : +v.toFixed(3))), bgEff: bg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), parentBgEff: parentBg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), fillVsParent: ratio(bg, parentBg), color: cs.color, fgEff: fg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), contrast: ratio(fg, bg), opacity: op, text: (e.tagName === 'INPUT' ? e.value : (e.textContent || '').trim()).slice(0, 20), cls: typeof e.className === 'string' ? e.className : '', focused: document.activeElement === e };
  }
  return res;
};
const brand = () => { const d = document.createElement('div'); d.className = 'text-brand'; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); const w = document.createElement('div'); w.className = 'border-warning border'; document.body.appendChild(w); const wc = getComputedStyle(w).borderTopColor; w.remove(); return { brand: c, warning: wc }; };
const musicClipAt1 = (p) => p.evaluate(() => { const c = [...document.querySelectorAll('[data-track-id=music] [data-clip-id]')].map((e) => ({ id: e.getAttribute('data-clip-id'), start: +e.getAttribute('data-clip-start') })); return { all: c, pick: (c.find((x) => Math.abs(x.start - 1) < 0.01) || {}).id || null }; });
async function d1(p, st) {
  await X.openDetail(p);
  st.add = await L.addAt(p, 'demo-middle-east', 'music', 1); await sleep(800);
  st.clips = await musicClipAt1(p);
  await L.selectClip(p, st.clips.pick); await L.blur(p);
  st.detail = (await X.clipInfoSel(p));
}
const states = [
  ['D0-none-open', async (p, st) => { st.toggleWas = await X.openDetail(p); }],
  ['D1-clip-open', d1],
  ['D2-collapsed', async (p, st) => { const t = p.locator('[data-testid=arrangement-detail-toggle]'); st.toggleWas = await t.getAttribute('aria-expanded'); if (st.toggleWas === 'true') { await t.click(); await sleep(700); } await L.blur(p); }],
];
async function m1(p, id) { const r = await p.evaluate(measureSites, { [id]: SITES[id] }); return r[id]; }
const pick = (m) => m && { bgEff: m.bgEff, rawBg: m.rawBg, borderColor: m.borderColor, color: m.color, contrast: m.contrast, text: m.text, expanded: m.expanded, disabled: m.disabled };
async function hoverActive(p, id, hoverOnly = false) {
  const loc = p.locator(SITES[id][0]).first(); if (!(await loc.count()) || !(await loc.isVisible())) return null;
  const bb = await loc.boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
  const hit = await p.evaluate(({ x, y, s }) => { const t = document.elementFromPoint(x, y); const e = document.querySelector(s); return !!(t && e && (t === e || e.contains(t))); }, { x, y, s: SITES[id][0] });
  await p.mouse.move(x, y, { steps: 3 }); await sleep(450);
  const hover = await m1(p, id);
  if (hoverOnly) { await p.mouse.move(2, 2, { steps: 3 }); await sleep(450); return { hit, hover: pick(hover) }; }
  await p.mouse.down(); await sleep(450);
  const active = await m1(p, id);
  await p.mouse.move(2, 2, { steps: 3 }); await p.mouse.up(); await sleep(450);
  const after = await m1(p, id);
  return { hit, hover: pick(hover), active: pick(active), afterRelease: pick(after) };
}
async function typeField(p, sel, v, enter) { await p.click(sel, { clickCount: 3 }); await p.keyboard.press('Control+a'); await p.keyboard.type(v, { delay: 30 }); if (enter) await p.keyboard.press('Enter'); await sleep(450); }
(async () => {
  const b = await L.launch(); const res = { W, attempt: ATT, reduce: REDUCE, crops: CROPS, utc: new Date().toISOString(), states: {} }; const net = [];
  for (const [name, prep] of states) {
    const opts = REDUCE ? { reducedMotion: 'reduce' } : CROPS ? { deviceScaleFactor: 4 } : {};
    const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c170surf-${W}-${name}-${ATT}${REDUCE ? '-rm' : CROPS ? '-crops' : ''}`, net, opts);
    const st = { fonts: log.fontsReady };
    if (name === 'D0-none-open') res.tokens = await p.evaluate(brand);
    await p.mouse.move(2, 2); await sleep(300); await prep(p, st); await p.mouse.move(2, 2); await sleep(500);
    st.rest = await p.evaluate(measureSites, SITES);
    const crop = async (sel, tag, pad = 6) => { const l = p.locator(sel).first(); if (!(await l.count()) || !(await l.isVisible())) return null; const bb = await l.boundingBox(); const f = path.join(SHD, `crop4x-${W}-${name}-${tag}-${ATT}.png`); await p.screenshot({ path: f, clip: { x: Math.max(0, bb.x - pad), y: Math.max(0, bb.y - pad), width: bb.width + 2 * pad, height: bb.height + 2 * pad } }); return path.relative(L.ROOT, f); };
    if (CROPS) {
      st.crops = {}; st.dpr = await p.evaluate(() => devicePixelRatio);
      for (const id of ['detail-apply', 'detail-reset', 'detail-toggle', 'detail-start', 'detail-gain-input']) {
        if (name === 'D2-collapsed' && id !== 'detail-toggle') continue;
        st.crops[`${id}-rest`] = await crop(SITES[id][0], `${id}-rest`);
        if (name === 'D1-clip-open' && SITES[id][1] === 'surf') { const bb = await p.locator(SITES[id][0]).boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 3 }); await sleep(450); st.crops[`${id}-hover`] = await crop(SITES[id][0], `${id}-hover`); await p.mouse.move(2, 2); await sleep(450); }
      }
      if (name === 'D1-clip-open') { st.crops.fieldsRow = await crop('[data-testid=arrangement-detail-start] >> xpath=../..', 'fields-row', 4); await typeField(p, SITES['detail-gain-input'][0], '-6', true); await L.blur(p); await p.mouse.move(2, 2); await sleep(400); st.crops['detail-reset-enabled-rest'] = await crop(SITES['detail-reset'][0], 'detail-reset-enabled-rest'); const bb = await p.locator(SITES['detail-reset'][0]).boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 3 }); await sleep(450); st.crops['detail-reset-enabled-hover'] = await crop(SITES['detail-reset'][0], 'detail-reset-enabled-hover'); await p.mouse.move(2, 2); await sleep(300); await typeField(p, SITES['detail-gain-input'][0], '3', false); st.crops['gain-pending'] = await crop(SITES['detail-gain-input'][0], 'gain-pending'); }
    } else if (REDUCE) {
      if (name === 'D1-clip-open') { await typeField(p, SITES['detail-gain-input'][0], '-6', true); await L.blur(p); await p.mouse.move(2, 2); await sleep(400); st.resetEnabled = await m1(p, 'detail-reset'); }
    } else {
      st.shot = path.relative(L.ROOT, path.join(SHD, `surf-${W}-${name}-${ATT}.png`)); await p.screenshot({ path: path.join(L.ROOT, st.shot) });
      st.ha = {};
      if (name === 'D0-none-open') { st.ha['detail-apply-disabled'] = await hoverActive(p, 'detail-apply', true); st.ha['detail-reset-disabled'] = await hoverActive(p, 'detail-reset', true); st.ha['detail-toggle'] = await hoverActive(p, 'detail-toggle'); }
      if (name === 'D2-collapsed') st.ha['detail-toggle'] = await hoverActive(p, 'detail-toggle');
      if (name === 'D1-clip-open') {
        st.ha['detail-apply'] = await hoverActive(p, 'detail-apply');
        st.ha['detail-reset-disabled'] = await hoverActive(p, 'detail-reset', true);
        st.ha['detail-toggle'] = await hoverActive(p, 'detail-toggle');
        st.restAfterHA = await p.evaluate(measureSites, SITES);
        await typeField(p, SITES['detail-gain-input'][0], '-6', true); await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
        st.gainAfterMinus6 = await m1(p, 'detail-gain-input');
        st.resetEnabled = await m1(p, 'detail-reset');
        st.ha['detail-reset'] = await hoverActive(p, 'detail-reset');
        st.gainAfterResetHA = (await m1(p, 'detail-gain-input')).text;
        st.shotReset = path.relative(L.ROOT, path.join(SHD, `surf-${W}-${name}-reset-enabled-${ATT}.png`)); await p.screenshot({ path: path.join(L.ROOT, st.shotReset) });
        await typeField(p, SITES['detail-gain-input'][0], '3', false);
        st.pending = await m1(p, 'detail-gain-input');
        st.pendingMarker = await p.locator('[data-testid=arrangement-detail-clip-gain-pending]').count();
        st.shotPending = path.relative(L.ROOT, path.join(SHD, `surf-${W}-${name}-pending-${ATT}.png`)); await p.screenshot({ path: path.join(L.ROOT, st.shotPending) });
      }
    }
    st.net = X.netOk([log]); st.fontBad = log.fontResp.filter((r) => r.s !== 200).length + log.fontFail.length;
    res.states[name] = st;
    console.log(W, name, 'fonts', JSON.stringify(st.fonts && st.fonts.ok), 'fontBad', st.fontBad, 'net', JSON.stringify(st.net), 'clips', JSON.stringify(st.clips || null));
    for (const [id, m] of Object.entries(st.rest)) { if (!m.present) { console.log('  ', id, 'absent'); continue; } console.log('  ', id, 'dis', m.disabled, 'box', JSON.stringify(m.box), 'r', m.radii, 'bc', m.borderColor, m.borderWidth, 'bg', JSON.stringify(m.bgEff), 'c', m.contrast, 'fvp', m.fillVsParent, 'tr', m.tProp, m.tDur, m.tFn, 'txt', m.text); }
    if (st.ha) for (const [id, h] of Object.entries(st.ha)) console.log('   HA', id, JSON.stringify(h));
    if (st.resetEnabled) console.log('   resetEnabled', JSON.stringify(pick(st.resetEnabled)), st.resetEnabled.tProp, st.resetEnabled.radius, st.resetEnabled.borderColor);
    if (st.pending) console.log('   pending', st.pending.borderColor, st.pending.radii, st.pending.contrast, 'marker', st.pendingMarker);
    await ctx.close();
  }
  res.netRaw = net.map((q) => ({ label: q.label, errors: q.errors, forbidden: q.forbidden, auth: q.authHeaders, hyd: q.hydration, noise: q.noise, fontBad: q.fontResp.filter((r) => r.s !== 200).length + q.fontFail.length }));
  res.net = X.netOk(net);
  await b.close();
  fs.writeFileSync(path.join(OUTD, `surf-${W}-${ATT}${REDUCE ? '-rm' : CROPS ? '-crops' : ''}.json`), JSON.stringify(res, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
