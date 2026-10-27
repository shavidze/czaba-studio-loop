// C round 210 — VISUAL: computed style + boxes of each fader at rest / hover / keyboard focus-visible / mouse-pressed.
// usage: node c210vis.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c210lib.cjs');
const path = require('path');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4] || 1440), Number(process.argv[5] || 900)];

const read = (loc) => loc.evaluate((el) => {
  const r = (e) => { const b = e.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map((v) => Math.round(v * 10) / 10); };
  const cs = getComputedStyle(el);
  const pick = (s, keys) => Object.fromEntries(keys.map((k) => [k, s.getPropertyValue(k)]));
  const K = ['background-color', 'background-image', 'outline-style', 'outline-width', 'outline-color', 'outline-offset', 'border-radius', 'box-shadow', 'cursor', 'opacity', 'height', 'width', 'transform', '--studio-fader-fill'];
  const TK = ['width', 'height', 'background-color', 'border-top-width', 'border-top-color', 'border-radius', 'box-shadow', 'transform', 'margin-top'];
  const thumb = getComputedStyle(el, '::-webkit-slider-thumb');
  const track = getComputedStyle(el, '::-webkit-slider-runnable-track');
  const row = el.parentElement;
  const lane = el.closest('[data-track-id],[role=group],section,li') || row.parentElement;
  return { focusVisible: el.matches(':focus-visible'), active: el.matches(':active'), hover: el.matches(':hover'), el: pick(cs, K), thumb: pick(thumb, TK), track: pick(track, ['height', 'background-color', 'background-image', 'border-radius']), box: r(el), row: r(row), rowChildren: [...row.children].map((c) => ({ tag: c.tagName, box: r(c), text: (c.textContent || '').trim().slice(0, 20) })), lane: r(lane) };
});

(async () => {
  const browser = await L.launch();
  const R = { base, tag, vw, vh, utc: new Date().toISOString() };
  try {
    const { ctx, page, errors } = await L.openLab(browser, base, vw, vh);
    const gv = await L.makeGroup(page);
    await L.sleep(500);
    const faders = [['track', L.sl(page, 'Volume — Music')], ['pan', L.sl(page, 'Pan — Music')], ['master', L.sl(page, 'Master Volume')], ['group', gv]];
    for (const [k, loc] of faders) {
      const o = {};
      await loc.scrollIntoViewIfNeeded();
      await page.mouse.move(5, 5);
      await L.blurActive(page);
      await L.sleep(300);
      o.rest = await read(loc);
      const b = await loc.boundingBox();
      const clip = { x: Math.max(0, b.x - 60), y: Math.max(0, b.y - 14), width: b.width + 160, height: b.height + 28 };
      await page.screenshot({ path: path.join(L.SHOTS, `vis-${tag}-${k}-rest.png`), clip });
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await L.sleep(300);
      o.hover = await read(loc);
      await page.screenshot({ path: path.join(L.SHOTS, `vis-${tag}-${k}-hover.png`), clip });
      await page.mouse.move(5, 5);
      await page.keyboard.press('Shift');
      await loc.focus();
      await L.sleep(300);
      o.focusVisible = await read(loc);
      await page.screenshot({ path: path.join(L.SHOTS, `vis-${tag}-${k}-focus.png`), clip });
      await L.blurActive(page);
      await L.sleep(200);
      const v0 = await loc.inputValue();
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.down();
      await L.sleep(300);
      o.pressed = await read(loc);
      await page.screenshot({ path: path.join(L.SHOTS, `vis-${tag}-${k}-pressed.png`), clip });
      await page.mouse.up();
      await L.quiet(page);
      o.valueBeforePress = v0;
      o.valueAfterPress = await loc.inputValue();
      await L.blurActive(page);
      R[k] = o;
    }
    await page.screenshot({ path: path.join(L.SHOTS, `vis-${tag}-full.png`) });
    R.errors = errors;
    await ctx.close();
  } catch (e) {
    R.fatal = String(e && e.stack || e).slice(0, 1500);
  }
  await browser.close();
  L.save(`vis-${tag}.json`, R);
  console.log('done', tag, R.fatal || '');
})();
