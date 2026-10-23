// C round 115 — MC-PLAY (multi stems+SFX, music muted). Adapted from C round 114 play.cjs. Usage: node play.cjs <1440|1280> <run#>
// Real output: every AudioNode.connect(destination) is mirrored into an AnalyserNode (master output tap).
// Criteria fixed before running: 0 createBufferSource between press and release; playhead monotonic;
// output peak (300 ms windows) after release at least 10 dB below the window before the press; still playing.
const L = require('./lib.cjs');
const path = require('path');
const VP = process.argv[2] === '1280' ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const RUN = +(process.argv[3] || 1);
const F = '[data-testid=arrangement-detail-clip-gain-fader]';

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
  W.__tapStart = () => {
    W.__tap.on = true;
    const buf = new Float32Array(2048);
    const tick = () => {
      if (!W.__tap.on) return;
      let peak = 0, sum = 0;
      for (const an of W.__tap.an.values()) { an.getFloatTimeDomainData(buf); for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > peak) peak = a; sum += buf[i] * buf[i]; } }
      const h = document.querySelector('[data-testid=arrangement-playhead-handle]');
      const f = document.querySelector('[data-testid=arrangement-detail-clip-gain-fader]');
      W.__tap.S.push({ t: performance.now(), peak, rms: Math.sqrt(sum / buf.length), pos: h ? +h.getAttribute('aria-valuenow') : NaN, cbs: W.__h.cbs, fv: f ? +f.value : null });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
}

const db = (x) => (x > 0 ? 20 * Math.log10(x) : -200);

(async () => {
  const browser = await L.launch();
  const net = [];
  const tag = `mcplay-${VP.width}-${RUN}`;
  const o = await L.openStudio(browser, VP, tag, net, { extraInit: tap });
  const p = o.page;
  await L.setSnapOff(p);
  for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(p, s, ln, t);
  await L.blur(p);
  for (const ln of ['music']) { await p.click(`[data-track-id=${ln}] button[aria-label^="Mute"]`); await L.sleep(150); }
  const muted = await p.evaluate(() => ['music', 'stems', 'sfx'].map((t) => document.querySelector(`[data-track-id=${t}] button[aria-label^="Mute"]`).getAttribute('aria-pressed')));
  const clips = await L.clipsDom(p);
  const stems = clips.find((c) => c.lane === 'stems');
  const sfx = clips.find((c) => c.lane === 'sfx');
  const FIELD = '[data-testid=arrangement-detail-clip-gain-input]';
  await L.selectClip(p, stems.id);
  await p.fill(FIELD, '-6'); await p.locator(FIELD).press('Enter'); await L.sleep(250); await L.blur(p);
  await L.selectClip(p, sfx.id);
  await p.fill(FIELD, '1'); await p.locator(FIELD).press('Enter'); await L.sleep(250); await L.blur(p);
  await L.selectClip(p, stems.id);
  await L.selectClip(p, sfx.id, ['Shift']);
  const sel = (await L.clipsDom(p)).filter((c) => c.sel).map((c) => c.lane);
  const range0 = await p.evaluate(() => { const r = document.querySelector('[data-testid=arrangement-detail-clip-gain-range]'); return r && r.textContent; });
  const ex = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]').getAttribute('aria-expanded'));
  if (ex !== 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(600); }
  await L.blur(p);
  const seekPos = await L.seekTo(p, 2.05);
  await L.blur(p);
  await p.evaluate(() => { window.__hStart(); window.__tapStart(); });
  await p.click('button[aria-label="Play"]');
  await L.blur(p);
  await L.sleep(400);
  const fb = await p.locator(F).boundingBox();
  const v0 = +(await p.locator(F).inputValue());
  const x0 = fb.x + ((v0 + 60) / 84) * fb.width;
  const y = fb.y + fb.height / 2;
  await p.mouse.move(x0, y);
  const tPress = await p.evaluate(() => performance.now());
  await p.mouse.down();
  for (let k = 1; k <= 20; k++) { await p.mouse.move(x0 - 2 * k, y); await L.sleep(20); }
  await p.mouse.up();
  const tRel = await p.evaluate(() => performance.now());
  await L.sleep(1000);
  const tEnd = await p.evaluate(() => performance.now());
  const playingAtEnd = await p.evaluate(() => !!document.querySelector('button[aria-label="Pause"]'));
  await p.evaluate(() => { window.__tap.on = false; window.__hStop(); });
  const data = await p.evaluate(() => ({ S: window.__tap.S, samples: window.__h.samples, cbsT: window.__h.cbsT, nAn: window.__tap.an.size, err: window.__tap.err || null, ctxs: window.__h.ctxs.length }));
  await p.click('button[aria-label="Pause"]').catch(() => {});
  await L.sleep(200);
  const after = await p.evaluate((F) => { const f = document.querySelector(F); const rg = document.querySelector('[data-testid=arrangement-detail-clip-gain-range]'); const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); return { v: +f.value, text: f.getAttribute('aria-valuetext'), range: rg && rg.textContent, undoTitle: u && u.getAttribute('title') }; }, F);
  await p.screenshot({ path: path.join(L.SHOTS, `${tag}.png`) });
  const S = data.S;
  const win = (a, b) => S.filter((s) => s.t >= a && s.t < b);
  const pk = (arr) => Math.max(0, ...arr.map((s) => s.peak));
  const pre = win(tPress - 400, tPress - 50);
  const post = win(tRel + 150, tRel + 550);
  const tail = win(tRel + 550, tEnd);
  const cbsPress = (win(tPress - 50, tPress + 30)[0] || {}).cbs;
  const cbsDuring = data.cbsT.filter((t) => t >= tPress && t <= tRel + 30).length;
  const posPlaying = data.samples.filter((s) => Number.isFinite(s.pos) && s.t >= tPress - 400 && s.t <= tEnd).map((s) => s.pos);
  let mono = true; for (let i = 1; i < posPlaying.length; i++) if (posPlaying[i] < posPlaying[i - 1] - 1e-9) mono = false;
  const res = {
    tag, vp: VP, seekPos, muted, stems, selected: sel, range0, rangeAfter: after.range, w: fb.width, v0, vAfter: after.v, textAfter: after.text, expectedDb: +(-40 / fb.width * 84).toFixed(2), undoTitle: after.undoTitle,
    preDb: +db(pk(pre)).toFixed(2), postDb: +db(pk(post)).toFixed(2), tailDb: +db(pk(tail)).toFixed(2), nPre: pre.length, nPost: post.length,
    dropDb: +(db(pk(pre)) - db(pk(post))).toFixed(2), cbsDuring, cbsTotal: data.cbsT.length, posFirst: posPlaying[0], posLast: posPlaying.at(-1), posN: posPlaying.length, monotonic: mono, playingAtEnd, nAnalysers: data.nAn, tapErr: data.err,
    faderTrace: [...new Set(win(tPress, tRel + 100).map((s) => s.fv))].join(','),
  };
  res.postPos = [post.length ? post[0].pos : null, post.length ? post.at(-1).pos : null];
  res.postBeforeSfx = res.postPos[1] !== null && res.postPos[1] < 4.0;
  res.inClipAtEnd = res.posLast < stems.start + stems.wdur;
  res.pass = res.postBeforeSfx && sel.length === 2 && range0 === '−6.0 … +1.0 dB' && res.cbsDuring === 0 && res.monotonic && res.playingAtEnd && res.dropDb >= 10 && res.nPre > 5 && res.nPost > 5 && res.posLast > res.posFirst && res.inClipAtEnd && /Clip Gain/.test(res.undoTitle || '');
  res.net = net;
  L.save(L.OUT, `${tag}.json`, res);
  console.log(JSON.stringify(res, (k, v) => (k === 'net' || k === 'stems' ? undefined : v)));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
