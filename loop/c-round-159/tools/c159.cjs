// C round 158 — V-3a: SURFACE-STYLE, ICON-STYLE, CONTRAST-V3A, FUNC-SMOKE-T, OVERLOAD-CHECK. node c159.cjs <1440|1280> [label] [full=1]
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X; const C = require('./color158.cjs');
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const LBL = process.argv[3] || `c159-${W}`; const FULL = (process.argv[4] || (W === 1440 ? '1' : '0')) === '1';
const net = []; const res = { vp: W, label: LBL, utc: new Date().toISOString(), errors: [] };
const OUTF = path.join(L.OUT, `${LBL}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const sec = async (n, fn) => { try { res[n] = await fn(); } catch (e) { res.errors.push(`${n}: ${String(e.stack || e).slice(0, 700)}`); } save(); };
const shot = async (p, name, clip) => { const f = `${name}-${LBL}.png`; await p.screenshot({ path: path.join(L.SHOTS, f), ...(clip ? { clip } : {}) }); return `c-round-159/shots/${f}`; };

function readBtns() {
  const pos = document.querySelector('[data-testid=arrangement-position]');
  let n = pos; while (n && !(n.classList && n.classList.contains('flex-wrap') && n.querySelector('[data-testid=arrangement-fit]'))) n = n.parentElement;
  const bs = [...n.querySelectorAll('button')];
  const vars = {}; const rcs = getComputedStyle(n); for (const v of ['--color-foreground', '--color-background', '--color-brand', '--color-accent', '--radius-md']) vars[v] = rcs.getPropertyValue(v).trim();
  const btns = bs.map((e, i) => {
    e.setAttribute('data-c159', String(i)); const cs = getComputedStyle(e); const b = e.getBoundingClientRect();
    const svgs = [...e.querySelectorAll('svg')].map((s) => { const sb = s.getBoundingClientRect(); const sc = getComputedStyle(s); return { w: +sb.width.toFixed(2), h: +sb.height.toFixed(2), swAttr: s.getAttribute('stroke-width'), swCss: sc.strokeWidth, stroke: sc.stroke, strokeAttr: s.getAttribute('stroke'), ariaHidden: s.getAttribute('aria-hidden'), cls: s.getAttribute('class') }; });
    const chain = []; let m = e.parentElement; let k = 0; while (m && k < 14) { chain.push(getComputedStyle(m).backgroundColor); m = m.parentElement; k++; }
    return { i, key: e.getAttribute('aria-label') || e.textContent.trim(), text: e.textContent, aria: e.getAttribute('aria-label'), disabled: e.disabled, pressed: e.getAttribute('aria-pressed'), cls: e.className, bg: cs.backgroundColor, bt: cs.borderTopColor, br: cs.borderRightColor, bb: cs.borderBottomColor, bl: cs.borderLeftColor, bw: cs.borderTopWidth, rad: cs.borderTopLeftRadius, color: cs.color, opacity: cs.opacity, tp: cs.transitionProperty, td: cs.transitionDuration, ttf: cs.transitionTimingFunction, shadow: cs.boxShadow, fv: e.matches(':focus-visible'), hover: e.matches(':hover'), active: e.matches(':active'), box: [b.x, b.y, b.width, b.height].map((v) => +v.toFixed(1)), svgs, chain };
  });
  return { vars, n: bs.length, btns, transportText: n.textContent, hoverMQ: matchMedia('(hover: hover)').matches, rmMQ: matchMedia('(prefers-reduced-motion: reduce)').matches };
}

function readCtl(el) { const cs = getComputedStyle(el); return { tag: el.tagName, role: el.getAttribute('role'), aria: el.getAttribute('aria-label'), text: (el.textContent || '').trim().slice(0, 40), testid: el.getAttribute('data-testid'), matchesGlobal: el.matches('a, button, [role="button"], input, textarea, select'), tp: cs.transitionProperty, td: cs.transitionDuration, ttf: cs.transitionTimingFunction, cls: el.className && String(el.className).slice(0, 300) }; }
const read = (p) => p.evaluate(readBtns);
const center = async (p, i) => { const b = await p.locator(`[data-c159="${i}"]`).boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
async function away(p) { await p.mouse.move(2, 2); await sleep(400); }
async function hoverRead(p, i) { const c = await center(p, i); await p.mouse.move(c.x, c.y, { steps: 3 }); await sleep(450); const r = (await read(p)).btns[i]; await away(p); return r; }
async function pressRead(p, i) { const c = await center(p, i); await p.mouse.move(c.x, c.y, { steps: 3 }); await sleep(250); await p.mouse.down(); await sleep(450); const r = (await read(p)).btns[i]; await p.mouse.move(2, 2, { steps: 3 }); await sleep(80); await p.mouse.up(); await sleep(350); await L.blur(p); return r; }
const rec = (b) => b && { key: b.key, disabled: b.disabled, bg: b.bg, border: b.bt, bw: b.bw, rad: b.rad, color: b.color, opacity: b.opacity, hover: b.hover, active: b.active };
async function axOf(p, i) {
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('DOM.enable'); await cdp.send('Accessibility.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `[data-c159="${i}"]` });
  const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
  await cdp.detach(); const nd = nodes[0]; return { role: nd.role && nd.role.value, name: nd.name && nd.name.value };
}
async function pixelSample(p, i, name) {
  const b = await p.locator(`[data-c159="${i}"]`).boundingBox();
  const buf = await p.screenshot({ clip: { x: b.x, y: b.y, width: b.width, height: b.height } });
  fs.writeFileSync(path.join(L.SHOTS, `px-${name}-${LBL}.png`), buf);
  const d = await p.evaluate(async (b64) => { const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); const px = g.getImageData(0, 0, c.width, c.height).data; const cnt = new Map(); for (let k = 0; k < px.length; k += 4) { const key = `${px[k]},${px[k + 1]},${px[k + 2]}`; cnt.set(key, (cnt.get(key) || 0) + 1); } return { w: c.width, h: c.height, colors: [...cnt.entries()].sort((a, b2) => b2[1] - a[1]).slice(0, 400) }; }, buf.toString('base64'));
  // bg = most frequent colour in the interior; fg = colour with max contrast vs bg (with >= 3 px).
  const cols = d.colors.map(([k, n]) => ({ c: k.split(',').map(Number), n }));
  const bg = cols[0].c; let best = null;
  for (const x of cols) { if (x.n < 3) continue; const r = C.ratio({ r: x.c[0], g: x.c[1], b: x.c[2] }, { r: bg[0], g: bg[1], b: bg[2] }); if (!best || r > best.r) best = { r: +r.toFixed(2), c: x.c, n: x.n }; }
  return { shot: `c-round-159/shots/px-${name}-${LBL}.png`, bg, fg: best && best.c, fgPx: best && best.n, ratio: best && best.r };
}
async function tabTo(p, idxs, max = 160) {
  await L.blur(p);
  const out = {}; const want = new Set(idxs);
  for (let k = 0; k < max && want.size; k++) {
    await p.keyboard.press('Tab'); await sleep(40);
    const a = await p.evaluate(() => (document.activeElement && document.activeElement.getAttribute('data-c159')));
    if (a !== null && want.has(+a)) { const r0 = await p.evaluate((i) => { const e = document.querySelector(`[data-c159="${i}"]`); const cs = getComputedStyle(e); return { fv: e.matches(':focus-visible'), shadow: cs.boxShadow, tp: cs.transitionProperty }; }, a); await sleep(300); const r = (await read(p)).btns[+a]; out[a] = { tabs: k + 1, key: r.key, fv: r.fv, shadow: r.shadow, immediate: r0 }; want.delete(+a); }
  }
  await L.blur(p); return out;
}

(async () => {
  const b = await L.launch();
  try {
    const { page: p, log } = await L.openStudio(b, X.VPS[W], LBL, net, { extraInit: X.tapInit });
    await away(p); res.fontsWait = log.fontsReady;
    await sec('S0', async () => read(p));
    res.hoverMQ = res.S0 && res.S0.hoverMQ;
    const N = res.S0.n; const idx = (re) => res.S0.btns.findIndex((x) => re.test(x.key));
    const I = { play: 0, back: 1, undo: idx(/Undo/), redo: idx(/Redo/), split: idx(/Split/), del: idx(/Delete/), loop: idx(/Loop/), follow: idx(/^Follow/), zr: res.S0.btns.findIndex((x) => x.cls.includes('w-8')), zb: idx(/↩ Zoom/), fit: idx(/^Fit$/), exp: idx(/^Export$/) };
    res.I = I;
    await sec('S0hover', async () => { const o = {}; for (let i = 0; i < N; i++) o[i] = rec(await hoverRead(p, i)); return o; });
    await sec('S0press', async () => { const o = {}; for (let i = 0; i < N; i++) { if (res.S0.btns[i].disabled) continue; o[i] = rec(await pressRead(p, i)); } return o; });
    await sec('S0after', async () => { const r = await read(p); return { playing: r.btns[0].aria, loopPressed: r.btns[I.loop].pressed, follow: r.btns[I.follow].key }; });
    await sec('shotsS0', async () => {
      const tb = await p.evaluate(() => { const e = document.querySelector('[data-c159="0"]').parentElement.getBoundingClientRect(); return { x: e.x, y: e.y, width: e.width, height: e.height }; });
      res.tbBox = tb; const o = { rest: await shot(p, 'transport-rest', tb) };
      let c = await center(p, I.fit); await p.mouse.move(c.x, c.y); await sleep(450); o.hoverFit = await shot(p, 'transport-hover-fit', tb);
      c = await center(p, 0); await p.mouse.move(c.x, c.y); await sleep(450); o.hoverPlay = await shot(p, 'transport-hover-play', tb); await away(p);
      return o;
    });
    await sec('focusRing', async () => tabTo(p, [0, I.fit, I.exp]));
    await sec('iconPlay', async () => { const r = (await read(p)).btns; return { play: { text: r[0].text, aria: r[0].aria, svgs: r[0].svgs, color: r[0].color, ax: await axOf(p, 0) }, zr: { text: r[I.zr].text, aria: r[I.zr].aria, svgs: r[I.zr].svgs, color: r[I.zr].color, ax: await axOf(p, I.zr) }, others: r.filter((x, i) => i !== 0 && i !== I.zr).map((x) => ({ i: x.i, text: x.text, nSvg: x.svgs.length })), glyphsInTransport: /[▶❚⇔]/.test((await read(p)).transportText) }; });
    await sec('snap', () => L.setSnapOff(p));
    await sec('clips', async () => [await L.addAt(p, 'demo-hero-music', 'music', 0), await L.addAt(p, 'demo-stem-pulse', 'stems', 2), await L.addAt(p, 'demo-soft-impact', 'sfx', 4)].map((r) => r.status));
    await sec('table0', async () => H.brief(await H.cl(p)));
    await sec('play2s', async () => {
      await L.blur(p); await p.keyboard.press('Home'); await sleep(300); await read(p); const ph0 = await L.posNow(p);
      await p.evaluate(() => window.__tapStart()); const c = await center(p, 0); await p.mouse.click(c.x, c.y); await sleep(300);
      await away(p);
      const restPause = (await read(p)).btns[0];
      const hovPause = await hoverRead(p, 0);
      const prPause = await pressRead(p, 0);
      const stillPlaying = (await read(p)).btns[0].aria;
      const sh = await shot(p, 'transport-pause', res.tbBox);
      const ax = await axOf(p, 0);
      await sleep(Math.max(0, 2000 - 1600));
      const S = await p.evaluate(() => window.__tapStop()); const ph1 = await L.posNow(p);
      const c2 = await center(p, 0); await p.mouse.click(c2.x, c2.y); await sleep(400); await away(p); await L.blur(p);
      const afterClick = (await read(p)).btns[0].aria;
      await p.keyboard.press('Space'); await sleep(500); const sp1 = (await read(p)).btns[0].aria; const php1 = await L.posNow(p);
      await sleep(500); const php2 = await L.posNow(p);
      await p.keyboard.press('Space'); await sleep(500); const sp2 = (await read(p)).btns[0].aria;
      return { ph0, ph1, moved: ph1 > ph0, peak: +S.reduce((a, s) => Math.max(a, s.peak), 0).toFixed(4), nTap: S.length, pause: { rest: rec(restPause), text: restPause.text, svgs: restPause.svgs, hover: rec(hovPause), press: rec(prPause), stillPlayingAfterPress: stillPlaying, ax }, shot: sh, afterPauseClick: afterClick, space: { first: sp1, movingDuringSpacePlay: php2 > php1, second: sp2 } };
    });
    await sec('rangeBody', async () => { const hero = await H.byLane(p, 'music'); res.heroId = hero.id; const st = await X.rangeDrag(p, hero.id, 3, 5); await away(p); return { status: st, det: await H.range(p) }; });
    await sec('S1', async () => read(p));
    await sec('S1hoverPress', async () => { const o = {}; for (let i = 0; i < N; i++) { if (res.S1.btns[i].disabled) continue; o[i] = { hover: rec(await hoverRead(p, i)), press: (i === I.loop) ? null : rec(await pressRead(p, i)) }; } return o; });
    await sec('S1after', async () => { const r = await read(p); return { range: await H.range(p), play: r.btns[0].aria, loop: r.btns[I.loop].pressed }; });
    await sec('pixels', async () => { const o = {}; for (const [nm, i] of [['play', 0], ['export', I.exp], ['zoomrange', I.zr]]) { o[nm] = { rest: await pixelSample(p, i, `${nm}-rest`) }; const c = await center(p, i); await p.mouse.move(c.x, c.y); await sleep(450); o[nm].hover = await pixelSample(p, i, `${nm}-hover`); await away(p); } return o; });
    await sec('zoom', async () => {
      const zr = () => p.evaluate(() => document.querySelector('[data-testid=arrangement-zoom-readout]').textContent.trim());
      const z0 = await zr(); await L.blur(p); await p.keyboard.press('z'); await sleep(600); const zZ = await zr();
      const rangeAfterZ = await H.range(p);
      let c = await center(p, I.zb); await p.mouse.click(c.x, c.y); await sleep(600); const zBack1 = await zr(); const fa1 = await p.evaluate(() => (document.activeElement || {}).textContent);
      c = await center(p, I.zr); await p.mouse.click(c.x, c.y); await sleep(600); const zBtn = await zr();
      c = await center(p, I.zb); await p.mouse.click(c.x, c.y); await sleep(600); const zBack2 = await zr(); const fa2 = await p.evaluate(() => (document.activeElement || {}).textContent);
      await L.blur(p);
      return { z0, zZ, zBack1, zBtn, zBack2, rangeAfterZ, focusAfterZoomBack1: fa1, focusAfterZoomBack2: fa2, ok: zZ !== z0 && zBack1 === z0 && zBtn === zZ && zBack2 === z0 };
    });
    await sec('loopOn', async () => {
      let c = await center(p, I.loop); await p.mouse.click(c.x, c.y); await sleep(400); await away(p); await L.blur(p);
      const rest = (await read(p)).btns[I.loop]; const hov = await hoverRead(p, I.loop); const pr = await pressRead(p, I.loop);
      const afterPress = (await read(p)).btns[I.loop].pressed;
      const sh = await shot(p, 'transport-loop-on', res.tbBox);
      c = await center(p, I.loop); await p.mouse.click(c.x, c.y); await sleep(400); await away(p); await L.blur(p);
      const offAfter = (await read(p)).btns[I.loop].pressed;
      return { rest: rec(rest), restPressed: rest.pressed, hover: rec(hov), press: rec(pr), afterPress, shot: sh, pressedAfterSecondClick: offAfter, range: await H.range(p) };
    });
    await sec('S2contrast', async () => read(p));
    await sec('S2hover', async () => { const o = {}; for (let i = 0; i < N; i++) { if (res.S2contrast.btns[i].disabled) continue; o[i] = rec(await hoverRead(p, i)); } return o; });
    // OVERLOAD
    const ovl = async (name, scope) => {
      const r = await X.exportWav(p, log, `${LBL}-${name}`, { scope, keepOpen: true });
      const warn = await p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-export-overload]'); return e ? e.textContent : null; });
      const status = await p.evaluate(() => { const d = document.querySelector('#arrangement-export-title').closest('[role=dialog]'); return [...d.querySelectorAll('[role=status],[role=alert]')].map((e) => `${e.getAttribute('data-testid') || e.getAttribute('role')}: ${e.textContent.trim()}`); });
      const sh = await shot(p, `export-${name}`);
      // Done → focus return
      await p.locator('button', { hasText: /^Done$/ }).last().click(); await sleep(500);
      const closed = (await p.locator('#arrangement-export-title').count()) === 0; const focus = await p.evaluate(() => (document.activeElement || {}).textContent && document.activeElement.textContent.trim());
      const f = r.files[0]; const w = X.wav(f); const fmt = w.fmt; const n = w.w.n;
      let posFS = 0, negFS = 0, loose = 0; const fsMax = fmt.tag === 3 ? 1 : Math.pow(2, fmt.bits - 1);
      for (let k = 0; k < n; k++) { const v = w.w.read(k); if (fmt.tag === 3) { if (v >= 1) posFS++; if (v <= -1) negFS++; } else { if (v === fsMax - 1) posFS++; if (v === -fsMax) negFS++; } if (Math.abs(v) / fsMax >= 0.9999) loose++; }
      const m = warn && /peak \+([\d.]+) dBFS — (\d+) sample/.exec(warn);
      return { scope, file: path.relative(path.join(L.ROOT, '..'), f), recs: r.recs, fmt, frames: w.frames, seconds: w.seconds, peak: +w.peak.toFixed(6), nan: w.nan, posFS, negFS, exactFS: posFS + negFS, looseGe09999: loose, sha: w.sha, warning: warn, warnCount: m ? +m[2] : null, warnPeakDb: m ? +m[1] : null, statuses: status, shot: sh, doneClosed: closed, focusAfterDone: focus, range: await H.range(p) };
    };
    await sec('cascade', async () => {
      const lib = await p.evaluate((f) => { const fn = new Function('return ' + f)(); const lb = document.querySelector('[data-testid=arrangement-library]'); const b = lb && lb.querySelector('button'); return b ? fn(b) : null; }, readCtl.toString());
      const mute = await p.evaluate((f) => { const fn = new Function('return ' + f)(); const b = document.querySelector('button[aria-label^="Mute — "]'); return b ? fn(b) : null; }, readCtl.toString());
      await L.blur(p); const c = await center(p, I.exp); await p.mouse.click(c.x, c.y); await p.waitForSelector('#arrangement-export-title', { timeout: 10000 }); await sleep(500);
      const done = await p.evaluate((f) => { const fn = new Function('return ' + f)(); const d = document.querySelector('#arrangement-export-title').closest('[role=dialog]'); const b = [...d.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Done'); return b ? fn(b) : null; }, readCtl.toString());
      const sh = await shot(p, 'export-idle-done');
      const db = p.locator('[role=dialog] button', { hasText: /^Done$/ }).last(); await db.click(); await sleep(500);
      const closed = (await p.locator('#arrangement-export-title').count()) === 0; const focus = await p.evaluate(() => document.activeElement && document.activeElement.textContent.trim());
      return { lib, mute, done, shot: sh, doneClosed: closed, focusAfterDone: focus };
    });
    await sec('ovlRange', () => ovl('range', 'range'));
    if (FULL) await sec('ovlProject', () => ovl('project', 'project'));
    await sec('exportEsc', async () => {
      await L.blur(p); const c = await center(p, I.exp); await p.mouse.click(c.x, c.y); await p.waitForSelector('#arrangement-export-title', { timeout: 10000 }); await sleep(400);
      await p.keyboard.press('Escape'); await sleep(500);
      return { closed: (await p.locator('#arrangement-export-title').count()) === 0, focus: await p.evaluate(() => document.activeElement && document.activeElement.textContent.trim()) };
    });
    await sec('undoHandoff', async () => {
      const steps = [];
      for (let k = 0; k < 20; k++) {
        const r = (await read(p)).btns; if (r[I.undo].disabled) break;
        const c = await center(p, I.undo); await p.mouse.click(c.x, c.y); await sleep(450);
        const r2 = (await read(p)).btns; const ae = await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-c159'));
        steps.push({ k, undoDisabled: r2[I.undo].disabled, active: ae, activeKey: ae !== null ? r2[+ae].key : null });
      }
      const last = steps[steps.length - 1];
      return { steps, handoffToRedo: !!last && last.undoDisabled && +last.active === I.redo };
    });
    await sec('net', async () => ({ fontResp: log.fontResp.map((x) => x.s), fontFail: log.fontFail, errors: log.errors, hydration: log.hydration, forbidden: log.forbidden, auth: log.authHeaders, noise: log.noise }));
    await p.context().close();
    // Reduced-motion session
    await sec('reducedMotion', async () => {
      const o = await L.openStudio(b, X.VPS[W], `${LBL}-rm`, net, { reducedMotion: 'reduce' });
      const r = await o.page.evaluate(readBtns);
      const out = { rmMQ: r.rmMQ, fonts: o.log.fontResp.map((x) => x.s), btns: r.btns.map((x) => ({ key: x.key, tp: x.tp, td: x.td, ttf: x.ttf })), net: { errors: o.log.errors, hydration: o.log.hydration, forbidden: o.log.forbidden, auth: o.log.authHeaders } };
      await o.ctx.close(); return out;
    });
  } catch (e) { res.errors.push(`fatal: ${String(e.stack || e).slice(0, 800)}`); }
  res.netOk = X.netOk(net); save();
  await b.close();
  console.log(JSON.stringify({ errors: res.errors, netOk: res.netOk }, null, 1));
})();
