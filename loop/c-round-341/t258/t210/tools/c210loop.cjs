// C round 210 — AUDIO (b): playing a short loop that wraps mid-drag. The graph rebuilt at each wrap must carry the
// dragged gain, not the stored one. usage: node c210loop.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c210lib.cjs');
const path = require('path');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4] || 1440), Number(process.argv[5] || 900)];

async function makeLoop(page, px) {
  const clip = await page.evaluate(() => { const c = document.querySelector('[data-clip-id]'); const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const y = clip.y + 40;
  await page.mouse.move(clip.x + 30, y);
  await page.mouse.down();
  await page.mouse.move(clip.x + 30 + px, y, { steps: 12 });
  await page.mouse.up();
  await L.sleep(400);
  const range = await page.evaluate(() => (document.querySelector('[data-testid=arrangement-range]') || {}).textContent || null);
  await L.blurActive(page);
  await page.keyboard.press('Control+l');
  await L.sleep(500);
  const times = await page.evaluate(() => (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent || null);
  // put the playhead at the loop start: click on the clip at the same x would select; use Home if supported
  return { range, times, status: await L.statusText(page), clip };
}

async function run(page, loc, label, startDb, R) {
  const o = {};
  o.key = await L.keyTo(page, loc, startDb, 'ArrowDown');
  if ((await L.playState(page)) !== 'Pause') await L.space(page, 'Pause');
  await L.sleep(300);
  const tA = await L.now(page);
  o.drag = await L.drag(page, loc, label, { perMove: true, delay: 25, keepSeq: true, shot: path.join(L.SHOTS, `${tag}-loop-${label}-mid.png`) });
  // analyse wraps: source starts during the drag; for each, the params first written within 80 ms after it
  o.wraps = await page.evaluate((tA) => {
    const s = window.__c;
    const down = s.downs.filter((t) => t >= tA).at(-1);
    const up = s.ups.find((t) => t > down);
    const starts = s.starts.filter((t) => t > down && t < up);
    const bursts = [];
    for (const t of starts) if (!bursts.length || t - bursts.at(-1).t > 50) bursts.push({ t, n: 1 }); else bursts.at(-1).n += 1;
    const seen = new Set(s.gw.filter((w) => w.t < down).map((w) => w.id));
    return bursts.map((b) => {
      const firstWrites = {};
      for (const w of s.gw) {
        if (w.t >= b.t - 80 && w.t <= b.t + 80 && !seen.has(w.id) && !(w.id in firstWrites)) firstWrites[w.id] = Math.round(w.v * 1e4) / 1e4;
      }
      for (const id of Object.keys(firstWrites)) seen.add(Number(id));
      const inBefore = s.inputs.filter((x) => x.t <= b.t).at(-1);
      const inAfter = s.inputs.filter((x) => x.t > b.t && x.t < b.t + 80);
      return { dt: Math.round(b.t - down), starts: b.n, sliderAtWrap: inBefore ? inBefore.v : null, inputsWithin80ms: inAfter.map((x) => x.v), newParamFirstWrites: firstWrites };
    });
  }, tA);
  o.undo = await L.undoCheck(page, loc);
  R[label] = o;
}

(async () => {
  const browser = await L.launch();
  const R = { base, tag, vw, vh, utc: new Date().toISOString() };
  try {
    const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
    R.loop = await makeLoop(page, 40);
    await page.screenshot({ path: path.join(L.SHOTS, `${tag}-loop-made.png`) });
    await run(page, L.sl(page, 'Volume — Music'), 'track', -12, R);
    await run(page, L.sl(page, 'Master Volume'), 'master', -6, R);
    await L.space(page, 'Play');
    const gv = await L.makeGroup(page);
    await run(page, gv, 'group', -12, R);
    await L.space(page, 'Play');
    R.errors = errors;
    await ctx.close();
  } catch (e) {
    R.fatal = String(e && e.stack || e).slice(0, 1500);
  }
  await browser.close();
  L.save(`loop-${tag}.json`, R);
  console.log('done', tag, R.fatal || '');
})();
