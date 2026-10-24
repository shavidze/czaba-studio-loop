// C round 132 REG-131: fresh project, beeps-6s-h264-aac.mp4 via video input (1440).
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
(async () => {
  const b = await L.launch(); const net = []; const res = { utc: new Date().toISOString() };
  try {
    const { page: p } = await L.openStudio(b, X.VPS[1440], 'reg131-1440', net);
    await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
    res.status = await L.status(p);
    res.expected = '“beeps-6s-h264-aac.mp4” added to the video track: 00:00.000 — 00:06.000';
    res.exact = res.status === res.expected;
    res.videoClips = await p.evaluate(() => [...document.querySelectorAll('[data-clip-kind=video]')].map((e) => ({ start: e.dataset.clipStart, w: e.getBoundingClientRect().width })));
    await p.screenshot({ path: path.join(L.SHOTS, 'reg131-1440-r1.png') });
  } catch (e) { res.error = String(e.stack || e); }
  res.net = X.netOk(net); res.sessions = net;
  fs.writeFileSync(path.join(L.OUT, 'reg131-1440-r1.json'), JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ status: res.status, exact: res.exact, clips: res.videoClips, err: res.error, net: res.net }));
  await b.close();
})();
