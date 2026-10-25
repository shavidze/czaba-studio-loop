// C round 151 — FONTS-APPLIED (CDP platform fonts), TOKENS-SCOPED, NO-CLIP (+extremes), VISUAL shots. node c151.cjs <1440|1280>
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const TAG = process.argv[3] || ''; const net = [];
const res = { vp: W, utc: new Date().toISOString(), errors: [] };
const OUTF = path.join(L.OUT, `fontspot-${W}${TAG}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const sec = async (n, fn) => { try { res[n] = await fn(); } catch (e) { res.errors.push(`${n}: ${String(e.stack || e).slice(0, 600)}`); } save(); };
const shot = async (p, name) => { await p.screenshot({ path: path.join(L.SHOTS, `${name}-${W}.png`) }); return `c-round-154/shots/${name}-${W}.png`; };
const TOK = ['background','surface','elevated','muted-bg','outline','outline-hover','outline-strong','outline-light','foreground','muted','dim','brand','brand-hover','brand-foreground','accent','positive','warning','destructive'];

// Tag the deepest element that owns a non-empty direct text node and matches pred.
async function tagEls(p, specs) {
  return p.evaluate((specs) => {
    for (const e of document.querySelectorAll('[data-c151]')) e.removeAttribute('data-c151');
    const own = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
    const out = {};
    for (const [name, sel, re] of specs) {
      const rx = re ? new RegExp(re) : null;
      const cand = [...document.querySelectorAll(sel)].filter((e) => e.tagName === 'INPUT' ? (!rx || rx.test(e.value)) : own(e) && (!rx || rx.test(own(e))));
      const e = cand[0];
      if (!e) { out[name] = null; continue; }
      e.setAttribute('data-c151', name);
      out[name] = { tag: e.tagName, text: e.tagName === 'INPUT' ? e.value : own(e).slice(0, 60), computed: getComputedStyle(e).fontFamily, weight: getComputedStyle(e).fontWeight, size: getComputedStyle(e).fontSize, n: cand.length };
    }
    return out;
  }, specs);
}
async function platformFonts(p, names) {
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
  const find = (n, name, acc) => { if (n.attributes) { for (let i = 0; i < n.attributes.length; i += 2) if (n.attributes[i] === 'data-c151' && n.attributes[i + 1] === name) acc.push(n); } for (const k of [...(n.children || []), ...(n.shadowRoots || []), ...(n.contentDocument ? [n.contentDocument] : [])]) find(k, name, acc); return acc; };
  const elems = (n, acc) => { if (n.nodeType === 1) acc.push(n); for (const k of [...(n.children || []), ...(n.shadowRoots || [])]) elems(k, acc); return acc; };
  const out = {};
  for (const name of names) {
    const [node] = find(root, name, []);
    if (!node) { out[name] = null; continue; }
    const targets = node.nodeName === 'INPUT' ? elems(node, []) : [node];
    const merged = {};
    for (const t of targets) { try { const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId: t.nodeId }); for (const f of fonts) { const k = `${f.familyName}${f.isCustomFont ? ' [web]' : ' [local]'}`; merged[k] = (merged[k] || 0) + f.glyphCount; } } catch (e) { merged.err = String(e).slice(0, 100); } }
    out[name] = merged;
  }
  await cdp.detach();
  return out;
}
const tokensAt = (p) => p.evaluate((TOK) => {
  const rd = (el) => { if (!el) return null; const cs = getComputedStyle(el); const o = {}; for (const t of TOK) o[t] = cs.getPropertyValue('--color-' + t).trim(); o['--font-sans'] = cs.getPropertyValue('--font-sans').trim(); o['--font-mono'] = cs.getPropertyValue('--font-mono').trim(); o['font-family'] = cs.fontFamily; return o; };
  return { html: rd(document.documentElement), body: rd(document.body), workspace: rd(document.querySelector('.studio-container')), exportDialog: rd(document.querySelector('[role=dialog][aria-labelledby=arrangement-export-title]')), markerMenu: rd(document.querySelector('[data-testid=arrangement-marker-menu]')) };
}, TOK);
const fontFaces = (p) => p.evaluate(() => [...new Set([...document.fonts].map((f) => `${f.family.replace(/"/g, '')} ${f.weight} ${f.style} ${f.status}`))].sort());
// NO-CLIP scan: truncate / overflow hidden|clip / text inputs where scrollWidth > clientWidth + 1.
const clipScan = (p) => p.evaluate(() => {
  const vw = innerWidth, vh = innerHeight; const out = [];
  const vis = (e) => { const b = e.getBoundingClientRect(); return e.getClientRects().length > 0 && b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== 'hidden' && b.right > 0 && b.bottom > 0 && b.left < vw && b.top < vh; };
  const cv = document.createElement('canvas').getContext('2d');
  for (const e of document.querySelectorAll('body *')) {
    if (!vis(e)) continue;
    const cs = getComputedStyle(e);
    const isText = e.tagName === 'INPUT' && /^(text|number|search|)$/.test(e.type || '');
    const ov = /hidden|clip/.test(cs.overflowX) || e.classList.contains('truncate');
    if (!isText && !ov) continue;
    if (e.querySelector('canvas,video,svg') && !isText) continue;
    const text = isText ? e.value : (e.textContent || '').trim();
    if (!text) continue;
    cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const tw = cv.measureText(text).width; const avail = e.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const sw = e.scrollWidth, cw = e.clientWidth;
    const cut = sw > cw + 1 || (isText && tw > avail + 0.5);
    if (!cut) continue;
    const tid = e.getAttribute('data-testid') || (e.closest('[data-testid]') || { getAttribute: () => '' }).getAttribute('data-testid');
    out.push({ key: `${tid}|${e.tagName.toLowerCase()}|${text.replace(/\s+/g, ' ').slice(0, 50)}`, sw, cw, textW: +tw.toFixed(1), avail: +avail.toFixed(1), truncateClass: e.classList.contains('truncate'), input: isText, ff: cs.fontFamily.slice(0, 24) });
  }
  return out;
});
const readFit = (p, sel) => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const cs = getComputedStyle(e); const cv = document.createElement('canvas').getContext('2d'); cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; const text = e.tagName === 'INPUT' ? e.value : e.textContent.trim(); const tw = cv.measureText(text).width; const avail = e.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - (e.tagName === 'INPUT' ? 0 : 0); return { text, sw: e.scrollWidth, cw: e.clientWidth, textW: +tw.toFixed(2), avail: +avail.toFixed(2), spare: +(avail - tw).toFixed(2), fits: e.scrollWidth <= e.clientWidth && tw <= avail + 0.5, cls: e.className.match(/text-destructive|font-medium|font-mono/g), ff: cs.fontFamily.slice(0, 20), box: e.getBoundingClientRect().toJSON() }; }, sel);
// Simulated pre-V-2a fonts (Store Inter / Tailwind default mono) for a same-session NO-CLIP baseline.
const PRE_CSS = `[data-studio-theme="obsidian"], body:has([data-studio-theme="obsidian"]) { --font-sans: var(--c151-sans) !important; --font-mono: var(--c151-mono) !important; font-family: var(--c151-body) !important; }`;
async function simulatePre(p, on) {
  if (on) {
    await p.evaluate((css) => { const h = getComputedStyle(document.documentElement); const r = document.documentElement.style; r.setProperty('--c151-sans', h.getPropertyValue('--font-sans')); r.setProperty('--c151-mono', h.getPropertyValue('--font-mono')); r.setProperty('--c151-body', getComputedStyle(document.documentElement).fontFamily); const s = document.createElement('style'); s.id = 'c151-pre'; s.textContent = css; document.head.appendChild(s); }, PRE_CSS);
  } else {
    await p.evaluate(() => { const s = document.getElementById('c151-pre'); if (s) s.remove(); });
  }
  await sleep(400);
  return p.evaluate(() => getComputedStyle(document.querySelector('.studio-container')).fontFamily);
}
async function noClip(p, label) {
  const post = await clipScan(p);
  const ff = await simulatePre(p, true); const pre = await clipScan(p); await simulatePre(p, false);
  const preKeys = new Set(pre.map((x) => x.key));
  return { label, post, preSimulated: pre, preFF: ff, newlyCut: post.filter((x) => !preKeys.has(x.key)), fixedByFonts: pre.filter((x) => !post.some((y) => y.key === x.key)).map((x) => x.key) };
}
const SPEC_S0 = [
  ['title', 'h1', 'CZABA Studio Lab'], ['trackName', '[data-track-id=music] [data-testid=arrangement-track-header] button', '^Music$'], ['libraryTitle', '[data-testid=arrangement-library] h2', 'Library'],
  ['status', '[data-testid=arrangement-status], [data-testid=arrangement-status] *', '.'], ['position', '[data-testid=arrangement-position]', '\\d'], ['projectEnd', '[data-testid=arrangement-project-end]', '\\d'],
  ['bpm', '[data-testid=arrangement-tempo-input]', '\\d'], ['masterReadout', '[data-testid=arrangement-master-readout]', 'dB'], ['masterPeak', '[data-testid=arrangement-master-peak]', '.'],
  ['trackVolume', '[data-track-id=music] span.w-10.tabular-nums', '.'], ['georgianItem', '[data-testid=arrangement-library-option-title]', '^[\\u10A0-\\u10FF\\s]+$'], ['mixedItem', '[data-testid=arrangement-library-option-title]', 'საჯარო'],
  ['panReset', '[data-track-id=music] [data-testid=arrangement-track-pan-reset]', '.'], ['libraryPlayhead', '[data-testid=arrangement-library-playhead]', '.'], ['zoomReadout', '[data-testid=arrangement-zoom-readout]', '.'], ['rulerLabel', '[data-testid=arrangement-ruler] span', '0:01'],
  ['shortcutHint', '[data-testid=arrangement-shortcut-hint]', '.'], ['libDuration', '[data-testid=arrangement-library-list] span', '^\\d\\d:\\d\\d'],
];
async function fontsBlock(p, spec) { const tags = await tagEls(p, spec); const pf = await platformFonts(p, spec.map((s) => s[0])); const o = {}; for (const [n] of spec) o[n] = { ...tags[n], platform: pf[n] }; return o; }
async function setBpm(p, v) { const sel = '[data-testid=arrangement-tempo-input]'; await p.click(sel, { clickCount: 3 }); await p.keyboard.press('Control+a'); await p.keyboard.type(String(v)); await p.keyboard.press('Enter'); await sleep(350); await L.blur(p); return p.evaluate((s) => document.querySelector(s).value, sel); }
(async () => {
  const b = await L.launch();
  try {
    const { page: p, log } = await L.openStudio(b, X.VPS[W], `fontspot-${W}`, net);
    res.fontsReady = log.fontsReady;
    await p.mouse.move(2, 2);
    await sec('fontsWait', () => L.fontsWait(p));
    await sec('facesS0', () => fontFaces(p));
    await sec('bpmSet', async () => setBpm(p, 120));
    await sec('fontsS0', () => fontsBlock(p, SPEC_S0));
    await sec('hintBox', () => p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-shortcut-hint]'); const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, tag: e.tagName, cls: e.className }; }));
    await sec('shotS0', () => shot(p, 'fontspot-S0'));
  } catch (e) { res.errors.push(String(e.stack || e)); }
  res.net = X.netOk(net); res.fontResp = net.map((n) => ({ label: n.label, fontResp: n.fontResp, fontFail: n.fontFail, fontsReady: n.fontsReady }));
  save(); await b.close();
  const f = res.fontsS0 || {};
  for (const k of ['title', 'bpm', 'masterReadout', 'georgianItem', 'mixedItem', 'position']) console.log(k, f[k] && f[k].text, JSON.stringify(f[k] && f[k].platform));
  console.log('hint', JSON.stringify(res.hintBox), 'net', JSON.stringify(res.net), 'errors', res.errors.length);
})();
