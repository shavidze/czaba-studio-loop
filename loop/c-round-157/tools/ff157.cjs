// C round 157 — FONT-FAIL (fonts aborted) + FONTS-SCOPED + raw HTML link. node ff157.cjs <1440|1280> [scoped]
const L = require('./lib.cjs'); const X = require('./lib122.cjs'); const fs = require('fs'); const path = require('path');
const VP = +process.argv[2] || 1440; const SC = process.argv[3] === 'scoped'; const net = []; const res = { vp: VP, utc: new Date().toISOString(), errors: [] };
const LBL = `ff157-${VP}`; const OUTF = path.join(L.OUT, `${LBL}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const sec = async (n, fn) => { try { res[n] = await fn(); } catch (e) { res.errors.push(`${n}: ${String(e.stack || e).slice(0, 500)}`); } save(); };
const R4 = 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400&family=Noto+Sans+Georgian:wght@400;500&display=swap';
async function pf(p, sel) { const cdp = await p.context().newCDPSession(p); await cdp.send('DOM.enable'); await cdp.send('CSS.enable'); const { root } = await cdp.send('DOM.getDocument', { depth: -1 }); const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: sel }); let out = null; if (nodeId) { const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId }); out = fonts.map((f) => `${f.familyName}${f.isCustomFont ? ' [web]' : ' [local]'}`); } await cdp.detach(); return out; }
(async () => {
  const b = await L.launch();
  try {
    const vp = X.VPS[VP];
    const { ctx, page: p, log } = await L.openCtx(b, vp, LBL, net, {});
    const aborted = [];
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => { aborted.push(r.request().url().slice(0, 120)); return r.abort(); });
    const pageErr = []; p.on('pageerror', (e) => pageErr.push(String(e).slice(0, 200)));
    await p.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await L.sleep(2500);
    await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Decline'); if (x) x.click(); });
    const t0 = Date.now(); while (Date.now() - t0 < 60000) { const n = await p.evaluate(() => { const o = [...document.querySelectorAll('[role=option][data-source-id]')]; return o.length === 0 ? -1 : o.filter((x) => /იტვირთება…|Loading…/.test(x.textContent)).length; }); if (n === 0) break; await L.sleep(250); }
    await sec('fallback', async () => ({ fonts: await p.evaluate(() => [...document.fonts].map((f) => `${f.family.replace(/"/g, '')} ${f.weight} ${f.status}`).filter((v, i, a) => a.indexOf(v) === i)), h1Family: await p.evaluate(() => getComputedStyle(document.querySelector('.studio-container h1') || document.body).fontFamily), h1Platform: await pf(p, '.studio-container h1'), monoPlatform: await pf(p, '[role=option][data-source-id] span.font-mono') }));
    await sec('flow', async () => {
      await L.setSnapOff(p); const add = await L.addAt(p, 'demo-hero-music', 'music', 0);
      await L.blur(p); await p.keyboard.press('Home'); await L.sleep(200); const ph0 = await L.posNow(p);
      await p.keyboard.press('Space'); await L.sleep(1000); await p.keyboard.press('Space'); await L.sleep(300); const ph1 = await L.posNow(p);
      const c = (await L.clipsDom(p))[0]; await L.selectClip(p, c.id); const sel = (await L.clipsDom(p)).find((x) => x.id === c.id).sel;
      await L.blur(p); await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title', { timeout: 10000 }); await L.sleep(400);
      const desc = await p.evaluate(() => document.querySelector('#arrangement-export-title + p').textContent);
      await p.screenshot({ path: path.join(L.SHOTS, `ff157-export-${VP}.png`) });
      await p.locator('button', { hasText: /^Done$/ }).last().click(); await L.sleep(400); const closedDone = (await p.locator('#arrangement-export-title').count()) === 0;
      await p.getByRole('button', { name: 'Export', exact: true }).click(); await L.sleep(400); await p.keyboard.press('Escape'); await L.sleep(400); const closedEsc = (await p.locator('#arrangement-export-title').count()) === 0;
      await p.screenshot({ path: path.join(L.SHOTS, `ff157-studio-${VP}.png`) });
      return { add: add.status, ph0, ph1, moved: ph1 > ph0 + 0.5, selected: sel, desc, closedDone, closedEsc };
    });
    res.aborted = aborted.length; res.abortedSample = aborted.slice(0, 5); res.pageErrors = pageErr;
    if (SC) {
      await sec('rawHtml', async () => { const r = await ctx.request.get(`${L.BASE}/studio-lab`); const h = await r.text(); const hs = [...h.matchAll(/<link[^>]*href="([^"]*fonts\.googleapis\.com\/css2[^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&')); return { status: r.status(), css2Links: hs, studioLinks: hs.filter((x) => /Instrument\+Sans/.test(x)), exactR4: hs.filter((x) => /Instrument\+Sans/.test(x)).length === 1 && hs.includes(R4) }; });
      await sec('scoped', async () => {
        const o = {};
        for (const u of ['/', '/products']) {
          const c2 = await b.newContext({ viewport: vp }); const q = await c2.newPage(); const reqs = [];
          q.on('request', (r) => { if (/fonts\.googleapis\.com\/css2/.test(r.url())) reqs.push(r.url().slice(0, 140)); });
          await q.goto(`${L.BASE}${u}`, { waitUntil: 'load' }); await L.sleep(4000); await q.waitForLoadState('load');
          let links = null; for (let k = 0; k < 5 && links === null; k++) { try { links = await q.evaluate(() => [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.href).filter((h) => /fonts\.googleapis/.test(h))); } catch (e) { await L.sleep(1500); } }
          o[u] = { finalUrl: q.url(), links, reqs, studioCss2: reqs.some((x) => /Instrument\+Sans|IBM\+Plex/.test(x)) };
          await c2.close();
        }
        return o;
      });
    }
  } catch (e) { res.errors.push(String(e.stack || e)); }
  res.net = X.netOk(net); save(); console.log(JSON.stringify(res, null, 1).slice(0, 3500)); await b.close();
})();
