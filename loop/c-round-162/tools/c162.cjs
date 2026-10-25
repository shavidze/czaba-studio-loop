// C round 162 — V-3c-2: ICON-V3C2, LANE-STATES-BOX, FUNC-SMOKE-LANE, PX-NET. node c162.cjs <1440|1280> [label]
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const LBL = process.argv[3] || `c162-${W}`;
const LOOP = '/home/runner/czaba-project/tmp/studio-real-loop';
const net = []; const res = { vp: W, label: LBL, utc: new Date().toISOString(), errors: [], states: {} };
const OUTF = path.join(L.OUT, `${LBL}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const shotFull = async (p, name) => { const f = `${name}-${LBL}.png`; await p.screenshot({ path: path.join(L.SHOTS, f) }); return `c-round-162/shots/${f}`; };
const BASE = JSON.parse(fs.readFileSync(path.join(LOOP, 'b-round-161/out/v3c2-probe-final.json')));

// B's v3c2-probe-final.cjs measure(), verbatim.
const measure = () => {
  const root = document.querySelector('.studio-container') || document.body;
  const sel = 'button,input,[role],[data-testid],[data-clip-id],[data-track-id],[data-group-id]';
  const extra = [...root.querySelectorAll('[data-testid=arrangement-track-header] *, [data-testid=arrangement-group-header] *, [data-clip-id] > div, [data-clip-id] > div > *')];
  const els = new Set([...root.querySelectorAll(sel), ...extra]);
  const occ = {}; const res = [];
  for (const e of els) {
    if (e.closest('svg') && e.tagName.toLowerCase() !== 'svg') continue;
    if (e.matches('svg[data-probe]')) continue;
    const c = e.closest('[data-track-id],[data-group-id],[data-clip-id]');
    const ctx = c && c !== e ? (c.dataset.clipId ? `clip@${c.dataset.clipStart}` : c.dataset.groupId ? 'group' : `track:${c.dataset.trackId}`) : '';
    const txt = (e.textContent || '').trim().replace(/[▶◀×▾▸■＋⌫▣⠿]/gu, '').replace(/\s+/g, ' ').slice(0, 30);
    const base = e.getAttribute('data-testid') || (e.getAttribute('aria-label') || '').replace(/[＋]\s?/u, '').slice(0, 50) || `${e.tagName.toLowerCase()}:${txt}`;
    const k0 = `${base}|${ctx}`; occ[k0] = (occ[k0] || 0) + 1;
    const r = e.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    res.push({ k: `${k0}#${occ[k0]}`, x: r.x, y: r.y, w: r.width, h: r.height });
  }
  return res;
};
// Re-key the video row / header boxes by attribute (task: they lose the leading space in their text keys).
const videoBoxes = () => { const row = document.querySelector('[data-track-id=video]'); const h = row && row.querySelector('[data-testid=arrangement-track-header]'); const bx = (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }; return { row: row ? bx(row) : null, header: h ? bx(h) : null }; };

async function buildS1(p) {
  await L.setSnapOff(p);
  await L.addAt(p, 'demo-hero-music', 'music', 0);
  await L.addAt(p, 'demo-stem-pulse', 'stems', 2);
  await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
  await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150);
  await X.key(p, 'Control+g');
  await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
}

function icons() {
  const q = (s) => [...document.querySelectorAll(s)];
  const hosts = [
    ...q('[data-testid=arrangement-track-fold]').map((e) => ['laneFold', e]),
    ...q('[data-track-id=video] [data-testid=arrangement-track-header] button').filter((b) => b.querySelector('svg.lucide-plus')).map((e) => [e.textContent.trim() === '' ? 'importCompact' : 'importFull', e]),
    ...q('[data-testid=arrangement-group-fold]').map((e) => ['groupFold', e]),
    ...q('[data-testid=arrangement-group-name]').map((e) => ['groupName', e]),
    ...q('[data-clip-id] > div:first-child').map((e) => [`clip-${e.parentElement.dataset.clipKind}`, e]),
  ];
  return hosts.map(([kind, e], i) => {
    e.setAttribute('data-c162', `${kind}-${i}`);
    const hb = e.getBoundingClientRect(); const hcs = getComputedStyle(e);
    const tr = e.closest('[data-track-id]'); const cl = e.closest('[data-clip-id]');
    const svgs = [...e.querySelectorAll('svg')].map((s) => { const b = s.getBoundingClientRect(); const cs = getComputedStyle(s); return { cls: s.getAttribute('class'), ariaHidden: s.getAttribute('aria-hidden'), w: +b.width.toFixed(3), h: +b.height.toFixed(3), cx: b.x + b.width / 2, cy: b.y + b.height / 2, swAttr: s.getAttribute('stroke-width'), swCss: cs.strokeWidth, stroke: cs.stroke, svgColor: cs.color, dcx: +((b.x + b.width / 2) - (hb.x + hb.width / 2)).toFixed(3), dcy: +((b.y + b.height / 2) - (hb.y + hb.height / 2)).toFixed(3), firstChild: e.firstElementChild === s, nextText: s.nextElementSibling ? s.nextElementSibling.textContent : null }; });
    const textNodes = []; const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); while (tw.nextNode()) textNodes.push(tw.currentNode.textContent);
    return { kind, sel: `[data-c162="${kind}-${i}"]`, track: tr ? tr.dataset.trackId : null, clipStart: cl ? cl.dataset.clipStart : null, text: e.textContent, textNodes, aria: e.getAttribute('aria-label'), title: e.getAttribute('title'), expanded: e.getAttribute('aria-expanded'), color: hcs.color, cls: e.className, box: [hb.x, hb.y, hb.width, hb.height].map((v) => +v.toFixed(2)), svgs };
  });
}
const GL = /[▶◀×▾▸■＋⌫▣⠿]/gu;
const glyphScan = () => { const out = {}; for (const [n, s] of [['trackHeaders', '[data-testid=arrangement-track-header]'], ['groupHeaders', '[data-testid=arrangement-group-header]'], ['clips', '[data-clip-id]']]) { const els = [...document.querySelectorAll(s)]; out[n] = { n: els.length, glyphs: els.flatMap((e) => (e.textContent.match(/[▶◀×▾▸■＋⌫▣⠿]/gu) || [])), attrGlyphs: els.flatMap((e) => [e, ...e.querySelectorAll('*')].flatMap((x) => ['aria-label', 'title'].map((a) => x.getAttribute(a)).filter((v) => v && /[▶◀×▾▸■＋⌫▣⠿]/u.test(v)))) }; } const ph = document.querySelector('[data-testid=arrangement-video-dropzone] p'); out.placeholder = ph ? ph.textContent : null; return out; };
async function cdpFor(p) { const cdp = await p.context().newCDPSession(p); await cdp.send('DOM.enable'); await cdp.send('Accessibility.enable'); await cdp.send('CSS.enable'); return cdp; }
async function ax(cdp, sel) {
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel });
  if (!nodeId) return null;
  const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
  const nd = nodes[0]; return { role: nd.role && nd.role.value, name: nd.name && nd.name.value };
}
async function fonts(cdp, sel) {
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel });
  if (!nodeId) return null;
  const r = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
  return r.fonts;
}
async function iconState(p, name) {
  const ic = await p.evaluate(icons);
  const cdp = await cdpFor(p);
  for (const h of ic) { h.ax = await ax(cdp, h.sel); }
  const gn = ic.find((h) => h.kind === 'groupName');
  const gnFonts = gn ? await fonts(cdp, gn.sel) : null;
  const gnSpanFonts = gn ? await fonts(cdp, `${gn.sel} span`) : null;
  await cdp.detach();
  const hov = [];
  for (const h of ic.filter((x) => ['laneFold', 'groupFold', 'importFull', 'importCompact'].includes(x.kind))) {
    const sv = h.svgs[0]; if (!sv) continue;
    await p.mouse.move(sv.cx, sv.cy, { steps: 2 }); await sleep(300);
    const r = await p.evaluate((s) => { const e = document.querySelector(s); const sv = e.querySelector('svg'); return { color: getComputedStyle(e).color, stroke: sv ? getComputedStyle(sv).stroke : null }; }, h.sel);
    const efp = await p.evaluate(([s, x, y]) => { const e = document.elementFromPoint(x, y); return e ? { inHost: document.querySelector(s).contains(e), tag: e.tagName } : null; }, [h.sel, sv.cx, sv.cy]);
    hov.push({ kind: h.kind, track: h.track, restColor: h.color, restStroke: sv.stroke, hit: efp, hover: r });
    await p.mouse.move(2, 2); await sleep(200);
  }
  return { icons: ic, hover: hov, scan: await p.evaluate(glyphScan), groupNameFonts: gnFonts, groupNameSpanFonts: gnSpanFonts, shot: await shotFull(p, `lane-${name}`) };
}
const tokens = (p) => p.evaluate(() => { const probe = (cls) => { const d = document.createElement('span'); d.className = cls; document.querySelector('.studio-container').appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }; return { muted: probe('text-muted'), foreground: probe('text-foreground'), brand: probe('text-brand'), brandFg: probe('text-brand-foreground') }; });

function compare(before, after, vbNow) {
  const bm = new Map(before.map((e) => [e.k, e])); const am = new Map(after.map((e) => [e.k, e]));
  const RN = { 'button: Your own video|track:video#1': 'button:Your own video|track:video#1' };
  const rows = []; const missing = []; const added = [];
  for (const [k, b] of bm) {
    const nk = RN[k] || k; const a = am.get(nk);
    if (!a) { missing.push(k); continue; }
    rows.push({ k, nk: nk !== k ? nk : undefined, dx: a.x - b.x, dy: a.y - b.y, dw: a.w - b.w, dh: a.h - b.h, b: [b.x, b.y, b.w, b.h], a: [a.x, a.y, a.w, a.h] });
  }
  const used = new Set([...bm.keys()].map((k) => RN[k] || k));
  for (const k of am.keys()) if (!used.has(k)) added.push(k);
  for (const r of rows) r.max = Math.max(Math.abs(r.dx), Math.abs(r.dy), Math.abs(r.dx + r.dw), Math.abs(r.dy + r.dh));
  return { rows, missing, added };
}

(async () => {
  const b = await L.launch();
  try {
    const STATES = [
      ['S0', async () => {}],
      ['S0-folded', async (p) => { await p.click('[data-track-id=music] [data-testid=arrangement-track-fold]'); await p.click('[data-track-id=video] [data-testid=arrangement-track-fold]'); await sleep(400); await L.blur(p); await p.mouse.move(2, 2); }],
      ['S1', async (p) => { await buildS1(p); }],
      ['S1-group-collapsed', async (p) => { await buildS1(p); await p.click('[data-testid=arrangement-group-fold]'); await sleep(400); await L.blur(p); await p.mouse.move(2, 2); }],
    ];
    for (const [name, prep] of STATES) {
      const { ctx, page: p, log } = await L.openStudio(b, X.VPS[W], `${LBL}-${name}`, net);
      try {
        await p.mouse.move(2, 2); await sleep(300);
        await prep(p); await sleep(400);
        const after = await p.evaluate(measure);
        const baseRow = BASE[W].find((r) => r.state === name);
        const cmp = compare(baseRow.before, after);
        // video row/header by attribute vs the baseline text keys
        const vb = await p.evaluate(videoBoxes);
        const bRow = baseRow.before.find((e) => /^div:Video Your own video/.test(e.k) && /\|#1$/.test(e.k));
        const bHdr = baseRow.before.find((e) => /^div:Video Your own video/.test(e.k) && /\|track:video#1$/.test(e.k));
        const dlt = (a, bb) => (a && bb ? { b: [bb.x, bb.y, bb.w, bb.h], a: [a.x, a.y, a.w, a.h], max: Math.max(Math.abs(a.x - bb.x), Math.abs(a.y - bb.y), Math.abs(a.w - bb.w), Math.abs(a.h - bb.h)) } : { missingRef: !bb, missingCur: !a });
        const st = { curList: after, n: after.length, baseN: baseRow.before.length, cmp, videoRow: { baseKey: bRow && bRow.k, ...dlt(vb.row, bRow) }, videoHeader: { baseKey: bHdr && bHdr.k, ...dlt(vb.header, bHdr) }, fontsReady: log.fontsReady, fontBad: log.fontResp.filter((r) => r.s !== 200).length, fontFail: log.fontFail.length };
        st.tokens = await tokens(p);
        st.icon = await iconState(p, name);
        if (name === 'S1') {
          // selected clip: brand-foreground stroke
          const hero = (await L.clipsDom(p)).find((c) => c.lane === 'sfx');
          await L.selectClip(p, hero.id); await p.mouse.move(2, 2); await sleep(300);
          st.selectedClip = await p.evaluate((id) => { const h = document.querySelector(`[data-clip-id="${id}"] > div`); const s = h.querySelector('svg'); return { cls: h.className.includes('bg-brand'), hostColor: getComputedStyle(h).color, stroke: getComputedStyle(s).stroke, svg: s.getAttribute('class') }; }, hero.id);
          st.selectedShot = await shotFull(p, 'lane-S1-selected');
          await p.keyboard.press('Escape'); await sleep(200);
        }
        res.states[name] = st;
      } catch (e) { res.errors.push(`${name}: ${String(e.stack || e).slice(0, 600)}`); }
      save(); await ctx.close();
    }

    // ---- FUNC-SMOKE-LANE
    const { page: p } = await L.openStudio(b, X.VPS[W], `${LBL}-func`, net, { extraInit: X.tapInit });
    const F = {}; res.func = F;
    const sec = async (n, fn) => { try { F[n] = await fn(); } catch (e) { res.errors.push(`func ${n}: ${String(e.stack || e).slice(0, 600)}`); } save(); };
    const svgC = (sel) => p.evaluate((s) => { const e = document.querySelector(s); const v = e && e.querySelector('svg'); if (!v) return null; const r = v.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, cls: v.getAttribute('class') }; }, sel);
    const hitAt = (sel, c) => p.evaluate(([s, x, y]) => { const e = document.elementFromPoint(x, y); const h = document.querySelector(s); return { tag: e && e.tagName, inSvg: !!(e && e.closest('svg') && h.contains(e)) }; }, [sel, c.x, c.y]);
    const rowH = (t) => p.evaluate((t) => document.querySelector(`[data-track-id=${t}]`).getBoundingClientRect().height, t);
    const MF = '[data-track-id=music] [data-testid=arrangement-track-fold]';
    const VF = '[data-track-id=video] [data-testid=arrangement-track-fold]';
    const foldSt = async (sel) => p.evaluate((s) => { const e = document.querySelector(s); return { exp: e.getAttribute('aria-expanded'), svg: e.querySelector('svg').getAttribute('class') }; }, sel);
    const playing = () => p.evaluate(() => !![...document.querySelectorAll('button[aria-label]')].find((x) => x.getAttribute('aria-label') === 'Pause'));
    await sec('laneFold', async () => {
      const h0 = await rowH('music'); const s0 = await foldSt(MF); const c = await svgC(MF); const hit = await hitAt(MF, c);
      await p.mouse.click(c.x, c.y); await sleep(400); const h1 = await rowH('music'); const s1 = await foldSt(MF);
      const c2 = await svgC(MF); await p.mouse.click(c2.x, c2.y); await sleep(400); const h2 = await rowH('music'); const s2 = await foldSt(MF);
      await p.focus(MF); await p.keyboard.press('Space'); await sleep(400); const h3 = await rowH('music'); const s3 = await foldSt(MF); const pl3 = await playing();
      await p.keyboard.press('Space'); await sleep(400); const h4 = await rowH('music'); const s4 = await foldSt(MF); const pl4 = await playing();
      await L.blur(p);
      return { hit, h0, h1, h2, h3, h4, s0, s1, s2, s3, s4, playingAfterSpace: [pl3, pl4], ok: hit.inSvg && h1 < h0 && s1.exp === 'false' && /chevron-right/.test(s1.svg) && h2 === h0 && s2.exp === 'true' && /chevron-down/.test(s2.svg) && h3 < h0 && s3.exp === 'false' && h4 === h0 && s4.exp === 'true' && !pl3 && !pl4 };
    });
    const vclips = () => p.evaluate(() => [...document.querySelectorAll('[data-clip-kind=video]')].map((e) => ({ start: +e.dataset.clipStart, w: e.getBoundingClientRect().width })));
    const importVia = async (label) => {
      const sel = '[data-track-id=video] [data-testid=arrangement-track-header] button:has(svg.lucide-plus)';
      const info = await p.evaluate((s) => { const e = document.querySelector(s); return { text: e.textContent, aria: e.getAttribute('aria-label') }; }, sel);
      const c = await svgC(sel); const hit = await hitAt(sel, c);
      const n0 = (await vclips()).length;
      const [fc] = await Promise.all([p.waitForEvent('filechooser', { timeout: 8000 }), p.mouse.click(c.x, c.y)]);
      await fc.setFiles(L.MEDIA + 'beeps-6s-h264-aac.mp4');
      await p.waitForFunction((n) => document.querySelectorAll('[data-clip-kind=video]').length > n, n0, { timeout: 30000 }); await sleep(2500);
      const g = await L.geo(p); const v = await vclips();
      return { label, info, hit, multiple: fc.isMultiple(), n0, n1: v.length, clips: v.map((x) => ({ start: x.start, dur: +(x.w / g.pps).toFixed(3) })), status: await L.status(p) };
    };
    await sec('importCompact', async () => {
      await p.click(VF); await sleep(400); await L.blur(p); await p.mouse.move(2, 2);
      const r = await importVia('compact');
      await L.blur(p); await p.keyboard.press('Control+z'); await sleep(600); r.afterUndo = (await vclips()).length;
      await p.click(VF); await sleep(400); await L.blur(p); await p.mouse.move(2, 2);
      r.ok = r.info.text === '' && r.hit.inSvg && r.n1 === r.n0 + 1 && Math.abs(r.clips[r.clips.length - 1].dur - 6) < 0.15;
      return r;
    });
    await sec('importFull', async () => {
      const r = await importVia('full');
      r.ok = r.info.text === 'Your own video' && r.hit.inSvg && r.n1 === r.n0 + 1 && Math.abs(r.clips[r.clips.length - 1].dur - 6) < 0.15;
      return r;
    });
    await sec('setup', async () => {
      await L.setSnapOff(p);
      const a = [await L.addAt(p, 'demo-hero-music', 'music', 0), await L.addAt(p, 'demo-stem-pulse', 'stems', 2), await L.addAt(p, 'demo-soft-impact', 'sfx', 4)];
      await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150);
      const g = await X.key(p, 'Control+g'); await L.blur(p); await p.mouse.move(2, 2); await sleep(300);
      return { adds: a.map((x) => x.status), group: g, clips: await L.clipsDom(p) };
    });
    const GF = '[data-testid=arrangement-group-fold]'; const GN = '[data-testid=arrangement-group-name]';
    const grpSt = () => p.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-group-fold]'); const vis = (t) => { const e = document.querySelector(`[data-track-id=${t}]`); return !!(e && e.getClientRects().length && e.getBoundingClientRect().height > 0); }; return { exp: f.getAttribute('aria-expanded'), svg: f.querySelector('svg').getAttribute('class'), musicVis: vis('music'), stemsVis: vis('stems'), overview: !!document.querySelector('[data-testid=arrangement-group-overview]'), name: document.querySelector('[data-testid=arrangement-group-name]').getAttribute('aria-label') }; });
    await sec('groupFold', async () => {
      const s0 = await grpSt(); const c = await svgC(GF); const hit = await hitAt(GF, c);
      await p.mouse.click(c.x, c.y); await sleep(500); const s1 = await grpSt();
      const c2 = await svgC(GF); await p.mouse.click(c2.x, c2.y); await sleep(500); const s2 = await grpSt();
      await L.blur(p);
      return { hit, s0, s1, s2, ok: hit.inSvg && s0.exp === 'true' && s0.musicVis && !s0.overview && s1.exp === 'false' && !s1.musicVis && !s1.stemsVis && s1.overview && /chevron-right/.test(s1.svg) && s2.exp === 'true' && s2.musicVis && !s2.overview && /chevron-down/.test(s2.svg) };
    });
    await sec('groupName', async () => {
      const pre = await grpSt(); await p.click(L.nameSel('sfx')); await sleep(300); await L.blur(p); await p.mouse.move(2, 2);
      const s0 = await grpSt(); const c = await svgC(GN); const hit = await hitAt(GN, c);
      await p.mouse.click(c.x, c.y); await sleep(400); const s1 = await grpSt();
      await L.blur(p); await p.keyboard.press('u'); await sleep(500); const s2 = await grpSt();
      await L.blur(p); await p.keyboard.press('u'); await sleep(500); const s3 = await grpSt();
      return { preSelectedAfterCtrlG: pre.name, hit, s0: s0.name, s1: s1.name, uCollapse: s2, uExpand: s3, ok: hit.inSvg && !/selected/i.test(s0.name) && /selected/i.test(s1.name) && s2.exp === 'false' && s3.exp === 'true' };
    });
    const dragFromSvg = async (id, dt) => {
      const sel = `[data-clip-id="${id}"] > div:first-child`;
      const c = await svgC(sel); const hit = await hitAt(sel, c); const g = await L.geo(p);
      const start0 = +(await p.getAttribute(`[data-clip-id="${id}"]`, 'data-clip-start'));
      const u0 = await X.undoTitle(p);
      await p.mouse.move(c.x, c.y); await p.mouse.down(); await p.mouse.move(c.x + dt * g.pps / 2, c.y, { steps: 8 }); await p.mouse.move(c.x + dt * g.pps, c.y, { steps: 8 }); await sleep(150); await p.mouse.up(); await sleep(500);
      const start1 = +(await p.getAttribute(`[data-clip-id="${id}"]`, 'data-clip-start')); const u1 = await X.undoTitle(p); const st = await L.status(p);
      await L.blur(p); await p.keyboard.press('Control+z'); await sleep(500);
      const start2 = +(await p.getAttribute(`[data-clip-id="${id}"]`, 'data-clip-start')); const u2 = await X.undoTitle(p);
      await p.keyboard.press('Control+Shift+z'); await sleep(500);
      const start3 = +(await p.getAttribute(`[data-clip-id="${id}"]`, 'data-clip-start'));
      const errPx = Math.abs((start1 - start0) - dt) * g.pps;
      return { svg: c.cls, hit, pps: g.pps, dt, start0, start1, errPx: +errPx.toFixed(3), status: st, u0, u1, start2, u2, start3, ok: hit.inSvg && errPx <= 1 && Math.abs(start2 - start0) < 0.0005 && Math.abs(start3 - start1) < 0.0005 && u0 === u2 && /^Undo: Move clip/.test(u1) };
    };
    await sec('moveGrip', async () => { await L.setSnapOff(p); const c = (await L.clipsDom(p)).find((x) => x.lane === 'sfx'); return dragFromSvg(c.id, 1.5); });
    await sec('moveFilm', async () => { await L.setSnapOff(p); const c = (await L.clipsDom(p)).find((x) => x.kind === 'video'); return dragFromSvg(c.id, 1); });
    await sec('play', async () => {
      await L.blur(p); await p.keyboard.press('Home'); await sleep(300);
      await p.evaluate(() => window.__tapStart()); await p.getByRole('button', { name: 'Play', exact: true }).click(); await sleep(2500);
      const S = await p.evaluate(() => window.__tapStop()); const pos = await L.posNow(p);
      await p.getByRole('button', { name: 'Pause', exact: true }).click().catch(() => {}); await sleep(300);
      const peak = +S.reduce((a, s) => Math.max(a, s.peak), 0).toFixed(4);
      return { peak, n: S.length, pos, ok: peak > 0 && pos > 1 };
    });
    F.shot = await shotFull(p, 'func-end');
  } catch (e) { res.errors.push(String(e.stack || e).slice(0, 800)); }
  res.net = X.netOk(net); res.fonts = net.map((n) => ({ l: n.label, ready: n.fontsReady && n.fontsReady.ok, bad: (n.fontResp || []).filter((r) => r.s !== 200).length, fail: (n.fontFail || []).length, n: (n.fontResp || []).length }));
  save(); await b.close();
  console.log(JSON.stringify({ errors: res.errors, net: res.net, fonts: res.fonts, func: Object.fromEntries(Object.entries(res.func || {}).map(([k, v]) => [k, v && v.ok !== undefined ? v.ok : v])) }, null, 1));
})();
