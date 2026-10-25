// C round 151 — FONT-FAIL: Google Fonts aborted; Studio renders and works. node fontfail.cjs <vp>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const net = []; const r = { vp: W, utc: new Date().toISOString() };
(async () => { const b = await L.launch();
  try {
    const o = await L.openCtx(b, X.VPS[W], `fontfail-${W}`, net);
    const { page: p, log } = o; const aborted = [];
    await p.route(/fonts\.(googleapis|gstatic)\.com/, (rt) => { aborted.push(rt.request().url().slice(0, 140)); rt.abort(); });
    const t0 = Date.now();
    await p.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
    r.workspaceMs = Date.now() - t0;
    await sleep(2500);
    await p.evaluate(() => { const bt = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (bt) bt.click(); });
    await p.evaluate(() => document.fonts.ready);
    r.aborted = aborted;
    r.faces = await p.evaluate(() => [...new Set([...document.fonts].map((f) => `${f.family.replace(/"/g, '')} ${f.weight} ${f.status}`))].sort());
    r.computed = await p.evaluate(() => ({ ws: getComputedStyle(document.querySelector('.studio-container')).fontFamily, pos: getComputedStyle(document.querySelector('[data-testid=arrangement-position]')).fontFamily }));
    await p.evaluate(() => { document.querySelector('h1').setAttribute('data-ff', 't'); document.querySelector('[data-testid=arrangement-position]').setAttribute('data-ff', 'm'); });
    const cdp = await p.context().newCDPSession(p); await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
    for (const k of ['t', 'm']) { const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `[data-ff=${k}]` }); r[`platform_${k === 't' ? 'title' : 'position'}`] = (await cdp.send('CSS.getPlatformFontsForNode', { nodeId })).fonts; }
    await cdp.detach();
    r.shot = `c-round-153/shots/fontfail-${W}.png`; await p.screenshot({ path: path.join(L.ROOT, '..', r.shot) });
    await L.setSnapOff(p);
    r.add = (await L.addAt(p, 'demo-soft-impact', 'sfx', 1)).status;
    await L.blur(p); await p.keyboard.press('Home'); await sleep(200);
    const c0 = await p.evaluate(() => window.__h.cbs); const ph0 = await L.posNow(p);
    await p.keyboard.press('Space'); await sleep(1000); await p.keyboard.press('Space'); await sleep(300);
    r.play = { ph0, ph1: await L.posNow(p), cbsDelta: (await p.evaluate(() => window.__h.cbs)) - c0 };
    const id = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id; await L.selectClip(p, id);
    r.selected = (await L.clipsDom(p)).find((c) => c.id === id).sel; r.detail = (await L.detailInfo(p)).text;
    await p.keyboard.press('Escape'); await sleep(300);
    r.afterEscapeSelected = (await L.clipsDom(p)).find((c) => c.id === id).sel;
    r.pageErrors = log.errors.filter((e) => /^pageerror/.test(e));
  } catch (e) { r.error = String(e.stack || e); }
  r.net = X.netOk(net); fs.writeFileSync(path.join(L.OUT, `fontfail-${W}.json`), JSON.stringify(r, null, 1)); console.log(JSON.stringify(r, null, 1).slice(0, 3000)); await b.close(); })();
