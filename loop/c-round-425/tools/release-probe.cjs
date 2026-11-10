// B round 306 -> 307 premise probe for PERF-COMMIT-RESCHEDULE (L37). args: base out W H
// Builds 30 clips (Add + 29 x Ctrl+D), plays from Home, then per drag kind (fade, trim on clip 1; v2: the move-last
// part was removed because its drag never committed in v1, see head-1440-v1-with-invalid-move.json) measures from pointerup: start() calls (non-offline), Event Timing pointerup duration,
// LoAF max/script in [up, up+800], the span of the synchronous start() burst, position before/after, scrollLeft and
// whether playback is still running. Each drag is undone with Ctrl+Z (one more release-like restart, measured separately).
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const [base, out, W = '1440', H = '900'] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: Number(W), height: Number(H) } });
  await page.addInitScript(() => {
    window.__st = []; window.__ev = []; window.__loaf = [];
    for (const C of [AudioBufferSourceNode]) {
      const s = C.prototype.start;
      C.prototype.start = function (...a) { s.apply(this, a); if (!(this.context instanceof OfflineAudioContext)) window.__st.push(performance.now()); };
    }
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__ev.push({ n: e.name, t: e.startTime, d: e.duration, p: e.processingEnd - e.processingStart }); })
      .observe({ type: 'event', durationThreshold: 16, buffered: true });
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loaf.push({ t: e.startTime, d: e.duration, script: (e.scripts || []).reduce((a, s) => a + s.duration, 0) }); }).observe({ type: 'long-animation-frame', buffered: true }); } catch {}
  });
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /^Demo collection ready/ }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByTestId('arrangement-clip-waveform').first().waitFor();
  const first = page.locator('[data-clip-id]').first();
  const box = await first.boundingBox();
  await page.mouse.click(box.x + 20, box.y + 6);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let i = 1; i < 30; i++) await page.keyboard.press('Control+d');
  await page.waitForTimeout(1500);
  const clips = await page.locator('[data-clip-id]').count();
  const pos = () => page.getByTestId('arrangement-position').textContent();
  const playing = () => page.evaluate(() => document.querySelector('[data-playing]')?.getAttribute('data-playing'));
  const scrollLeft = () => page.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press('Home');
  await page.keyboard.press('Space');
  await page.waitForTimeout(1500);
  const res = { viewport: [W, H], clips, playingAtStart: await playing(), drags: [] };
  const measureRelease = async (label, act) => {
    await page.evaluate(() => { window.__st = []; window.__ev = []; window.__loaf = []; });
    const p0 = await pos();
    const sl0 = await scrollLeft();
    const tUp = await act();
    await page.waitForTimeout(800);
    const r = await page.evaluate((up) => {
      const st = window.__st.filter((t) => t >= up);
      const loaf = window.__loaf.filter((x) => x.t + x.d >= up);
      const ev = window.__ev.filter((x) => x.t >= up - 5);
      return { starts: st.length, burstMs: st.length ? Math.round((st[st.length - 1] - st[0]) * 10) / 10 : 0, firstStartAfterUpMs: st.length ? Math.round((st[0] - up) * 10) / 10 : null, loafMax: Math.round(Math.max(0, ...loaf.map((x) => x.d))), loafScriptMax: Math.round(Math.max(0, ...loaf.map((x) => x.script))), events: ev.map((x) => `${x.n}:${Math.round(x.d)}/${Math.round(x.p)}`) };
    }, tUp);
    res.drags.push({ label, ...r, posBefore: p0, posAfter: await pos(), scrollBefore: sl0, scrollAfter: await scrollLeft(), playing: await playing() });
  };
  const drag = async (loc) => {
    await loc.scrollIntoViewIfNeeded();
    const b = await loc.boundingBox();
    const x = b.x + Math.min(b.width / 2, 8), y = b.y + b.height * 0.5;
    await page.mouse.move(x, y); await page.mouse.down();
    await page.mouse.move(x + 120, y, { steps: 60 });
    const up = await page.evaluate(() => performance.now());
    await page.mouse.up();
    return up;
  };
  const undo = async () => { await page.evaluate(() => document.activeElement && document.activeElement.blur()); const t = await page.evaluate(() => performance.now()); await page.keyboard.press('Control+z'); return t; };
  for (let pass = 1; pass <= 3; pass++) {
    await page.keyboard.press('Home'); await page.waitForTimeout(600);
    await measureRelease(`fade p${pass}`, () => drag(first.getByTestId('arrangement-clip-fade-in-handle')));
    await measureRelease(`undo-fade p${pass}`, undo);
    await page.keyboard.press('Home'); await page.waitForTimeout(600);
    await measureRelease(`trim p${pass}`, () => drag(first.getByTitle('Trim — left edge', { exact: true })));
    await measureRelease(`undo-trim p${pass}`, undo);
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
