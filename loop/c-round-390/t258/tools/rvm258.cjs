// C round 258 RV-M/RV-ICONS additions: Play box identical while playing; Stop renders a lucide svg with empty innerText.
const L = require('./lib258.cjs'); const { sleep, fs, path } = L;
(async () => { const b = await L.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const out = {};
for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) { const k = `${vp.width}x${vp.height}`;
  const { ctx, page, errors } = await L.open(b, vp, { pulse: true, zoom: false });
  const box = () => page.evaluate(() => { const q = (l) => document.querySelector(`button[aria-label="${l}"]`); const f = (e) => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return { box: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(2)), radius: c.borderTopLeftRadius, text: e.innerText, svg: !!e.querySelector('svg'), lucide: !!e.querySelector('svg.lucide, svg[class*=lucide]'), playing: e.dataset.playing ?? null }; }; return { play: f(q('Play')), stop: f(q('Stop')) }; });
  const r = { stopped: await box() }; await L.blur(page); await page.keyboard.press('Space'); await sleep(800); r.playing = await box(); await page.keyboard.press('Space'); await sleep(300);
  r.errors = errors; await ctx.close();
  const exp = k === '1440x900' ? [779.5, 43, 32, 32] : [699.5, 43, 32, 32];
  r.checks = { playRound: r.stopped.play.radius === '9999px' && r.stopped.play.text === '' && r.stopped.play.svg, playBox: JSON.stringify(r.stopped.play.box) === JSON.stringify(exp) && JSON.stringify(r.playing.play.box) === JSON.stringify(exp), playingFlag: r.playing.play.playing === 'true' && r.stopped.play.playing !== 'true', stopIcon: r.stopped.stop.svg && r.stopped.stop.lucide && r.stopped.stop.text === '', errors: errors.length === 0 };
  r.pass = Object.values(r.checks).every(Boolean); out[k] = r; console.log(k, r.pass, JSON.stringify(r.checks), JSON.stringify([r.stopped.play.box, r.playing.play.box, r.stopped.stop])); }
fs.writeFileSync(path.join(__dirname, '..', 'out', 'rvm258.json'), JSON.stringify(out, null, 1)); await b.close(); })();
