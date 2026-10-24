// B round 144 -> 145: library column baseline at 9a67abd (pre V-0.5a). node libbase.cjs <1440|1280>
const L = require('./lib.cjs');
const fs = require('fs');
const path = require('path');
const W = +process.argv[2] || 1440;
const VP = W === 1440 ? { width: 1440, height: 900 } : { width: 1280, height: 720 };
const net = [];
const out = { vp: W, head: process.env.HEAD_SHA || '', startedUtc: new Date().toISOString(), states: {} };
const box = (r) => [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 2) / 2);
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
const save = () => fs.writeFileSync(path.join(L.OUT, `libbase-${W}.json`), JSON.stringify({ ...out, net }, null, 1));
(async () => {
  const b = await L.launch();
  const O = await L.openStudio(b, VP, `libbase-${W}-ready`, net);
  await L.setSnapOff(O.page);
  out.states.ready = await measure(O.page);
  await O.page.screenshot({ path: path.join(L.SHOTS, `libbase-ready-${W}.png`) });
  // previewing: select soft impact and press the preview play button
  await O.page.click('[role=option][data-source-id=demo-soft-impact]');
  await L.sleep(300);
  const play = O.page.locator('button', { hasText: 'მოუსმინე' }).first();
  await play.click(); await L.sleep(400);
  out.states.previewing = await measure(O.page);
  await O.page.screenshot({ path: path.join(L.SHOTS, `libbase-previewing-${W}.png`) });
  await play.click().catch(() => {});
  save(); await O.ctx.close();
  // error: abort the Middle East preview request
  const O2 = await L.openCtx(b, VP, `libbase-${W}-error`, net);
  await O2.page.route('**/middle-east.mp3', (r) => r.abort());
  await O2.page.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await O2.page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  for (let i = 0; i < 200; i++) { const n = await O2.page.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].filter((x) => /იტვირთება…/.test(x.textContent)).length); if (n === 0) break; await L.sleep(250); }
  await L.sleep(800);
  await O2.page.evaluate(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Decline'); if (x) x.click(); });
  await L.setSnapOff(O2.page);
  out.states.error = await measure(O2.page);
  await O2.page.screenshot({ path: path.join(L.SHOTS, `libbase-error-${W}.png`) });
  save(); await O2.ctx.close();
  await b.close();
  console.log(JSON.stringify({ ready: Object.keys(out.states.ready.nodes).length, err: out.states.error.nodes['opt:demo-middle-east:meta1'], prev: out.states.previewing.nodes['opt:demo-soft-impact:meta2'], status: out.states.error.status, net: net.map((n) => [n.label, n.errors.length, n.forbidden.length, n.hydration.length]) }, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
