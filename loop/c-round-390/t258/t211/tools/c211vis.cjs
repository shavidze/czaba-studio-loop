// C round 211 — VISUAL-211: computed style/boxes + crops of the Clip Gain fader, field, reset and both waveforms
// at rest / hover / keyboard focus / mouse-pressed. usage: node c211vis.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c211lib.cjs');
const path = require('path');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4] || 1440), Number(process.argv[5] || 900)];
const read = (loc) => loc.evaluate((el) => {
  const r = (e) => { const b = e.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map((v) => Math.round(v * 10) / 10); };
  const cs = getComputedStyle(el);
  const K = ['background-color', 'background-image', 'color', 'border-top-color', 'border-top-width', 'outline-style', 'outline-width', 'outline-color', 'outline-offset', 'border-radius', 'box-shadow', 'cursor', 'opacity', 'height', 'width', 'transform', '--studio-fader-fill', 'font-size', 'font-family'];
  const pick = (s) => Object.fromEntries(K.map((k) => [k, s.getPropertyValue(k)]));
  const row = el.parentElement;
  return { focusVisible: el.matches(':focus-visible'), hover: el.matches(':hover'), el: pick(cs), box: r(el), row: r(row), rowChildren: [...row.children].map((c) => ({ tag: c.tagName, box: r(c) })) };
});
const regions = (page) => page.evaluate(() => {
  const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map((v) => Math.round(v * 10) / 10); };
  const blk = document.querySelector('[data-testid=arrangement-detail-clip-gain]');
  const dw = document.querySelector('[data-testid=arrangement-detail-waveform]');
  const lane = document.querySelector('[data-clip-kind="audio"] [data-testid=arrangement-clip-waveform]');
  const ds = dw && dw.querySelector('svg[viewBox$=" 2"]');
  const st = (e) => { if (!e) return null; const c = getComputedStyle(e); const p = e.querySelector('path'); const pc = p ? getComputedStyle(p) : null; return { box: r(e), fill: pc && pc.fill, stroke: pc && pc.stroke, color: c.color, opacity: c.opacity }; };
  return { block: r(blk), blockChildren: blk ? [...blk.querySelectorAll('*')].map((e) => r(e)) : null, detail: r(dw), detailSvg: st(ds), laneSvg: st(lane), panel: r(document.querySelector('[data-testid=arrangement-detail-panel]')) };
});
(async () => {
  const browser = await L.launch();
  const R = { base, tag, vw, vh, utc: new Date().toISOString() };
  try {
    const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
    await L.selectFirstClip(page);
    await L.typeClipGain(page, -6);
    await page.mouse.move(5, 5);
    await L.sleep(500);
    R.regions = await regions(page);
    const crop = async (name, b) => page.screenshot({ path: path.join(L.SHOTS, `vis-${tag}-${vw}-${name}.png`), clip: { x: Math.max(0, b[0] - 4), y: Math.max(0, b[1] - 4), width: b[2] + 8, height: b[3] + 8 } });
    await crop('block-rest', R.regions.block);
    await crop('detailwave-rest', R.regions.detail);
    await crop('lanewave-rest', R.regions.laneSvg.box);
    const els = [['fader', L.sl(page, 'Clip Gain — fader')], ['field', page.getByTestId('arrangement-detail-clip-gain-input')], ['reset', page.getByTestId('arrangement-detail-clip-gain-reset')]];
    for (const [k, loc] of els) {
      const o = {};
      await page.mouse.move(5, 5); await L.blurActive(page); await L.sleep(300);
      o.rest = await read(loc);
      const b = await loc.boundingBox();
      const clip = { x: Math.max(0, b.x - 10), y: Math.max(0, b.y - 8), width: b.width + 20, height: b.height + 16 };
      await page.screenshot({ path: path.join(L.SHOTS, `vis-${tag}-${vw}-${k}-rest.png`), clip });
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await L.sleep(400);
      o.hover = await read(loc);
      await page.screenshot({ path: path.join(L.SHOTS, `vis-${tag}-${vw}-${k}-hover.png`), clip });
      // keyboard focus: focus the previous focusable via click on fader then Tab/Shift+Tab to land with keyboard modality
      await page.mouse.move(5, 5);
      await loc.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await L.sleep(400);
      o.focus = await read(loc);
      o.focusActiveIsEl = await loc.evaluate((el) => document.activeElement === el);
      await page.screenshot({ path: path.join(L.SHOTS, `vis-${tag}-${vw}-${k}-focus.png`), clip });
      await L.blurActive(page); await L.sleep(200);
      if (k !== 'reset') {
        await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await L.sleep(400);
        o.pressed = await read(loc);
        await page.screenshot({ path: path.join(L.SHOTS, `vis-${tag}-${vw}-${k}-pressed.png`), clip });
        await page.mouse.up(); await L.quiet(page); await L.blurActive(page);
      }
      o.valueAfter = await loc.inputValue().catch(() => null);
      R[k] = o;
    }
    await page.mouse.move(5, 5); await L.sleep(300);
    R.regionsEnd = await regions(page);
    await page.screenshot({ path: path.join(L.SHOTS, `vis-${tag}-${vw}-full.png`) });
    R.errors = errors;
    await ctx.close();
  } catch (e) { R.fatal = String((e && e.stack) || e).slice(0, 1500); }
  await browser.close();
  L.save(`vis-${tag}-${vw}.json`, R);
  console.log('done', tag, vw, R.fatal || '');
})();
