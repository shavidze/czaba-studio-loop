// C round 207 independent probe (SABA-B-6). usage: node c207.cjs <1440|1280>
// Evidence: getComputedStyle(elementFromPoint(x,y)).cursor at the real pointer position.
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');
const W = +process.argv[2] || 1440;
const VP = W === 1280 ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const ROOT = path.join(__dirname, '..');
const MEDIA = '/home/runner/czaba-project/tmp/studio-real-loop/media/beeps-6s-h264-aac.mp4';
const BASE = 'http://127.0.0.1:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FORBIDDEN = /studio-token|\/api\/download|r2\.dev|shopify|identitytoolkit|securetoken/i;
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|net::ERR|5199|DevTools/i;

const res = { W, rows: {}, fails: [], net: { forbidden: [], auth: [], errors: [], noise: 0 } };
const fail = (row, msg) => { res.fails.push(`${row}: ${msg}`); };

const PLUS = ['crosshair', 'move', 'cell', 'copy', 'all-scroll'];
const scan = (p) => p.evaluate(() => {
  const found = {};
  const desc = (el) => { let e = el; const parts = []; for (let i = 0; e && i < 6; i += 1, e = e.parentElement) { const t = e.getAttribute && e.getAttribute('data-testid'); if (t) { parts.push(t); break; } parts.push(e.tagName.toLowerCase()); } return parts.join('<'); };
  for (let y = 0; y < innerHeight; y += 6) for (let x = 0; x < innerWidth; x += 6) {
    const el = document.elementFromPoint(x, y); if (!el) continue;
    const c = getComputedStyle(el).cursor; const k = `${c} | ${desc(el)}`;
    if (!found[k]) found[k] = { cursor: c, el: desc(el), n: 0, at: [x, y] }; found[k].n += 1;
  }
  return Object.values(found).sort((a, b) => b.n - a.n);
});
const cur = (p, x, y) => p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? { c: getComputedStyle(e).cursor, t: e.getAttribute('data-testid') || e.tagName.toLowerCase(), pt: (e.closest('[data-testid]') || {}).dataset?.testid || null } : null; }, [x, y]);
const status = (p) => p.evaluate(() => ((document.querySelector('[data-testid=arrangement-status]') || {}).textContent || '').trim());
const blur = (p) => p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
const box = (p, sel) => p.locator(sel).first().boundingBox();

async function seek(p, t) {
  await blur(p);
  const g = await p.evaluate(() => ({ rl: document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON(), pps: +/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1] }));
  if (t === 0) { await p.keyboard.press('Home'); await sleep(250); return; }
  await p.mouse.click(g.rl.left + t * g.pps, g.rl.top + g.rl.height / 2); await sleep(300); await blur(p);
}
async function add(p, src, lane, t) {
  await p.click(`[data-track-id="${lane}"] [data-testid=arrangement-track-header] button[aria-label*="— set as the active track"]`); await sleep(200);
  await seek(p, t);
  const o = p.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded(); await o.focus(); await sleep(150);
  await p.keyboard.press('Enter'); await sleep(800);
  const s = await status(p); await blur(p); return s;
}

(async () => {
  const b = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: VP });
  const p = await ctx.newPage();
  p.on('request', (q) => { if (FORBIDDEN.test(q.url())) res.net.forbidden.push(q.url()); if (q.headers().authorization) res.net.auth.push(q.url()); });
  p.on('console', (m) => { if (m.type() === 'error') { if (NOISE.test(m.text())) res.net.noise += 1; else res.net.errors.push(m.text().slice(0, 200)); } });
  p.on('pageerror', (e) => res.net.errors.push('pageerror ' + String(e).slice(0, 200)));
  await p.goto(`${BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  for (let i = 0; i < 200; i += 1) { const n = await p.evaluate(() => { const o = [...document.querySelectorAll('[role=option][data-source-id]')]; return o.length ? o.filter((x) => /იტვირთება…|Loading…/.test(x.textContent)).length : -1; }); if (n === 0) break; await sleep(300); }
  await sleep(800);
  res.anonymous = await p.evaluate(() => ({ url: location.pathname, signIn: /Sign in required/i.test(document.body.innerText), demoOptions: document.querySelectorAll('[role=option][data-source-id^=demo-]').length, authUser: localStorage.getItem('auth_user') }));
  // Snap off
  await blur(p);
  if ((await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap)) === 'on') { await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(200); }
  res.snap = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
  res.adds = [await add(p, 'demo-middle-east', 'music', 0), await add(p, 'demo-slow-rise', 'sfx', 3), await add(p, 'demo-stem-pulse', 'stems', 5)];
  await p.locator('[data-testid=arrangement-video-input]').first().setInputFiles(MEDIA);
  await p.waitForFunction(() => document.querySelectorAll('[data-clip-kind=video]').length > 0, null, { timeout: 30000 });
  await sleep(2500);
  const clip = async (lane) => p.evaluate((lane) => document.querySelector(`[data-track-id=${lane}] [data-clip-kind=audio]`).dataset.clipId, lane);
  const ids = { music: await clip('music'), sfx: await clip('sfx'), stems: await clip('stems') };
  res.ids = ids;
  await p.mouse.move(2, 2); await sleep(300);

  // ---- CUR-UNCHANGED (Env off) ----
  const U = { scanA: await scan(p) };
  await p.screenshot({ path: path.join(ROOT, 'shots', `c207-${W}-a-envoff.png`) });
  const mb = await box(p, `[data-clip-id="${ids.music}"]`);
  const header = await p.locator(`[data-clip-id="${ids.music}"] > div`).first().boundingBox();
  const mvis = Math.min(mb.width, VP.width - mb.x - 20);
  U.waveform = await cur(p, mb.x + mvis * 0.5, mb.y + mb.height * 0.65);
  U.titleRest = await cur(p, header.x + 60, header.y + header.height / 2);
  U.clipEdgeLeft = await cur(p, mb.x + 1, mb.y + mb.height * 0.65);
  for (const t of ['arrangement-clip-fade-in-handle', 'arrangement-clip-fade-out-handle', 'arrangement-playhead-handle', 'arrangement-overview', 'arrangement-track-height', 'arrangement-detail-separator']) {
    const all = await p.locator(`[data-testid=${t}]`).evaluateAll((els, vw) => els.map((e) => e.getBoundingClientRect().toJSON()).filter((r) => r.width > 0 && r.height > 0 && r.x + r.width / 2 < vw && r.x + r.width / 2 > 0), VP.width);
    U[t] = all.length ? { box: all[0], ...(await cur(p, all[0].x + all[0].width / 2, all[0].y + all[0].height / 2)) } : 'absent-or-offscreen';
  }
  // title bar drag on sfx clip: read during drag then Undo
  const sb = await p.locator(`[data-clip-id="${ids.sfx}"] > div`).first().boundingBox();
  const sfxStart0 = await p.evaluate((id) => document.querySelector(`[data-clip-id="${id}"]`).getAttribute('data-clip-start'), ids.sfx);
  await p.mouse.move(sb.x + 30, sb.y + sb.height / 2); await p.mouse.down();
  await p.mouse.move(sb.x + 45, sb.y + sb.height / 2, { steps: 3 });
  U.titleDrag = await cur(p, sb.x + 45, sb.y + sb.height / 2);
  U.titleDragBody = await p.evaluate(() => ({ html: getComputedStyle(document.documentElement).cursor, body: getComputedStyle(document.body).cursor }));
  await p.mouse.up(); await sleep(300);
  U.sfxMoved = [sfxStart0, await p.evaluate((id) => document.querySelector(`[data-clip-id="${id}"]`).getAttribute('data-clip-start'), ids.sfx)];
  await blur(p); await p.keyboard.press('Control+z'); await sleep(400);
  U.sfxAfterUndo = await p.evaluate((id) => document.querySelector(`[data-clip-id="${id}"]`).getAttribute('data-clip-start'), ids.sfx);
  res.rows['CUR-UNCHANGED-207'] = U;

  // ---- Env on, select music, mute stems ----
  await p.click('[data-testid=arrangement-envelope-toggle]'); await sleep(300); await blur(p);
  res.envPressed = await p.getAttribute('[data-testid=arrangement-envelope-toggle]', 'aria-pressed');
  const eb = async (id) => box(p, `[data-clip-id="${id}"] [data-testid=arrangement-clip-envelope-editor]`);
  // BEHAV: double-click adds a point (music)
  let e = await eb(ids.music);
  const nPts = (id) => p.locator(`[data-clip-id="${id}"] [data-testid=arrangement-clip-envelope-point]`).count();
  const B = {};
  B.ptsBefore = await nPts(ids.music);
  await p.mouse.dblclick(e.x + 200, e.y + e.height * 0.6); await sleep(500);
  B.ptsAfterAdd = await nPts(ids.music); B.addStatus = await status(p);
  // single click selects music
  B.selMusic = await p.evaluate((id) => document.querySelector(`[data-clip-id="${id}"]`).getAttribute('aria-selected') ?? document.querySelector(`[data-clip-id="${id}"]`).dataset.selected ?? null, ids.music);
  // mute stems
  await p.click('[data-track-id=stems] button[aria-label^="Mute"]'); await sleep(200); await blur(p);
  res.stemsMute = await p.getAttribute('[data-track-id=stems] button[aria-label^="Mute"]', 'aria-pressed');
  const selState = () => p.evaluate((ids) => Object.fromEntries(Object.entries(ids).map(([k, id]) => { const el = document.querySelector(`[data-clip-id="${id}"]`); return [k, { ariaSel: el.getAttribute('aria-selected'), ring: /ring-brand/.test(el.className), dsel: el.dataset.selected ?? null }]; })), ids);
  res.selectionAtEnvTest = await selState();

  // ---- CUR-ENV-207 ----
  const E = { points: {} };
  for (const [k, id] of Object.entries(ids)) {
    const bb = await eb(id); E.points[k] = [];
    if (!bb) { fail('CUR-ENV-207', `no editor on ${k}`); continue; }
    const visW = Math.min(bb.width, VP.width - bb.x - 20);
    for (const fx of [0.1, 0.5, 0.9]) for (const fy of [0.25, 0.75]) {
      const x = bb.x + visW * fx, y = bb.y + bb.height * fy;
      await p.mouse.move(x, y); await sleep(60);
      const c = await cur(p, x, y); E.points[k].push({ fx, fy, x: Math.round(x), y: Math.round(y), ...c });
      if (!c || c.c !== 'pointer') fail('CUR-ENV-207', `${k} @${fx},${fy} cursor ${c && c.c} on ${c && c.t}`);
    }
  }
  await p.mouse.move(2, 2); await sleep(200);
  E.scanB = await scan(p);
  E.plusHits = E.scanB.filter((x) => PLUS.includes(x.cursor));
  if (E.plusHits.length) fail('CUR-ENV-207', `plus cursors ${JSON.stringify(E.plusHits)}`);
  await p.screenshot({ path: path.join(ROOT, 'shots', `c207-${W}-b-envon.png`) });
  res.rows['CUR-ENV-207'] = E;

  // ---- CUR-POINT-207 ----
  const P = {};
  const ptLoc = p.locator(`[data-clip-id="${ids.music}"] [data-testid=arrangement-clip-envelope-point]`);
  P.count = await ptLoc.count();
  // choose the added point: the one whose data-time is not 0
  const pts = await ptLoc.evaluateAll((els) => els.map((e, i) => ({ i, time: e.dataset.time, gain: e.dataset.gain, r: e.getBoundingClientRect().toJSON() })));
  P.pts = pts;
  const tgt = pts.find((q) => q.r.x > 0 && q.r.x < innerWidthGuess()) || pts[0];
  function innerWidthGuess() { return VP.width - 10; }
  const cx = tgt.r.x + tgt.r.width / 2, cy = tgt.r.y + tgt.r.height / 2;
  await p.mouse.move(cx, cy); await sleep(200);
  P.rest = await cur(p, cx, cy);
  P.gain0 = await ptLoc.nth(tgt.i).getAttribute('data-gain');
  P.status0 = await status(p);
  await p.mouse.down(); await sleep(80);
  P.press = await cur(p, cx, cy);
  P.steps = [];
  for (let s = 1; s <= 5; s += 1) { await p.mouse.move(cx, cy + 4 * s); await sleep(80); P.steps.push(await cur(p, cx, cy + 4 * s)); }
  await p.mouse.up(); await sleep(300);
  P.after = await cur(p, cx, cy + 20);
  P.gain1 = await ptLoc.nth(tgt.i).getAttribute('data-gain');
  P.status1 = await status(p);
  for (const [k, v] of [['rest', P.rest], ['press', P.press], ...P.steps.map((s, i) => [`step${i + 1}`, s]), ['after', P.after]]) if (!v || v.c !== 'pointer') fail('CUR-POINT-207', `${k} cursor ${v && v.c} on ${v && v.t}`);
  if (P.gain0 === P.gain1) fail('CUR-POINT-207', 'gain did not change');
  if (P.status0 === P.status1) fail('CUR-POINT-207', 'status not updated');
  res.rows['CUR-POINT-207'] = P;

  // BEHAV: double-click the point deletes it
  await sleep(800);
  const pr = await ptLoc.nth(tgt.i).boundingBox();
  const n0 = await nPts(ids.music);
  await p.mouse.dblclick(pr.x + pr.width / 2, pr.y + pr.height / 2); await sleep(500);
  B.ptsBeforeDel = n0; B.ptsAfterDel = await nPts(ids.music); B.delStatus = await status(p);
  // Ctrl-click body toggles selection of the sfx clip (adds), Ctrl-click again removes
  const sbb = await eb(ids.sfx);
  const sel0 = await selState();
  await p.keyboard.down('Control'); await p.mouse.click(sbb.x + 20, sbb.y + sbb.height * 0.5); await p.keyboard.up('Control'); await sleep(300);
  const sel1 = await selState();
  await p.keyboard.down('Control'); await p.mouse.click(sbb.x + 20, sbb.y + sbb.height * 0.5); await p.keyboard.up('Control'); await sleep(300);
  const sel2 = await selState();
  B.ctrl = { sel0, sel1, sel2 };
  res.rows['BEHAV-207'] = B;

  // ---- CUR-VIDEO-207 ----
  const V = {};
  await blur(p);
  const vbox0c = await box(p, '[data-testid=arrangement-video-box]');
  V.compactBefore = await cur(p, vbox0c.x + vbox0c.width / 2, vbox0c.y + vbox0c.height / 2);
  await p.click('[data-testid=arrangement-video-expand]'); await sleep(800);
  V.floating = await p.getAttribute('[data-testid=arrangement-video-box]', 'data-video-floating');
  await p.mouse.move(2, 2); await sleep(200);
  V.scanC = (await scan(p)).filter((x) => PLUS.includes(x.cursor) || /video/.test(x.el));
  V.plusHits = V.scanC.filter((x) => PLUS.includes(x.cursor));
  if (V.plusHits.length) fail('CUR-VIDEO-207', `plus cursors ${JSON.stringify(V.plusHits)}`);
  await p.screenshot({ path: path.join(ROOT, 'shots', `c207-${W}-c-floating.png`) });
  const vb = await box(p, '[data-testid=arrangement-video-box]');
  V.box0 = vb;
  const vx = vb.x + vb.width / 2, vy = vb.y + vb.height / 2;
  await p.mouse.move(vx, vy); await sleep(150);
  V.rest = await cur(p, vx, vy);
  await p.mouse.down(); await sleep(80);
  V.press = await cur(p, vx, vy);
  V.steps = [];
  for (let s = 1; s <= 4; s += 1) { await p.mouse.move(vx + 10 * s, vy + 2 * s); await sleep(80); V.steps.push(await cur(p, vx + 10 * s, vy + 2 * s)); }
  await p.mouse.up(); await sleep(250);
  V.after = await cur(p, vx + 40, vy + 8);
  V.box1 = await box(p, '[data-testid=arrangement-video-box]');
  V.moved = [Math.round(V.box1.x - vb.x), Math.round(V.box1.y - vb.y)];
  if (!V.rest || V.rest.c !== 'grab') fail('CUR-VIDEO-207', `rest ${V.rest && V.rest.c}`);
  if (!V.press || V.press.c !== 'grabbing') fail('CUR-VIDEO-207', `press ${V.press && V.press.c}`);
  V.steps.forEach((s, i) => { if (!s || s.c !== 'grabbing') fail('CUR-VIDEO-207', `step${i + 1} ${s && s.c}`); });
  if (!V.after || V.after.c !== 'grab') fail('CUR-VIDEO-207', `after ${V.after && V.after.c}`);
  if (Math.abs(V.moved[0] - 40) > 2 || Math.abs(V.moved[1] - 8) > 2) fail('CUR-VIDEO-207', `moved ${V.moved}`);
  // handle cursor (A-R207-01)
  const hb = await box(p, '[data-testid=arrangement-video-drag]');
  V.handle = await cur(p, hb.x + hb.width / 2, hb.y + hb.height / 2);
  V.handleOwn = await p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-video-drag]'); return { cls: e.className, cursor: getComputedStyle(e).cursor }; });
  // BEHAV: arrow keys on handle move 16 px
  await p.focus('[data-testid=arrangement-video-drag]');
  const k0 = await box(p, '[data-testid=arrangement-video-box]');
  await p.keyboard.press('ArrowRight'); await sleep(200);
  const k1 = await box(p, '[data-testid=arrangement-video-box]');
  await p.keyboard.press('ArrowDown'); await sleep(200);
  const k2 = await box(p, '[data-testid=arrangement-video-box]');
  B.arrow = { right: Math.round(k1.x - k0.x), downY: Math.round(k2.y - k1.y) };
  // Esc returns the video
  await p.keyboard.press('Escape'); await sleep(500);
  B.escFloating = await p.getAttribute('[data-testid=arrangement-video-box]', 'data-video-floating');
  B.escExpanded = await p.getAttribute('[data-testid=arrangement-video-box]', 'data-video-expanded');
  await p.mouse.move(2, 2); await sleep(200);
  const cb = await box(p, '[data-testid=arrangement-video-box]');
  V.compactAfter = await cur(p, cb.x + cb.width / 2, cb.y + cb.height / 2);
  V.compactAfterBoxOwn = await p.evaluate(() => getComputedStyle(document.querySelector('[data-testid=arrangement-video-box]')).cursor);
  for (const c of [V.compactBefore, V.compactAfter]) if (c && ['grab', 'grabbing', 'move'].includes(c.c)) fail('CUR-VIDEO-207', `compact cursor ${c.c}`);
  await p.screenshot({ path: path.join(ROOT, 'shots', `c207-${W}-d-compact.png`) });
  res.rows['CUR-VIDEO-207'] = V;
  if (B.ptsAfterAdd !== B.ptsBefore + 1) fail('BEHAV-207', `add ${B.ptsBefore}->${B.ptsAfterAdd}`);
  if (B.ptsAfterDel !== B.ptsBeforeDel - 1) fail('BEHAV-207', `delete ${B.ptsBeforeDel}->${B.ptsAfterDel}`);
  if (B.arrow.right !== 16 || B.arrow.downY !== 16) fail('BEHAV-207', `arrow ${JSON.stringify(B.arrow)}`);
  if (B.escFloating !== 'false') fail('BEHAV-207', `esc floating ${B.escFloating}`);
  await ctx.close(); await b.close();
  fs.writeFileSync(path.join(ROOT, 'out', `c207-${W}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ W, fails: res.fails, net: { f: res.net.forbidden.length, a: res.net.auth.length, e: res.net.errors, noise: res.net.noise } }, null, 1));
})().catch((e) => { console.error('FAIL', e); fs.writeFileSync(path.join(ROOT, 'out', `c207-${W}-error.json`), JSON.stringify({ err: String(e.stack), res }, null, 1)); process.exit(1); });
