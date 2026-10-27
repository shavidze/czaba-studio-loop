// C round 203 — CONTRAST-203 + HOVER-203. Play preview ring per side (DSF 3) on product page and '/' card, tree vs ref.
// Method: ray from the button centre along each axis. Button edge = known box (r CSS px). Ring band = device pixels in
// [edge+0.5 css, edge+6 css] whose colour is nearest to the composite of the computed outline colour; gap = pixels between
// the edge and the band; out = first pixels after the band. node contrast.cjs <port>
const F = require('./fl.cjs'); const path = require('path'); const fs = require('fs'); const { decode } = require('./png.cjs');
const PORT = process.argv[2]; const TAG = PORT === '5174' ? 'ref' : 'tree';
const SH = path.join(F.ROOT, 'shots', 'contrast'); fs.mkdirSync(SH, { recursive: true });
const D = 3; const M = 24;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
function analyse(file, box) {
  const im = decode(fs.readFileSync(file)); const cx = Math.round((M + box[2] / 2) * D), cy = Math.round((M + box[3] / 2) * D);
  const R = {};
  for (const [k, dx, dy, half] of [['top', 0, -1, box[3] / 2], ['bottom', 0, 1, box[3] / 2], ['left', -1, 0, box[2] / 2], ['right', 1, 0, box[2] / 2]]) {
    const edge = Math.round(half * D); const prof = [];
    for (let t = edge - 6; t <= edge + 8 * D; t++) prof.push([t - edge, im.px(cx + dx * t, cy + dy * t)]);
    // brightest/most saturated warm band: pick pixels whose (r - b) is maximal and luminance highest outside the edge
    const cand = prof.filter(([o]) => o >= 1 && o <= 6 * D);
    const score = (p) => (p[0] - p[2]) + 0.5 * p[0];
    const best = Math.max(...cand.map(([, p]) => score(p)));
    const ring = cand.filter(([, p]) => score(p) >= best - 25);
    const r0 = ring[0][0], r1 = ring[ring.length - 1][0];
    const gapPx = prof.filter(([o]) => o >= 1 && o < r0); const outPx = prof.filter(([o]) => o > r1 && o <= r1 + 3);
    const ringC = prof.find(([o]) => o === Math.round((r0 + r1) / 2))[1];
    const pickWorst = (arr) => arr.length ? arr.map(([, p]) => p).reduce((w, p) => (F.contrast(ringC, p) < F.contrast(ringC, w) ? p : w)) : null;
    const gap = pickWorst(gapPx.slice(-2)); const out = pickWorst(outPx.slice(1));
    R[k] = { ringBand: [r0, r1], ring: ringC, gap, out, cGap: gap ? +F.contrast(ringC, gap).toFixed(2) : null, cOut: out ? +F.contrast(ringC, out).toFixed(2) : null, prof: prof.filter((_, i) => i % 1 === 0).map(([o, p]) => `${o}:${p.join(',')}`).join(' ') };
  }
  return R;
}
(async () => {
  const b = await F.launch(); const R = {};
  for (const [W, H] of [[1440, 900], [1280, 720]]) for (const [pn, url] of [['product', '/products/pulse-loop-kit'], ['home', '/']]) {
    const key = `${TAG}-${W}-${pn}`;
    const { ctx, page } = await F.newPage(b, W, H, { deviceScaleFactor: D });
    try {
      await page.goto(`http://127.0.0.1:${PORT}${url}`, { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await F.sleep(400);
      const loc = page.locator('button[aria-label="Play preview"]').filter({ visible: true }).first();
      const n = await page.locator('button[aria-label="Play preview"]').count();
      await loc.scrollIntoViewIfNeeded(); await F.sleep(400);
      await page.mouse.move(2, H - 2);
      const restShadow = await loc.evaluate((e) => getComputedStyle(e).boxShadow);
      await loc.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await F.sleep(800);
      const d = await F.describeActive(page); const bb = d.box;
      const f = path.join(SH, `${key}.png`);
      await page.screenshot({ path: f, clip: { x: bb[0] - M, y: bb[1] - M, width: bb[2] + 2 * M, height: bb[3] + 2 * M } });
      const r = { buttons: n, name: d.name, box: bb, os: d.os, ow: d.ow, oo: d.oo, oc: d.oc, fs: d.focusSource, focusShadow: d.bs, restShadow, sides: analyse(f, bb) };
      // HOVER: blur, move the mouse over, settle, read transform + shadow; then click and read the outline
      await page.evaluate(() => document.activeElement.blur()); await F.sleep(300);
      const bx = await loc.boundingBox();
      await page.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await F.sleep(700);
      r.hover = await loc.evaluate((e) => { const c = getComputedStyle(e); return { transform: c.transform, shadow: c.boxShadow, bg: c.backgroundColor, os: c.outlineStyle, fs: document.documentElement.dataset.focusSource || null }; });
      await page.screenshot({ path: path.join(SH, `${key}-hover.png`), clip: { x: bx.x - M, y: bx.y - M, width: bx.width + 2 * M, height: bx.height + 2 * M } });
      await page.mouse.down(); await page.mouse.up(); await F.sleep(600);
      r.afterClick = await page.evaluate(() => { const e = document.activeElement; const c = getComputedStyle(e); return { name: e.getAttribute('aria-label') || e.tagName, os: c.outlineStyle, ow: c.outlineWidth, shadow: c.boxShadow, fs: document.documentElement.dataset.focusSource || null }; });
      await page.screenshot({ path: path.join(SH, `${key}-click.png`), clip: { x: bx.x - M, y: bx.y - M, width: bx.width + 2 * M, height: bx.height + 2 * M } });
      R[key] = r;
    } catch (e) { R[key] = { err: String(e).slice(0, 300) }; }
    await ctx.close();
  }
  F.save(path.join(F.ROOT, 'out', 'contrast', `${TAG}.json`), R);
  for (const [k, r] of Object.entries(R)) { if (r.err) { console.log(k, r.err); continue; } console.log(k, 'n', r.buttons, r.os, r.ow, r.oo, r.fs, 'rest', r.restShadow, '|', Object.entries(r.sides).map(([s, v]) => `${s} ${v.cGap}/${v.cOut} band${v.ringBand}`).join(' ; '), '| hover', JSON.stringify(r.hover), '| click', JSON.stringify(r.afterClick)); }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
