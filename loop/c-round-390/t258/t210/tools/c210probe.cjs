// C round 210 — WINDOW / LIVE-DISPLAY / AUDIO (a, c) / GROUP probe. Real Playwright mouse.
// usage: node c210probe.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c210lib.cjs');
const path = require('path');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4] || 1440), Number(process.argv[5] || 900)];
const shot = (n) => path.join(L.SHOTS, `${tag}-${n}.png`);

(async () => {
  const browser = await L.launch();
  const R = { base, tag, vw, vh, utc: new Date().toISOString() };
  try {
    // Session 1: harness replica (no keyboard set-up: drag from the stored default), stopped then playing.
    {
      const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
      const H = {};
      for (const [k, name] of [['track', 'Volume — Music'], ['master', 'Master Volume'], ['pan', 'Pan — Music']]) {
        H[`${k}Stopped`] = await L.drag(page, L.sl(page, name), k, { perMove: true });
      }
      await L.space(page, 'Pause');
      for (const [k, name] of [['track', 'Volume — Music'], ['master', 'Master Volume'], ['pan', 'Pan — Music']]) {
        if ((await L.playState(page)) !== 'Pause') await L.space(page, 'Pause');
        H[`${k}Playing`] = await L.drag(page, L.sl(page, name), k, { perMove: true });
      }
      await L.space(page, 'Play');
      const gv = await L.makeGroup(page);
      H.groupStopped = await L.drag(page, gv, 'group', { perMove: true });
      await L.space(page, 'Pause');
      H.groupPlaying = await L.drag(page, gv, 'group', { perMove: true });
      await L.space(page, 'Play');
      H.errors = errors;
      R.harnessReplica = H;
      L.save(`probe-${tag}.json`, R);
      await ctx.close();
    }
    // Session 2: below-max starts (keyboard first), playing drags with display samples, undo, blur/cancel/esc/space.
    {
      const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
      const S = {};
      const tv = L.sl(page, 'Volume — Music');
      S.trackKey = await L.keyTo(page, tv, -12, 'ArrowDown');
      S.trackStopped = await L.drag(page, tv, 'track', { perMove: true });
      S.trackStoppedUndo = await L.undoCheck(page, tv);
      await L.space(page, 'Pause');
      S.trackPlaying = await L.drag(page, tv, 'track', { perMove: true, shot: shot('track-mid'), keepSeq: true });
      S.trackUndo = await L.undoCheck(page, tv);
      if ((await L.playState(page)) !== 'Pause') await L.space(page, 'Pause');
      S.trackBlur = await L.drag(page, tv, 'track', { mode: 'blur', stopAt: 40 });
      S.trackCancel = await L.drag(page, tv, 'track', { mode: 'cancel', stopAt: 40 });
      S.trackEsc = await L.drag(page, tv, 'track', { mode: 'esc', stopAt: 40 });
      S.trackEscUndo = await L.undoCheck(page, tv);
      // AUDIO (c): Space pressed with the mouse held (no blur), at 25 % of leg 2, and again at 50 %.
      if ((await L.playState(page)) !== 'Pause') await L.space(page, 'Pause');
      const spaceLog = [];
      S.trackSpace = await L.drag(page, tv, 'track', {
        perMove: true, keepSeq: true,
        mid: async (i) => {
          if (i === 14 || i === 37) {
            const t = await L.now(page);
            const v = await tv.evaluate((el) => ({ value: el.value, vt: el.getAttribute('aria-valuetext') }));
            await page.keyboard.press('Space');
            await L.sleep(500);
            spaceLog.push({ i, t, slider: v, play: await L.playState(page), active: await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('aria-label')),
              newWrites: await page.evaluate((t) => window.__c.gw.filter((w) => w.t >= t).map((w) => ({ id: w.id, v: Math.round(w.v * 1e4) / 1e4, m: w.m })), t),
              starts: await page.evaluate((t) => window.__c.starts.filter((x) => x >= t).length, t) });
          }
        },
      });
      S.trackSpace.spaceLog = spaceLog;
      S.trackSpaceUndo = await L.undoCheck(page, tv);
      if ((await L.playState(page)) !== 'Pause') await L.space(page, 'Pause');
      const mv = L.sl(page, 'Master Volume');
      S.masterKey = await L.keyTo(page, mv, -6, 'ArrowDown');
      if ((await L.playState(page)) !== 'Pause') await L.space(page, 'Pause');
      S.masterPlaying = await L.drag(page, mv, 'master', { perMove: true, shot: shot('master-mid') });
      S.masterUndo = await L.undoCheck(page, mv);
      const pv = L.sl(page, 'Pan — Music');
      S.panKey = await L.keyTo(page, pv, -20, 'ArrowDown');
      if ((await L.playState(page)) !== 'Pause') await L.space(page, 'Pause');
      S.panPlaying = await L.drag(page, pv, 'pan', { perMove: true, shot: shot('pan-mid') });
      S.panUndo = await L.undoCheck(page, pv);
      if ((await L.playState(page)) !== 'Pause') await L.space(page, 'Pause');
      S.panCancel = await L.drag(page, pv, 'pan', { mode: 'cancel', stopAt: 40 });
      S.panBlur = await L.drag(page, pv, 'pan', { mode: 'blur', stopAt: 40 });
      await L.space(page, 'Play');
      const gv = await L.makeGroup(page);
      S.groupName = await gv.getAttribute('aria-label');
      S.groupKey = await L.keyTo(page, gv, -12, 'ArrowDown');
      await L.space(page, 'Pause');
      S.groupCancel = await L.drag(page, gv, 'group', { mode: 'cancel', stopAt: 40, keepSeq: true });
      S.groupBlur = await L.drag(page, gv, 'group', { mode: 'blur', stopAt: 40, keepSeq: true });
      S.groupPlaying = await L.drag(page, gv, 'group', { perMove: true, shot: shot('group-mid'), keepSeq: true });
      S.groupUndo = await L.undoCheck(page, gv);
      await L.space(page, 'Play');
      await page.screenshot({ path: shot('end') });
      S.errors = errors;
      R.belowMax = S;
      await ctx.close();
    }
  } catch (e) {
    R.fatal = String(e && e.stack || e).slice(0, 1500);
  }
  await browser.close();
  L.save(`probe-${tag}.json`, R);
  console.log('done', tag, R.fatal || '');
})();
