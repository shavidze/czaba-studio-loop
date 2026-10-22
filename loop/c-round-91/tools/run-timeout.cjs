// TIMEOUT-TEXT: unpkg never responds; alert at ~120 s; then same-page retry succeeds
const X = require('./lib91.cjs');
const EXP = 'MP3 encoder 120 წამში ვერ ჩაიტვირთა — ფაილი არ შეიქმნა. შეამოწმე ინტერნეტი და სცადე თავიდან, ან აირჩიე WAV.';
const DONE = 'MP3 შეიქმნა: 05:04.406, 48 kHz · stereo.';
(async () => {
  const b = await X.launch(); const { ctx, page, S } = await X.newCtx(b, { width: 1440, height: 900 }, 'timeout-1440x900');
  const hung = []; await page.route(/unpkg\.com/, (route) => { hung.push({ t: Date.now(), u: route.request().url().split('/').pop() }); });
  const R = {}; R.scope = await X.setup(page, 2); R.unpkgBefore = S.unpkg.length; await X.selectFormat(page, 'mp3');
  const navCount = { n: 0 }; page.on('framenavigated', (f) => { if (f === page.mainFrame()) navCount.n++; });
  const eb = await X.exportBtnBox(page); const dl0 = S.downloads.length;
  const t0 = Date.now(); await page.mouse.click(eb.x, eb.y); let tLoad = null; let pr;
  while (Date.now() - t0 < 170000) { pr = await X.probe(page); if (!tLoad && pr.label === 'MP3 encoder-ის ჩატვირთვა…') tLoad = Date.now(); if (pr.alert && !/გადატვირთვა: პიკი/.test(pr.alert)) break; await X.sleep(50); }
  const tA = Date.now();
  R.timeout = { msFromClick: tA - t0, msFromLoadLabel: tLoad ? tA - tLoad : null, alert: pr.alert, exact: pr.alert === EXP, role: await page.evaluate(() => { const d = document.querySelector('#arrangement-export-title').closest('[role=dialog]'); const a = [...d.querySelectorAll('[role=alert]')]; return a.map((x) => ({ t: x.textContent.slice(0, 40), cls: x.className })); }), closeDisabled: pr.closeDisabled, cancel: pr.cancel, buttons: pr.buttons, hung: hung.slice() };
  await X.sleep(3000); R.timeout.downloads = S.downloads.slice(dl0).map((d) => d.name);
  await page.screenshot({ path: `${X.SHOTS}/timeout-1440x900.png` });
  await page.unroute(/unpkg\.com/);
  const r = await X.exportFull(page);
  R.retry = { status: r.final.status, exact: r.final.status === DONE, alert: r.final.alert, files: r.files.map((f) => [f.name, f.size]), unpkg: r.unpkgDuring, dec: [] };
  for (const f of r.files) if (f.file) R.retry.dec.push(await X.mp3Decode(page, f.file));
  R.navigationsAfterSetup = navCount.n;
  await page.screenshot({ path: `${X.SHOTS}/timeout-retry-1440x900.png` });
  R.workers = S.workers; R.errors = S.errors; R.forbidden = S.forbidden; R.auth = S.authHeaders; R.unpkg = S.unpkg; R.third = [...new Set(S.thirdParty)];
  X.save('timeout-1440x900.json', R); console.log(JSON.stringify(R, null, 1));
  await ctx.close(); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
