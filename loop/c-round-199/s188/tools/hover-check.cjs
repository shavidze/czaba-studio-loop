// C round 188 — 1280 /store header with mouse parked off the header vs mouse at (0,0) default; compare to c-round-187 1280-store.png header band.
const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path'); const { decode } = require('./png.cjs');
(async () => { const b = await L.chromium.launch({ args: ['--disable-lcd-text'] }); const out = {};
  for (const mode of ['default', 'parked']) { const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 }); const p = await ctx.newPage();
    await p.goto(L.BASE + '/store', { waitUntil: 'load' }); if (mode === 'parked') await p.mouse.move(640, 600); await L.sleep(4000);
    const f = path.join(__dirname, '..', 'shots', `hover-${mode}-1280-store.png`); await p.screenshot({ path: f, fullPage: true });
    out[mode] = await p.evaluate(() => { const s = [...document.querySelectorAll('header button')].find((x) => x.textContent.trim() === 'Sign In'); return { shadow: getComputedStyle(s).boxShadow, hover: s.matches(':hover') }; });
    const A = decode(fs.readFileSync(f)), B = decode(fs.readFileSync(path.join(__dirname, '../../c-round-187/shots/store-after/1280-store.png'))); let n = 0, right = 0; for (let y = 0; y < 162; y++) for (let x = 0; x < A.w; x++) { const q = A.px(x, y), r = B.px(x, y); if (q[0] !== r[0] || q[1] !== r[1] || q[2] !== r[2]) { n++; if (x / 2 > 1100) right++; } } out[mode].headerChanged = n; out[mode].changedRightOfX1100 = right; await ctx.close(); }
  await b.close(); console.log(JSON.stringify(out)); fs.writeFileSync(path.join(__dirname, '..', 'out', 'hover-check.json'), JSON.stringify(out, null, 1)); })();
