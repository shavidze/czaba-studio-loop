// C round 153 — LABEL-STYLE + NO-CLIP (+ accessible names). node labels.cjs <1440|1280>
// "pre" = the same live page with the 4 label classes stripped at runtime (Master gets back text-xs font-medium) = the round-152 rendering; restored afterwards.
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const net = [];
const res = { vp: W, utc: new Date().toISOString(), errors: [] };
const OUTF = path.join(L.OUT, `labels-${W}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const sec = async (n, fn) => { try { res[n] = await fn(); } catch (e) { res.errors.push(`${n}: ${String(e.stack || e).slice(0, 600)}`); } save(); };
const NEIGH = { markerAdd: '[data-testid=arrangement-marker-add]', markerPrev: '[data-testid=arrangement-marker-prev]', markerNext: '[data-testid=arrangement-marker-next]', tempoInput: '[data-testid=arrangement-tempo-input]', metronome: '[data-testid=arrangement-metronome-toggle]', follow: '[data-testid=arrangement-follow]', caption: '[data-testid=arrangement-video-caption]', master: '[data-testid=arrangement-master]', zoomReadout: '[data-testid=arrangement-zoom-readout]' };
function measure(NEIGH) {
  const box = (e) => { const b = e.getBoundingClientRect(); return [+b.x.toFixed(1), +b.y.toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)]; };
  const clipInfo = (e) => { const cs = getComputedStyle(e); const lines = e.getClientRects().length; return { sw: e.scrollWidth, cw: e.clientWidth, overflowX: e.scrollWidth > e.clientWidth, textOverflow: cs.textOverflow, whiteSpace: cs.whiteSpace, ovf: cs.overflowX, rects: lines }; };
  const labels = [...document.querySelectorAll('.tracking-label,[data-c153]')].map((e) => { const cs = getComputedStyle(e); const par = e.parentElement; const pb = par.getBoundingClientRect(); const b = e.getBoundingClientRect(); return { text: e.textContent, innerText: e.innerText, parentText: par.textContent.replace(/\s+/g, ' ').trim().slice(0, 80), cls: e.className, fontSize: cs.fontSize, lineHeight: cs.lineHeight, fontWeight: cs.fontWeight, letterSpacing: cs.letterSpacing, textTransform: cs.textTransform, fontFamily: cs.fontFamily, color: cs.color, box: box(e), rects: e.getClientRects().length, parentTag: par.tagName, parent: clipInfo(par), insideParent: b.left >= pb.left - 0.5 && b.right <= pb.right + 0.5 }; });
  const neigh = {}; for (const [k, s] of Object.entries(NEIGH)) { const e = document.querySelector(s); neigh[k] = e ? { box: box(e), ...clipInfo(e), text: (e.textContent || e.value || '').trim().slice(0, 60) } : null; }
  const col = (s) => { const e = document.querySelector(s); const h = e && e.querySelector('.sticky'); return h ? { box: box(h), ...clipInfo(h), kidsRight: Math.max(...[...h.children].map((c) => c.getBoundingClientRect().right)), right: h.getBoundingClientRect().right } : null; };
  neigh.markerHeaderCol = col('[data-testid=arrangement-marker-row]'); { const ti = document.querySelector('[data-testid=arrangement-tempo-input]'); const h = ti && ti.parentElement; neigh.tempoHeaderCol = h ? { box: box(h), ...clipInfo(h), kidsRight: Math.max(...[...h.children].map((c) => c.getBoundingClientRect().right)), right: h.getBoundingClientRect().right } : null; }
  const fourFour = [...((document.querySelector('[data-testid=arrangement-tempo-input]') || {}).parentElement || document).querySelectorAll('span')].find((s) => s.textContent.trim() === '4/4'); neigh.fourFour = fourFour ? { box: box(fourFour), ...clipInfo(fourFour) } : null;
  const loopStrip = document.querySelector('[data-testid=arrangement-loop-strip]'); neigh.loopStrip = loopStrip ? { box: box(loopStrip), text: loopStrip.textContent.trim().slice(0, 60) } : null;
  return { n: labels.length, labels, neigh, overview: (() => { const c = document.querySelector('[data-testid=arrangement-video-caption]'); const s = c && c.parentElement.querySelector('span.shrink-0'); return s ? { text: s.textContent, box: box(s), note: s.querySelector('.text-dim') ? box(s.querySelector('.text-dim')) : null } : null; })() };
}
const strip = () => { for (const e of document.querySelectorAll('.tracking-label')) { e.dataset.c153 = e.className; const master = e.parentElement && e.parentElement.dataset.testid === 'arrangement-master'; e.className = master ? 'text-xs font-medium text-muted' : ''; } };
const unstrip = () => { for (const e of document.querySelectorAll('[data-c153]')) { e.className = e.dataset.c153; delete e.dataset.c153; } };
async function platformFonts(p) {
  const cdp = await p.context().newCDPSession(p); await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
  const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '.tracking-label' });
  const out = [];
  for (const id of nodeIds) { const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId: id }); out.push(fonts.map((f) => `${f.familyName}${f.isCustomFont ? ' [web]' : ' [local]'} ${f.glyphCount}`)); }
  await cdp.detach(); return out;
}
async function axNames(p) {
  const cdp = await p.context().newCDPSession(p); await cdp.send('DOM.enable'); await cdp.send('Accessibility.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
  const sels = { masterFieldset: '[data-testid=arrangement-master]', masterMute: '[data-testid=arrangement-master] button', masterVolume: '[data-testid=arrangement-master] input', zoomSlider: 'input[type=range][aria-label*=oom]', zoomLabel: 'label:has(> input[type=range][aria-label*=oom])', markerAdd: '[data-testid=arrangement-marker-add]', markerPrev: '[data-testid=arrangement-marker-prev]', markerNext: '[data-testid=arrangement-marker-next]', tempoInput: '[data-testid=arrangement-tempo-input]', metronome: '[data-testid=arrangement-metronome-toggle]', follow: '[data-testid=arrangement-follow]', loopStrip: '[data-testid=arrangement-loop-strip]' };
  const out = {};
  for (const [k, s] of Object.entries(sels)) { try { const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: s }); if (!nodeId) { out[k] = null; continue; } const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false }); const n = nodes[0]; out[k] = { role: n.role && n.role.value, name: n.name && n.name.value, ignored: n.ignored }; } catch (e) { out[k] = { err: String(e).slice(0, 120) }; } }
  // label spans themselves (StaticText under them)
  await cdp.detach(); return out;
}
async function cropLabels(p, tag) { const bs = await p.evaluate(() => [...document.querySelectorAll('.tracking-label')].map((e) => { const b = e.getBoundingClientRect(); return { t: e.textContent, x: b.x, y: b.y, w: b.width, h: b.height }; })); const shots = []; for (const b of bs) { const f = `label-${tag}-${b.t}-${W}.png`; await p.screenshot({ path: path.join(L.SHOTS, f), clip: { x: Math.max(0, b.x - 8), y: Math.max(0, b.y - 6), width: b.w + 90, height: b.h + 12 } }); shots.push(`c-round-153/shots/${f}`); } return shots; }
async function both(p, tag) {
  const post = await p.evaluate(measure, NEIGH); const fonts = await platformFonts(p); const ax = await axNames(p); const shots = await cropLabels(p, tag);
  await p.screenshot({ path: path.join(L.SHOTS, `labels-${tag}-full-${W}.png`) });
  await p.evaluate(strip); await sleep(300); const pre = await p.evaluate(measure, NEIGH); const axPre = await axNames(p);
  await p.screenshot({ path: path.join(L.SHOTS, `labels-${tag}-PRESIM-full-${W}.png`) });
  await p.evaluate(unstrip); await sleep(300); const post2 = await p.evaluate(measure, NEIGH);
  return { post, fonts, ax, pre, axPre, restoredSame: JSON.stringify(post) === JSON.stringify(post2), shots };
}
(async () => {
  const b = await L.launch();
  try {
    const { page: p, log } = await L.openStudio(b, X.VPS[W], `labels-${W}`, net);
    await p.mouse.move(2, 2); await sleep(300); res.fontsWait = log.fontsReady;
    await sec('S0', () => both(p, 'S0'));
    await sec('S1build', async () => {
      await L.setSnapOff(p);
      const a = [await L.addAt(p, 'demo-hero-music', 'music', 0), await L.addAt(p, 'demo-stem-pulse', 'stems', 2), await L.addAt(p, 'demo-soft-impact', 'sfx', 4)].map((r) => r.status);
      await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
      const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems').id;
      await X.rangeDrag(p, stems, 4, 2); const loop = await X.key(p, 'Control+l');
      await L.blur(p); await p.mouse.move(2, 2); await sleep(500); await L.fontsWait(p);
      return { a, loop, loopTimes: await p.evaluate(() => (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent || null) };
    });
    await sec('S1', () => both(p, 'S1'));
  } catch (e) { res.errors.push(String(e.stack || e)); }
  res.net = X.netOk(net); res.fontResp = net.map((n) => ({ fontResp: n.fontResp.map((f) => f.s), fontFail: n.fontFail })); save();
  await b.close(); console.log('saved', OUTF, res.errors);
})();
