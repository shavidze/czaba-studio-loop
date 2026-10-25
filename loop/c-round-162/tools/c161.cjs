// C round 161 — V-3c-1: ICON-V3C1, LIB-STATES-BOX, FUNC-SMOKE-LIB, READY-STATUS, PX-NET. node c161.cjs <1440|1280> [label]
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const LBL = process.argv[3] || `c161-${W}`;
const net = []; const res = { vp: W, label: LBL, utc: new Date().toISOString(), errors: [], states: {} };
const OUTF = path.join(L.OUT, `${LBL}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const shot = async (p, name) => { const f = `${name}-${LBL}.png`; const vp = p.viewportSize(); await p.screenshot({ path: path.join(L.SHOTS, f), clip: { x: 0, y: 50, width: 320, height: vp.height - 50 } }); return `c-round-161/shots/${f}`; };
const shotFull = async (p, name) => { const f = `${name}-${LBL}.png`; await p.screenshot({ path: path.join(L.SHOTS, f) }); return `c-round-161/shots/${f}`; };

// B's lib-icon-probe.cjs measure(), verbatim.
const measure = () => {
  const lib = document.querySelector('[data-testid="arrangement-library"]');
  const els = [lib, ...lib.querySelectorAll('button,input,[role],[data-testid],h2,p,nav')];
  const occ = {};
  return els.map((e) => {
    const base = e.getAttribute('data-testid') || e.getAttribute('aria-label') || `${e.tagName.toLowerCase()}:${(e.textContent || '').trim().slice(0, 20)}`;
    occ[base] = (occ[base] || 0) + 1;
    const r = e.getBoundingClientRect();
    return { k: `${base}#${occ[base]}`, x: r.x, y: r.y, w: r.width, h: r.height };
  });
};

function icons() {
  const q = (s) => [...document.querySelectorAll(s)];
  const prev = document.querySelector('[data-testid=arrangement-library-preview]');
  const hosts = [
    ...q('[data-testid=arrangement-library-collapse]').map((e) => ['collapse', e]),
    ...q('[data-testid=arrangement-library-expand]').map((e) => ['expand', e]),
    ...q('[data-testid=arrangement-library-search-clear]').map((e) => ['clear', e]),
    ...q('[data-testid=arrangement-library-tree] button[aria-expanded]').map((e) => ['fold', e]),
    ...q('[data-testid=arrangement-library-preview-toggle]').map((e) => ['toggle', e]),
    ...(prev ? [...prev.querySelectorAll('button')].filter((b) => b.textContent.trim() === 'Add').map((e) => ['add', e]) : []),
    ...q('[data-testid=arrangement-library-option-previewing]').map((e) => ['marker', e]),
  ];
  return hosts.map(([kind, e], i) => {
    e.setAttribute('data-c161', `${kind}-${i}`);
    const hb = e.getBoundingClientRect(); const hcs = getComputedStyle(e);
    const svgs = [...e.querySelectorAll('svg')].map((s) => { const b = s.getBoundingClientRect(); const cs = getComputedStyle(s); return { cls: s.getAttribute('class'), ariaHidden: s.getAttribute('aria-hidden'), w: +b.width.toFixed(3), h: +b.height.toFixed(3), swAttr: s.getAttribute('stroke-width'), swCss: cs.strokeWidth, stroke: cs.stroke, svgColor: cs.color, dcx: +((b.x + b.width / 2) - (hb.x + hb.width / 2)).toFixed(3), dcy: +((b.y + b.height / 2) - (hb.y + hb.height / 2)).toFixed(3), firstChild: e.firstElementChild === s }; });
    return { kind, sel: `[data-c161="${kind}-${i}"]`, text: e.textContent, aria: e.getAttribute('aria-label'), title: e.getAttribute('title'), expanded: e.getAttribute('aria-expanded'), color: hcs.color, cls: e.className, box: [hb.x, hb.y, hb.width, hb.height].map((v) => +v.toFixed(2)), svgs };
  });
}
const glyphScan = () => { const lib = document.querySelector('[data-testid="arrangement-library"]'); const t = lib ? lib.textContent : ''; const m = t.match(/[▶◀×▾▸■＋]/g); const attrs = lib ? [...lib.querySelectorAll('*')].flatMap((e) => ['aria-label', 'title'].map((a) => e.getAttribute(a)).filter((v) => v && /[▶◀×▾▸■＋]/.test(v))) : []; return { glyphs: m || [], attrGlyphs: attrs }; };
async function ax(p, sel) {
  const cdp = await p.context().newCDPSession(p);
  await cdp.send('DOM.enable'); await cdp.send('Accessibility.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel });
  if (!nodeId) { await cdp.detach(); return null; }
  const { nodes } = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
  await cdp.detach(); const nd = nodes[0]; return { role: nd.role && nd.role.value, name: nd.name && nd.name.value };
}
async function iconState(p, name) {
  const ic = await p.evaluate(icons);
  for (const h of ic) { h.ax = await ax(p, h.sel); }
  const hov = [];
  for (const h of ic.filter((x) => ['collapse', 'expand', 'clear', 'fold', 'toggle', 'add'].includes(x.kind)).slice(0, 8)) {
    const b = await p.locator(h.sel).boundingBox(); if (!b) continue;
    await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 2 }); await sleep(350);
    const r = await p.evaluate((s) => { const e = document.querySelector(s); const sv = e.querySelector('svg'); return { color: getComputedStyle(e).color, stroke: sv ? getComputedStyle(sv).stroke : null }; }, h.sel);
    const efp = await p.evaluate(([s, x, y]) => { const e = document.elementFromPoint(x, y); return !!(e && document.querySelector(s).contains(e)); }, [h.sel, b.x + b.width / 2, b.y + b.height / 2]);
    hov.push({ kind: h.kind, aria: h.aria, restColor: h.color, hit: efp, ...r });
    await p.mouse.move(2, 2); await sleep(250);
  }
  const wave = await p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-library-preview-wave]'); return e && e.getAttribute('aria-label'); });
  return { icons: ic, hover: hov, scan: await p.evaluate(glyphScan), wave, waveAx: await ax(p, '[data-testid=arrangement-library-preview-wave]'), shot: await shot(p, `lib-${name}`) };
}
async function freshPage(b, label, opts = {}) {
  const o = await L.openCtx(b, X.VPS[W], label, net, opts);
  await o.page.goto(`${L.BASE}/studio-lab`, { waitUntil: 'networkidle' });
  await o.page.evaluate(() => document.fonts.ready);
  await o.page.waitForSelector('[data-testid="arrangement-library-collapse"]');
  await sleep(800);
  o.log.fontsReady = await L.fontsWait(o.page);
  return o;
}
const libDump = (p) => p.evaluate(() => { const l = document.querySelector('[data-testid=arrangement-library]'); const tree = document.querySelector('[data-testid=arrangement-library-tree]'); return { libW: l ? l.getBoundingClientRect().width : null, folders: tree ? [...tree.querySelectorAll('[data-testid=arrangement-library-folder]')].map((f) => f.textContent.trim().slice(0, 30)) : [], focus: document.activeElement ? (document.activeElement.getAttribute('data-testid') || document.activeElement.getAttribute('aria-label') || document.activeElement.tagName) : null }; });

(async () => {
  const b = await L.launch();
  try {
    // ---- LIB-STATES-BOX + ICON-V3C1: one fresh context per state, B's preparation.
    const STATES = [
      ['S0-expanded', async (p) => {}],
      ['search-typed', async (p) => { await p.fill('[data-testid="arrangement-library-search"]', 'a'); }],
      ['preview-playing', async (p) => { await p.click('[data-testid="arrangement-library-preview-toggle"]'); await sleep(500); }],
      ['collapsed-rail', async (p) => { await p.click('[data-testid="arrangement-library-collapse"]'); await sleep(500); }],
      ['folded', async (p) => { await p.click('[data-testid=arrangement-library-tree] button[aria-expanded]'); await sleep(500); }],
    ];
    for (const [name, prep] of STATES) {
      const { ctx, page: p, log } = await freshPage(b, `${LBL}-${name}`);
      try {
        const before = name === 'folded' ? await p.evaluate(measure) : null;
        const fd0 = name === 'folded' ? await libDump(p) : null;
        await prep(p); await sleep(300);
        const m = await p.evaluate(measure);
        const st = { measure: m, fontsReady: log.fontsReady, fontResp: log.fontResp.map((r) => r.s), fontFail: log.fontFail };
        if (name === 'folded') {
          st.beforeFold = before; st.foldersBefore = fd0.folders; st.foldersAfter = (await libDump(p)).folders;
          await p.click('[data-testid=arrangement-library-tree] button[aria-expanded]'); await sleep(500);
          st.foldersReUnfold = (await libDump(p)).folders; st.measureReUnfold = await p.evaluate(measure);
          await p.click('[data-testid=arrangement-library-tree] button[aria-expanded]'); await sleep(500);
        }
        st.cookieDeclined = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) { b.click(); return true; } return false; }); await sleep(300);
        st.tokens = await p.evaluate(() => { const r = getComputedStyle(document.documentElement); const probe = (cls) => { const d = document.createElement('span'); d.className = cls; document.querySelector('.studio-container').appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }; return { muted: probe('text-muted'), foreground: probe('text-foreground'), brand: probe('text-brand'), accent: probe('text-accent'), varMuted: r.getPropertyValue('--color-muted').trim() }; });
        st.icon = await iconState(p, name);
        res.states[name] = st;
      } catch (e) { res.errors.push(`${name}: ${String(e.stack || e).slice(0, 600)}`); }
      save(); await ctx.close();
    }
    // ---- FUNC-SMOKE-LIB + READY-STATUS, one session
    const { page: p } = await L.openStudio(b, X.VPS[W], `${LBL}-func`, net, { extraInit: X.tapInit });
    const F = {}; res.func = F;
    const sec = async (n, fn) => { try { F[n] = await fn(); } catch (e) { res.errors.push(`func ${n}: ${String(e.stack || e).slice(0, 600)}`); } save(); };
    await sec('ready', async () => ({ status: await L.status(p), exact: (await L.status(p)) === 'Demo collection ready. Choose a track and add a sound (Enter or Add).' }));
    await sec('collapse', async () => {
      await p.click('[data-testid=arrangement-library-collapse]'); await sleep(500); const a = await libDump(p);
      await p.click('[data-testid=arrangement-library-expand]'); await sleep(500); const c = await libDump(p);
      return { collapsed: a, expanded: c, ok: a.libW === 40 && a.focus === 'arrangement-library-expand' && c.focus === 'arrangement-library-collapse' && c.libW > 200 };
    });
    await sec('clear', async () => {
      await p.click('[data-testid=arrangement-library-search]'); await p.keyboard.type('so'); await sleep(300);
      const before = await p.evaluate(() => ({ v: document.querySelector('[data-testid=arrangement-library-search]').value, clear: !!document.querySelector('[data-testid=arrangement-library-search-clear]'), opts: document.querySelectorAll('[role=option][data-source-id]').length }));
      await p.click('[data-testid=arrangement-library-search-clear]'); await sleep(300);
      const after = await p.evaluate(() => ({ v: document.querySelector('[data-testid=arrangement-library-search]').value, clear: !!document.querySelector('[data-testid=arrangement-library-search-clear]'), opts: document.querySelectorAll('[role=option][data-source-id]').length, focus: document.activeElement && document.activeElement.getAttribute('data-testid') }));
      return { before, after, ok: before.v === 'so' && before.clear && after.v === '' && !after.clear && after.focus === 'arrangement-library-search' };
    });
    await sec('fold', async () => {
      const f0 = await libDump(p); const fb = p.locator('[data-testid=arrangement-library-tree] button[aria-expanded]').first();
      const a0 = await fb.getAttribute('aria-label'); await fb.click(); await sleep(400); const f1 = await libDump(p); const a1 = await fb.getAttribute('aria-label');
      await fb.click(); await sleep(400); const f2 = await libDump(p);
      return { a0, a1, f0: f0.folders, f1: f1.folders, f2: f2.folders, ok: f1.folders.length < f0.folders.length && JSON.stringify(f2.folders) === JSON.stringify(f0.folders) };
    });
    await sec('preview', async () => {
      const opt = p.locator('[role=option][data-source-id="demo-hero-music"]'); await opt.scrollIntoViewIfNeeded(); await opt.click(); await sleep(500);
      const tg = p.locator('[data-testid=arrangement-library-preview-toggle]');
      const t0 = (await tg.textContent()).trim(); const w0 = await p.locator('[data-testid=arrangement-library-preview-wave]').getAttribute('aria-valuenow');
      await p.evaluate(() => window.__tapStart()); await tg.click(); await sleep(2300);
      const S = await p.evaluate(() => window.__tapStop());
      const t1 = (await tg.textContent()).trim(); const svg1 = await tg.evaluate((e) => e.querySelector('svg').getAttribute('class'));
      const w1 = await p.locator('[data-testid=arrangement-library-preview-wave]').getAttribute('aria-valuenow');
      const mk = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-library-option-previewing]')].map((m) => ({ text: m.textContent, svg: (m.querySelector('svg') || {}).getAttribute ? m.querySelector('svg').getAttribute('class') : null, row: m.closest('[role=option]').dataset.sourceId })));
      await tg.click(); await sleep(500);
      const t2 = (await tg.textContent()).trim(); const mk2 = await p.evaluate(() => document.querySelectorAll('[data-testid=arrangement-library-option-previewing]').length);
      const peak = +S.reduce((a, s) => Math.max(a, s.peak), 0).toFixed(4);
      return { t0, w0, t1, svg1, w1, marker: mk, peak, nTap: S.length, t2, markerAfterStop: mk2, ok: t0 === 'Preview' && t1 === 'Stop' && /lucide-square/.test(svg1) && (peak > 0 || +w1 > +w0) && mk.length === 1 && mk[0].text === 'Playing' && /lucide-play/.test(mk[0].svg) && t2 === 'Preview' && mk2 === 0 };
    });
    await sec('add', async () => {
      await p.click(L.nameSel('music')); await sleep(200); await L.seekTo(p, 0);
      const opt = p.locator('[role=option][data-source-id="demo-hero-music"]'); await opt.scrollIntoViewIfNeeded(); await opt.click(); await sleep(400);
      const n0 = (await L.clipsDom(p)).length; const u0 = await X.undoTitle(p);
      await p.locator('[data-testid=arrangement-library-preview] button', { hasText: /^Add$/ }).click(); await sleep(800);
      const c1 = await L.clipsDom(p); const st = await L.status(p); const u1 = await X.undoTitle(p);
      await L.blur(p); await p.keyboard.press('Control+z'); await sleep(500); const n2 = (await L.clipsDom(p)).length; const u2 = await X.undoTitle(p);
      await p.keyboard.press('Control+Shift+z'); await sleep(500); const n3 = (await L.clipsDom(p)).length;
      return { n0, n1: c1.length, lanes: c1.map((c) => `${c.lane}@${c.start}`), status: st, u0, u1, n2, u2, n3, ok: c1.length === n0 + 1 && c1.some((c) => c.lane === 'music') && n2 === n0 && n3 === n0 + 1 };
    });
    await sec('rdel', async () => {
      await L.setSnapOff(p); const hero = (await H.byLane(p, 'music')).id;
      await X.rangeDrag(p, hero, 1, 2); const rg = await H.range(p);
      await p.locator('button', { hasText: /^Delete$/ }).click(); await sleep(500);
      const st = await L.status(p);
      return { range: rg, status: st, ok: /^Deleted 00:01\.000 — 00:02\.000 on the Music track; the gap remains\.$/.test(st), clips: H.brief(await H.cl(p)) };
    });
    F.shot = await shotFull(p, 'func-end');
  } catch (e) { res.errors.push(String(e.stack || e).slice(0, 800)); }
  res.net = X.netOk(net); res.fonts = net.map((n) => ({ l: n.label, ready: n.fontsReady && n.fontsReady.ok, bad: (n.fontResp || []).filter((r) => r.s !== 200).length, fail: (n.fontFail || []).length, n: (n.fontResp || []).length }));
  save(); await b.close();
  console.log(JSON.stringify({ errors: res.errors, net: res.net, fonts: res.fonts, func: Object.fromEntries(Object.entries(res.func || {}).map(([k, v]) => [k, v && v.ok !== undefined ? v.ok : v])) }, null, 1));
})();
