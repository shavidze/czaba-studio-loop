const L = require('./lib.cjs');
const path = require('path');
(async () => {
  const browser = await L.launch();
  const net = [];
  const { page } = await L.openStudio(browser, { width: 1440, height: 900 }, 'h264probe', net);
  const out = { utc: new Date().toISOString() };
  try {
    await L.setSnapOff(page);
    await L.loadVideo(page, 'beeps-6s-h264-aac.mp4');
    out.clips = await L.clipsDom(page);
    out.statusAfterLoad = await L.status(page);
    const q = () => page.evaluate(() => [...document.querySelectorAll('video')].map((v) => ({ role: v.dataset.videoRole, ct: v.currentTime, rs: v.readyState, err: v.error && v.error.code, w: v.videoWidth, h: v.videoHeight, src: (v.currentSrc || '').slice(0, 30), total: v.getVideoPlaybackQuality().totalVideoFrames, dropped: v.getVideoPlaybackQuality().droppedVideoFrames })));
    out.before = await q();
    await L.blur(page);
    await page.keyboard.press('Home');
    await L.sleep(300);
    await page.keyboard.press('Space');
    await L.sleep(2000);
    out.during = await q();
    await page.keyboard.press('Space');
    await L.sleep(300);
    out.after = await q();
    out.status = await L.status(page);
    await page.screenshot({ path: path.join(L.SHOTS, 'h264-probe-1440.png') });
    const a0 = out.before.find((v) => v.role === 'active'), a1 = out.during.find((v) => v.role === 'active');
    out.advances = !!(a0 && a1 && a1.ct > a0.ct + 1);
    out.framesIncrease = !!(a0 && a1 && a1.total > a0.total);
    out.playable = out.advances && out.framesIncrease;
  } catch (e) { out.error = String(e).slice(0, 400); }
  out.net = net;
  L.save(L.OUT, 'h264-probe.json', out);
  console.log(JSON.stringify(out, null, 1).slice(0, 2500));
  await browser.close();
})();
