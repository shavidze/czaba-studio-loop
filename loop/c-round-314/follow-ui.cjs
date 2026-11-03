// C314 FOLLOW-UI: real clicks on arrangement-follow during playback; samples scrollLeft.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path');
const [w, h] = (process.argv[2] || '1440x900').split('x').map(Number); const k = `${w}x${h}`;
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
  const out = { vp: k, steps: [] }; const log = (s) => { out.steps.push(s); console.log(JSON.stringify(s)); };
  await p.goto('http://127.0.0.1:5173/studio-lab');
  await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 120000 });
  const follow = p.getByTestId('arrangement-follow');
  const sl = () => p.getByTestId('arrangement-timeline-scroller').evaluate((n) => n.scrollLeft);
  const mode = () => follow.getAttribute('data-follow-mode');
  const play = p.getByRole('button', { name: 'Play', exact: true });
  const playing = () => play.getAttribute('data-playing');
  const space = async () => { await p.locator('body').evaluate(() => document.activeElement && document.activeElement.blur()); await p.keyboard.press('Space'); await p.waitForTimeout(500); };
  await p.getByRole('button', { name: 'Add', exact: true }).click(); await p.waitForTimeout(1500);
  log({ s: 'start', mode: await mode(), ariaPressed: await follow.getAttribute('aria-pressed'), scrollLeft: await sl(), clips: await p.locator('[data-clip-kind="audio"]').count() });
  await p.screenshot({ path: path.join(__dirname, 'shots', `follow-0-start-${k}.png`) });
  await play.click(); await p.locator('body').evaluate(() => document.activeElement && document.activeElement.blur());
  await p.waitForTimeout(500); log({ s: 'playing', playing: await playing(), mode: await mode() });
  const s0 = await sl(); const t0 = Date.now(); let turned = null;
  while (Date.now() - t0 < 60000) { const v = await sl(); if (v !== s0) { turned = { after: v, ms: Date.now() - t0 }; break; } await p.waitForTimeout(100); }
  log({ s: 'page-turn-on', before: s0, turned, mode: await mode(), playing: await playing() });
  await p.screenshot({ path: path.join(__dirname, 'shots', `follow-1-on-pageturn-${k}.png`) });
  let clicks = 0; while ((await mode()) !== 'off' && clicks < 3) { await follow.click(); clicks += 1; log({ s: 'click', clicks, mode: await mode() }); }
  await p.locator('body').evaluate(() => document.activeElement && document.activeElement.blur());
  const offStart = await sl(); const samples = []; const ts = Date.now();
  while (Date.now() - ts < 5000) { samples.push(await sl()); await p.waitForTimeout(250); }
  const distinct = [...new Set(samples)];
  const playhead = await p.evaluate(() => { const e = document.querySelector('[data-testid="arrangement-playhead"]'); return e ? e.getBoundingClientRect().x : null; });
  log({ s: 'off-5s', mode: await mode(), ariaPressed: await follow.getAttribute('aria-pressed'), offStart, nSamples: samples.length, distinct, playing: await playing(), playheadX: playhead });
  await p.screenshot({ path: path.join(__dirname, 'shots', `follow-2-off-${k}.png`) });
  // doc-163 claim: Follow off survives Stop/Play
  await space(); const afterStop = { playing: await playing(), mode: await mode() };
  await space(); const afterReplay = { playing: await playing(), mode: await mode() };
  log({ s: 'off-stop-play', afterStop, afterReplay });
  // wait for playhead to run off-screen with off, then turn on
  await p.waitForTimeout(6000); const offEnd = await sl();
  await follow.click(); await p.waitForTimeout(800);
  log({ s: 'on-again', mode: await mode(), ariaPressed: await follow.getAttribute('aria-pressed'), offEnd, scrollAfterOn: await sl(), playing: await playing() });
  await p.screenshot({ path: path.join(__dirname, 'shots', `follow-3-on-again-${k}.png`) });
  await space(); log({ s: 'stopped', playing: await playing(), mode: await mode() });
  out.errors = errs;
  out.pass = out.steps.find((x) => x.s === 'stopped').playing === 'false' && out.steps.find((x) => x.s === 'off-5s').distinct.length === 1 && out.steps.find((x) => x.s === 'off-5s').mode === 'off' && out.steps.find((x) => x.s === 'on-again').mode === 'on' && errs.length === 0;
  fs.writeFileSync(path.join(__dirname, `follow-ui-${k}.json`), JSON.stringify(out, null, 1)); await b.close();
})();
