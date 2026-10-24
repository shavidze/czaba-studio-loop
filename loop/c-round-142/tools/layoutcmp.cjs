// node layoutcmp.cjs <c142 json> <width>  — compares against B's baseline (detail-baseline-6e9f9b1.json)
const fs = require('fs');
const path = require('path');
const [file, W] = process.argv.slice(2);
const c = JSON.parse(fs.readFileSync(file, 'utf8'));
const B = JSON.parse(fs.readFileSync(path.join(__dirname, '../../b-round-141/out/detail-baseline-6e9f9b1.json'), 'utf8'))[W];
const STRICT = ['arrangement-detail-start', 'arrangement-detail-end', 'arrangement-detail-clip-gain-input', 'arrangement-detail-clip-gain-reset', 'arrangement-detail-clip-gain-fader', 'arrangement-detail-panel', 'arrangement-detail-content', 'arrangement-detail-waveform', 'arrangement-detail-clip-gain', 'arrangement-detail-range'];
const FIT = ['arrangement-detail-apply', 'arrangement-detail-toggle'];
const LINE_LIMITS = { single: {}, none: { 'arrangement-detail-reason': 1, 'arrangement-detail-clip-gain-reason': 1 }, multi: { 'arrangement-detail-reason': 1 }, video: { 'arrangement-detail-clip-gain-reason': 1 }, videoMulti: { 'arrangement-detail-clip-gain-reason': W === '1440' ? 2 : 99 } };
const out = { W, states: {}, breaches: [], notes: [] };
const d = (a, b) => a.map((v, i) => +(v - b[i]).toFixed(1));
for (const st of ['none', 'single', 'multi', 'video', 'videoMulti']) {
  const cur = c.states[st] && c.states[st].measure; const base = B[st];
  if (!cur || !base) { out.notes.push(`${st}: missing (${!cur ? 'c' : 'b'})`); continue; }
  const S = (out.states[st] = { nodes: {}, panel: d(cur.panel, base.panel) });
  const comparable = !(W === '1280'); // B stored only the collapsed panel at 1280
  for (const [id, n] of Object.entries(cur.nodes)) {
    const bn = base.nodes[id];
    if (!bn) { S.nodes[id] = { new: true, box: n.box, lines: n.lines }; continue; }
    const dd = d(n.box, bn.box);
    S.nodes[id] = { d: dd, lines: [bn.lines, n.lines], vis: [bn.visible, n.visible] };
    if (!comparable || !n.visible || !bn.visible) continue;
    const maxd = Math.max(...dd.map(Math.abs));
    if (STRICT.includes(id) && maxd > 1) out.breaches.push({ st, id, kind: 'box>1px', d: dd });
    if (FIT.includes(id) && Math.abs(dd[0]) > 1 && id !== 'arrangement-detail-toggle') out.notes.push({ st, id, kind: 'fit-x', d: dd });
    if (!STRICT.includes(id) && !FIT.includes(id) && maxd > 1) out.notes.push({ st, id, kind: 'other-node-moved', d: dd, lines: [bn.lines, n.lines] });
    if (n.lines > bn.lines) out.breaches.push({ st, id, kind: 'more-lines', lines: [bn.lines, n.lines] });
  }
  for (const [id, lim] of Object.entries(LINE_LIMITS[st] || {})) { const n = cur.nodes[id]; if (n && n.visible && n.lines > lim) out.breaches.push({ st, id, kind: 'line-limit', lim, lines: n.lines }); }
  const g = cur.nodes['arrangement-detail-group']; if (g && g.visible && g.box[3] > 87) out.breaches.push({ st, id: 'group', kind: 'group>87', h: g.box[3] });
  if (cur.contentScroll && (cur.contentScroll[0] > cur.contentScroll[1] + 1 || cur.contentScroll[2] > cur.contentScroll[3] + 1)) (comparable ? out.breaches : out.notes).push({ st, kind: 'contentScroll-overflow', v: cur.contentScroll, base: base.contentScroll });
  if (cur.clippedBelowPanel.length) (comparable ? out.breaches : out.notes).push({ st, kind: 'clippedBelowPanel', v: cur.clippedBelowPanel.map((x) => `${x.tid || x.tag}:${x.text.slice(0, 30)}`), geoSwapClipped: c.states[st].geoSwap.clippedBelowPanel.map((x) => `${x.tid || x.tag}:${x.text.slice(0, 30)}`), geoSwapScroll: c.states[st].geoSwap.contentScroll });
  for (const [id, n] of Object.entries(cur.nodes)) if (n.overflowX && n.visible) out.notes.push({ st, id, kind: 'node-overflowX' });
  S.contentScroll = cur.contentScroll; S.baseContentScroll = base.contentScroll; S.clipped = cur.clippedBelowPanel.length; S.geoSwapClipped = c.states[st].geoSwap.clippedBelowPanel.length;
  S.columns = cur.innerColumns || cur.columns; S.geoSwapColumns = c.states[st].geoSwap.innerColumns || c.states[st].geoSwap.columns;
  S.lineDiffVsGeoSwap = Object.entries(cur.nodes).filter(([id, n]) => c.states[st].geoSwap.nodes[id] && c.states[st].geoSwap.nodes[id].lines !== n.lines).map(([id, n]) => ({ id, en: n.lines, ka: c.states[st].geoSwap.nodes[id].lines }));
}
console.log(JSON.stringify(out, null, 1));
