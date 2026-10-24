// C round 126 — D3-C feedback latency: add, move, trim, Undo, mute, export start. In-page MutationObserver + capture-phase input timestamps.
// node d3c-feedback.cjs <1440|1280>
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440;
const RUNID = `${W}-${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}`; const net = [];
function install() {
  const M = (window.__fb = { muts: [], ev: [] });
  const tag = (n) => { const e = n.nodeType === 1 ? n : n.parentElement; if (!e) return '?'; const t = e.closest('[data-testid]'); const c = e.closest('[data-clip-id]'); return (c ? 'clip:' : '') + (t ? t.getAttribute('data-testid') : e.tagName); };
  new MutationObserver((list) => { const t = performance.now(); const s = new Set(); for (const m of list) { s.add(tag(m.target) + (m.type === 'attributes' ? '@' + m.attributeName : '')); } M.muts.push({ t, what: [...s].slice(0, 12) }); }).observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true, attributeFilter: ['class', 'aria-pressed', 'data-clip-start', 'style', 'disabled', 'aria-busy', 'data-ghost-start'] });
  for (const ty of ['keydown', 'pointerdown', 'pointermove', 'pointerup', 'click']) window.addEventListener(ty, (e) => M.ev.push({ ty, t: performance.now(), key: e.key || null }), true);
}
async function measure(p, name, fn, matchRe) {
  await p.evaluate(() => { window.__fb.muts = []; window.__fb.ev = []; });
  const st0 = await L.status(p);
  await fn(); await sleep(700);
  const r = await p.evaluate(() => ({ muts: window.__fb.muts, ev: window.__fb.ev }));
  const down = r.ev.find((e) => e.ty === 'pointerdown'); const up = [...r.ev].reverse().find((e) => e.ty === 'pointerup');
  const moved = r.ev.filter((e) => e.ty === 'pointermove' && down && up && e.t > down.t && e.t < up.t);
  const isDrag = moved.length > 2;
  const trig = isDrag ? down : [...r.ev].reverse().find((e) => e.ty === 'pointerup' || e.ty === 'keydown' || e.ty === 'click');
  const t0 = trig ? trig.t : (r.ev[0] || {}).t;
  const firstMove = moved[0];
  const duringDrag = isDrag ? r.muts.filter((m) => m.t >= firstMove.t && m.t < up.t && m.what.some((w) => matchRe.test(w))) : [];
  const afterUp = isDrag ? r.muts.filter((m) => m.t >= up.t) : [];
  var dragInfo = isDrag ? { firstMoveToFirstVisualMs: duringDrag[0] ? +(duringDrag[0].t - firstMove.t).toFixed(1) : null, duringWhat: duringDrag[0] && duringDrag[0].what.slice(0, 4), batchesDuringDrag: duringDrag.length, upToCommitMs: afterUp[0] ? +(afterUp[0].t - up.t).toFixed(1) : null, commitWhat: afterUp[0] && afterUp[0].what.slice(0, 4) } : null;
  const after = r.muts.filter((m) => m.t >= t0);
  const first = after[0]; const rel = after.find((m) => m.what.some((w) => matchRe.test(w)));
  const statusMut = after.find((m) => m.what.some((w) => /arrangement-status/.test(w)));
  const st1 = await L.status(p);
  return { name, trigger: trig && trig.ty, firstMutationMs: first ? +(first.t - t0).toFixed(1) : null, relevantMs: rel ? +(rel.t - t0).toFixed(1) : null, relevantWhat: rel && rel.what, statusMs: statusMut ? +(statusMut.t - t0).toFixed(1) : null, statusChanged: st0 !== st1, status: st1.slice(0, 120), mutationBatches: after.length, drag: dragInfo };
}
(async () => {
  const b = await L.launch(); const res = { runId: RUNID, vp: W, rows: [] };
  try {
    const { page: p } = await L.openStudio(b, X.VPS[W], `d3cfb-${RUNID}`, net);
    await p.evaluate(install);
    await L.setSnapOff(p);
    await L.addAt(p, 'demo-hero-music', 'music', 0);
    // 1 add: click "+ დამატება" with SFX lane active and playhead at 4
    await p.click(L.nameSel('sfx')); await sleep(200); await L.seekTo(p, 4);
    const opt = p.locator('[role=option][data-source-id="demo-soft-impact"]'); await opt.scrollIntoViewIfNeeded(); await opt.click(); await sleep(300);
    res.rows.push(await measure(p, 'add (+ დამატება click)', () => p.getByRole('button', { name: /＋ დამატება/ }).click(), /^clip:/));
    const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id;
    // 2 move: drag header +1 s
    res.rows.push(await measure(p, 'move (drag header +1 s)', () => H.dragHeader(p, sfx, 1), /^clip:|data-clip-start/));
    res.shotMove = await X.shot(p, `D3C-fb-move-${RUNID}.png`);
    // 3 trim right edge -0.5 s
    const sfx2 = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id;
    res.rows.push(await measure(p, 'trim (right edge −0.5 s)', () => H.dragEdge(p, sfx2, 'R', -0.5), /^clip:/));
    // 4 Undo
    res.rows.push(await measure(p, 'Undo (Ctrl+Z)', async () => { await L.blur(p); await p.keyboard.press('Control+z'); }, /^clip:/));
    // 5 mute
    res.rows.push(await measure(p, 'mute (M click on SFX)', () => p.click('[data-track-id=sfx] button[aria-label^="Mute"]'), /aria-pressed|class/));
    res.shotMute = await X.shot(p, `D3C-fb-mute-${RUNID}.png`);
    await p.click('[data-track-id=sfx] button[aria-label^="Mute"]'); await L.blur(p);
    // 6 export start
    await X.openDlg(p); await p.click('[data-testid=arrangement-export-format-wav]');
    res.rows.push(await measure(p, 'export start (WAV-ის ექსპორტი)', () => p.locator('[data-testid=arrangement-export-footer] button').filter({ hasText: /ექსპორტი$/ }).click(), /arrangement-export|BUTTON|disabled|aria-busy/));
    res.exportBusy = await p.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-export-footer]'); return f ? f.innerText.replace(/\s+/g, ' ') : null; });
    res.shotExport = await X.shot(p, `D3C-fb-export-${RUNID}.png`);
    const t0 = Date.now(); while (Date.now() - t0 < 60000) { if (!/მიმდინარეობს/.test(await p.evaluate(() => document.body.innerText))) break; await sleep(250); }
    res.exportDoneMs = Date.now() - t0; res.downloads = net[0].downloads.map((d) => ({ name: d.name, size: d.size }));
  } catch (e) { res.error = String(e.stack || e); }
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(L.ROOT, 'out', 'd3c', `d3c-feedback-${RUNID}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ err: res.error, rows: res.rows.map((r) => `${JSON.stringify(r.drag)} ${r.name}: first ${r.firstMutationMs} ms, relevant ${r.relevantMs} ms (${(r.relevantWhat || []).slice(0, 3)}), status ${r.statusMs} ms changed=${r.statusChanged} «${r.status.slice(0, 60)}»`), busy: res.exportBusy, done: res.exportDoneMs, dl: res.downloads, net: res.net }, null, 1));
  await b.close();
})();
