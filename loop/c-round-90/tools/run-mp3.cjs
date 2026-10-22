// CX-LOAD, MP3 done (CX-DONE-REG), CX-MP3-RENDER, CX-MP3, CX-BOTH, PX-NET per viewport
const X = require('./lib90.cjs');
const vpArg = process.argv[2] || '1440x900';
const [w, h] = vpArg.split('x').map(Number);
(async () => {
  const b = await X.launch();
  const { ctx, page, S } = await X.newCtx(b, { width: w, height: h }, `mp3-${vpArg}`);
  const R = { vp: vpArg };
  const hung = [];
  await page.route(/unpkg\.com/, (route) => { hung.push({ t: Date.now(), u: route.request().url().split('/').pop() }); /* never respond */ });
  R.scope = await X.setup(page, 2);
  R.unpkgBeforeMp3Click = S.unpkg.length;
  await X.selectFormat(page, 'mp3');
  R.unpkgAfterRadio = S.unpkg.length;
  R.load = await X.exportAndCancel(page, 'load', { timeout: 120000, gate: process.env.HUNG ? () => hung.length > 0 : null });
  R.load.hungAtCancel = hung.length; R.load.workersAtEnd = S.workers.map((x) => ({ ...x }));
  R.load.hung = hung.slice();
  await page.screenshot({ path: `${X.SHOTS}/cx-load-${vpArg}.png` });
  await page.unroute(/unpkg\.com/);
  R.mp3After = await X.exportFull(page);
  R.mp3After.dec = [];
  for (const f of R.mp3After.files) if (f.file) R.mp3After.dec.push({ name: f.name, ...(await X.mp3Decode(page, f.file)) });
  // encoder cached: cancel in render
  R.mp3Render = await X.exportAndCancel(page, 'render');
  R.mp3RenderNext = await X.exportFull(page);
  R.mp3RenderNext.dec = [];
  for (const f of R.mp3RenderNext.files) if (f.file) R.mp3RenderNext.dec.push({ name: f.name, ...(await X.mp3Decode(page, f.file)) });
  // cancel in mp3 phase
  R.mp3 = await X.exportAndCancel(page, 'mp3', { maxPct: 90 });
  await page.screenshot({ path: `${X.SHOTS}/cx-mp3-${vpArg}.png` });
  R.mp3Next = await X.exportFull(page);
  R.mp3Next.dec = [];
  for (const f of R.mp3Next.files) if (f.file) R.mp3Next.dec.push({ name: f.name, ...(await X.mp3Decode(page, f.file)) });
  // WAV + MP3: cancel in mp3 phase
  await X.selectFormat(page, 'both');
  R.both = await X.exportAndCancel(page, 'mp3', { maxPct: 90 });
  R.tl = await page.evaluate(() => window.__c90.tl.slice());
  R.S = S;
  X.save(`mp3-${vpArg}${process.env.HUNG ? "-hung" : ""}.json`, R);
  const sm = (a) => a && ({ valid: a.valid, lbl: a.labelBeforeClick, click: a.clickProbe, ms: a.msToCancelled, status: a.after && a.after.status, cls: a.after && a.after.statusClass, alert: a.after && a.after.alert, cancel: a.after && a.after.cancel, btns: a.after && a.after.buttons, active: a.after && a.after.active, finalStatus: a.final && a.final.status, dl: a.downloadsIn15s, unpkg: a.unpkgDuring, reason: a.reason, seen: a.seen && a.seen.slice(-4) });
  const sf = (a) => a && ({ status: a.final.status, alert: a.final.alert, files: a.files.map((f) => [f.name, f.size]), dec: a.dec, unpkg: a.unpkgDuring, ms: a.ms });
  console.log(JSON.stringify({ vp: vpArg, scope: R.scope, unpkgBefore: R.unpkgBeforeMp3Click, unpkgAfterRadio: R.unpkgAfterRadio, load: { ...sm(R.load), hung: R.load.hung }, mp3After: sf(R.mp3After), mp3Render: sm(R.mp3Render), mp3RenderNext: sf(R.mp3RenderNext), mp3: sm(R.mp3), mp3Next: sf(R.mp3Next), both: sm(R.both), errors: S.errors, forbidden: S.forbidden, auth: S.authHeaders, third: [...new Set(S.thirdParty)], workers: S.workers, unpkgAll: S.unpkg.map((x) => x.f) }, null, 1));
  await ctx.close(); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
