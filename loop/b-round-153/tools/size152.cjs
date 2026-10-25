// B round 152 planning probe (read-only): font-size / weight / role inventory of every visible text in S0, S1, S2 (Export) and the marker + grid menus.
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const net = [];
function inv(scopeSel) {
  const root = document.querySelector(scopeSel) || document.body; const sizes = {}; const items = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode.textContent.trim(); if (!t) continue; const e = walker.currentNode.parentElement; if (!e.getClientRects().length) continue;
    const cs = getComputedStyle(e); if (cs.visibility === 'hidden') continue; const r = e.getBoundingClientRect(); if (r.width === 0 || r.height === 0) continue;
    const fs = cs.fontSize; sizes[fs] = (sizes[fs] || 0) + 1;
    items.push({ t: t.slice(0, 48), fs, lh: cs.lineHeight, fw: cs.fontWeight, ff: cs.fontFamily.split(',')[0], tt: cs.textTransform, ls: cs.letterSpacing, tag: e.tagName, cls: (e.getAttribute('class') || '').slice(0, 160), tid: e.closest('[data-testid]')?.getAttribute('data-testid') || null, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) });
  }
  return { sizes, items };
}
async function buildS1(p) {
  await L.setSnapOff(p);
  await L.addAt(p, 'demo-hero-music', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2); await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4'); await L.seekTo(p, 1); await L.blur(p); await p.keyboard.press('m'); await sleep(400); await p.keyboard.press('Enter'); await sleep(300);
  const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems').id; await X.rangeDrag(p, stems, 4, 2); await X.key(p, 'Control+l');
  await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150); await X.key(p, 'Control+g');
  const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id; await L.selectClip(p, sfx);
  if (W === 1280) await X.openDetail(p);
  await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
}
(async () => {
  const b = await L.launch(); const res = { vp: W, states: {} };
  try {
    const { page: p } = await L.openStudio(b, X.VPS[W], `b152-${W}`, net);
    await p.mouse.move(2, 2); await sleep(300); await L.fontsWait(p);
    res.states.S0 = await p.evaluate(inv, '.studio-container'); await p.screenshot({ path: path.join(L.SHOTS, `S0-${W}.png`) });
    await buildS1(p); await L.fontsWait(p);
    res.states.S1 = await p.evaluate(inv, '.studio-container'); await p.screenshot({ path: path.join(L.SHOTS, `S1-${W}.png`) });
    const mk = p.locator('[data-testid=arrangement-marker]').first();
    if (await mk.count()) { await mk.click({ button: 'right' }); await sleep(400); res.states.MarkerMenu = await p.evaluate(inv, 'body'); await p.screenshot({ path: path.join(L.SHOTS, `MM-${W}.png`) }); await p.keyboard.press('Escape'); await sleep(300); }
    const lane = p.locator('[data-testid=arrangement-timeline-scroller]').first(); const bb = await lane.boundingBox();
    await p.mouse.click(bb.x + bb.width - 40, bb.y + bb.height - 30, { button: 'right' }); await sleep(400); res.states.GridMenu = await p.evaluate(inv, 'body'); await p.screenshot({ path: path.join(L.SHOTS, `GM-${W}.png`) }); await p.keyboard.press('Escape'); await sleep(300);
    await X.openDlg(p); await p.mouse.move(2, 2); await sleep(400); res.states.S2 = await p.evaluate(inv, 'body'); await p.screenshot({ path: path.join(L.SHOTS, `S2-${W}.png`) });
  } catch (e) { res.error = String(e.stack || e); }
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(L.OUT, `size152-${W}.json`), JSON.stringify(res, null, 1));
  const sum = Object.fromEntries(Object.entries(res.states).map(([k, v]) => [k, { sizes: v.sizes, ge16: v.items.filter((i) => parseFloat(i.fs) >= 16).map((i) => `${i.t}|${i.fs}|${i.tid}`) }]));
  console.log(JSON.stringify({ vp: W, err: res.error, sum }, null, 1)); await b.close();
})();
