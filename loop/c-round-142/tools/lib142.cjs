// C round 142 — LIBRARY-LABELS, REG-141, page-wide GEO scan. node lib142.cjs <1440|1280> <tag>
const L = require('./lib.cjs');
const fs = require('fs');
const path = require('path');
const W = +process.argv[2] || 1440;
const TAG = process.argv[3] || `r${Date.now()}`;
const VP = W === 1440 ? { width: 1440, height: 900 } : { width: 1280, height: 720 };
const OUTF = path.join(L.OUT, `lib142-${W}-${TAG}.json`);
const sleep = L.sleep;
const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/;
const net = [];
const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), rows: {}, fails: [], oks: 0 };
const save = () => fs.writeFileSync(OUTF, JSON.stringify({ ...res, net: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
function chk(row, id, got, exp) { const ok = got === exp; if (!ok) res.fails.push({ row, id, got, exp }); else res.oks++; console.log(row, id, ok ? 'OK ' : 'XX ', JSON.stringify(got), ok ? '' : ' expected ' + JSON.stringify(exp)); (res.rows[row] = res.rows[row] || []).push({ id, ok, got, exp }); save(); return ok; }
const tree = (p) => p.evaluate(() => {
  const nav = document.querySelector('[data-testid=arrangement-library-tree]');
  const out = [];
  for (const col of nav.querySelectorAll(':scope > div')) {
    const tg = col.querySelector('button[aria-expanded]');
    const name = col.querySelector('button[title]');
    out.push({ toggleAria: tg && tg.getAttribute('aria-label'), label: name && name.textContent.trim(), folders: [...col.querySelectorAll('[data-testid=arrangement-library-folder]')].map((f) => { const s = f.querySelectorAll('span'); return [s[0].textContent.trim(), +s[1].textContent.trim()]; }) });
  }
  const all = nav.querySelector('button'); return { all: all ? all.textContent.replace(/\s+/g, ' ').trim() : null, cols: out };
});
const opts = (p) => p.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].filter((e) => e.getClientRects().length).map((e) => { const meta = [...e.querySelectorAll(':scope > span')].pop(); const kind = meta ? meta.querySelector('span') : null; return { id: e.dataset.sourceId, kind: kind ? kind.textContent.trim() : null }; }));
async function search(p, q) {
  const s = p.locator('[data-testid=arrangement-library-search]');
  await s.fill(q); await sleep(500);
  const o = await opts(p);
  return { q, ids: o.map((x) => x.id), kinds: [...new Set(o.map((x) => x.kind))] };
}
(async () => {
  const b = await L.launch();
  // session 1: library
  const O = await L.openStudio(b, VP, `lib142-${W}-${TAG}`, net);
  const p = O.page;
  res.snap = await L.setSnapOff(p);
  const R = 'LIBRARY-LABELS';
  res.tree = await tree(p);
  console.log(JSON.stringify(res.tree));
  const folders = res.tree.cols.flatMap((c) => c.folders);
  chk(R, 'folders', JSON.stringify(folders), JSON.stringify([['Music', 2], ['SFX', 2], ['Music', 1], ['Stems', 4]]));
  res.optsAll = await opts(p);
  chk(R, 'kind-chip-set', JSON.stringify([...new Set(res.optsAll.map((o) => o.kind))].sort()), JSON.stringify(['Music', 'SFX', 'Stem']));
  chk(R, 'kinds-by-id', JSON.stringify(res.optsAll.map((o) => `${o.id}:${o.kind}`)), JSON.stringify(['demo-middle-east:Music', 'demo-hero-music:Music', 'demo-soft-impact:SFX', 'demo-slow-rise:SFX', 'demo-synth-mix:Music', 'demo-stem-pulse:Stem', 'demo-stem-bass:Stem', 'demo-stem-pad:Stem', 'demo-stem-lead:Stem']));
  res.shotTree = `c-round-142/shots/library-${W}-${TAG}.png`; await p.screenshot({ path: path.join(L.SHOTS, `library-${W}-${TAG}.png`) });
  const music = ['demo-middle-east', 'demo-hero-music', 'demo-synth-mix'];
  const stems = ['demo-stem-pulse', 'demo-stem-bass', 'demo-stem-pad', 'demo-stem-lead'];
  res.search = {};
  for (const q of ['music', 'MUSIC', 'stem', 'stems', 'Stems', 'მუსიკა', 'სტემი', 'sfx']) res.search[q] = await search(p, q);
  chk(R, 'search-music', JSON.stringify(res.search.music.ids), JSON.stringify(music));
  chk(R, 'search-MUSIC', JSON.stringify(res.search.MUSIC.ids), JSON.stringify(music));
  chk(R, 'search-stem', JSON.stringify(res.search.stem.ids), JSON.stringify(stems));
  chk(R, 'search-ka-music-none', JSON.stringify(res.search['მუსიკა'].ids), JSON.stringify([]));
  await p.screenshot({ path: path.join(L.SHOTS, `library-search-ka-${W}-${TAG}.png`) });
  res.search.cleared = await search(p, '');
  chk(R, 'search-cleared', res.search.cleared.ids.length, 9);
  // collapse a collection to read the toggle aria-label in both states
  const tg = p.locator('[data-testid=arrangement-library-tree] > div button[aria-expanded]').nth(1);
  res.toggleAriaOpen = await tg.getAttribute('aria-label'); await tg.click(); await sleep(300);
  res.toggleAriaClosed = await tg.getAttribute('aria-label'); await tg.click(); await sleep(300); await L.blur(p);
  // add with Enter on the Music track
  res.add = await L.addAt(p, 'demo-middle-east', 'music', 2);
  chk(R, 'add-enter-status', /^.+ added to the Music track at 00:02\.000/.test(res.add.status), true);
  res.addStatus = res.add.status;
  // GEO scan: whole page incl. library; classified later
  res.geoScan = await p.evaluate((src) => {
    const re = new RegExp(src);
    const hits = [];
    const wk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
    while ((n = wk.nextNode())) { const el = n.parentElement; if (!el || el.closest('script,style')) continue; if (re.test(n.textContent)) hits.push({ k: 'text', tid: (el.closest('[data-testid]') || {}).dataset?.testid || el.tagName, area: el.closest('[data-testid=arrangement-library]') ? 'library' : el.closest('[data-testid=arrangement-detail-panel]') ? 'detail' : el.closest('[data-testid=arrangement-video-dock]') ? 'dock' : 'other', v: n.textContent.trim().slice(0, 140) }); }
    for (const el of document.body.querySelectorAll('*')) for (const a of ['aria-label', 'title', 'placeholder', 'aria-valuetext', 'alt', 'aria-description']) { const v = el.getAttribute(a); if (v && re.test(v)) hits.push({ k: a, tid: el.dataset.testid || el.tagName, area: el.closest('[data-testid=arrangement-library]') ? 'library' : el.closest('[data-testid=arrangement-detail-panel]') ? 'detail' : el.closest('[data-testid=arrangement-video-dock]') ? 'dock' : 'other', v: v.slice(0, 140) }); }
    return { hits, title: document.title };
  }, KA.source);
  save();
  await O.ctx.close();
  // session 2: REG-141
  const O2 = await L.openStudio(b, VP, `reg141-${W}-${TAG}`, net);
  const p2 = O2.page; await L.setSnapOff(p2);
  await L.addAt(p2, 'demo-stem-pad', 'music', 0); await L.addAt(p2, 'demo-stem-bass', 'stems', 0);
  res.trackAria = await p2.locator(L.nameSel('music')).first().getAttribute('aria-label');
  chk('REG-141', 'track-aria', res.trackAria, 'Music — set as the active track');
  await p2.click(L.nameSel('music')); await sleep(250);
  await p2.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(300);
  await L.blur(p2); await p2.keyboard.press('Control+g'); await sleep(500);
  chk('REG-141', 'ctrl-g-status', await L.status(p2), 'Group “Group 1” created: Music, Stems.');
  await p2.screenshot({ path: path.join(L.SHOTS, `reg141-${W}-${TAG}.png`) });
  await O2.ctx.close();
  await b.close();
  res.endedUtc = new Date().toISOString(); save();
  console.log('fails', res.fails.length, 'oks', res.oks);
})().catch((e) => { console.error(e); res.fatal = String(e); save(); process.exit(1); });
