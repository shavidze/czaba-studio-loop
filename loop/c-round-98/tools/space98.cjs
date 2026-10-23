// C round 98: Space on focused toolbar Export — observed path (late bubble listener + playback flip with 1 clip)
const X = require('./lib98.cjs'); const { sleep, blur } = X;
const vpArg = process.argv[2] || '1280x720'; const [w, h] = vpArg.split('x').map(Number);
(async () => {
  const b = await X.launch(); const { ctx, page: p, S } = await X.newCtx(b, { width: w, height: h }, `space-${vpArg}`);
  await p.goto(X.URL, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(3000);
  for (let i = 0; i < 20; i++) { const d = await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Decline'); if (x) { x.click(); return true; } return false; }); if (d) break; await sleep(250); }
  await sleep(300);
  await p.evaluate(() => { window.__late = []; window.addEventListener('keydown', (e) => window.__late.push({ type: 'keydown', key: e.key, repeat: e.repeat, dp: e.defaultPrevented, active: (document.activeElement?.textContent || '').trim().slice(0, 20) })); window.addEventListener('keyup', (e) => window.__late.push({ type: 'keyup', key: e.key, dp: e.defaultPrevented })); window.addEventListener('click', (e) => window.__late.push({ type: 'click', target: (e.target?.textContent || '').trim().slice(0, 20) }), true); });
  const playLabel = () => p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^(Play|Pause)$/.test(x.getAttribute('aria-label') || '')); return b ? b.getAttribute('aria-label') : null; });
  const dlg = () => p.evaluate(() => !!document.querySelector('#arrangement-export-title'));
  const pos = () => p.evaluate(() => document.querySelector('[data-testid=arrangement-transport-position]')?.textContent ?? document.querySelector('[aria-label*=position i]')?.textContent ?? null);
  const R = { vp: vpArg };
  const exp = p.getByRole('button', { name: 'Export', exact: true });
  // empty project
  await exp.focus(); await p.evaluate(() => { window.__late.length = 0; });
  R.empty = { play0: await playLabel() }; await p.keyboard.press('Space'); await sleep(400);
  R.empty.play1 = await playLabel(); R.empty.dialog = await dlg(); R.empty.events = await p.evaluate(() => window.__late.slice());
  // one clip
  const o = p.locator('[role=option][data-source-id="demo-middle-east"]'); await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  await o.click(); await sleep(200); await p.keyboard.press('Enter'); await sleep(900);
  R.clips = await p.evaluate(() => document.querySelectorAll('[data-clip-id]').length);
  await blur(p); await exp.focus(); R.focused = await p.evaluate(() => document.activeElement?.textContent?.trim());
  await p.evaluate(() => { window.__late.length = 0; });
  R.withClip = { play0: await playLabel() };
  await p.keyboard.press('Space'); await sleep(1500);
  R.withClip.play1 = await playLabel(); R.withClip.dialog = await dlg(); R.withClip.active = await p.evaluate(() => document.activeElement?.textContent?.trim());
  await p.screenshot({ path: `${X.SHOTS}/space-export-playing-${vpArg}.png` });
  await p.keyboard.press('Space'); await sleep(500);
  R.withClip.play2 = await playLabel(); R.withClip.dialog2 = await dlg();
  R.withClip.events = await p.evaluate(() => window.__late.slice());
  R.errors = S.errors; R.forbidden = S.forbidden; R.auth = S.authHeaders;
  X.save(`space98-${vpArg}.json`, R); console.log(JSON.stringify(R)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
