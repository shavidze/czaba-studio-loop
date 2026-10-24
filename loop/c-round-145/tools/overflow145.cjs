// LAYOUT-LIB (vi): overflow / clipping / scroll-to-last in ready, previewing and error states. node overflow145.cjs <W>
const L = require('./lib.cjs');
const path = require('path');
const W = +process.argv[2] || 1440;
const VP = W === 1440 ? { width: 1440, height: 900 } : { width: 1280, height: 720 };
const net = [];
const probe = (p) => p.evaluate(() => {
  const lib = document.querySelector('[data-testid=arrangement-library]');
  const over = [];
  for (const el of lib.querySelectorAll('*')) {
    if (!el.getClientRects().length) continue;
    const cs = getComputedStyle(el);
    const clipsX = el.scrollWidth > el.clientWidth + 1 && cs.overflowX !== 'visible';
    const clipsY = el.scrollHeight > el.clientHeight + 1 && cs.overflowY !== 'visible' && !['auto', 'scroll'].includes(cs.overflowY);
    if ((clipsX || clipsY) && el.children.length === 0) over.push({ tag: el.tagName, cls: el.className.slice(0, 60), text: el.textContent.trim().slice(0, 60), sw: el.scrollWidth, cw: el.clientWidth, sh: el.scrollHeight, ch: el.clientHeight, ox: cs.overflowX, to: cs.textOverflow });
  }
  const scrollers = ['arrangement-library-tree', 'arrangement-library-list'].map((t) => { const e = lib.querySelector(`[data-testid=${t}]`); return { t, sw: e.scrollWidth, cw: e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight }; });
  const doc = { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
  return { over, scrollers, doc };
});
const lastVisible = (p) => p.evaluate(() => {
  const out = {};
  for (const t of ['arrangement-library-tree', 'arrangement-library-list']) {
    const e = document.querySelector(`[data-testid=${t}]`);
    e.scrollTop = e.scrollHeight;
    const items = t.endsWith('list') ? [...e.querySelectorAll('[role=option]')] : [...e.querySelectorAll('button')];
    const last = items[items.length - 1]; const r = last.getBoundingClientRect(); const c = e.getBoundingClientRect();
    out[t] = { last: last.textContent.trim().slice(0, 40), inside: r.top >= c.top - 1 && r.bottom <= c.bottom + 1, r: [r.top, r.bottom], c: [c.top, c.bottom] };
    e.scrollTop = 0;
  }
  return out;
});
(async () => {
  const b = await L.launch();
  const res = { W };
  const O = await L.openStudio(b, VP, `ovf-${W}`, net);
  await L.setSnapOff(O.page);
  res.ready = await probe(O.page);
  await O.page.click('[role=option][data-source-id=demo-soft-impact]'); await L.sleep(300);
  await O.page.locator('button', { hasText: 'მოუსმინე' }).first().click(); await L.sleep(400);
  res.previewing = await probe(O.page);
  const row = O.page.locator('[role=option][data-source-id=demo-soft-impact]');
  await row.screenshot({ path: path.join(L.SHOTS, `row-playing-${W}.png`) });
  await O.page.locator('[data-testid=arrangement-library]').screenshot({ path: path.join(L.SHOTS, `lib-previewing-${W}.png`) });
  await O.page.locator('button', { hasText: 'შეჩერება' }).first().click().catch(() => {});
  await L.sleep(300);
  res.scrollLast = await lastVisible(O.page);
  await O.ctx.close();
  const O2 = await L.openCtx(b, VP, `ovf-${W}-err`, net);
  await O2.page.route('**/middle-east.mp3', (r) => r.abort());
  await O2.page.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await O2.page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  for (let i = 0; i < 200; i++) { const n = await O2.page.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].filter((x) => /Loading…|იტვირთება…/.test(x.textContent)).length); if (n === 0) break; await L.sleep(250); }
  await L.sleep(800);
  res.error = await probe(O2.page);
  await O2.page.locator('[role=option][data-source-id=demo-middle-east]').screenshot({ path: path.join(L.SHOTS, `row-error-${W}.png`) });
  await O2.page.locator('[data-testid=arrangement-library]').screenshot({ path: path.join(L.SHOTS, `lib-error-${W}.png`) });
  res.errorScrollLast = await lastVisible(O2.page);
  await O2.ctx.close(); await b.close();
  res.net = net.map((n) => [n.label, n.errors.length, n.forbidden.length, n.authHeaders.length, n.hydration.length]);
  L.save(L.OUT, `overflow145-${W}.json`, res);
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
