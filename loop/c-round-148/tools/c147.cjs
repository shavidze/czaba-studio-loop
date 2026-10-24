// C round 147 — COPY-LIB, COPY-PREVIEW, COPY-STATUS, neighbours, PX-NET/REG-HYD. node c147.cjs <1440|1280>
const L = require('./lib.cjs');
const fs = require('fs');
const path = require('path');
const W = +process.argv[2] || 1440;
const VP = W === 1440 ? { width: 1440, height: 900 } : { width: 1280, height: 720 };
const net = [];
const out = { vp: W, startedUtc: new Date().toISOString(), checks: [], m: {}, invalidRuns: [] };
const file = path.join(L.OUT, `c147-${W}.json`);
const save = () => fs.writeFileSync(file, JSON.stringify({ ...out, net }, null, 1));
const chk = (row, id, ok, v) => { out.checks.push({ row, id, ok: !!ok, v }); console.log(ok ? 'ok  ' : 'FAIL', row, id, JSON.stringify(v).slice(0, 300)); save(); };
const shot = (p, n) => p.screenshot({ path: path.join(L.SHOTS, `c147-${n}-${W}.png`) });
const TOGGLE = '[data-testid=arrangement-library-preview-toggle]';
const PREV = '[data-testid=arrangement-library-preview]';
const MK = '[data-testid=arrangement-library-option-previewing]';
const WAVE_NAME = 'Preview waveform — click = play from here · ← → 1 s · Home/End · Space = ▶/■';
const READY = 'Demo collection ready. Choose a track and add a sound (Enter or ＋ Add).';
const BADGE = 'Demo collection — no sign-in required';
const badgeText = (p) => p.evaluate(() => { const h = document.querySelector('header'); const s = h && h.querySelector('span.border-accent'); return s ? s.textContent.trim() : null; });
const tracks = (p) => p.evaluate(() => [...document.querySelectorAll('[data-track-id]')].filter((e) => e.querySelector('[data-testid=arrangement-track-header]')).map((e) => { const b = e.querySelector('[data-testid=arrangement-track-header] button[aria-label*="— set as the active track"]'); return { id: e.getAttribute('data-track-id'), name: b ? b.textContent.trim() : null, aria: b ? b.getAttribute('aria-label') : null, video: !!e.querySelector('[data-testid=arrangement-video-input]') || /video/i.test(e.getAttribute('data-track-id')) }; }));
const laneText = (p) => p.evaluate((s) => { const e = document.querySelector(`${s} > p`); return e ? { text: e.textContent.replace(/\s+/g, ' ').trim(), title: e.getAttribute('title') } : null; }, PREV);
const waveNow = (p) => p.evaluate(() => { const w = document.querySelector('[data-testid=arrangement-library-preview-wave]'); const c = window.__h.ctxs[0]; return { t: Math.round(performance.now()), now: w ? Number(w.getAttribute('aria-valuenow')) : NaN, cbs: window.__h.cbs, ctx: c ? c.state : null, ctxT: c ? +c.currentTime.toFixed(3) : null, toggle: (document.querySelector('[data-testid=arrangement-library-preview-toggle]') || {}).textContent }; });
const clipCount = async (p, lane, title) => (await L.clipsDom(p)).filter((c) => (!lane || c.lane === lane) && (!title || c.title.includes(title))).length;

async function waitStatusSettled(p) {
  const t0 = Date.now();
  while (Date.now() - t0 < 60000) {
    const n = await p.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].filter((x) => /Loading…|იტვირთება…/.test(x.textContent)).length);
    const s = await L.status(p);
    if (n === 0 && !/^Loading/.test(s)) return s;
    await L.sleep(200);
  }
  return L.status(p);
}

(async () => {
  const b = await L.launch();
  // ================= Context A: library + preview =================
  const O = await L.openStudio(b, VP, `c147-${W}-lib`, net);
  const p = O.page;
  out.snapAtStart = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
  out.snapAfter = await L.setSnapOff(p);
  // ---- COPY-LIB names ----
  const lib = p.getByRole('complementary', { name: 'Library', exact: true });
  chk('COPY-LIB', 'complementary', (await lib.count()) === 1, await lib.count());
  const h2 = lib.getByRole('heading', { name: 'Library', exact: true });
  chk('COPY-LIB', 'heading', (await h2.count()) === 1, await h2.count());
  const coll = p.getByRole('button', { name: 'Collapse library', exact: true });
  chk('COPY-LIB', 'collapse-aria-title', (await coll.count()) === 1 && (await coll.getAttribute('title')) === 'Collapse library', await coll.getAttribute('title'));
  const sb = p.getByRole('searchbox', { name: 'Search the library', exact: true });
  chk('COPY-LIB', 'searchbox', (await sb.count()) === 1 && (await sb.getAttribute('placeholder')) === 'Search: name, type, collection…', await sb.getAttribute('placeholder'));
  const nav = p.getByRole('navigation', { name: 'Library sidebar', exact: true });
  chk('COPY-LIB', 'navigation', (await nav.count()) === 1, await nav.count());
  const allBtn = nav.getByRole('button', { name: /^All\s*9$/ });
  chk('COPY-LIB', 'all-9', (await allBtn.count()) === 1, { n: await allBtn.count(), text: await nav.locator(':scope > button').first().textContent() });
  const toggles = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-library-tree] button[aria-expanded]')].map((x) => ({ aria: x.getAttribute('aria-label'), exp: x.getAttribute('aria-expanded'), label: x.parentElement.querySelector('button[title]') ? x.parentElement.querySelector('button[title]').getAttribute('title') : null })));
  out.m.toggles = toggles;
  chk('COPY-LIB', 'arrows-fold', toggles.length >= 1 && toggles.every((t) => t.exp === 'true' && t.aria === `${t.label} — Fold`), toggles);
  const lb = p.getByRole('listbox', { name: 'Sounds', exact: true });
  chk('COPY-LIB', 'listbox', (await lb.count()) === 1, await lb.count());
  const sep = p.getByRole('separator', { name: 'Library width', exact: true });
  chk('COPY-LIB', 'separator', (await sep.count()) === 1, await sep.count());
  await shot(p, 'ready');
  // (a) fold / unfold
  const firstLabel = toggles[0].label;
  const folders = () => p.evaluate(() => { const c = document.querySelectorAll('[data-testid=arrangement-library-tree] > div')[0]; return c.querySelectorAll('[data-testid=arrangement-library-folder]').length; });
  const f0 = await folders();
  await p.getByRole('button', { name: `${firstLabel} — Fold`, exact: true }).click(); await L.sleep(250);
  const un = p.getByRole('button', { name: `${firstLabel} — Unfold`, exact: true });
  const f1 = await folders();
  chk('COPY-LIB', 'a-unfold', (await un.count()) === 1 && (await un.getAttribute('aria-expanded')) === 'false' && f0 > 0 && f1 === 0, { f0, f1, exp: await un.getAttribute('aria-expanded') });
  await shot(p, 'folded');
  await un.click(); await L.sleep(250);
  const fo = p.getByRole('button', { name: `${firstLabel} — Fold`, exact: true });
  chk('COPY-LIB', 'a-refold', (await fo.count()) === 1 && (await fo.getAttribute('aria-expanded')) === 'true' && (await folders()) === f0, { f: await folders() });
  // (b) search
  await sb.fill('zzqx'); await L.sleep(300);
  const clr = p.getByRole('button', { name: 'Clear search', exact: true });
  const empty = await p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-library-empty]'); return e ? e.textContent.trim() : null; });
  const ptitle = await p.evaluate((s) => { const e = document.querySelector(`${s} > div > p`); return e ? e.textContent.trim() : null; }, PREV);
  chk('COPY-LIB', 'b-empty', (await clr.count()) === 1 && empty === 'No sounds found.' && (await p.getByText('No sounds found.', { exact: true }).isVisible()) && ptitle === 'Select a sound in the list', { empty, ptitle });
  await shot(p, 'empty-search');
  await sb.press('Escape'); await L.sleep(300);
  const afterEsc = await p.evaluate(() => ({ v: document.querySelector('[data-testid=arrangement-library-search]').value, opts: document.querySelectorAll('[role=option][data-source-id]').length, empty: !!document.querySelector('[data-testid=arrangement-library-empty]') }));
  chk('COPY-LIB', 'b-escape', afterEsc.v === '' && afterEsc.opts === 9 && !afterEsc.empty, afterEsc);
  await sb.fill('zzqx'); await L.sleep(300);
  await clr.click(); await L.sleep(300);
  const afterClr = await p.evaluate(() => ({ v: document.querySelector('[data-testid=arrangement-library-search]').value, opts: document.querySelectorAll('[role=option][data-source-id]').length, empty: !!document.querySelector('[data-testid=arrangement-library-empty]') }));
  chk('COPY-LIB', 'b-clear', afterClr.v === '' && afterClr.opts === 9 && !afterClr.empty, afterClr);
  // (c) filter
  await p.locator('[data-testid=arrangement-library-tree] > div button[title]').first().click(); await L.sleep(250);
  const filt = await p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-library-filter]'); return e ? { text: e.textContent, span: e.querySelector('span').textContent } : null; });
  chk('COPY-LIB', 'c-filter', filt && filt.text === `Filter: ${firstLabel}` && filt.span === firstLabel, filt);
  await shot(p, 'filtered');
  await allBtn.click(); await L.sleep(250);
  // (e) separator keyboard
  const v0 = Number(await sep.getAttribute('aria-valuenow'));
  await sep.focus(); await p.keyboard.press('ArrowRight'); await L.sleep(250);
  const v1 = Number(await sep.getAttribute('aria-valuenow'));
  chk('COPY-LIB', 'e-separator', v1 - v0 === 16, { v0, v1 });
  await p.keyboard.press('ArrowLeft'); await L.sleep(250);
  const v2 = Number(await sep.getAttribute('aria-valuenow'));
  // (d) collapse / expand (+ focus hand-off neighbour)
  const w0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-library]').getBoundingClientRect().width);
  await coll.click(); await L.sleep(600);
  const ex = p.getByRole('button', { name: 'Expand library', exact: true });
  const focusAfterCollapse = await p.evaluate(() => document.activeElement && document.activeElement.dataset.testid);
  chk('COPY-LIB', 'd-collapsed', (await ex.count()) === 1 && (await ex.getAttribute('title')) === 'Expand library' && focusAfterCollapse === 'arrangement-library-expand', { title: await ex.getAttribute('title'), focusAfterCollapse, v2 });
  await shot(p, 'collapsed');
  await ex.click(); await L.sleep(700);
  const w1 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-library]').getBoundingClientRect().width);
  const focusAfterExpand = await p.evaluate(() => document.activeElement && document.activeElement.dataset.testid);
  chk('COPY-LIB', 'd-expanded', (await h2.count()) === 1 && Math.abs(w1 - w0) <= 0.5 && focusAfterExpand === 'arrangement-library-collapse', { w0, w1, focusAfterExpand });
  // ---- COPY-PREVIEW ----
  await L.blur(p);
  const tr = await tracks(p); out.m.tracks = tr;
  const music = tr.find((t) => t.name === 'Music') || tr.find((t) => !t.video);
  const video = tr.find((t) => t.video);
  await p.click(L.nameSel(music.id)); await L.sleep(250); await L.blur(p);
  const reg = p.getByRole('region', { name: 'Preview', exact: true });
  const slider = p.getByRole('slider', { name: WAVE_NAME, exact: true });
  const lt = await laneText(p);
  chk('COPY-PREVIEW', 'a-region-slider-lane', (await reg.count()) === 1 && (await slider.count()) === 1 && /^Active track: Music · playhead 00:00\.000$/.test(lt.text) && lt.title === 'Active track: Music', lt);
  // (b) video active
  if (video) {
    await p.click(L.nameSel(video.id)); await L.sleep(300); await L.blur(p);
    const lv = await laneText(p);
    const addDis = await p.getByRole('button', { name: '＋ Add', exact: true }).isDisabled();
    chk('COPY-PREVIEW', 'b-video', lv.text.includes('(audio is not added here)') && lv.title === `Active track: ${video.name} (audio is not added here)` && addDis, { lv, addDis, video });
    await shot(p, 'video-active');
    await p.click(L.nameSel(music.id)); await L.sleep(300); await L.blur(p);
  } else chk('COPY-PREVIEW', 'b-video', false, { err: 'no video track found', tr });
  // (c) real preview playback
  await p.click('[role=option][data-source-id=demo-soft-impact]'); await L.sleep(300);
  const s0 = await waveNow(p);
  await p.locator(TOGGLE).click();
  const samples = [s0];
  for (let i = 0; i < 6; i++) { await L.sleep(250); samples.push(await waveNow(p)); if (i === 1) { out.m.markerWhile = await p.evaluate((MK) => [...document.querySelectorAll(MK)].map((m) => ({ t: m.textContent, row: m.closest('[role=option]').dataset.sourceId })), MK); out.m.toggleWhile = await p.locator(TOGGLE).textContent(); await shot(p, 'previewing'); } }
  out.m.previewSamples = samples;
  const adv = samples.slice(1).find((x) => x.now > s0.now);
  chk('COPY-PREVIEW', 'c-playback', adv && adv.t - s0.t <= 1500 + 300 && samples[samples.length - 1].cbs - s0.cbs >= 1 && out.m.toggleWhile === '■ Stop' && out.m.markerWhile.length === 1 && out.m.markerWhile[0].t === '▶ Playing' && out.m.markerWhile[0].row === 'demo-soft-impact', { s0, adv, toggle: out.m.toggleWhile, marker: out.m.markerWhile, ctx: samples[samples.length - 1].ctx });
  // Soft impact is 2 s; it may have ended. Start again if needed, then press the toggle to stop.
  if ((await p.locator(TOGGLE).textContent()) !== '■ Stop') { await p.locator(TOGGLE).click(); await L.sleep(300); }
  const beforeStop = await p.locator(TOGGLE).textContent();
  await p.locator(TOGGLE).click(); await L.sleep(300);
  const afterStop = { toggle: await p.locator(TOGGLE).textContent(), markers: await p.locator(MK).count() };
  chk('COPY-PREVIEW', 'c-stop', beforeStop === '■ Stop' && afterStop.toggle === '▶ Preview' && afterStop.markers === 0, { beforeStop, afterStop });
  // (d) click Add -> one clip; Ctrl+Z removes
  const n0 = await clipCount(p, music.id, 'Soft impact');
  await p.getByRole('button', { name: '＋ Add', exact: true }).click(); await L.sleep(700);
  const n1 = await clipCount(p, music.id, 'Soft impact');
  const st1 = await L.status(p);
  chk('COPY-PREVIEW', 'd-add', n1 - n0 === 1 && /^“Soft impact” added to the .+ track at .+/.test(st1), { n0, n1, st1 });
  await L.blur(p); await p.keyboard.press('Control+z'); await L.sleep(500);
  const n2 = await clipCount(p, music.id, 'Soft impact');
  chk('COPY-PREVIEW', 'd-undo', n2 === n0, { n2 });
  // (e) one Enter on focused Add -> exactly one clip
  await p.getByRole('button', { name: '＋ Add', exact: true }).focus();
  await p.keyboard.press('Enter'); await L.sleep(900);
  const n3 = await clipCount(p, music.id, 'Soft impact');
  chk('COPY-PREVIEW', 'e-enter-once', n3 - n0 === 1, { n3 });
  await L.blur(p); await p.keyboard.press('Control+z'); await L.sleep(400);
  // ---- neighbours: ArrowDown search -> list, Enter add; option dblclick; drag ----
  const nb0 = (await L.clipsDom(p)).length;
  await sb.focus(); await p.keyboard.press('ArrowDown'); await L.sleep(200);
  const act = await p.evaluate(() => ({ role: document.activeElement.getAttribute('role'), id: document.activeElement.dataset.sourceId }));
  await p.keyboard.press('Enter'); await L.sleep(800);
  const nb1 = (await L.clipsDom(p)).length;
  chk('NEIGHBOUR', 'search-arrowdown-enter', act.role === 'option' && nb1 - nb0 === 1, { act, nb0, nb1, st: await L.status(p) });
  await L.blur(p); await p.keyboard.press('Control+z'); await L.sleep(400);
  const nd0 = (await L.clipsDom(p)).length;
  await p.locator('[role=option][data-source-id=demo-slow-rise]').dblclick(); await L.sleep(800);
  const nd1 = (await L.clipsDom(p)).length;
  out.m.dblclick = { nd0, nd1, st: await L.status(p) };
  chk('NEIGHBOUR', 'option-dblclick-adds-one', nd1 - nd0 === 1, out.m.dblclick);
  await L.blur(p); if (nd1 > nd0) { await p.keyboard.press('Control+z'); await L.sleep(400); }
  // drag option onto the Music lane at ~10 s
  const g = await L.geo(p);
  const lane = await p.evaluate((id) => { const e = document.querySelector(`[data-track-id="${id}"]`); const r = e.getBoundingClientRect(); return { y: r.top + r.height / 2, h: r.height }; }, music.id);
  const ob = await p.locator('[role=option][data-source-id=demo-slow-rise]').boundingBox();
  const dg0 = await clipCount(p, music.id, 'Slow rise');
  await p.mouse.move(ob.x + 30, ob.y + ob.height / 2); await p.mouse.down();
  for (let i = 1; i <= 12; i++) { await p.mouse.move(ob.x + 30 + ((g.rl + 10 * g.pps) - ob.x - 30) * i / 12, ob.y + ob.height / 2 + (lane.y - ob.y - ob.height / 2) * i / 12); await L.sleep(30); }
  await p.mouse.up(); await L.sleep(800);
  const dg1 = await clipCount(p, music.id, 'Slow rise');
  out.m.drag = { dg0, dg1, st: await L.status(p), clips: (await L.clipsDom(p)).filter((c) => c.title.includes('Slow rise')) };
  chk('NEIGHBOUR', 'option-drag-adds-one', dg1 - dg0 === 1, out.m.drag);
  await shot(p, 'after-neighbours');
  await O.ctx.close();

  // ================= COPY-STATUS =================
  // (a) fresh context, badge + loading + ready; delay one media route by 1.5 s
  const S = await L.openCtx(b, VP, `c147-${W}-status-a`, net);
  const media = [];
  S.page.on('request', (q) => { if (/\.(mp3|wav|ogg|m4a|flac|webm|mp4)(\?|$)/i.test(q.url())) media.push(q.url()); });
  await S.page.route('**/middle-east.mp3', async (r) => { await L.sleep(1500); await r.continue(); });
  const trans = [];
  const t0 = Date.now();
  await S.page.goto(`${L.BASE}/studio-lab`, { waitUntil: 'commit' });
  let last = null;
  while (Date.now() - t0 < 30000) {
    const s = await S.page.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-status]'); return e ? e.textContent.trim() : null; }).catch(() => null);
    if (s !== last) { trans.push({ t: Date.now() - t0, s }); last = s; }
    if (s === READY && Date.now() - t0 > 3000) break;
    await L.sleep(50);
  }
  out.m.statusTransitions = trans;
  const badgeA = await badgeText(S.page);
  const addTxt = await S.page.locator(`${PREV} button`).nth(1).textContent();
  const fin = await waitStatusSettled(S.page);
  out.m.media = [...new Set(media)];
  chk('COPY-STATUS', 'a-badge', badgeA === BADGE, badgeA);
  const sawLoading = trans.some((x) => x.s === 'Loading the demo collection…');
  chk('COPY-STATUS', 'a-loading', sawLoading, { sawLoading, trans });
  chk('COPY-STATUS', 'a-ready', fin === READY && fin.includes(addTxt) && addTxt === '＋ Add', { fin, addTxt });
  await shot(S.page, 'status-ready');
  await S.ctx.close();
  // (b) one failure
  const E1 = await L.openCtx(b, VP, `c147-${W}-status-b`, net);
  await E1.page.route('**/middle-east.mp3', (r) => r.abort());
  await E1.page.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await E1.page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  const fb = await waitStatusSettled(E1.page); await L.sleep(800);
  const fb2 = await L.status(E1.page);
  chk('COPY-STATUS', 'b-one-failed', fb2 === '1 sound in the demo collection failed to load — details are in the library.', { fb, fb2 });
  await shot(E1.page, 'status-one-failed');
  await E1.ctx.close();
  // (c) two failures: middle-east + the second distinct media URL from the network log
  const second = out.m.media.find((u) => !/middle-east\.mp3/.test(u));
  out.m.secondAborted = second;
  const E2 = await L.openCtx(b, VP, `c147-${W}-status-c`, net);
  await E2.page.route('**/middle-east.mp3', (r) => r.abort());
  if (second) await E2.page.route(second, (r) => r.abort());
  await E2.page.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await E2.page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  await waitStatusSettled(E2.page); await L.sleep(800);
  const fc = await L.status(E2.page);
  chk('COPY-STATUS', 'c-two-failed', !!second && fc === '2 sounds in the demo collection failed to load — details are in the library.', { second, fc });
  await shot(E2.page, 'status-two-failed');
  await E2.ctx.close();
  await b.close();
  out.net = net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise }));
  const px = net.every((n) => n.errors.length === 0 && n.hydration.length === 0 && n.forbidden.length === 0 && n.authHeaders.length === 0);
  chk('PX-NET/REG-HYD', 'all-contexts', px, out.net);
  out.endedUtc = new Date().toISOString();
  save();
})().catch((e) => { console.error(e); out.fatal = String(e.stack || e); save(); process.exit(1); });
