// C round 181 — M1 round icon-only Play: CC-M1, LAYOUT-M1, RV1 rest shot, CONTRAST-M1, FOCUS-M1, NO-BRASS-M1, BEHAVIOUR-M1, A11Y-M1, PX-NET.
// node c181.cjs <1440|1280> <attempt> [tagPrefix]   C_BASE env selects the server (HEAD copy on :5174). DPR 2, --disable-lcd-text, fresh anonymous context.
const X = require('../../c-round-180/tools/lib122.cjs'); const { L, sleep } = X;
const { decode } = require('../../c-round-180/tools/png.cjs');
const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1'; const PFX = process.argv[4] || 'c181';
const TAG = `${PFX}-${W}-${ATT}`;
const ROOT = path.join(__dirname, '..'); const OUT = path.join(ROOT, 'out'); const SHD = path.join(ROOT, 'shots', TAG); fs.mkdirSync(SHD, { recursive: true });
const net = []; const res = { W, ATT, base: process.env.C_BASE || 'http://127.0.0.1:5173', utc: new Date().toISOString(), cc: {}, layout: {}, focus: {}, beh: {}, a11y: {}, shots: {}, errors: [] };
const save = () => L.save(OUT, `${TAG}.json`, { ...res, net });
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const cr = (a, b) => { if (!a || !b) return null; const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const D = 2; let img = null;
async function snap(p, name) { const f = path.join(SHD, `${name}.png`); const buf = await p.screenshot({ path: f }); img = decode(buf); res.shots[name] = path.relative(ROOT, f); return img; }
const px = (x, y) => img.px(Math.round(x * D), Math.round(y * D));
function scan(rect, masks = []) {
  const [x, y, w, h] = rect; let n = 0, b = 0, masked = 0; const samples = [];
  for (let Y = Math.ceil(y * D); Y < Math.floor((y + h) * D); Y++) for (let Xp = Math.ceil(x * D); Xp < Math.floor((x + w) * D); Xp++) {
    const cx = Xp / D, cy = Y / D; if (masks.some((m) => cx >= m.r[0] && cx < m.r[0] + m.r[2] && cy >= m.r[1] && cy < m.r[1] + m.r[3])) { masked++; continue; }
    const c = img.px(Xp, Y); n++; if (c[0] - c[2] >= 45) { b++; if (samples.length < 6) samples.push({ x: cx, y: cy, c }); }
  }
  return { rect, n, masked, brass: b, samples };
}
const PAGE = () => {
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; const g = cv.getContext('2d', { willReadFrequently: true });
  const toRgb = (c) => { g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = c; g.fillRect(0, 0, 1, 1); return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); };
  const mix = (layers) => { g.clearRect(0, 0, 1, 1); for (const l of layers) { g.fillStyle = 'rgba(0,0,0,0)'; g.fillStyle = l; g.fillRect(0, 0, 1, 1); } return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); };
  const opaque = (b) => { g.clearRect(0, 0, 1, 1); g.fillStyle = 'rgba(0,0,0,0)'; g.fillStyle = b; g.fillRect(0, 0, 1, 1); return g.getImageData(0, 0, 1, 1).data[3] === 255; };
  const stackOf = (e) => { const layers = []; let n = e; while (n && n.nodeType === 1) { const b = getComputedStyle(n).backgroundColor; layers.unshift(b); if (opaque(b)) return layers; n = n.parentElement; } layers.unshift('rgb(0,0,0)'); return layers; };
  const play = () => [...document.querySelectorAll('button')].find((b) => /^(Play|Pause)$/.test(b.getAttribute('aria-label') || ''));
  const info = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const svg = el.querySelector('svg'); const sr = svg && svg.getBoundingClientRect(); return { box: [r.x, r.y, r.width, r.height], radius: cs.borderTopLeftRadius, radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius], pad: [cs.paddingLeft, cs.paddingRight], bg: cs.backgroundColor, bgRgb: toRgb(cs.backgroundColor), composite: mix(stackOf(el)), surface: el.parentElement ? mix(stackOf(el.parentElement)) : null, color: cs.color, colorRgb: toRgb(cs.color), boxShadow: cs.boxShadow, outline: cs.outlineStyle, cls: el.getAttribute('class'), label: el.getAttribute('aria-label'), title: el.getAttribute('title'), innerText: el.innerText, textContent: el.textContent, svgClass: svg && svg.getAttribute('class'), svgN: el.querySelectorAll('svg').length, svgStroke: svg && getComputedStyle(svg).stroke, svgBox: sr ? [sr.x, sr.y, sr.width, sr.height] : null, hover: el.matches(':hover'), active: el.matches(':active'), focusVisible: el.matches(':focus-visible'), focused: document.activeElement === el }; };
  const layout = () => {
    const pl = play(); const row = pl.parentElement; const rr = row.getBoundingClientRect();
    const kids = [...row.children].map((c, i) => { const r = c.getBoundingClientRect(); return { i, tag: c.tagName, label: c.getAttribute('aria-label') || c.getAttribute('data-testid') || (c.textContent || '').trim().slice(0, 24) || c.getAttribute('role') || c.className.slice(0, 30), box: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(2)) }; });
    const nx = row.nextElementSibling; const nr = nx && nx.getBoundingClientRect();
    const lines = [...new Set(kids.filter((k) => k.box[3] > 0).map((k) => Math.round(k.box[1] + k.box[3] / 2)))].length;
    const desc = row.querySelectorAll('*').length;
    return { row: [rr.x, rr.y, rr.width, rr.height].map((v) => +v.toFixed(2)), kids, lines, next: nx ? { tag: nx.tagName, cls: (nx.className || '').slice(0, 60), box: [nr.x, nr.y, nr.width, nr.height].map((v) => +v.toFixed(2)) } : null, descendants: desc, scrollW: document.documentElement.scrollWidth, vw: innerWidth };
  };
  window.__c181 = { toRgb, mix, stackOf, info, play, layout };
  window.__tog = [];
  window.__watch = () => { if (window.__mo) window.__mo.disconnect(); const b = play(); window.__tog = []; let last = b.getAttribute('aria-label'); const mo = new MutationObserver(() => { const v = b.getAttribute('aria-label'); if (v !== last) { window.__tog.push({ t: performance.now(), from: last, to: v }); last = v; } }); mo.observe(b, { attributes: true, attributeFilter: ['aria-label'] }); window.__mo = mo; };
};
const pinfo = (p) => p.evaluate(() => window.__c181.info(window.__c181.play()));
async function rest(p) { await L.blur(p); await p.mouse.move(2, 2); await sleep(500); }
const step = async (k, fn) => { try { const v = await fn(); res[k] = { ...(res[k] || {}), ...v }; } catch (e) { res[k] = { ...(res[k] || {}), error: String(e && e.stack || e).slice(0, 600) }; res.errors.push(`${k}: ${String(e).slice(0, 200)}`); } save(); };
// pixel reads of the Play box from the last snap
function boxPixels(i) {
  const [x, y, w, h] = i.box; const cx = x + w / 2, cy = y + h / 2; const R = w / 2;
  const corners = [[x + 2, y + 2], [x + w - 2, y + 2], [x + 2, y + h - 2], [x + w - 2, y + h - 2]].map(([a, b]) => ({ at: [a, b], c: px(a, b) }));
  const fillPts = [45, 135, 225, 315].map((deg) => { const a = (deg * Math.PI) / 180; const pt = [cx + 11 * Math.cos(a), cy - 11 * Math.sin(a)]; return { at: pt.map((v) => +v.toFixed(2)), c: px(pt[0], pt[1]) }; });
  const centre = px(cx, cy);
  let darkest = null; let dl = 9; let ib = i.svgBox;
  if (ib) for (let Y = Math.ceil(ib[1] * D); Y < Math.floor((ib[1] + ib[3]) * D); Y++) for (let Xp = Math.ceil(ib[0] * D); Xp < Math.floor((ib[0] + ib[2]) * D); Xp++) { const c = img.px(Xp, Y); const l = lum(c); if (l < dl) { dl = l; darkest = c; } }
  const iconCentreOff = ib ? [+(ib[0] + ib[2] / 2 - cx).toFixed(2), +(ib[1] + ib[3] / 2 - cy).toFixed(2)] : null;
  return { corners, fillPts, centre, darkestIconPx: darkest, iconCentreOff, R };
}
async function ccState(p, name) {
  const i = await pinfo(p); await snap(p, name); const pxr = boxPixels(i);
  const masks = await p.evaluate(() => { const o = []; const ph = document.querySelector('[data-testid=arrangement-playhead]'); if (ph) { const r = ph.getBoundingClientRect(); o.push({ k: 'K8 playhead', r: [r.x - 3, -10, r.width + 6, 5000] }); } const hd = document.querySelector('[data-testid=arrangement-playhead-handle]'); if (hd) { const r = hd.getBoundingClientRect(); o.push({ k: 'K8 handle', r: [r.x - 2, r.y - 2, r.width + 4, r.height + 4] }); } return o; });
  const sc = scan(i.box, masks.filter((m) => m.r[0] < i.box[0] + i.box[2] && m.r[0] + m.r[2] > i.box[0] && m.r[1] < i.box[1] + i.box[3] && m.r[1] + m.r[3] > i.box[1]));
  const r = { ...i, px: pxr, scan: sc, crIconFill: cr(pxr.darkestIconPx, i.composite), crFillSurface: cr(i.composite, i.surface), crTokIconFill: cr(i.colorRgb, i.composite) };
  res.cc[name] = r; save(); return r;
}

(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--disable-lcd-text'] });
  try {
    const o = await L.openStudio(b, X.VPS[W], TAG, net, { deviceScaleFactor: 2, extraInit: X.tapInit }); const p = o.page; res.fonts = o.log.fontsReady && o.log.fontsReady.ok;
    await p.evaluate(PAGE);
    res.anon = await p.evaluate(() => ({ auth: localStorage.getItem('auth_user'), cookie: document.cookie, path: location.pathname, ls: Object.keys(localStorage) }));
    res.anonCookies = (await o.ctx.cookies()).length;
    await rest(p); await snap(p, 'rest-full');
    await step('layout', async () => ({ rest: await p.evaluate(() => window.__c181.layout()) }));
    await step('cc', async () => {
      const r0 = await ccState(p, 'play-rest');
      const [x, y, w, h] = r0.box; await p.mouse.move(x + w / 2, y + h / 2, { steps: 3 }); await sleep(500);
      await ccState(p, 'play-hover');
      await p.mouse.down(); await sleep(400); await ccState(p, 'play-press'); await p.mouse.move(2, 2, { steps: 4 }); await p.mouse.up(); await sleep(300);
      const after = await pinfo(p); return { pressNoToggle: after.label };
    });
    await step('focus', async () => {
      await rest(p); await p.evaluate(() => document.body.focus());
      await p.mouse.click(W - 4, 4).catch(() => {}); await L.blur(p);
      let n = 0; let ok = false;
      for (; n < 80; n++) { await p.keyboard.press('Tab'); ok = await p.evaluate(() => document.activeElement === window.__c181.play()); if (ok) break; }
      await p.mouse.move(2, 2); await sleep(400);
      const i = await pinfo(p); await snap(p, 'play-focus');
      const [x, y, w, h] = i.box; const cx = x + w / 2, cy = y + h / 2; const R = w / 2;
      const ring = [17, 17.5].flatMap((rr) => [45, 135, 225, 315].map((deg) => { const a = (deg * Math.PI) / 180; const pt = [cx + rr * Math.cos(a), cy - rr * Math.sin(a)]; return { r: rr, deg, at: pt.map((v) => +v.toFixed(2)), c: px(pt[0], pt[1]) }; }));
      const cornerWhileFocus = [[x + 1, y + 1], [x + w - 1, y + 1]].map(([a, bb]) => ({ at: [a, bb], c: px(a, bb) }));
      const brandTok = await p.evaluate(() => window.__c181.toRgb(getComputedStyle(document.documentElement).getPropertyValue('--color-brand').trim() || 'red'));
      return { tabs: n + 1, reached: ok, info: i, ring, cornerWhileFocus, brandTok, R };
    });
    // BEHAVIOUR (add a clip first)
    await step('beh', async () => {
      await rest(p);
      const sig = () => p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((e) => `${e.closest('[data-track-id]').dataset.trackId}:${e.dataset.clipKind}@${e.getAttribute('data-clip-start')}`).sort().join('|'));
      const s0 = await sig();
      const add = await L.addAt(p, 'demo-middle-east', 'music', 0); const s1 = await sig();
      await L.blur(p); await p.keyboard.press('Home'); await sleep(300);
      // click Play
      const pos0 = await L.posNow(p); const box0 = (await pinfo(p)).box;
      await p.evaluate(() => window.__tapStart());
      await p.getByRole('button', { name: 'Play', exact: true }).click(); await p.mouse.move(2, 2); await sleep(1000);
      const playing = await ccState(p, 'pause-playing');
      const posMid = await L.posNow(p);
      await p.getByRole('button', { name: 'Pause', exact: true }).click(); await sleep(150);
      const S = await p.evaluate(() => window.__tapStop());
      const posStop = await L.posNow(p); await sleep(500); const posStill = await L.posNow(p);
      const afterClick = await pinfo(p);
      const click = { pos0, posMid, posStop, posStill, advanced: +(posStop - pos0).toFixed(3), stopped: Math.abs(posStill - posStop) < 1e-6, peak: +Math.max(0, ...S.map((q) => q.peak)).toFixed(4), taps: S.length, pauseLabel: playing.label, pauseIcon: playing.svgClass, pauseBox: playing.box, box0, labelAfter: afterClick.label, iconAfter: afterClick.svgClass };
      // Space with focus on the workspace (nothing focused)
      await L.blur(p); await p.keyboard.press('Home'); await sleep(300); const sp0 = await L.posNow(p);
      await p.evaluate(() => window.__watch()); await p.evaluate(() => window.__tapStart());
      await p.keyboard.press('Space'); await sleep(1000); const spMid = await pinfo(p); await p.keyboard.press('Space'); await sleep(400);
      const S2 = await p.evaluate(() => window.__tapStop()); const spPos = await L.posNow(p); await sleep(400); const spStill = await L.posNow(p);
      const space = { active: await p.evaluate(() => document.activeElement && document.activeElement.tagName), labelWhilePlaying: spMid.label, toggles: await p.evaluate(() => window.__tog), advanced: +(spPos - sp0).toFixed(3), stopped: Math.abs(spStill - spPos) < 1e-6, peak: +Math.max(0, ...S2.map((q) => q.peak)).toFixed(4) };
      // focused Play button: Space and Enter, exactly once per press
      const focusedPress = {};
      for (const k of ['Space', 'Enter']) {
        const rr = [];
        for (let n = 0; n < 2; n++) {
          await p.evaluate(() => window.__c181.play().focus()); await p.evaluate(() => window.__watch());
          const before = (await pinfo(p)).label; const ps = await L.posNow(p);
          await p.keyboard.press(k); await sleep(900);
          const tog = await p.evaluate(() => window.__tog); const after = await pinfo(p); const pe = await L.posNow(p);
          rr.push({ before, after: after.label, toggles: tog.length, seq: tog.map((t) => `${t.from}->${t.to}`), focusedAfter: after.focused, posDelta: +(pe - ps).toFixed(3) });
        }
        focusedPress[k] = rr;
        // ensure stopped
        const cur = (await pinfo(p)).label; if (cur === 'Pause') { await p.getByRole('button', { name: 'Pause', exact: true }).click(); await sleep(300); }
      }
      await rest(p);
      // corner click (info)
      const pb = (await pinfo(p)).box; await p.evaluate(() => window.__watch());
      const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? { tag: e.tagName, isPlay: e === window.__c181.play() || window.__c181.play().contains(e), cls: (e.getAttribute('class') || '').slice(0, 60) } : null; }, [pb[0] + 3, pb[1] + 3]);
      await p.mouse.click(pb[0] + 3, pb[1] + 3); await sleep(500);
      const cornerTog = await p.evaluate(() => window.__tog.length); const cl = (await pinfo(p)).label; if (cl === 'Pause') { await p.getByRole('button', { name: 'Pause', exact: true }).click(); await sleep(300); }
      const hitC = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? { isPlay: e === window.__c181.play() || window.__c181.play().contains(e) } : null; }, [pb[0] + pb[2] / 2, pb[1] + pb[3] / 2]);
      await rest(p);
      const undo = await X.key(p, 'Control+z'); const s2 = await sig();
      return { add, added: s1 !== s0, click, space, focusedPress, corner: { hit, toggles: cornerTog, centreHit: hitC }, undo, undoRestored: s2 === s0 };
    });
    await step('a11y', async () => {
      await rest(p);
      const loc = p.getByRole('button', { name: 'Play', exact: true });
      const n = await loc.count(); const title = await loc.getAttribute('title'); const desc = await p.evaluate(() => { const b = window.__c181.play(); return { label: b.getAttribute('aria-label'), title: b.title }; });
      const snapAx = await p.accessibility ? null : null;
      await loc.hover(); await sleep(1500); await snap(p, 'play-hover-tooltip');
      const tipDom = await p.evaluate(() => [...document.querySelectorAll('[role=tooltip]')].map((e) => e.textContent.trim()));
      return { countExactPlay: n, title, desc, tipDom, size: (await pinfo(p)).box.slice(2), snapAx };
    });
    await rest(p); await snap(p, 'final');
    await step('layout', async () => ({ final: await p.evaluate(() => window.__c181.layout()) }));
    await o.ctx.close();
  } catch (e) { res.error = String(e && e.stack || e).slice(0, 1500); }
  await b.close(); res.net = X.netOk(net); save();
  console.log(JSON.stringify({ TAG, error: res.error, errors: res.errors, net: res.net }, null, 1));
})();
