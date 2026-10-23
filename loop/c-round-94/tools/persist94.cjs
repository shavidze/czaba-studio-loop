// STATUS-PERSIST 1440
const X = require('./ext.cjs'); const { sleep } = X;
const AUD = /\.(mp3|wav|ogg|flac|m4a)(\?|$)/;
(async () => {
  const b = await X.launch(); const { ctx, page: p, S } = await X.newCtx(b, { width: 1440, height: 900 }, 'persist');
  const R = { audio: {}, hyd: [], steps: [] };
  p.on('request', (q) => { const u = q.url(); if (AUD.test(u)) { const k = u.replace(X.BASE, ''); R.audio[k] = (R.audio[k] || 0) + 1; } });
  p.on('console', (m) => { if (/hydrat|did not match|server rendered/i.test(m.text())) R.hyd.push(m.text().slice(0, 200)); });
  await p.goto(X.URL, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 120000 });
  R.ready = await X.waitStatus(p, (s) => s === X.READY);
  const exp = await p.getByRole('button', { name: 'Export', exact: true }); R.exportDisabledEmpty = await exp.isDisabled();
  await X.blur(p); await p.mouse.click(700, 880); await X.blur(p);
  await p.keyboard.press('Control+l'); await sleep(500);
  const T = await X.status(p); R.afterCtrlL = T; R.steps.push(['ctrlL', T]);
  await p.screenshot({ path: `${X.SHOTS}/persist-ctrlL.png` });
  await sleep(5000); R.steps.push(['wait5s', await X.status(p)]);
  await X.blur(p); await exp.click(); await p.waitForSelector('#arrangement-export-title'); await sleep(500);
  R.steps.push(['exportOpen', await X.status(p)]);
  await p.keyboard.press('Escape'); await sleep(600); R.dialogClosed = (await p.$('#arrangement-export-title')) === null;
  R.steps.push(['exportClosed', await X.status(p)]);
  await p.setViewportSize({ width: 1280, height: 720 }); await sleep(1200); R.steps.push(['vp1280', await X.status(p)]);
  await p.screenshot({ path: `${X.SHOTS}/persist-1280.png` });
  await p.setViewportSize({ width: 1440, height: 900 }); await sleep(1200); R.steps.push(['vp1440', await X.status(p)]);
  await p.screenshot({ path: `${X.SHOTS}/persist-1440.png` });
  R.errors = S.errors; R.forbidden = S.forbidden; R.auth = S.authHeaders; R.unpkg = S.unpkg;
  R.pass = R.ready === X.READY && T !== X.READY && !!T && R.steps.every(([, s]) => s === T) && Object.keys(R.audio).length === 2 && Object.values(R.audio).every((n) => n === 1) && R.hyd.length === 0 && R.errors.length === 0 && R.dialogClosed;
  X.save('persist-1440.json', R); console.log(JSON.stringify(R, null, 1)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
