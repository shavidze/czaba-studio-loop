// C round 211 — AUDIO-211 (b) loop wrap mid-drag, (c) Space mid-drag; single and members. MEMBERS-211 live part.
// usage: node c211audio.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c211lib.cjs');
const path = require('path');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4] || 1440), Number(process.argv[5] || 900)];
const fader = (page) => L.sl(page, 'Clip Gain — fader');

async function makeLoop(page, px) {
  const clip = await page.evaluate(() => { const c = document.querySelector('[data-clip-kind="audio"]'); const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const y = clip.y + 40;
  await page.mouse.move(clip.x + 30, y); await page.mouse.down();
  await page.mouse.move(clip.x + 30 + px, y, { steps: 12 }); await page.mouse.up();
  await L.sleep(400);
  await L.blurActive(page);
  await page.keyboard.press('Control+l');
  await L.sleep(500);
  const times = await page.evaluate(() => (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent || null);
  return { times, status: await L.statusText(page) };
}
const wraps = (page, tA) => page.evaluate((tA) => {
  const s = window.__c;
  const down = s.downs.filter((t) => t >= tA).at(-1);
  const up = s.ups.find((t) => t > down);
  const starts = s.starts.filter((t) => t > down && t < up);
  const bursts = [];
  for (const t of starts) if (!bursts.length || t - bursts.at(-1).t > 50) bursts.push({ t, n: 1 }); else bursts.at(-1).n += 1;
  const seen = new Set(s.gw.filter((w) => w.t < down).map((w) => w.id));
  return bursts.map((b) => {
    const firstWrites = {};
    for (const w of s.gw) if (w.t >= b.t - 80 && w.t <= b.t + 80 && !seen.has(w.id) && !(w.id in firstWrites)) firstWrites[w.id] = Math.round(w.v * 1e5) / 1e5;
    for (const id of Object.keys(firstWrites)) seen.add(Number(id));
    const inBefore = s.inputs.filter((x) => x.t <= b.t).at(-1);
    const prev = s.gw.filter((w) => w.t < b.t - 1 && w.t > down && w.m === 'setTargetAtTime' && !(w.id in firstWrites)).at(-1);
    const nextW = s.gw.filter((w) => w.t > b.t + 1 && w.m === 'setTargetAtTime').slice(0, 3).map((w) => ({ id: w.id, v: Math.round(w.v * 1e5) / 1e5 }));
    return { prevLiveWrite: prev ? { id: prev.id, v: Math.round(prev.v * 1e5) / 1e5, dtBefore: Math.round(b.t - prev.t) } : null, nextLiveWrites: nextW, dt: Math.round(b.t - down), starts: b.n, sliderAtWrap: inBefore ? inBefore.v : null, expectedLin: inBefore ? Math.round(10 ** (Number(inBefore.v) / 20) * 1e5) / 1e5 : null, newParamFirstWrites: firstWrites };
  });
}, tA);

async function loopRun(page, label, R) {
  if ((await L.playState(page)) !== 'Pause') await L.space(page, 'Pause');
  await L.sleep(300);
  const tA = await L.now(page);
  const d = await L.drag(page, fader(page), label, { perMove: true, delay: 25, keepSeq: true, shot: path.join(L.SHOTS, `${tag}-${vw}-loop-${label}-mid.png`) });
  R[label] = { drag: { winCommits: d.winCommits, winMax: d.winMax, starts: d.sourceStartsDuringDrag, after: d.after, undoAfter: d.undoAfter, lastGainDuring: d.lastGainDuring, samples: d.samples }, wraps: await wraps(page, tA) };
  R[label].undo = await L.undoCheck(page, fader(page));
}
async function spaceRun(page, label, R) {
  if ((await L.playState(page)) !== 'Pause') await L.space(page, 'Pause');
  await L.sleep(300);
  const tA = await L.now(page);
  const ev = [];
  const d = await L.drag(page, fader(page), label, {
    perMove: true, keepSeq: true,
    mid: async (i) => {
      if (i === 14 || i === 44) {
        const v = await fader(page).inputValue();
        const t = await L.now(page);
        await page.keyboard.press('Space');
        await L.sleep(900);
        ev.push({ i, sliderAtSpace: v, t, play: await L.playState(page), field: await page.getByTestId('arrangement-detail-clip-gain-input').inputValue() });
      }
    },
  });
  const restart = await page.evaluate(({ tA, ev }) => {
    const s = window.__c;
    const t2 = ev[1].t;
    const seen = new Set(s.gw.filter((w) => w.t < t2).map((w) => w.id));
    const first = {};
    for (const w of s.gw) if (w.t >= t2 && w.t <= t2 + 600 && !seen.has(w.id) && !(w.id in first)) first[w.id] = Math.round(w.v * 1e5) / 1e5;
    return { startsAfterSecondSpace: s.starts.filter((t) => t >= t2 && t <= t2 + 900).length, newParamFirstWrites: first };
  }, { tA, ev });
  R[label] = { events: ev, expectedLin: Math.round(10 ** (Number(ev[1].sliderAtSpace) / 20) * 1e5) / 1e5, restart, after: d.after, undoAfter: d.undoAfter, playAfter: await L.playState(page) };
  R[label].undo = await L.undoCheck(page, fader(page));
}
(async () => {
  const browser = await L.launch();
  const R = { base, tag, vw, vh, utc: new Date().toISOString() };
  try {
    {
      const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
      R.loop = await makeLoop(page, 40);
      await L.selectFirstClip(page);
      R.typed = await L.typeClipGain(page, -12);
      await page.screenshot({ path: path.join(L.SHOTS, `${tag}-${vw}-loop-made.png`) });
      await loopRun(page, 'single-loop', R);
      await L.space(page, 'Play');
      await spaceRun(page, 'single-space', R);
      if ((await L.playState(page)) === 'Pause') await L.space(page, 'Play');
      R.errorsSingle = errors;
      await ctx.close();
    }
    {
      const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
      R.members = await L.addMembers(page, [-6, 1]);
      R.membersRange = await page.getByTestId('arrangement-detail-clip-gain-range').textContent().catch(() => null);
      await spaceRun(page, 'members-space', R);
      if ((await L.playState(page)) === 'Pause') await L.space(page, 'Play');
      R.errorsMembers = errors;
      await ctx.close();
    }
  } catch (e) { R.fatal = String((e && e.stack) || e).slice(0, 1500); }
  await browser.close();
  L.save(`audio-${tag}-${vw}.json`, R);
  console.log('done', tag, vw, R.fatal || '');
})();
