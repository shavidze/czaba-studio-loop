// C round 212 — LATENCY-212: C's own move-to-paint probe (pointermove -> rAF -> MessageChannel), written by C, no perf/ imports.
// usage: node c212lat.cjs <baseUrl> <tag> <vw> <vh> <runs> [modes comma list: stopped,playing,members-stopped,members-playing]
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const L = require('./c212lib.cjs');
const [base, tag, vw, vh, runs] = [process.argv[2], process.argv[3], Number(process.argv[4]), Number(process.argv[5]), Number(process.argv[6] || 3)];
const modes = (process.argv[7] || 'stopped,playing').split(',');
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
async function one(browser, mode) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_analytics_consent', 'denied'); } catch (e) {} });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.getByRole('button', { name: 'Add', exact: true }).first().waitFor({ timeout: 90000 });
  await L.sleep(2500);
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  await L.sleep(2000);
  const tg = page.getByTestId('arrangement-detail-toggle');
  if ((await tg.count()) && (await tg.getAttribute('aria-expanded')) === 'false') { await tg.click(); await L.sleep(600); }
  let sel;
  if (mode.startsWith('members')) sel = await L.addMembers(page, null);
  else sel = { id: await L.selectFirstClip(page) };
  const f = L.sl(page, 'Clip Gain — fader');
  await f.scrollIntoViewIfNeeded();
  const box = await f.boundingBox();
  const detailSvg = await page.evaluate(() => !!document.querySelector('[data-testid=arrangement-detail-waveform] svg[viewBox$=" 2"]'));
  const playing = mode.endsWith('playing');
  if (playing) await L.space(page, 'Pause');
  const stateBefore = await L.playState(page);
  const thr = Number(process.env.THROTTLE || 1);
  if (thr > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: thr }); await L.sleep(500); }
  await page.evaluate(() => {
    window.__lat = [];
    addEventListener('pointermove', () => { const t0 = performance.now(); requestAnimationFrame(() => { const c = new MessageChannel(); c.port1.onmessage = () => window.__lat.push(performance.now() - t0); c.port2.postMessage(0); }); }, true);
  });
  const valueBefore = await f.inputValue();
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width * 0.5, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.05, y, { steps: 60 });
  await page.mouse.move(box.x + box.width * 0.95, y, { steps: 60 });
  const stateDuring = await L.playState(page);
  await page.mouse.up();
  await L.sleep(800);
  const lat = await page.evaluate(() => window.__lat.slice());
  const valueAfter = await f.inputValue();
  if (playing) await L.space(page, 'Play');
  await ctx.close();
  const valid = lat.length >= 110 && valueAfter !== valueBefore && (!playing || (stateBefore === 'Pause' && stateDuring === 'Pause')) && errors.length === 0 && (mode.startsWith('members') ? sel.group === 1 : detailSvg);
  return { mode, n: lat.length, p50: +pct(lat, 0.5).toFixed(1), p95: +pct(lat, 0.95).toFixed(1), max: +Math.max(...lat).toFixed(1), valueBefore, valueAfter, stateBefore, stateDuring, detailSvg, group: sel.group ?? null, errors, valid };
}
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const R = { base, tag, vw, vh, utc: new Date().toISOString(), runs: {} };
  for (const mode of modes) {
    R.runs[mode] = [];
    let validN = 0, extra = 0;
    while (validN < runs && extra <= 2) {
      let r;
      try { r = await one(browser, mode); } catch (e) { r = { mode, valid: false, fatal: String(e).slice(0, 300) }; }
      R.runs[mode].push(r);
      if (r.valid) validN += 1; else extra += 1;
      console.log(tag, vw, mode, JSON.stringify({ n: r.n, p50: r.p50, p95: r.p95, valid: r.valid, fatal: r.fatal }));
    }
    const p = R.runs[mode].filter((r) => r.valid).map((r) => r.p95).sort((a, b) => a - b);
    R[mode + '-median-p95'] = p.length ? p[Math.floor(p.length / 2)] : null;
  }
  await browser.close();
  R.throttle = Number(process.env.THROTTLE || 1);
  L.save(`lat-${tag}-${vw}${R.throttle > 1 ? '-x' + R.throttle : ''}.json`, R);
  console.log('medians', tag, vw, modes.map((m) => m + '=' + R[m + '-median-p95']).join(' '));
})();
