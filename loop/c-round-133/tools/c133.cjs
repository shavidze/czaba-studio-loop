// C round 133: GROUP, LANE, GEO-COUNT, REG-132 rows. node c133.cjs <1440|1280> <tag>
// Expected strings are hand-written from task §1.1 (not imported from strings.ts).
const W = +process.argv[2] || 1440;
const TAG = process.argv[3] || 'r1';
const ONLY = process.argv[4] || 'all';
const X = require('./lib122.cjs'); const { L, sleep } = X;
const H = require('./h3.cjs');
const fs = require('fs'); const path = require('path');
const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/g;
const gc = (s) => ((s || '').match(KA) || []).length;
const SHIFT_HINT = 'Shift — დრო ჩაიკეტება, შეიცვლება მხოლოდ ხაზი';
const RELEASE_TAIL = 'კლიპი ბოლო თავისუფალ ადგილას დარჩა';
const NAMES = ['ჯგუფი 1', 'ჯგუფი 2', 'მუსიკა', 'სტემები', 'ვიდეო'];
const FROZEN_MOVE = [/^(Undo: |Redo: )?(კლიპის გადატანა|გადატანა \(\d+\))(: (ცვლილება არ მოხდა — ისტორია არ შეიცვალა\.|\d+ კლიპი გადავიდა [\d:.]+-ით (მარჯვნივ|მარცხნივ)\.))?$/, /გადატანა დაბლოკილია — [^.]*\.( კლიპი ბოლო თავისუფალ ადგილას დარჩა\.)?/, /^დემო კოლექცია მზადაა\. აირჩიე ხაზი და დაამატე ხმა \(Enter ან ＋ დამატება\)\.$/];
function subtract(s) {
  let t = s || ''; const used = [];
  for (const re of FROZEN_MOVE) { const m = t.match(re); if (m) { used.push(m[0]); t = t.replace(re, ''); } }
  for (const n of [RELEASE_TAIL, SHIFT_HINT, ...NAMES]) if (t.includes(n)) { used.push(n); t = t.split(n).join(''); }
  return { raw: gc(s), net: gc(t), subtracted: used };
}
const E = {
  a: 'To group tracks, select them first — Ctrl+click or Shift+click a track name.',
  b: 'Group “ჯგუფი 1” created: მუსიკა, სტემები.',
  c: 'The video track cannot be grouped.',
  d: 'Only adjacent tracks can be grouped together — the selection skips a track.',
  e: 'To fold a group, select it first — click the group name.',
  g: 'Group “ჯგუფი 1” ungrouped.',
  h: 'To ungroup, select a group — click the group name.',
  noRoom: 'No room here',
  videoLane: 'Audio does not move to the video track',
  oor: 'There is no track for part of the group — only the time changes.',
  before: 'Part of the group would go before the start of the timeline (0) — the track does not change.',
  groupBlocked: 'Group move stopped — a neighbouring clip or the start of the timeline.',
  reg132: 'Tempo 90 BPM · 4/4 — bars ruler updated. Grid only: audio is not stretched.',
};
const net = []; const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), rows: {} };
const OUTF = path.join(L.OUT, `c133-${W}-${TAG}-${ONLY}.json`);
const save = () => fs.writeFileSync(OUTF, JSON.stringify({ ...res, net: X.netOk(net), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
let P;
async function shot(name) { const f = `${name}-${W}-${TAG}.png`; await P.screenshot({ path: path.join(L.SHOTS, f) }); return `c-round-133/shots/${f}`; }
async function obsInstall() {
  await P.evaluate(() => {
    const out = document.querySelector('[data-testid=arrangement-status]');
    const Wd = { recs: [], t0: performance.now(), last: out.textContent, hint: [] };
    window.__so = Wd;
    Wd.mo = new MutationObserver(() => { const t = out.textContent; if (t !== Wd.last) { Wd.last = t; Wd.recs.push({ t: Math.round(performance.now() - Wd.t0), text: t.trim() }); } });
    Wd.mo.observe(out, { childList: true, subtree: true, characterData: true });
    Wd.ho = new MutationObserver(() => { const h = document.querySelector('[data-testid=arrangement-lane-move-hint]'); const tx = h ? h.textContent : null; const l = Wd.hint[Wd.hint.length - 1]; if (!l || l.text !== tx) Wd.hint.push({ t: Math.round(performance.now() - Wd.t0), text: tx, refusal: (document.querySelector('[data-testid=arrangement-lane-move-refusal]') || {}).textContent || null }); });
    Wd.ho.observe(document.body, { childList: true, subtree: true, characterData: true });
  });
}
const obsTake = () => P.evaluate(() => { const r = { status: window.__so.recs.slice(), hint: window.__so.hint.slice() }; window.__so.recs = []; window.__so.hint = []; return r; });
const ui = () => P.evaluate(() => {
  const order = [...document.querySelectorAll('[data-group-id],[data-track-id]')].filter((e) => e.closest('[data-group-id],[data-track-id]') === e && e.getBoundingClientRect().height > 0).map((e) => (e.dataset.groupId !== undefined ? `group:${e.textContent.replace('▣', '').trim().slice(0, 20)}:${e.dataset.groupDepth}` : e.dataset.trackId));
  const sel = [...document.querySelectorAll('[data-track-selected="true"], [data-group-selected="true"]')].map((r) => r.dataset.trackId || `group:${r.textContent.trim().slice(0, 20)}`);
  const undo = [...document.querySelectorAll('button')].find((b) => /^Undo/.test((b.getAttribute('aria-label') || b.textContent || '').trim()) || /Undo/.test(b.textContent));
  const groups = [...document.querySelectorAll('[data-testid=arrangement-group-row]')].map((g) => ({ name: (g.querySelector('[data-testid=arrangement-group-name]') || {}).textContent, fold: (g.querySelector('[data-testid=arrangement-group-fold]') || { getAttribute: () => null }).getAttribute('aria-expanded') }));
  return { order, sel, undo: undo ? { title: undo.getAttribute('title'), aria: undo.getAttribute('aria-label'), text: undo.textContent.trim(), disabled: undo.disabled } : null, groups, visibleTracks: [...document.querySelectorAll('[data-track-id]')].filter((t) => t.getBoundingClientRect().height > 0).map((t) => t.dataset.trackId), docSW: document.documentElement.scrollWidth, vw: innerWidth };
});
const clips = async () => (await L.clipsDom(P)).map((c) => ({ id: c.id, kind: c.kind, lane: c.lane, start: c.start, wdur: c.wdur, sel: c.sel }));
async function step(row, id, expected, extra = {}) {
  const status = await L.status(P);
  const u = await ui();
  const ob = await obsTake();
  const r = { id, expected, status, exact: expected === null ? null : status === expected, ui: u, clips: await clips(), observer: ob, geo: { status: subtract(status), observed: ob.status.map((o) => ({ text: o.text, ...subtract(o.text) })) }, ...extra };
  res.rows[row] = res.rows[row] || []; res.rows[row].push(r); save();
  console.log(row, id, r.exact === null ? 'INFO' : r.exact ? 'OK ' : 'XX ', JSON.stringify(status), r.exact === false ? ' expected ' + JSON.stringify(expected) : '', '| obs:', JSON.stringify(ob.status.map((o) => o.text)), '| undo', u.undo && (u.undo.title || u.undo.aria), '| order', u.order.join(','), '| sel', u.sel.join(','));
  return r;
}
const clickName = async (t, mods = []) => { for (const m of mods) await P.keyboard.down(m); await P.click(L.nameSel(t)); for (const m of mods) await P.keyboard.up(m); await sleep(250); };
const press = async (k) => { await L.blur(P); await P.keyboard.press(k); await sleep(450); };
async function open(label) {
  const o = await L.openStudio(await getB(), X.VPS[W], `c133-${W}-${TAG}-${label}`, net, { extraInit: X.tapInit });
  P = o.page; await P.mouse.move(2, 2); await sleep(300); await obsInstall(); await obsTake();
  return o;
}
let B; const getB = async () => (B = B || await L.launch());
async function group() {
  const o = await open('group');
  const s0 = await step('GROUP', 'start', null); s0.shot = await shot('group-start');
  await press('Control+g'); await step('GROUP', 'a-no-selection', E.a);
  await clickName('music'); await clickName('stems', ['Shift']); await step('GROUP', 'b-pre', null);
  await press('Control+g'); const b = await step('GROUP', 'b-create', E.b); b.shot = await shot('group-b-created');
  await press('Control+z'); await step('GROUP', 'b-undo', null);
  await press('Control+Shift+z'); await step('GROUP', 'b-redo', null);
  // (c) video + music; music is inside the group now -> use fresh state via undo
  await press('Control+z'); await step('GROUP', 'c-undo-to-flat', null);
  await clickName('video'); await clickName('music', ['Control']); await step('GROUP', 'c-pre', null);
  await press('Control+g'); const c = await step('GROUP', 'c-video', E.c); c.shot = await shot('group-c-video');
  await clickName('music'); await clickName('sfx', ['Control']); await step('GROUP', 'd-pre', null);
  await press('Control+g'); const d = await step('GROUP', 'd-gap', E.d); d.shot = await shot('group-d-gap');
  await press('Control+Shift+z'); await step('GROUP', 'redo-group', null);
  await clickName('music'); await step('GROUP', 'e-pre', null);
  await press('u'); const e = await step('GROUP', 'e-fold-no-group', E.e); e.shot = await shot('group-e-fold-refused');
  await P.click('[data-testid=arrangement-group-name]'); await sleep(300); await step('GROUP', 'f-pre', null);
  await press('u'); const f1 = await step('GROUP', 'f-fold', null); f1.shot = await shot('group-f-folded');
  await press('u'); await step('GROUP', 'f-unfold', null);
  await P.click('[data-testid=arrangement-group-name]'); await sleep(300);
  await press('Control+Shift+g'); const g = await step('GROUP', 'g-ungroup', E.g); g.shot = await shot('group-g-ungrouped');
  await clickName('music'); await step('GROUP', 'h-pre', null);
  await press('Control+Shift+g'); const h = await step('GROUP', 'h-no-group', E.h); h.shot = await shot('group-h-refused');
  await o.ctx.close();
}
async function dragHold(id, dt, dyLane, { hold, mods = [] } = {}) {
  const a = await H.hdr(P, id); const g = await L.geo(P);
  await P.mouse.move(a.x, a.y); await P.mouse.down(); for (const m of mods) await P.keyboard.down(m);
  await P.mouse.move(a.x + dt * g.pps / 2, a.y, { steps: 8 }); await P.mouse.move(a.x + dt * g.pps, a.y, { steps: 8 }); await sleep(150);
  let y = a.y; if (dyLane) { const lb = await P.locator(`[data-track-id=${dyLane}]`).first().boundingBox(); y = lb.y + lb.height * 0.45; }
  await P.mouse.move(a.x + dt * g.pps, y, { steps: 10 }); await sleep(300);
  const during = await P.evaluate(() => { const h = document.querySelector('[data-testid=arrangement-lane-move-hint]'); const r = document.querySelector('[data-testid=arrangement-lane-move-refusal]'); const bx = (e) => { if (!e) return null; const q = e.getBoundingClientRect(); return { x: +q.x.toFixed(1), y: +q.y.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1), sw: e.scrollWidth, cw: e.clientWidth, lh: parseFloat(getComputedStyle(e).lineHeight) }; }; return { status: (document.querySelector('[data-testid=arrangement-status]') || {}).textContent.trim(), hint: h ? h.textContent : null, refusal: r ? r.textContent : null, hintBox: bx(h), parentBox: bx(h && h.parentElement), docSW: document.documentElement.scrollWidth, vw: innerWidth, ghosts: [...document.querySelectorAll('[data-testid*=ghost]')].map((x) => (x.dataset.testid + ':' + x.textContent.trim()).slice(0, 80)) }; });
  if (hold) await hold(during);
  await P.mouse.up(); for (const m of mods) await P.keyboard.up(m); await sleep(500);
  return during;
}
async function lane() {
  const o = await open('lane');
  await L.setSnapOff(P);
  res.adds = [await L.addAt(P, 'demo-synth-mix', 'music', 1), await L.addAt(P, 'demo-stem-bass', 'stems', 2), await L.addAt(P, 'demo-soft-impact', 'sfx', 20)];
  await obsTake();
  const t0 = await step('LANE', 'start', null); t0.shot = await shot('lane-start');
  const mus = (await clips()).find((c) => c.lane === 'music');
  // (a)
  const da = await dragHold(mus.id, 1, 'stems', { hold: async () => { await shot('lane-a-during'); } });
  const ra = await step('LANE', 'a-release', null, { during: da, shotDuring: `c-round-133/shots/lane-a-during-${W}-${TAG}.png` });
  ra.checks = { duringStatus: da.status === E.noRoom, hintStarts: (da.hint || '').startsWith(`${E.noRoom} · `), hintRest: (da.hint || '') === `${E.noRoom} · ${SHIFT_HINT}`, refusalSpan: da.refusal === `${E.noRoom} · `, release: new RegExp(`^No room here — ${RELEASE_TAIL}: მუსიკა, start \\d\\d:\\d\\d\\.\\d{3}\\.$`).test(ra.status), stayMusic: ra.clips.filter((c) => c.lane === 'music').length === 1 && ra.clips.filter((c) => c.lane === 'stems').length === 1 };
  ra.shot = await shot('lane-a-release'); console.log('a checks', JSON.stringify(ra.checks), JSON.stringify(da));
  // (b) audio clip onto the video lane
  const mus2 = (await clips()).find((c) => c.lane === 'music');
  const db = await dragHold(mus2.id, 0.5, 'video', { hold: async () => { await shot('lane-b-during'); } });
  const rb = await step('LANE', 'b-release', null, { during: db });
  rb.checks = { duringStatus: db.status === E.videoLane, refusalSpan: db.refusal === `${E.videoLane} · `, observed: rb.observer.status.some((x) => x.text === E.videoLane), notVideo: rb.clips.filter((c) => c.lane === 'video').length === 0 && rb.clips.filter((c) => c.lane === 'music').length === 1 };
  console.log('b checks', JSON.stringify(rb.checks), JSON.stringify(db));
  await press('Control+z'); await step('LANE', 'b-undo', null);
  // (c1) stems+sfx selected, drag stems down one lane: sfx would leave the bottom track
  let cs = await clips(); const st = cs.find((c) => c.lane === 'stems'), sf = cs.find((c) => c.lane === 'sfx');
  await L.selectClip(P, st.id); await L.selectClip(P, sf.id, ['Control']); await obsTake();
  const before1 = await clips();
  const dc1 = await dragHold(st.id, 0.5, 'sfx', { hold: async () => { await shot('lane-c1-during'); } });
  const rc1 = await step('LANE', 'c1-release', null, { during: dc1, before: before1 });
  rc1.checks = { duringStatus: dc1.status === E.oor, refusalSpan: dc1.refusal === `${E.oor} · `, observed: rc1.observer.status.some((x) => x.text === E.oor), tracksKept: ['stems', 'sfx'].every((ln) => rc1.clips.filter((c) => c.lane === ln).length === 1) };
  console.log('c1 checks', JSON.stringify(rc1.checks), JSON.stringify(dc1));
  await press('Control+z'); await step('LANE', 'c1-undo', null);
  // (c2) music@1 + stems@2 selected, drag stems down to sfx and left by 2.5 s: music would go before 0
  await P.keyboard.press('Escape'); await sleep(200);
  cs = await clips(); const m3 = cs.find((c) => c.lane === 'music'), s3 = cs.find((c) => c.lane === 'stems');
  await L.selectClip(P, m3.id); await L.selectClip(P, s3.id, ['Control']); await obsTake();
  const before2 = await clips();
  const dc2 = await dragHold(s3.id, -2.5, 'sfx', { hold: async () => { await shot('lane-c2-during'); } });
  const rc2 = await step('LANE', 'c2-release', null, { during: dc2, before: before2 });
  rc2.checks = { duringStatus: dc2.status === E.before, refusalSpan: dc2.refusal === `${E.before} · `, observed: rc2.observer.status.some((x) => x.text === E.before), tracksKept: rc2.clips.filter((c) => c.lane === 'music').length === 1 && rc2.clips.filter((c) => c.lane === 'stems').length === 1 };
  console.log('c2 checks', JSON.stringify(rc2.checks), JSON.stringify(dc2));
  await press('Control+z'); await step('LANE', 'c2-undo', null);
  // (d) two clips selected, ← until the left one is at 0
  cs = await clips(); const m4 = cs.find((c) => c.lane === 'music'), s4 = cs.find((c) => c.lane === 'stems');
  if (!(m4.sel && s4.sel && cs.filter((c) => c.sel).length === 2)) { await L.selectClip(P, m4.id); if (!(await clips()).find((c) => c.id === s4.id).sel) await L.selectClip(P, s4.id, ['Control']); }
  await P.evaluate(() => { const out = document.querySelector('[data-testid=arrangement-status]'); window.__mut = 0; new MutationObserver((l) => { window.__mut += l.length; }).observe(out, { childList: true, subtree: true, characterData: true }); });
  await obsTake();
  const presses = [];
  res.dSel = (await clips()).filter((c) => c.sel).map((c) => c.lane);
  for (let i = 0; i < 26; i++) { await L.blur(P); await P.keyboard.press('ArrowLeft'); await sleep(250); presses.push({ i, mut: await P.evaluate(() => { const m = window.__mut; window.__mut = 0; return m; }), status: await L.status(P), obs: (await obsTake()).status.map((x) => x.text), clips: (await clips()).filter((c) => c.kind !== 'video').map((c) => `${c.lane}@${c.start}`) }); }
  const rd = await step('LANE', 'd-nudge', E.groupBlocked, { presses });
  const blockedObs = presses.flatMap((p) => p.obs).filter((t) => t === E.groupBlocked).length;
  const blockedPresses = presses.filter((p) => p.status === E.groupBlocked).length;
  rd.checks = { finalBlocked: rd.status === E.groupBlocked, leftAtZero: rd.clips.some((c) => c.lane === 'music' && c.start === 0), announced: blockedObs >= 1 };
  rd.announce = { blockedObs, blockedPresses, perPress: presses.map((p) => p.obs.length) };
  rd.shot = await shot('lane-d-nudge');
  console.log('d checks', JSON.stringify(rd.checks), JSON.stringify(rd.announce), JSON.stringify(presses.map((p) => p.clips.join(' '))));
  // REG-132 (1440 only)
  if (W === 1440) {
    const t = P.locator('[data-testid=arrangement-tempo-input]'); await t.click(); await t.fill('90'); await P.keyboard.press('Enter'); await sleep(500); await L.blur(P);
    const rg = await step('REG-132', 'bpm90', E.reg132); rg.shot = await shot('reg132');
  }
  await o.ctx.close();
}
(async () => {
  try {
    if (ONLY === 'all' || ONLY === 'group') await group();
    if (ONLY === 'all' || ONLY === 'lane') await lane();
  } catch (e) { res.error = String(e.stack || e); console.log('ERR', res.error); }
  res.endUtc = new Date().toISOString();
  save();
  console.log(JSON.stringify({ err: res.error, net: X.netOk(net) }));
  if (B) await B.close();
})();
