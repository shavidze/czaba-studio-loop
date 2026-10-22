// Neighbour: CDN failure (unpkg aborted) without cancel -> existing load-failure alert; then next MP3 succeeds
const X = require('./lib90.cjs'); const { sleep } = X;
const vpArg = process.argv[2] || '1280x720'; const [w, h] = vpArg.split('x').map(Number);
const EXP = 'MP3 encoder ვერ ჩაიტვირთა (ffmpeg.wasm, unpkg CDN) — ფაილი არ შეიქმნა. შეამოწმე ინტერნეტი და სცადე თავიდან, ან აირჩიე WAV.';
(async () => {
  const b = await X.launch(); const { ctx, page: p, S } = await X.newCtx(b, { width: w, height: h }, `cdn-${vpArg}`);
  await p.route(/unpkg\.com/, (r) => r.abort());
  const R = { vp: vpArg }; R.scope = await X.setup(p, 2); await X.selectFormat(p, 'mp3');
  R.fail = await X.exportFull(p, { timeout: 150000 });
  R.failDetail = await p.evaluate(() => { const d = document.querySelector('#arrangement-export-title').closest('[role=dialog]'); const a = d.querySelector('[role=alert]'); const s = d.querySelector('[data-testid=arrangement-export-footer] [role=status]'); return { alert: a && a.textContent, alertClass: a && a.className, status: s && s.textContent }; });
  R.failExact = R.failDetail.alert === EXP;
  await p.unroute(/unpkg\.com/);
  R.next = await X.exportFull(p); R.next.dec = []; for (const f of R.next.files) if (f.file) R.next.dec.push(await X.mp3Decode(p, f.file));
  R.errors = S.errors; X.save(`cdnfail-${vpArg}.json`, R);
  console.log(JSON.stringify({ failMs: R.fail.ms, failDetail: R.failDetail, failExact: R.failExact, failFiles: R.fail.files.map((f) => f.name), closeDisabled: R.fail.final.closeDisabled, cancel: R.fail.final.cancel, active: R.fail.final.active, unpkgFail: R.fail.unpkgDuring, next: { status: R.next.final.status, files: R.next.files.map((f) => f.name), dec: R.next.dec, unpkg: R.next.unpkgDuring }, errors: R.errors }, null, 1));
  await ctx.close(); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
