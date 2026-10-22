// WAV5-REG (both viewports) + CX-WAVPHASE-R (1280)
const X = require('./lib91.cjs');
const vpArg = process.argv[2] || '1280x720'; const [w, h] = vpArg.split('x').map(Number);
const WARN = 'გადატვირთვა: პიკი +1.7 dBFS — 498 sample შეიზღუდა 0 dBFS-ზე. შეამცირე Master მინიმუმ 1.8 dB-ით და გაიმეორე ექსპორტი.';
const DONE = 'WAV შეიქმნა: 05:04.406, 24-bit · 48 kHz · stereo.';
(async () => {
  const b = await X.launch(); const { ctx, page, S } = await X.newCtx(b, { width: w, height: h }, `wav5-${vpArg}`);
  const R = { vp: vpArg }; R.scope = await X.setup(page, 2); await X.selectFormat(page, 'wav');
  const ex = (r) => ({ status: r.final.status, statusExact: r.final.status === DONE, alert: r.final.alert, alertExact: r.final.alert === WARN, files: r.files.map((f) => [f.name, f.size]), wav: r.files.map((f) => f.file && X.wavInfo(f.file)) });
  R.first = ex(await X.exportFull(page));
  await page.screenshot({ path: `${X.SHOTS}/wav5-done-${vpArg}.png` });
  if (process.argv[3] === 'cancel') {
    R.wavphase = [];
    for (let i = 0; i < 5 && R.wavphase.filter((x) => x.valid).length < 1; i++) { const nW = S.workers.length; const c = await X.exportAndCancel(page, 'wav'); c.workers = S.workers.slice(nW).map((x) => ({ ...x })); const tt = await page.evaluate(() => ({ o: performance.timeOrigin, t0: window.__c90.t0 })); c.clickWall = c.clickProbe ? Math.round(tt.o + tt.t0 + c.clickProbe.t) : null; c.workerClosedMsAfterClick = c.clickWall && c.workers[0] && c.workers[0].closed ? c.workers[0].closed - c.clickWall : null; R.wavphase.push(c); }
    await page.screenshot({ path: `${X.SHOTS}/cx-wavphase-${vpArg}.png` });
    R.next = ex(await X.exportFull(page));
  }
  R.workers = S.workers; R.errors = S.errors; R.forbidden = S.forbidden; R.auth = S.authHeaders; R.unpkg = S.unpkg; R.third = [...new Set(S.thirdParty)];
  X.save(`wav5-${vpArg}${process.argv[4]||''}.json`, R);
  console.log(JSON.stringify({ ...R, wavphase: R.wavphase && R.wavphase.map((a) => ({ valid: a.valid, lbl: a.labelBeforeClick, click: a.clickProbe, ms: a.msToCancelled, status: a.after.status, final: a.final.status, dl: a.downloadsIn15s, workers: a.workers, clickWall: a.clickWall, closedAfterClick: a.workerClosedMsAfterClick, reason: a.reason, seen: a.seen && a.seen.slice(-3) })) }, null, 1));
  await ctx.close(); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
