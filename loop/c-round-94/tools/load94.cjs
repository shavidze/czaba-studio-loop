// DEMO-LOAD-REG: node load94.cjs <1280|1440>  (fresh incognito contexts, no credentials)
const X = require('./ext.cjs'); const { sleep } = X; const fs = require('fs');
const W = +process.argv[2]; const vp = W === 1280 ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const LOADING = 'დემო კოლექცია იტვირთება…';
const FAILED1 = 'დემო კოლექციიდან 1 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.';
const AUD = /\.(mp3|wav|ogg|flac|m4a)(\?|$)/;
function tap(p, R) { R.hyd = []; R.audio = {}; p.on('console', (m) => { if (/hydrat|did not match|server rendered/i.test(m.text())) R.hyd.push(m.text().slice(0, 200)); }); p.on('request', (q) => { const u = q.url(); if (AUD.test(u)) { const k = u.replace(X.BASE, ''); R.audio[k] = (R.audio[k] || 0) + 1; } }); }
(async () => {
  const R = { vp: `${vp.width}x${vp.height}` };
  const html = await (await fetch(X.URL)).text();
  const m = html.match(/data-testid="arrangement-status"[^>]*>([^<]*)</); R.ssr = m ? m[1] : null; R.ssrNul = html.includes('\u0000');
  const b = await X.launch();
  // (b) hold all demo audio, then release
  { const { ctx, page: p, S } = await X.newCtx(b, vp, `hold${W}`); const H = {}; tap(p, H);
    const held = []; let rel; const gate = new Promise((r) => { rel = r; });
    await p.route(AUD, async (rt) => { held.push(rt.request().url().replace(X.BASE, '')); await gate; await rt.continue(); });
    await p.goto(X.URL, { waitUntil: 'domcontentloaded' });
    H.firstClientStatus = await X.status(p);
    await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 120000 });
    const t0 = Date.now(); while (Date.now() - t0 < 60000 && held.length < 2) await sleep(200); await sleep(3000);
    H.held = [...held]; H.statusHeld = await X.status(p); H.rowsHeld = await p.$$eval('[role=option][data-source-id]', (os) => os.map((o) => ({ id: o.dataset.sourceId, drag: o.getAttribute('draggable'), t: o.innerText.replace(/\s+/g, ' ').slice(0, 80) })));
    await p.screenshot({ path: `${X.SHOTS}/load-held-${R.vp}.png` });
    rel(); H.statusReady = await X.waitStatus(p, (s) => s === X.READY || /ვერ ჩაიტვირთა/.test(s || ''));
    await sleep(3000); H.statusAfter3s = await X.status(p);
    await p.screenshot({ path: `${X.SHOTS}/load-ready-${R.vp}.png` });
    H.errors = S.errors; H.forbidden = S.forbidden; H.auth = S.authHeaders; H.unpkg = S.unpkg; H.third = [...new Set(S.thirdParty)];
    R.hold = H; await ctx.close(); }
  // (c) abort one demo audio file
  { const { ctx, page: p, S } = await X.newCtx(b, vp, `abort${W}`); const A = {}; tap(p, A);
    A.aborted = null;
    await p.route(AUD, async (rt) => { const u = rt.request().url(); if (/middle-east\.mp3/.test(u)) { A.aborted = u.replace(X.BASE, ''); await rt.abort(); } else await rt.continue(); });
    await p.goto(X.URL, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 120000 });
    A.status = await X.waitStatus(p, (s) => s !== LOADING && s != null);
    await sleep(2000); A.statusAfter2s = await X.status(p);
    A.rows = await p.$$eval('[role=option][data-source-id]', (os) => os.map((o) => ({ id: o.dataset.sourceId, t: o.innerText.replace(/\s+/g, ' ').slice(0, 90) })));
    await p.screenshot({ path: `${X.SHOTS}/load-abort-${R.vp}.png` });
    A.errors = S.errors; A.forbidden = S.forbidden; A.auth = S.authHeaders; A.unpkg = S.unpkg; A.third = [...new Set(S.thirdParty)];
    R.abort = A; await ctx.close(); }
  await b.close();
  const H = R.hold, A = R.abort;
  R.checks = { ssr: R.ssr === LOADING, held: H.statusHeld === LOADING, ready: H.statusReady === X.READY && H.statusAfter3s === X.READY,
    audioOnce: Object.values(H.audio).every((n) => n === 1), failed1: A.status === FAILED1 && A.statusAfter2s === FAILED1,
    noHyd: H.hyd.length === 0 && A.hyd.length === 0, net: H.forbidden.length + H.auth.length + H.unpkg.length + A.forbidden.length + A.auth.length + A.unpkg.length === 0 };
  R.pass = Object.values(R.checks).every(Boolean);
  X.save(`load-${R.vp}.json`, R); console.log(JSON.stringify(R, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
