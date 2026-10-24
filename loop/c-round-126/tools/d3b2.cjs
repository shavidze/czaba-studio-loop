// C round 126 — D3-B carried items: export range card under footer (1280), group volume readout, volume dead zone.
// node d3b2.cjs <1280|1440>
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1280;
const RUNID = `${W}-${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}`;
const net = []; const OUTD = path.join(L.ROOT, 'out', 'd3b'); fs.mkdirSync(OUTD, { recursive: true });
async function buildS1(p) {
  await L.setSnapOff(p);
  await L.addAt(p, 'demo-hero-music', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2); await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
  await L.seekTo(p, 1); await L.blur(p); await p.keyboard.press('m'); await sleep(400);
  const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems').id;
  await X.rangeDrag(p, stems, 4, 2); await X.key(p, 'Control+l');
  await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150); await X.key(p, 'Control+g');
  const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id; await L.selectClip(p, sfx).catch(() => {});
  if (W === 1280) await X.openDetail(p);
  await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
}
const dlgGeo = (p) => p.evaluate(() => {
  const t = document.querySelector('#arrangement-export-title'); const d = t && t.closest('[role=dialog]'); if (!d) return null;
  const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
  const range = d.querySelector('[data-testid=arrangement-export-scope-range]'); const card = range && (range.closest('label') || range.parentElement);
  const footer = d.querySelector('[data-testid=arrangement-export-footer]');
  let sc = null; for (let n = card; n && n !== d.parentElement; n = n.parentElement) { const cs = getComputedStyle(n); if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight) { sc = n; break; } }
  let scAny = null; for (let n = card; n && n !== d.parentElement; n = n.parentElement) { const cs = getComputedStyle(n); if (/(auto|scroll)/.test(cs.overflowY)) { scAny = n; break; } }
  const fb = footer.getBoundingClientRect(); const cb = card.getBoundingClientRect();
  const hit = document.elementFromPoint(cb.left + 20, cb.top + cb.height / 2);
  return { dialog: r(d), card: r(card), cardText: (card.textContent || '').replace(/\s+/g, ' ').slice(0, 160), range: r(range), rangeDisabled: range.disabled, rangeChecked: range.checked, footer: r(footer), overlapPx: Math.max(0, Math.round(cb.bottom - fb.top)), cardBelowFooterTop: cb.top >= fb.top, hitAtCardMid: hit ? (hit.getAttribute('data-testid') || hit.tagName) + (card.contains(hit) ? ' (card)' : footer.contains(hit) ? ' (footer)' : '') : null,
    scroller: sc ? { tag: sc.tagName, cls: sc.className.slice(0, 120), scrollTop: sc.scrollTop, scrollHeight: sc.scrollHeight, clientHeight: sc.clientHeight } : null,
    overflowAncestor: scAny ? { cls: scAny.className.slice(0, 120), scrollHeight: scAny.scrollHeight, clientHeight: scAny.clientHeight } : null,
    vh: innerHeight, docScroll: document.scrollingElement.scrollHeight > innerHeight };
});
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'], ignoreDefaultArgs: ['--hide-scrollbars'] });
  const res = { runId: RUNID, vp: W, scrollbars: 'real' };
  try {
    const { page: p } = await L.openStudio(b, X.VPS[W], `d3b2-${RUNID}`, net);
    await buildS1(p);
    // ---- group volume readout
    res.group = await p.evaluate(() => {
      const g = document.querySelector('[data-testid=arrangement-group-row]'); if (!g) return null;
      const s = g.querySelector('[role=slider], input[type=range]');
      return { rowText: g.innerText.replace(/\s+/g, ' '), slider: s && { label: s.getAttribute('aria-label'), title: s.getAttribute('title'), valuetext: s.getAttribute('aria-valuetext'), now: s.getAttribute('aria-valuenow') || s.value } };
    });
    { const s = p.locator('[data-testid=arrangement-group-row] [role=slider], [data-testid=arrangement-group-row] input[type=range]').first(); await s.focus(); for (let i = 0; i < 30; i++) await p.keyboard.press('ArrowDown'); await sleep(300);
      res.groupAfter30Down = await p.evaluate(() => { const g = document.querySelector('[data-testid=arrangement-group-row]'); const s = g.querySelector('[role=slider], input[type=range]'); return { rowText: g.innerText.replace(/\s+/g, ' '), title: s.getAttribute('title'), valuetext: s.getAttribute('aria-valuetext'), status: document.querySelector('[data-testid=arrangement-status]').textContent.trim() }; });
      const gb = await p.locator('[data-testid=arrangement-group-row]').boundingBox(); res.groupBox = gb;
      await p.screenshot({ path: path.join(L.SHOTS, `D3B-group-${RUNID}.png`), clip: { x: gb.x, y: gb.y - 40, width: Math.min(560, gb.width), height: gb.height + 80 } });
      await p.keyboard.press('Control+z'); await sleep(300); await L.blur(p); }
    // ---- lane volume dead zone (music lane fader)
    res.laneSliders = await p.evaluate(() => [...document.querySelectorAll('[data-track-id=music] [role=slider], [data-track-id=music] input[type=range]')].map((s) => ({ label: s.getAttribute('aria-label'), testid: s.getAttribute('data-testid'), now: s.getAttribute('aria-valuenow') || s.value, vt: s.getAttribute('aria-valuetext') })));
    const vol = p.locator('[data-track-id=music] [role=slider][aria-label*=Volume], [data-track-id=music] [role=slider][aria-label*=ხმ]').first();
    res.dead = [];
    if (await vol.count()) {
      for (const dx of [-3, -6, -7, -10]) {
        const bx = await vol.boundingBox(); const readNow = () => vol.evaluate((s) => ({ now: s.getAttribute('aria-valuenow'), vt: s.getAttribute('aria-valuetext'), txt: s.closest('[data-track-id]').innerText.replace(/\s+/g, ' ').slice(0, 80) }));
        const before = await readNow(); const t0 = Date.now();
        await p.mouse.move(bx.x + bx.width * 0.8, bx.y + bx.height / 2); await p.mouse.down();
        const mid = []; for (let i = 1; i <= Math.abs(dx); i++) { await p.mouse.move(bx.x + bx.width * 0.8 + Math.sign(dx) * i, bx.y + bx.height / 2); }
        const during = await readNow(); const cursor = await p.evaluate(() => getComputedStyle(document.body).cursor + '/' + getComputedStyle(document.elementFromPoint(10, 10)).cursor);
        await p.mouse.up(); await sleep(250); const after = await readNow(); const st = await L.status(p);
        res.dead.push({ dx, axis: 'horizontal', before, during, after, status: st, cursor, ms: Date.now() - t0 });
        if (after.now !== before.now) { await p.keyboard.press('Control+z'); await sleep(250); }
        await L.blur(p);
      }
      // vertical attempt too
      const bx = await vol.boundingBox(); const b0 = await vol.getAttribute('aria-valuenow');
      await p.mouse.move(bx.x + bx.width * 0.8, bx.y + bx.height / 2); await p.mouse.down(); for (let i = 1; i <= 6; i++) await p.mouse.move(bx.x + bx.width * 0.8, bx.y + bx.height / 2 + i); await p.mouse.up(); await sleep(250);
      res.deadVertical6 = { before: b0, after: await vol.getAttribute('aria-valuenow') };
      res.volBox = bx;
    }
    await L.blur(p); await p.mouse.move(2, 2);
    // ---- export dialog range card
    await X.openDlg(p); await p.mouse.move(2, 2); await sleep(400);
    res.dlg0 = await dlgGeo(p);
    res.shotDlg0 = await X.shot(p, `D3B-export-${RUNID}.png`);
    // Tab walk until range radio
    const tabs = [];
    for (let i = 0; i < 25; i++) { await p.keyboard.press('Tab'); await sleep(80); const a = await p.evaluate(() => { const e = document.activeElement; const b = e.getBoundingClientRect(); const f = document.querySelector('[data-testid=arrangement-export-footer]'); const fb = f ? f.getBoundingClientRect() : null; return { tid: e.getAttribute('data-testid') || e.tagName + ':' + (e.textContent || '').trim().slice(0, 30), top: Math.round(b.top), bottom: Math.round(b.bottom), underFooter: fb ? b.bottom > fb.top && b.top < fb.bottom : null }; }); tabs.push(a); if (a.tid === 'arrangement-export-scope-range') break; }
    res.tabWalk = tabs;
    res.dlgAfterTab = await dlgGeo(p);
    res.shotDlgTab = await X.shot(p, `D3B-export-tab-${RUNID}.png`);
    // wheel scroll in dialog body
    const d0 = res.dlg0; await p.mouse.move(d0.dialog[0] + d0.dialog[2] / 2, d0.dialog[1] + d0.dialog[3] / 2); await p.mouse.wheel(0, 400); await sleep(400);
    res.dlgAfterWheel = await dlgGeo(p);
    res.shotDlgWheel = await X.shot(p, `D3B-export-wheel-${RUNID}.png`);
  } catch (e) { res.error = String(e.stack || e); }
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(OUTD, `d3b2-${RUNID}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ err: res.error, group: res.group, g30: res.groupAfter30Down, lane: res.laneSliders, dead: res.dead && res.dead.map((d) => `${d.dx}px ${d.before.now}->${d.during.now}->${d.after.now} vt ${d.after.vt} cur ${d.cursor} st ${d.status.slice(0, 50)}`), dv: res.deadVertical6, dlg0: res.dlg0, tabs: res.tabWalk, dlgTab: res.dlgAfterTab && [res.dlgAfterTab.card, res.dlgAfterTab.overlapPx, res.dlgAfterTab.scroller], dlgWheel: res.dlgAfterWheel && [res.dlgAfterWheel.card, res.dlgAfterWheel.overlapPx, res.dlgAfterWheel.scroller], net: res.net }, null, 1));
  await b.close();
})();
