// C round 183 — copy of c-round-182/tools/c182.cjs used for STUDIO-RV-M4 + M3-NEIGHBOUR (prefix c183).
// C round 182 — M3 library row spacing: GAP-M3, LAYOUT-M3, RV1 rest shot, SCROLL-M3, STATE-M3, BEHAVIOUR-M3, M1-NEIGHBOUR, PX-NET/REG-HYD.
// node c182.cjs <1440|1280> <attempt> [tagPrefix]   C_BASE env selects the server (HEAD copy on :5174). DPR 2, --disable-lcd-text, fresh anonymous context.
const X = require('../../c-round-180/tools/lib122.cjs'); const { L, sleep } = X;
const { decode } = require('../../c-round-180/tools/png.cjs');
const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1'; const PFX = process.argv[4] || 'c182';
const TAG = `${PFX}-${W}-${ATT}`;
const ROOT = path.join(__dirname, '..'); const OUT = path.join(ROOT, 'out'); const SHD = path.join(ROOT, 'shots', TAG); fs.mkdirSync(SHD, { recursive: true });
const net = []; const res = { W, ATT, base: process.env.C_BASE || 'http://127.0.0.1:5173', utc: new Date().toISOString(), errors: [], shots: {} };
const save = () => L.save(OUT, `${TAG}.json`, { ...res, net });
const D = 2;
const imgs = {};
async function snap(p, name) { const f = path.join(SHD, `${name}.png`); const buf = await p.screenshot({ path: f }); imgs[name] = decode(buf); res.shots[name] = path.relative(ROOT, f); return imgs[name]; }
const step = async (k, fn) => { try { const v = await fn(); res[k] = { ...(res[k] || {}), ...v }; } catch (e) { res[k] = { ...(res[k] || {}), error: String((e && e.stack) || e).slice(0, 800) }; res.errors.push(`${k}: ${String(e).slice(0, 200)}`); } save(); };
const PAGE = () => {
  const r2 = (n) => Math.round(n * 100) / 100;
  const bx = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [r2(r.x), r2(r.y), r2(r.width), r2(r.height)]; };
  const list = () => document.querySelector('[data-testid="arrangement-library-list"]');
  const opts = () => [...list().querySelectorAll('[role="option"]')];
  const gap = () => {
    const l = list(); const lb = l.getBoundingClientRect(); const o = opts();
    const rows = o.map((el, i) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { i, id: el.dataset.sourceId, box: bx(el), mt: cs.marginTop, mb: cs.marginBottom, bg: cs.backgroundColor, sel: el.getAttribute('aria-selected'), tab: el.tabIndex, full: r.top >= lb.top - 0.5 && r.bottom <= lb.bottom + 0.5 }; });
    const gaps = []; for (let i = 1; i < rows.length; i++) gaps.push(r2(rows[i].box[1] - (rows[i - 1].box[1] + rows[i - 1].box[3])));
    return { list: bx(l), cls: l.className, client: l.clientHeight, scrollH: l.scrollHeight, scrollTop: l.scrollTop, offsetW: l.offsetWidth, clientW: l.clientWidth, listBg: getComputedStyle(l).backgroundColor, n: rows.length, kids: l.children.length, gaps, rows, fullCount: rows.filter((r) => r.full).length };
  };
  const play = () => [...document.querySelectorAll('button')].find((b) => /^(Play|Pause)$/.test(b.getAttribute('aria-label') || ''));
  const layout = () => {
    const q = (s) => document.querySelector(s);
    const pl = play();
    const firstLane = q('[data-track-id]');
    return {
      aside: bx(q('[data-testid="arrangement-library"]')),
      list: bx(list()),
      tree: bx(q('[data-testid="arrangement-library-tree"]')),
      search: bx(q('[data-testid="arrangement-library-search"]')),
      preview: bx(q('[data-testid="arrangement-library-preview"]')),
      transport: bx(pl && pl.parentElement),
      play: bx(pl), playLabel: pl && pl.getAttribute('aria-label'), playTitle: pl && pl.getAttribute('title'),
      firstLane: bx(firstLane), firstLaneId: firstLane && firstLane.dataset.trackId,
      detail: bx(q('[data-testid="arrangement-detail-panel"]')),
      elements: document.querySelectorAll('body *').length,
      scrollW: document.documentElement.scrollWidth, scrollH: document.documentElement.scrollHeight, vw: innerWidth, vh: innerHeight,
      offViewport: [...document.querySelectorAll('[data-testid^="arrangement-library"]')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5); }).map((e) => e.dataset.testid),
    };
  };
  const clipSig = () => [...document.querySelectorAll('[data-clip-id]')].map((e) => `${e.closest('[data-track-id]').dataset.trackId}:${e.dataset.clipKind}@${e.getAttribute('data-clip-start')}`).sort();
  const selState = () => ({ selected: opts().filter((o) => o.getAttribute('aria-selected') === 'true').map((o) => o.dataset.sourceId), active: document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.sourceId || document.activeElement.tagName : null });
  window.__c182 = { gap, layout, list, opts, clipSig, selState, bx };
};
const G = (p) => p.evaluate(() => window.__c182.gap());
async function rest(p) { await L.blur(p); await p.mouse.move(2, 2); await sleep(500); }
// diff two images inside rect (CSS px); returns changed count and bbox in CSS px
function diffIn(A, B, rect) {
  const [x, y, w, h] = rect; let n = 0; const bb = [1e9, 1e9, -1e9, -1e9];
  for (let Y = Math.max(0, Math.floor(y * D)); Y < Math.min(A.h, Math.ceil((y + h) * D)); Y++) for (let Xp = Math.max(0, Math.floor(x * D)); Xp < Math.min(A.w, Math.ceil((x + w) * D)); Xp++) {
    const a = A.px(Xp, Y), b = B.px(Xp, Y); if (a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2]) { n++; bb[0] = Math.min(bb[0], Xp / D); bb[1] = Math.min(bb[1], Y / D); bb[2] = Math.max(bb[2], (Xp + 1) / D); bb[3] = Math.max(bb[3], (Y + 1) / D); }
  }
  return { changed: n, bbox: n ? [bb[0], bb[1], +(bb[2] - bb[0]).toFixed(2), +(bb[3] - bb[1]).toFixed(2)] : null };
}
const pxAt = (I, x, y) => I.px(Math.round(x * D), Math.round(y * D));

(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--disable-lcd-text'] });
  try {
    const o = await L.openStudio(b, X.VPS[W], TAG, net, { deviceScaleFactor: 2, extraInit: X.tapInit }); const p = o.page; res.fonts = o.log.fontsReady && o.log.fontsReady.ok;
    await p.evaluate(PAGE);
    res.anon = await p.evaluate(() => ({ auth: localStorage.getItem('auth_user'), cookie: document.cookie, path: location.pathname, ls: Object.keys(localStorage) }));
    res.anonCookies = (await o.ctx.cookies()).length;
    await rest(p); await snap(p, 'rest-full');
    await step('gap', async () => ({ rest: await G(p) }));
    await step('layout', async () => ({ rest: await p.evaluate(() => window.__c182.layout()) }));
    // SCROLL: wheel to end
    await step('scroll', async () => {
      const g0 = await G(p); const [lx, ly, lw, lh] = g0.list;
      await p.mouse.move(lx + lw / 2, ly + lh / 2);
      for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, 120); await sleep(120); }
      await sleep(500);
      const g1 = await G(p); const last = g1.rows[g1.rows.length - 1];
      const lastBottomGap = +(g1.list[1] + g1.list[3] - (last.box[1] + last.box[3])).toFixed(2);
      await p.mouse.move(2, 2); await sleep(300); await snap(p, 'scrolled-end');
      const thumbW = g1.offsetW - g1.clientW;
      // back to top with wheel
      await p.mouse.move(lx + lw / 2, ly + lh / 2);
      for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, -120); await sleep(120); }
      await sleep(400); await p.mouse.move(2, 2); await sleep(300);
      const g2 = await G(p);
      return { wheelEnd: { scrollTop: g1.scrollTop, scrollH: g1.scrollH, client: g1.client, last: last.box, lastFull: last.full, lastBottomGap, scrollbarGutter: thumbW, listBox: g1.list }, backTop: g2.scrollTop };
    });
    // ArrowDown path
    await step('arrow', async () => {
      await rest(p);
      await p.evaluate(() => window.__c182.opts()[0].focus()); await sleep(300);
      const r = []; const s0 = await p.evaluate(() => window.__c182.selState());
      for (let i = 0; i < 8; i++) {
        await p.keyboard.press('ArrowDown'); await sleep(350);
        const st = await p.evaluate(() => { const g = window.__c182.gap(); const s = window.__c182.selState(); const a = document.activeElement; const ai = window.__c182.opts().indexOf(a); const ar = a.getBoundingClientRect(); const lb = window.__c182.list().getBoundingClientRect(); return { ...s, activeIdx: ai, top: +(ar.top - lb.top).toFixed(2), bottom: +(lb.bottom - ar.bottom).toFixed(2), inside: ar.top >= lb.top - 0.01 && ar.bottom <= lb.bottom + 0.01, scrollTop: g.scrollTop }; });
        r.push({ press: i + 1, ...st });
      }
      await snap(p, 'arrow-end');
      // back to top / restore selection to first row
      await p.evaluate(() => { window.__c182.list().scrollTop = 0; });
      return { start: s0, presses: r };
    });
    // STATE: hover / select / Tab focus — diff vs rest inside list rect
    await step('state', async () => {
      // fresh reload of selection not possible; first restore rest by selecting row 0 via click? Instead measure relative to a per-state baseline.
      await rest(p); await p.evaluate(() => { window.__c182.list().scrollTop = 0; }); await sleep(300);
      const base = await snap(p, 'state-base'); const g = await G(p);
      const out = { baseSelected: g.rows.filter((r) => r.sel === 'true').map((r) => r.i), list: g.list };
      const target = g.rows.findIndex((r, i) => i > 0 && r.sel !== 'true' && r.full);
      const row = g.rows[target]; out.hoverRow = { i: target, box: row.box };
      await p.mouse.move(row.box[0] + row.box[2] / 2, row.box[1] + row.box[3] / 2); await sleep(500);
      const h = await snap(p, 'state-hover'); out.hover = { ...diffIn(h, base, g.list), bg: (await G(p)).rows[target].bg };
      // select via click
      await p.mouse.click(row.box[0] + row.box[2] / 2, row.box[1] + row.box[3] / 2); await sleep(500); await p.mouse.move(2, 2); await L.blur(p); await sleep(500);
      const gs = await G(p); const s = await snap(p, 'state-selected');
      const selRow = gs.rows[target];
      // pixels: just inside the row top/bottom vs just outside (gap) vs base same spots
      const cx = selRow.box[0] + 10; const top = selRow.box[1], bot = selRow.box[1] + selRow.box[3];
      out.selected = { ...diffIn(s, base, g.list), rowBox: selRow.box, sel: selRow.sel, bg: selRow.bg, otherSelected: gs.rows.filter((r) => r.sel === 'true').map((r) => r.i),
        px: { insideTop: pxAt(s, cx, top + 1), gapAbove: pxAt(s, cx, top - 2), gapAboveBase: pxAt(base, cx, top - 2), insideBottom: pxAt(s, cx, bot - 1), gapBelow: pxAt(s, cx, bot + 2), gapBelowBase: pxAt(base, cx, bot + 2), listSurface: pxAt(base, g.list[0] + 2, g.list[1] + g.list[3] - 2) } };
      // Tab focus: blur, focus search, Tab until an option is focused
      await rest(p); const preTab = await snap(p, 'state-pretab');
      await p.locator('[data-testid="arrangement-library-search"]').focus(); await sleep(200);
      let n = 0; let fi = -1;
      for (; n < 15; n++) { await p.keyboard.press('Tab'); fi = await p.evaluate(() => window.__c182.opts().indexOf(document.activeElement)); if (fi >= 0) break; }
      await p.mouse.move(2, 2); await sleep(400);
      const f = await snap(p, 'state-focus'); const gf = await G(p);
      const fr = gf.rows[fi];
      const fs2 = fi >= 0 ? await p.evaluate((i) => { const e = window.__c182.opts()[i]; const cs = getComputedStyle(e); return { fv: e.matches(':focus-visible'), shadow: cs.boxShadow }; }, fi) : null;
      out.focus = { tabs: n + 1, idx: fi, rowBox: fr && fr.box, ...fs2, ...diffIn(f, preTab, g.list), ringPx: fr ? { topMid: pxAt(f, fr.box[0] + fr.box[2] / 2, fr.box[1] + 0.25), leftMid: pxAt(f, fr.box[0] + 0.25, fr.box[1] + fr.box[3] / 2), aboveRow: pxAt(f, fr.box[0] + fr.box[2] / 2, fr.box[1] - 1) } : null };
      return out;
    });
    // BEHAVIOUR
    await step('beh', async () => {
      await rest(p);
      const sig = () => p.evaluate(() => window.__c182.clipSig().join('|'));
      const cnt = () => p.evaluate(() => window.__c182.clipSig().length);
      const out = {};
      await p.click(L.nameSel('music')); await sleep(200); await L.blur(p);
      const s0 = await sig(); const c0 = await cnt();
      const g = await G(p);
      const row = (i) => g.rows[i].box; const ctr = (bxx) => [bxx[0] + bxx[2] / 2, bxx[1] + bxx[3] / 2];
      // click selects
      const r1 = row(1); await p.mouse.click(...ctr(r1)); await sleep(400);
      out.click = { ...(await p.evaluate(() => window.__c182.selState())), clips: await cnt(), want: g.rows[1].id };
      // double click adds 1
      await p.mouse.dblclick(...ctr(r1)); await sleep(900);
      const c1 = await cnt(); out.dbl = { added: c1 - c0, status: await L.status(p) };
      const u1 = await X.key(p, 'Control+z'); out.dbl.undo = u1; out.dbl.restored = (await sig()) === s0;
      // Enter on focused row
      await p.evaluate(() => window.__c182.opts()[0].focus()); await sleep(200);
      await p.keyboard.press('Enter'); await sleep(900);
      const c2 = await cnt(); out.enter = { added: c2 - c0, status: await L.status(p) };
      const u2 = await X.key(p, 'Control+z'); out.enter.undo = u2; out.enter.restored = (await sig()) === s0;
      // drag row 0 onto Music lane
      const lane = p.locator('[data-track-id="music"] [data-grid-seconds]').first();
      const lb = await lane.boundingBox();
      await p.locator('[data-testid="arrangement-library-list"] [role=option]').first().dragTo(lane, { targetPosition: { x: Math.min(300, lb.width / 3), y: lb.height / 2 } });
      await sleep(1000);
      const c3 = await cnt(); const sig3 = await p.evaluate(() => window.__c182.clipSig());
      out.drag = { added: c3 - c0, music: sig3.filter((s) => s.startsWith('music:')), status: await L.status(p) };
      const u3 = await X.key(p, 'Control+z'); out.drag.undo = u3; out.drag.restored = (await sig()) === s0;
      // preview: select row 0, press preview toggle; tap peak
      await rest(p);
      const r0 = row(0); await p.mouse.click(...ctr(r0)); await sleep(400);
      await p.evaluate(() => window.__tapStart());
      await p.click('[data-testid="arrangement-library-preview-toggle"]'); await sleep(1500);
      const pv = await p.evaluate(() => ({ previewing: [...document.querySelectorAll('[data-testid="arrangement-library-option-previewing"]')].map((e) => ({ text: e.textContent.trim(), row: e.closest('[role=option]').dataset.sourceId })) }));
      await p.mouse.move(2, 2); await sleep(200); await snap(p, 'preview-playing');
      const gp = await G(p);
      const S = await p.evaluate(() => window.__tapStop());
      await p.click('[data-testid="arrangement-library-preview-toggle"]'); await sleep(500);
      out.preview = { ...pv, peak: +Math.max(0, ...S.map((q) => q.peak)).toFixed(4), taps: S.length, gapsWhilePreview: gp.gaps, heightsWhilePreview: gp.rows.map((r) => r.box[3]), stoppedRows: await p.evaluate(() => document.querySelectorAll('[data-testid="arrangement-library-option-previewing"]').length) };
      // R42 gap click (info)
      await rest(p); await p.evaluate(() => { window.__c182.list().scrollTop = 0; }); await sleep(300);
      const gg = await G(p); const a = gg.rows[2].box; const bb = gg.rows[3].box;
      const gy = (a[1] + a[3] + bb[1]) / 2; const gx = a[0] + a[2] / 2;
      const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? { tag: e.tagName, role: e.getAttribute('role'), testid: e.dataset.testid || null, inOption: !!e.closest('[role=option]') } : null; }, [gx, gy]);
      const selB = await p.evaluate(() => window.__c182.selState()); const sB = await sig();
      await p.mouse.click(gx, gy); await sleep(500);
      const selA = await p.evaluate(() => window.__c182.selState()); const sA = await sig();
      await p.mouse.dblclick(gx, gy); await sleep(800); const sD = await sig();
      out.gapClick = { at: [gx, gy], hit, selBefore: selB.selected, selAfter: selA.selected, activeAfter: selA.active, clipsChanged: sA !== sB, dblClipsChanged: sD !== sB };
      if (sD !== sB) { out.gapClick.undo = await X.key(p, 'Control+z'); }
      out.finalRestored = (await sig()) === s0;
      return out;
    });
    await rest(p);
    await step('layout', async () => ({ final: await p.evaluate(() => window.__c182.layout()) }));
    await o.ctx.close();
  } catch (e) { res.error = String((e && e.stack) || e).slice(0, 1500); }
  await b.close(); res.net = X.netOk(net); save();
  console.log(JSON.stringify({ TAG, error: res.error, errors: res.errors, net: res.net }, null, 1));
})();
