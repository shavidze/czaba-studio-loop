// C round 118 — GV-PLAY and GV-INF (meters during play). Usage: node gplay.cjs <1440|1280> <run>
// Real output: every AudioNode.connect(destination) is mirrored into an AnalyserNode (master output tap). Music lane muted.
// Fixed before running: GV-PLAY 0 createBufferSource between press and release; playhead monotonic and advancing; still playing;
// output peak drop ≥ min(10, |dragged dB| − 8). GV-INF: stems/sfx meters data-level-db audible before, '−∞' (or ≤ floor) after; output peak ≤ −90 dBFS after.
const L = require('./lib.cjs');
const path = require('path');
const VP = process.argv[2] === '1280' ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const RUN = process.argv[3] || '1';
const G = '[data-testid=arrangement-group-volume]';

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
    W.__tap.S = [];
    W.__tap.on = true;
    const buf = new Float32Array(2048);
    const tick = () => {
      if (!W.__tap.on) return;
      let peak = 0;
      for (const an of W.__tap.an.values()) { an.getFloatTimeDomainData(buf); for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > peak) peak = a; } }
      const h = document.querySelector('[data-testid=arrangement-playhead-handle]');
      const f = document.querySelector(sel);
      const lv = (t) => { const m = document.querySelector(`[data-track-id="${t}"] [data-testid=arrangement-track-meter]`); return m ? m.getAttribute('data-level-db') : null; };
      W.__tap.S.push({ t: performance.now(), peak, pos: h ? +h.getAttribute('aria-valuenow') : NaN, cbs: W.__h.cbs, fv: f ? f.value : null, stems: lv('stems'), sfx: lv('sfx'), music: lv('music') });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
}
const db = (x) => (x > 0 ? 20 * Math.log10(x) : -200);
const lvNum = (s) => (s === null || s === undefined ? NaN : /∞|inf/i.test(s) ? -Infinity : Number(String(s).replace('−', '-')));

async function playWindow(p, seek, fn) {
  await L.seekTo(p, seek);
  await L.blur(p);
  await p.evaluate((sel) => { window.__h.cbsT = []; window.__tapStart(sel); }, G);
  await p.click('button[aria-label="Play"]');
  await L.blur(p);
  await L.sleep(600);
  const r = await fn();
  await p.evaluate(() => { window.__tap.on = false; });
  const data = await p.evaluate(() => ({ S: window.__tap.S, cbsT: window.__h.cbsT, nAn: window.__tap.an.size, err: window.__tap.err || null }));
  const playingAtEnd = await p.evaluate(() => !!document.querySelector('button[aria-label="Pause"]'));
  await p.click('button[aria-label="Pause"]').catch(() => {});
  await L.sleep(300);
  return { ...r, data, playingAtEnd };
}

async function dragGroup(p, dx, steps, delay) {
  const fb = await p.locator(G).boundingBox();
  const x0 = fb.x + fb.width / 2, y = fb.y + fb.height / 2;
  await p.mouse.move(x0, y);
  const tPress = await p.evaluate(() => performance.now());
  await p.mouse.down();
  for (let k = 1; k <= steps; k++) { await p.mouse.move(x0 + (dx * k) / steps, y); await L.sleep(delay); }
  await p.mouse.up();
  const tRel = await p.evaluate(() => performance.now());
  return { tPress, tRel, w: fb.width };
}

(async () => {
  const browser = await L.launch();
  const net = [];
  const tag = `gplay-${VP.width}-${RUN}`;
  const o = await L.openStudio(browser, VP, tag, net, { extraInit: tap });
  const p = o.page;
  await L.setSnapOff(p);
  for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(p, s, ln, t);
  await L.blur(p);
  const clips = await L.clipsDom(p);
  await p.click(L.nameSel('stems')); await L.sleep(150);
  await p.keyboard.down('Shift'); await p.click(L.nameSel('sfx')); await p.keyboard.up('Shift');
  await p.keyboard.press('Control+g'); await L.sleep(600); await L.blur(p);
  await p.click('[data-track-id="music"] button[aria-label^="Mute"]'); await L.sleep(200); await L.blur(p);
  const res = { tag, vp: VP, clips: clips.map((c) => ({ lane: c.lane, start: c.start, dur: c.wdur })) };
  const SEEK = 8.0;
  const SEEK_INF = 3.6;
  // GV-PLAY
  const a = await playWindow(p, SEEK, async () => { const d = await dragGroup(p, -30, 30, 15); await L.sleep(1000); return d; });
  const after = await p.evaluate((sel) => { const f = document.querySelector(sel); const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); return { v: f.value, text: f.getAttribute('aria-valuetext'), undoTitle: u && u.getAttribute('title') }; }, G);
  const S = a.data.S;
  const win = (arr, x, y) => arr.filter((s) => s.t >= x && s.t < y);
  const pk = (arr) => Math.max(0, ...arr.map((s) => s.peak));
  const pre = win(S, a.tPress - 450, a.tPress - 30), post = win(S, a.tRel + 150, a.tRel + 700);
  const pos = S.filter((s) => Number.isFinite(s.pos)).map((s) => s.pos);
  let mono = true; for (let i = 1; i < pos.length; i++) if (pos[i] < pos[i - 1] - 1e-9) mono = false;
  const cbsDuring = a.data.cbsT.filter((t) => t >= a.tPress && t <= a.tRel + 30).length;
  const dragged = Number(after.v);
  const play = { seek: SEEK, w: a.w, vAfter: after.v, text: after.text, undoTitle: after.undoTitle, draggedDb: dragged, preDb: +db(pk(pre)).toFixed(2), postDb: +db(pk(post)).toFixed(2), nPre: pre.length, nPost: post.length, cbsDuring, cbsTotal: a.data.cbsT.length, posFirst: pos[0], posLast: pos.at(-1), monotonic: mono, playingAtEnd: a.playingAtEnd, nAnalysers: a.data.nAn, tapErr: a.data.err,
    preMeters: { stems: [...new Set(pre.map((s) => s.stems))].slice(0, 6), sfx: [...new Set(pre.map((s) => s.sfx))].slice(0, 6) }, postMeters: { stems: [...new Set(post.map((s) => s.stems))].slice(0, 6), sfx: [...new Set(post.map((s) => s.sfx))].slice(0, 6) } };
  play.dropDb = +(play.preDb - play.postDb).toFixed(2);
  play.threshold = Math.min(10, Math.abs(dragged) - 8);
  play.pass = cbsDuring === 0 && mono && a.playingAtEnd && play.dropDb >= play.threshold && play.nPre > 5 && play.nPost > 5 && play.posLast > play.posFirst && after.undoTitle === 'Undo: Volume' && dragged < -20;
  res['GV-PLAY'] = play;
  console.log('GV-PLAY', play.pass, JSON.stringify(play));
  await L.blur(p); await p.keyboard.press('Control+z'); await L.sleep(400);
  res.afterUndo = await p.locator(G).getAttribute('aria-valuetext');
  // GV-INF meters
  const b = await playWindow(p, SEEK_INF, async () => { const d = await dragGroup(p, -200, 20, 10); await L.sleep(3300); return d; });
  const S2 = b.data.S;
  const pre2 = win(S2, b.tPress - 450, b.tPress - 30), post2 = win(S2, b.tRel + 2500, b.tRel + 3200);
  const fall = win(S2, b.tRel + 100, b.tRel + 1400).filter((s) => Number.isFinite(lvNum(s.stems)) && Number.isFinite(lvNum(s.sfx)));
  const slope = (k) => { if (fall.length < 2) return null; const a0 = fall[0], a1 = fall.at(-1); return +((lvNum(a1[k]) - lvNum(a0[k])) / ((a1.t - a0.t) / 1000)).toFixed(2); };
  let nonRising = true; for (let i = 1; i < fall.length; i++) for (const k of ['stems', 'sfx']) if (lvNum(fall[i][k]) > lvNum(fall[i - 1][k]) + 1e-9) nonRising = false;
  const firstInf = (k) => { const s = S2.find((x) => x.t > b.tRel && lvNum(x[k]) === -Infinity); return s ? Math.round(s.t - b.tRel) : null; };
  const outAfter = win(S2, b.tRel + 150, b.tRel + 3200);
  const maxLv = (arr, k) => Math.max(...arr.map((s) => lvNum(s[k])));
  const inf = { seek: SEEK_INF, posAtRel: (S2.find((x) => x.t >= b.tRel) || {}).pos, text: await p.locator(G).getAttribute('aria-valuetext'), preStemsMax: maxLv(pre2, 'stems'), preSfxMax: maxLv(pre2, 'sfx'), postStemsMax: maxLv(post2, 'stems'), postSfxMax: maxLv(post2, 'sfx'), postStemsVals: [...new Set(post2.map((s) => s.stems))].slice(0, 8), postSfxVals: [...new Set(post2.map((s) => s.sfx))].slice(0, 8), preOutDb: +db(pk(pre2)).toFixed(2), postOutDb: +db(pk(post2)).toFixed(2), outAfterDb: +db(pk(outAfter)).toFixed(2), fallSlopeStems: slope('stems'), fallSlopeSfx: slope('sfx'), fallNonRising: nonRising, nFall: fall.length, firstInfMs: { stems: firstInf('stems'), sfx: firstInf('sfx') }, nPost: post2.length, cbsDuring: b.data.cbsT.filter((t) => t >= b.tPress && t <= b.tRel + 30).length, playingAtEnd: b.playingAtEnd };
  inf.pass = inf.text === '−∞ dB' && inf.preStemsMax > -60 && inf.preSfxMax > -60 && inf.postStemsMax === -Infinity && inf.postSfxMax === -Infinity && inf.outAfterDb <= -90 && inf.nPost > 10 && inf.playingAtEnd && inf.fallNonRising && Math.abs(inf.fallSlopeStems + 20) <= 2 && Math.abs(inf.fallSlopeSfx + 20) <= 2;
  res['GV-INF-METER'] = inf;
  console.log('GV-INF-METER', inf.pass, JSON.stringify(inf));
  await p.screenshot({ path: path.join(L.SHOTS, `${tag}.png`) });
  res.net = net;
  L.save(L.OUT, `${tag}.json`, res);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
