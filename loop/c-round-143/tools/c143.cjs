// C round 143 — V-0.4e fix-up rows (adapted from c-round-142). node c143.cjs <1440|1280> <tag>
// Expected strings are hand-written from current-task.md §1.1 (never imported from the app).
const L = require('./lib.cjs');
const fs = require('fs');
const path = require('path');
const W = +process.argv[2] || 1440;
const TAG = process.argv[3] || `r${Date.now()}`;
const VP = W === 1440 ? { width: 1440, height: 900 } : { width: 1280, height: 720 };
const OUTF = path.join(L.OUT, `c143-${W}-${TAG}.json`);
const sleep = L.sleep;
const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/g;
const gc = (s) => ((s || '').match(KA) || []).length;
const net = [];
const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), rows: {}, fails: [], oks: 0, states: {}, history: [], statusObserved: [], invalidRuns: [] };
const save = () => fs.writeFileSync(OUTF, JSON.stringify({ ...res, net: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
function chk(row, id, got, exp) { const ok = got === exp; if (!ok) res.fails.push({ row, id, got, exp }); else res.oks++; console.log(row, id, ok ? 'OK ' : 'XX ', JSON.stringify(got), ok ? '' : ' expected ' + JSON.stringify(exp)); (res.rows[row] = res.rows[row] || []).push({ id, ok, got, exp }); save(); return ok; }
function chkT(row, id, cond, info) { if (!cond) res.fails.push({ row, id, got: info }); else res.oks++; console.log(row, id, cond ? 'OK ' : 'XX ', JSON.stringify(info).slice(0, 400)); (res.rows[row] = res.rows[row] || []).push({ id, ok: !!cond, info }); save(); return cond; }
function note(row, id, info) { console.log(row, id, '-- ', JSON.stringify(info).slice(0, 400)); (res.rows[row] = res.rows[row] || []).push({ id, note: info }); save(); }

const S = {
  panelTitle: 'Clip details', nothingSelected: 'Nothing selected', noSelectionHint: 'Select a clip to see its details',
  multiClipNote: 'The selected clips move together · Delete deletes them · Ctrl+D duplicates them',
  videoPlaceholder: 'Video clip · no waveform', rangeMultiReason: 'A time selection is set on one clip — select only one',
  noneReason: 'Select a clip first', sourceUnchanged: 'The source file stays unchanged',
  clipGainMultiReason: 'Clip Gain works on audio clips only — remove the video from the selection',
  clipGainVideoReason: 'A video clip has no Clip Gain — use the track Volume/Mute',
  clipGainInvalid: 'Clip Gain: enter a number in dB (−60…+24).',
  pendingFull: 'Unsaved — Enter saves, Esc reverts', pendingLabel: 'Unsaved',
  rangeStartLabel: 'Time selection start (seconds)', rangeEndLabel: 'Time selection end (seconds)',
  applyRange: 'Set selection', clipGainResetLabel: 'Reset Clip Gain (0 dB)', heightLabel: 'Details height',
  expandLabel: 'Expand details', collapseLabel: 'Collapse details', expandText: 'Expand ▸', collapseText: 'Collapse ▾',
  rangeInvalid: 'The time selection must stay inside the clip, and its end must be after its start.',
};
// English -> baseline Georgian (from b-round-141/r142-granted-start), used only for the in-page swap control.
const GEO = [
  ['Clip details', 'კლიპის დეტალები'], ['Nothing selected', 'არაფერია არჩეული'], ['Select a clip to see its details', 'აირჩიე კლიპი, რომ დეტალები ნახო'],
  [S.multiClipNote, 'ჯგუფი ერთად გადაადგილდება · Delete შლის · Ctrl+D აორმაგებს'], [S.videoPlaceholder, 'ვიდეოკლიპი · ტალღა არ ჩანს'],
  [S.rangeMultiReason, 'range ერთ კლიპზე ისმება — აირჩიე ერთი'], [S.noneReason, 'ჯერ აირჩიე კლიპი'], [S.sourceUnchanged, 'წყარო უცვლელი რჩება'],
  [S.clipGainMultiReason, 'Clip Gain მხოლოდ აუდიო კლიპებზე ისმება — ამოიღე ვიდეო მონიშვნიდან'], [S.clipGainVideoReason, 'ვიდეო კლიპს Clip Gain არ აქვს — ხმა: ხაზის Volume/Mute'],
  ['Track', 'ხაზი'], ['Tracks', 'ხაზები'], ['Start', 'დასაწყისი'], ['Length', 'სიგრძე'], ['Source offset', 'წყაროდან'],
  ['From, s', 'საიდან, წმ'], ['To, s', 'სადამდე, წმ'], ['Set selection', 'მონიშვნა'], ['2 clips', '2 კლიპი'],
  ['Collapse ▾', 'დაკეცვა ▾'], ['Expand ▸', 'გაშლა ▸'],
];

function obsInit() {
  const W0 = window; W0.__so = { recs: [] };
  const start = () => {
    const out = document.querySelector('[data-testid=arrangement-status]');
    if (!out) { setTimeout(start, 200); return; }
    let last = out.textContent;
    new MutationObserver(() => { const t = out.textContent; if (t !== last) { last = t; W0.__so.recs.push(t.trim()); } }).observe(out, { childList: true, subtree: true, characterData: true });
  };
  document.addEventListener('DOMContentLoaded', start);
}

const measure = (p) => p.evaluate(() => {
  const panel = document.querySelector('[data-testid=arrangement-detail-panel]');
  const r = (e) => { const b = e.getBoundingClientRect(); return [+b.x.toFixed(1), +b.y.toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)]; };
  const lines = (e) => { const lh = parseFloat(getComputedStyle(e).lineHeight) || 16; return Math.round(e.getBoundingClientRect().height / lh); };
  const out = { panel: r(panel), panelScroll: [panel.scrollHeight, panel.clientHeight], nodes: {} };
  for (const e of panel.querySelectorAll('[data-testid]')) {
    const id = e.getAttribute('data-testid');
    const visible = e.getBoundingClientRect().height > 0;
    out.nodes[id] = { box: r(e), visible, lines: visible ? lines(e) : 0, overflowX: e.scrollWidth > e.clientWidth + 1, text: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120) };
  }
  const content = panel.querySelector('[data-testid=arrangement-detail-content]');
  if (content) {
    out.contentScroll = [content.scrollHeight, content.clientHeight, content.scrollWidth, content.clientWidth];
    out.columns = [...content.children].map((c) => ({ tag: c.tagName, tid: c.dataset.testid || null, box: r(c) }));
    const row = content.children.length === 1 ? content.children[0] : null;
    if (row) out.innerColumns = [...row.children].map((c) => ({ tag: c.tagName, tid: c.dataset.testid || null, box: r(c) }));
  }
  out.labels = [...panel.querySelectorAll('label')].map((e) => ({ box: r(e), text: e.childNodes[0] ? e.childNodes[0].textContent.trim() : '' }));
  const clipped = [];
  for (const e of panel.querySelectorAll('input,button,p,label')) { const b = e.getBoundingClientRect(); const pr = panel.getBoundingClientRect(); if (b.height > 0 && (b.bottom > pr.bottom + 0.5 || b.right > pr.right + 0.5)) clipped.push({ tag: e.tagName, tid: e.getAttribute('data-testid'), text: (e.textContent || '').trim().slice(0, 60), bottom: +b.bottom.toFixed(1), panelBottom: +pr.bottom.toFixed(1) }); }
  out.clippedBelowPanel = clipped;
  const hx = []; for (const e of panel.querySelectorAll('*')) { if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible' && e.clientWidth > 0) hx.push({ tag: e.tagName, tid: e.dataset.testid || null, sw: e.scrollWidth, cw: e.clientWidth }); }
  out.hOverflow = hx;
  return out;
});
const texts = (p) => p.evaluate(() => {
  const panel = document.querySelector('[data-testid=arrangement-detail-panel]');
  const T = [];
  const wk = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT); let n;
  while ((n = wk.nextNode())) { const v = n.textContent.trim(); if (!v) continue; const el = n.parentElement; const vis = el.getClientRects().length > 0 || el.closest('.sr-only'); T.push({ k: 'text', tid: (el.closest('[data-testid]') || {}).dataset?.testid || '', tag: el.tagName, vis: !!vis, v }); }
  for (const el of [panel, ...panel.querySelectorAll('*')]) for (const a of ['aria-label', 'title', 'aria-valuetext', 'placeholder', 'aria-description', 'alt']) { const v = el.getAttribute(a); if (v) T.push({ k: a, tid: el.dataset.testid || '', tag: el.tagName, v }); }
  const h2 = panel.querySelector('h2');
  return { T, h2: h2 ? h2.textContent.trim() : null, panelLabel: panel.getAttribute('aria-label'), header: (panel.querySelector('[data-testid=arrangement-detail-header-label]') || {}).textContent?.trim() };
});
const toggleInfo = (p) => p.evaluate(() => { const t = document.querySelector('[data-testid=arrangement-detail-toggle]'); const s = document.querySelector('[data-testid=arrangement-detail-separator]'); const pn = document.querySelector('[data-testid=arrangement-detail-panel]'); return { expanded: t.getAttribute('aria-expanded'), label: t.getAttribute('aria-label'), text: t.textContent.trim(), toggleBox: t.getBoundingClientRect().toJSON(), sepLabel: s.getAttribute('aria-label'), sepText: s.getAttribute('aria-valuetext'), sepNow: s.getAttribute('aria-valuenow'), panelH: pn.getBoundingClientRect().height }; });
const swapGeo = (p, back) => p.evaluate(({ pairs, back }) => {
  const panel = document.querySelector('[data-testid=arrangement-detail-panel]');
  const wk = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT); let n; let c = 0;
  while ((n = wk.nextNode())) { const t = n.textContent; const tr = t.trim(); for (const [en, ka] of pairs) { const [from, to] = back ? [ka, en] : [en, ka]; if (tr === from) { n.textContent = t.replace(from, to); c++; break; } } }
  return c;
}, { pairs: GEO, back });
const undoRedo = (p) => p.evaluate(() => { const f = (re) => { const b = [...document.querySelectorAll('button')].find((x) => re.test(x.textContent)); return b ? { title: b.getAttribute('title'), al: b.getAttribute('aria-label'), disabled: b.disabled } : null; }; return { undo: f(/Undo/), redo: f(/Redo/) }; });
const obs = (p) => p.evaluate(() => window.__so.recs.splice(0));
const cp = (s) => [...(s || '')].filter((ch) => ch.charCodeAt(0) > 127).map((ch) => `${ch}=U+${ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
async function shot(p, name) { const f = `${name}-${W}-${TAG}.png`; await p.screenshot({ path: path.join(L.SHOTS, f) }); return `c-round-143/shots/${f}`; }
async function state(p, name) {
  const m = await measure(p); const t = await texts(p);
  res.states[name] = { measure: m, texts: t, shot: await shot(p, name) };
  await swapGeo(p, false); await sleep(150);
  res.states[name].geoSwap = await measure(p);
  res.states[name].geoSwapShot = await shot(p, `${name}-geoswap`);
  await swapGeo(p, true); await sleep(150);
  const m2 = await measure(p);
  res.states[name].restoredSame = JSON.stringify(m2.nodes) === JSON.stringify(m.nodes);
  save();
  return t;
}
const hasText = (t, v) => t.T.some((x) => x.k === 'text' && x.v === v);
const hasAttr = (t, a, v) => t.T.some((x) => x.k === a && x.v === v);

(async () => {
  const b = await L.launch();
  let O;
  for (let i = 0; i < 3; i++) {
    try { O = await L.openStudio(b, VP, `c143-${W}-${TAG}-detail${i ? '-retry' + i : ''}`, net, { extraInit: obsInit }); break; } catch (e) { res.invalidRuns.push({ attempt: i, reason: 'ENV-FIRST-LOAD', err: String(e).slice(0, 200) }); }
  }
  const p = O.page;
  await p.mouse.move(2, 2);
  res.snapAtStart = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
  res.snap = await L.setSnapOff(p);
  const R = 'DETAIL-TEXT';
  // toggle states
  const t0 = await toggleInfo(p); res.toggleAtLoad = t0;
  if (t0.expanded === 'false') { res.collapsedAtLoad = { measure: await measure(p) }; await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(600); }
  const tOpen = await toggleInfo(p);
  await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(600);
  const tCol = await toggleInfo(p);
  await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(600);
  await L.blur(p);
  res.toggleOpen = tOpen; res.toggleCollapsed = tCol;
  chk(R, 'toggle-open-label', tOpen.label, S.collapseLabel); chk(R, 'toggle-open-text', tOpen.text, S.collapseText);
  chk(R, 'toggle-col-label', tCol.label, S.expandLabel); chk(R, 'toggle-col-text', tCol.text, S.expandText);
  chk(R, 'sep-label', tOpen.sepLabel, S.heightLabel);
  chk(R, 'sep-open-valuetext', tOpen.sepText, `${tOpen.sepNow} px`);
  chk(R, 'sep-col-valuetext', tCol.sepText, `collapsed · ${tCol.sepNow} px`);
  // none
  const tn = await state(p, 'none');
  chk(R, 'none-h2', tn.h2, S.panelTitle); chk(R, 'none-panel-aria', tn.panelLabel, S.panelTitle);
  chk(R, 'none-header', tn.header, S.nothingSelected);
  chkT(R, 'none-hint', hasText(tn, S.noSelectionHint), S.noSelectionHint);
  chkT(R, 'none-reason', hasText(tn, S.noneReason) || hasAttr(tn, 'title', S.noneReason), tn.T.filter((x) => /Select a clip/.test(x.v)).map((x) => `${x.k}:${x.tid}`));
  res.geoNone = tn.T.filter((x) => gc(x.v));
  // add two clips exactly like B's probe
  const ids = await p.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].map((e) => e.getAttribute('data-source-id')));
  res.add1 = await L.addAt(p, ids[0], 'music', 1);
  res.add2 = await L.addAt(p, ids[1], 'stems', 1);
  const clips = await L.clipsDom(p); res.clips = clips;
  await L.selectClip(p, clips[0].id);
  const ts = await state(p, 'single');
  const labs = ts.T.filter((x) => x.k === 'text' && ['Track', 'Start', 'Length', 'Source offset'].includes(x.v)).map((x) => x.v);
  chk(R, 'single-info-labels', JSON.stringify(labs), JSON.stringify(['Track', 'Start', 'Length', 'Source offset']));
  chkT(R, 'single-source-unchanged', hasText(ts, S.sourceUnchanged), '');
  chkT(R, 'single-range-labels', hasText(ts, 'From, s') && hasText(ts, 'To, s'), '');
  chk(R, 'single-start-aria', await p.getAttribute('[data-testid=arrangement-detail-start]', 'aria-label'), S.rangeStartLabel);
  chk(R, 'single-end-aria', await p.getAttribute('[data-testid=arrangement-detail-end]', 'aria-label'), S.rangeEndLabel);
  chk(R, 'single-apply-text', (await p.textContent('[data-testid=arrangement-detail-apply]')).trim(), S.applyRange);
  chk(R, 'single-reset-aria', await p.getAttribute('[data-testid=arrangement-detail-clip-gain-reset]', 'aria-label'), S.clipGainResetLabel);
  res.geoSingle = ts.T.filter((x) => gc(x.v));
  res.headerSingle = ts.header;
  // DETAIL-STATUS on single
  const D = 'DETAIL-STATUS';
  await obs(p);
  const rangeDom = () => p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-lane-range],[data-testid=arrangement-range]')].map((e) => ({ tid: e.dataset.testid, box: e.getBoundingClientRect().toJSON(), text: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 120), lane: (e.closest('[data-track-id]') || {}).dataset?.trackId || null })).concat([...document.querySelectorAll('[data-clip-id] *')].filter((e) => e.children.length === 0 && /\d\d:\d\d\.\d{3}\s*[–—-]\s*\d\d:\d\d\.\d{3}/.test(e.textContent)).map((e) => { const b = e.parentElement.getBoundingClientRect(); return { tid: 'clip-range-overlay', clip: e.closest('[data-clip-id]').dataset.clipId, lane: e.closest('[data-track-id]').dataset.trackId, text: e.textContent.trim(), box: { x: +b.x.toFixed(1), w: +b.width.toFixed(1) } }; })));
  res.rangeBefore = await rangeDom();
  await p.fill('[data-testid=arrangement-detail-start]', '3.5');
  await p.fill('[data-testid=arrangement-detail-end]', '7.25');
  await p.click('[data-testid=arrangement-detail-apply]'); await sleep(500);
  const st1 = await L.status(p);
  chk(D, '1-applied', st1, 'Time selection: 00:03.500 — 00:07.250 · Music.');
  res.rangeAfter = await rangeDom();
  chkT(D, '1-range-drawn', res.rangeAfter.some((x) => x.tid === 'clip-range-overlay' && x.lane === 'music' && /00:03\.500.*00:07\.250/.test(x.text)), res.rangeAfter.filter((x) => x.tid === 'clip-range-overlay'));
  res.histAfterRange = await undoRedo(p); res.history.push({ step: 'range-applied', ...res.histAfterRange });
  res.shotRange = await shot(p, 'single-range-applied');
  await p.fill('[data-testid=arrangement-detail-start]', '9');
  await p.fill('[data-testid=arrangement-detail-end]', '4');
  await p.click('[data-testid=arrangement-detail-apply]'); await sleep(500);
  chk(D, '2-invalid', await L.status(p), S.rangeInvalid);
  const rInv = await rangeDom();
  chk(D, '2-nothing-changed', JSON.stringify(rInv), JSON.stringify(res.rangeAfter));
  res.history.push({ step: 'range-invalid', ...(await undoRedo(p)) });
  const gi = '[data-testid=arrangement-detail-clip-gain-input]';
  await p.click(gi, { clickCount: 3 }); await p.keyboard.type('abc'); res.valueAfterTypingAbc = await p.inputValue(gi);
  await p.keyboard.press('Enter'); await sleep(400);
  res.statusAfterAbc = await L.status(p);
  await p.click(gi, { clickCount: 3 }); await p.keyboard.press('Backspace'); await p.keyboard.type('e'); res.valueAfterTypingE = await p.inputValue(gi);
  await p.keyboard.press('Enter'); await sleep(400);
  const st3 = await L.status(p);
  chk(D, '3-invalid-gain', st3, S.clipGainInvalid); res.st3cp = cp(st3);
  res.gainValueAfterInvalid = await p.inputValue(gi);
  await p.click(gi); await p.press(gi, 'Enter'); await sleep(400);
  chk(D, '4-unchanged', await L.status(p), 'Clip Gain unchanged: 0.0 dB.');
  res.history.push({ step: 'gain-unchanged', ...(await undoRedo(p)) });
  const before5 = await p.inputValue(gi);
  await p.click(gi, { clickCount: 3 }); await p.keyboard.type('-3'); await sleep(300);
  const pend = await p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-detail-clip-gain-pending]'); if (!e) return null; const sr = e.querySelector('.sr-only'); return { visible: e.getClientRects().length > 0, title: e.getAttribute('title'), first: e.childNodes[0] ? e.childNodes[0].textContent : null, sr: sr ? sr.textContent : null, full: e.textContent }; });
  res.pending = pend;
  chkT(D, '5-pending-visible', pend && pend.visible, pend);
  chk(D, '5-pending-title', pend && pend.title, S.pendingFull);
  chk(D, '5-pending-label', pend && pend.first, S.pendingLabel);
  chk(D, '5-pending-sr', pend && pend.sr, ' — Enter saves, Esc reverts');
  res.shotPending = await shot(p, 'single-pending');
  await p.press(gi, 'Escape'); await sleep(300);
  chk(D, '5-esc-reverts', await p.inputValue(gi), before5);
  chkT(D, '5-pending-gone', !(await p.$('[data-testid=arrangement-detail-clip-gain-pending]')), '');
  await L.blur(p);
  res.statusObserved.push({ phase: 'single', recs: await obs(p) });
  // multi
  await L.selectClip(p, clips[1].id, ['Control']);
  const tm = await state(p, 'multi');
  chk(R, 'multi-header', tm.header, '2 clips');
  chkT(R, 'multi-group-2clips', tm.T.some((x) => x.k === 'text' && x.tid === 'arrangement-detail-group' && x.v === '2 clips'), tm.T.filter((x) => x.tid === 'arrangement-detail-group').map((x) => x.v));
  chkT(R, 'multi-tracks-label', hasText(tm, 'Tracks'), '');
  chkT(R, 'multi-note', hasText(tm, S.multiClipNote), '');
  chk(R, 'multi-start-title', await p.getAttribute('[data-testid=arrangement-detail-start]', 'title'), S.rangeMultiReason);
  chkT(R, 'multi-range-reason', hasText(tm, S.rangeMultiReason), '');
  res.geoMulti = tm.T.filter((x) => gc(x.v));
  await p.click(gi, { clickCount: 3 }); await p.keyboard.type('-3'); await p.keyboard.press('Enter'); await sleep(500);
  const st6 = await L.status(p); res.st6cp = cp(st6);
  chk(D, '6-multi-gain', st6, 'Clip Gain: 2 clips — −3.0 dB.');
  res.history.push({ step: 'multi-gain--3', ...(await undoRedo(p)) });
  await p.click('[data-testid=arrangement-detail-clip-gain-reset]'); await sleep(500);
  chk(D, '6-multi-reset', await L.status(p), 'Clip Gain: 2 clips — 0.0 dB.');
  res.history.push({ step: 'multi-reset', ...(await undoRedo(p)) });
  await L.blur(p);
  // undo/redo trail of the gain edits
  await p.keyboard.press('Control+z'); await sleep(400); res.history.push({ step: 'undo1', status: await L.status(p), ...(await undoRedo(p)) });
  await p.keyboard.press('Control+z'); await sleep(400); res.history.push({ step: 'undo2', status: await L.status(p), ...(await undoRedo(p)) });
  await p.keyboard.press('Control+Shift+z'); await sleep(400); res.history.push({ step: 'redo1', status: await L.status(p), ...(await undoRedo(p)) });
  await p.keyboard.press('Control+Shift+z'); await sleep(400); res.history.push({ step: 'redo2', status: await L.status(p), ...(await undoRedo(p)) });
  res.statusObserved.push({ phase: 'multi', recs: await obs(p) });
  save();
  // video
  try {
    await L.loadVideo(p, 'clip-4s-vp9-opus.webm');
    const v = (await L.clipsDom(p)).find((c) => c.kind === 'video');
    await L.blur(p); await L.selectClip(p, v.id);
    const tv = await state(p, 'video');
    res.videoReasonDom = await p.evaluate(() => { const r = document.querySelector('[data-testid=arrangement-detail-clip-gain-reason]'); const i = document.querySelector('[data-testid=arrangement-detail-clip-gain-input]'); const f = document.querySelector('[data-testid=arrangement-detail-clip-gain-fader]'); return { text: r && r.textContent, inputTitle: i && i.getAttribute('title'), inputDisabled: i && i.disabled, describedBy: i && i.getAttribute('aria-describedby'), reasonId: r && r.id, faderTitle: f && f.getAttribute('title'), placeholder: (document.querySelector('[data-testid=arrangement-detail-video-placeholder]') || {}).textContent }; });
    res.videoReasonCp = cp(res.videoReasonDom.text);
    chk('VIDEO-REASON-TEXT', 'video-reason-text', res.videoReasonDom.text, S.clipGainVideoReason);
    chk('VIDEO-REASON-TEXT', 'video-input-title', res.videoReasonDom.inputTitle, S.clipGainVideoReason);
    chk('VIDEO-REASON-TEXT', 'video-dash-cp', res.videoReasonCp.join(','), '—=U+2014');
    chkT('VIDEO-REASON-TEXT', 'video-describedby', res.videoReasonDom.describedBy && res.videoReasonDom.describedBy === res.videoReasonDom.reasonId, res.videoReasonDom);
    chkT(R, 'video-placeholder', hasText(tv, S.videoPlaceholder), '');
    chkT(R, 'video-reason', hasText(tv, S.clipGainVideoReason) || hasAttr(tv, 'title', S.clipGainVideoReason), tv.T.filter((x) => /Clip Gain/.test(x.v)).map((x) => `${x.k}:${x.v}`));
    res.geoVideo = tv.T.filter((x) => gc(x.v));
    await L.selectClip(p, clips[0].id, ['Control']);
    const tvm = await state(p, 'videoMulti');
    res.videoMultiReasonDom = await p.evaluate(() => { const r = document.querySelector('[data-testid=arrangement-detail-clip-gain-reason]'); const i = document.querySelector('[data-testid=arrangement-detail-clip-gain-input]'); return { text: r && r.textContent, inputTitle: i && i.getAttribute('title'), inputDisabled: i && i.disabled }; });
    chk('VIDEO-REASON-TEXT', 'videomulti-reason-text', res.videoMultiReasonDom.text, S.clipGainMultiReason);
    chk('VIDEO-REASON-TEXT', 'videomulti-input-title', res.videoMultiReasonDom.inputTitle, S.clipGainMultiReason);
    chkT('VIDEO-REASON-TEXT', 'videomulti-no-video-reason', !(await p.evaluate(() => document.body.innerText.includes('A video clip has no Clip Gain'))), '');
    chkT(R, 'videomulti-reason', hasText(tvm, S.clipGainMultiReason) || hasAttr(tvm, 'title', S.clipGainMultiReason), tvm.T.filter((x) => /Clip Gain/.test(x.v)).map((x) => `${x.k}:${x.v}`));
    res.geoVideoMulti = tvm.T.filter((x) => gc(x.v));
  } catch (e) { res.videoErr = String(e).slice(0, 300); console.log('VIDEO ERR', e); }
  await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(500);
  res.collapsedEnd = await toggleInfo(p);
  res.endedUtc = new Date().toISOString();
  save();
  await O.ctx.close(); await b.close();
  console.log('fails', res.fails.length, 'oks', res.oks);
})().catch((e) => { console.error(e); res.fatal = String(e); save(); process.exit(1); });
