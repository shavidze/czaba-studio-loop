const L = require('../../c-round-113/tools/lib.cjs');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const FIELD = '[data-testid=arrangement-detail-clip-gain-input]';
const FADER = '[data-testid=arrangement-detail-clip-gain-fader]';
const measure = (p) => p.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const c = q('[data-testid=arrangement-detail-content]').getBoundingClientRect();
  const b = q('[data-testid=arrangement-detail-clip-gain]');
  const br = b.getBoundingClientRect();
  const box = (s) => { const e = q(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(1), r: +r.right.toFixed(1), t: +r.top.toFixed(1), b: +r.bottom.toFixed(1), w: +r.width.toFixed(1), inside: r.left >= c.left && r.right <= c.right && r.top >= c.top && r.bottom <= c.bottom && r.right <= br.right + 0.5 } };
  const f = q('[data-testid=arrangement-detail-clip-gain-fader]');
  const fi = q('[data-testid=arrangement-detail-clip-gain-input]');
  return {
    block: { w: +br.width.toFixed(1), h: +br.height.toFixed(1), scrollW: b.scrollWidth, clientW: b.clientWidth },
    range: box('[data-testid=arrangement-detail-clip-gain-range]'), rangeText: q('[data-testid=arrangement-detail-clip-gain-range]')?.textContent ?? null,
    field: box('[data-testid=arrangement-detail-clip-gain-input]'), fader: box('[data-testid=arrangement-detail-clip-gain-fader]'), reset: box('[data-testid=arrangement-detail-clip-gain-reset]'),
    fieldValue: fi.value, faderValue: f.value, valuetext: f.getAttribute('aria-valuetext'), faderDisabled: f.disabled,
    header: q('[data-testid=arrangement-detail-header-label]')?.textContent,
    status: [...document.querySelectorAll('[aria-live]')].map((e) => e.textContent).filter(Boolean).join(' | ').slice(0, 200),
  };
});
let musicId = null;
async function setGain(p, id, value) {
  if (musicId) await L.selectClip(p, musicId);
  await L.selectClip(p, id);
  await p.fill(FIELD, String(value));
  await p.press(FIELD, 'Enter');
  await L.sleep(200);
  await L.blur(p);
}
(async () => {
  const browser = await L.launch();
  const net = [];
  const result = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const key = `${vp.width}x${vp.height}`;
    const { ctx, page: p, log } = await L.openStudio(browser, vp, `a115-${key}`, net);
    await L.setSnapOff(p);
    for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(p, s, ln, t);
    const ids = await p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((e) => ({ id: e.getAttribute('data-clip-id'), lane: e.closest('[data-track-id]').getAttribute('data-track-id') })));
    const stems = ids.find((x) => x.lane === 'stems').id;
    const sfx = ids.find((x) => x.lane === 'sfx').id;
    musicId = ids.find((x) => x.lane === 'music').id;
    await L.selectClip(p, stems);
    const expanded = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]').getAttribute('aria-expanded'));
    if (expanded !== 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(600); }
    const r = {};
    await setGain(p, stems, -60);
    await setGain(p, sfx, 24);
    await L.selectClip(p, stems);
    r.single = await measure(p);
    let mod = 'Shift';
    await L.selectClip(p, sfx, ['Shift']);
    let m = await measure(p);
    if (!/2/.test(m.header || '')) { mod = 'Control'; await L.selectClip(p, stems); await L.selectClip(p, sfx, ['Control']); m = await measure(p); }
    r.modifier = mod;
    r.multiWorst = m;
    await p.screenshot({ path: path.join(OUT, `multi-worst-${key}.png`) });
    if (vp.width === 1440) {
      await setGain(p, stems, -6); await setGain(p, sfx, 1);
      await L.selectClip(p, musicId); await L.selectClip(p, stems); await L.selectClip(p, sfx, [mod]);
      r.mixed = await measure(p);
      const fb = await p.locator(FADER).boundingBox();
      const y = fb.y + fb.height / 2; const x0 = fb.x + fb.width * 0.5;
      await p.mouse.move(x0, y); await p.mouse.down();
      await p.mouse.move(x0 + 10, y, { steps: 5 }); await p.mouse.move(x0 + 20, y, { steps: 5 });
      await p.mouse.up(); await L.sleep(300);
      r.faderWidth = fb.width;
      r.afterDrag = await measure(p);
      await p.screenshot({ path: path.join(OUT, `multi-drag-${key}.png`) });
      await p.keyboard.press('Control+z'); await L.sleep(300);
      r.afterUndo = await measure(p);
    }
    r.log = log;
    result[key] = r;
    await ctx.close();
  }
  await browser.close();
  result.forbiddenNet = net.length;
  fs.writeFileSync(path.join(OUT, 'layout-probe.json'), JSON.stringify(result, null, 1));
  console.log(JSON.stringify(result, (k, v) => (k === 'log' ? undefined : v), 1));
})().catch((e) => { console.error(e); process.exit(1); });
