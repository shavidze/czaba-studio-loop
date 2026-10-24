// C round 126 — D3-C keyboard & focus: Tab walk from page load (S0) and in S1; ring presence + non-text contrast; density survey.
// node d3c-focus.cjs <1440|1280>
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440;
const RUNID = `${W}-${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}`;
const net = []; const OUTD = path.join(L.ROOT, 'out', 'd3c'); fs.mkdirSync(OUTD, { recursive: true });
const MAXTAB = 160;

function focusInfo() {
  const e = document.activeElement; if (!e || e === document.body) return { key: 'BODY' };
  const parse = (s) => { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const over = (t, b) => ({ r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a), a: 1 });
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
  const bgBehind = (n) => { const layers = []; while (n) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break; } n = n.parentElement; } let bg = { r: 0, g: 0, b: 0, a: 1 }; for (let i = layers.length - 1; i >= 0; i--) bg = over(layers[i], bg); return bg; };
  const cs = getComputedStyle(e); const b = e.getBoundingClientRect();
  const ctx = e.closest('[data-clip-id]') ? 'clip' : e.closest('[data-marker-id]') ? 'marker' : e.closest('[data-group-id],[data-testid=arrangement-group-row]') ? 'group' : e.closest('[data-track-id]') ? 'track:' + e.closest('[data-track-id]').dataset.trackId : e.closest('[role=dialog]') ? 'dialog' : '';
  const key = `${e.getAttribute('data-testid') || e.getAttribute('aria-label') || (e.getAttribute('role') || e.tagName.toLowerCase()) + ':' + (e.textContent || '').trim().slice(0, 30)}${ctx ? '|' + ctx : ''}`;
  const outlineW = parseFloat(cs.outlineWidth) || 0; const outlineOn = cs.outlineStyle !== 'none' && outlineW > 0;
  const shadows = (cs.boxShadow && cs.boxShadow !== 'none') ? cs.boxShadow.split(/,(?![^(]*\))/).map((s) => s.trim()) : [];
  const ringShadows = shadows.map((s) => { const col = parse(s); const nums = s.replace(/rgba?\([^)]*\)/, '').trim().split(/\s+/).map(parseFloat); return { s, col, spread: nums[3] || 0, inset: /inset/.test(s) }; }).filter((x) => x.col && x.col.a > 0 && x.spread > 0);
  const surface = bgBehind(e.parentElement);
  const own = bgBehind(e);
  let ring = null;
  if (outlineOn) { const c = parse(cs.outlineColor); ring = { kind: 'outline', width: outlineW, offset: cs.outlineOffset, color: cs.outlineColor, vsSurface: c ? ratio(over(c, surface), surface) : null }; }
  else if (ringShadows.length) { const best = ringShadows.sort((a, b2) => b2.spread - a.spread)[0]; ring = { kind: 'box-shadow', width: best.spread, inset: best.inset, color: `rgba(${best.col.r},${best.col.g},${best.col.b},${best.col.a})`, vsSurface: ratio(over(best.col, best.inset ? own : surface), best.inset ? own : surface), all: ringShadows.map((x) => x.s).slice(0, 3) }; }
  return { key, tag: e.tagName.toLowerCase(), role: e.getAttribute('role'), fv: e.matches(':focus-visible'), box: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)], inViewport: b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth, ring, surface: `rgb(${Math.round(surface.r)},${Math.round(surface.g)},${Math.round(surface.b)})`, border: cs.borderColor + ' ' + cs.borderWidth, bg: cs.backgroundColor };
}
function density() {
  const vis = (e) => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth; };
  const root = document.querySelector('.studio-container') || document.body;
  const small = {}; const trunc = [];
  for (const e of root.querySelectorAll('*')) {
    if (!vis(e)) continue; const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); if (!own) continue;
    const fs2 = parseFloat(getComputedStyle(e).fontSize); if (fs2 < 12) { const k = fs2 + 'px'; small[k] = (small[k] || 0) + 1; }
  }
  for (const e of root.querySelectorAll('*')) { if (!vis(e)) continue; const cs = getComputedStyle(e); if ((cs.overflow + cs.overflowX).match(/hidden|clip/) || cs.textOverflow === 'ellipsis') { if (e.scrollWidth > e.clientWidth + 1 && (e.textContent || '').trim()) trunc.push({ t: (e.getAttribute('data-testid') || e.tagName) + ':' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 40), sw: e.scrollWidth, cw: e.clientWidth, title: !!(e.title || e.closest('[title]')) }); } }
  const tb = document.querySelector('[data-testid=arrangement-transport]') || [...document.querySelectorAll('div')].find((d) => d.querySelector('button') && /Play/.test(d.textContent) && /Export/.test(d.textContent) && d.getBoundingClientRect().height < 120);
  return { smallText: small, smallTotal: Object.values(small).reduce((a, b) => a + b, 0), truncated: trunc.slice(0, 40), truncatedTotal: trunc.length, toolbarH: tb ? Math.round(tb.getBoundingClientRect().height) : null };
}
async function cropPng(p, box) { const x = Math.max(0, box[0] - 5), y = Math.max(0, box[1] - 5); const w = Math.min(W - x, box[2] + 10), h = Math.min(X.VPS[W].height - y, box[3] + 10); if (w < 2 || h < 2) return null; return p.screenshot({ clip: { x, y, width: w, height: h } }); }
async function diffPng(ctx, a, b) {
  if (!a || !b) return null; const pg = await ctx.newPage(); await pg.goto('about:blank');
  const r = await pg.evaluate(async ([A, B]) => { const ld = async (s) => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height); }; const x = await ld(A), y = await ld(B); if (x.width !== y.width || x.height !== y.height) return { err: 'size' }; let n = 0; for (let k = 0; k < x.data.length; k += 4) if (Math.abs(x.data[k] - y.data[k]) + Math.abs(x.data[k + 1] - y.data[k + 1]) + Math.abs(x.data[k + 2] - y.data[k + 2]) > 30) n++; return { changed: n, total: x.width * x.height }; }, [a.toString('base64'), b.toString('base64')]);
  await pg.close(); return r;
}
async function walk(p, ctx, label, stopAt) {
  const stops = []; let prev = null; const seen = new Map();
  for (let i = 1; i <= MAXTAB; i++) {
    await p.keyboard.press('Tab'); await sleep(60);
    const f = await p.evaluate(focusInfo); f.i = i;
    if (prev && prev.png) { const un = await cropPng(p, prev.box); const d = await diffPng(ctx, prev.png, un); stops[stops.length - 1].pixelDiffFocusedVsUnfocused = d; }
    const png = f.box && f.inViewport ? await cropPng(p, f.box) : null;
    stops.push(f); prev = { box: f.box, png };
    if (f.key === 'BODY') break;
    const n = (seen.get(f.key) || 0) + 1; seen.set(f.key, n); if (n > 1 && f.key === stops[0].key) break;
    if (stopAt && stopAt(f, i)) break;
  }
  return stops;
}
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'], ignoreDefaultArgs: ['--hide-scrollbars'] });
  const res = { runId: RUNID, vp: W };
  try {
    const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `d3c-${RUNID}`, net);
    await p.mouse.move(2, 2); await L.blur(p);
    res.densityS0 = await p.evaluate(density);
    res.shotS0 = await X.shot(p, `D3C-S0-${RUNID}.png`);
    // S0 walk from page start
    await p.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
    res.s0 = await walk(p, ctx, 'S0');
    // build S1 (same as round 125 S1 steps)
    await p.keyboard.press('Escape'); await L.blur(p);
    await L.setSnapOff(p);
    await L.addAt(p, 'demo-hero-music', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2); await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
    await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
    await L.seekTo(p, 1); await L.blur(p); await p.keyboard.press('m'); await sleep(400); await p.keyboard.press('Escape'); await L.blur(p);
    const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems').id; await X.rangeDrag(p, stems, 4, 2); await X.key(p, 'Control+l');
    await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150); await X.key(p, 'Control+g');
    const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id; await L.selectClip(p, sfx).catch(() => {});
    if (W === 1280) await X.openDetail(p);
    await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
    res.densityS1 = await p.evaluate(density);
    res.shotS1 = await X.shot(p, `D3C-S1-${RUNID}.png`);
    res.s1StartHit = await p.evaluate(() => { const e = document.elementFromPoint(2, 2); return e ? (e.getAttribute('data-testid') || e.tagName + '.' + [...e.classList].slice(0, 2).join('.')) : null; });
    await p.mouse.click(2, 2); await sleep(200); await L.blur(p);
    res.s1StartActive = await p.evaluate(() => document.activeElement.tagName);
    res.s1 = await walk(p, ctx, 'S1');
    // fader hit area: elementFromPoint above/below the music Volume input centre
    res.faderHit = await p.evaluate(() => { const s = document.querySelector('[data-track-id=music] input[aria-label^="Volume"]'); if (!s) return null; const b = s.getBoundingClientRect(); const cx = b.left + b.width / 2, cy = b.top + b.height / 2; const out = {}; for (const dy of [-8, -6, -4, -3, -2, 0, 2, 3, 4, 6, 8]) { const e = document.elementFromPoint(cx, cy + dy); out[dy] = e === s; } return { box: [b.left, b.top, b.width, b.height], hits: out }; });
  } catch (e) { res.error = String(e.stack || e); }
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(OUTD, `d3c-focus-${RUNID}.json`), JSON.stringify(res, null, 1));
  const sum = (st) => { if (!st) return null; const noRing = st.filter((s) => s.key !== 'BODY' && !s.ring); const low = st.filter((s) => s.ring && s.ring.vsSurface < 3); const firstClip = st.find((s) => /\|clip/.test(s.key)); const exp = st.find((s) => /^Export/.test(s.key) || /:Export$/.test(s.key)); return { stops: st.length, firstClipAt: firstClip && firstClip.i, exportAt: exp && exp.i, noRing: noRing.map((s) => `${s.i} ${s.key} fv=${s.fv} diff=${JSON.stringify(s.pixelDiffFocusedVsUnfocused)} bd=${s.border}`), lowRing: low.map((s) => `${s.i} ${s.key} ${s.ring.kind} ${s.ring.color} ${s.ring.vsSurface} on ${s.surface}`), ringKinds: [...new Set(st.filter((s) => s.ring).map((s) => `${s.ring.kind}/${s.ring.width}/${s.ring.color}/${s.ring.vsSurface}`))] }; };
  console.log(JSON.stringify({ err: res.error, s0: sum(res.s0), s1: sum(res.s1), dS0: res.densityS0 && { small: res.densityS0.smallText, trunc: res.densityS0.truncatedTotal, tb: res.densityS0.toolbarH }, dS1: res.densityS1 && { small: res.densityS1.smallText, trunc: res.densityS1.truncatedTotal }, fader: res.faderHit, net: res.net }, null, 1));
  await b.close();
})();
