// CX-RENDER + CX-WAVPHASE + re-export WAV (CX-DONE-REG wav part) per viewport
const X = require('./lib90.cjs');
const vpArg = process.argv[2] || '1440x900';
const [w, h] = vpArg.split('x').map(Number);
(async () => {
  const b = await X.launch();
  const { ctx, page, S } = await X.newCtx(b, { width: w, height: h }, `render-${vpArg}`);
  const R = { vp: vpArg };
  R.scope = await X.setup(page, 2);
  R.idle = await X.probe(page);
  await X.selectFormat(page, 'wav');
  R.render = [];
  for (let i = 0; i < 3 && R.render.filter((x) => x.valid).length < 1; i++) R.render.push(await X.exportAndCancel(page, 'render', { maxPct: 100 }));
  await page.screenshot({ path: `${X.SHOTS}/cx-render-${vpArg}.png` });
  R.wavphase = [];
  for (let i = 0; i < 5 && R.wavphase.filter((x) => x.valid).length < 1; i++) R.wavphase.push(await X.exportAndCancel(page, 'wav'));
  R.reexport = await X.exportFull(page);
  R.reexport.wav = R.reexport.files.map((f) => f.file && X.wavInfo(f.file));
  R.expectFrames = Math.ceil(304.406 * 48000);
  R.tl = await page.evaluate(() => window.__c90.tl.slice(-60));
  R.S = S;
  X.save(`render-${vpArg}.json`, R);
  console.log(JSON.stringify({ ...R, tl: undefined, S: { errors: S.errors, downloads: S.downloads.map((d) => d.name), unpkg: S.unpkg.length, forbidden: S.forbidden, auth: S.authHeaders, workers: S.workers } }, null, 1).slice(0, 9000));
  await ctx.close(); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
