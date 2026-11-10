// B round 307 pre-check: does Chromium fire `ended` for an AudioBufferSourceNode stopped before its scheduled start?
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage();
  const r = await p.evaluate(async () => {
    const ctx = new AudioContext(); await ctx.resume();
    const buf = new AudioBuffer({ length: ctx.sampleRate, numberOfChannels: 1, sampleRate: ctx.sampleRate });
    const mk = () => { const s = new AudioBufferSourceNode(ctx, { buffer: buf }); s.connect(ctx.destination); return s; };
    const out = {};
    const run = (name, setup) => new Promise((res) => { const s = mk(); let fired = null; const t0 = ctx.currentTime; s.onended = () => { fired = +(ctx.currentTime - t0).toFixed(3); }; setup(s, t0); setTimeout(() => { out[name] = fired; res(); }, 2500); });
    await run('stopBeforeStart', (s, t) => { s.start(t + 1.0); s.stop(t + 0.3); });
    await run('stopEqualStart', (s, t) => { s.start(t + 0.5); s.stop(t + 0.5); });
    await run('stopAfterStartControl', (s, t) => { s.start(t + 0.2); s.stop(t + 0.4); });
    await run('stopTwiceLaterWins', (s, t) => { s.start(t + 0.1); s.stop(t + 0.3); try { s.stop(t + 0.9); out.secondStopThrew = false; } catch (e) { out.secondStopThrew = String(e); } });
    out.sampleRate = ctx.sampleRate; out.ua = navigator.userAgent; await ctx.close(); return out;
  });
  console.log(JSON.stringify(r, null, 1)); require('fs').writeFileSync(__dirname + '/onended-probe.json', JSON.stringify(r, null, 1)); await b.close();
})();
