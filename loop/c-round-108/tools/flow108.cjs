// C r107 user-flow smoke: find sound -> add (3 demo sources) -> Fit -> real WAV export; verify file data
const X = require('./lib107.cjs'); const { sleep } = X;
const VPS = process.argv[2] || '1280x720'; const VP = { width: +VPS.split('x')[0], height: +VPS.split('x')[1] };
(async () => {
  const b = await X.launch(); const { page: p, S } = await X.newCtx(b, VP, 'flow108');
  const R = {};
  try {
    R.scopeLabel = await X.setup(p, 0);
    await X.selectFormat(p, 'wav');
    R.exp = await X.exportFull(p);
    R.files = R.exp.files.map((f) => ({ name: f.name, size: f.size, info: f.file && /\.wav$/i.test(f.name) ? X.wavInfo(f.file) : null }));
    R.clips = await p.$$eval('[data-clip-id]', (els) => els.map((e) => ({ lane: e.closest('[data-track-id]').getAttribute('data-track-id'), start: e.getAttribute('data-clip-start') })));
    R.projectLen = await p.evaluate(() => document.querySelector('[data-testid=arrangement-project-length]')?.textContent ?? null);
    await p.screenshot({ path: `${X.SHOTS}/flow108-${VPS}.png` });
  } catch (e) { R.exception = String(e.stack || e); }
  R.S = { errors: S.errors, forbidden: S.forbidden, auth: S.authHeaders, third: [...new Set(S.thirdParty)] };
  X.save(`flow108-${VPS}.json`, R); console.log(JSON.stringify(R, null, 1)); await b.close();
})();
