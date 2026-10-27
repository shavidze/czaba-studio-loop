// C round 211 — adjacent rows (§4): track Volume spot-check (1 component/move), video clip Clip Gain disabled + no lane waveform,
// audio+video members. usage: node c211adj.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c211lib.cjs');
const path = require('path');
const MEDIA = '/home/runner/czaba-project/tmp/studio-real-loop/media/';
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4] || 1440), Number(process.argv[5] || 900)];
const block = (page) => page.evaluate(() => {
  const q = (id) => document.querySelector('[data-testid=' + id + ']');
  const f = q('arrangement-detail-clip-gain-input'); const fd = q('arrangement-detail-clip-gain-fader'); const rs = q('arrangement-detail-clip-gain-reset');
  const reason = q('arrangement-detail-clip-gain-reason');
  return { field: f && { v: f.value, disabled: f.disabled, title: f.getAttribute('title') }, fader: fd && { v: fd.value, disabled: fd.disabled, vt: fd.getAttribute('aria-valuetext'), title: fd.getAttribute('title') }, reset: rs && { disabled: rs.disabled, title: rs.getAttribute('title') }, reason: reason && reason.textContent,
    videoLaneWave: [...document.querySelectorAll('[data-clip-kind=video]')].map((c) => c.querySelectorAll('[data-testid=arrangement-clip-waveform]').length),
    audioLaneWave: [...document.querySelectorAll('[data-clip-kind=audio]')].map((c) => c.querySelectorAll('[data-testid=arrangement-clip-waveform]').length),
    detailPlaceholder: !!q('arrangement-detail-video-placeholder') };
});
(async () => {
  const browser = await L.launch();
  const R = { base, tag, vw, vh, utc: new Date().toISOString() };
  try {
    const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
    const tv = L.sl(page, 'Volume — Music');
    const d = await L.drag(page, tv, 'track', { perMove: true });
    R.track = { winCommits: d.winCommits, winMax: d.winMax, winPerMove: d.winPerMove, releaseCommits: d.releaseCommits, changes: d.perMoveValueChanges };
    await page.locator('[data-testid=arrangement-video-input]').first().setInputFiles(MEDIA + 'clip-3s-h264-aac.mov');
    await page.waitForFunction(() => document.querySelectorAll('[data-clip-kind=video]').length > 0, null, { timeout: 30000 });
    await L.sleep(2500);
    const vp = await page.evaluate(() => { const c = document.querySelector('[data-clip-kind=video]'); const b = c.getBoundingClientRect(); return { x: b.x + Math.min(40, b.width / 2), y: b.y + 10 }; });
    await page.mouse.click(vp.x, vp.y); await L.sleep(500);
    R.videoSingle = await block(page);
    await page.screenshot({ path: path.join(L.SHOTS, `adj-${tag}-${vw}-video.png`) });
    const a = await L.clipPoint(page, 0);
    await page.mouse.click(a.x, a.y); await L.sleep(300);
    await page.keyboard.down('Shift'); await page.mouse.click(vp.x, vp.y); await page.keyboard.up('Shift'); await L.sleep(500);
    R.videoMembers = await block(page);
    R.errors = errors;
    await ctx.close();
  } catch (e) { R.fatal = String((e && e.stack) || e).slice(0, 1500); }
  await browser.close();
  L.save(`adj-${tag}-${vw}.json`, R);
  console.log('done', tag, vw, R.fatal || '', JSON.stringify(R.track));
})();
