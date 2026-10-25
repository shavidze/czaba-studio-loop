// C round 151 — FONTS-APPLIED (CDP platform fonts), TOKENS-SCOPED, NO-CLIP (+extremes), VISUAL shots. node c151.cjs <1440|1280>
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const TAG = process.argv[3] || ''; const net = [];
const res = { vp: W, utc: new Date().toISOString(), errors: [] };
const OUTF = path.join(L.OUT, `c151-${W}${TAG}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const sec = async (n, fn) => { try { res[n] = await fn(); } catch (e) { res.errors.push(`${n}: ${String(e.stack || e).slice(0, 600)}`); } save(); };
const shot = async (p, name) => { await p.screenshot({ path: path.join(L.SHOTS, `${name}-${W}.png`) }); return `c-round-153/shots/${name}-${W}.png`; };
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
async function rangeKey(p, sel, key) { await p.focus(sel); await p.keyboard.press(key); await sleep(250); await p.keyboard.up('Shift').catch(() => {}); await L.blur(p); await sleep(250); }
(async () => {
  const b = await L.launch();
  try {
    const { page: p, log } = await L.openStudio(b, X.VPS[W], `c151-${W}${TAG}`, net);
    res.fontsReady = log.fontsReady;
    await p.mouse.move(2, 2);
    await sec('snapStart', async () => p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap));
    await sec('facesS0', () => fontFaces(p));
    await sec('shotS0', () => shot(p, 'S0'));
    await sec('noClipS0', () => noClip(p, 'S0'));
    await sec('bpmSet', async () => setBpm(p, 120));
    await sec('fontsS0', () => fontsBlock(p, SPEC_S0));
    await sec('tokensS0', () => tokensAt(p));
    // S1 as in d6 buildS1
    await sec('s1', async () => {
      const st = [];
      st.push(await L.setSnapOff(p));
      st.push((await L.addAt(p, 'demo-hero-music', 'music', 0)).status); st.push((await L.addAt(p, 'demo-stem-pulse', 'stems', 2)).status); st.push((await L.addAt(p, 'demo-soft-impact', 'sfx', 4)).status);
      await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); st.push(await L.status(p));
      await L.seekTo(p, 1); await L.blur(p); await p.keyboard.press('m'); await sleep(400); st.push(await L.status(p));
      const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems').id; st.push(await X.rangeDrag(p, stems, 4, 2));
      st.push(await X.key(p, 'Control+l'));
      await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150); st.push(await X.key(p, 'Control+g'));
      const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id; await L.selectClip(p, sfx);
      if (W === 1280) st.push('detailToggleWas=' + (await X.openDetail(p)));
      await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
      st.push(await L.fontsWait(p));
      return st;
    });
    await sec('shotS1', () => shot(p, 'S1'));
    await sec('shotLoopStrip', async () => { const s = await p.locator('[data-testid=arrangement-loop-strip]').boundingBox(); if (!s) return null; await p.screenshot({ path: path.join(L.SHOTS, `loop-on-strip-${W}.png`), clip: { x: s.x, y: Math.max(0, s.y - 60), width: Math.min(700, s.width), height: s.height + 70 } }); return `c-round-153/shots/loop-on-strip-${W}.png`; });
    await sec('noClipS1', () => noClip(p, 'S1'));
    await sec('fontsS1', () => fontsBlock(p, [['fromField', '[data-testid=arrangement-detail-start]', '.'], ['toField', '[data-testid=arrangement-detail-end]', '.'], ['clipGain', '[data-testid=arrangement-detail-clip-gain-input]', '.'], ['loopTimes', '[data-testid=arrangement-loop-times], [data-testid=arrangement-loop-times] *', '\\d'], ['detailLine', '[data-testid=arrangement-detail-content] .font-mono, [data-testid=arrangement-detail-content] .font-mono *', '\\d'], ['detailSansSpan', '[data-testid=arrangement-detail-content] .font-mono .font-sans', '.'], ['position', '[data-testid=arrangement-position]', '\\d'], ['trackVolume', '[data-track-id=sfx] span.w-10.tabular-nums', '.'], ['groupName', '[data-testid=arrangement-group-row] *', '.'], ['clipTitle', '[data-clip-id] *', '[A-Za-z]']]));
    await sec('markerMenu', async () => {
      const m = p.locator('[data-testid=arrangement-marker]').first(); const bb = await m.boundingBox();
      await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2, { button: 'right' }); await sleep(500);
      const open = await p.locator('[data-testid=arrangement-marker-menu]').count();
      const f = await fontsBlock(p, [['menuItem', '[data-testid=arrangement-marker-menu] [role=menuitem], [data-testid=arrangement-marker-menu] [role=menuitem] *', '[A-Za-z\\u10A0-\\u10FF]']]);
      const tok = await tokensAt(p); const s = await shot(p, 'marker-menu');
      await p.keyboard.press('Escape'); await sleep(400); const closed = await p.locator('[data-testid=arrangement-marker-menu]').count();
      return { open, closedAfterEscape: closed === 0, fonts: f, tokens: tok, shot: s };
    });
    await sec('exportDialog', async () => {
      await X.openDlg(p); await p.mouse.move(2, 2); await sleep(400); await L.fontsWait(p);
      const f = await fontsBlock(p, [['exportTitle', '#arrangement-export-title', '.'], ['exportBody', '[role=dialog][aria-labelledby=arrangement-export-title] p, [role=dialog][aria-labelledby=arrangement-export-title] label', '[A-Za-z\\u10A0-\\u10FF]']]);
      const tok = await tokensAt(p); const s = await shot(p, 'S2-export'); const nc = await noClip(p, 'S2');
      await p.keyboard.press('Escape'); await sleep(400); const closed = await p.locator('#arrangement-export-title').count();
      return { fonts: f, tokens: tok, shot: s, noClip: nc, closedAfterEscape: closed === 0 };
    });
    await sec('facesEnd', () => fontFaces(p));
    // Extremes
    await sec('extremes', async () => {
      const o = {};
      for (const v of ['300', '123.45', '20']) { o[`bpm${v}`] = { value: await setBpm(p, v), fit: await readFit(p, '[data-testid=arrangement-tempo-input]') }; }
      o.bpmShot = await (async () => { await setBpm(p, '123.45'); const bb = await p.locator('[data-testid=arrangement-tempo-input]').boundingBox(); await p.screenshot({ path: path.join(L.SHOTS, `bpm-123.45-${W}.png`), clip: { x: bb.x - 40, y: bb.y - 8, width: bb.width + 120, height: bb.height + 16 } }); return `c-round-153/shots/bpm-123.45-${W}.png`; })();
      const MV = 'input[aria-label="Master Volume"]';
      await rangeKey(p, MV, 'End'); o.masterMax = await readFit(p, '[data-testid=arrangement-master-readout]');
      await rangeKey(p, MV, 'Home'); o.masterMin = await readFit(p, '[data-testid=arrangement-master-readout]');
      const TV = '[data-track-id=music] input[type=range][aria-label^="Volume"]';
      await rangeKey(p, TV, 'Home'); o.trackMin = await readFit(p, '[data-track-id=music] span.w-10.tabular-nums');
      await tagEls(p, [['trackMinNode', '[data-track-id=music] span.w-10.tabular-nums', '.'], ['masterMinNode', '[data-testid=arrangement-master-readout]', '.']]); o.trackMinPlatform = await platformFonts(p, ['trackMinNode', 'masterMinNode']);
      { const bb = await p.locator('[data-track-id=music] [data-testid=arrangement-track-header]').boundingBox(); await p.screenshot({ path: path.join(L.SHOTS, `track-vol-min-${W}.png`), clip: { x: bb.x, y: bb.y, width: bb.width, height: Math.min(bb.height, 90) } }); o.trackMinShot = `c-round-153/shots/track-vol-min-${W}.png`; }
      await rangeKey(p, TV, 'End'); o.trackMax = await readFit(p, '[data-track-id=music] span.w-10.tabular-nums');
      // Peak over: music clip gain +24, master +6, play 3 s.
      const music = (await L.clipsDom(p)).find((c) => c.lane === 'music').id; await L.selectClip(p, music);
      const cg = '[data-testid=arrangement-detail-clip-gain-input]'; await p.click(cg, { clickCount: 3 }); await p.keyboard.press('Control+a'); await p.keyboard.type('24'); await p.keyboard.press('Enter'); await sleep(400); await L.blur(p);
      o.clipGain = await p.evaluate((s) => document.querySelector(s).value, cg);
      await rangeKey(p, MV, 'End'); o.masterForPeak = await p.evaluate(() => document.querySelector('[data-testid=arrangement-master-readout]').textContent);
      await p.keyboard.press('Home'); await sleep(200); await p.keyboard.press('Space'); await sleep(3500);
      o.peakDuring = await readFit(p, '[data-testid=arrangement-master-peak]');
      { const bb = await p.locator('[data-testid=arrangement-master]').boundingBox(); await p.screenshot({ path: path.join(L.SHOTS, `master-peak-over-${W}.png`), clip: { x: bb.x, y: bb.y - 4, width: bb.width, height: bb.height + 8 } }); o.peakShot = `c-round-153/shots/master-peak-over-${W}.png`; }
      await p.keyboard.press('Space'); await sleep(500);
      o.peakAfter = await readFit(p, '[data-testid=arrangement-master-peak]');
      await tagEls(p, [['peakNode', '[data-testid=arrangement-master-peak]', '.']]); o.peakPlatform = await platformFonts(p, ['peakNode']);
      o.noClipExtremes = await clipScan(p);
      return o;
    });
  } catch (e) { res.errors.push(String(e.stack || e)); }
  res.net = X.netOk(net);
  res.fontNet = net.map((n) => ({ label: n.label, css2: n.fontResp.filter((r) => /css2/.test(r.u)), woff2: n.fontResp.filter((r) => /gstatic/.test(r.u)).map((r) => `${r.s} ${r.u.split('/').slice(4, 5)}`), non200: n.fontResp.filter((r) => r.s !== 200), fail: n.fontFail }));
  save(); console.log(JSON.stringify({ vp: W, errors: res.errors, net: res.net, fontNet: res.fontNet.map((f) => ({ css2: f.css2.length, woff2: f.woff2.length, non200: f.non200.length, fail: f.fail.length })) }, null, 1));
  await b.close();
})();
