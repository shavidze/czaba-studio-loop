// A round 191 after-fix proof: six controls x 5 states; crop = control box + 8 css px (DPR 2).
// For the four level faders each state also gets a "nothumb" crop (thumb opacity 0 via an injected probe style)
// so the brass fill's right edge can be read against the thumb centre. usage: node fader-final.cjs <W>x<H>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs'); const path = require('path'); const { decode } = require('./png.cjs');
const [vp = '1440x900'] = process.argv.slice(2); const [W, H] = vp.split('x').map(Number);
const OUT = path.join(__dirname, '..', 'final', String(W)); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEL = {
  trackVol: '[data-track-id=music] input[type=range][aria-label^="Volume — "]',
  pan: '[data-track-id=music] [data-testid=arrangement-track-pan]',
  groupVol: '[data-testid=arrangement-group-volume]',
  master: 'input[aria-label="Master Volume"]',
  clipGain: '[data-testid=arrangement-detail-clip-gain-fader]',
  zoom: '[data-testid=arrangement-zoom]',
};
const LEVEL = new Set(['trackVol', 'groupVol', 'master', 'clipGain']);
const near = (c, t, d) => Math.abs(c[0] - t[0]) <= d && Math.abs(c[1] - t[1]) <= d && Math.abs(c[2] - t[2]) <= d;
const IV = [236, 230, 218], BR = [201, 164, 106];
const nameSel = (t) => `[data-track-id="${t}"] [data-testid=arrangement-track-header] button[aria-label$="set as the active track"]`;
async function libDrop(p, src, lane, xFrac) {
  const o = p.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  const ob = await o.boundingBox();
  const lb = await p.evaluate((t) => { const l = document.querySelector(`[data-track-id="${t}"]`); const g = l.querySelector('[data-grid-seconds]') || l; const r = g.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, lane);
  await p.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2); await p.mouse.down();
  await p.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 });
  await p.mouse.move(lb.x + lb.w * xFrac, lb.y + lb.h / 2, { steps: 14 }); await sleep(300); await p.mouse.up(); await sleep(900);
}
function analyse(file, box, crop) {
  const I = decode(fs.readFileSync(file)); const s = 2; const bx0 = (box.x - crop.x) * s, by0 = (box.y - crop.y) * s, bx1 = bx0 + box.w * s, by1 = by0 + box.h * s;
  let th = { x0: 1e9, x1: -1, y0: 1e9, y1: -1 }; let brassOut = 0; const ringRows = new Set(); let parentGapBad = 0; const parent = I.px(1, I.h >> 1).slice(0, 3); const gapPx = [];
  for (let y = 0; y < I.h; y++) for (let x = 0; x < I.w; x++) {
    const c = I.px(x, y); const inBox = x >= bx0 && x < bx1 && y >= by0 && y < by1;
    if (inBox && near(c, IV, 12)) { th.x0 = Math.min(th.x0, x); th.x1 = Math.max(th.x1, x); th.y0 = Math.min(th.y0, y); th.y1 = Math.max(th.y1, y); }
    if (!inBox && near(c, BR, 24)) { brassOut++; if (x > bx0 + 20 && x < bx1 - 20) ringRows.add(y); }
    const straight = x >= bx0 + (by1 - by0) / 2 && x < bx1 - (by1 - by0) / 2;
    const inGap = straight && ((y >= by0 - 2 && y < by0) || (y >= by1 && y < by1 + 2));
    if (inGap) gapPx.push(c.slice(0, 3).join(','));
  }
  const counts = {}; for (const k of gapPx) counts[k] = (counts[k] || 0) + 1;
  const mode = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]; const parentGap = mode ? mode[0].split(',').map(Number) : parent;
  parentGapBad = gapPx.filter((k) => !near(k.split(',').map(Number), parentGap, 8)).length;
  let rx0 = 1e9, rx1 = -1; for (let y = 0; y < I.h; y++) for (let x = 0; x < I.w; x++) { const inB = x >= bx0 && x < bx1 && y >= by0 && y < by1; if (!inB && near(I.px(x, y), BR, 24)) { rx0 = Math.min(rx0, x); rx1 = Math.max(rx1, x); } }
  const rows = [...ringRows].sort((a, b) => a - b); const bands = []; for (const r of rows) { if (bands.length && r === bands[bands.length - 1][1] + 1) bands[bands.length - 1][1] = r; else bands.push([r, r]); }
  return { thumbDev: th.x1 >= 0 ? { x0: th.x0, x1: th.x1, y0: th.y0, y1: th.y1, w: th.x1 - th.x0 + 1, h: th.y1 - th.y0 + 1, cx: (th.x0 + th.x1) / 2, cy: (th.y0 + th.y1) / 2 } : null, brassOutsideBoxPx: brassOut, ringBandsDev: bands.map(([a, b]) => ({ from: a, to: b, thick: b - a + 1 })), gap1cssNonParentPx: parentGapBad, gapPxCount: gapPx.length, ringXDev: rx1 >= 0 ? [rx0, rx1] : null, boxXDev: [bx0, bx1], gapParent: parentGap.join(','), parentLeft: parent.join(',') };
}
function fillEdge(file, box, crop) {
  const I = decode(fs.readFileSync(file)); const s = 2; const y = Math.round((box.y - crop.y + box.h / 2) * s); let last = -1, first = -1;
  const bx0 = Math.round((box.x - crop.x) * s), bx1 = Math.round((box.x - crop.x + box.w) * s);
  for (let x = bx0; x < bx1; x++) if (near(I.px(x, y), BR, 24)) { if (first < 0) first = x; last = x; }
  return { brassFromDev: first, brassToDev: last };
}
(async () => {
  const b = await chromium.launch({ args: ['--disable-lcd-text'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 }); const p = await ctx.newPage();
  const errors = []; p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle', timeout: 90000 }); await sleep(3000);
  await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Decline'); if (x) x.click(); });
  await libDrop(p, 'demo-middle-east', 'music', 0.05);
  await p.click(nameSel('stems')); await sleep(200); await p.click(nameSel('sfx'), { modifiers: ['Shift'] }); await sleep(200);
  await p.mouse.click(5, H - 5); await sleep(150); await p.keyboard.press('Control+g'); await sleep(600);
  const t = p.locator('[data-testid=arrangement-detail-toggle]'); if ((await t.getAttribute('aria-expanded')) === 'false') { await t.click(); await sleep(700); }
  const clip = p.locator('[data-clip-id]').first(); const cb = await clip.boundingBox(); await p.mouse.click(cb.x + 30, cb.y + cb.height * 0.65); await sleep(400);
  await p.addStyleTag({ content: 'input[data-a191-nothumb]::-webkit-slider-thumb{opacity:0!important}' });
  const res = { vp, steps: ['library drop demo-middle-east onto the music lane', 'group: click Stems name, Shift+click SFX name, click blank, Ctrl+G', 'open the detail panel', 'click the music clip body (Clip Gain enabled)'], controls: {} };
  for (const [name, sel] of Object.entries(SEL)) {
    const f = p.locator(sel).first(); await f.scrollIntoViewIfNeeded(); await p.mouse.click(5, H - 5); await sleep(150);
    const geo = async () => f.evaluate((el) => { const r = el.getBoundingClientRect(); const sib = el.nextElementSibling || el.parentElement; const w = sib.getBoundingClientRect(); const c = getComputedStyle(el); const pc = getComputedStyle(sib, '::before'); return { box: { x: r.x, y: r.y, w: r.width, h: r.height }, wrap: { x: w.x, y: w.y, w: w.width, h: w.height }, value: el.value, min: el.min, max: el.max, fill: el.style.getPropertyValue('--studio-fader-fill'), fv: el.matches(':focus-visible'), wrapHasFv: sib.matches('.peer:focus-visible ~ *'), outline: c.outline, outlineOffset: c.outlineOffset, boxShadow: c.boxShadow, bg: c.backgroundColor, wrapOutline: pc.outline, wrapShadow: pc.boxShadow }; });
    const g0 = await geo(); const vbox = (g) => ({ x: g.box.x, y: g.box.y + g.box.h / 2 - 8, w: g.box.w, h: 16 }); const ringBox = name === 'pan' ? vbox(g0) : g0.box;
    const crop = { x: ringBox.x - 8, y: ringBox.y - 8, width: ringBox.w + 16, height: ringBox.h + 16 };
    const rec = {};
    const snap = async (state) => {
      const g = await geo(); const file = path.join(OUT, `${name}-${state}.png`); await p.screenshot({ path: file, clip: crop });
      const a = analyse(file, name === 'pan' ? vbox(g) : g.box, crop); const r = { ...g, ...a, shot: path.relative(path.join(__dirname, '..'), file) };
      if (LEVEL.has(name)) { await f.evaluate((el) => el.setAttribute('data-a191-nothumb', '')); await sleep(60); const nf = path.join(OUT, `${name}-${state}-nothumb.png`); await p.screenshot({ path: nf, clip: crop }); await f.evaluate((el) => el.removeAttribute('data-a191-nothumb')); const e = fillEdge(nf, g.box, crop); r.fillEdge = e; if (a.thumbDev && e.brassToDev >= 0) r.fillEdgeMinusThumbCentreCss = +((e.brassToDev + 1 - (a.thumbDev.cx + 0.5)) / 2).toFixed(2); r.thumbCentreFromBoxLeftCss = a.thumbDev ? +((a.thumbDev.cx + 0.5) / 2 - (g.box.x - crop.x)).toFixed(2) : null; r.formulaCentreCss = +(7.5 + (g.box.w - 15) * Number(g.fill || 0)).toFixed(2); }
      rec[state] = r;
    };
    await snap('rest');
    const bb = g0.box; const disabled = await f.isDisabled();
    if (!disabled) {
      await p.mouse.move(bb.x + bb.w * 0.5, bb.y + bb.h / 2); await p.mouse.down(); await sleep(200); await snap('pressed');
      await p.mouse.move(bb.x + bb.w * 0.3, bb.y + bb.h / 2, { steps: 6 }); await sleep(120); await snap('drag');
      await p.mouse.up(); await sleep(250); await snap('released');
      await p.mouse.click(5, H - 5); await sleep(100); await p.keyboard.press('Control+z'); await sleep(250);
    }
    await f.focus(); await p.keyboard.press('Shift+Tab'); await sleep(80); await p.keyboard.press('Tab'); await sleep(80);
    rec.tabLanded = await f.evaluate((el) => el === document.activeElement);
    await p.keyboard.press('ArrowLeft'); await sleep(350); await snap('keyboard');
    await p.keyboard.press('ArrowRight'); await p.mouse.click(5, H - 5); await sleep(200);
    res.controls[name] = rec;
  }
  res.errors = errors; fs.writeFileSync(path.join(OUT, 'final.json'), JSON.stringify(res, null, 1));
  for (const [n, r] of Object.entries(res.controls)) for (const s of ['rest', 'pressed', 'drag', 'released', 'keyboard']) { const v = r[s]; if (!v) continue; console.log(W, n.padEnd(8), s.padEnd(8), 'fv', v.fv, v.wrapHasFv, '| outline', (n === 'pan' ? v.wrapOutline : v.outline), '| shadow', (n === 'pan' ? v.wrapShadow : v.boxShadow).slice(0, 20), '| thumb', v.thumbDev && `${v.thumbDev.w}x${v.thumbDev.h}@${v.thumbDev.cx},${v.thumbDev.cy}`, '| ring', JSON.stringify(v.ringBandsDev), '| gapBad', v.gap1cssNonParentPx, '| fillΔ', v.fillEdgeMinusThumbCentreCss ?? '-'); }
  console.log('tab', Object.fromEntries(Object.entries(res.controls).map(([k, v]) => [k, v.tabLanded])), 'errors', errors.length);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
