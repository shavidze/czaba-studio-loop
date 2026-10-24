// C round 145 — V-0.5a browser rows. node c145.cjs <1440|1280>
// LAYOUT-LIB states reproduce b-round-144/tools/libbase.cjs exactly (same measure fn); then LIB-ROW-TEXT, LIB-LABELS, LIB-SEARCH.
const L = require('./lib.cjs');
const fs = require('fs');
const path = require('path');
const W = +process.argv[2] || 1440;
const VP = W === 1440 ? { width: 1440, height: 900 } : { width: 1280, height: 720 };
const net = [];
const out = { vp: W, startedUtc: new Date().toISOString(), states: {}, rest: {}, checks: [], rows: {}, invalidRuns: [] };
const file = path.join(L.OUT, `c145-${W}.json`);
const save = () => fs.writeFileSync(file, JSON.stringify({ ...out, net }, null, 1));
const chk = (row, id, ok, v) => { out.checks.push({ row, id, ok: !!ok, v }); console.log(ok ? 'ok  ' : 'FAIL', row, id, JSON.stringify(v).slice(0, 200)); save(); };
const GEO = /[Ⴀ-ჿ]/;

const measure = (p) => p.evaluate(() => {
  const b = (el) => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 2) / 2); };
  const lines = (el) => { const r = document.createRange(); r.selectNodeContents(el); const ys = new Set([...r.getClientRects()].map((x) => Math.round(x.top))); return ys.size; };
  const lib = document.querySelector('[data-testid=arrangement-library]');
  const q = (s) => [...lib.querySelectorAll(s)];
  const nodes = {};
  const put = (k, el) => { if (el && el.getClientRects().length) nodes[k] = { box: b(el), lines: lines(el), text: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 160) }; };
  put('library', lib);
  for (const t of ['arrangement-library-search', 'arrangement-library-filter', 'arrangement-library-notice', 'arrangement-library-tree', 'arrangement-library-list', 'arrangement-library-empty']) put(t, lib.querySelector(`[data-testid=${t}]`));
  const nav = lib.querySelector('[data-testid=arrangement-library-tree]');
  if (nav) {
    put('tree-all', nav.querySelector(':scope > button'));
    [...nav.querySelectorAll(':scope > div')].forEach((col, i) => {
      put(`tree-col${i}-toggle`, col.querySelector('button[aria-expanded]'));
      put(`tree-col${i}-label`, col.querySelector('button[title]'));
      [...col.querySelectorAll('[data-testid=arrangement-library-folder]')].forEach((f, j) => put(`tree-col${i}-folder${j}`, f));
    });
  }
  for (const o of q('[role=option][data-source-id]')) {
    const id = o.dataset.sourceId; put(`opt:${id}`, o);
    const meta = [...o.querySelectorAll(':scope > span')].pop();
    if (meta) { put(`opt:${id}:meta`, meta); [...meta.querySelectorAll(':scope > span')].forEach((s, k) => put(`opt:${id}:meta${k}`, s)); }
    put(`opt:${id}:context`, o.querySelector('[data-testid=arrangement-library-option-context]'));
  }
  const prev = document.querySelector('[aria-label="პრევიუ"]') || null; if (prev) put('preview', prev);
  const st = document.querySelector('[data-testid=arrangement-status]');
  return { nodes, status: st ? st.textContent.trim() : null, scrollH: nav ? [nav.scrollHeight, nav.clientHeight] : null };
});

// Outside the library column: every data-testid element (first 400) not inside the library, plus track rows.
const measureRest = (p) => p.evaluate(() => {
  const lib = document.querySelector('[data-testid=arrangement-library]');
  const b = (el) => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 2) / 2); };
  const res = {}; const seen = {};
  for (const el of document.querySelectorAll('[data-testid],[data-track-id],button[aria-label]')) {
    if (lib && lib.contains(el)) continue;
    if (!el.getClientRects().length) continue;
    const base = el.dataset.testid || (el.dataset.trackId ? `track:${el.dataset.trackId}` : `btn:${el.getAttribute('aria-label').slice(0, 40)}`);
    const n = (seen[base] = (seen[base] || 0) + 1);
    res[n > 1 ? `${base}#${n}` : base] = b(el);
  }
  return res;
});

const rowMeta = (p, id) => p.evaluate((sid) => {
  const o = document.querySelector(`[role=option][data-source-id="${sid}"]`);
  if (!o) return null;
  const meta = [...o.querySelectorAll(':scope > span')].pop();
  return { meta: meta ? [...meta.querySelectorAll(':scope > span')].map((s) => s.textContent) : null, metaText: meta ? meta.textContent : null };
}, id);
const allMeta = (p) => p.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].map((o) => { const m = [...o.querySelectorAll(':scope > span')].pop(); return [o.dataset.sourceId, m ? m.textContent : null]; }));
const visibleIds = (p) => p.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].filter((o) => o.getClientRects().length).map((o) => o.dataset.sourceId));

async function waitLoaded(page) {
  for (let i = 0; i < 240; i++) {
    const n = await page.evaluate(() => { const o = [...document.querySelectorAll('[role=option][data-source-id]')]; return o.length === 0 ? -1 : o.filter((x) => /Loading…|იტვირთება…/.test(x.textContent)).length; });
    if (n === 0) return true;
    await L.sleep(250);
  }
  return false;
}
async function openRouted(b, label, handler) {
  const O = await L.openCtx(b, VP, label, net);
  await O.page.route('**/middle-east.mp3', handler);
  await O.page.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await O.page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  return O;
}
const decline = (p) => p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Decline'); if (x) x.click(); });

async function enterOn(p, lane, sid) {
  await p.click(L.nameSel(lane)); await L.sleep(200);
  await L.blur(p);
  const o = p.locator(`[role=option][data-source-id="${sid}"]`);
  await o.scrollIntoViewIfNeeded(); await o.focus(); await L.sleep(150);
  const before = (await L.clipsDom(p)).length;
  await p.keyboard.press('Enter'); await L.sleep(800);
  const s = await L.status(p);
  const after = (await L.clipsDom(p)).length;
  await L.blur(p);
  return { status: s, before, after };
}

(async () => {
  const b = await L.launch();
  // ---------- Context A: ready -> previewing (libbase sequence), then search / add ----------
  let O = await L.openStudio(b, VP, `c145-${W}-ready`, net);
  out.snapAtStart = await O.page.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
  out.snapAfter = await L.setSnapOff(O.page);
  const p = O.page;
  out.states.ready = await measure(p); out.rest.ready = await measureRest(p);
  await p.screenshot({ path: path.join(L.SHOTS, `ready-${W}.png`) });
  out.bodyHasDM1 = await p.evaluate(() => document.body.innerText.includes('Demo collection · CZABA public previews'));
  out.readyMeta = await allMeta(p);
  chk('LIB-ROW-TEXT', 'ready-no-georgian-meta', out.readyMeta.every(([, m]) => m && !GEO.test(m)), out.readyMeta);
  // labels / notice
  const N = out.states.ready.nodes;
  chk('LIB-LABELS', 'tree-col-labels', [N['tree-col0-label']?.text, N['tree-col1-label']?.text].join('|') === 'CZABA public previews + synthetic SFX|Synthetic demo · ღამის პულსი', [N['tree-col0-label']?.text, N['tree-col1-label']?.text]);
  chk('LIB-LABELS', 'notice', N['arrangement-library-notice']?.text === 'The stems are a synthetic demo — not CZABA catalogue stems and not parts extracted from a mix.', N['arrangement-library-notice']?.text);
  out.treeTexts = Object.entries(N).filter(([k]) => k.startsWith('tree-')).map(([k, v]) => [k, v.text]);
  out.titleAttrs = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-library-tree] button[title]')].map((x) => [x.getAttribute('title'), x.getAttribute('aria-label')]));
  // previewing
  await p.click('[role=option][data-source-id=demo-soft-impact]');
  await L.sleep(300);
  const play = p.locator('button', { hasText: 'მოუსმინე' }).first();
  const cbs0 = await p.evaluate(() => window.__h.cbs);
  const pv = [];
  await play.click();
  const tPlay = Date.now();
  for (let i = 0; i < 8; i++) { pv.push(await p.evaluate(() => ({ t: performance.now(), now: Number(document.querySelector('[data-testid=arrangement-library-preview-wave]').getAttribute('aria-valuenow')), txt: (document.querySelector('[data-testid=arrangement-library-playhead]') || {}).textContent }))); if (i === 1) { out.states.previewing = await measure(p); out.rest.previewing = await measureRest(p); await p.screenshot({ path: path.join(L.SHOTS, `previewing-${W}.png`) }); } await L.sleep(200); }
  out.previewSamples = pv; out.previewCbs = (await p.evaluate(() => window.__h.cbs)) - cbs0;
  out.previewAudio = await p.evaluate(() => window.__h.ctxs.map((c) => ({ state: c.state, t: c.currentTime, sr: c.sampleRate })));
  const pm = out.states.previewing.nodes['opt:demo-soft-impact:meta2'];
  chk('LIB-ROW-TEXT', 'e-playing-span', pm && pm.text === '▶ Playing', pm);
  const adv = pv.find((s) => s.now > pv[0].now || (s.txt !== pv[0].txt));
  chk('LIB-ROW-TEXT', 'e-preview-advances-1.5s', adv && adv.t - pv[0].t <= 1500 && out.previewCbs >= 1, { first: pv[0], adv, cbs: out.previewCbs, ms: Date.now() - tPlay });
  const playingNow = await p.locator('button', { hasText: 'შეჩერება' }).count();
  if (playingNow) await p.locator('button', { hasText: 'შეჩერება' }).first().click(); else await play.click();
  await L.sleep(400);
  const afterStop = await rowMeta(p, 'demo-soft-impact');
  chk('LIB-ROW-TEXT', 'e-playing-gone', afterStop && !afterStop.metaText.includes('▶ Playing'), { afterStop, wasPlayingAtStop: playingNow });
  save();
  // LIB-SEARCH (after layout capture)
  const search = p.locator('[data-testid=arrangement-library-search]');
  out.search = {};
  for (const q of ['stems', 'Stems', 'STEMS', 'stem', 'music', 'sfx', 'soft sfx', 'მუსიკა', '']) {
    await search.fill(q); await L.sleep(350);
    out.search[q || '(empty)'] = { ids: await visibleIds(p), empty: await p.locator('[data-testid=arrangement-library-empty]').count() };
  }
  console.log(JSON.stringify(out.search));
  const S = out.search; const stems = S.stems.ids;
  const eq = (a, bb) => JSON.stringify([...a].sort()) === JSON.stringify([...bb].sort());
  chk('LIB-SEARCH', 'stems-4', stems.length === 4 && stems.every((x) => /stem/.test(x)) && eq(S.Stems.ids, stems) && eq(S.STEMS.ids, stems) && eq(S.stem.ids, stems), { stems, Stems: S.Stems.ids, stem: S.stem.ids });
  chk('LIB-SEARCH', 'music', eq(S.music.ids, ['demo-middle-east', 'demo-hero-music', 'demo-synth-mix']), S.music.ids);
  chk('LIB-SEARCH', 'sfx', eq(S.sfx.ids, ['demo-middle-east', 'demo-hero-music', 'demo-soft-impact', 'demo-slow-rise']), S.sfx.ids);
  chk('LIB-SEARCH', 'soft-sfx-AND', eq(S['soft sfx'].ids, ['demo-soft-impact']), S['soft sfx'].ids);
  chk('LIB-SEARCH', 'georgian-none', S['მუსიკა'].ids.length === 0 && S['მუსიკა'].empty === 1, S['მუსიკა']);
  chk('LIB-SEARCH', 'empty-9', S['(empty)'].ids.length === 9, S['(empty)'].ids);
  await search.fill('stems'); await L.sleep(350);
  const bass = (await visibleIds(p)).find((x) => /bass/i.test(x));
  const addRes = await enterOn(p, 'stems', bass);
  out.searchAdd = { bass, ...addRes };
  chk('LIB-SEARCH', 'enter-adds-bass-english', bass && addRes.after === addRes.before + 1 && /^“.+” added to the .+ track at /.test(addRes.status) && !GEO.test(addRes.status.replace(/“[^”]*”/, '')), out.searchAdd);
  await p.screenshot({ path: path.join(L.SHOTS, `search-add-${W}.png`) });
  await O.ctx.close(); save();

  // ---------- Context B: error (abort) — libbase sequence ----------
  O = await openRouted(b, `c145-${W}-error`, (r) => r.abort());
  out.rows.errorLoaded = await waitLoaded(O.page);
  await L.sleep(800); await decline(O.page); await L.setSnapOff(O.page);
  out.states.error = await measure(O.page); out.rest.error = await measureRest(O.page);
  await O.page.screenshot({ path: path.join(L.SHOTS, `error-${W}.png`) });
  const em = await rowMeta(O.page, 'demo-middle-east');
  chk('LIB-ROW-TEXT', 'b-abort-meta', em && em.meta[0] === 'Music' && em.meta[1] === 'Error: File failed to load (network)', em);
  out.errorAllMeta = await allMeta(O.page);
  chk('LIB-ROW-TEXT', 'b-no-georgian-meta', out.errorAllMeta.every(([, m]) => m && !GEO.test(m)), out.errorAllMeta);
  const fr = await enterOn(O.page, 'music', 'demo-middle-east');
  out.rows.abortEnter = fr;
  chk('LIB-ROW-TEXT', 'b-enter-sourceFailed', /^“.+” failed to load — details are in the library\.$/.test(fr.status) && fr.after === fr.before, fr);
  await O.page.screenshot({ path: path.join(L.SHOTS, `error-enter-${W}.png`) });
  await O.ctx.close(); save();

  // ---------- Context C: delayed (~3 s) ----------
  O = await openRouted(b, `c145-${W}-delay`, async (r) => { await L.sleep(3000); await r.continue().catch(() => {}); });
  const dl = [];
  for (let i = 0; i < 40; i++) { const m = await rowMeta(O.page, 'demo-middle-east'); dl.push({ t: i * 250, m: m && m.meta }); if (m && m.meta && m.meta[1] && /^\d/.test(m.meta[1]) && i > 0) break; await L.sleep(250); }
  out.rows.delay = dl;
  const loadingSeen = dl.filter((x) => x.m && x.m[1] === 'Loading…');
  const final = dl[dl.length - 1].m;
  chk('LIB-ROW-TEXT', 'a-loading-then-duration', loadingSeen.length >= 4 && final && /^\d+:\d\d/.test(final[1]), { loadingSamples: loadingSeen.length, final, other: dl.filter((x) => x.m && x.m[1] !== 'Loading…' && !/^\d/.test(x.m[1] || '')).map((x) => x.m) });
  await O.page.screenshot({ path: path.join(L.SHOTS, `delay-final-${W}.png`) });
  await O.ctx.close(); save();

  // ---------- Context D: 404 ----------
  O = await openRouted(b, `c145-${W}-404`, (r) => r.fulfill({ status: 404, body: 'nope' }));
  await waitLoaded(O.page);
  const m404 = await rowMeta(O.page, 'demo-middle-east');
  chk('LIB-ROW-TEXT', 'c-404', m404 && m404.meta[1] === 'Error: File failed to load (404)', m404);
  await O.ctx.close(); save();

  // ---------- Context E: 200 + 64 random bytes ----------
  const junk = Buffer.from(Array.from({ length: 64 }, (_, i) => (i * 97 + 13) & 255));
  O = await openRouted(b, `c145-${W}-junk`, (r) => r.fulfill({ status: 200, contentType: 'audio/mpeg', body: junk }));
  await waitLoaded(O.page);
  const mj = await rowMeta(O.page, 'demo-middle-east');
  chk('LIB-ROW-TEXT', 'd-decode', mj && mj.meta[1] === 'Error: File could not be decoded', mj);
  await O.page.screenshot({ path: path.join(L.SHOTS, `decode-${W}.png`) });
  await O.ctx.close(); save();

  await b.close();
  out.endedUtc = new Date().toISOString(); save();
  console.log('net', JSON.stringify(net.map((n) => [n.label, n.errors.length, n.forbidden.length, n.authHeaders.length, n.hydration.length, n.noise])));
})().catch((e) => { out.fatal = String(e && e.stack || e); save(); console.error(e); process.exit(1); });
