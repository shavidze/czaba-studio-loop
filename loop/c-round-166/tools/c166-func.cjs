// C round 166 — FUNC-SMOKE-V3C3B. Every pointer action starts on the icon's centre (svg rect). node c166-func.cjs <1440|1280> <attempt>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'func'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'func'); fs.mkdirSync(SHD, { recursive: true });
const svgCentre = async (p, hostSel) => { const r = await p.evaluate((s) => { const e = document.querySelector(s).querySelector('svg'); const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, cls: e.getAttribute('class') }; }, hostSel); return r; };
const clickSvg = async (p, hostSel) => { const c = await svgCentre(p, hostSel); const hit = await p.evaluate(({ x, y, s }) => { const t = document.elementFromPoint(x, y); return { tag: t.tagName, inSvg: !!t.closest('svg'), inHost: !!t.closest(s) }; }, { ...c, s: hostSel }); await p.mouse.click(c.x, c.y); await sleep(350); return { ...c, hit }; };
const active = (p) => p.evaluate(() => (document.activeElement && (document.activeElement.getAttribute('data-testid') || document.activeElement.tagName)) || null);
const markers = (p) => p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((m) => +m.dataset.markerTime));
const toggleState = (p) => p.evaluate(() => { const t = document.querySelector('[data-testid=arrangement-detail-toggle]'); const s = t.querySelector('svg'); return { text: t.textContent, label: t.getAttribute('aria-label'), expanded: t.getAttribute('aria-expanded'), icon: s ? s.getAttribute('class').split(' ')[1] : null, nSvg: t.querySelectorAll('svg').length, panelCollapsed: document.querySelector('[data-testid=arrangement-detail-panel]').dataset.collapsed }; });
const menuState = (p) => p.evaluate(() => { const m = document.querySelector('[data-testid=arrangement-grid-menu]'); if (!m) return null; return [...m.querySelectorAll('[role^=menuitem]')].map((e) => `${e.textContent.trim()}:${e.getAttribute('aria-checked')}:${e.querySelectorAll('svg.lucide-check').length}`); });
const openMenu = async (p) => { const body = p.locator('[data-track-id="music"] [data-grid-seconds]').first(); const bb = await body.boundingBox(); await p.mouse.click(bb.x + 300, bb.y + bb.height / 2, { button: 'right' }); await p.waitForSelector('[data-testid=arrangement-grid-menu]', { timeout: 5000 }); await sleep(300); };
(async () => {
  const b = await L.launch(); const net = []; const res = { W, attempt: ATT, utc: new Date().toISOString() };
  const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c166func-${W}-${ATT}`, net, { extraInit: X.tapInit });
  res.fonts = log.fontsReady && log.fontsReady.ok;
  await p.mouse.move(2, 2); await sleep(300); res.snap = await L.setSnapOff(p);
  // markers at 2 and 6
  const mk = res.marker = { steps: [] };
  for (const [t, nm] of [[2, 'Two'], [6, 'Six']]) { const pos = await L.seekTo(p, t); await L.blur(p); await p.keyboard.press('m'); await sleep(300); await p.keyboard.press('Control+A'); await p.keyboard.type(nm); await p.keyboard.press('Enter'); await sleep(300); await L.blur(p); mk.steps.push({ t, pos, status: await L.status(p) }); }
  mk.markers = await markers(p);
  await L.seekTo(p, 0); mk.start = await L.posNow(p);
  const nx1 = await clickSvg(p, '[data-testid=arrangement-marker-next]'); mk.next1 = { pos: await L.posNow(p), focus: await active(p), hit: nx1.hit, cls: nx1.cls };
  const nx2 = await clickSvg(p, '[data-testid=arrangement-marker-next]'); mk.next2 = { pos: await L.posNow(p), focus: await active(p), hit: nx2.hit };
  const pv1 = await clickSvg(p, '[data-testid=arrangement-marker-prev]'); mk.prev1 = { pos: await L.posNow(p), focus: await active(p), hit: pv1.hit, cls: pv1.cls };
  await L.blur(p); await p.keyboard.press('Control+ArrowRight'); await sleep(300); mk.ctrlRight = await L.posNow(p);
  await L.blur(p); await p.keyboard.press('Control+ArrowLeft'); await sleep(300); mk.ctrlLeft = await L.posNow(p);
  // + add
  await L.seekTo(p, 4); const n0 = (await markers(p)).length;
  const ab = await p.locator('[data-testid=arrangement-marker-add]').boundingBox(); await p.mouse.click(ab.x + ab.width / 2, ab.y + ab.height / 2); await sleep(300);
  mk.addEditorFocus = await active(p); await p.keyboard.press('Enter'); await sleep(300); await L.blur(p);
  mk.add = { before: n0, after: await markers(p), status: await L.status(p) };
  await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-markers.png`) });
  // detail toggle
  const dt = res.toggle = { s0: await toggleState(p) };
  const c1 = await clickSvg(p, '[data-testid=arrangement-detail-toggle]'); await sleep(400); dt.click1 = { ...(await toggleState(p)), hit: c1.hit };
  const c2 = await clickSvg(p, '[data-testid=arrangement-detail-toggle]'); await sleep(400); dt.click2 = { ...(await toggleState(p)), hit: c2.hit };
  await p.focus('[data-testid=arrangement-detail-toggle]'); await p.keyboard.press('Enter'); await sleep(500); dt.enter = await toggleState(p);
  await p.focus('[data-testid=arrangement-detail-toggle]'); await p.keyboard.press(' '); await sleep(500); dt.space = await toggleState(p);
  await L.blur(p);
  // grid menu with BPM 120 (musical divisions incl. 1/8 and triplet)
  const g = res.grid = {};
  await p.fill('[data-testid=arrangement-tempo-input]', '120'); await p.keyboard.press('Enter'); await sleep(400); await L.blur(p);
  g.bpmStatus = await L.status(p);
  await openMenu(p); g.open0 = await menuState(p);
  const item18 = p.locator('[data-testid=arrangement-grid-menu] [role=menuitemradio]', { hasText: /^1\/8$/ });
  g.has18 = await item18.count();
  if (g.has18) { const lb = await item18.boundingBox(); await p.mouse.click(lb.x + lb.width - 20, lb.y + lb.height / 2); await sleep(400); g.after18Status = await L.status(p); g.menuClosed18 = (await menuState(p)) === null; await openMenu(p); g.open18 = await menuState(p); }
  const snapItem = p.locator('[data-testid=arrangement-grid-menu] [role=menuitemcheckbox]', { hasText: 'Snap' });
  const snapBefore = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
  await snapItem.click(); await sleep(400); g.snapClick = { before: snapBefore, after: await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap), status: await L.status(p) };
  await openMenu(p); g.openSnap = await menuState(p);
  await p.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-gridmenu.png`) });
  // keyboard: ArrowDown + Enter
  const focus0 = await active(p); const fi = await p.evaluate(() => document.activeElement.textContent.trim());
  await p.keyboard.press('ArrowDown'); await sleep(150); const fi2 = await p.evaluate(() => document.activeElement.textContent.trim());
  await p.keyboard.press('Enter'); await sleep(400); g.kbd = { focus0, from: fi, to: fi2, status: await L.status(p), closed: (await menuState(p)) === null };
  await openMenu(p); g.openKbd = await menuState(p);
  await p.keyboard.press('Escape'); await sleep(300); g.escClosed = (await menuState(p)) === null;
  // audio
  const a = res.audio = {};
  a.add = await L.addAt(p, 'demo-middle-east', 'music', 0);
  await L.seekTo(p, 0); await p.evaluate(() => window.__tapStart()); await L.blur(p); await p.keyboard.press('Space'); await sleep(1500);
  a.pos = await L.posNow(p); await p.keyboard.press('Space'); await sleep(200);
  const S = await p.evaluate(() => window.__tapStop()); a.samples = S.length; a.peak = +S.reduce((m, s) => Math.max(m, s.peak), 0).toFixed(5);
  a.ctx = await p.evaluate(() => (window.__h.ctxs || []).map((c) => c.state)); a.tapErr = await p.evaluate(() => window.__tap.err || null);
  await ctx.close();
  // exit link — fresh context
  const e = res.exit = {};
  { const o = await L.openStudio(b, X.VPS[W], `c166exit-${W}-${ATT}`, net); const q = o.page; await q.mouse.move(2, 2); await sleep(300);
    e.href = await q.getAttribute('[data-testid=arrangement-exit]', 'href');
    const c = await clickSvg(q, '[data-testid=arrangement-exit]'); e.hit = c.hit; e.cls = c.cls;
    await q.waitForURL((u) => new URL(u).pathname === '/', { timeout: 20000 }).catch((err) => { e.waitErr = String(err).slice(0, 120); });
    await sleep(1000); e.path = await q.evaluate(() => location.pathname); e.workspaceGone = await q.evaluate(() => !document.querySelector('[data-testid=arrangement-grid-control]'));
    await q.screenshot({ path: path.join(SHD, `func-${W}-${ATT}-exit.png`) }); await o.ctx.close(); }
  res.net = X.netOk(net); res.netRaw = net.map((n) => ({ label: n.label, errors: n.errors, forbidden: n.forbidden, auth: n.authHeaders, hyd: n.hydration, noise: n.noise, fontBad: n.fontResp.filter((r) => r.s !== 200).length }));
  await b.close();
  fs.writeFileSync(path.join(OUTD, `func-${W}-${ATT}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
