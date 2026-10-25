// C round 149 — TOKENS-SCOPED, RV-2-FIELDS, STATE-DISTINCT, FUNC-SMOKE, VISUAL, PX-NET. node c149.cjs <1440|1280>
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const TAG = process.argv[3] || '';
const net = []; const OUTF = path.join(L.OUT, `c149-${W}${TAG}.json`);
const res = { vp: W, utc: new Date().toISOString(), sections: {}, errors: [] };
const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const SPEC = { background: '#0e0d0c', surface: '#161412', elevated: '#1d1a17', 'muted-bg': '#24201c', outline: '#24211e', 'outline-hover': '#2e2a26', 'outline-strong': '#3a3530', 'outline-light': 'rgb(36 33 30 / 0.5)', foreground: '#ece6da', muted: '#a39b8e', dim: '#928a7d', brand: '#c9a46a', 'brand-hover': '#d9b87f', 'brand-foreground': '#0e0d0c', accent: '#c9a46a', positive: '#8fa382', warning: '#d9a35b', destructive: '#d2776a' };
const STORE = JSON.parse(fs.readFileSync(path.join(L.ROOT, '..', 'b-round-148', 'out', 'storebase149.json'), 'utf8')).pages[`/studio-lab@${W}`].root;
async function tokens(p, sel) {
  return p.evaluate(({ sel, keys }) => { const e = sel === 'html' ? document.documentElement : sel === 'body' ? document.body : document.querySelector(sel); if (!e) return null; const cs = getComputedStyle(e); const o = {}; for (const k of keys) o[k] = cs.getPropertyValue('--color-' + k).trim(); return o; }, { sel, keys: Object.keys(SPEC) });
}
const cmp = (got, want) => { if (!got) return { ok: false, missing: true }; const bad = Object.keys(want).filter((k) => got[k] !== want[k]).map((k) => ({ k, got: got[k], want: want[k] })); return { ok: bad.length === 0, bad }; };
async function section(name, fn) { try { res.sections[name] = await fn(); } catch (e) { res.errors.push(`${name}: ${String(e.stack || e).slice(0, 600)}`); } save(); }
// In-page: all computed colours inside a root with teal/orange (Store brand/accent) signature.
function hueScan(rootSel) {
  const roots = rootSel === 'portals' ? [...document.body.children].filter((c) => !c.querySelector('.studio-container') && !c.matches('script,style')) : [document.querySelector(rootSel)];
  const cvs = document.createElement('canvas'); cvs.width = cvs.height = 1; const g = cvs.getContext('2d', { willReadFrequently: true });
  const rgb = (s) => { g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = s; g.fillRect(0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3]]; };
  const hsl = ([r, gg, b]) => { r /= 255; gg /= 255; b /= 255; const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b); const l = (mx + mn) / 2; if (mx === mn) return [0, 0, l]; const d = mx - mn; const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); let h = mx === r ? (gg - b) / d + (gg < b ? 6 : 0) : mx === gg ? (b - r) / d + 2 : (r - gg) / d + 4; return [h * 60, s, l]; };
  const hits = [];
  for (const root of roots) { if (!root) continue; for (const e of [root, ...root.querySelectorAll('*')]) { const b = e.getBoundingClientRect(); if (!b.width || !b.height) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    for (const prop of ['color', 'backgroundColor', 'borderTopColor', 'borderLeftColor', 'outlineColor', 'fill', 'stroke']) { const v = cs[prop]; if (!v || v === 'none' || /^url/.test(v)) continue; if (prop === 'color' && !(e.childNodes && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))) continue; if (/^border/.test(prop) && parseFloat(cs[prop.replace('Color', 'Width')]) === 0) continue; if (prop === 'outlineColor' && (cs.outlineStyle === 'none' || parseFloat(cs.outlineWidth) === 0)) continue; if ((prop === 'fill' || prop === 'stroke') && !(e instanceof SVGElement)) continue;
      const c = rgb(v); if (c[3] < 20) continue; const [h, s, l] = hsl(c); const teal = h >= 150 && h <= 200 && s > 0.35 && l > 0.15; const orange = h >= 25 && h <= 45 && s > 0.8 && l > 0.4; const blue = h >= 200 && h <= 260 && s > 0.35 && l > 0.15;
      if (teal || orange || blue) hits.push({ tag: e.tagName.toLowerCase(), tid: e.getAttribute('data-testid') || (e.closest('[data-testid]') || { getAttribute: () => '' }).getAttribute('data-testid'), cls: (typeof e.className === 'string' ? e.className : '').slice(0, 120), prop, v, kind: teal ? 'teal' : orange ? 'orange' : 'blue', box: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] }); } } }
  return hits;
}
// contrast helpers in-page
function fieldRatios(sels) {
  const cvs = document.createElement('canvas'); cvs.width = cvs.height = 1; const g = cvs.getContext('2d', { willReadFrequently: true });
  const rgb = (s) => { g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = s; g.fillRect(0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 }; };
  const over = (t, b) => ({ r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a), a: 1 });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
  const bgBehind = (e) => { const layers = []; for (let n = e; n; n = n.parentElement) { const c = rgb(getComputedStyle(n).backgroundColor); if (c.a > 0) layers.push(c); if (c.a >= 1) break; } let bg = { r: 255, g: 255, b: 255, a: 1 }; for (let i = layers.length - 1; i >= 0; i--) bg = over(layers[i], bg); return bg; };
  const s = (c) => `rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})`;
  return sels.map((sel) => { const e = document.querySelector(sel); if (!e) return { sel, missing: true }; const cs = getComputedStyle(e); const surface = bgBehind(e.parentElement); const fillRaw = rgb(cs.backgroundColor); const fill = over(fillRaw, surface); const border = over(rgb(cs.borderTopColor), surface); const b = e.getBoundingClientRect();
    return { sel, borderWidth: cs.borderTopWidth, borderCss: cs.borderTopColor, border: s(border), surface: s(surface), fill: s(fill), borderVsSurface: ratio(border, surface), fillVsSurface: ratio(fill, surface), borderVsFill: ratio(border, fill), box: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] }; });
}
async function buildS1(p) {
  const steps = [];
  steps.push({ step: 'setSnapOff', snap: await L.setSnapOff(p) });
  steps.push({ step: 'addAt music 0', r: await L.addAt(p, 'demo-hero-music', 'music', 0) });
  steps.push({ step: 'addAt stems 2', r: await L.addAt(p, 'demo-stem-pulse', 'stems', 2) });
  steps.push({ step: 'addAt sfx 4', r: await L.addAt(p, 'demo-soft-impact', 'sfx', 4) });
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); steps.push({ step: 'video', status: await L.status(p) });
  steps.push({ step: 'seekTo 1', pos: await L.seekTo(p, 1) });
  await L.blur(p); await p.keyboard.press('m'); await sleep(400); steps.push({ step: 'M', status: await L.status(p) });
  const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems').id;
  steps.push({ step: 'range 4→2 on stems', status: await X.rangeDrag(p, stems, 4, 2) });
  steps.push({ step: 'Ctrl+L', status: await X.key(p, 'Control+l') });
  await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150);
  steps.push({ step: 'Ctrl+G', status: await X.key(p, 'Control+g') });
  const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id; await L.selectClip(p, sfx);
  if (W === 1280) await X.openDetail(p);
  await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
  return steps;
}
const shot = async (p, name) => { await p.screenshot({ path: path.join(L.SHOTS, `${name}-${W}.png`) }); return `c-round-149/shots/${name}-${W}.png`; };
const elShot = async (p, sel, name, pad = 30) => { const b = await p.locator(sel).first().boundingBox(); if (!b) return null; const clip = { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: Math.min(W - Math.max(0, b.x - pad), b.width + 2 * pad), height: b.height + 2 * pad }; await p.screenshot({ path: path.join(L.SHOTS, `${name}-${W}.png`), clip }); return `c-round-149/shots/${name}-${W}.png`; };
const styleOf = (p, sel, props) => p.evaluate(({ sel, props }) => { const e = document.querySelector(sel); if (!e) return null; const cs = getComputedStyle(e); const o = {}; for (const k of props) o[k] = cs[k]; o.text = (e.textContent || '').trim().slice(0, 40); o.aria = e.getAttribute('aria-pressed') || e.getAttribute('aria-checked') || null; return o; }, { sel, props });
const PROPS = ['color', 'backgroundColor', 'borderTopColor', 'borderTopStyle', 'borderTopWidth', 'outlineColor', 'boxShadow', 'opacity'];
(async () => {
  const b = await L.launch();
  try {
    const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `c149-${W}`, net);
    await p.mouse.move(2, 2); await sleep(300);
    await section('start', async () => ({ snap: await p.evaluate(() => { const g = document.querySelector('[data-testid=arrangement-grid-control]'); return g ? g.dataset.snap : null; }), url: p.url(), demoBadge: await p.evaluate(() => document.body.innerText.includes('Demo collection — no sign-in required')) }));
    await section('tokensS0', async () => {
      const ws = await tokens(p, '.studio-container'), bd = await tokens(p, 'body'), html = await tokens(p, 'html');
      const bgs = await p.evaluate(() => { const ws = document.querySelector('.studio-container'); const h = ws.querySelector('header'); return { workspace: getComputedStyle(ws).backgroundColor, header: h ? getComputedStyle(h).backgroundColor : null, headerCls: h ? h.className.slice(0, 120) : null, bodyBg: getComputedStyle(document.body).backgroundColor, htmlBg: getComputedStyle(document.documentElement).backgroundColor }; });
      return { workspace: { v: ws, ...cmp(ws, SPEC) }, body: { v: bd, ...cmp(bd, SPEC) }, html: { v: html, ...cmp(html, STORE) }, bgs, shot: await shot(p, 'S0') };
    });
    await section('fieldsS0', async () => p.evaluate(fieldRatios, ['[data-testid=arrangement-tempo-input]', '[data-testid=arrangement-library-search]']));
    await section('hueS0', async () => ({ studio: await p.evaluate(hueScan, '.studio-container'), portals: await p.evaluate(hueScan, 'portals') }));
    // FUNC-SMOKE play 2 s from 0
    await section('play', async () => {
      await L.blur(p); await p.keyboard.press('Home'); await sleep(300);
      const c0 = await p.evaluate(() => window.__h.cbs); const pos0 = await L.posNow(p).catch(() => null);
      const ph0 = await p.evaluate(() => Number(document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow')));
      await p.keyboard.press('Space'); await sleep(2000); await p.keyboard.press('Space'); await sleep(400);
      const c1 = await p.evaluate(() => window.__h.cbs); const ph1 = await p.evaluate(() => Number(document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow')));
      const ctxs = await p.evaluate(() => window.__h.ctxs.map((c) => ({ state: c.state, t: c.currentTime })));
      return { ph0, ph1, advanced: ph1 - ph0, cbs0: c0, cbs1: c1, cbsDelta: c1 - c0, pos0, ctxs, note: 'S0 has no clips; createBufferSource re-measured after S1 below' };
    });
    await section('s1', async () => ({ steps: await buildS1(p) }));
    await section('tokensS1', async () => ({ shot: await shot(p, 'S1'), hue: { studio: await p.evaluate(hueScan, '.studio-container') } }));
    await section('fieldsS1', async () => p.evaluate(fieldRatios, ['[data-testid=arrangement-tempo-input]', '[data-testid=arrangement-library-search]', '[data-testid=arrangement-detail-start]', '[data-testid=arrangement-detail-end]', '[data-testid=arrangement-detail-clip-gain-input]']));
    await section('playS1', async () => {
      await L.blur(p); await p.keyboard.press('Home'); await sleep(300);
      const c0 = await p.evaluate(() => window.__h.cbs); const ph0 = await p.evaluate(() => Number(document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow')));
      await p.keyboard.press('Space'); await sleep(2000); await p.keyboard.press('Space'); await sleep(400);
      const c1 = await p.evaluate(() => window.__h.cbs); const ph1 = await p.evaluate(() => Number(document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow')));
      return { ph0, ph1, advanced: +(ph1 - ph0).toFixed(3), cbsDelta: c1 - c0, status: await L.status(p) };
    });
    // marker menu: focus marker flag, Shift+F10
    await section('markerMenu', async () => {
      const m = p.locator('[data-testid=arrangement-marker]').first(); await m.focus(); await sleep(150); await p.keyboard.press('Shift+F10'); await sleep(400);
      let opened = await p.locator('[data-testid=arrangement-marker-menu]').count(); let how = 'Shift+F10';
      if (!opened) { const bx = await m.boundingBox(); await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2, { button: 'right' }); await sleep(400); opened = await p.locator('[data-testid=arrangement-marker-menu]').count(); how = 'right-click'; }
      const v = await tokens(p, '[data-testid=arrangement-marker-menu]');
      const st = await styleOf(p, '[data-testid=arrangement-marker-menu]', ['backgroundColor', 'borderTopColor', 'color']);
      const inBody = await p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-marker-menu]'); return e ? { insideStudio: !!e.closest('.studio-container'), parentIsBody: !!e.closest('body > *') && !e.closest('.studio-container') } : null; });
      const sh = opened ? await shot(p, 'marker-menu') : null;
      await p.keyboard.press('Escape'); await sleep(300);
      const closed = (await p.locator('[data-testid=arrangement-marker-menu]').count()) === 0;
      return { how, opened: !!opened, closed, portal: inBody, tokens: { v, ...cmp(v, SPEC) }, style: st, shot: sh };
    });
    // group name field (record only): double-click group name
    await section('groupField', async () => {
      const g = p.locator('[data-testid=arrangement-group-name]').first(); await g.dblclick(); await sleep(300);
      const n = await p.locator('[data-testid=arrangement-group-name-input]').count();
      const r = n ? await p.evaluate(fieldRatios, ['[data-testid=arrangement-group-name-input]']) : [{ missing: true }];
      if (n) await shot(p, 'group-field');
      await p.keyboard.press('Escape'); await sleep(300); return { opened: n, r };
    });
    // FUNC-SMOKE drag 1 s and Ctrl+Z
    await section('dragUndo', async () => {
      const sfx = await H.byLane(p, 'sfx'); const before = sfx.start;
      const st = await H.dragHeader(p, sfx.id, 1); const mid = (await H.byLane(p, 'sfx')).start;
      const st2 = await X.key(p, 'Control+z'); const after = (await H.byLane(p, 'sfx')).start;
      return { before, mid, after, moved: +(mid - before).toFixed(3), restored: Math.abs(after - before) < 1e-6, status: st, undoStatus: st2 };
    });
    // STATE-DISTINCT (styles everywhere; screenshots for 1440)
    await section('states', async () => {
      const o = {};
      const sfx = await H.byLane(p, 'sfx'); await L.selectClip(p, sfx.id); await L.blur(p); await p.mouse.move(2, 2); await sleep(300);
      o.playhead = await styleOf(p, '[data-testid=arrangement-playhead]', PROPS);
      o.playheadHandle = await styleOf(p, '[data-testid=arrangement-playhead-handle]', PROPS);
      o.selectedClip = await styleOf(p, `[data-clip-id="${sfx.id}"]`, PROPS);
      o.selectedClipHeader = await styleOf(p, `[data-clip-id="${sfx.id}"] > div`, PROPS);
      const music = await H.byLane(p, 'music'); o.unselectedClip = await styleOf(p, `[data-clip-id="${music.id}"]`, PROPS);
      o.marker = await styleOf(p, '[data-testid=arrangement-marker]', PROPS);
      o.loopBraceOn = await styleOf(p, '[data-testid=arrangement-loop-brace]', PROPS);
      o.loopBraceOnLabel = await styleOf(p, '[data-testid=arrangement-loop-brace] span', PROPS);
      const loopBtn = 'button:has-text("Loop")';
      o.loopBtnOn = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^↻\s*Loop/.test(x.textContent.trim())); if (!b) return null; const cs = getComputedStyle(b); return { text: b.textContent.trim(), pressed: b.getAttribute('aria-pressed'), color: cs.color, bg: cs.backgroundColor, border: cs.borderTopColor }; });
      o.follow = await styleOf(p, '[data-testid=arrangement-follow]', PROPS);
      const shots = {};
      if (W === 1440) {
        shots.overview = await shot(p, 'SD-overview-loopon');
        shots.loopZone = await elShot(p, '[data-testid=arrangement-loop-strip]', 'SD-loopstrip-on', 40);
        shots.markerRow = await elShot(p, '[data-testid=arrangement-marker-row]', 'SD-marker-row', 10);
        shots.selClip = await elShot(p, `[data-clip-id="${sfx.id}"]`, 'SD-selected-clip', 30);
        shots.transport = await elShot(p, '[data-testid=arrangement-follow]', 'SD-transport-follow', 260);
      }
      // range on stems clip → clip inside time selection
      const stems = await H.byLane(p, 'stems'); await X.rangeDrag(p, stems.id, 3.5, 2.5); await sleep(300);
      o.rangeHighlight = await styleOf(p, '[data-testid=arrangement-lane-range]', PROPS);
      o.clipInRange = await styleOf(p, `[data-clip-id="${stems.id}"]`, PROPS);
      if (W === 1440) shots.range = await elShot(p, `[data-clip-id="${stems.id}"]`, 'SD-clip-in-range', 40);
      // loop off via Ctrl+L toggle
      await X.key(p, 'Control+l'); await sleep(300);
      o.loopBraceOff = await styleOf(p, '[data-testid=arrangement-loop-brace]', PROPS);
      o.loopBraceOffLabel = await styleOf(p, '[data-testid=arrangement-loop-brace] span', PROPS);
      o.loopBtnOff = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^↻\s*Loop/.test(x.textContent.trim())); if (!b) return null; const cs = getComputedStyle(b); return { text: b.textContent.trim(), pressed: b.getAttribute('aria-pressed'), color: cs.color, bg: cs.backgroundColor, border: cs.borderTopColor }; });
      if (W === 1440) { shots.loopOff = await elShot(p, '[data-testid=arrangement-loop-strip]', 'SD-loopstrip-off', 40); shots.overviewLoopOff = await shot(p, 'SD-overview-loopoff'); }
      await X.key(p, 'Control+l'); await sleep(200);
      // follow toggle
      const f0 = await styleOf(p, '[data-testid=arrangement-follow]', PROPS); await p.click('[data-testid=arrangement-follow]'); await sleep(250); const f1 = await styleOf(p, '[data-testid=arrangement-follow]', PROPS);
      o.followA = f0; o.followB = f1; if (W === 1440) shots.followB = await elShot(p, '[data-testid=arrangement-follow]', 'SD-follow-toggled', 30);
      await p.click('[data-testid=arrangement-follow]'); await sleep(200); await L.blur(p);
      // solo on sfx track
      const soloSel = '[data-track-id=sfx] button[aria-label^="Solo"]'; const ns = await p.locator(soloSel).count();
      if (ns) { o.soloOff = await styleOf(p, soloSel, PROPS); await p.click(soloSel); await sleep(250); o.soloOn = await styleOf(p, soloSel, PROPS); const mute = '[data-track-id=sfx] button[aria-label^="Mute"]'; o.muteOff = await styleOf(p, mute, PROPS); if (W === 1440) shots.solo = await elShot(p, '[data-track-id=sfx]', 'SD-solo-on', 4); await p.click(soloSel); await sleep(200); } else o.solo = 'selector not found';
      await L.blur(p);
      return { styles: o, shots };
    });
    // Export dialog
    await section('exportDlg', async () => {
      await p.keyboard.press('Escape'); await sleep(200);
      await X.openDlg(p); await p.mouse.move(2, 2); await sleep(400);
      const sel = '[role=dialog][aria-labelledby=arrangement-export-title] > div';
      const v = await tokens(p, sel);
      const st = await p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const cs = getComputedStyle(e); const t = document.querySelector('#arrangement-export-title'); return { panelBg: cs.backgroundColor, border: cs.borderTopColor, title: t ? getComputedStyle(t).color : null, insideStudio: !!e.closest('.studio-container') }; }, sel);
      const sh = await shot(p, 'export-dialog');
      const hue = await p.evaluate(hueScan, 'portals');
      await p.keyboard.press('Escape'); await sleep(500);
      const closed = (await p.locator('#arrangement-export-title').count()) === 0;
      return { tokens: { v, ...cmp(v, SPEC) }, style: st, shot: sh, hue, closedByEscape: closed };
    });
    await section('finalTokens', async () => ({ html: cmp(await tokens(p, 'html'), STORE), body: cmp(await tokens(p, 'body'), SPEC) }));
    // reviewer L4 probe: client-side nav from studio-lab to /
    await section('navProbe', async () => {
      const link = p.locator('[data-testid=arrangement-exit]'); const n = await link.count(); if (!n) return { skipped: 'no exit link' };
      await link.click(); await sleep(3000);
      const r = await p.evaluate(() => ({ path: location.pathname, ws: !!document.querySelector('.studio-container'), attr: document.querySelectorAll('[data-studio-theme]').length, bodyBrand: getComputedStyle(document.body).getPropertyValue('--color-brand').trim(), bodyBg: getComputedStyle(document.body).backgroundColor }));
      r.shot = await shot(p, 'nav-after-exit'); return r;
    });
  } catch (e) { res.errors.push(String(e.stack || e)); }
  res.net = X.netOk(net); save();
  console.log(JSON.stringify({ errors: res.errors, net: res.net, keys: Object.keys(res.sections) }, null, 1));
  await b.close();
})();
