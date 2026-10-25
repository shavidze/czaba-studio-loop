const L = require('./lib.cjs');
const path = require('path');
const m = (p) => p.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2), radius: cs.borderTopLeftRadius, bw: cs.borderTopWidth }; };
  const root = q('[data-testid=arrangement-overview]');
  return { root: r(root), overlay: r(root && root.firstElementChild), frame: r(q('[data-testid=arrangement-overview-frame]')), extent: root && root.dataset.extent, zoom: (q('[data-testid=arrangement-zoom-readout]') || {}).textContent, parent: r(root && root.parentElement), valuetext: root && root.getAttribute('aria-valuetext') };
});
(async () => {
  const b = await L.launch(); const net = []; const res = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}`; const o = await L.openStudio(b, vp, `probe-ov-${k}`, net); const p = o.page; const R = res[k] = {};
    R.fonts = o.log.fontsReady && o.log.fontsReady.ok;
    R.empty_default = await m(p);
    const z = p.locator('[data-testid=arrangement-zoom]');
    await z.focus(); await p.keyboard.press('End'); await L.sleep(400); R.empty_max = await m(p);
    await p.keyboard.press('Home'); await L.sleep(400); R.empty_min = await m(p);
    await L.blur(p);
    R.add = await L.addAt(p, 'demo-middle-east', 'music', 1);
    R.clip_default = await m(p);
    await z.focus(); await p.keyboard.press('End'); await L.sleep(400); await L.blur(p); R.clip_max_left = await m(p);
    const ov = await p.locator('[data-testid=arrangement-overview]').boundingBox();
    await p.mouse.click(ov.x + ov.width - 2, ov.y + ov.height / 2); await L.sleep(500); R.clip_max_right = await m(p);
    await p.screenshot({ path: path.join(L.SHOTS, `ov-${k}-clipmax-right.png`), clip: { x: ov.x - 4, y: ov.y - 4, width: ov.width + 8, height: ov.height + 8 } }).catch(() => {});
    await o.ctx.close();
  }
  await b.close();
  L.save(L.OUT, 'probe-ov.json', { head: '3810816', res, net });
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
