// B round 284: per-frame visible-tick coverage during Follow playback at high zoom. args: base out W H [bpm]
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const [base, out, W = '1440', H = '900', bpm = ''] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: Number(W), height: Number(H) } });
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /^Demo collection ready/ }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByTestId('arrangement-clip-waveform').first().waitFor();
  const box = await page.locator('[data-clip-id]').first().boundingBox();
  await page.mouse.click(box.x + 20, box.y + 6);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let i = 1; i < 30; i++) await page.keyboard.press('Control+d');
  await page.waitForTimeout(1500);
  if (bpm) { const t = page.getByTestId('arrangement-tempo-input'); await t.click(); await t.fill(bpm); await t.press('Enter'); await page.evaluate(() => document.activeElement && document.activeElement.blur()); }
  for (let i = 0; i < 9; i++) { await page.keyboard.press('='); await page.waitForTimeout(150); }
  await page.waitForTimeout(600);
  await page.evaluate(() => {
    window.__frames = [];
    const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
    const check = (sel, timeAttr) => {
      const marks = [...document.querySelectorAll(sel)];
      const lefts = marks.map((m) => parseFloat(m.style.left));
      const left = sc.scrollLeft, right = sc.scrollLeft + sc.clientWidth - 224;
      // gap = largest distance between consecutive rendered marks (or window edges) inside the visible span
      const xs = lefts.filter((x) => x >= left - 400 && x <= right + 400).sort((a, b) => a - b);
      const inside = xs.filter((x) => x >= left && x <= right);
      const lo = xs.filter((x) => x < left).pop(); const hi = xs.find((x) => x > right);
      return { n: inside.length, coversLeft: lo !== undefined || (inside[0] !== undefined && inside[0] - left < 400), coversRight: hi !== undefined };
    };
    const tick = () => {
      if (window.__stop) return;
      const r = document.querySelector('[data-testid=arrangement-ruler]');
      const ticks = [...document.querySelectorAll('[data-testid=arrangement-ruler-tick]')];
      const step = Number(r.getAttribute('data-tick-step'));
      const width = parseFloat(r.style.width);
      const px = ticks.length > 1 ? (parseFloat(ticks[1].style.left) - parseFloat(ticks[0].style.left)) / (Number(ticks[1].dataset.time) - Number(ticks[0].dataset.time)) : NaN;
      const vp = sc.clientWidth - 224;
      const have = new Set(ticks.map((t) => Number(t.dataset.time).toFixed(3)));
      let missing = 0;
      for (let k = Math.ceil(sc.scrollLeft / (step * px)); k * step * px <= Math.min(sc.scrollLeft + vp, width - 1); k++) if (!have.has((k * step).toFixed(3))) missing++;
      window.__frames.push({ t: performance.now(), sl: sc.scrollLeft, sRight: missing === 0, sN: ticks.length, bRight: true, bN: 0 });
      requestAnimationFrame(() => setTimeout(tick, 0));
    };
    requestAnimationFrame(() => setTimeout(tick, 0));
  });
  const sc = await page.getByTestId('arrangement-timeline-scroller').boundingBox();
  const rb = await page.getByTestId('arrangement-ruler').boundingBox();
  await page.mouse.click(Math.min(sc.x + sc.width - 60, rb.x + rb.width - 5), rb.y + rb.height - 4);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.keyboard.press('Space');
  await page.waitForTimeout(8000);
  await page.keyboard.press('Space');
  const frames = await page.evaluate(() => { window.__stop = true; return window.__frames; });
  // runs of frames where the seconds ruler does not reach past the right edge
  const runs = (key) => { const r = []; let cur = 0; for (const f of frames) { if (!f[key]) cur++; else if (cur) { r.push(cur); cur = 0; } } if (cur) r.push(cur); return r; };
  const flips = frames.filter((f, i) => i > 0 && f.sl !== frames[i - 1].sl).length;
  const firstGap = frames.findIndex((f) => !f.sRight); const res = { W, bpm, frames: frames.length, flips, firstGap, around: firstGap < 0 ? [] : frames.slice(Math.max(0, firstGap - 3), firstGap + 4).map((f) => ({ t: Math.round(f.t - frames[0].t), sl: f.sl, sN: f.sN, sRight: f.sRight, bRight: f.bRight })), lastGapFrame: frames.length - 1 - [...frames].reverse().findIndex((f) => !f.sRight), slEnd: frames[frames.length - 1].sl, slChanges: frames.filter((f, i) => i > 0 && f.sl !== frames[i - 1].sl).map((f) => [Math.round(f.t - frames[0].t), f.sl]), secondsGapRuns: runs('sRight'), barsGapRuns: bpm ? runs('bRight') : null };
  require('fs').writeFileSync(out, JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
