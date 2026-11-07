// C round 211 — WINDOW-211 / LIVE-DISPLAY-211 / AUDIO-211(a) probe. Usage: node c211probe.cjs <base> <vw> <vh> <tag>
const L = require('./c211lib.cjs');
const [base, vw, vh, tag] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4]), process.argv[5]];
(async () => {
  const browser = await L.launch();
  const out = { base, vw, vh, runs: {} };
  const fader = (page) => L.sl(page, 'Clip Gain — fader');
  const run = async (page, name, opts = {}) => {
    await L.armReleaseWatch(page);
    const r = await L.drag(page, fader(page), name, { perMove: true, shot: `${L.SHOTS}/${tag}-${vw}-${name}-mid.png`, ...opts });
    r.release = await L.releaseWatch(page);
    r.undoAfterRelease = await L.undoTitle(page);
    out.runs[name] = r;
    console.log(name, 'win', r.winCommits, 'max', r.winMax, 'per', r.winPerMove, 'pre', r.preCommits, r.preMax, 'rel', r.releaseCommits, 'chg', r.perMoveValueChanges, 'lag', r.laggingInputs, 'starts', r.sourceStartsDuringDrag, r.after.vt, r.undoAfter && r.undoAfter.title);
  };
  try {
    // single, harness replica
    {
      const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
      out.singleId = await L.selectFirstClip(page);
      await run(page, 'single-stopped');
      await L.space(page, 'Pause');
      await L.selectFirstClip(page);
      await run(page, 'single-playing');
      out.undoPlaying = await L.undoCheck(page, fader(page));
      await L.space(page, 'Play');
      // below max: type -12 first
      await L.selectFirstClip(page);
      out.typedBelow = await L.typeClipGain(page, -12);
      await run(page, 'single-below-stopped');
      await L.selectFirstClip(page);
      await L.typeClipGain(page, -12);
      await L.space(page, 'Pause');
      await L.selectFirstClip(page);
      await run(page, 'single-below-playing');
      out.undoBelowPlaying = await L.undoCheck(page, fader(page));
      await L.space(page, 'Play');
      out.errorsSingle = errors;
      await ctx.close();
    }
    // members
    {
      const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
      out.members = await L.addMembers(page);
      await L.space(page, 'Pause');
      await run(page, 'members-playing');
      await L.space(page, 'Play');
      await run(page, 'members-stopped');
      out.errorsMembers = errors;
      await ctx.close();
    }
    {
      const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
      out.members2 = await L.addMembers(page, [-12, -20]);
      await L.space(page, 'Pause');
      await run(page, 'members-below-playing');
      out.undoMembersBelow = await L.undoCheck(page, fader(page));
      await L.space(page, 'Play');
      out.errorsMembers2 = errors;
      await ctx.close();
    }
  } catch (e) { out.crash = String(e.stack || e); console.error(e); }
  L.save(`probe-${tag}-${vw}.json`, out);
  await browser.close();
})();
