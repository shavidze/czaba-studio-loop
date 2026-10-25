// C round 168 — SURF-V3C4B / BOX-V3C4B / CONTRAST-V3C4B. node c168-surf.cjs <1440|1280> <attempt>
// SITES, measureSites (canvas colour parse) and S0–S4 recipes copied from b-round-167/v3c4b-probe.cjs; no class swap (the code is live now).
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'surf'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'surf'); fs.mkdirSync(SHD, { recursive: true });
const SITES = {
  'lane-music-mute': ['[data-track-id=music] [data-testid=arrangement-track-header] button[title=Mute]', 'mix'],
  'lane-music-solo': ['[data-track-id=music] [data-testid=arrangement-track-header] button[title^=Solo]', 'mix'],
  'lane-sfx-mute': ['[data-track-id=sfx] [data-testid=arrangement-track-header] button[title=Mute]', 'mix'],
  'lane-music-fold': ['[data-track-id=music] [data-testid=arrangement-track-fold]', 'radius'],
  'lane-music-name': ['[data-track-id=music] [data-testid=arrangement-track-header] button[aria-pressed]:not([title])', 'radius'],
  'lane-music-pan-reset': ['[data-track-id=music] [data-testid=arrangement-track-pan-reset]', 'radius'],
  'video-import': ['[data-track-id=video] [data-testid=arrangement-track-header] button:has(svg.lucide-plus)', 'import'],
  'group-mute': ['[data-testid=arrangement-group-mute]', 'mix'],
  'group-solo': ['[data-testid=arrangement-group-solo]', 'mix'],
  'group-fold': ['[data-testid=arrangement-group-fold]', 'radius'],
  'group-name': ['[data-testid=arrangement-group-name]', 'radius'],
  'group-name-input': ['[data-testid=arrangement-group-name-input]', 'radius'],
};
const HOVER_SITES = ['lane-music-mute', 'lane-music-solo', 'lane-sfx-mute', 'video-import', 'group-mute', 'group-solo'];
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
    res[id] = { present: true, disabled: e.disabled === true, pressed: e.getAttribute('aria-pressed'), expanded: e.getAttribute('aria-expanded'), dmute: e.getAttribute('data-mute'), dsolo: e.getAttribute('data-solo'), box: [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)], raw: [r.x, r.y, r.width, r.height], radius: cs.borderTopLeftRadius, radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].join(' '), borderColor: cs.borderTopColor, borderColorParsed: parse(cs.borderTopColor), borderWidth: cs.borderTopWidth, bgOwn: cs.backgroundColor, bgOwnParsed: parse(cs.backgroundColor), bgImage: cs.backgroundImage.slice(0, 160), bgEff: bg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), parentBgEff: parentBg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), fillVsParent: ratio(bg, parentBg), color: cs.color, fgEff: fg.map((v, i) => (i < 3 ? Math.round(v) : +v.toFixed(3))), contrast: ratio(fg, bg), tp: cs.transitionProperty, td: cs.transitionDuration, tf: cs.transitionTimingFunction, cls: e.className };
  }
  return res;
};
// pixel sample in-page from a PNG (base64) via canvas
const pixelAt = async ([b64, x, y]) => { const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(Math.round(x), Math.round(y), 1, 1).data; return [d[0], d[1], d[2], d[3]]; };
const ratioOf = (a, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; const lum = (c) => 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); const l1 = lum(a), l2 = lum(b); return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2); };
async function samplePx(p, sel, fx, fy) { const bb = await p.locator(sel).first().boundingBox(); const buf = await p.screenshot(); const x = bb.x + bb.width * fx, y = bb.y + bb.height * fy; return { at: [+x.toFixed(1), +y.toFixed(1)], rgba: await p.evaluate(pixelAt, [buf.toString('base64'), x, y]) }; }
async function hoverActive(p, ids) {
  const out = {};
  for (const id of ids) {
    const s = SITES[id][0]; const loc = p.locator(s).first(); if (!(await loc.count())) continue;
    const bb = await loc.boundingBox(); const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
    const hit = await p.evaluate(({ x, y, s }) => { const t = document.elementFromPoint(x, y); return !!(t && t.closest(s)); }, { x: cx, y: cy, s });
    await p.mouse.move(cx, cy, { steps: 3 }); await sleep(450);
    const h = (await p.evaluate(measureSites, { [id]: SITES[id] }))[id];
    let hpx = null; if (id === 'group-solo') hpx = await samplePx(p, s, 0.88, 0.2);
    await p.mouse.down(); await sleep(450);
    const a = (await p.evaluate(measureSites, { [id]: SITES[id] }))[id];
    await p.mouse.move(2, 2, { steps: 3 }); await sleep(100); await p.mouse.up(); await sleep(450);
    const after = (await p.evaluate(measureSites, { [id]: SITES[id] }))[id];
    const pick = (m) => ({ bgOwn: m.bgOwn, bgEff: m.bgEff, bgImage: m.bgImage, color: m.color, contrast: m.contrast, borderColor: m.borderColor });
    out[id] = { hit, hover: pick(h), hoverPx: hpx, active: pick(a), afterRelease: { bgEff: after.bgEff, pressed: after.pressed, dmute: after.dmute, dsolo: after.dsolo } };
  }
  return out;
}
const nameBtn = (id) => `[data-track-id=${id}] [data-testid=arrangement-track-header] button[aria-pressed]:not([title])`;
const makeGroup = async (p) => { await p.click(nameBtn('stems')); await sleep(150); await p.click(nameBtn('sfx'), { modifiers: ['Control'] }); await sleep(150); await p.keyboard.press('Control+g'); await sleep(400); };
const STATES = [
  ['S0-default', async () => {}],
  ['S1-on', async (p) => {
    await makeGroup(p);
    await p.click(SITES['lane-music-mute'][0]); await sleep(150);
    await p.click(SITES['lane-music-solo'][0]); await sleep(150);
    await p.click(SITES['group-mute'][0]); await sleep(150);
    await p.click('[data-track-id=video] [data-testid=arrangement-track-fold]'); await sleep(500);
  }],
  ['S2-group-solo-mixed', async (p) => {
    await makeGroup(p);
    const stSolo = '[data-track-id=stems] [data-testid=arrangement-track-header] button[title^=Solo]';
    if (await p.locator(stSolo).count()) { await p.click(stSolo); } await sleep(300);
  }],
  ['S3-group-solo-on', async (p) => { await makeGroup(p); await p.click(SITES['group-solo'][0]); await sleep(300); }],
  ['S4-group-rename', async (p) => { await makeGroup(p); await p.focus(SITES['group-name'][0]); await p.keyboard.press('F2'); await sleep(300); }],
];
async function crop(p, name, selA, selB) { const ba = await p.locator(selA).first().boundingBox(); const bb = await p.locator(selB).first().boundingBox(); if (!ba || !bb) return null; const x = Math.min(ba.x, bb.x) - 6, y = Math.min(ba.y, bb.y) - 6; const clip = { x, y, width: Math.max(ba.x + ba.width, bb.x + bb.width) - x + 6, height: Math.max(ba.y + ba.height, bb.y + bb.height) - y + 6 }; const f = path.join(SHD, `crop4x-${W}-${ATT}-${name}.png`); await p.screenshot({ path: f, clip }); return path.relative(L.ROOT, f); }
(async () => {
  const b = await L.launch(); const net = []; const res = { W, attempt: ATT, utc: new Date().toISOString(), states: {} };
  for (const [name, prep] of STATES) {
    const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c168surf-${W}-${ATT}-${name}`, net);
    const st = res.states[name] = { fonts: log.fontsReady && log.fontsReady.ok, fontBad: log.fontResp.filter((r) => r.s !== 200).length + log.fontFail.length };
    await p.mouse.move(2, 2); await sleep(300); await prep(p); await p.mouse.move(2, 2); await sleep(500);
    st.rest = await p.evaluate(measureSites, SITES);
    if (name === 'S2-group-solo-mixed') { st.restPxRight = await samplePx(p, SITES['group-solo'][0], 0.88, 0.2); st.restPxLeft = await samplePx(p, SITES['group-solo'][0], 0.12, 0.2); }
    await p.screenshot({ path: path.join(SHD, `surf-${W}-${ATT}-${name}.png`) });
    if (name !== 'S4-group-rename') st.ha = await hoverActive(p, HOVER_SITES);
    st.focused = await p.evaluate(() => (document.activeElement ? document.activeElement.getAttribute('data-testid') : null));
    await ctx.close();
  }
  // reduced motion
  { const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `c168rm-${W}-${ATT}`, net, { reducedMotion: 'reduce' });
    await makeGroup(p); await p.mouse.move(2, 2); await sleep(300);
    const m = await p.evaluate(measureSites, SITES);
    res.reducedMotion = { matches: await p.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), sites: Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v.present ? { tp: v.tp, td: v.td } : null])) };
    await ctx.close(); }
  // 4x crops
  res.crops = {};
  for (const [name, prep] of STATES.slice(0, 4)) {
    const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `c168crop-${W}-${ATT}-${name}`, net, { deviceScaleFactor: 4 });
    await p.mouse.move(2, 2); await sleep(300); await prep(p); await p.mouse.move(2, 2); await sleep(500);
    const c = res.crops[name] = {};
    if (name === 'S0-default' || name === 'S1-on') { c.laneHeader = await crop(p, `${name}-lane-music-header`, '[data-track-id=music] [data-testid=arrangement-track-header]', '[data-track-id=music] [data-testid=arrangement-track-header]'); c.import = await crop(p, `${name}-video-import`, SITES['video-import'][0], SITES['video-import'][0]); }
    if (name !== 'S0-default') c.groupHeader = await crop(p, `${name}-group-header`, SITES['group-fold'][0], SITES['group-solo'][0]);
    await ctx.close();
  }
  res.net = X.netOk(net); res.netRaw = net.map((n) => ({ label: n.label, errors: n.errors, forbidden: n.forbidden, auth: n.authHeaders, hyd: n.hydration, noise: n.noise, fontBad: n.fontResp.filter((r) => r.s !== 200).length + n.fontFail.length }));
  await b.close();
  fs.writeFileSync(path.join(OUTD, `surf-${W}-${ATT}.json`), JSON.stringify(res, null, 1));
  console.log('done', W, ATT, JSON.stringify(res.net));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
