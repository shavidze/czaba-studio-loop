// C round 172 — RADIUS / BOX / FUNC-SMOKE for V-3c-5a. Measures the shipped compiled classes (no DOM swap).
// node c172-radius.cjs <1440|1280> <attempt> [normal|crops]
// Session V: video only (same recipe as c171-surf V0/V1) -> P4 compact, P3+P4 floating, dock func.
// Session M: video + demo-middle-east on Music at 1 s -> D1 (P1), D2 (P2, Ctrl+click video), G1 (P5), K1 (P6).
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path'); const PNG = require('./png.cjs');
const W = +process.argv[2]; const ATT = process.argv[3] || '1'; const MODE = process.argv[4] || 'normal';
const TAG = `${W}-${ATT}${MODE === 'normal' ? '' : '-' + MODE}`;
const OUTD = path.join(L.ROOT, 'out', 'radius'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'radius'); fs.mkdirSync(SHD, { recursive: true });
const SITES = {
  P1: '[data-testid=arrangement-detail-waveform]',
  P2: '[data-testid=arrangement-detail-content] div:has(> [data-testid=arrangement-detail-reason])',
  P3: '[data-testid=arrangement-video-placeholder]',
  P4: '[data-testid=arrangement-video-box]',
  P5: '[data-testid=arrangement-grid-menu]',
  P6: '[role=menu]:not([data-testid=arrangement-grid-menu])',
  OVroot: '[data-testid=arrangement-overview]',
  OVoverlay: '[data-testid=arrangement-overview] > div:first-child',
  OVframe: '[data-testid=arrangement-overview-frame]',
  'dock-expand': '[data-testid=arrangement-video-expand]',
  'dock-drag': '[data-testid=arrangement-video-drag]',
  'dock-close': '[data-testid=arrangement-video-close]',
  'dock-return': '[data-testid=arrangement-video-placeholder-return]',
};
const measure = (sites) => {
  const r2 = (v) => +v.toFixed(2);
  const one = (e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return { box: [r2(r.x), r2(r.y), r2(r.width), r2(r.height)], radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius], border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`, bg: cs.backgroundColor, shadow: cs.boxShadow, overflow: cs.overflow, cls: typeof e.className === 'string' ? e.className : '' }; };
  const out = {};
  for (const [id, sel] of Object.entries(sites)) {
    const e = document.querySelector(sel); if (!e) { out[id] = { present: false }; continue; }
    const m = one(e); m.present = true; m.count = document.querySelectorAll(sel).length;
    m.children = [...e.children].map((c) => { const r = c.getBoundingClientRect(); const cs = getComputedStyle(c); return { tag: c.tagName, tid: c.getAttribute('data-testid') || c.getAttribute('role') || null, box: [r2(r.x), r2(r.y), r2(r.width), r2(r.height)], radius: cs.borderTopLeftRadius, text: (c.textContent || '').trim().slice(0, 40) }; });
    if (id === 'P5' || id === 'P6') m.rows = [...e.querySelectorAll('[role^=menuitem]')].map((c) => { const cs = getComputedStyle(c); const r = c.getBoundingClientRect(); return { role: c.getAttribute('role'), text: c.textContent.trim().slice(0, 30), radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius], box: [r2(r.x), r2(r.y), r2(r.width), r2(r.height)], bg: cs.backgroundColor }; });
    out[id] = m;
  }
  return out;
};
const pickSites = (ids) => Object.fromEntries(ids.map((i) => [i, SITES[i]]));
const centreClick = async (p, l, opts = {}) => { const bb = await l.boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; const hit = await l.evaluate((e, [x, y]) => { const t = document.elementFromPoint(x, y); return !!(t && (t === e || e.contains(t))); }, [x, y]); await p.mouse.move(x, y, { steps: 2 }); await p.mouse.click(x, y, opts); return hit; };
const focusInfo = (p) => p.evaluate(() => { const a = document.activeElement; return a ? { tag: a.tagName, testid: a.getAttribute('data-testid'), label: a.getAttribute('aria-label'), text: (a.textContent || '').trim().slice(0, 30) } : null; });
const boxOf = (p, s) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)]; }, s);
const dockState = (p) => p.evaluate(() => { const b = document.querySelector('[data-testid=arrangement-video-box]'); return { box: !!b, position: b ? getComputedStyle(b).position : null, placeholder: !!document.querySelector('[data-testid=arrangement-video-placeholder]'), expandLabel: (document.querySelector('[data-testid=arrangement-video-expand]') || { getAttribute: () => null }).getAttribute('aria-label') }; });
async function cornerCrops(p, id, tag, st, sz = 20) {
  const bb = await boxOf(p, SITES[id]); if (!bb) return null;
  const [x, y, w, h] = bb; const res = {};
  const corners = { tl: [x - 4, y - 4], tr: [x + w - sz + 4, y - 4], br: [x + w - sz + 4, y + h - sz + 4], bl: [x - 4, y + h - sz + 4] };
  for (const [k, [cx, cy]] of Object.entries(corners)) { const f = path.join(SHD, `corner4x-${W}-${tag}-${id}-${k}-${ATT}.png`); await p.screenshot({ path: f, clip: { x: Math.max(0, cx), y: Math.max(0, cy), width: sz, height: sz } }); res[k] = path.relative(L.ROOT, f); }
  const full = path.join(SHD, `site4x-${W}-${tag}-${id}-${ATT}.png`); await p.screenshot({ path: full, clip: { x: Math.max(0, x - 6), y: Math.max(0, y - 6), width: w + 12, height: h + 12 } }); res.full = path.relative(L.ROOT, full);
  st.crops = st.crops || {}; st.crops[`${tag}-${id}`] = res; return res;
}
// Square-corner probe: pixel at the box's geometric corner (inset 0.75 css px) vs a video pixel at the top edge middle (inset 0.75 px) and the outside page pixel.
async function cornerClipProbe(p, id) {
  const bb = await boxOf(p, SITES[id]); if (!bb) return null; const [x, y, w, h] = bb; const pad = 6;
  const buf = await p.screenshot({ clip: { x: x - pad, y: y - pad, width: w + 2 * pad, height: h + 2 * pad } });
  const img = PNG.decode(buf); const dpr = img.w / (w + 2 * pad);
  const at = (cx, cy) => img.px(Math.min(img.w - 1, Math.round((cx + pad) * dpr)), Math.min(img.h - 1, Math.round((cy + pad) * dpr)));
  const i = 0.75;
  return { dpr: +dpr.toFixed(2), corner: { tl: at(i, i), tr: at(w - i, i), br: at(w - i, h - i), bl: at(i, h - i) }, edgeMid: { top: at(w / 2, i), bottom: at(w / 2, h - i), left: at(i, h / 2), right: at(w - i, h / 2) }, inside10: { tl: at(10, 10), br: at(w - 10, h - 10) }, outside: at(-pad + 1, -pad + 1) };
}
const videoInfo = (p) => p.evaluate(() => [...document.querySelectorAll('video')].map((v) => ({ role: v.dataset.videoRole, rs: v.readyState, w: v.videoWidth, ct: +v.currentTime.toFixed(3), inBox: !!v.closest('[data-testid=arrangement-video-box]'), vis: +v.getBoundingClientRect().width.toFixed(1) })));
(async () => {
  const b = await L.launch(); const net = []; const res = { W, attempt: ATT, mode: MODE, utc: new Date().toISOString(), states: {}, func: {} };
  const opts = MODE === 'crops' ? { deviceScaleFactor: 4 } : {};
  // ---------------- Session V
  {
    const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c172rad-${W}-V-${ATT}${MODE === 'crops' ? '-crops' : ''}`, net, opts); res.fontsV = log.fontsReady;
    await p.mouse.move(2, 2); await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
    const v0 = res.states.V0 = { m: await p.evaluate(measure, pickSites(['P4', 'dock-expand', 'dock-drag', 'dock-close', 'dock-return', 'OVroot', 'OVoverlay', 'OVframe'])), video: await videoInfo(p) };
    v0.clip = await cornerClipProbe(p, 'P4');
    if (MODE === 'crops') await cornerCrops(p, 'P4', 'V0', v0); else await p.screenshot({ path: path.join(SHD, `rad-${TAG}-V0.png`) });
    const d = res.func.dock = {};
    d.expandHit = await centreClick(p, p.locator(SITES['dock-expand'])); await sleep(900); d.s1 = await dockState(p); await p.mouse.move(2, 2); await L.blur(p); await sleep(400);
    const v1 = res.states.V1 = { m: await p.evaluate(measure, pickSites(['P3', 'P4', 'dock-expand', 'dock-drag', 'dock-close', 'dock-return'])), video: await videoInfo(p) };
    v1.clip = await cornerClipProbe(p, 'P4');
    if (MODE === 'crops') { await cornerCrops(p, 'P4', 'V1', v1); await cornerCrops(p, 'P3', 'V1', v1); } else await p.screenshot({ path: path.join(SHD, `rad-${TAG}-V1.png`) });
    if (MODE === 'normal') {
      d.box0 = await boxOf(p, SITES.P4);
      const db = await p.locator(SITES['dock-drag']).boundingBox(); d.dragHit = await p.evaluate(([x, y]) => { const t = document.elementFromPoint(x, y); return !!(t && t.closest('[data-testid=arrangement-video-drag]')); }, [db.x + db.width / 2, db.y + db.height / 2]);
      await p.locator(SITES['dock-drag']).focus(); await p.keyboard.press('ArrowRight'); await sleep(400);
      d.box1 = await boxOf(p, SITES.P4); d.dx = +(d.box1[0] - d.box0[0]).toFixed(2); d.dy = +(d.box1[1] - d.box0[1]).toFixed(2);
      await L.blur(p); await p.keyboard.press('Home'); await sleep(300);
      const vt = () => p.evaluate(() => { const v = document.querySelector('[data-testid=arrangement-video-box] video[data-video-role=active]') || document.querySelector('video[data-video-role=active]'); return v ? { ct: +v.currentTime.toFixed(3), paused: v.paused, inBox: !!v.closest('[data-testid=arrangement-video-box]'), floating: getComputedStyle(v.closest('[data-testid=arrangement-video-box]') || v).position } : null; });
      d.v0 = await vt(); await p.keyboard.press('Space'); await sleep(1500); d.v1 = await vt(); d.pos1 = await L.posNow(p);
      await p.keyboard.press('Space'); await sleep(500); d.v2 = await vt();
      d.returnHit = await centreClick(p, p.locator(SITES['dock-return'])); await sleep(700); d.s2 = await dockState(p); d.focusAfterReturn = await focusInfo(p);
      await centreClick(p, p.locator(SITES['dock-expand'])); await sleep(900); d.s3 = await dockState(p);
      await p.keyboard.press('Escape'); await sleep(700); d.s4 = await dockState(p); d.focusAfterEsc = await focusInfo(p);
    }
    await ctx.close();
  }
  // ---------------- Session M
  {
    const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c172rad-${W}-M-${ATT}${MODE === 'crops' ? '-crops' : ''}`, net, opts); res.fontsM = log.fontsReady;
    await p.mouse.move(2, 2);
    await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); await L.blur(p);
    res.add = (await L.addAt(p, 'demo-middle-east', 'music', 1)).status; await sleep(1200);
    const clips = await L.clipsDom(p); res.clips = clips.map((c) => [c.id, c.kind, c.lane, c.start, c.wdur]);
    const audio = clips.find((c) => c.lane === 'music'); const video = clips.find((c) => c.kind === 'video');
    res.detailToggle = await p.evaluate(() => { const t = document.querySelector('[data-testid=arrangement-detail-toggle]'); return t ? t.getAttribute('aria-expanded') : null; });
    if (res.detailToggle === 'false') { res.detailExpandHit = await centreClick(p, p.locator('[data-testid=arrangement-detail-toggle]')); await sleep(700); await L.blur(p); res.detailToggleAfter = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]').getAttribute('aria-expanded')); }
    // D1
    await L.selectClip(p, audio.id); await L.blur(p); await p.mouse.move(2, 2); await sleep(800);
    const d1 = res.states.D1 = { m: await p.evaluate(measure, pickSites(['P1', 'OVroot', 'OVoverlay', 'OVframe'])), detail: await L.detailInfo(p) };
    d1.peaks = await p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-detail-waveform]'); const s = e && e.querySelector('svg,canvas'); return s ? { tag: s.tagName, paths: e.querySelectorAll('path,rect,polyline').length, box: (() => { const r = s.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(2)); })() } : null; });
    d1.clip = await cornerClipProbe(p, 'P1');
    if (MODE === 'crops') { await cornerCrops(p, 'P1', 'D1', d1); await cornerCrops(p, 'OVroot', 'D1', d1); } else await p.screenshot({ path: path.join(SHD, `rad-${TAG}-D1.png`) });
    if (MODE === 'normal') {
      const f = res.func.P1 = {};
      f.before = { sel: (await L.clipsDom(p)).filter((c) => c.sel).map((c) => c.id), status: await L.status(p), detail: (await L.detailInfo(p)).text };
      f.hit = await centreClick(p, p.locator(SITES.P1)); await sleep(500);
      f.after = { sel: (await L.clipsDom(p)).filter((c) => c.sel).map((c) => c.id), status: await L.status(p), detail: (await L.detailInfo(p)).text, range: !!(await p.locator('[data-testid=arrangement-detail-range]').count()), errors: log.errors.length };
      const st = +(await p.locator('[data-testid=arrangement-detail-start]').inputValue()); const en = +(await p.locator('[data-testid=arrangement-detail-end]').inputValue()); f.inputs0 = [st, en];
      await p.locator('[data-testid=arrangement-detail-start]').fill(String(+(st + 1).toFixed(3))); await p.locator('[data-testid=arrangement-detail-end]').fill(String(+(st + 3).toFixed(3)));
      f.applyHit = await centreClick(p, p.locator('[data-testid=arrangement-detail-apply]')); await sleep(600);
      f.applied = { status: await L.status(p), range: await boxOf(p, '[data-testid=arrangement-detail-range]'), p1: await boxOf(p, SITES.P1), sel: (await L.clipsDom(p)).filter((c) => c.sel).map((c) => c.id), laneRange: await p.evaluate(() => document.querySelectorAll('[data-testid*=range]').length) };
      await p.screenshot({ path: path.join(SHD, `rad-${TAG}-D1-setsel.png`) });
      if (MODE === 'normal') d1.afterSetSelection = await p.evaluate(measure, pickSites(['P1']));
    }
    // D2: Ctrl+click the video clip
    await p.keyboard.press('Escape'); await sleep(200); await L.selectClip(p, audio.id); await L.selectClip(p, video.id, ['Control']); await L.blur(p); await p.mouse.move(2, 2); await sleep(700);
    const d2 = res.states.D2 = { m: await p.evaluate(measure, pickSites(['P2'])), detail: await L.detailInfo(p), sel: (await L.clipsDom(p)).filter((c) => c.sel).map((c) => c.id) };
    d2.reasons = await p.evaluate(() => ({ range: (document.querySelector('[data-testid=arrangement-detail-reason]') || {}).textContent || null, gain: (document.querySelector('[data-testid=arrangement-detail-clip-gain-reason]') || {}).textContent || null, startDescr: (document.querySelector('[data-testid=arrangement-detail-start]') || { getAttribute: () => null }).getAttribute('aria-describedby'), reasonId: (document.querySelector('[data-testid=arrangement-detail-reason]') || {}).id || null, gainField: (document.querySelector('[data-testid=arrangement-detail-clip-gain-input]') || { getAttribute: () => null }).getAttribute('aria-describedby'), gainId: (document.querySelector('[data-testid=arrangement-detail-clip-gain-reason]') || {}).id || null }));
    if (MODE === 'crops') await cornerCrops(p, 'P2', 'D2', d2); else await p.screenshot({ path: path.join(SHD, `rad-${TAG}-D2.png`) });
    await p.keyboard.press('Escape'); await sleep(300); await L.blur(p);
    // G1: right-click an empty spot of the Video lane (past the 6 s video clip; always on screen at 1280x720)
    const lane = await p.evaluate(() => { const rl = document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect(); const row = document.querySelector('[data-track-id="video"]').getBoundingClientRect(); return { x: rl.left + Math.min(500, rl.width * 0.6), y: row.top + row.height / 2 }; });
    const openGrid = async () => { await p.mouse.move(lane.x, lane.y, { steps: 2 }); await p.mouse.click(lane.x, lane.y, { button: 'right' }); await sleep(500); return p.locator(SITES.P5).count(); };
    const g = res.func.P5 = {}; g.focusBeforeOpen = await focusInfo(p); g.division0 = await p.locator('[data-testid=arrangement-grid-division]').inputValue();
    g.open1 = await openGrid();
    const g1 = res.states.G1 = { m: await p.evaluate(measure, pickSites(['P5'])) };
    const rowL = p.locator(`${SITES.P5} [role^=menuitem]`); const nRows = await rowL.count();
    let hoverIdx = 0; for (let i = 0; i < nRows; i++) { if ((await rowL.nth(i).getAttribute('aria-checked')) === 'false' && (await rowL.nth(i).getAttribute('role')) === 'menuitemradio') { hoverIdx = i; break; } }
    const hb = await rowL.nth(0).boundingBox(); await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2, { steps: 2 }); await sleep(300);
    g1.hoverFirstRow = await rowL.nth(0).evaluate((e) => ({ hover: e.matches(':hover'), bg: getComputedStyle(e).backgroundColor, radius: getComputedStyle(e).borderTopLeftRadius }));
    if (MODE === 'crops') await cornerCrops(p, 'P5', 'G1hover', g1); else await p.screenshot({ path: path.join(SHD, `rad-${TAG}-G1.png`) });
    if (MODE === 'normal') {
      g.choose = { idx: hoverIdx, text: (await rowL.nth(hoverIdx).textContent()).trim() };
      g.chooseHit = await centreClick(p, rowL.nth(hoverIdx)); await sleep(500);
      g.afterChoose = { menuOpen: await p.locator(SITES.P5).count(), division: await p.locator('[data-testid=arrangement-grid-division]').inputValue(), status: await L.status(p) };
      await L.blur(p); g.focusBeforeReopen = await focusInfo(p);
      // reopen from the grid division select as the focused opener
      await p.locator('[data-testid=arrangement-grid-division]').focus(); g.focusOpener = await focusInfo(p);
      g.open2 = await openGrid(); await p.keyboard.press('Escape'); await sleep(400);
      g.afterEsc = { menuOpen: await p.locator(SITES.P5).count(), focus: await focusInfo(p) };
    } else { await p.keyboard.press('Escape'); await sleep(300); }
    await L.blur(p);
    // K1: add a marker at the playhead and open its menu
    const k = res.func.P6 = {};
    await L.seekTo(p, 2); k.addHit = await centreClick(p, p.locator('[data-testid=arrangement-marker-add]')); await sleep(500); await L.blur(p);
    k.markers0 = await p.locator('[data-testid=arrangement-marker]').count();
    const mk = p.locator('[data-testid=arrangement-marker]').first(); const mb = await mk.boundingBox();
    const openMarker = async () => { await p.mouse.move(mb.x + Math.min(8, mb.width / 2), mb.y + mb.height / 2, { steps: 2 }); await p.mouse.click(mb.x + Math.min(8, mb.width / 2), mb.y + mb.height / 2, { button: 'right' }); await sleep(500); return p.locator(SITES.P6).count(); };
    k.open1 = await openMarker();
    const k1 = res.states.K1 = { m: await p.evaluate(measure, pickSites(['P6'])) };
    const mrows = p.locator(`${SITES.P6} [role^=menuitem]`);
    const mh = await mrows.nth(0).boundingBox(); await p.mouse.move(mh.x + mh.width / 2, mh.y + mh.height / 2, { steps: 2 }); await sleep(300);
    k1.hoverFirstRow = await mrows.nth(0).evaluate((e) => ({ hover: e.matches(':hover'), bg: getComputedStyle(e).backgroundColor, radius: getComputedStyle(e).borderTopLeftRadius }));
    if (MODE === 'crops') await cornerCrops(p, 'P6', 'K1hover', k1); else await p.screenshot({ path: path.join(SHD, `rad-${TAG}-K1.png`) });
    if (MODE === 'normal') {
      await p.keyboard.press('Escape'); await sleep(400); k.afterEsc = { menuOpen: await p.locator(SITES.P6).count(), focus: await focusInfo(p) };
      k.open2 = await openMarker();
      const del = p.locator(`${SITES.P6} [role^=menuitem]`, { hasText: /^Delete/ }); k.delText = (await del.textContent()).trim();
      k.delHit = await centreClick(p, del); await sleep(500);
      k.afterDelete = { menuOpen: await p.locator(SITES.P6).count(), markers: await p.locator('[data-testid=arrangement-marker]').count(), status: await L.status(p) };
    }
    res.errorsM = log.errors.slice(0, 5);
    await ctx.close();
  }
  res.net = X.netOk(net); res.netRaw = net.map((q) => ({ label: q.label, errors: q.errors, forbidden: q.forbidden, auth: q.authHeaders, hyd: q.hydration, noise: q.noise, fontBad: q.fontResp.filter((r) => r.s !== 200).length + q.fontFail.length }));
  await b.close();
  fs.writeFileSync(path.join(OUTD, `rad-${TAG}.json`), JSON.stringify(res, null, 1));
  const s = (m) => m && m.present ? `${m.radii.join('/')} box ${JSON.stringify(m.box)} border ${m.border} bg ${m.bg} sh ${m.shadow.slice(0, 50)}` : 'absent';
  for (const [st, v] of Object.entries(res.states)) for (const [id, m] of Object.entries(v.m)) console.log(W, st, id, s(m), m.rows ? 'rows ' + m.rows.map((r) => r.radii[0]).join(',') : '');
  console.log(JSON.stringify({ fontsV: res.fontsV && res.fontsV.ok, fontsM: res.fontsM && res.fontsM.ok, net: res.net, func: res.func, D2: res.states.D2.reasons, sel: res.states.D2.sel, clipV0: res.states.V0.clip, clipV1: res.states.V1.clip, clipD1: res.states.D1.clip, peaks: res.states.D1.peaks, G1hover: res.states.G1.hoverFirstRow, K1hover: res.states.K1.hoverFirstRow, video: res.states.V1.video }, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
