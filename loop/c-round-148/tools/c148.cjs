// C round 148: COPY-DOCK a-d, TITLE-LANG (DOM), NO-GEORGIAN (whole body), VIDEO-SYNC, PLAY-FAIL. node c148.cjs <1440|1280> [skipSync]
const L = require('./lib.cjs');
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440;
const VP = W === 1440 ? { width: 1440, height: 900 } : { width: 1280, height: 720 };
const net = []; const out = { vp: W, startedUtc: new Date().toISOString(), checks: [], m: {}, geo: {} };
const chk = (row, id, ok, data) => { out.checks.push({ row, id, ok: !!ok, data }); console.log(ok ? 'PASS' : 'FAIL', row, id, JSON.stringify(data).slice(0, 400)); };
const shot = (p, n) => p.screenshot({ path: path.join(L.SHOTS, `c148-${n}-${W}.png`) });
const save = () => L.save(L.OUT, `c148-${W}.json`, { ...out, net });
const LEDGER = ['ღამის პულსი', 'საჯარო preview', 'სრული მიქსი', 'პულსი', 'ბასი', 'პადი', 'მელოდია'];
const scan = (p) => p.evaluate((LEDGER) => {
  const G = /[\u10A0-\u10FF\u1C90-\u1CBF\u2D00-\u2D2F]/g; const hits = [];
  const where = (el) => { let e = el; while (e && e !== document.body) { if (e.dataset && e.dataset.testid) return e.dataset.testid; e = e.parentElement; } return 'body'; };
  const add = (el, a, v) => { const stripped = LEDGER.reduce((s, x) => s.split(x).join(''), v); const n = (v.match(G) || []).length; const rest = (stripped.match(G) || []).length; hits.push({ where: where(el), tag: el ? el.tagName : 'TITLE', a, v: v.slice(0, 120), n, nonLedger: rest }); };
  let nodes = 0;
  for (const el of document.body.querySelectorAll('*')) { if (['SCRIPT', 'STYLE'].includes(el.tagName)) continue; nodes++; for (const a of ['aria-label', 'title', 'placeholder', 'aria-valuetext']) { const v = el.getAttribute(a); if (v && /[\u10A0-\u10FF]/.test(v)) add(el, a, v); } }
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { if (n.parentElement && ['SCRIPT', 'STYLE'].includes(n.parentElement.tagName)) continue; if (/[\u10A0-\u10FF]/.test(n.nodeValue)) add(n.parentElement, 'text', n.nodeValue.trim()); }
  if (/[\u10A0-\u10FF]/.test(document.title)) add(null, 'document.title', document.title);
  return { nodes, hits: hits.length, georgianCodepoints: hits.reduce((s, h) => s + h.n, 0), nonLedger: hits.filter((h) => h.nonLedger > 0) };
}, LEDGER);
const doGeo = async (p, st) => { out.geo[st] = await scan(p); console.log('GEO', st, out.geo[st].nodes, out.geo[st].hits, out.geo[st].nonLedger.length); };
const dockInfo = (p) => p.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const dock = q('[data-testid=arrangement-video-dock]');
  const row = dock.querySelector(':scope > div > div');
  const lab = row.querySelector(':scope > span');
  const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0; };
  const empty = [...dock.querySelectorAll('[data-testid=arrangement-video-box] > p')].find((x) => !x.dataset.testid);
  const ex = q('[data-testid=arrangement-video-expand]');
  return {
    regionTag: dock.tagName, regionLabel: dock.getAttribute('aria-label'), overview: lab.textContent.replace(/\s+/g, ' ').trim(), caption: q('[data-testid=arrangement-video-caption]').textContent,
    empty: empty ? empty.textContent : null, emptyVisible: vis(empty), expandAria: ex.getAttribute('aria-label'), expandTitle: ex.getAttribute('title'),
    videos: [...document.querySelectorAll('[data-testid=arrangement-video]')].map((v) => [v.dataset.videoRole, v.getAttribute('aria-label')]),
    gap: (q('[data-testid=arrangement-video-gap]') || {}).textContent || null,
  };
});
const playKey = async (p) => { await L.blur(p); await p.keyboard.press('Space'); };
const isPlayingPos = async (p, ms) => { const a = await L.posNow(p); await L.sleep(ms); const b = await L.posNow(p); return [a, b]; };

(async () => {
  fs.mkdirSync(L.OUT, { recursive: true }); fs.mkdirSync(L.SHOTS, { recursive: true });
  const b = await L.launch();
  const O = await L.openStudio(b, VP, `c148-${W}`, net);
  const p = O.page;
  out.m.snapAtStart = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
  out.m.snapAfter = await L.setSnapOff(p);
  // TITLE-LANG DOM part
  out.m.title = await p.evaluate(() => [document.title, [...document.title].map((c) => c.codePointAt(0).toString(16)).filter((h) => h === '2014'), document.documentElement.lang]);
  chk('TITLE-LANG', 'dom', out.m.title[0] === 'Studio Lab — Demo workspace | CZABA' && out.m.title[1].length === 1 && out.m.title[2] === 'en', out.m.title);
  // COPY-DOCK (a)
  const a = await dockInfo(p); out.m.a = a;
  const roleRegion = await p.getByRole('region', { name: 'Video', exact: true }).count();
  const roleExpand = await p.getByRole('button', { name: 'Expand video', exact: true }).count();
  chk('COPY-DOCK', 'a', roleRegion === 1 && roleExpand === 1 && a.overview === 'Arrangement · Overview' && a.caption === 'Video · sound from the video track (M/S/Volume)' && a.empty === 'No video added yet' && a.emptyVisible && a.expandAria === 'Expand video' && a.expandTitle === 'Expand video' && JSON.stringify(a.videos) === JSON.stringify([['active', 'Video preview'], ['standby', 'Video preview (standby)']]), { roleRegion, roleExpand, a });
  await doGeo(p, 'ready'); await shot(p, 'a-empty');
  // previewing state for NO-GEORGIAN
  try {
    const o = p.locator('[role=option][data-source-id="demo-soft-impact"]'); await o.scrollIntoViewIfNeeded(); await o.click(); await L.sleep(300);
    const tg = p.locator('[data-testid=arrangement-library-preview-toggle]');
    if (await tg.count()) { await tg.click(); await L.sleep(500); out.m.previewToggle = await tg.textContent(); await doGeo(p, 'previewing'); await shot(p, 'previewing'); await tg.click(); await L.sleep(300); }
    else out.m.previewToggle = 'no toggle';
    await L.blur(p);
  } catch (e) { out.m.previewErr = String(e); }
  // export dialog open
  try {
    const eb = p.locator('button').filter({ hasText: /^Export/ }).first();
    out.m.exportBtnCount = await p.locator('button').filter({ hasText: /^Export/ }).count();
    await eb.click(); await L.sleep(600);
    out.m.exportDialog = await p.evaluate(() => !!document.querySelector('[role=dialog]'));
    await doGeo(p, 'export'); await shot(p, 'export');
    await p.keyboard.press('Escape'); await L.sleep(400);
    out.m.exportClosed = await p.evaluate(() => !document.querySelector('[role=dialog]'));
  } catch (e) { out.m.exportErr = String(e); }
  // (b) import video, seek 1 s
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
  out.m.importStatus = await L.status(p);
  out.m.posB = await L.seekTo(p, 1);
  const bb = await dockInfo(p); out.m.b = bb;
  chk('COPY-DOCK', 'b', bb.caption === 'beeps-6s-h264-aac.mp4 · sound from the video track (M/S/Volume)', { pos: out.m.posB, caption: bb.caption, status: out.m.importStatus });
  await doGeo(p, 'video'); await shot(p, 'b-video');
  // VIDEO-SYNC: play from 0 for 3 s
  {
    await L.seekTo(p, 0);
    const cbs0 = await p.evaluate(() => window.__h.cbs);
    await p.evaluate(() => window.__hStart());
    await playKey(p); await L.sleep(3000);
    const raw = await p.evaluate(() => window.__h.samples.slice());
    await playKey(p); await L.sleep(400);
    await p.evaluate(() => window.__hStop());
    const cbs1 = await p.evaluate(() => window.__h.cbs);
    const valid = raw.filter((s) => Number.isFinite(s.pos) && s.vt !== null && s.paused === false && s.pos > 0.2);
    const pick = [0.25, 0.5, 0.75, 0.95].map((f) => valid[Math.floor(f * (valid.length - 1))]).filter(Boolean);
    const drift = pick.map((s) => ({ t: +s.t.toFixed(0), pos: +s.pos.toFixed(3), vt: +s.vt.toFixed(3), d: +Math.abs(s.vt - s.pos).toFixed(3) }));
    const allD = valid.map((s) => Math.abs(s.vt - s.pos));
    const vt0 = valid.length ? valid[0].vt : null, vt1 = valid.length ? valid[valid.length - 1].vt : null;
    out.m.sync = { rawN: raw.length, validN: valid.length, droppedN: raw.length - valid.length, drift, maxAll: allD.length ? +Math.max(...allD).toFixed(3) : null, p95: allD.length ? +allD.sort((x, y) => x - y)[Math.floor(0.95 * (allD.length - 1))].toFixed(3) : null, vt0, vt1, cbs: [cbs0, cbs1], endPos: await L.posNow(p) };
    const ok = drift.length >= 3 && drift.every((x) => x.d <= 0.12) && vt1 - vt0 > 2 && cbs1 - cbs0 >= 1;
    chk('VIDEO-SYNC', 'play3s', ok, out.m.sync);
  }
  // (c) gap
  out.m.posGap = await L.seekTo(p, 8);
  const cg = await dockInfo(p); out.m.c = cg;
  chk('COPY-DOCK', 'c-gap', cg.gap === 'No video · 00:08.000', { pos: out.m.posGap, gap: cg.gap });
  await doGeo(p, 'gap'); await shot(p, 'c-gap');
  const clips0 = (await L.clipsDom(p)).length;
  out.m.add = await L.addAt(p, 'demo-soft-impact', 'music', 10);
  const clips1 = (await L.clipsDom(p)).length;
  out.m.projectEndAfterAdd = await p.evaluate(() => document.querySelector('[data-testid=arrangement-project-end]').textContent);
  out.m.posGap2 = await L.seekTo(p, 8);
  await playKey(p);
  const gs = [];
  for (let i = 0; i < 4; i++) { await L.sleep(300); gs.push(await p.evaluate(() => [Math.round(performance.now()), (document.querySelector('[data-testid=arrangement-video-gap]') || {}).textContent || null, Number(document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow'))])); }
  await playKey(p); await L.sleep(300);
  out.m.gapSamples = gs;
  const gt = gs.map((g) => L.secs(g[1]));
  const adv = gt.every((x, i) => i === 0 || x > gt[i - 1]) && gt[gt.length - 1] - gt[0] > 0.6 && gs.every((g) => /^No video · \d\d:\d\d\.\d{3}$/.test(g[1] || ''));
  const realTime = (gt[gt.length - 1] - gt[0]) / ((gs[gs.length - 1][0] - gs[0][0]) / 1000);
  await L.blur(p);
  await p.keyboard.press('Control+z'); await L.sleep(500);
  const clips2 = (await L.clipsDom(p)).length;
  out.m.undo = { clips0, clips1, clips2, endAfterUndo: await p.evaluate(() => document.querySelector('[data-testid=arrangement-project-end]').textContent), status: await L.status(p) };
  chk('COPY-DOCK', 'c-gap-live', adv && realTime > 0.8 && realTime < 1.25 && clips1 === clips0 + 1 && clips2 === clips0, { gs, realTime: +realTime.toFixed(3), add: out.m.add, end: out.m.projectEndAfterAdd, undo: out.m.undo });
  // (d) expanded
  await L.seekTo(p, 1);
  await p.getByRole('button', { name: 'Expand video', exact: true }).click(); await L.sleep(600);
  await doGeo(p, 'expanded'); await shot(p, 'd-expanded');
  const d = await p.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const ph = q('[data-testid=arrangement-video-placeholder]'); const r = q('[data-testid=arrangement-video-placeholder-return]');
    const g = (s) => { const e = q(s); return e ? [e.getAttribute('aria-label'), e.getAttribute('title')] : null; };
    return { floating: q('[data-testid=arrangement-video-box]').dataset.videoFloating, phText: ph ? ph.querySelector(':scope > span').textContent : null, retText: r ? r.textContent : null, retAria: r ? r.getAttribute('aria-label') : null, toggle: g('[data-testid=arrangement-video-expand]'), drag: g('[data-testid=arrangement-video-drag]'), close: g('[data-testid=arrangement-video-close]'), status: (q('[data-testid=arrangement-status]') || {}).textContent };
  });
  const nRet = await p.getByRole('button', { name: 'Return the video to the compact view', exact: true }).count();
  const retByRoleText = await p.getByRole('button', { name: 'Return the video to the compact view', exact: true }).allTextContents();
  // keyboard move
  const bx0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-video-box]').getBoundingClientRect().toJSON());
  await p.focus('[data-testid=arrangement-video-drag]'); await p.keyboard.press('ArrowRight'); await L.sleep(300);
  const bx1 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-video-box]').getBoundingClientRect().toJSON());
  out.m.d = { ...d, nRet, retByRoleText, dx: +(bx1.x - bx0.x).toFixed(2), dy: +(bx1.y - bx0.y).toFixed(2), bx0, bx1 };
  chk('COPY-DOCK', 'd-expanded', d.floating === 'true' && d.phText === 'Video expanded' && d.retText.trim() === 'Return' && d.retAria === 'Return the video to the compact view' && nRet === 2 && JSON.stringify(d.toggle) === JSON.stringify(['Return the video to the compact view', 'Return the video to the compact view']) && JSON.stringify(d.drag) === JSON.stringify(['Move the video (arrow keys: 16 px)', 'Move the video']) && JSON.stringify(d.close) === JSON.stringify(['Close the expanded video', 'Close (Esc)']) && Math.abs(out.m.d.dx - 16) <= 0.5 && Math.abs(out.m.d.dy) <= 0.5, out.m.d);
  // three returns
  const ret = [];
  const compactBox = async () => p.evaluate(() => { const b = document.querySelector('[data-testid=arrangement-video-box]'); return { f: b.dataset.videoFloating, e: b.dataset.videoExpanded, box: b.getBoundingClientRect().toJSON(), status: (document.querySelector('[data-testid=arrangement-status]') || {}).textContent, active: document.activeElement ? (document.activeElement.dataset.testid || document.activeElement.tagName) : null, ph: !!document.querySelector('[data-testid=arrangement-video-placeholder]') }; });
  const expand = async () => { await L.blur(p); await p.getByRole('button', { name: 'Expand video', exact: true }).click(); await L.sleep(600); };
  await L.blur(p); await p.keyboard.press('Escape'); await L.sleep(600); ret.push(['Escape', await compactBox()]);
  await expand(); await p.click('[data-testid=arrangement-video-placeholder-return]'); await L.sleep(600); ret.push(['Return', await compactBox()]);
  await expand(); await p.click('[data-testid=arrangement-video-close]'); await L.sleep(600); ret.push(['Close', await compactBox()]);
  out.m.returns = ret;
  const base = out.m.b ? null : null;
  const okRet = ret.every(([, r]) => r.f === 'false' && r.e === 'false' && !r.ph && /^The video went back to the compact view/.test(r.status || '') && Math.abs(r.box.width - 160) <= 1);
  chk('COPY-DOCK', 'd-returns', okRet, ret.map(([k, r]) => [k, r.f, r.status, r.active, Math.round(r.box.x), Math.round(r.box.width)]));
  await doGeo(p, 'returned'); await shot(p, 'd-returned');
  out.m.consoleNet = net.map((n) => ({ label: n.label, errors: n.errors, forbidden: n.forbidden, auth: n.authHeaders, hyd: n.hydration, noise: n.noise }));
  await O.ctx.close();
  // error state (fresh context, abort middle-east)
  {
    const E = await L.openCtx(b, VP, `c148-err-${W}`, net);
    await E.page.route('**/middle-east.mp3', (r) => r.abort());
    await E.page.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
    await E.page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
    await L.sleep(6000);
    out.m.errStatus = await L.status(E.page);
    await doGeo(E.page, 'error'); await shot(E.page, 'error');
    await E.ctx.close();
  }
  // PLAY-FAIL (fresh context)
  {
    const extraInit = () => { const MP = HTMLMediaElement.prototype; const o = MP.play; MP.play = function () { if (this.dataset && this.dataset.testid === 'arrangement-video') { window.__pf = (window.__pf || 0) + 1; return Promise.reject(new DOMException('blocked', 'NotAllowedError')); } return o.apply(this, arguments); }; };
    const F = await L.openStudio(b, VP, `c148-playfail-${W}`, net, { extraInit });
    const q = F.page;
    await L.setSnapOff(q);
    await L.loadVideo(q, 'beeps-6s-h264-aac.mp4');
    await L.seekTo(q, 0);
    const t0 = Date.now();
    await playKey(q);
    let st = null; let tStatus = null;
    while (Date.now() - t0 < 10000) { st = await L.status(q); if (st === 'Video playback failed — try MP4 (H.264) or WebM.') { tStatus = Date.now() - t0; break; } await L.sleep(25); }
    const [p1, p2] = await isPlayingPos(q, 500);
    const p3 = await L.posNow(q);
    out.m.playFail = { status: st, tStatusMs: tStatus, pos: [p1, p2, p3], pfCalls: await q.evaluate(() => window.__pf || 0), cbs: await q.evaluate(() => window.__h.cbs) };
    await shot(q, 'playfail');
    chk('PLAY-FAIL', 'status-stop', st === 'Video playback failed — try MP4 (H.264) or WebM.' && p1 === p2 && p2 === p3 && out.m.playFail.pfCalls >= 1, out.m.playFail);
    await doGeo(q, 'playfail');
    await F.ctx.close();
  }
  out.m.net = net.map((n) => ({ label: n.label, errors: n.errors, forbidden: n.forbidden, auth: n.authHeaders, hyd: n.hydration, noise: n.noise }));
  save(); await b.close();
  console.log('NET', JSON.stringify(out.m.net));
  console.log('SUMMARY', out.checks.filter((c) => c.ok).length, '/', out.checks.length);
})().catch((e) => { console.error(e); save(); process.exit(1); });
