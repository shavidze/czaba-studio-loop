// C round 160 — V-3b: ICON-V3B, SURFACE-SPOT, FUNC-SMOKE-7, BRACE-HINT, PX-NET. node c160.cjs <1440|1280> [label]
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const LBL = process.argv[3] || `c160-${W}`;
const net = []; const res = { vp: W, label: LBL, utc: new Date().toISOString(), errors: [] };
const OUTF = path.join(L.OUT, `${LBL}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const sec = async (n, fn) => { try { res[n] = await fn(); } catch (e) { res.errors.push(`${n}: ${String(e.stack || e).slice(0, 700)}`); } save(); };
const shot = async (p, name, clip) => { const f = `${name}-${LBL}.png`; await p.screenshot({ path: path.join(L.SHOTS, f), ...(clip ? { clip } : {}) }); return `c-round-160/shots/${f}`; };

function readBtns() {
  const pos = document.querySelector('[data-testid=arrangement-position]');
  let n = pos; while (n && !(n.classList && n.classList.contains('flex-wrap') && n.querySelector('[data-testid=arrangement-fit]'))) n = n.parentElement;
  const bs = [...n.querySelectorAll('button')];
  const btns = bs.map((e, i) => {
    e.setAttribute('data-c160', String(i)); const cs = getComputedStyle(e); const b = e.getBoundingClientRect();
    const svgs = [...e.querySelectorAll('svg')].map((s) => { const sb = s.getBoundingClientRect(); const sc = getComputedStyle(s); return { w: +sb.width.toFixed(3), h: +sb.height.toFixed(3), x: +sb.x.toFixed(2), swAttr: s.getAttribute('stroke-width'), swCss: sc.strokeWidth, stroke: sc.stroke, strokeAttr: s.getAttribute('stroke'), ariaHidden: s.getAttribute('aria-hidden'), cls: s.getAttribute('class'), beforeLabel: !!(s.nextElementSibling) }; });
    return { i, key: e.getAttribute('aria-label') || e.textContent.trim(), text: e.textContent, aria: e.getAttribute('aria-label'), title: e.getAttribute('title'), disabled: e.disabled, pressed: e.getAttribute('aria-pressed'), cls: e.className, bg: cs.backgroundColor, bt: cs.borderTopColor, color: cs.color, tp: cs.transitionProperty, td: cs.transitionDuration, ttf: cs.transitionTimingFunction, hover: e.matches(':hover'), active: e.matches(':active'), box: [b.x, b.y, b.width, b.height].map((v) => +v.toFixed(2)), svgs };
  });
  const tb = n.getBoundingClientRect();
  return { n: bs.length, btns, transportText: n.textContent, tbBox: { x: tb.x, y: tb.y, width: tb.width, height: tb.height }, rmMQ: matchMedia('(prefers-reduced-motion: reduce)').matches };
}
const read = (p) => p.evaluate(readBtns);
const center = async (p, i) => { const b = await p.locator(`[data-c160="${i}"]`).boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
async function away(p) { await p.mouse.move(2, 2); await sleep(400); }
async function hoverRead(p, i) { const c = await center(p, i); await p.mouse.move(c.x, c.y, { steps: 3 }); await sleep(450); const r = (await read(p)).btns[i]; await away(p); return r; }
async function pressRead(p, i) { const c = await center(p, i); await p.mouse.move(c.x, c.y, { steps: 3 }); await sleep(250); await p.mouse.down(); await sleep(450); const r = (await read(p)).btns[i]; await p.mouse.move(2, 2, { steps: 3 }); await sleep(80); await p.mouse.up(); await sleep(350); await L.blur(p); return r; }
const rec = (b) => b && { key: b.key, disabled: b.disabled, bg: b.bg, border: b.bt, color: b.color, hover: b.hover, active: b.active };
async function axOf(p, i) {
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('DOM.enable'); await cdp.send('Accessibility.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `[data-c160="${i}"]` });
  const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
  await cdp.detach(); const nd = nodes[0]; return { role: nd.role && nd.role.value, name: nd.name && nd.name.value };
}
const EXP = { back: ['lucide-arrow-left-to-line', 12, '2'], undo: ['lucide-undo-2', 12, '2'], redo: ['lucide-redo-2', 12, '2'], split: ['lucide-scissors', 12, '2'], del: ['lucide-delete', 20, '1.2'], loop: ['lucide-repeat', 12, '2'], zb: ['lucide-undo-2', 10, '2.4'] };
const TEXT = { back: '', undo: /^Undo(: .+)?$/, redo: /^Redo(: .+)?$/, split: 'Split', del: 'Delete', loop: 'Loop', zb: 'Zoom' };
function iconCheck(r, I) {
  const rows = {};
  for (const [k, [cls, sz, sw]] of Object.entries(EXP)) {
    const b = r.btns[I[k]]; const s = b.svgs[0]; const t = TEXT[k];
    const textOk = t instanceof RegExp ? t.test(b.text) : b.text === t;
    const ok = b.svgs.length === 1 && s.ariaHidden === 'true' && (s.cls || '').split(/\s+/).includes(cls) && Math.abs(s.w - sz) <= 0.5 && Math.abs(s.h - sz) <= 0.5 && s.swAttr === sw && s.stroke === b.color && textOk;
    rows[k] = { ok, nSvg: b.svgs.length, ariaHidden: s && s.ariaHidden, cls: s && s.cls, w: s && s.w, h: s && s.h, swAttr: s && s.swAttr, swCss: s && s.swCss, stroke: s && s.stroke, color: b.color, text: b.text, textOk, disabled: b.disabled, btnBox: b.box, iconFirst: s && s.beforeLabel };
  }
  const glyphs = /[↤↶↷✂⌫↻↩]/.test(r.transportText);
  const v3a = {}; for (const k of ['play', 'zr']) { const b = r.btns[I[k]]; v3a[k] = { nSvg: b.svgs.length, w: b.svgs[0] && b.svgs[0].w, h: b.svgs[0] && b.svgs[0].h, sw: b.svgs[0] && b.svgs[0].swAttr, ok: b.svgs.length === 1 && b.svgs[0].w === 16 && b.svgs[0].h === 16 && b.svgs[0].swAttr === '1.5' }; }
  const noSvg = {}; for (const k of ['follow', 'fit']) noSvg[k] = { nSvg: r.btns[I[k]].svgs.length, text: r.btns[I[k]].text };
  return { rows, allOk: Object.values(rows).every((x) => x.ok) && !glyphs && Object.values(v3a).every((x) => x.ok), glyphsInTransport: glyphs, v3a, noSvg };
}
async function axAll(p, I) { const o = {}; for (const k of ['back', 'undo', 'redo', 'split', 'del', 'loop', 'zb', 'play', 'zr']) o[k] = await axOf(p, I[k]); return o; }
const zr = (p) => p.evaluate(() => document.querySelector('[data-testid=arrangement-zoom-readout]').textContent.trim());
const posText = (p) => p.evaluate(() => document.querySelector('[data-testid=arrangement-position]').textContent.trim());
const hint = (p) => p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-loop-strip]'); return s ? s.textContent.trim() : null; });
const braces = (p) => p.evaluate(() => document.querySelectorAll('[data-testid=arrangement-loop-brace]').length);
const gainVal = (p) => p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-detail-clip-gain-input]'); return e ? e.value : null; });
const activeIdx = (p) => p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-c160'));

(async () => {
  const b = await L.launch();
  try {
    const { page: p, log } = await L.openStudio(b, X.VPS[W], LBL, net, { extraInit: X.tapInit });
    await away(p); res.fontsWait = log.fontsReady;
    await sec('S0', async () => read(p));
    const B = res.S0.btns; const idx = (re) => B.findIndex((x) => re.test(x.key));
    const I = { play: 0, back: idx(/^Back to start/), undo: idx(/^Undo/), redo: idx(/^Redo/), split: idx(/^Split$/), del: idx(/^Delete/), loop: idx(/^Loop$/), follow: idx(/^Follow/), zr: B.findIndex((x) => x.cls.includes('w-8')), zb: B.findIndex((x) => x.text === 'Zoom'), fit: idx(/^Fit$/), exp: idx(/^Export$/) };
    res.I = I;
    await sec('iconIdle', async () => iconCheck(res.S0, I));
    await sec('axIdle', async () => axAll(p, I));
    await sec('braceHint', async () => ({ text: await hint(p), braces: await braces(p) }));
    await sec('shotsIdle', async () => { const o = { rest: await shot(p, 'transport-rest', res.S0.tbBox) }; return o; });
    await sec('surfIdle', async () => { const o = {}; for (const k of ['split', 'loop']) o[k] = { rest: rec(res.S0.btns[I[k]]), hover: rec(await hoverRead(p, I[k])), tp: res.S0.btns[I[k]].tp, td: res.S0.btns[I[k]].td, ttf: res.S0.btns[I[k]].ttf }; return o; });
    await sec('snap', () => L.setSnapOff(p));
    await sec('clips', async () => [await L.addAt(p, 'demo-hero-music', 'music', 0), await L.addAt(p, 'demo-stem-pulse', 'stems', 2), await L.addAt(p, 'demo-soft-impact', 'sfx', 4)].map((r) => r.status));
    await sec('table0', async () => H.brief(await H.cl(p)));
    // Playback + Back to start
    await sec('play', async () => {
      await L.blur(p); await p.keyboard.press('Home'); await sleep(300); await read(p); const ph0 = await L.posNow(p);
      await p.evaluate(() => window.__tapStart()); let c = await center(p, I.play); await p.mouse.click(c.x, c.y); await sleep(1800);
      const S = await p.evaluate(() => window.__tapStop()); const ph1 = await L.posNow(p); const ariaPlaying = (await read(p)).btns[I.play].aria;
      await L.blur(p); await p.keyboard.press('Space'); await sleep(500); const afterSpace = (await read(p)).btns[I.play].aria; const p1 = await L.posNow(p); await sleep(400); const p2 = await L.posNow(p);
      const posBefore = await posText(p);
      c = await center(p, I.back); await p.mouse.click(c.x, c.y); await sleep(400); await L.blur(p);
      const posAfter = await posText(p); const phAfter = await L.posNow(p);
      return { ph0, ph1, moved: ph1 > ph0, peak: +S.reduce((a, s) => Math.max(a, s.peak), 0).toFixed(4), nTap: S.length, ariaPlaying, afterSpace, stoppedBySpace: p2 === p1, posBefore, posAfter, phAfter, backOk: /^00:00\.000/.test(posAfter) && phAfter === 0 && posBefore !== posAfter };
    });
    // Undo / Redo via gain edit
    await sec('undoRedo', async () => {
      const music = (await H.byLane(p, 'music')).id; await L.selectClip(p, music);
      if (W === 1280) await X.openDetail(p);
      const cg = '[data-testid=arrangement-detail-clip-gain-input]'; const g0 = await gainVal(p);
      await p.click(cg, { clickCount: 3 }); await p.keyboard.press('Control+a'); await p.keyboard.type('6'); await p.keyboard.press('Enter'); await sleep(400); await L.blur(p);
      const g1 = await gainVal(p); let r = await read(p); const undoText = r.btns[I.undo].text; const undoTitle = r.btns[I.undo].title; const axUndo = await axOf(p, I.undo);
      const iconAfterEdit = iconCheck(r, I).rows.undo;
      let c = await center(p, I.undo); await p.mouse.click(c.x, c.y); await sleep(450); const g2 = await gainVal(p); r = await read(p); const redoText = r.btns[I.redo].text; const axRedo = await axOf(p, I.redo);
      c = await center(p, I.redo); await p.mouse.click(c.x, c.y); await sleep(450); const g3 = await gainVal(p); await L.blur(p);
      return { g0, g1, undoText, undoTitle, axUndo, iconAfterEdit, g2, redoText, axRedo, g3, ok: g1 !== g0 && g2 === g0 && g3 === g1 && /Undo: /.test(undoText) };
    });
    // Split at playhead on selected clip
    await sec('split', async () => {
      const before = await H.cl(p); const sfx = (await H.byLane(p, 'music')).id;
      await L.seekTo(p, 1.5); await L.selectClip(p, sfx); await L.blur(p);
      const dis = (await read(p)).btns[I.split].disabled;
      const c = await center(p, I.split); await p.mouse.click(c.x, c.y); await sleep(500);
      const after = await H.cl(p); const st = await L.status(p); await L.blur(p);
      return { disabledBefore: dis, nBefore: before.length, nAfter: after.length, before: H.brief(before), after: H.brief(after), status: st, ok: after.length === before.length + 1 };
    });
    // Delete selected clip -> gap, focus to Undo
    await sec('delete', async () => {
      const before = await H.cl(p); const tgt = (await H.byLane(p, 'sfx')).id; await L.selectClip(p, tgt);
      const r0 = await read(p); const ax = await axOf(p, I.del);
      const c = await center(p, I.del); await p.mouse.click(c.x, c.y); await sleep(500);
      const after = await H.cl(p); const st = await L.status(p); const ae = await activeIdx(p);
      const others = before.filter((x) => x.id !== tgt).map((x) => `${x.lane}@${x.start}`).sort().join(' ');
      const afterK = after.map((x) => `${x.lane}@${x.start}`).sort().join(' ');
      const r1 = await read(p); await L.blur(p);
      return { axSelected: ax, labelSelected: r0.btns[I.del].aria, nBefore: before.length, nAfter: after.length, status: st, activeIdx: ae, activeKey: ae !== null ? r1.btns[+ae].key : null, gapOk: others === afterK, ok: after.length === before.length - 1 && others === afterK && +ae === I.undo };
    });
    // Range state
    await sec('range', async () => { const hero = (await H.byLane(p, 'music')).id; const st = await X.rangeDrag(p, hero, 3, 5); await away(p); return { status: st, det: await H.range(p) }; });
    await sec('S1', async () => read(p));
    await sec('iconRange', async () => iconCheck(res.S1, I));
    await sec('axRange', async () => axAll(p, I));
    await sec('surfRange', async () => { const o = {}; for (const k of ['split', 'loop']) o[k] = { rest: rec(res.S1.btns[I[k]]), hover: rec(await hoverRead(p, I[k])), press: k === 'loop' ? null : rec(await pressRead(p, I[k])) }; o.delRest = rec(res.S1.btns[I.del]); return o; });
    await sec('shotsRange', async () => { const o = { range: await shot(p, 'transport-range', res.S0.tbBox) }; const c = await center(p, I.split); await p.mouse.move(c.x, c.y); await sleep(450); o.hoverSplit = await shot(p, 'transport-hover-split', res.S0.tbBox); await away(p); return o; });
    await sec('afterSurf', async () => ({ range: await H.range(p), table: H.brief(await H.cl(p)) }));
    // Zoom to selection + Zoom back
    await sec('zoom', async () => {
      const z0 = await zr(p); let c = await center(p, I.zr); await p.mouse.click(c.x, c.y); await sleep(600); const z1 = await zr(p);
      c = await center(p, I.zb); await p.mouse.click(c.x, c.y); await sleep(600); const z2 = await zr(p); await L.blur(p);
      return { z0, z1, z2, ok: z1 !== z0 && z2 === z0 };
    });
    // Loop on
    await sec('loopOn', async () => {
      const b0 = await braces(p);
      let c = await center(p, I.loop); await p.mouse.click(c.x, c.y); await sleep(400); await away(p); await L.blur(p);
      const r = await read(p); const rest = r.btns[I.loop]; const b1 = await braces(p); const times = await p.evaluate(() => (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent || null);
      const iconLoopOn = iconCheck(r, I).rows.loop;
      const hov = await hoverRead(p, I.loop); const pr = await pressRead(p, I.loop);
      const sh = await shot(p, 'transport-loop-on', res.S0.tbBox);
      const stripText = await hint(p);
      return { bracesBefore: b0, bracesAfter: b1, pressed: rest.pressed, times, rest: rec(rest), hover: rec(hov), press: rec(pr), pressedAfterPress: (await read(p)).btns[I.loop].pressed, iconLoopOn, stripTextLoopOn: stripText, shot: sh, ok: rest.pressed === 'true' && b1 > b0 };
    });
    await sec('net', async () => ({ fontResp: log.fontResp.map((x) => x.s), fontFail: log.fontFail, errors: log.errors, hydration: log.hydration, forbidden: log.forbidden, auth: log.authHeaders, noise: log.noise }));
    await p.context().close();
    await sec('reducedMotion', async () => {
      const o = await L.openStudio(b, X.VPS[W], `${LBL}-rm`, net, { reducedMotion: 'reduce' });
      const r = await o.page.evaluate(readBtns);
      const out = { rmMQ: r.rmMQ, fonts: o.log.fontResp.map((x) => x.s), btns: r.btns.map((x) => ({ key: x.key, tp: x.tp, td: x.td })), net: { errors: o.log.errors, hydration: o.log.hydration, forbidden: o.log.forbidden, auth: o.log.authHeaders } };
      await o.ctx.close(); return out;
    });
  } catch (e) { res.errors.push(`fatal: ${String(e.stack || e).slice(0, 800)}`); }
  res.netOk = X.netOk(net); save();
  await b.close();
  console.log(JSON.stringify({ errors: res.errors, netOk: res.netOk }, null, 1));
})();
