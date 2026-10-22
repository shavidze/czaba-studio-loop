// DEMO-LOAD 1440: (a) hold middle-east.mp3, (b) abort hero-music.mp3
const X = require('./ext.cjs'); const { sleep } = X;
const LOADING = 'დემო კოლექცია იტვირთება…', FAIL1 = 'დემო კოლექციიდან 1 წყარო ვერ ჩაიტვირთა — დეტალები ბიბლიოთეკაშია.';
const audio = (p, arr) => p.on('request', (q) => { if (/\.(mp3|wav|ogg|flac|m4a)(\?|$)/.test(q.url())) arr.push(q.url().replace(X.BASE, '')); });
const rows = (p) => p.$$eval('[role=option][data-source-id]', (os) => os.map((o) => ({ id: o.dataset.sourceId, draggable: o.getAttribute('draggable'), text: o.innerText.replace(/\s+/g, ' ').slice(0, 160), err: (o.innerText.match(/შეცდომა: .*/) || [null])[0] })));
(async () => {
  const b = await X.launch(); const R = {};
  { const { ctx, page: p, S } = await X.newCtx(b, { width: 1440, height: 900 }, 'loadA'); const au = []; audio(p, au);
    let held = null; let heldAt = null;
    await p.route('**/middle-east.mp3', (r) => { held = r; heldAt = Date.now(); });
    await p.goto(X.URL, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
    const t0 = Date.now(); while (!held && Date.now() - t0 < 60000) await sleep(100);
    await sleep(6000);
    const whileHeld = await X.status(p); const rowsHeld = await rows(p);
    await p.screenshot({ path: `${X.SHOTS}/load-held-1440x900.png` });
    await held.continue(); const rel = Date.now();
    const after = await X.waitStatus(p, (s) => s === X.READY || /ვერ ჩაიტვირთა/.test(s || ''));
    R.a = { pass: whileHeld === LOADING && after === X.READY, heldMs: rel - heldAt, whileHeld, after, msReadyAfterRelease: Date.now() - rel, rowsHeld: rowsHeld.filter((r) => r.id === 'demo-middle-east'), rowsAfter: (await rows(p)).map((r) => [r.id, r.draggable]), audio: au, errors: S.errors, forbidden: S.forbidden, auth: S.authHeaders };
    await ctx.close(); }
  { const { ctx, page: p, S } = await X.newCtx(b, { width: 1440, height: 900 }, 'loadB'); const au = []; audio(p, au);
    await p.route('**/videos/hero/hero-music.mp3', (r) => r.abort());
    await p.goto(X.URL, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
    const st = await X.waitStatus(p, (s) => s === X.READY || /ვერ ჩაიტვირთა/.test(s || '')); await sleep(1500);
    const rs = await rows(p); const hero = rs.find((r) => r.id === 'demo-hero-music'); const others = rs.filter((r) => r.id !== 'demo-hero-music');
    await p.screenshot({ path: `${X.SHOTS}/load-fail-1440x900.png` });
    R.b = { pass: st === FAIL1 && !!hero && /^შეცდომა: /.test(hero.err || '') && others.every((r) => r.draggable === 'true'), status: st, hero, others: others.map((r) => [r.id, r.draggable, r.err]), audio: au, errors: S.errors, forbidden: S.forbidden, auth: S.authHeaders };
    await ctx.close(); }
  X.save('demo-load.json', R); console.log(JSON.stringify(R, null, 1)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
