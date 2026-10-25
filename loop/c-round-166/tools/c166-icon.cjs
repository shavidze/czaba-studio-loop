// C round 166 — ICON-V3C3B + ICON-BOX. measure() copied unchanged from b-round-165/v3c3b-final.cjs; same state preparation.
// node c166-icon.cjs <1440|1280> <attempt>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'icon'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'icon'); fs.mkdirSync(SHD, { recursive: true });
const REF = JSON.parse(fs.readFileSync(path.join(L.ROOT, '..', 'b-round-165', 'out', 'v3c3b-final.json')));
const measure = () => {
  const all = [...document.querySelectorAll('button,a,[data-testid],[role]')];
  const occ = {}; const res = [];
  for (const e of all) {
    if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
    if (e.tagName.toLowerCase() === 'svg') continue;
    const txt = (e.textContent || '').replace(/[◀▶▸▾✓←]/gu, '').trim().replace(/\s+/g, ' ').slice(0, 30);
    const base = e.getAttribute('data-testid') || (e.getAttribute('aria-label') || '').slice(0, 50) || `${e.tagName.toLowerCase()}:${txt}`;
    occ[base] = (occ[base] || 0) + 1; const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue;
    res.push({ k: `${base}#${occ[base]}`, x: r.x, y: r.y, w: r.width, h: r.height });
  }
  return res;
};
const diff = (before, after) => {
  const am = Object.fromEntries(after.map((a) => [a.k, a]));
  const bk = new Set(before.map((b) => b.k));
  const d = before.map((x) => { const a = am[x.k]; if (!a) return { k: x.k, missing: true }; return { k: x.k, dx: +(a.x - x.x).toFixed(3), dy: +(a.y - x.y).toFixed(3), dw: +(a.w - x.w).toFixed(3), dh: +(a.h - x.h).toFixed(3) }; });
  const added = after.filter((a) => !bk.has(a.k)).map((a) => a.k);
  const missing = d.filter((r) => r.missing).map((r) => r.k);
  const moved = d.filter((r) => !r.missing && [r.dx, r.dy, r.dw, r.dh].some((v) => Math.abs(v) > 0.01));
  const maxAbs = Math.max(0, ...d.filter((r) => !r.missing).flatMap((r) => [Math.abs(r.dx), Math.abs(r.dx + r.dw), Math.abs(r.dy), Math.abs(r.dy + r.dh)]));
  const over1 = d.filter((r) => !r.missing && [Math.abs(r.dx), Math.abs(r.dx + r.dw), Math.abs(r.dy), Math.abs(r.dy + r.dh)].some((v) => v > 1));
  return { maxAbs: +maxAbs.toFixed(3), moved, movedCount: moved.length, added, missing, over1 };
};
const icons = () => {
  const r2 = (v) => +v.toFixed(2);
  const host = {
    'marker-prev': document.querySelector('[data-testid=arrangement-marker-prev]'),
    'marker-next': document.querySelector('[data-testid=arrangement-marker-next]'),
    'marker-add': document.querySelector('[data-testid=arrangement-marker-add]'),
    'detail-toggle': document.querySelector('[data-testid=arrangement-detail-toggle]'),
    exit: document.querySelector('[data-testid=arrangement-exit]'),
  };
  const menu = document.querySelector('[data-testid=arrangement-grid-menu]');
  if (menu) [...menu.querySelectorAll('[role^=menuitem]')].forEach((e, i) => { host[`grid-${i}:${e.textContent.trim()}`] = e; });
  const out = {};
  for (const [id, e] of Object.entries(host)) {
    if (!e) { out[id] = { present: false }; continue; }
    const svgs = [...e.querySelectorAll('svg')];
    const hr = e.getBoundingClientRect(); const hcs = getComputedStyle(e);
    const o = { present: true, text: e.textContent, glyphText: /[◀▶▸▾✓←]/u.test(e.textContent), cls: e.className.baseVal ?? e.className, ariaLabel: e.getAttribute('aria-label'), title: e.getAttribute('title'), keys: e.getAttribute('aria-keyshortcuts'), expanded: e.getAttribute('aria-expanded'), checked: e.getAttribute('aria-checked'), href: e.getAttribute('href'), host: [r2(hr.x), r2(hr.y), r2(hr.width), r2(hr.height)], color: hcs.color, nSvg: svgs.length };
    o.svgs = svgs.map((s) => { const sr = s.getBoundingClientRect(); const scs = getComputedStyle(s); const span = s.parentElement; const ar = (span !== e ? span : e).getBoundingClientRect(); const spanCs = getComputedStyle(span !== e ? span : e); return { cls: s.getAttribute('class'), ariaHidden: s.getAttribute('aria-hidden'), sw: s.getAttribute('stroke-width'), box: [r2(sr.x), r2(sr.y), r2(sr.width), r2(sr.height)], stroke: scs.stroke, parentColor: spanCs.color, dx: r2(sr.x + sr.width / 2 - (ar.x + ar.width / 2)), dy: r2(sr.y + sr.height / 2 - (ar.y + ar.height / 2)), parentCls: span !== e ? span.className : null }; });
    if (menu && menu.contains(e)) { const sp = e.querySelector('span[aria-hidden]'); o.spanEmpty = sp ? sp.childNodes.length === 0 : null; o.spanCls = sp ? sp.className : null; }
    out[id] = o;
  }
  out.__menuText = menu ? menu.textContent : null;
  return out;
};
async function axNames(p, sels) {
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('DOM.enable'); await cdp.send('Accessibility.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const res = {};
  for (const sel of sels) {
    const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: sel });
    res[sel] = [];
    for (const nodeId of nodeIds) { const ax = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false }); const n = ax.nodes[0]; res[sel].push({ role: n.role && n.role.value, name: n.name && n.name.value, ignored: n.ignored }); }
  }
  await cdp.detach();
  return res;
}
async function hover(p, sel) {
  const bb = await p.locator(sel).first().boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(350);
  const r = await p.evaluate((sel) => { const e = document.querySelector(sel); const s = e.querySelector('svg'); return { color: getComputedStyle(e).color, stroke: s ? getComputedStyle(s).stroke : null, hovered: e.matches(':hover') }; }, sel);
  return r;
}
const openMenu = async (p) => { const body = p.locator('[data-track-id="music"] [data-grid-seconds]').first(); const bb = await body.boundingBox(); await p.mouse.click(bb.x + 300, bb.y + bb.height / 2, { button: 'right' }); await p.waitForSelector('[data-testid=arrangement-grid-menu]', { timeout: 5000 }); await sleep(300); };
(async () => {
  const b = await L.launch(); const net = []; const res = { W, attempt: ATT, utc: new Date().toISOString(), states: [] };
  const states = [
    ['S0-default', async () => {}],
    ['S1-detail-toggled', async (p) => { await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(700); }],
    ['S2-grid-menu', openMenu],
  ];
  const ref = REF[W];
  for (const [name, prep] of states) {
    const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c166icon-${W}-${name}-${ATT}`, net);
    const fontBad = log.fontResp.filter((r) => r.s !== 200);
    await p.mouse.move(2, 2); await sleep(300); await prep(p); if (name !== 'S2-grid-menu') await p.mouse.move(2, 2); await sleep(500);
    const cur = await p.evaluate(measure);
    const refState = ref.find((s) => s.state === name);
    const box = diff(refState.before, cur);
    const ic = await p.evaluate(icons);
    await p.screenshot({ path: path.join(SHD, `icon-${W}-${name}-${ATT}.png`) });
    const ax = await axNames(p, ['[data-testid=arrangement-marker-prev]', '[data-testid=arrangement-marker-next]', '[data-testid=arrangement-marker-add]', '[data-testid=arrangement-detail-toggle]', '[data-testid=arrangement-exit]', '[data-testid=arrangement-grid-menu] [role^=menuitem]']);
    const st = { state: name, fontsOk: log.fontsReady && log.fontsReady.ok, fontBad, refN: refState.before.length, curN: cur.length, box, icons: ic, ax };
    if (name === 'S2-grid-menu') {
      st.hoverGrid = await p.evaluate(() => null);
      const chk = p.locator('[data-testid=arrangement-grid-menu] [aria-checked=true]').first();
      const cb = await chk.boundingBox(); await p.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2); await sleep(300);
      st.hoverGrid = await p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-grid-menu] [aria-checked=true]'); const s = e.querySelector('svg'); const sp = s.parentElement; return { item: e.textContent.trim(), stroke: getComputedStyle(s).stroke, spanColor: getComputedStyle(sp).color }; });
      const snap0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
      const snapItem = p.locator('[data-testid=arrangement-grid-menu] [role=menuitemcheckbox]', { hasText: 'Snap' });
      await snapItem.click(); await sleep(500);
      const statusAfter = await L.status(p);
      const snap1 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
      await openMenu(p);
      st.snapToggle = { snap0, snap1, statusAfter, icons: await p.evaluate(icons) };
      await p.screenshot({ path: path.join(SHD, `icon-${W}-${name}-snapToggled-${ATT}.png`) });
      await p.keyboard.press('Escape'); await sleep(300);
    } else {
      st.hover = {};
      for (const [k, sel] of [['marker-prev', '[data-testid=arrangement-marker-prev]'], ['marker-next', '[data-testid=arrangement-marker-next]'], ['detail-toggle', '[data-testid=arrangement-detail-toggle]'], ['exit', '[data-testid=arrangement-exit]']]) st.hover[k] = await hover(p, sel);
      await p.mouse.move(2, 2); await sleep(300);
    }
    res.states.push(st);
    console.log(W, name, 'fonts', st.fontsOk, 'fontBad', fontBad.length, 'ref', st.refN, 'cur', st.curN, 'max', box.maxAbs, 'moved', JSON.stringify(box.moved), 'added', JSON.stringify(box.added), 'missing', JSON.stringify(box.missing));
    await ctx.close();
  }
  // 4x crops
  {
    const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `c166crop-${W}-${ATT}`, net, { deviceScaleFactor: 4 });
    await p.mouse.move(2, 2); await sleep(500);
    for (const [nm, sel] of [['marker-header', '[data-testid=arrangement-marker-prev]'], ['toggle', '[data-testid=arrangement-detail-toggle]'], ['exit', '[data-testid=arrangement-exit]']]) {
      const bb = await p.locator(sel).first().boundingBox(); const pad = nm === 'marker-header' ? { x: bb.x - 24, y: bb.y - 6, width: 90, height: bb.height + 12 } : { x: bb.x - 6, y: bb.y - 6, width: bb.width + 12, height: bb.height + 12 };
      await p.screenshot({ path: path.join(SHD, `crop4x-${W}-${nm}-${ATT}.png`), clip: pad });
    }
    await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(700); await p.mouse.move(2, 2); await sleep(300);
    const bb = await p.locator('[data-testid=arrangement-detail-toggle]').boundingBox();
    await p.screenshot({ path: path.join(SHD, `crop4x-${W}-toggle-other-${ATT}.png`), clip: { x: bb.x - 6, y: bb.y - 6, width: bb.width + 12, height: bb.height + 12 } });
    await ctx.close();
  }
  res.net = X.netOk(net);
  await b.close();
  fs.writeFileSync(path.join(OUTD, `icon-${W}-${ATT}.json`), JSON.stringify(res, null, 1));
  console.log('net', JSON.stringify(res.net));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
