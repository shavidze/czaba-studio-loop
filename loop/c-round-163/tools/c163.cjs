// C round 163 — V-3c-3a: ICON-V3C3A, DOCK-STATES-BOX, FUNC-SMOKE-DOCK, PX-NET/REG-HYD. node c163.cjs <1440|1280> [label]
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const LBL = process.argv[3] || `c163-${W}`;
const LOOP = '/home/runner/czaba-project/tmp/studio-real-loop';
const net = []; const res = { vp: W, label: LBL, utc: new Date().toISOString(), errors: [], states: {}, box: {}, func: {} };
const OUTF = path.join(L.OUT, `${LBL}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const shot = async (p, name) => { const f = `${name}-${LBL}.png`; await p.screenshot({ path: path.join(L.SHOTS, f) }); return `c-round-163/shots/${f}`; };
const PROBE = JSON.parse(fs.readFileSync(path.join(LOOP, 'b-round-162/out/v3c3a-probe.json')));
const VIDEO = 'beeps-6s-h264-aac.mp4';
const IDS = { drag: 'arrangement-video-drag', expand: 'arrangement-video-expand', close: 'arrangement-video-close' };
const LUC = { drag: 'lucide-grip-vertical', expand: 'lucide-maximize-2', close: 'lucide-x' };
const EXP_TEXT = 'The video is expanded over the library. Drag it where you want; Esc or Close brings it back.';
const LIB_TEXT = 'The library opened temporarily for the expanded video; it collapses again when the video closes. Esc or Close brings it back.';

// B's v3c3a-probe.cjs measure(), verbatim.
const measure = () => {
  const root = document.querySelector('[data-testid=arrangement-video-dock]')?.closest('section') || document.querySelector('section:has([data-testid=arrangement-video-expand])') || document.body;
  const all = [...document.querySelectorAll('button,[data-testid],[role]')];
  const occ = {}; const res = [];
  for (const e of all) {
    if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
    const txt = (e.textContent || '').trim().replace(/[⠿⤢✕]/gu, '').replace(/\s+/g, ' ').slice(0, 30);
    const base = e.getAttribute('data-testid') || (e.getAttribute('aria-label') || '').slice(0, 50) || `${e.tagName.toLowerCase()}:${txt}`;
    occ[base] = (occ[base] || 0) + 1; const r = e.getBoundingClientRect(); if (!r.width && !r.height) continue;
    res.push({ k: `${base}#${occ[base]}`, x: r.x, y: r.y, w: r.width, h: r.height });
  }
  return res;
};

const iconInfo = (ids) => Object.entries(ids).map(([n, id]) => {
  const b = document.querySelector(`[data-testid=${id}]`);
  if (!b) return { n, id, present: false };
  const svgs = [...b.querySelectorAll('svg')];
  const s = svgs[0]; const br = b.getBoundingClientRect(); const bcs = getComputedStyle(b);
  const o = { n, id, present: true, nSvg: svgs.length, text: b.textContent, aria: b.getAttribute('aria-label'), title: b.getAttribute('title'), btn: [br.x, br.y, br.width, br.height].map((v) => +v.toFixed(2)), btnColor: bcs.color };
  if (s) {
    const sr = s.getBoundingClientRect(); const scs = getComputedStyle(s); const path0 = s.querySelector('path,line,circle');
    const cx = sr.x + sr.width / 2, cy = sr.y + sr.height / 2;
    const hit = document.elementFromPoint(cx, cy);
    Object.assign(o, { cls: s.getAttribute('class'), ariaHidden: s.getAttribute('aria-hidden'), strokeWidthAttr: s.getAttribute('stroke-width'), strokeAttr: s.getAttribute('stroke'), stroke: scs.stroke, svgColor: scs.color, pathStroke: path0 ? getComputedStyle(path0).stroke : null, svgBox: [sr.x, sr.y, sr.width, sr.height].map((v) => +v.toFixed(3)), dcx: +(cx - (br.x + br.width / 2)).toFixed(3), dcy: +(cy - (br.y + br.height / 2)).toFixed(3), centre: [cx, cy], hit: hit ? `${hit.tagName.toLowerCase()}<${(hit.closest('button') || {}).getAttribute ? hit.closest('button').getAttribute('data-testid') : null}` : null });
  }
  return o;
});
const dockGlyphs = () => { const sec = document.querySelector('[data-testid=arrangement-video-dock]'); const t = sec ? sec.textContent : ''; const attrs = sec ? [sec, ...sec.querySelectorAll('*')].flatMap((x) => ['aria-label', 'title'].map((a) => x.getAttribute(a)).filter((v) => v && /[⠿⤢✕]/u.test(v))) : []; return { glyphs: t.match(/[⠿⤢✕]/gu) || [], attrGlyphs: attrs, status: ((document.querySelector('[data-testid=arrangement-status]') || {}).textContent || '').trim() }; };
async function cdpFor(p) { const cdp = await p.context().newCDPSession(p); await cdp.send('DOM.enable'); await cdp.send('Accessibility.enable'); return cdp; }
async function ax(cdp, sel) {
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel });
  if (!nodeId) return null;
  const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
  const nd = nodes[0]; return { role: nd.role && nd.role.value, name: nd.name && nd.name.value };
}
const boxRect = (p) => p.evaluate(() => { const b = document.querySelector('[data-testid=arrangement-video-box]'); const r = b.getBoundingClientRect(); return { x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2), floating: b.dataset.videoFloating }; });
const svgCentre = async (p, id) => p.evaluate((id) => { const s = document.querySelector(`[data-testid=${id}] svg`); if (!s) return null; const r = s.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, id);
const active = (p) => p.evaluate(() => (document.activeElement && document.activeElement.getAttribute('data-testid')) || (document.activeElement || {}).tagName);
const gesture = (p) => p.evaluate(() => document.body.dataset.pointerGesture || null);

const PREP = {
  'D0-empty': async () => {},
  'D1-video': async (p) => { await L.loadVideo(p, VIDEO); await L.blur(p); },
  'D2-expanded': async (p) => { await L.loadVideo(p, VIDEO); await p.click('[data-testid=arrangement-video-expand]'); await sleep(600); await L.blur(p); },
};

async function iconState(p, cdp, state) {
  const ids = /D2/.test(state) ? IDS : { expand: IDS.expand };
  const icons = await p.evaluate(iconInfo, ids);
  const absent = /D2/.test(state) ? [] : await p.evaluate(() => ['arrangement-video-drag', 'arrangement-video-close'].filter((id) => document.querySelector(`[data-testid=${id}]`)));
  const names = {}; for (const [n, id] of Object.entries(ids)) names[n] = await ax(cdp, `[data-testid=${id}]`);
  const hover = {};
  for (const [n, id] of Object.entries(ids)) {
    const c = await svgCentre(p, id); await p.mouse.move(c[0], c[1]); await sleep(250);
    hover[n] = await p.evaluate((id) => { const b = document.querySelector(`[data-testid=${id}]`); const s = b.querySelector('svg'); return { btnColor: getComputedStyle(b).color, stroke: getComputedStyle(s).stroke, hovered: b.matches(':hover') }; }, id);
    await p.mouse.move(2, 2); await sleep(200);
  }
  const fg = await p.evaluate(() => { const d = document.createElement('span'); d.className = 'text-foreground'; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); const m = document.createElement('span'); m.className = 'text-muted'; document.body.appendChild(m); const mc = getComputedStyle(m).color; m.remove(); return { foreground: c, muted: mc }; });
  const glyph = await p.evaluate(dockGlyphs);
  const checks = icons.map((o) => {
    const h = hover[o.n];
    const okC = o.present && o.nSvg === 1 && o.ariaHidden === 'true' && (o.cls || '').split(/\s+/).includes(LUC[o.n]) && Math.abs(o.svgBox[2] - 10) <= 0.5 && Math.abs(o.svgBox[3] - 10) <= 0.5 && o.strokeWidthAttr === '2.4' && o.stroke === o.btnColor && o.btnColor === fg.muted && Math.abs(o.dcx) <= 0.5 && Math.abs(o.dcy) <= 0.5 && Math.abs(o.btn[2] - 24) <= 0.5 && Math.abs(o.btn[3] - 24) <= 0.5 && o.text === '' && h.hovered && h.stroke === h.btnColor && h.btnColor === fg.foreground && /^(svg|path|line|polyline|circle)<arrangement-video-/.test(o.hit || '') && o.hit.endsWith(o.id);
    return { n: o.n, ok: !!okC };
  });
  const expectNames = /D2/.test(state) ? { drag: 'Move the video (arrow keys: 16 px)', expand: 'Return the video to the compact view', close: 'Close the expanded video' } : { expand: 'Expand video' };
  const expectTitles = /D2/.test(state) ? { drag: 'Move the video', expand: 'Return the video to the compact view', close: 'Close (Esc)' } : { expand: 'Expand video' };
  const nameOk = Object.entries(expectNames).every(([n, v]) => names[n] && names[n].name === v && names[n].role === 'button');
  const titleOk = icons.every((o) => o.title === expectTitles[o.n]);
  return { icons, absent, names, hover, tokens: fg, glyph, checks, nameOk, titleOk, ok: checks.every((c) => c.ok) && nameOk && titleOk && absent.length === 0 && glyph.glyphs.length === 0 && glyph.attrGlyphs.length === 0 };
}

(async () => {
  const b = await L.launch();
  try {
    // ICON + DOCK-STATES-BOX: fresh context per state, B's exact preparation.
    for (const state of ['D0-empty', 'D1-video', 'D2-expanded']) {
      const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `${LBL}-${state}`, net);
      res.states[state] = { fonts: log.fontsReady };
      await p.mouse.move(2, 2); await sleep(300); await PREP[state](p); await p.mouse.move(2, 2); await sleep(500);
      const cur = await p.evaluate(measure);
      const base = PROBE[W].find((s) => s.state === state).before;
      const bm = new Map(base.map((x) => [x.k, x])); const cm = new Map(cur.map((x) => [x.k, x]));
      const missing = [...bm.keys()].filter((k) => !cm.has(k)); const added = [...cm.keys()].filter((k) => !bm.has(k));
      const deltas = []; let max = 0, maxK = null;
      for (const [k, a] of bm) { const c = cm.get(k); if (!c) continue; const d = [c.x - a.x, c.y - a.y, c.w - a.w, c.h - a.h].map((v) => +v.toFixed(2)); const m = Math.max(...d.map(Math.abs)); if (m > max) { max = m; maxK = k; } if (m > 0.005 || /video|status/.test(k)) deltas.push({ k, base: [a.x, a.y, a.w, a.h].map((v) => +v.toFixed(2)), cur: [c.x, c.y, c.w, c.h].map((v) => +v.toFixed(2)), d }); }
      const btns = cur.filter((x) => /^arrangement-video-(drag|expand|close)#/.test(x.k)).map((x) => ({ k: x.k, w: +x.w.toFixed(2), h: +x.h.toFixed(2), ok: Math.abs(x.w - 24) <= 0.5 && Math.abs(x.h - 24) <= 0.5 }));
      res.box[state] = { baseN: base.length, curN: cur.length, missing, added, max: +max.toFixed(2), maxK, deltas, btns, ok: missing.length === 0 && added.length === 0 && max <= 1 && btns.every((x) => x.ok) };
      const cdp = await cdpFor(p);
      res.states[state].icon = await iconState(p, cdp, state);
      res.states[state].shot = await shot(p, `icon-${state}`);
      save(); await ctx.close();
    }
    // D2-lib-opened: library collapsed before expanding.
    {
      const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `${LBL}-D2-lib-opened`, net);
      const st = { fonts: log.fontsReady };
      await L.loadVideo(p, VIDEO); await L.blur(p);
      await p.click('[data-testid=arrangement-library-collapse]'); await sleep(500);
      st.libCollapsedBefore = await p.evaluate(() => ({ aria: document.querySelector('[data-testid=arrangement-library-collapse]')?.getAttribute('aria-expanded'), w: document.querySelector('[data-testid=arrangement-library]')?.getBoundingClientRect().width }));
      await p.mouse.move(2, 2); await sleep(200);
      const c = await svgCentre(p, IDS.expand); await p.mouse.click(c[0], c[1]); await sleep(700);
      st.status = await L.status(p); st.statusOk = st.status === LIB_TEXT;
      st.floating = (await boxRect(p)).floating;
      await L.blur(p); await p.mouse.move(2, 2); await sleep(300);
      const cdp = await cdpFor(p);
      st.icon = await iconState(p, cdp, 'D2-lib-opened');
      st.shot = await shot(p, 'icon-D2-lib-opened');
      await p.keyboard.press('Escape'); await sleep(600);
      st.afterEsc = { floating: (await boxRect(p)).floating, status: await L.status(p), lib: await p.evaluate(() => document.querySelector('[data-testid=arrangement-library]')?.getBoundingClientRect().width) };
      res.states['D2-lib-opened'] = st; res.func.libOpenedSentence = { status: st.status, ok: st.statusOk && st.floating === 'true' };
      save(); await ctx.close();
    }
    // FUNC-SMOKE-DOCK on one session from D1.
    {
      const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `${LBL}-func`, net, { extraInit: X.tapInit });
      const F = res.func; F.fonts = log.fontsReady;
      await L.loadVideo(p, VIDEO); await L.blur(p); await p.mouse.move(2, 2);
      await p.evaluate(() => { window.__vids = [...document.querySelectorAll('video')]; });
      let c = await svgCentre(p, IDS.expand); await p.mouse.click(c[0], c[1]); await sleep(700);
      F.expand = await p.evaluate(() => ({ floating: document.querySelector('[data-testid=arrangement-video-box]').dataset.videoFloating, placeholder: (document.querySelector('[data-testid=arrangement-video-placeholder] span') || {}).textContent, buttons: ['drag', 'expand', 'close'].map((n) => !!document.querySelector(`[data-testid=arrangement-video-${n}]`)) }));
      F.expand.status = await L.status(p);
      F.expand.ok = F.expand.floating === 'true' && F.expand.placeholder === 'Video expanded' && F.expand.buttons.every(Boolean) && F.expand.status === EXP_TEXT;
      F.shotExpanded = await shot(p, 'func-expanded');
      // No drag from actions (before close).
      F.noDrag = [];
      for (const n of ['close', 'expand']) {
        const r0 = await boxRect(p); c = await svgCentre(p, IDS[n]);
        const hit = await p.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); return `${h.tagName.toLowerCase()}<${h.closest('button')?.getAttribute('data-testid')}`; }, c);
        await p.mouse.move(c[0], c[1]); await p.mouse.down();
        for (let i = 1; i <= 6; i++) { await p.mouse.move(c[0] + i * 10, c[1]); await sleep(30); }
        const rMid = await boxRect(p); await p.mouse.up(); await sleep(300);
        const r1 = await boxRect(p);
        F.noDrag.push({ from: n, hit, r0, rMid, r1, ok: r1.floating === 'true' && r1.x === r0.x && r1.y === r0.y && rMid.x === r0.x && rMid.y === r0.y });
        await p.mouse.move(2, 2); await sleep(150);
      }
      // Drag from GripVertical svg.
      {
        const r0 = await boxRect(p); c = await svgCentre(p, IDS.drag);
        const hit = await p.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); return `${h.tagName.toLowerCase()}<${h.closest('button')?.getAttribute('data-testid')}`; }, c);
        const dx = 100, dy = -60;
        await p.mouse.move(c[0], c[1]); await p.mouse.down(); await sleep(100);
        const focusDuring = await active(p);
        for (let i = 1; i <= 10; i++) { await p.mouse.move(c[0] + (dx * i) / 10, c[1] + (dy * i) / 10); await sleep(30); }
        await p.mouse.up(); await sleep(300);
        const r1 = await boxRect(p); const focusAfter = await active(p);
        await p.keyboard.press('ArrowRight'); await sleep(300);
        const r2 = await boxRect(p);
        F.drag = { hit, r0, r1, r2, dx, dy, focusDuring, focusAfter, moved: [+(r1.x - r0.x).toFixed(2), +(r1.y - r0.y).toFixed(2)], arrow: +(r2.x - r1.x).toFixed(2), ok: /^(svg|path|line|circle)<arrangement-video-drag$/.test(hit) && Math.abs(r1.x - r0.x - dx) <= 1 && Math.abs(r1.y - r0.y - dy) <= 1 && focusDuring === IDS.drag && focusAfter === IDS.drag && Math.abs(r2.x - r1.x - 16) <= 0.5 && r2.y === r1.y };
      }
      // Real video and audio while expanded.
      {
        await L.blur(p); await p.keyboard.press('Home'); await sleep(300);
        await p.evaluate(() => window.__tapStart());
        await p.getByRole('button', { name: 'Play', exact: true }).click();
        await sleep(400);
        const v0 = await p.evaluate(() => { const a = document.querySelector('video[data-video-role=active]'); return { ct: a.currentTime, paused: a.paused, t: performance.now() }; });
        await sleep(1000);
        const v1 = await p.evaluate(() => { const a = document.querySelector('video[data-video-role=active]'); return { ct: a.currentTime, paused: a.paused, t: performance.now() }; });
        const S = await p.evaluate(() => window.__tapStop());
        const stopBtn = p.getByRole('button', { name: 'Stop', exact: true });
        if (await stopBtn.count()) await stopBtn.first().click(); else { await L.blur(p); await p.keyboard.press('Space'); }
        await sleep(400);
        const peak = +S.reduce((a, s) => Math.max(a, s.peak), 0).toFixed(4);
        F.media = { v0, v1, adv: +(v1.ct - v0.ct).toFixed(3), wall: +((v1.t - v0.t) / 1000).toFixed(3), peak, nTap: S.length, floatingDuring: (await boxRect(p)).floating };
        F.media.ok = F.media.adv >= 0.5 && peak > 0 && F.media.floatingDuring === 'true';
      }
      // Close via X svg, focus to expand; then Esc; then Maximize2 return state.
      {
        c = await svgCentre(p, IDS.close); await p.mouse.click(c[0], c[1]); await sleep(500);
        const r = await boxRect(p); const f = await active(p);
        const sameNodes = await p.evaluate(() => { const v = [...document.querySelectorAll('video')]; return v.length === window.__vids.length && v.every((x, i) => x === window.__vids[i]); });
        F.close = { floating: r.floating, focus: f, sameNodes, status: await L.status(p), ok: r.floating === 'false' && f === IDS.expand && sameNodes };
        c = await svgCentre(p, IDS.expand); await p.mouse.click(c[0], c[1]); await sleep(500);
        const e1 = (await boxRect(p)).floating; await p.keyboard.press('Escape'); await sleep(500);
        const e2 = (await boxRect(p)).floating; const fe = await active(p);
        F.esc = { expanded: e1, after: e2, focus: fe, ok: e1 === 'true' && e2 === 'false' };
        c = await svgCentre(p, IDS.expand); await p.mouse.click(c[0], c[1]); await sleep(500);
        const m1 = (await boxRect(p)).floating; c = await svgCentre(p, IDS.expand);
        const mName = await p.evaluate(() => document.querySelector('[data-testid=arrangement-video-expand]').getAttribute('aria-label'));
        await p.mouse.click(c[0], c[1]); await sleep(500);
        const m2 = (await boxRect(p)).floating;
        const same2 = await p.evaluate(() => { const v = [...document.querySelectorAll('video')]; return v.length === window.__vids.length && v.every((x, i) => x === window.__vids[i]); });
        F.returnMax = { expanded: m1, nameInReturn: mName, after: m2, sameNodes: same2, ok: m1 === 'true' && m2 === 'false' && mName === 'Return the video to the compact view' && same2 };
        F.shotEnd = await shot(p, 'func-end');
      }
      save(); await ctx.close();
    }
  } catch (e) { res.errors.push(String(e && e.stack || e).slice(0, 800)); }
  res.net = X.netOk(net); res.netDetail = net.map((n) => ({ label: n.label, forbidden: n.forbidden.length, auth: n.authHeaders.length, hyd: n.hydration.length, errors: n.errors, noise: n.noise, fontFail: n.fontFail, fontBad: (n.fontResp || []).filter((r) => r.s !== 200).length }));
  const okStates = ['D0-empty', 'D1-video', 'D2-expanded', 'D2-lib-opened'].map((s) => [s, !!(res.states[s] && res.states[s].icon && res.states[s].icon.ok)]);
  const F = res.func;
  res.summary = { icon: okStates, box: Object.fromEntries(Object.entries(res.box).map(([k, v]) => [k, v.ok])), func: { expand: F.expand && F.expand.ok, lib: F.libOpenedSentence && F.libOpenedSentence.ok, noDrag: F.noDrag && F.noDrag.map((x) => x.ok), drag: F.drag && F.drag.ok, media: F.media && F.media.ok, close: F.close && F.close.ok, esc: F.esc && F.esc.ok, returnMax: F.returnMax && F.returnMax.ok }, net: res.net.ok, errors: res.errors.length };
  save(); await b.close();
  console.log(JSON.stringify(res.summary, null, 1));
})();
