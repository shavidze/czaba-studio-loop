const fs = require('fs');
const crypto = require('crypto');
const src = fs.readFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-255/c255.cjs', 'utf8');
const helpers = src.slice(src.indexOf('const sleep'), src.indexOf('const st = (page)')).replace(/const SHA = .*\n/, '');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
var BASE = 'http://127.0.0.1:5173';
eval(helpers.replace('const sleep', 'var sleep').replace(/async function (\w+)/g, 'var $1 = async function').replace(/const (INIT|readWav|wavInfo|blur) =/g, 'var $1 ='));
const D = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-256/browser/';
const mode = process.argv[2] || 'geometry';
const widths = (process.argv[3] || '').split(',').filter(Boolean).map((w) => w.split('x').map(Number));

const geometry = (page) => page.evaluate(() => {
  const q = (id) => document.querySelector(`[data-testid="${id}"]`);
  const r = (e) => { const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), r: +b.right.toFixed(1), b: +b.bottom.toFixed(1) }; };
  const root = q('arrangement-transport');
  const groups = { edit: q('arrangement-transport-edit'), centre: q('arrangement-transport-centre'), view: q('arrangement-transport-view') };
  const rects = Object.fromEntries(Object.entries(groups).map(([k, e]) => [k, r(e)]));
  const overflow = { root: root.scrollWidth - root.clientWidth, ...Object.fromEntries(Object.entries(groups).map(([k, e]) => [k, e.scrollWidth - e.clientWidth])) };
  const rr = r(root);
  const centreOffset = +((rects.centre.x + rects.centre.w / 2) - (rr.x + rr.w / 2)).toFixed(1);
  const overlap = (a, b) => !(a.r <= b.x || b.r <= a.x || a.b <= b.y || b.b <= a.y);
  const clock = q('arrangement-position').parentElement;
  const clockLine = parseFloat(getComputedStyle(q('arrangement-position')).lineHeight);
  const rows = new Set(Object.values(rects).map((g) => Math.round(g.y))).size;
  const natural = Object.fromEntries(Object.entries(groups).map(([k, e]) => [k, e.scrollWidth]));
  const tops = {
    header: r(root.previousElementSibling ?? root).y,
    library: (document.querySelector('[data-source-id]')?.closest('aside, section') ?? null) ? r(document.querySelector('[data-source-id]').closest('aside, section')).y : null,
    ruler: q('arrangement-ruler') ? r(q('arrangement-ruler')).y : null,
    firstLane: document.querySelector('[data-track-id]') ? r(document.querySelector('[data-track-id]')).y : null,
  };
  return { vw: innerWidth, toolbar: rr, rows, rects, overflow, centreOffset, overlaps: [overlap(rects.edit, rects.centre), overlap(rects.centre, rects.view), overlap(rects.edit, rects.view)], clockH: +clock.getBoundingClientRect().height.toFixed(1), positionH: +q('arrangement-position').getBoundingClientRect().height.toFixed(1), clockLine, natural, tops };
});

const rgb = (s) => { const m = s.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m[3] ?? 1 }; };
const lum = ({ r, g, b }) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const over = (top, bottom) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 });
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return +((x + 0.05) / (y + 0.05)).toFixed(2); };

const colours = (page) => page.evaluate(() => {
  const btn = (n) => [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === n);
  const pick = (b) => { const svg = b.querySelector('svg'); const cs = getComputedStyle(b); return { bg: cs.backgroundColor, color: getComputedStyle(svg).color, stroke: getComputedStyle(svg).stroke, box: (() => { const r = b.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(2)); })(), playing: b.dataset.playing ?? null, label: b.getAttribute('aria-label'), title: b.title }; };
  return { toolbarBg: getComputedStyle(document.querySelector('[data-testid="arrangement-transport"]')).backgroundColor, play: pick(btn('Play')), stop: pick(btn('Stop')) };
});
const contrast = (c) => {
  const base = rgb(c.toolbarBg);
  const one = (b) => { const fill = over(rgb(b.bg), base); const glyph = over(rgb(b.color), fill); return { fill: b.bg, glyph: b.color, ratio: ratio(glyph, fill), box: b.box, playing: b.playing, label: b.label, title: b.title }; };
  return { toolbarBg: c.toolbarBg, play: one(c.play), stop: one(c.stop) };
};

const state = (page) => page.evaluate(() => ({
  pos: document.querySelector('[data-testid=arrangement-position]').textContent,
  marker: document.querySelector('[data-testid=arrangement-insert-marker]')?.getAttribute('data-insert-marker') ?? null,
  playing: [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Play')?.dataset.playing,
  status: document.querySelector('[data-testid=arrangement-status]')?.textContent,
  rms: Math.max(0, ...window.__rms()),
  pause: [...document.querySelectorAll('button')].filter((b) => b.getAttribute('aria-label') === 'Pause').length,
}));

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = {};
  for (const [w, h] of widths) {
    const k = `${mode}-${w}x${h}`;
    const { ctx, page, errors } = await open(browser, { width: w, height: h }, { pulse: mode !== 'geometry-empty', zoom: false });
    const r = {};
    out[k] = r;
    r.geometry = await geometry(page);
    if (mode === 'run') {
      r.colStopped = contrast(await colours(page));
      const play = page.getByRole('button', { name: 'Play', exact: true });
      const stop = page.getByRole('button', { name: 'Stop', exact: true });
      const lane = await page.evaluate(() => { const l = [...document.querySelectorAll('[data-track-id]')][1].getBoundingClientRect(); return { y: l.y + l.height - 6 }; });
      r.s0 = await state(page);
      await play.click(); await sleep(900); r.afterPlay = await state(page);
      r.colPlaying = contrast(await colours(page));
      await page.screenshot({ path: `${D}${k}-playing.png` });
      await play.click(); await sleep(500); r.afterPlayAgain = await state(page);
      await stop.click(); await sleep(300); r.afterStop300 = await state(page); await sleep(500); r.afterStopLater = await state(page);
      await page.screenshot({ path: `${D}${k}-stopped.png` });
      await stop.click(); await sleep(300); r.afterStopStopped = await state(page);
      await stop.dblclick(); await sleep(400); r.afterDbl = await state(page);
      r.activeAfterDbl = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
      await play.click(); await sleep(900); r.beforeDblPlaying = await state(page);
      await stop.dblclick(); await sleep(300); r.afterDblPlaying300 = await state(page); await sleep(700); r.afterDblPlaying1s = await state(page);
      r.statusLogTail = await page.evaluate(() => window.__statusLog.slice(-6).map((e) => e.text));
    } else {
      await page.screenshot({ path: `${D}${k}.png` });
    }
    r.errors = errors;
    await ctx.close();
    console.log(k, JSON.stringify(r).slice(0, 600));
  }
  await browser.close();
  fs.writeFileSync(`${D}${mode}-${Date.now()}.json`, JSON.stringify(out, null, 1));
})();
