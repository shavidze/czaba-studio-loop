// C round 199 — RV-EN + RV-TOKENS + RV-ICONS in one fresh session per viewport. node rvstatic.cjs <W>
const L = require('./lib.cjs'); const { decode } = require('./png.cjs'); const fs = require('fs'); const path = require('path'); const sleep = L.sleep;
const W = +(process.argv[2] || 1440); const H = W === 1440 ? 900 : 720; const id = `RV-STATIC-${W}`;
const OUT = path.join(__dirname, '..', 'out', 'rvstatic', `${W}`); fs.mkdirSync(OUT, { recursive: true });
const LEDGER = ['ღამის პულსი', 'საჯარო preview', 'სრული მიქსი', 'პულსი', 'ბასი', 'პადი', 'მელოდია'];
const nameSel = (t) => `[data-track-id="${t}"] [data-testid=arrangement-track-header] button[aria-label$="set as the active track"]`;
function scan() { // all text + accessible names inside the workspace page (body), Georgian hits
  const GE = /[Ⴀ-ჿ]/; const hits = [];
  const vis = (e) => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return r.width > 0 && r.height > 0 && c.visibility !== 'hidden' && c.display !== 'none'; };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n; while ((n = walker.nextNode())) { const p = n.parentElement; if (!p || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(p.tagName)) continue; if (GE.test(n.textContent) && vis(p)) hits.push({ kind: 'text', tag: p.tagName, testid: (p.closest('[data-testid]') || {}).dataset?.testid || null, role: (p.closest('[role]') || {}).getAttribute?.('role') || null, v: n.textContent.trim().slice(0, 80) }); }
  for (const e of document.querySelectorAll('[aria-label],[title],[placeholder],[aria-valuetext]')) for (const a of ['aria-label', 'title', 'placeholder', 'aria-valuetext']) { const v = e.getAttribute(a); if (v && GE.test(v)) hits.push({ kind: a, tag: e.tagName, testid: e.dataset.testid || (e.closest('[data-testid]') || {}).dataset?.testid || null, role: e.getAttribute('role'), v: v.slice(0, 80) }); }
  return { hits, title: document.title, titleGe: GE.test(document.title) };
}
(async () => {
  const b = await L.launch(); const net = []; const res = { id, W, states: {} };
  const { page: p, log, ctx } = await L.openStudio(b, { width: W, height: H }, id, net, { deviceScaleFactor: 2 });
  res.states.rest = await p.evaluate(scan);
  // tokens at rest
  res.tokens = await p.evaluate(() => { const r = document.querySelector('[data-studio-theme]'); const cs = getComputedStyle(r); const v = (n) => cs.getPropertyValue(n).trim();
    const probe = (cls) => { const d = document.createElement('div'); d.className = cls; r.appendChild(d); const c = getComputedStyle(d); const o = { bg: c.backgroundColor, color: c.color }; d.remove(); return o; };
    const bodyFont = getComputedStyle(document.querySelector('[data-testid=arrangement-status]')).fontFamily; const tc = getComputedStyle(document.querySelector('[data-testid=arrangement-position]')).fontFamily;
    return { theme: r.dataset.studioTheme, vars: { background: v('--color-background'), surface: v('--color-surface'), brand: v('--color-brand'), foreground: v('--color-foreground') }, bgBackground: probe('bg-background').bg, bgSurface: probe('bg-surface').bg, bgBrand: probe('bg-brand').bg, uiFont: bodyFont, tcFont: tc,
      fontsCheck: { inst: document.fonts.check('14px "Instrument Sans"'), plex: document.fonts.check('14px "IBM Plex Mono"') }, fontsLoaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family}:${f.weight}`) }; });
  // rich scene (rich.cjs setup) — no user-typed Georgian
  const libDrop = async (src, lane, xFrac) => { const o = p.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded(); const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200); const ob = await o.boundingBox(); const lb = await p.evaluate((t) => { const l = document.querySelector(`[data-track-id="${t}"]`); const g = l.querySelector('[data-grid-seconds]') || l; const r = g.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, lane); await p.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2); await p.mouse.down(); await p.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 }); await p.mouse.move(lb.x + lb.w * xFrac, lb.y + lb.h / 2, { steps: 14 }); await sleep(300); await p.mouse.up(); await sleep(900); };
  await libDrop('demo-middle-east', 'music', 0.05);
  await libDrop('demo-stem-pulse', 'stems', 0.3);
  await L.loadVideo(p, 'beeps-6s-vp9-opus.webm');
  await p.click(nameSel('stems')); await sleep(200); await p.click(nameSel('sfx'), { modifiers: ['Shift'] }); await sleep(200);
  await p.mouse.click(5, H - 5); await sleep(150); await p.keyboard.press('Control+g'); await sleep(700);
  await p.click('[data-testid=arrangement-marker-add]'); await sleep(500); res.markerEditor = await p.evaluate(() => document.activeElement && document.activeElement.tagName); if (res.markerEditor === 'INPUT') { await p.keyboard.press('Enter'); await sleep(300); }
  const t = p.locator('[data-testid=arrangement-detail-toggle]'); if ((await t.getAttribute('aria-expanded')) === 'false') { await t.click(); await sleep(700); }
  const clip = p.locator('[data-clip-kind=audio]').first(); const cb = await clip.boundingBox(); await p.mouse.click(cb.x + 30, cb.y + cb.height * 0.65); await sleep(500);
  await p.mouse.move(W - 2, 2); await sleep(200);
  res.setup = await p.evaluate(() => ({ clips: document.querySelectorAll('[data-clip-id]').length, video: document.querySelectorAll('[data-clip-kind=video]').length, groups: document.querySelectorAll('[data-testid=arrangement-group-volume]').length, markers: document.querySelectorAll('[data-testid=arrangement-marker]').length, groupNames: [...document.querySelectorAll('[data-testid=arrangement-group-row]')].map((g) => g.textContent.trim().slice(0, 40)), markerNames: [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((m) => m.textContent.trim() || m.getAttribute('aria-label')) }));
  await p.screenshot({ path: path.join(OUT, 'rich.png') });
  res.states.rich = await p.evaluate(scan);
  // ICONS / panels in the rich scene
  res.icons = await p.evaluate(() => { const root = document.querySelector('[data-studio-theme]'); const GLY = /[▶◀✕⤢⠿▾▸↶↷✂⌫↻↩↤]/;
    const glyphText = []; const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) if (GLY.test(n.textContent)) glyphText.push(n.textContent.trim().slice(0, 40));
    const iconOnly = [...root.querySelectorAll('button')].filter((b) => b.getBoundingClientRect().width > 0 && b.textContent.trim() === '').map((b) => ({ label: b.getAttribute('aria-label') || b.getAttribute('title'), svg: !!b.querySelector('svg'), lucide: !!b.querySelector('svg[class*=lucide]') }));
    const tb = ['Undo', 'Redo', 'Split', 'Delete', 'Loop', 'Follow', 'Zoom', 'Fit', 'Export', 'Snap', 'Env', 'Metronome']; const tool = [...root.querySelectorAll('button')].filter((b) => tb.includes(b.textContent.trim())).map((b) => { const c = getComputedStyle(b); return { t: b.textContent.trim(), bw: c.borderTopWidth, bc: c.borderTopColor, bg: c.backgroundColor, radius: c.borderTopLeftRadius, svg: !!b.querySelector('svg') }; });
    const rad = (s) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return { r: c.borderTopLeftRadius, br: c.borderBottomRightRadius }; };
    return { glyphText, iconOnly, tool, overview: rad('[data-testid=arrangement-overview]'), detail: rad('[data-testid=arrangement-detail-panel]'), dock: rad('[data-testid=arrangement-video-dock]') }; });
  // teal scan + brass on content
  res.teal = await p.evaluate(() => { const root = document.querySelector('[data-studio-theme]'); const out = []; const parse = (s) => { const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/.exec(s || ''); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
    const hsl = ([r, g, b]) => { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); const l = (mx + mn) / 2; if (mx === mn) return [0, 0, l]; const d = mx - mn; const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); let h; if (mx === r) h = (g - b) / d + (g < b ? 6 : 0); else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; return [h * 60, s, l]; };
    for (const e of [root, ...root.querySelectorAll('*')]) { const c = getComputedStyle(e); for (const prop of ['color', 'backgroundColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'outlineColor', 'fill', 'stroke']) { const v = parse(c[prop]); if (!v || v[3] === 0) continue; const [h, s] = hsl(v); if (h >= 160 && h <= 190 && s > 0.4) out.push({ tag: e.tagName, testid: e.dataset.testid || null, prop, v: c[prop] }); } }
    return { n: out.length, first: out.slice(0, 10) }; });
  const brass = async (sel, name) => { const bb = await p.locator(sel).first().boundingBox(); if (!bb) return null; const f = path.join(OUT, `${name}.png`); await p.screenshot({ path: f, clip: { x: Math.floor(bb.x), y: Math.floor(bb.y), width: Math.ceil(bb.width), height: Math.ceil(bb.height) } }); const A = decode(fs.readFileSync(f)); let n = 0, tot = 0; for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const c = A.px(x, y); tot++; if (c[0] - c[2] >= 45) n++; } return { brassPx: n, tot }; };
  // unselected clip: deselect then measure each audio clip body + overview
  await p.keyboard.press('Escape'); await sleep(300); await p.mouse.move(W - 2, 2); await sleep(200);
  res.brass = { overview: await brass('[data-testid=arrangement-overview-frame]', 'overview') }; { const ids = await p.evaluate(() => [...document.querySelectorAll('[data-clip-kind=audio]')].map((e) => e.dataset.clipId)); for (const cid of ids) res.brass['clip-' + cid.slice(0, 6)] = await brass(`[data-clip-id="${cid}"]`, 'clip-' + cid.slice(0, 6)); }
  // library (rest) is already in rich scan; marker menu
  const flag = p.locator('[data-testid=arrangement-marker]').first(); const fb = await flag.boundingBox(); await p.mouse.click(fb.x + fb.width / 2, fb.y + fb.height / 2, { button: 'right' }); await sleep(400);
  res.markerMenu = await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-marker-menu]'));
  res.states.markerMenu = await p.evaluate(scan); await p.screenshot({ path: path.join(OUT, 'marker-menu.png') });
  await p.keyboard.press('Escape'); await sleep(300);
  // export dialog
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Export'); b.click(); }); await p.waitForSelector('#arrangement-export-title'); await sleep(600);
  res.states.exportDlg = await p.evaluate(scan); await p.screenshot({ path: path.join(OUT, 'export.png') });
  await p.keyboard.press('Escape'); await sleep(300);
  // library filtered + previewing state
  await p.fill('[data-testid=arrangement-library-search]', 'impact'); await sleep(500); res.states.libFiltered = await p.evaluate(scan);
  await p.fill('[data-testid=arrangement-library-search]', 'zzzz'); await sleep(500); res.states.libEmpty = await p.evaluate(scan);
  await p.fill('[data-testid=arrangement-library-search]', ''); await sleep(400);
  // C258: shortcut sheet open (RV-EN 7th state)
  await p.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); }); await p.mouse.click(W - 2, 2); await sleep(150); await p.keyboard.press('Shift+Slash'); await sleep(600); res.sheetOpen = await p.evaluate(() => !!document.querySelector('[role=dialog] [data-shortcut-id]')); res.states.sheet = await p.evaluate(scan); await p.screenshot({ path: path.join(OUT, 'sheet.png') }); await p.keyboard.press('Escape'); await sleep(300);
  // classify
  const isLedger = (v) => { let s = v; for (const x of LEDGER) s = s.split(x).join(''); return !/[Ⴀ-ჿ]/.test(s); };
  res.classified = {}; let nonLedger = [];
  for (const [k, st] of Object.entries(res.states)) { const nl = st.hits.filter((h) => !isLedger(h.v)); res.classified[k] = { total: st.hits.length, ledger: st.hits.length - nl.length, nonLedger: nl, titleGe: st.titleGe }; nonLedger = nonLedger.concat(nl.map((h) => ({ state: k, ...h }))); }
  res.ledgerSample = [...new Set(Object.values(res.states).flatMap((s) => s.hits.map((h) => `${h.kind}|${h.testid}|${h.v}`)))].slice(0, 40);
  res.net = log; L.save(path.join(__dirname, '..', 'out'), `${id}.json`, res);
  console.log(JSON.stringify({ setup: res.setup, nonLedger, classified: Object.fromEntries(Object.entries(res.classified).map(([k, v]) => [k, [v.total, v.ledger, v.nonLedger.length, v.titleGe]])), tokens: res.tokens, icons: { glyph: res.icons.glyphText, noSvg: res.icons.iconOnly.filter((x) => !x.svg), nIcon: res.icons.iconOnly.length, tool: res.icons.tool, ov: res.icons.overview, det: res.icons.detail, dock: res.icons.dock }, teal: res.teal, brass: res.brass, markerMenu: res.markerMenu, net: { e: log.errors, h: log.hydration, f: log.forbidden, a: log.authHeaders, noise: log.noise } }, null, 1));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
