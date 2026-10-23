// Analyze a run JSON per D-24/D-24a + D-29z77 rules. Usage: node ana.cjs <run.json> [maxAbsLimit] [tEnd]
const fs = require('fs');
const APP = /^https?:\/\/127\.0\.0\.1:5173\/app\//;
const med = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const r4 = (x) => (x == null ? null : Math.round(x * 10000) / 10000);

function appScriptMs(lf) { return lf.scripts.filter((s) => APP.test(s.url || '')).reduce((a, s) => a + s.dur, 0); }

function analyze(run, opts = {}) {
  const S = run.samples || [];
  if (!S.length) return { error: 'no samples' };
  const vclips = run.clips.filter((c) => c.kind === 'video').sort((a, b) => a.start - b.start);
  const keys = run.keys || [];
  const tKey = keys[0];
  const tPause = keys[1] ?? S[S.length - 1].t;
  const p0 = S.find((s) => s.t >= tKey)?.pos ?? 0;
  const first = S.find((s) => s.t >= tKey && s.pos > p0 + 1e-9);
  const playing = S.filter((s) => first && s.t >= first.t && s.t < tPause);
  const tA = S[0].t, tB = S[S.length - 1].t;
  const sampled = tB - tA;
  // rAF deltas
  const dts = []; for (let k = 1; k < S.length; k++) dts.push(S[k].t - S[k - 1].t);
  const frameInterval = med(dts);
  // LoAF in the run
  const loaf = (run.loaf || []).filter((x) => x.start + x.dur >= tA && x.start <= tB).map((x) => ({ ...x, app: appScriptMs(x) }));
  const appLoaf = loaf.filter((x) => x.app >= 10);
  const stall = [];
  for (const x of loaf) if (x.dur >= 50 && x.app < 10) stall.push([x.start, x.start + x.dur + 300, 'loaf']);
  for (let k = 1; k < S.length; k++) {
    const g = S[k].t - S[k - 1].t;
    if (g >= 50) {
      const a = S[k - 1].t, b = S[k].t;
      const appIn = appLoaf.some((x) => x.start < b && x.start + x.dur > a);
      if (!appIn) stall.push([a, b + 300, 'gap']);
    }
  }
  // hard-seek windows: app currentTime write on element i -> next seeked on i, +300
  const hs = [];
  for (const m of (run.media || []).filter((m) => m.k === 'ct' && m.t >= tA - 2000)) {
    const sk = (run.seeks || []).find((s) => s.k === 'seeked' && s.i === m.i && s.t >= m.t);
    hs.push([m.t, (sk ? sk.t : tB) + 300, m.i]);
  }
  const union = (ws) => { const s = ws.map((w) => [Math.max(w[0], tA), Math.min(w[1], tB)]).filter((w) => w[1] > w[0]).sort((a, b) => a[0] - b[0]); let tot = 0, cur = null; for (const w of s) { if (!cur || w[0] > cur[1]) { if (cur) tot += cur[1] - cur[0]; cur = [...w]; } else cur[1] = Math.max(cur[1], w[1]); } if (cur) tot += cur[1] - cur[0]; return tot; };
  const stallCov = sampled > 0 ? union(stall) / sampled : 0;
  const inW = (t, ws) => ws.some((w) => t >= w[0] && t <= w[1]);
  const tEnd = opts.tEnd ?? Infinity;
  const drift = [];
  const dtOf = new Map(); for (let k = 1; k < S.length; k++) dtOf.set(S[k], S[k].t - S[k - 1].t);
  for (const s of playing) {
    const c = vclips.find((v) => s.pos >= v.start && s.pos < v.end);
    const skewTol = Math.max(frameInterval, dtOf.get(s) || 0) / 1000 + 0.001;
    if (!c || s.vt == null || !(s.pos <= tEnd)) continue;
    const dLit = s.vt - (s.pos - c.start + (c.offset || 0));
    let d = dLit, skew = false;
    // known harness limit (task 3): pos may be up to one frame skewed vs the element swap; near a boundary also test the adjacent clip
    const ci = vclips.indexOf(c);
    for (const n of [vclips[ci - 1], vclips[ci + 1]]) {
      if (!n) continue;
      const nearB = Math.min(Math.abs(s.pos - n.end), Math.abs(s.pos - n.start)) <= skewTol;
      if (!nearB) continue;
      const dn = s.vt - (s.pos - n.start + (n.offset || 0));
      if (Math.abs(dn) < Math.abs(d)) { d = dn; skew = true; }
    }
    drift.push({ t: s.t, pos: s.pos, d, dLit, skew, ad: Math.abs(d), adLit: Math.abs(dLit), clip: vclips.indexOf(c), i: s.i, rate: s.rate, paused: s.paused, stall: inW(s.t, stall), hs: hs.some((w) => w[2] === s.i && s.t >= w[0] && s.t <= w[1]) });
  }
  const rawSer = drift.filter((x) => !x.hs);
  const exSer = rawSer.filter((x) => !x.stall);
  const statK = (ser, A, D) => { if (!ser.length) return { n: 0 }; const mx = ser.reduce((a, b) => (b[A] > a[A] ? b : a)); return { n: ser.length, median: r4(med(ser.map((x) => x[A]))), max: r4(mx[A]), maxAtPos: mx.pos, maxAtT: r4(mx.t - (first ? first.t : tA)), maxSigned: r4(mx[D]), maxInClip2: mx.clip === 1 }; };
  const raw = statK(rawSer, 'adLit', 'dLit'), ex = statK(exSer, 'adLit', 'dLit');
  const maxLimV = opts.maxLimit ?? 0.1;
  const rawCorr = statK(rawSer, 'ad', 'd'), exCorr = statK(exSer, 'ad', 'd');
  const passCorr = exCorr.n > 0 && exCorr.median <= 0.05 && exCorr.max <= (opts.maxLimit ?? 0.1);
  const literalMax = exSer.length ? r4(Math.max(...exSer.map((x) => x.adLit))) : null;
  const skewSamples = drift.filter((x) => x.skew).map((x) => ({ pos: x.pos, dLit: r4(x.dLit), d: r4(x.d), i: x.i }));
  const maxLim = opts.maxLimit ?? 0.1;
  const pass = ex.n > 0 && ex.median <= 0.05 && ex.max <= maxLim;
  // decoder starvation: per-element deltas
  const q = (run.q0 || []).map((a) => { const b = (run.q1 || []).find((x) => x.i === a.i) || a; return { i: a.i, dropped: b.dropped - a.dropped, total: b.total - a.total }; });
  const activeIdx = [...new Set(playing.map((s) => s.i))];
  const qa = q.filter((x) => activeIdx.includes(x.i));
  const dropSum = qa.reduce((a, x) => a + x.dropped, 0), totSum = qa.reduce((a, x) => a + x.total, 0);
  const dropRatio = totSum > 0 ? dropSum / totSum : null;
  const rates = playing.map((s) => s.rate).filter((x) => x != null);
  const rateNe1 = rates.length ? rates.filter((x) => Math.abs(x - 1) > 1e-6).length / rates.length : 0;
  const esc = +(run.dock?.escalations || 0);
  const rateException = rateNe1 > 0.2 || esc >= 1;
  let valid = true; const why = [];
  if (stallCov > 0.1) { valid = false; why.push(`stall coverage ${(stallCov * 100).toFixed(1)}% > 10%`); }
  if (dropRatio != null && dropRatio > 0.2) { if (rateException) why.push(`drops ${(dropRatio * 100).toFixed(1)}% but rate exception -> judged valid`); else { valid = false; why.push(`decoder-starved drops ${(dropRatio * 100).toFixed(1)}% > 20%`); } }
  // app LoAFs during playing window
  const pA = first ? first.t : tA;
  const appLoafPlay = appLoaf.filter((x) => x.start + x.dur >= pA && x.start <= tPause).map((x) => ({ startMs: r4(x.start - pA), dur: r4(x.dur), appMs: r4(x.app), top: (x.scripts.filter((s) => APP.test(s.url || '')).sort((a, b) => b.dur - a.dur)[0] || {}).url }));
  const loafPlay = loaf.filter((x) => x.start + x.dur >= pA && x.start <= tPause);
  const nonAppScriptUrls = {}; for (const x of loafPlay) for (const s of x.scripts) { if (!APP.test(s.url || '')) { const k = (s.url || '(none)').replace(/\?.*$/, '').slice(-80); nonAppScriptUrls[k] = r4((nonAppScriptUrls[k] || 0) + s.dur); } }
  return {
    tag: run.tag, layout: run.layout, video: run.video, valid, invalidWhy: why, pass: valid ? pass : null,
    nSamples: S.length, nDrift: drift.length, sampledMs: r4(sampled), frameIntervalMs: r4(frameInterval),
    raw, stallExcluded: ex, skewCorrected: { raw: rawCorr, stallExcluded: exCorr, pass: valid ? passCorr : null }, stallCoveragePct: r4(stallCov * 100), stallWindows: stall.length,
    boundarySkew: { samples: skewSamples, literalMaxStallExcl: literalMax },
    hardSeekWrites: hs.length, hardSeekWritesInRun: hs.filter((w) => w[0] >= tA).map((w) => ({ startMs: r4(w[0] - tA), endMs: r4(w[1] - tA), i: w[2] })), hardSeekExcludedSamples: drift.filter((x) => x.hs).length,
    appLoafs: appLoafPlay, loafsInPlay: loafPlay.length, loafMaxMs: loafPlay.length ? r4(Math.max(...loafPlay.map((x) => x.dur))) : 0, nonAppScriptMs: nonAppScriptUrls,
    dock: run.dock, quality: q, activeElements: activeIdx, dropRatio: r4(dropRatio),
    rate: { shareNe1: r4(rateNe1), min: rates.length ? Math.min(...rates) : null, max: rates.length ? Math.max(...rates) : null, escalations: esc },
    pre: run.pre, clips: run.clips, posEnd: playing.length ? playing[playing.length - 1].pos : null,
    worst5: [...exSer].sort((a, b) => b.ad - a.ad).slice(0, 5).map((x) => ({ pos: x.pos, d: r4(x.d), i: x.i, clip: x.clip, rate: x.rate })),
  };
}

// RF5-3 start criterion on the first Play of the run
function rf53(run) {
  const S = run.samples; const tKey = run.keys[0];
  const p0 = S.find((s) => s.t >= tKey)?.pos ?? 0;
  const dts = []; for (let k = 1; k < S.length; k++) dts.push(S[k].t - S[k - 1].t);
  const frameInterval = med(dts);
  const fi = S.findIndex((s) => s.t >= tKey && s.pos > p0 + 1e-9);
  if (fi < 0) return { error: 'no advance' };
  const f = S[fi];
  const startAt = f.t - (f.pos - p0) * 1000;
  const play = (run.media || []).find((m) => m.k === 'play' && m.t >= tKey - 5 && m.i === 0) || (run.media || []).find((m) => m.k === 'play' && m.t >= tKey - 5);
  const plays = (run.media || []).filter((m) => m.k === 'play' && m.t >= tKey - 5 && m.t <= tKey + 2000).map((m) => ({ dt: r4(m.t - tKey), role: m.role, i: m.i }));
  const lo = startAt - Math.min(frameInterval, 20), hi = startAt + Math.min(frameInterval, 34);
  const playIn = play ? play.t >= lo && play.t <= hi : false;
  const hold = S.filter((s) => s.t >= tKey && play && s.t < play.t);
  const pausedHold = hold.every((s) => s.paused === true);
  const vt0 = S.find((s) => s.t >= tKey)?.vt ?? 0;
  const fps = 30; // see env note: frame interval of the fixture (measured in fps probe)
  const pre = S.filter((s) => s.t >= tKey && s.t < startAt);
  const preAdv = pre.length ? Math.max(...pre.map((s) => s.vt - vt0)) : 0;
  const w1 = S.filter((s) => s.t >= startAt && s.t <= startAt + 100).map((s) => Math.abs(s.vt - (s.pos - 0)));
  const w2 = S.filter((s) => s.t > startAt + 100 && s.t <= startAt + 300).map((s) => Math.abs(s.vt - (s.pos - 0)));
  const m1 = w1.length ? Math.max(...w1) : null, m2 = w2.length ? Math.max(...w2) : null;
  const res = {
    holdMs: r4(startAt - tKey), frameIntervalMs: r4(frameInterval), playIssueRelStartAtMs: play ? r4(play.t - startAt) : null, window: [r4(lo - startAt), r4(hi - startAt)], playIn,
    pausedUntilPlay: pausedHold, holdSamples: hold.length, preStartAdvanceS: r4(preAdv), preStartOk: preAdv <= 1 / fps + 1e-6,
    drift0_100: r4(m1), drift100_300: r4(m2), driftOk: m1 != null && m2 != null && m1 <= 0.1 && m2 <= 0.06, plays,
  };
  res.pass = res.playIn && res.pausedUntilPlay && res.preStartOk && res.driftOk;
  return res;
}

module.exports = { analyze, rf53 };
if (require.main === module) {
  const run = JSON.parse(fs.readFileSync(process.argv[2]));
  const a = analyze(run, { maxLimit: process.argv[3] ? +process.argv[3] : 0.1, tEnd: process.argv[4] ? +process.argv[4] : Infinity });
  console.log(JSON.stringify(a, null, 1));
  if (process.argv.includes('--rf')) console.log(JSON.stringify(rf53(run), null, 1));
}
