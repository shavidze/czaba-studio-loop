// C round 126 — D3-A: SFX lane under the detail panel at 1280x720 (D-29b cap).
// node d3a.cjs <withGroup|withoutGroup> <hidden|real>  (real = HR-REAL-SCROLLBARS: --hide-scrollbars removed)
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const MODE = process.argv[2] || 'withGroup'; const SB = process.argv[3] || 'hidden';
const RUNID = `${MODE}-${SB}-${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}`;
const net = []; const OUTD = path.join(L.ROOT, 'out', 'd3a'); fs.mkdirSync(OUTD, { recursive: true });
const W = 1280;

function measure() {
  const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { top: +b.top.toFixed(1), bottom: +b.bottom.toFixed(1), h: +b.height.toFixed(1), left: +b.left.toFixed(1), w: +b.width.toFixed(1) }; };
  const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
  const panel = document.querySelector('[data-testid=arrangement-detail-panel]');
  const sep = document.querySelector('[data-testid=arrangement-detail-separator]');
  const tog = document.querySelector('[data-testid=arrangement-detail-toggle]');
  const scB = sc.getBoundingClientRect();
  const rows = [...sc.querySelectorAll('[data-track-id]')].filter((e) => !e.parentElement.closest('[data-track-id]'));
  const lanes = rows.map((e) => { const b = r(e); return { id: e.dataset.trackId, ...b, fullyVisible: b.top >= scB.top - 0.5 && b.bottom <= scB.top + sc.clientHeight + 0.5, visiblePx: +Math.max(0, Math.min(b.bottom, scB.top + sc.clientHeight) - Math.max(b.top, scB.top)).toFixed(1) }; });
  const sfxClip = document.querySelector('[data-track-id=sfx] [data-clip-id]');
  let sfxClipHit = null;
  if (sfxClip) { const b = sfxClip.getBoundingClientRect(); const cx = b.left + Math.min(30, b.width / 2), cy = b.top + b.height / 2; const el = document.elementFromPoint(cx, Math.min(innerHeight - 1, Math.max(0, cy))); sfxClipHit = { cx, cy, hitIsClip: !!(el && sfxClip.contains(el)), hit: el ? (el.getAttribute('data-testid') || el.tagName) + '|' + ((el.closest('[data-testid]') || {}).dataset || {}).testid : null }; }
  return {
    panel: r(panel), panelAriaNow: sep ? sep.getAttribute('aria-valuenow') : null, toggleExpanded: tog ? tog.getAttribute('aria-expanded') : null,
    scroller: { ...r(sc), clientHeight: sc.clientHeight, scrollHeight: sc.scrollHeight, scrollTop: sc.scrollTop, offsetHeight: sc.offsetHeight, hScrollbarPx: sc.offsetHeight - sc.clientHeight - 0, vScrollbarPx: sc.offsetWidth - sc.clientWidth },
    ruler: r(document.querySelector('[data-testid=arrangement-ruler]')), loopStrip: r(document.querySelector('[data-testid=arrangement-loop-strip]')),
    groupRows: [...document.querySelectorAll('[data-testid=arrangement-group-row]')].map(r),
    lanes, sfxClipHit, vh: innerHeight,
    autoFit: (document.querySelector('[aria-pressed][title*="Auto"], [data-testid*=auto-fit]') || {}).outerHTML?.slice(0, 160) || null,
  };
}
async function buildS1(p, withGroup) {
  const st = [];
  st.push({ s: 'snapOff', v: await L.setSnapOff(p) });
  st.push({ s: 'music@0', v: (await L.addAt(p, 'demo-hero-music', 'music', 0)).status });
  st.push({ s: 'stems@2', v: (await L.addAt(p, 'demo-stem-pulse', 'stems', 2)).status });
  st.push({ s: 'sfx@4', v: (await L.addAt(p, 'demo-soft-impact', 'sfx', 4)).status });
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); st.push({ s: 'video', v: await L.status(p) });
  await L.seekTo(p, 1); await L.blur(p); await p.keyboard.press('m'); await sleep(400); st.push({ s: 'M', v: await L.status(p) });
  const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems').id;
  st.push({ s: 'range 4→2', v: await X.rangeDrag(p, stems, 4, 2) });
  st.push({ s: 'Ctrl+L', v: await X.key(p, 'Control+l') });
  if (withGroup) { await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150); st.push({ s: 'Ctrl+G', v: await X.key(p, 'Control+g') }); }
  const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx');
  st.push({ s: 'sfx clip box before select', v: await p.locator(`[data-clip-id="${sfx.id}"]`).boundingBox() });
  try { await L.selectClip(p, sfx.id); st.push({ s: 'select sfx (header click)', v: (await L.detailInfo(p)).text }); } catch (e) { st.push({ s: 'select sfx FAILED', v: String(e) }); }
  st.push({ s: 'before toggle', v: await p.evaluate(measure) });
  const ex = await X.openDetail(p); st.push({ s: `toggle (was aria-expanded=${ex})`, v: (await L.detailInfo(p)).text });
  await L.blur(p); await p.mouse.move(2, 2); await sleep(600);
  return { steps: st, sfxId: sfx.id };
}
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'], ...(SB === 'real' ? { ignoreDefaultArgs: ['--hide-scrollbars'] } : {}) });
  const res = { runId: RUNID, mode: MODE, scrollbars: SB, vp: '1280x720' };
  try {
    const { page: p } = await L.openStudio(b, X.VPS[W], `d3a-${RUNID}`, net);
    res.s0 = await p.evaluate(measure);
    const s1 = await buildS1(p, MODE === 'withGroup'); res.steps = s1.steps;
    res.s1 = await p.evaluate(measure);
    res.shotS1 = await X.shot(p, `D3A-S1-${RUNID}.png`);
    // Path 1: wheel over lane area (over the music lane body, middle x)
    const sc = res.s1.scroller;
    const wx = 900, wy = Math.round(sc.top + Math.min(120, sc.clientHeight / 2));
    await p.mouse.move(wx, wy); await p.mouse.wheel(0, 300); await sleep(500);
    res.path1 = { action: `mouse.wheel(0,300) at (${wx},${wy})`, after: await p.evaluate(measure) };
    res.shotP1 = await X.shot(p, `D3A-P1wheel-${RUNID}.png`);
    // try clicking the SFX clip after wheel
    if (res.path1.after.sfxClipHit && res.path1.after.sfxClipHit.hitIsClip) {
      await p.mouse.click(res.path1.after.sfxClipHit.cx, res.path1.after.sfxClipHit.cy); await sleep(400);
      res.path1.clickStatus = await L.status(p); res.path1.selAfterClick = (await L.clipsDom(p)).filter((c) => c.sel).map((c) => c.lane);
    }
    // reset scroll
    await p.evaluate(() => { document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollTop = 0; }); await sleep(300);
    // Path 2: vertical scrollbar — drag on the right edge of the scroller (only meaningful with real scrollbars)
    const m2 = await p.evaluate(measure);
    if (m2.scroller.vScrollbarPx > 0) {
      const x = m2.scroller.left + m2.scroller.w - m2.scroller.vScrollbarPx / 2; const yMid = m2.scroller.top + m2.scroller.clientHeight * 0.45;
      const hitAt = (yy) => p.evaluate(([xx, y2]) => { const e = document.elementFromPoint(xx, y2); return e ? (e.getAttribute('data-testid') || e.tagName) : null; }, [x, yy]);
      const z0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-zoom-readout]').textContent.trim());
      const hit = await hitAt(yMid);
      await p.mouse.move(x, yMid); await p.mouse.down(); await p.mouse.move(x, yMid + 150, { steps: 8 }); await p.mouse.up(); await sleep(400);
      const a1 = await p.evaluate(measure);
      // track click below thumb (page step) if drag did nothing
      let a2 = null; if (a1.scroller.scrollTop === 0) { await p.mouse.click(x, m2.scroller.top + m2.scroller.clientHeight - 6); await sleep(400); a2 = await p.evaluate(measure); }
      const z1 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-zoom-readout]').textContent.trim());
      res.path2 = { action: `drag in vertical scrollbar gutter x=${x.toFixed(0)} y=${yMid.toFixed(0)} +150; then track click near bottom if scrollTop stayed 0`, hitAtDragPoint: hit, zoomBefore: z0, zoomAfter: z1, after: a1, afterTrackClick: a2 };
      res.shotP2 = await X.shot(p, `D3A-P2scrollbar-${RUNID}.png`);
    } else res.path2 = { action: 'no vertical scrollbar rendered', vScrollbarPx: m2.scroller.vScrollbarPx, scrollable: m2.scroller.scrollHeight > m2.scroller.clientHeight };
    await p.evaluate(() => { document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollTop = 0; }); await sleep(300);
    // Path 3: visible collapse toggle
    await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(700); await L.blur(p); await p.mouse.move(2, 2); await sleep(300);
    res.path3 = { action: 'click detail toggle (collapse)', after: await p.evaluate(measure) };
    res.shotP3 = await X.shot(p, `D3A-P3collapse-${RUNID}.png`);
    await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(700); await L.blur(p); await p.mouse.move(2, 2); await sleep(300);
    res.path3.reExpanded = await p.evaluate(measure);
    // Path 4: separator drag down 60 px
    const sp = await p.locator('[data-testid=arrangement-detail-separator]').boundingBox();
    if (sp) { const x = sp.x + sp.width / 2, y = sp.y + sp.height / 2; await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x, y + 60, { steps: 8 }); await p.mouse.up(); await sleep(600); await p.mouse.move(2, 2); await sleep(300); res.path4 = { action: `separator drag (${x.toFixed(0)},${y.toFixed(0)}) +60 px`, sepBox: sp, after: await p.evaluate(measure) }; res.shotP4 = await X.shot(p, `D3A-P4separator-${RUNID}.png`); }
  } catch (e) { res.error = String(e.stack || e); }
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(OUTD, `d3a-${RUNID}.json`), JSON.stringify(res, null, 1));
  const brief = (m) => m && ({ panel: m.panel && m.panel.h, aria: m.panelAriaNow, exp: m.toggleExpanded, sc: [m.scroller.clientHeight, m.scroller.scrollHeight, m.scroller.scrollTop, 'vsb', m.scroller.vScrollbarPx, 'hsb', m.scroller.hScrollbarPx], lanes: m.lanes.map((l) => `${l.id}:${l.top}-${l.bottom}(${l.h})${l.fullyVisible ? 'V' : 'x' + l.visiblePx}`).join(' '), groups: m.groupRows.length, sfxHit: m.sfxClipHit && m.sfxClipHit.hitIsClip + ' ' + m.sfxClipHit.hit });
  console.log(JSON.stringify({ runId: RUNID, err: res.error, s1: brief(res.s1), p1: brief(res.path1 && res.path1.after), p1click: res.path1 && res.path1.clickStatus, p2: res.path2 && (res.path2.after ? { hit: res.path2.hitAtDragPoint, z: [res.path2.zoomBefore, res.path2.zoomAfter], drag: brief(res.path2.after), track: brief(res.path2.afterTrackClick) } : res.path2), p3: brief(res.path3 && res.path3.after), p3re: brief(res.path3 && res.path3.reExpanded), p4: brief(res.path4 && res.path4.after), net: res.net, steps: (res.steps || []).map((s) => s.s + ' → ' + JSON.stringify(s.v).slice(0, 100)) }, null, 1));
  await b.close();
})();
