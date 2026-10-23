const L = require('./lib.cjs');
const path = require('path');
(async () => {
  const browser = await L.chromium.launch({ headless: true });
  const net = [];
  const { ctx, page } = await L.openStudio(browser, { width: 1440, height: 900 }, 'probe', net);
  const env = await page.evaluate(() => ({
    webm: document.createElement('video').canPlayType('video/webm; codecs="vp9, opus"'),
    mp4: document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'),
    types: PerformanceObserver.supportedEntryTypes,
    ua: navigator.userAgent,
    handle: !!document.querySelector('[data-testid=arrangement-playhead-handle]'),
    options: [...document.querySelectorAll('[role=option][data-source-id]')].map((o) => [o.dataset.sourceId, o.textContent.trim().slice(0, 50)]),
    lanes: [...document.querySelectorAll('[data-track-id]')].map((e) => e.dataset.trackId),
  }));
  env.browserVersion = browser.version();
  env.headless = true;
  console.log(JSON.stringify(env, null, 1));
  L.save(L.OUT, 'probe-env.json', env);
  if (process.argv[2] === 'env') { await browser.close(); return; }
  await L.setSnapOff(page);
  await L.loadVideo(page, 'beeps-6s-vp9-opus.webm');
  let c = await L.clipsDom(page);
  console.log('after video', JSON.stringify(c));
  const v = c.find((x) => x.kind === 'video');
  await L.selectClip(page, v.id);
  console.log('detail', JSON.stringify(await L.detailInfo(page)));
  await L.blur(page);
  await page.keyboard.press('Control+d');
  await L.sleep(700);
  console.log('ctrl+d status', await L.status(page));
  c = await L.clipsDom(page);
  console.log('after dup', JSON.stringify(c));
  for (const [s, ln, t] of [['demo-middle-east', 'music', 0], [process.argv[2] || 'demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) {
    console.log(JSON.stringify(await L.addAt(page, s, ln, t)));
  }
  c = await L.clipsDom(page);
  for (const x of c) { await L.selectClip(page, x.id); x.detail = (await L.detailInfo(page)).text; }
  console.log(JSON.stringify(c, null, 1));
  await page.screenshot({ path: path.join(L.SHOTS, 'probe-1440.png') });
  console.log(JSON.stringify(net));
  await browser.close();
})();
