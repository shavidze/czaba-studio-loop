// C round 125 — D2 discoverability: hint line fit, tooltips/aria-keyshortcuts naming keys, context menus. node d2disc.cjs
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const net = []; const OUTD = path.join(L.ROOT, 'out', 'd2'); fs.mkdirSync(OUTD, { recursive: true });
async function buildS1(p, W) {
  await L.setSnapOff(p);
  await L.addAt(p, 'demo-hero-music', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2); await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
  await L.seekTo(p, 1); await L.blur(p); await p.keyboard.press('m'); await sleep(400);
  const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems').id;
  await X.rangeDrag(p, stems, 4, 2); await X.key(p, 'Control+l');
  await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150); await X.key(p, 'Control+g');
  const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id; await L.selectClip(p, sfx);
  if (W === 1280) await X.openDetail(p);
  await L.blur(p); return { stems, sfx };
}
const hint = (p) => p.evaluate(() => {
  const h = document.querySelector('[data-testid=arrangement-shortcut-hint]'); if (!h) return null; const cs = getComputedStyle(h); const b = h.getBoundingClientRect(); const f = h.parentElement.getBoundingClientRect();
  const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.5;
  const range = document.createRange(); range.selectNodeContents(h); const rects = [...range.getClientRects()]; const lines = new Set(rects.map((r) => Math.round(r.top))).size;
  const lastRight = Math.max(...rects.map((r) => r.right));
  return { text: h.textContent.replace(/\s+/g, ' ').trim(), box: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)], footer: [Math.round(f.x), Math.round(f.y), Math.round(f.width), Math.round(f.height)], clientW: h.clientWidth, scrollW: h.scrollWidth, overflow: cs.overflow, whiteSpace: cs.whiteSpace, textOverflow: cs.textOverflow, fontPx: parseFloat(cs.fontSize), lineH: lh, lines, textRightPx: Math.round(lastRight), clippedByViewport: b.bottom > innerHeight || lastRight > innerWidth, color: cs.color, title: h.getAttribute('title') };
});
const titles = (p) => p.evaluate(() => {
  const KEY = /(Ctrl|Cmd|Shift|Alt|Option|Space|Home|End|F2|Delete|Backspace|Enter|Esc|←|→|↑|↓|\([A-Z0-9+\-−]{1,3}\)|\b[A-Z]\b ?=|^[A-Z]$)/;
  const out = [];
  for (const e of document.querySelectorAll('[title],[aria-label],[aria-keyshortcuts],[aria-description]')) {
    const t = e.getAttribute('title') || ''; const a = e.getAttribute('aria-label') || ''; const k = e.getAttribute('aria-keyshortcuts') || ''; const d = e.getAttribute('aria-description') || '';
    if (!(KEY.test(t) || KEY.test(a) || k || KEY.test(d))) continue;
    const b = e.getBoundingClientRect(); if (!(b.width > 0 && b.height > 0)) continue;
    out.push({ tid: e.getAttribute('data-testid'), tag: e.tagName.toLowerCase(), title: t.slice(0, 160), aria: a.slice(0, 160), keys: k, desc: d.slice(0, 160) });
  }
  const seen = new Set(); return out.filter((x) => { const kk = JSON.stringify([x.tid, x.title, x.aria, x.keys]); if (seen.has(kk)) return false; seen.add(kk); return true; });
});
const menuState = (p) => p.evaluate(() => { const m = document.querySelector('[role=menu]'); return m ? { items: [...m.querySelectorAll('[role^=menuitem]')].map((i) => i.textContent.replace(/\s+/g, ' ').trim()) } : null; });
(async () => {
  const b = await L.launch(); const res = {};
  for (const W of [1440, 1280]) {
    const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `d2disc-${W}`, net);
    const r = (res[W] = {});
    r.hintS0 = await hint(p);
    const s = await buildS1(p, W);
    r.hintS1 = await hint(p);
    r.titles = await titles(p);
    const ctxMenu = async (label, fn) => { await L.blur(p); await fn(); await sleep(400); r['menu_' + label] = await menuState(p); await p.screenshot({ path: path.join(L.SHOTS, `D2-menu-${label}-${W}.png`) }); await p.keyboard.press('Escape'); await sleep(300); };
    const cb = await p.locator(`[data-clip-id="${s.sfx}"]`).boundingBox();
    await ctxMenu('clip', () => p.mouse.click(cb.x + cb.width / 2, cb.y + cb.height * 0.6, { button: 'right' }));
    const lb = await p.locator('[data-track-id=sfx]').last().boundingBox(); const g = await L.geo(p);
    await ctxMenu('lane', () => p.mouse.click(g.rl + 12 * g.pps, lb.y + lb.height / 2, { button: 'right' }));
    const rb = await p.locator('[data-testid=arrangement-ruler]').boundingBox();
    await ctxMenu('ruler', () => p.mouse.click(g.rl + 12 * g.pps, rb.y + rb.height / 2, { button: 'right' }));
    await ctxMenu('marker', () => p.locator('[data-testid=arrangement-marker]').first().click({ button: 'right' }));
    await ctxMenu('header', () => p.locator(L.nameSel('sfx')).click({ button: 'right' }));
    // hover tooltips are native title attributes; record whether hovering shows any custom tooltip element
    await p.hover('button[title*="Ctrl/Cmd+E"]'); await sleep(1200); r.customTooltip = await p.evaluate(() => !!document.querySelector('[role=tooltip]'));
    await p.screenshot({ path: path.join(L.SHOTS, `D2-hint-${W}.png`), clip: { x: 0, y: X.VPS[W].height - 80, width: X.VPS[W].width, height: 80 } });
    await ctx.close();
  }
  res.net = X.netOk(net); fs.writeFileSync(path.join(OUTD, 'd2-discoverability.json'), JSON.stringify(res, null, 1));
  for (const W of [1440, 1280]) { const r = res[W]; console.log(W, JSON.stringify({ hintS0: r.hintS0 && { ...r.hintS0, text: r.hintS0.text.length }, hintS1: r.hintS1 && { ...r.hintS1, text: undefined }, menus: Object.fromEntries(Object.entries(r).filter(([k]) => k.startsWith('menu_'))), customTooltip: r.customTooltip, nTitles: r.titles.length })); }
  console.log('NET', JSON.stringify(res.net)); await b.close();
})();
