// G90-3, CX-UNMOUNT (mp3 + render phase), VIS-RENDER sample with Cancel, wav-phase worker termination
const X = require('./lib90.cjs');
const { sleep } = X;
const vpArg = process.argv[2] || '1440x900';
const [w, h] = vpArg.split('x').map(Number);
const VIS = () => {
  const t = document.querySelector('#arrangement-export-title'); if (!t) return null; const d = t.closest('[role=dialog]');
  const foot = d.querySelector('[data-testid=arrangement-export-footer]'); let pn = null; for (let e = foot.parentElement; e; e = e.parentElement) { if (/(auto|scroll)/.test(getComputedStyle(e).overflowY)) { pn = e; break; } }
  const pr = pn.getBoundingClientRect(); const top = pr.top + pn.clientTop, bot = top + pn.clientHeight;
  const vis = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); const inBox = r.top >= top - 0.5 && r.bottom <= bot + 0.5 && r.bottom <= innerHeight + 0.5 && r.right <= innerWidth + 0.5; const hh = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); const hit = !!hh && (hh === el || el.contains(hh)); return { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), left: +r.left.toFixed(1), right: +r.right.toFixed(1), ok: inBox && hit }; };
  const btns = [...foot.querySelectorAll('button')]; const cancel = foot.querySelector('[data-testid=arrangement-export-cancel]');
  return { label: d.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null, rowParentSame: cancel ? cancel.parentElement === btns.find((b) => b.textContent.trim() === 'დახურვა').parentElement : null,
    order: btns.map((b) => b.textContent.trim()), v: { status: vis(foot.querySelector('[role=status]')), label: vis(d.querySelector('[data-testid=arrangement-export-progress-label]')), bar: vis(d.querySelector('[data-testid=arrangement-export-progress]')), cancel: vis(cancel), close: vis(btns.find((b) => b.textContent.trim() === 'დახურვა')), busy: vis(btns.find((b) => /მიმდინარეობს/.test(b.textContent))) } };
};
async function unmountIn(b, phase, fmt) {
  const { ctx, page: p, S } = await X.newCtx(b, { width: w, height: h }, `unm-${phase}-${vpArg}`);
  const R = { phase, fmt };
  R.scope = await X.setup(p, 2); await X.selectFormat(p, fmt);
  const n0 = S.downloads.length; const eb = await X.exportBtnBox(p); await p.mouse.click(eb.x, eb.y);
  const re = phase === 'mp3' ? /^MP3-ის შექმნა · / : /^რენდერი · /; const t0 = Date.now(); let res = null;
  while (Date.now() - t0 < 120000) {
    res = await p.evaluate((src) => { const l = document.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null; if (!l || !new RegExp(src).test(l)) return null; window.__cx = 1; const ex = document.querySelector('[data-testid=arrangement-exit]'); ex.click(); return { labelAtExit: l, href: ex.getAttribute('href') }; }, re.source);
    if (res) break; await sleep(5);
  }
  R.exit = res; const tc = Date.now();
  await sleep(15000);
  R.after = await p.evaluate(() => ({ url: location.href, cx: window.__cx, dialog: !!document.querySelector('#arrangement-export-title'), lab: !!document.querySelector('[data-testid=arrangement-grid-control]') }));
  R.downloads15 = S.downloads.slice(n0).map((d) => d.name);
  R.workers = S.workers.map((x) => ({ url: x.url, closedAfterExitMs: x.closed ? x.closed - tc : null }));
  R.errors = S.errors.slice(); R.forbidden = S.forbidden; R.auth = S.authHeaders; R.unpkg = S.unpkg.map((x) => x.f);
  await ctx.close(); return R;
}
(async () => {
  const b = await X.launch(); const R = { vp: vpArg };
  // warm-up '/' in a separate context (ENV-VITE-REOPTIMIZE-RELOAD) + G90-3
  {
    const { ctx, page: p, S } = await X.newCtx(b, { width: w, height: h }, `g-${vpArg}`);
    await p.goto(X.BASE + '/', { waitUntil: 'domcontentloaded' }); await sleep(6000);
    const links = await p.$$eval('a[href="/studio-lab"]', (as) => as.map((a) => { const r = a.getBoundingClientRect(); return { text: a.textContent.trim(), inHeader: !!a.closest('header'), vis: r.width > 0 && r.height > 0 && getComputedStyle(a).visibility !== 'hidden' }; }));
    R.g = { links };
    const vis = p.locator('header a[href="/studio-lab"]').filter({ visible: true }).first();
    if (await vis.count()) { await vis.click(); await p.waitForURL(/studio-lab/, { timeout: 30000 }); await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(1500);
      R.g.headerEntry = { url: p.url(), workspace: await p.locator('[data-testid=arrangement-grid-control]').count(), badge: await p.evaluate(() => /დემო კოლექცია/.test(document.body.innerText)) }; }
    await p.goto(X.BASE + '/studio/middle-east', { waitUntil: 'domcontentloaded' }); await sleep(6000);
    R.g.protected = await p.evaluate(() => ({ url: location.href, signIn: /Sign in required/i.test(document.body.innerText), workspace: document.querySelectorAll('[data-testid=arrangement-grid-control]').length, excerpt: document.body.innerText.slice(0, 200) }));
    const q = await ctx.request.get(X.BASE + '/api/studio-token?product=middle-east&file=stem1.wav'); R.g.tokenAnon = { status: q.status(), body: (await q.text()).slice(0, 120) };
    const fb = await ctx.request.get(X.BASE + '/api/studio-token?product=middle-east&file=stem1.wav', { headers: { Authorization: 'Bearer fake.token.value' } }); R.g.fakeBearer = { status: fb.status(), body: (await fb.text()).slice(0, 120) };
    R.g.ls = await p.evaluate(() => Object.keys(localStorage)); R.g.errors = S.errors.slice(); R.g.forbiddenPageReqs = S.forbidden; R.g.authPageReqs = S.authHeaders;
    await ctx.close();
  }
  R.unmountMp3 = await unmountIn(b, 'mp3', 'mp3');
  R.unmountRender = await unmountIn(b, 'render', 'wav');
  // VIS-RENDER sample + wav-phase worker termination
  {
    const { ctx, page: p, S } = await X.newCtx(b, { width: w, height: h }, `vis-${vpArg}`);
    await X.setup(p, 2); await X.selectFormat(p, 'wav');
    const eb = await X.exportBtnBox(p); await p.mouse.click(eb.x, eb.y);
    const t0 = Date.now(); let v = null;
    while (Date.now() - t0 < 30000) { v = await p.evaluate(VIS); if (v && v.label && /^რენდერი · /.test(v.label) && v.v.cancel) break; await sleep(5); }
    await p.screenshot({ path: `${X.SHOTS}/vis-render-${vpArg}.png` }); R.vis = v; R.visAfterShot = await p.evaluate(VIS);
    await sleep(6000);
    const w0 = S.workers.length; R.wavCancel = await X.exportAndCancel(p, 'wav');
    R.wavWorkers = S.workers.slice(w0).map((x) => ({ url: x.url, created: x.t, closed: x.closed }));
    R.wavCancelClickWall = null; R.visErrors = S.errors.slice();
    await ctx.close();
  }
  X.save(`unmount-${vpArg}.json`, R);
  const um = (u) => ({ exit: u.exit, after: u.after, dl: u.downloads15, workers: u.workers, errors: u.errors, unpkg: u.unpkg });
  console.log(JSON.stringify({ vp: vpArg, g: R.g, unmountMp3: um(R.unmountMp3), unmountRender: um(R.unmountRender), vis: R.vis, wavCancel: { valid: R.wavCancel.valid, click: R.wavCancel.clickProbe, status: R.wavCancel.after && R.wavCancel.after.status, dl: R.wavCancel.downloadsIn15s }, wavWorkers: R.wavWorkers, visErrors: R.visErrors }, null, 1));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
