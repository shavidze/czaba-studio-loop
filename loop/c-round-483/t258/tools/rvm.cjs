const L = require('./lib.cjs'); const K = require('./rk-lib.cjs'); const fs = require('fs'); const path = require('path'); const sleep = L.sleep;
const W = +(process.argv[2] || 1440); const H = W === 1440 ? 900 : 720; const OUT = path.join(__dirname, '..', 'out', 'rvm', `${W}`); fs.mkdirSync(OUT, { recursive: true });
const banner = () => { const btn = [...document.querySelectorAll('button,a')].filter((b) => /^(Accept|Decline|Accept all|Reject)/i.test(b.textContent.trim())).map((b) => b.textContent.trim()); const fixedBottom = [...document.querySelectorAll('body *')].filter((e) => { const c = getComputedStyle(e); if (c.position !== 'fixed' && c.position !== 'sticky') return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom >= innerHeight - 2 && r.top > innerHeight * 0.5; }).map((e) => `${e.tagName}.${(e.className || '').toString().slice(0, 60)}`); if (!document.body) return { nobody: true }; const cookieText = /cookie/i.test(document.body.innerText); return { btn, fixedBottom, cookieText }; };
(async () => { const b = await L.launch(); const net = []; const res = { W };
  const { page: p, log } = await L.openCtx(b, { width: W, height: H }, `rvm-${W}`, net, { deviceScaleFactor: 2 });
  await p.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  const bs = []; for (let i = 0; i < 6; i++) { await sleep(1000); bs.push(await p.evaluate(banner)); } res.bannerLab = bs;
  res.statusHit = await p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-status]'); const r = s.getBoundingClientRect(); const e = document.elementFromPoint(r.left + Math.min(40, r.width / 2), r.top + r.height / 2); return { hit: !!(e && (e === s || s.contains(e))), tag: e && e.tagName, box: r.toJSON() }; });
  res.play = await p.evaluate(() => { const b = document.querySelector('button[aria-label="Play"]'); const r = b.getBoundingClientRect(); const c = getComputedStyle(b); return { w: r.width, h: r.height, radius: c.borderTopLeftRadius, text: b.innerText, svg: !!b.querySelector('svg') }; });
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && await p.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].some((x) => /Loading…/.test(x.textContent)))) await sleep(250);
  res.gaps = await p.evaluate(() => { const o = [...document.querySelectorAll('[role=option][data-source-id]')].map((e) => e.getBoundingClientRect()); const g = []; for (let i = 1; i < o.length; i++) if (Math.abs(o[i].left - o[i - 1].left) < 1) g.push(+(o[i].top - o[i - 1].bottom).toFixed(2)); return g; });
  // keyboard focus on first option
  await p.locator('[data-testid=arrangement-library-search]').focus(); let d = null;
  for (let i = 0; i < 12; i++) { await p.keyboard.press('Tab'); await sleep(120); d = await p.evaluate(() => document.activeElement.getAttribute('role')); if (d === 'option' || d === 'listbox') break; }
  if (d === 'listbox') { await p.keyboard.press('ArrowDown'); await sleep(150); }
  res.focus = await p.evaluate(() => { const a = document.activeElement; const opt = a.getAttribute('role') === 'option' ? a : document.querySelector('[role=option][aria-selected=true]') || a.querySelector('[role=option]'); const c = getComputedStyle(opt); const r = opt.getBoundingClientRect(); const ca = getComputedStyle(a); return { active: a.getAttribute('role'), activeDesc: a.getAttribute('aria-activedescendant'), opt: { box: r.toJSON(), bs: c.boxShadow, ow: c.outlineWidth, os: c.outlineStyle, oo: c.outlineOffset, oc: c.outlineColor, radius: c.borderTopLeftRadius, bg: c.backgroundColor }, act: { ow: ca.outlineWidth, os: ca.outlineStyle, fv: a.matches(':focus-visible') } }; });
  const ob = res.focus.opt.box; await p.screenshot({ path: path.join(OUT, 'opt-focus.png'), clip: { x: Math.max(0, ob.x - 8), y: Math.max(0, ob.y - 8), width: ob.width + 16, height: ob.height + 16 } });
  await p.screenshot({ path: path.join(OUT, 'lab.png') });
  // studio/middle-east
  const { page: q } = await L.openCtx(b, { width: W, height: H }, `rvm-me-${W}`, net, {});
  q.on('framenavigated', (f) => { if (f === q.mainFrame()) (res.navMe = res.navMe || []).push(f.url()); }); await q.goto(`${L.BASE}/studio/middle-east`, { waitUntil: 'domcontentloaded' }); const bm = []; for (let i = 0; i < 5; i++) { await sleep(1000); bm.push(await q.evaluate(banner)); } res.bannerMe = bm;
  await q.screenshot({ path: path.join(OUT, 'middle-east.png') });
  res.net = net.map((n) => ({ label: n.label, e: n.errors, h: n.hydration, f: n.forbidden, a: n.authHeaders, noise: n.noise }));
  L.save(path.join(__dirname, '..', 'out'), `RV-M-${W}.json`, res); console.log(JSON.stringify(res, null, 1)); await b.close(); })();
