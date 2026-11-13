// C round 190 — VIS-190: mid-loader screenshots at ~550 and ~800 ms after insertion (1440, 375), DOM inventory of overlay elements, bright-pixel logo bbox vs c-round-189 mid shots.
const L = require('./lib.cjs'); const D = require('./ld.cjs'); const path = require('path'); const fs = require('fs'); const { decode } = require('./png.cjs');
const ROOT = path.join(__dirname, '..'); const SH = path.join(ROOT, 'shots', 'loader');
function bright(file) { const A = decode(fs.readFileSync(file)); let bb = [1e9, 1e9, -1, -1], n = 0; for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const p = A.px(x, y); if (p[0] > 200 && p[1] > 200 && p[2] > 200) { n++; bb = [Math.min(bb[0], x), Math.min(bb[1], y), Math.max(bb[2], x), Math.max(bb[3], y)]; } } return { n, bb, c: n ? [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2] : null }; }
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text'] }); const out = [];
  for (const W of ['1440', '375']) for (const T of [550, 800]) {
    const { ctx, page } = await D.fresh(b, W); await page.goto(L.BASE + '/', { waitUntil: 'commit' }); await D.waitIns(page, 8000);
    await D.waitSince(page, T - 30);
    const inv = await page.evaluate(() => { const ov = document.querySelector('[data-testid=entrance-loader]'); if (!ov) return null; const R = (e) => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map(Math.round); };
      const kids = [...ov.querySelectorAll('*')].filter((e) => e.tagName === 'DIV').map((e) => ({ cls: String(e.className).slice(0, 70), r: R(e), op: +getComputedStyle(e).opacity })).filter((k) => k.r[2] > 0);
      const logo = [...ov.querySelectorAll('span')].find((s) => s.textContent.trim() === 'CZABA'); const tag = [...ov.querySelectorAll('*')].find((e) => /Cinematic/i.test(e.textContent) && e.children.length === 0);
      return { par: ov.parentElement.tagName, ov: R(ov), logo: logo && R(logo), tagline: tag && { r: R(tag), txt: tag.textContent.trim() }, nDiv: kids.length, kids: kids.slice(0, 40), t: performance.now() - window.__ld.ins[0] }; });
    const f = path.join(SH, `vis-${W}-${T}.png`); await page.screenshot({ path: f }); const at = await D.sinceIns(page);
    out.push({ W, T, invAt: inv && +inv.t.toFixed(0), shotDoneAt: +at.toFixed(0), inv, bright: bright(f) }); await ctx.close();
  }
  for (const W of ['1440', '375']) out.push({ ref189: W, bright: bright(path.join(ROOT, '../c-round-189/shots/loader', `mid-${W}.png`)) });
  await b.close(); L.save(path.join(ROOT, 'out'), 'vis-190.json', out);
  for (const r of out) console.log(JSON.stringify(r.ref189 ? r : { W: r.W, T: r.T, invAt: r.invAt, shotDoneAt: r.shotDoneAt, par: r.inv && r.inv.par, ov: r.inv && r.inv.ov, logo: r.inv && r.inv.logo, tag: r.inv && r.inv.tagline, nDiv: r.inv && r.inv.nDiv, bright: r.bright }));
})();
