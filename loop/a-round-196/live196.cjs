// A round 196 live proof (SABA-B-4 stage 1). node live196.cjs <W>
const T = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-195/tools/';
const X = require(`${T}lib122.cjs`);
const { L, sleep } = X;
const { decode } = require(`${T}png.cjs`);
const fs = require('fs');
const path = require('path');

const W = +process.argv[2] || 1440;
const OUT = path.join(__dirname, 'live', String(W));
fs.mkdirSync(OUT, { recursive: true });
const STATE = '/home/runner/czaba-project/tmp/studio-real-loop/a-browse.json';
const BASE_PNG = path.join(__dirname, '..', 'c-round-191', 'shots', `c191-${W}-1`, 'rest-full.png');
const res = { W, utc: new Date().toISOString(), base: L.BASE };
const net = [];

const RANGES = {
  pan: '[data-testid=arrangement-track-pan]',
  trackVolume: 'input[type=range][aria-label^="Volume — "]',
  groupVolume: '[data-testid=arrangement-group-volume]',
  master: 'input[type=range][aria-label="Master Volume"]',
  clipGain: '[data-testid=arrangement-detail-clip-gain-fader]',
  zoom: '[data-testid=arrangement-zoom]',
};

const focusInfo = (p) =>
  p.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return null;
    const s = getComputedStyle(a);
    const r = a.getBoundingClientRect();
    return {
      tag: a.tagName,
      testid: a.getAttribute('data-testid'),
      label: a.getAttribute('aria-label'),
      outlineStyle: s.outlineStyle,
      outlineWidth: s.outlineWidth,
      outlineColor: s.outlineColor,
      outlineOffset: s.outlineOffset,
      boxShadow: s.boxShadow,
      bg: s.backgroundColor,
      border: s.borderColor,
      box: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(2)),
      source: document.documentElement.dataset.focusSource || null,
    };
  });

async function shotAround(p, sel, name, pad = 10) {
  const b = await p.locator(sel).first().boundingBox();
  if (!b) return null;
  const clip = { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: b.width + pad * 2, height: b.height + pad * 2 };
  const f = path.join(OUT, `${name}.png`);
  await p.screenshot({ path: f, clip });
  return f;
}

async function pressCenter(p, sel) {
  const b = await p.locator(sel).first().boundingBox();
  await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await p.mouse.down();
  await sleep(120);
  await p.mouse.up();
  await sleep(250);
}

function colorDist(a, b) {
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
}

(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--disable-lcd-text'] });
  try {
    const o = await L.openStudio(b, X.VPS[W], `a196-${W}`, net, { deviceScaleFactor: 2, extraInit: X.tapInit });
    const p = o.page;
    await L.blur(p);
    await p.mouse.move(2, 2);
    await sleep(500);
    const restFile = path.join(OUT, 'rest-full.png');
    await p.screenshot({ path: restFile });
    res.rangeBoxes = await p.evaluate(() =>
      [...document.querySelectorAll('input[type=range]')].map((e) => {
        const r = e.getBoundingClientRect();
        return { label: e.getAttribute('aria-label'), box: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(2)) };
      }),
    );
    res.neighbourBoxes = await p.evaluate(() =>
      ['arrangement-track-pan-reset', 'arrangement-track-mute', 'arrangement-track-solo'].map((id) => {
        const e = document.querySelector(`[data-testid=${id}]`);
        const r = e ? e.getBoundingClientRect() : null;
        return { id, box: r ? [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(2)) : null };
      }),
    );
    if (fs.existsSync(BASE_PNG)) {
      const A = decode(fs.readFileSync(restFile));
      const B = decode(fs.readFileSync(BASE_PNG));
      if (A.w !== B.w || A.h !== B.h) {
        res.rest = { size: [A.w, A.h, B.w, B.h] };
      } else {
        const boxes = res.rangeBoxes.map((r) => r.box.map((v) => v * 2)).map(([x, y, w, h]) => [x - 4, y - 4, x + w + 4, y + h + 4]);
        let changed = 0;
        let outside = 0;
        const outsideBox = [1e9, 1e9, -1, -1];
        for (let y = 0; y < A.h; y += 1) {
          for (let x = 0; x < A.w; x += 1) {
            if (colorDist(A.px(x, y), B.px(x, y)) === 0) continue;
            changed += 1;
            if (!boxes.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1)) {
              outside += 1;
              outsideBox[0] = Math.min(outsideBox[0], x);
              outsideBox[1] = Math.min(outsideBox[1], y);
              outsideBox[2] = Math.max(outsideBox[2], x);
              outsideBox[3] = Math.max(outsideBox[3], y);
            }
          }
        }
        res.rest = { changed, outsideRangeBoxes: outside, outsideBboxDevPx: outside ? outsideBox : null };
      }
    }

    const seed = await p.evaluate(() => ({
      source: document.querySelector('[role=option][data-source-id]').getAttribute('data-source-id'),
      track: [...document.querySelectorAll('[data-track-id]')]
        .map((e) => e.getAttribute('data-track-id'))
        .find((id) => document.querySelector(`[data-track-id="${id}"] [data-testid=arrangement-track-pan]`)),
    }));
    res.seed = seed;
    res.added = await L.addAt(p, seed.source, seed.track, 1);
    await L.selectClip(p, await p.evaluate(() => document.querySelector('[data-clip-id]').getAttribute('data-clip-id')));
    await L.blur(p);
    await p.mouse.move(2, 2);
    await sleep(400);
    const thumbFile = path.join(OUT, 'thumbs-selected.png');
    await p.screenshot({ path: thumbFile });
    const img = decode(fs.readFileSync(thumbFile));
    res.thumbs = {};
    for (const [name, sel] of Object.entries(RANGES)) {
      const t = await p.evaluate((s) => {
        const e = document.querySelector(s);
        if (!e) return null;
        const r = e.getBoundingClientRect();
        const min = +e.min;
        const max = +e.max;
        const frac = max > min ? (+e.value - min) / (max - min) : 0;
        return { x: r.x, y: r.y, w: r.width, h: r.height, frac, disabled: e.disabled };
      }, sel);
      if (!t) {
        res.thumbs[name] = null;
        continue;
      }
      const cx = Math.round((t.x + 7 + (t.w - 14) * t.frac) * 2);
      const cy = Math.round((t.y + t.h / 2) * 2);
      const centre = img.px(cx, cy);
      const target = [0xec, 0xe6, 0xda];
      let left = cx;
      let right = cx;
      while (left > 0 && colorDist(img.px(left - 1, cy), centre) <= 24) left -= 1;
      while (right < img.w - 1 && colorDist(img.px(right + 1, cy), centre) <= 24) right += 1;
      let top = cy;
      let bottom = cy;
      while (top > 0 && colorDist(img.px(cx, top - 1), centre) <= 24) top -= 1;
      while (bottom < img.h - 1 && colorDist(img.px(cx, bottom + 1), centre) <= 24) bottom += 1;
      res.thumbs[name] = {
        centre,
        dToEce6da: colorDist(centre, target),
        widthCssPx: (right - left + 1) / 2,
        heightCssPx: (bottom - top + 1) / 2,
        disabled: t.disabled,
        box: [t.x, t.y, t.w, t.h].map((v) => +v.toFixed(2)),
      };
    }

    await L.blur(p);
    await p.mouse.move(2, 2);
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.locator('body').press('Shift');
    let reached = null;
    for (let i = 0; i < 400; i += 1) {
      await p.keyboard.press('Tab');
      const id = await p.evaluate(() => document.activeElement && document.activeElement.getAttribute('data-testid'));
      if (id === 'arrangement-track-pan') {
        reached = i + 1;
        break;
      }
    }
    res.sabaScene = { tabs: reached, focus: await focusInfo(p) };
    await sleep(300);
    res.sabaScene.shot = await shotAround(p, ':focus', 'saba-pan-keyboard', 16);

    res.pointer = {};
    for (const name of ['pan', 'trackVolume', 'zoom']) {
      const sel = RANGES[name];
      await L.blur(p);
      await pressCenter(p, sel);
      const afterPress = await focusInfo(p);
      const pressShot = await shotAround(p, sel, `${name}-mouse-pressed`, 16);
      const key = name === 'pan' ? 'ArrowRight' : 'ArrowUp';
      const before = await p.evaluate((s) => document.querySelector(s).value, sel);
      await p.keyboard.press(key);
      await sleep(250);
      const afterKey = await focusInfo(p);
      const after = await p.evaluate((s) => document.querySelector(s).value, sel);
      const keyShot = await shotAround(p, sel, `${name}-after-${key}`, 16);
      res.pointer[name] = { afterPress, pressShot, key, valueBefore: before, valueAfter: after, afterKey, keyShot };
    }
    await L.blur(p);
    await pressCenter(p, RANGES.trackVolume);
    await p.keyboard.press('Shift');
    await p.keyboard.press('Alt');
    res.pointer.modifiersOnly = await focusInfo(p);
    await p.keyboard.press('Tab');
    await sleep(200);
    res.pointer.tabAfter = await focusInfo(p);
    await o.ctx.storageState({ path: STATE });
  } catch (e) {
    res.error = String((e && e.stack) || e).slice(0, 1200);
  }
  await b.close();
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(res, null, 2));
  console.log(JSON.stringify({ W, rest: res.rest, thumbs: res.thumbs, saba: res.sabaScene, error: res.error, net: res.net }, null, 1));
})();
