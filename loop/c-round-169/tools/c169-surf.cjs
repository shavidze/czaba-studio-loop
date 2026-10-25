// C round 169 — SURF-V3C4C1 / BOX-V3C4C1 / CONTRAST-V3C4C1. No DOM swap: measures the shipped classes.
// node c169-surf.cjs <1440|1280> <attempt> [reduce]
// State recipes P0..P3 and measureSites copied from b-round-168/v3c4c1-probe.cjs (unchanged logic), plus real-mouse hover/active and disabled states.
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1'; const REDUCE = process.argv[4] === 'reduce'; const CROPS = process.argv[4] === 'crops';
const OUTD = path.join(L.ROOT, 'out', 'surf'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'surf'); fs.mkdirSync(SHD, { recursive: true });
const SITES = {
  'lib-option-first': ['[data-testid=arrangement-library] [role=option]', 'radius'],
  'lib-option-selected': ['[data-testid=arrangement-library] [role=option][aria-selected=true]', 'radius'],
  'lib-option-unselected': ['[data-testid=arrangement-library] [role=option][aria-selected=false]', 'radius'],
  'lib-collapse': ['[data-testid=arrangement-library-collapse]', 'radius'],
  'lib-expand': ['[data-testid=arrangement-library-expand]', 'radius'],
  'lib-search': ['[data-testid=arrangement-library-search]', 'radius'],
  'lib-search-clear': ['[data-testid=arrangement-library-search-clear]', 'radius'],
  'preview-toggle': ['[data-testid=arrangement-library-preview-toggle]', 'toggle'],
  'preview-add': ['[data-testid=arrangement-library-preview] button:has(svg.lucide-plus)', 'radius'],
  'preview-wave': ['[data-testid=arrangement-library-preview-wave]', 'none'],
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
    res[id] = { present: true, disabled: e.disabled === true, selected: e.getAttribute('aria-selected'), box: [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)], radius: cs.borderTopLeftRadius, radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].join(' '), borderColor: cs.borderTopColor, borderWidth: cs.borderTopWidth, tProp: cs.transitionProperty, tDur: cs.transitionDuration, tFn: cs.transitionTimingFunction, rawBg: rawBg.map((v, i) => (i < 3 ? v : +v.toFixed(3))), bgEff: bg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), parentBgEff: parentBg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), fillVsParent: ratio(bg, parentBg), fgEff: fg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), contrast: ratio(fg, bg), opacity: op, text: (e.textContent || '').trim().slice(0, 20), cls: typeof e.className === 'string' ? e.className : '', focused: document.activeElement === e };
  }
  return res;
};
const selectReady = async (p) => {
  const opt = p.locator('[data-testid=arrangement-library] [role=option]').first();
  await opt.click(); await sleep(300);
  for (let i = 0; i < 40; i++) { if (await p.locator('[data-testid=arrangement-library-preview-toggle]:enabled').count()) break; await sleep(250); }
};
const states = [
  ['P0-default', async () => {}],
  ['P1-selected-query', async (p) => { await selectReady(p); await p.fill('[data-testid=arrangement-library-search]', 'a'); await sleep(400); }],
  ['P2-previewing', async (p) => { await selectReady(p); await p.click('[data-testid=arrangement-library-preview-toggle]'); await sleep(600); }],
  ['P3-collapsed', async (p) => { await p.click('[data-testid=arrangement-library-collapse]'); await sleep(500); }],
];
async function m1(p, id) { const r = await p.evaluate(measureSites, { [id]: SITES[id] }); return r[id]; }
// real mouse hover then held button (released off-target so no click fires)
async function hoverActive(p, id, hoverOnly = false) {
  const loc = p.locator(SITES[id][0]).first(); if (!(await loc.count()) || !(await loc.isVisible())) return null;
  const bb = await loc.boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
  const hit = await p.evaluate(({ x, y, s }) => { const t = document.elementFromPoint(x, y); return !!(t && t.closest(s)); }, { x, y, s: SITES[id][0] });
  await p.mouse.move(x, y, { steps: 3 }); await sleep(400);
  const hover = await m1(p, id);
  if (hoverOnly) { await p.mouse.move(2, 2, { steps: 3 }); await sleep(400); return { hit, hover: { bgEff: hover.bgEff, rawBg: hover.rawBg, borderColor: hover.borderColor, contrast: hover.contrast, text: hover.text } }; }
  await p.mouse.down(); await sleep(400);
  const active = await m1(p, id);
  await p.mouse.move(2, 2, { steps: 3 }); await p.mouse.up(); await sleep(400);
  const after = await m1(p, id);
  const pick = (m) => m && { bgEff: m.bgEff, rawBg: m.rawBg, borderColor: m.borderColor, contrast: m.contrast, text: m.text };
  return { hit, hover: pick(hover), active: pick(active), afterRelease: pick(after) };
}
(async () => {
  const b = await L.launch(); const res = { W, attempt: ATT, reduce: REDUCE, utc: new Date().toISOString(), states: {} }; const net = [];
  for (const [name, prep] of states) {
    const opts = REDUCE ? { reducedMotion: 'reduce' } : CROPS ? { deviceScaleFactor: 4 } : {};
    const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c169surf-${W}-${name}-${ATT}${REDUCE ? '-rm' : CROPS ? '-crops' : ''}`, net, opts);
    const st = { fonts: log.fontsReady && log.fontsReady.ok };
    await p.mouse.move(2, 2); await sleep(300); await prep(p); await p.mouse.move(2, 2); await sleep(500);
    st.rest = await p.evaluate(measureSites, SITES);
    if (CROPS) {
      const crop = async (sel, tag, pad = 6) => { const l = p.locator(sel).first(); if (!(await l.count())) return null; const bb = await l.boundingBox(); if (!bb) return null; const f = path.join(SHD, `crop4x-${W}-${name}-${tag}-${ATT}.png`); await p.screenshot({ path: f, clip: { x: Math.max(0, bb.x - pad), y: Math.max(0, bb.y - pad), width: bb.width + 2 * pad, height: bb.height + 2 * pad } }); return f; };
      st.crops = {};
      if (name === 'P1-selected-query') { st.crops.previewButtons = await crop('[data-testid=arrangement-library-preview] button:has(svg.lucide-plus) >> xpath=..', 'preview-buttons'); st.crops.search = await crop('[data-testid=arrangement-library-search] >> xpath=..', 'search-clear'); }
      if (name === 'P2-previewing') st.crops.previewButtons = await crop('[data-testid=arrangement-library-preview] button:has(svg.lucide-plus) >> xpath=..', 'preview-buttons');
      if (name === 'P0-default') st.crops.selectedOption = await crop('[data-testid=arrangement-library] [role=option][aria-selected=true]', 'selected-option');
      if (name === 'P3-collapsed') st.crops.expand = await crop('[data-testid=arrangement-library-expand]', 'expand');
      st.dpr = await p.evaluate(() => devicePixelRatio);
    } else if (!REDUCE) {
      st.shot = path.join(SHD, `surf-${W}-${name}-${ATT}.png`); await p.screenshot({ path: st.shot });
      st.ha = {};
      for (const id of ['preview-toggle', 'preview-add', 'lib-option-unselected', 'lib-collapse', 'lib-expand', 'lib-search-clear']) {
        if (name === 'P2-previewing' && id !== 'preview-toggle' && id !== 'preview-add') continue;
        st.ha[id] = await hoverActive(p, id, id === 'lib-option-unselected');
      }
      if (name === 'P1-selected-query') {
        // search focus border
        await p.focus('[data-testid=arrangement-library-search]'); await sleep(300); st.searchFocus = (await m1(p, 'lib-search')); await L.blur(p); await sleep(300);
      }
      if (name === 'P0-default') {
        // disabled Add: video lane active
        await p.click(L.nameSel('video')).catch((e) => { st.videoClickErr = String(e).slice(0, 200); }); await sleep(400); await p.mouse.move(2, 2); await sleep(300);
        st.disabledAdd = await m1(p, 'preview-add');
        const loc = p.locator(SITES['preview-add'][0]).first(); const bb = await loc.boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(400);
        st.disabledAddHover = await m1(p, 'preview-add'); await p.mouse.move(2, 2); await sleep(300);
        // disabled toggle: a not-ready source? record what exists
        st.toggleDisabledReachable = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-library] [role=option]')].map((o) => o.textContent.replace(/\s+/g, ' ').slice(0, 50)));
      }
    }
    if (REDUCE) { st.ha = {}; }
    st.net = X.netOk([log]);
    res.states[name] = st;
    console.log(W, name, 'fonts', st.fonts, 'net', JSON.stringify(st.net));
    for (const [id, m] of Object.entries(st.rest)) { if (!m.present) { console.log('  ', id, 'absent'); continue; } console.log('  ', id, 'dis', m.disabled, 'sel', m.selected, 'box', JSON.stringify(m.box), 'r', m.radii, 'bc', m.borderColor, m.borderWidth, 'bg', JSON.stringify(m.bgEff), 'c', m.contrast, 'fvp', m.fillVsParent, 'tr', m.tProp, m.tDur, m.tFn, 'ha', st.ha && st.ha[id] ? JSON.stringify([st.ha[id].hit, st.ha[id].hover && st.ha[id].hover.bgEff, st.ha[id].hover && st.ha[id].hover.contrast, st.ha[id].hover && st.ha[id].hover.borderColor, st.ha[id].active && st.ha[id].active.bgEff, st.ha[id].active && st.ha[id].active.contrast, st.ha[id].active && st.ha[id].active.borderColor]) : '-'); }
    await ctx.close();
  }
  res.netRaw = net.map((q) => ({ label: q.label, errors: q.errors, forbidden: q.forbidden, auth: q.authHeaders, hyd: q.hydration, noise: q.noise, fontBad: q.fontResp.filter((r) => r.s !== 200).length + q.fontFail.length }));
  res.net = X.netOk(net);
  await b.close();
  fs.writeFileSync(path.join(OUTD, `surf-${W}-${ATT}${REDUCE ? '-rm' : CROPS ? '-crops' : ''}.json`), JSON.stringify(res, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
