// C round 116 — TV-PLAY (MODE=music) and G-VIDEO transport part (MODE=video). Usage: MODE=music|video node play.cjs <1440|1280> <run>
// Real output: every AudioNode.connect(destination) is mirrored into an AnalyserNode (master output tap).
// Fixed before running: 0 createBufferSource between press and release; playhead monotonic; still playing;
// TV-PLAY: peak drop ≥ min(10, |dragged dB| − 8). G-VIDEO: video currentTime advances through the drag, the element is not muted/paused.
const L = require('./lib.cjs');
const path = require('path');
const VP = process.argv[2] === '1280' ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const RUN = process.argv[3] || '1';
const MODE = process.env.MODE || 'music';
const VOL = (t) => `[data-track-id="${t}"] input[type=range][aria-label^="Volume"]`;

function tap() {
  const W = window;
  W.__tap = { an: new Map(), S: [], on: false };
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest, ...rest) {
    const r = oc.call(this, dest, ...rest);
    try {
      if (dest instanceof AudioDestinationNode) {
        const c = this.context;
        let an = W.__tap.an.get(c);
        if (!an) { an = c.createAnalyser(); an.fftSize = 2048; W.__tap.an.set(c, an); }
        oc.call(this, an);
      }
    } catch (e) { W.__tap.err = String(e); }
    return r;
  };
  W.__tapStart = (sel) => {
    W.__tap.on = true;
    const buf = new Float32Array(2048);
    const tick = () => {
      if (!W.__tap.on) return;
      let peak = 0;
      for (const an of W.__tap.an.values()) { an.getFloatTimeDomainData(buf); for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > peak) peak = a; } }
      const h = document.querySelector('[data-testid=arrangement-playhead-handle]');
      const f = document.querySelector(sel);
      const v = document.querySelector('video[data-video-role=active]') || document.querySelector('video');
      W.__tap.S.push({ t: performance.now(), peak, pos: h ? +h.getAttribute('aria-valuenow') : NaN, cbs: W.__h.cbs, fv: f ? f.value : null, vt: v ? v.currentTime : null, vmuted: v ? v.muted : null, vvol: v ? v.volume : null, vpaused: v ? v.paused : null });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
}
const db = (x) => (x > 0 ? 20 * Math.log10(x) : -200);

(async () => {
  const browser = await L.launch();
  const net = [];
  const tag = `play-${MODE}-${VP.width}-${RUN}${process.env.NODRAG ? '-nodrag' : ''}`;
  const o = await L.openStudio(browser, VP, tag, net, { extraInit: tap });
  const p = o.page;
  await L.setSnapOff(p);
  for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(p, s, ln, t);
  await L.blur(p);
  if (MODE === 'video') await L.loadVideo(p, 'beeps-6s-vp9-opus.webm');
  const lane = MODE === 'video' ? 'video' : 'music';
  for (const ln of ['music', 'stems', 'sfx']) if (ln !== lane) { await p.click(`[data-track-id="${ln}"] button[aria-label^="Mute"]`); await L.sleep(150); }
  await L.blur(p);
  const seekPos = await L.seekTo(p, MODE === 'video' ? 0.5 : 10);
  await L.blur(p);
  const sel = VOL(lane);
  await p.evaluate((sel) => { window.__hStart(); window.__tapStart(sel); }, sel);
  await p.click('button[aria-label="Play"]');
  await L.blur(p);
  await L.sleep(500);
  const fb = await p.locator(sel).first().boundingBox();
  const v0 = await p.locator(sel).first().inputValue();
  const x0 = fb.x + fb.width / 2, y = fb.y + fb.height / 2;
  await p.mouse.move(x0, y);
  const tPress = await p.evaluate(() => performance.now());
  await p.mouse.down();
  const DX = process.env.NODRAG ? 0 : 1;
  for (let k = 1; k <= 30; k++) { await p.mouse.move(x0 - DX * k, y); await L.sleep(15); }
  await p.mouse.up();
  const tRel = await p.evaluate(() => performance.now());
  await L.sleep(Number(process.env.TAIL || 1000));
  const tEnd = await p.evaluate(() => performance.now());
  const playingAtEnd = await p.evaluate(() => !!document.querySelector('button[aria-label="Pause"]'));
  await p.evaluate(() => { window.__tap.on = false; window.__hStop(); });
  const data = await p.evaluate(() => ({ S: window.__tap.S, samples: window.__h.samples, cbsT: window.__h.cbsT, nAn: window.__tap.an.size, err: window.__tap.err || null }));
  await p.click('button[aria-label="Pause"]').catch(() => {});
  await L.sleep(200);
  const after = await p.evaluate((sel) => { const f = document.querySelector(sel); const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); return { v: f.value, text: f.getAttribute('aria-valuetext'), readout: f.nextElementSibling.textContent, undoTitle: u && u.getAttribute('title') }; }, sel);
  await p.screenshot({ path: path.join(L.SHOTS, `${tag}.png`) });
  const S = data.S;
  const win = (a, b) => S.filter((s) => s.t >= a && s.t < b);
  const pk = (arr) => Math.max(0, ...arr.map((s) => s.peak));
  const pre = win(tPress - 450, tPress - 30);
  const post = win(tRel + 150, tRel + 600);
  const cbsDuring = data.cbsT.filter((t) => t >= tPress && t <= tRel + 30).length;
  const pos = data.samples.filter((s) => Number.isFinite(s.pos) && s.t >= tPress - 400 && s.t <= tEnd).map((s) => s.pos);
  let mono = true; for (let i = 1; i < pos.length; i++) if (pos[i] < pos[i - 1] - 1e-9) mono = false;
  const dragged = Number(after.v) - Number(v0);
  const res = { tag, vp: VP, seekPos, w: fb.width, v0, vAfter: after.v, text: after.text, readout: after.readout, undoTitle: after.undoTitle, draggedDb: +dragged.toFixed(2),
    preDb: +db(pk(pre)).toFixed(2), postDb: +db(pk(post)).toFixed(2), dropDb: +(db(pk(pre)) - db(pk(post))).toFixed(2), nPre: pre.length, nPost: post.length,
    cbsDuring, cbsTotal: data.cbsT.length, posFirst: pos[0], posLast: pos.at(-1), monotonic: mono, playingAtEnd, nAnalysers: data.nAn, tapErr: data.err,
    faderTrace: [...new Set(win(tPress, tRel + 100).map((s) => s.fv))].join(',') };
  res.threshold = Math.min(10, Math.abs(dragged) - 8);
  if (MODE === 'video') {
    const vs = win(tPress - 300, tEnd).filter((s) => s.vt !== null);
    const during = win(tPress, tRel);
    res.video = { vtFirst: vs[0] && vs[0].vt, vtAtPress: during[0] && during[0].vt, vtAtRel: during.at(-1) && during.at(-1).vt, vtLast: vs.at(-1) && vs.at(-1).vt, mutedAny: vs.some((s) => s.vmuted), pausedAny: vs.some((s) => s.vpaused), vvol: [...new Set(vs.map((s) => s.vvol))] };
    let vmono = true; for (let i = 1; i < vs.length; i++) if (vs[i].vt < vs[i - 1].vt - 1e-6) vmono = false;
    res.video.monotonic = vmono;
    res.pass = res.video.vtAtRel > res.video.vtAtPress && res.video.vtLast > res.video.vtAtRel && !res.video.pausedAny && vmono && cbsDuring === 0 && mono && playingAtEnd && dragged < 0;
  } else {
    res.pass = cbsDuring === 0 && mono && playingAtEnd && res.dropDb >= res.threshold && res.nPre > 5 && res.nPost > 5 && res.posLast > res.posFirst && after.undoTitle === 'Undo: Volume' && after.text === `${after.readout} dB`;
  }
  if (process.env.TRACE) res.trace = S.filter((s, i) => i % 6 === 0).map((s) => [+(s.t - tPress).toFixed(0), +db(s.peak).toFixed(1), s.vt && +s.vt.toFixed(2), s.vmuted, s.fv]);
  res.net = net;
  L.save(L.OUT, `${tag}.json`, res);
  console.log(JSON.stringify(res, (k, v) => (k === 'net' ? undefined : v)));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
