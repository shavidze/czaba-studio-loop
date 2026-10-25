// C round 171 — SURF/BOX/CONTRAST-V3C4C3. No DOM swap: measures the shipped classes.
// node c171-surf.cjs <1440|1280> <attempt> [reduce|crops]
// DLG/DOCK sites + measureSites copied verbatim from b-round-170/v3c4c3-probe.cjs; E0/E1/V0/V1 recipes from it.
// E2: 3 lanes x 4 copies of demo-middle-east (~406 s), real-mouse Export, poll Cancel every ~50 ms.
// hover/active with a real mouse; active = button held, released off-target (no click).
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1'; const MODE = process.argv[4] || 'normal';
const TAG = `${W}-${ATT}${MODE === 'normal' ? '' : '-' + MODE}`;
const OUTD = path.join(L.ROOT, 'out', 'surf'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'surf'); fs.mkdirSync(SHD, { recursive: true });
const DLG = {
  'exp-close': ['[role=dialog] button:text-is("Done")', 'surfsec'],
  'exp-cancel': ['[data-testid=arrangement-export-cancel]', 'surfsec'],
  'exp-primary': ['[role=dialog] .flex.justify-end > button:last-child', 'primary'],
  'card-wav': ['[role=dialog] label:has([data-testid=arrangement-export-format-wav])', 'radius'],
  'card-mp3': ['[role=dialog] label:has([data-testid=arrangement-export-format-mp3])', 'radius'],
  'card-both': ['[role=dialog] label:has([data-testid=arrangement-export-format-both])', 'radius'],
  'card-video': ['[role=dialog] label:has(input[type=radio][disabled][name=arrangement-export-format])', 'radius'],
  'card-project': ['[role=dialog] label:has([data-testid=arrangement-export-scope-project])', 'radius'],
  'card-range': ['[role=dialog] label:has([data-testid=arrangement-export-scope-range])', 'radius'],
};
const DOCK = {
  'dock-expand': ['[data-testid=arrangement-video-expand]', 'radius'],
  'dock-drag': ['[data-testid=arrangement-video-drag]', 'radius'],
  'dock-close': ['[data-testid=arrangement-video-close]', 'radius'],
  'dock-return': ['[data-testid=arrangement-video-placeholder-return]', 'radius'],
  'dock-box': ['[data-testid=arrangement-video-box]', 'none'],
  'dock-placeholder': ['[data-testid=arrangement-video-placeholder]', 'none'],
};
const measureSites = (sites) => {
  const q = (sel) => { if (sel.includes(':text-is(')) { const [base, txt] = sel.split(':text-is("'); const t = txt.replace('")', ''); return [...document.querySelectorAll(base)].find((e) => e.textContent.trim() === t) || null; } return document.querySelector(sel); };
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true }); const parse = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = 'rgba(0,0,0,0)'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const over = (top, bottom) => { const a = top[3] + bottom[3] * (1 - top[3]); if (a === 0) return [0, 0, 0, 0]; return [0, 1, 2].map((i) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a).concat([a]); };
  const effBg = (e) => { const chain = []; for (let n = e; n; n = n.parentElement) chain.push(parse(getComputedStyle(n).backgroundColor)); let acc = [0, 0, 0, 1]; for (let i = chain.length - 1; i >= 0; i--) acc = over(chain[i], acc); return acc; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2); };
  const res = {};
  for (const [id, [sel]] of Object.entries(sites)) {
    const e = q(sel); if (!e) { res[id] = { present: false }; continue; }
    const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
    const bg = effBg(e); const parentBg = e.parentElement ? effBg(e.parentElement) : bg; let fg = parse(cs.color); let op = 1; for (let n = e; n; n = n.parentElement) op *= +getComputedStyle(n).opacity; fg = over([...fg.slice(0, 3), fg[3] * op], bg);
    res[id] = { present: true, disabled: e.disabled === true, box: [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)], radius: cs.borderTopLeftRadius, borderColor: cs.borderTopColor, borderWidth: cs.borderTopWidth, transition: `${cs.transitionProperty} ${cs.transitionDuration}`, bgEff: bg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), parentBgEff: parentBg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), fillVsParent: ratio(bg, parentBg), contrast: ratio(fg, bg), opacity: +op.toFixed(3), color: cs.color, text: (e.textContent || '').trim().slice(0, 24), cls: typeof e.className === 'string' ? e.className : '' };
  }
  return res;
};

const brand = () => { const d = document.createElement('div'); d.className = 'text-brand'; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return { brand: c }; };
const extra = (ids) => { const out = {}; const q = (sel) => { if (sel.includes(':text-is(')) { const [base, txt] = sel.split(':text-is("'); const t = txt.replace('")', ''); return [...document.querySelectorAll(base)].find((e) => e.textContent.trim() === t) || null; } return document.querySelector(sel); }; for (const [id, sel] of Object.entries(ids)) { const e = q(sel); if (!e) continue; const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); out[id] = { box: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(3)), radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].join(' '), borderColors: [cs.borderTopColor, cs.borderRightColor, cs.borderBottomColor, cs.borderLeftColor].join(' | '), tProp: cs.transitionProperty, tDur: cs.transitionDuration, tFn: cs.transitionTimingFunction, rawBg: cs.backgroundColor, opacity: cs.opacity, color: cs.color }; } return out; };
const sel = (id) => (DLG[id] || DOCK[id])[0];
const loc = (p, id) => (id === 'exp-close' ? p.locator('[role=dialog] button', { hasText: /^Done$/ }).last() : p.locator(sel(id)).first());
async function m1(p, id) { const r = await p.evaluate(measureSites, { [id]: DLG[id] || DOCK[id] }); return r[id]; }
async function hoverSeries(p, id) { const l = loc(p, id); const bb = await l.boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 2 }); const S = []; const t0 = Date.now(); while (Date.now() - t0 < 1200) { const r = await l.evaluate((e) => ({ hover: e.matches(':hover'), bg: getComputedStyle(e).backgroundColor, present: e.isConnected, box: (() => { const r = e.getBoundingClientRect(); return [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2)]; })(), exp: (() => { const b = document.querySelector('[role=dialog] .flex.justify-end > button:last-child'); const r = b.getBoundingClientRect(); return [+r.x.toFixed(2), +r.width.toFixed(2), b.textContent.trim()]; })(), lbl: (document.querySelector('[data-testid=arrangement-export-progress-label]') || {}).textContent || null })).catch(() => null); if (!r) break; S.push({ ms: Date.now() - t0, ...r }); await sleep(100); } await p.mouse.move(2, 2); return S; }
const pick = (m) => m && m.present && { bgEff: m.bgEff, color: m.color, contrast: m.contrast, borderColor: m.borderColor, disabled: m.disabled, text: m.text };
async function hoverActive(p, id, { hoverMs = 400, active = true } = {}) {
  const l = loc(p, id); if (!(await l.count()) || !(await l.isVisible())) return null;
  const bb = await l.boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
  const hit = await l.evaluate((e, [x, y]) => { const t = document.elementFromPoint(x, y); return !!(t && (t === e || e.contains(t))); }, [x, y]);
  await p.mouse.move(x, y, { steps: 2 }); await sleep(hoverMs);
  const hover = await m1(p, id);
  if (!active) { await p.mouse.move(2, 2, { steps: 2 }); await sleep(hoverMs); return { hit, hover: pick(hover) }; }
  await p.mouse.down(); await sleep(hoverMs);
  const act = await m1(p, id);
  const off = await p.evaluate(() => { const t = document.querySelector('#arrangement-export-title'); if (!t) return [2, 2]; const r = t.getBoundingClientRect(); return [r.x + 4, r.y + r.height / 2]; });
  await p.mouse.move(off[0], off[1], { steps: 2 }); await p.mouse.up(); await sleep(hoverMs);
  const after = await m1(p, id);
  return { hit, hover: pick(hover), active: pick(act), afterRelease: pick(after) };
}
const openDialog = async (p) => { await L.blur(p); await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title', { timeout: 10000 }); await sleep(600); };
async function longProject(p, st) { st.adds = []; for (const ln of ['music', 'stems', 'sfx']) { st.adds.push((await L.addAt(p, 'demo-middle-east', ln, 1)).status); const cs = (await L.clipsDom(p)).filter((c) => c.lane === ln); await L.selectClip(p, cs[0].id); await L.blur(p); for (let i = 0; i < 6; i++) { await p.keyboard.press('Control+d'); await sleep(400); } } await p.keyboard.press('Escape'); await sleep(300); st.clips = (await L.clipsDom(p)).map((c) => [c.lane, c.start, c.wdur]); }
const states = [
  ['E0-empty-dialog', DLG, async (p) => { await openDialog(p); }],
  ['E1-clip-dialog', DLG, async (p, st) => { st.add = (await L.addAt(p, 'demo-middle-east', 'music', 1)).status; await sleep(800); await openDialog(p); }],
  ['E2-rendering', DLG, async (p, st) => { await longProject(p, st); await openDialog(p); }],
  ['V0-dock-video', DOCK, async (p) => { await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); await L.blur(p); }],
  ['V1-dock-floating', DOCK, async (p) => { await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); await p.locator('[data-testid=arrangement-video-expand]').click(); await sleep(900); await L.blur(p); }],
];
const EXTRA = { 'exp-close': '[role=dialog] button:text-is("Done")', 'exp-cancel': '[data-testid=arrangement-export-cancel]', 'exp-primary': '[role=dialog] .flex.justify-end > button:last-child' };
(async () => {
  const b = await L.launch(); const res = { W, attempt: ATT, mode: MODE, utc: new Date().toISOString(), states: {} }; const net = [];
  for (const [name, sites, prep] of states) {
    if (MODE === 'reduce' && name.startsWith('V')) continue;
    const opts = MODE === 'reduce' ? { reducedMotion: 'reduce' } : MODE === 'crops' ? { deviceScaleFactor: 4 } : {};
    const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c171surf-${W}-${name}-${ATT}${MODE === 'normal' ? '' : '-' + MODE}`, net, opts);
    const st = { fonts: log.fontsReady };
    if (name === 'E0-empty-dialog') res.tokens = await p.evaluate(brand);
    await p.mouse.move(2, 2); await sleep(300); await prep(p, st); await p.mouse.move(2, 2); await sleep(500);
    const crop = async (s, tag, pad = 8, l2 = null) => { const l = l2 || p.locator(s).first(); if (!(await l.count()) || !(await l.isVisible())) return null; const bb = await l.boundingBox(); const f = path.join(SHD, `crop4x-${W}-${name}-${tag}-${ATT}.png`); await p.screenshot({ path: f, clip: { x: Math.max(0, bb.x - pad), y: Math.max(0, bb.y - pad), width: bb.width + 2 * pad, height: bb.height + 2 * pad } }); return path.relative(L.ROOT, f); };
    if (name === 'E2-rendering') {
      st.preRender = await p.evaluate(measureSites, sites); st.preExtra = await p.evaluate(extra, EXTRA);
      const eb = await loc(p, 'exp-primary').boundingBox(); const ex = eb.x + eb.width / 2, ey = eb.y + eb.height / 2;
      st.exportHit = await p.evaluate(([x, y]) => { const t = document.elementFromPoint(x, y); return t ? (t.closest('button') || t).textContent.trim() : null; }, [ex, ey]);
      const dl0 = log.downloads.length; await p.mouse.click(ex, ey); const t0 = Date.now();
      let seen = false; while (Date.now() - t0 < 20000) { if (await p.locator(sel('exp-cancel')).count()) { seen = true; break; } await sleep(50); }
      st.cancelCaughtMs = seen ? Date.now() - t0 : null;
      if (seen) {
        st.rest = await p.evaluate(measureSites, sites); st.restExtra = await p.evaluate(extra, EXTRA);
        st.label = await p.evaluate(() => (document.querySelector('[data-testid=arrangement-export-progress-label]') || {}).textContent || null);
        if (MODE === 'crops') { st.crops = { cancel: await crop(sel('exp-cancel'), 'cancel-rest'), footer: await crop('[data-testid=arrangement-export-footer]', 'footer-rendering', 4) }; const cb = await loc(p, 'exp-cancel').boundingBox(); await p.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2, { steps: 2 }); await sleep(250); st.crops.cancelHover = await crop(sel('exp-cancel'), 'cancel-hover'); await p.mouse.move(2, 2); }
        else if (MODE === 'normal') { st.hoverSeries = await hoverSeries(p, 'exp-cancel'); st.stillRendering1 = (await p.locator(sel('exp-cancel')).count()) > 0; st.ha = { 'exp-cancel': (await p.locator(sel('exp-cancel')).count()) ? await hoverActive(p, 'exp-cancel', { hoverMs: 230 }) : null }; st.stillRenderingAfterHA = (await p.locator(sel('exp-cancel')).count()) > 0; await p.screenshot({ path: path.join(SHD, `surf-${TAG}-E2.png`) }); }
      }
      const t1 = Date.now(); while (Date.now() - t1 < 60000 && !(log.downloads.length > dl0 && log.downloads.slice(dl0).every((d) => d.file || d.err))) await sleep(200);
      await sleep(800); st.downloads = log.downloads.slice(dl0).map((d) => [d.name, d.size]); st.afterRender = await p.evaluate(measureSites, sites);
    } else {
      st.rest = await p.evaluate(measureSites, sites); st.restExtra = await p.evaluate(extra, name.startsWith('E') ? EXTRA : { 'dock-expand': sel('dock-expand'), 'dock-drag': sel('dock-drag'), 'dock-close': sel('dock-close'), 'dock-return': sel('dock-return') });
      if (name.startsWith('V')) st.video = await p.evaluate(() => [...document.querySelectorAll('video')].map((v) => ({ role: v.dataset.videoRole, rs: v.readyState, w: v.videoWidth, ct: v.currentTime, vis: v.getBoundingClientRect().width })));
      if (MODE === 'crops') {
        st.crops = {}; st.dpr = await p.evaluate(() => devicePixelRatio);
        if (name === 'E1-clip-dialog') {
          st.crops.footerRest = await crop('[data-testid=arrangement-export-footer]', 'footer-rest', 4);
          for (const id of ['exp-close', 'exp-primary']) { st.crops[`${id}-rest`] = await crop(null, `${id}-rest`, 8, loc(p, id)); const bb = await loc(p, id).boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 2 }); await sleep(450); st.crops[`${id}-hover`] = await crop(null, `${id}-hover`, 8, loc(p, id)); await p.mouse.move(2, 2); await sleep(450); }
          await loc(p, 'exp-primary').focus(); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await sleep(300); st.focusVisible = await loc(p, 'exp-primary').evaluate((e) => ({ fv: e.matches(':focus-visible'), shadow: getComputedStyle(e).boxShadow })); st.crops['exp-primary-focus'] = await crop(null, 'exp-primary-focus', 8, loc(p, 'exp-primary'));
          await L.blur(p);
          st.crops.cards = await crop('[role=dialog] fieldset', 'cards-format', 4); st.crops.scope = await crop('[role=dialog] fieldset >> nth=1', 'cards-scope', 4);
        }
        if (name === 'E0-empty-dialog') st.crops.footerDisabled = await crop('[data-testid=arrangement-export-footer]', 'footer-empty', 4);
        if (name.startsWith('V')) { for (const id of ['dock-expand', 'dock-drag', 'dock-close', 'dock-return']) st.crops[id] = await crop(sel(id), id, 6); if (name === 'V1-dock-floating') { st.crops.box = await crop(sel('dock-box'), 'video-box', 4); const bb = await p.locator(sel('dock-close')).boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 2 }); await sleep(450); st.crops.boxCloseHover = await crop(sel('dock-box'), 'video-box-close-hover', 4); await p.mouse.move(2, 2); } }
      } else if (MODE === 'normal') {
        await p.screenshot({ path: path.join(SHD, `surf-${TAG}-${name}.png`) });
        st.ha = {};
        if (name === 'E1-clip-dialog') { st.ha['exp-close'] = await hoverActive(p, 'exp-close'); st.ha['exp-primary'] = await hoverActive(p, 'exp-primary'); st.ha['card-mp3'] = await hoverActive(p, 'card-mp3', { active: false }); }
        if (name === 'E0-empty-dialog') { st.ha['exp-close'] = await hoverActive(p, 'exp-close', { active: false }); st.ha['exp-primary-disabled'] = await hoverActive(p, 'exp-primary', { active: false }); }
        if (name.startsWith('V')) for (const id of ['dock-expand', 'dock-drag', 'dock-close', 'dock-return']) st.ha[id] = await hoverActive(p, id, { active: false });
        st.restAfterHA = await p.evaluate(measureSites, sites);
      }
    }
    st.net = X.netOk([log]); st.fontBad = log.fontResp.filter((r) => r.s !== 200).length + log.fontFail.length;
    res.states[name] = st;
    console.log(W, name, MODE, 'fonts', JSON.stringify(st.fonts && st.fonts.ok), 'fontBad', st.fontBad, 'net', JSON.stringify(st.net), 'cancelCaughtMs', st.cancelCaughtMs, 'label', st.label || '', 'dl', JSON.stringify(st.downloads || null));
    for (const [id, m] of Object.entries(st.rest || {})) { if (!m.present) { console.log('  ', id, 'absent'); continue; } const e = (st.restExtra || {})[id] || {}; console.log('  ', id, 'dis', m.disabled, 'box', JSON.stringify(m.box), 'r', e.radii || m.radius, 'bc', m.borderColor, m.borderWidth, 'bg', JSON.stringify(m.bgEff), 'c', m.contrast, 'fvp', m.fillVsParent, 'op', m.opacity, 'tr', e.tProp, e.tDur, e.tFn, 'txt', m.text); }
    if (st.hoverSeries) console.log('   hoverSeries', JSON.stringify(st.hoverSeries));
    if (st.ha) for (const [id, h] of Object.entries(st.ha)) console.log('   HA', id, JSON.stringify(h));
    if (st.crops) console.log('   crops', JSON.stringify(st.crops), JSON.stringify(st.focusVisible || null));
    if (st.video) console.log('   video', JSON.stringify(st.video));
    await ctx.close();
  }
  res.netRaw = net.map((q) => ({ label: q.label, errors: q.errors, forbidden: q.forbidden, auth: q.authHeaders, hyd: q.hydration, noise: q.noise, fontBad: q.fontResp.filter((r) => r.s !== 200).length + q.fontFail.length }));
  res.net = X.netOk(net);
  await b.close();
  fs.writeFileSync(path.join(OUTD, `surf-${TAG}.json`), JSON.stringify(res, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
