// C round 211 — MEMBERS-211 while playing: both members audible (loop 0.75–1.75 s inside both clips); drag release / pointercancel / fader blur.
// usage: node c211members.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c211lib.cjs');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4] || 1440), Number(process.argv[5] || 900)];
const fader = (page) => L.sl(page, 'Clip Gain — fader');
(async () => {
  const browser = await L.launch();
  const R = { base, tag, vw, vh, utc: new Date().toISOString() };
  try {
    const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
    R.setup = await L.addMembers(page, [-6, 1]);
    const clip = await page.evaluate(() => { const c = document.querySelector('[data-clip-kind="audio"]'); const r = c.getBoundingClientRect(); return { x: r.x, y: r.y }; });
    await page.mouse.move(clip.x + 30, clip.y + 40); await page.mouse.down(); await page.mouse.move(clip.x + 70, clip.y + 40, { steps: 12 }); await page.mouse.up(); await L.sleep(400);
    await L.blurActive(page); await page.keyboard.press('Control+l'); await L.sleep(500);
    R.loop = await page.evaluate(() => (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent || null);
    const a = await L.clipPoint(page, 0); const b = await L.clipPoint(page, 0, 'Soft impact');
    await page.mouse.click(a.x, a.y); await L.sleep(300); await page.keyboard.down('Shift'); await page.mouse.click(b.x, b.y); await page.keyboard.up('Shift'); await L.sleep(500);
    R.sel = { group: await page.getByTestId('arrangement-detail-group').count(), vt: await fader(page).getAttribute('aria-valuetext') };
    await L.space(page, 'Pause');
    await L.sleep(500);
    for (const mode of ['cancel', 'blur', 'release']) {
      const tA = await L.now(page);
      const d = await L.drag(page, fader(page), mode, { mode, stopAt: 40, perMove: true });
      const ids = await page.evaluate((tA) => { const s = window.__c; const down = s.downs.filter((t) => t >= tA).at(-1); const by = {}; for (const w of s.gw) if (w.t > down && w.m === 'setTargetAtTime') { by[w.id] = by[w.id] || { n: 0 }; by[w.id].n++; by[w.id].last = w.v; } return by; }, tA);
      R[mode] = { before: { vt: d.before.vt, laneD: d.before.laneD, undo: d.undoBefore.title }, mid: { vt: d.mid.vt, laneD: d.mid.laneD }, afterAbort: d.afterAbort && { vt: d.afterAbort.vt, laneD: d.afterAbort.laneD, field: d.afterAbort.field, range: d.afterAbort.range, pend: d.afterAbort.fieldPending }, liveAfterAbort: d.liveAfterAbort,
        after: { vt: d.after.vt, laneD: d.after.laneD, range: d.after.range }, undoAfter: d.undoAfter.title, releaseCommits: d.releaseCommits, statusPost: d.statusPost, starts: d.sourceStartsDuringDrag, liveWritesByParam: ids, play: await L.playState(page) };
      await L.sleep(400);
    }
    R.undo = await L.undoCheck(page, fader(page));
    R.errors = errors;
    await ctx.close();
  } catch (e) { R.fatal = String((e && e.stack) || e).slice(0, 1500); }
  await browser.close();
  L.save(`members-${tag}-${vw}.json`, R);
  console.log('done', tag, vw, R.fatal || '');
})();
