const fs = require('fs');
const src = fs.readFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-255/c255.cjs', 'utf8');
const helpers = src.slice(src.indexOf('const sleep'), src.indexOf('const st = (page)')).replace(/const SHA = .*\n/, '');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
var BASE = 'http://127.0.0.1:5173';
const crypto = require('crypto');
eval(helpers.replace('const sleep', 'var sleep').replace(/async function (\w+)/g, 'var $1 = async function').replace(/const (INIT|readWav|wavInfo|blur) =/g, 'var $1 ='));
const D = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-256/browser/';
const measure = (page) => page.evaluate(() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1; const g = cv.getContext('2d', { willReadFrequently: true });
  const toRgba = (c) => { g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = c; g.fillRect(0, 0, 1, 1); const [r, gg, b, a] = g.getImageData(0, 0, 1, 1).data; return { r, g: gg, b, a: a / 255 }; };
  const over = (t, u) => ({ r: t.r * t.a + u.r * (1 - t.a), g: t.g * t.a + u.g * (1 - t.a), b: t.b * t.a + u.b * (1 - t.a), a: 1 });
  const lum = ({ r, g, b }) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return +((x + 0.05) / (y + 0.05)).toFixed(2); };
  const base = toRgba(getComputedStyle(document.querySelector('[data-testid="arrangement-transport"]')).backgroundColor);
  const one = (name) => { const b = [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === name); const cs = getComputedStyle(b); const fillRaw = cs.backgroundColor; const fill = over(toRgba(fillRaw), base); const glyph = over(toRgba(getComputedStyle(b.querySelector('svg')).color), fill); const r = b.getBoundingClientRect(); return { fillRaw, fill: [fill.r, fill.g, fill.b].map(Math.round), glyph: [glyph.r, glyph.g, glyph.b].map(Math.round), glyphVsFill: ratio(glyph, fill), fillVsToolbar: ratio(fill, base), box: [r.x, r.y, r.width, r.height], playing: b.dataset.playing ?? null, title: b.title, name: b.getAttribute('aria-label') }; };
  return { toolbar: [base.r, base.g, base.b], play: one('Play'), stop: one('Stop') };
});
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const { ctx, page, errors } = await open(browser, vp, { pulse: true, zoom: false });
    const r = {}; out[vp.width] = r;
    await page.mouse.move(5, vp.height - 5);
    r.stopped = await measure(page);
    await page.keyboard.press('Space'); await sleep(600);
    r.playing = await measure(page);
    await page.locator('[aria-label="Play"]').hover(); await sleep(300);
    r.playingHover = await measure(page);
    await page.locator('[aria-label="Stop"]').hover(); await sleep(300);
    r.stopHoverPlaying = await measure(page);
    await page.mouse.move(5, vp.height - 5); await sleep(200);
    await page.locator('[data-testid="arrangement-transport-centre"]').screenshot({ path: `${D}centre-playing-${vp.width}.png` });
    await page.keyboard.press('Space'); await sleep(400);
    await page.locator('[data-testid="arrangement-transport-centre"]').screenshot({ path: `${D}centre-stopped-${vp.width}.png` });
    await page.locator('[aria-label="Play"]').hover(); await sleep(300);
    r.stoppedHover = await measure(page);
    await page.screenshot({ path: `${D}full-${vp.width}.png` });
    r.errors = errors; await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(`${D}contrast.json`, JSON.stringify(out, null, 1));
  for (const [w, r] of Object.entries(out)) for (const [s, m] of Object.entries(r)) if (m.play) console.log(w, s.padEnd(16), 'Play', m.play.fillRaw.slice(0, 40), m.play.fill, 'glyph', m.play.glyphVsFill, 'box', m.play.box.join(','), m.play.playing, '| Stop glyph', m.stop.glyphVsFill, 'fill', m.stop.fill);
})();
