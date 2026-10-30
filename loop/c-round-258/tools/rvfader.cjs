// C round 199 RV-SABA-3-4: 5 faders, mouse press/drag/release then keyboard focus. node rvfader.cjs <W>
const L = require('./lib.cjs'); const K = require('./rk-lib.cjs'); const { decode } = require('./png.cjs'); const fs = require('fs'); const path = require('path'); const sleep = L.sleep;
const W = +(process.argv[2] || 1440); const H = W === 1440 ? 900 : 720; const OUT = path.join(__dirname, '..', 'out', 'rvfader', `${W}`); fs.mkdirSync(OUT, { recursive: true });
const SEL = { trackVol: '[data-track-id=music] input[type=range][aria-label^="Volume — "]', pan: '[data-track-id=music] [data-testid=arrangement-track-pan]', groupVol: '[data-testid=arrangement-group-volume]', master: 'input[aria-label="Master Volume"]', clipGain: '[data-testid=arrangement-detail-clip-gain-fader]' };
const nameSel = (t) => `[data-track-id="${t}"] [data-testid=arrangement-track-header] button[aria-label$="set as the active track"]`;
const st = (sel) => { const e = document.querySelector(sel); const c = getComputedStyle(e); const pc = getComputedStyle(e.parentElement); const r = e.getBoundingClientRect(); return { ow: c.outlineWidth, os: c.outlineStyle, oc: c.outlineColor, oo: c.outlineOffset, radius: c.borderTopLeftRadius, bs: c.boxShadow, bg: c.backgroundColor, pbg: pc.backgroundColor, pbs: pc.boxShadow, pos: pc.outlineStyle, fv: e.matches(':focus-visible'), active: document.activeElement === e, src: document.documentElement.dataset.focusSource || null, box: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(2)), value: e.value, vt: e.getAttribute('aria-valuetext') }; };
function analyseCrop(f) { const I = decode(fs.readFileSync(f)); let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0, brassBox = 0, light = 0; const s = 2;
  for (let y = 0; y < I.h; y++) for (let x = 0; x < I.w; x++) { const c = I.px(x, y); if (c[0] > 215 && c[1] > 210 && c[2] > 195) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } if (c[0] - c[2] >= 45 && c[0] > 150) brassBox++; }
  // thumb: largest vertical run of light pixels
  let best = { h: 0 }; for (let x = 0; x < I.w; x++) { let run = 0; for (let y = 0; y < I.h; y++) { const c = I.px(x, y); if (c[0] > 215 && c[1] > 210 && c[2] > 195) { run++; if (run > best.h) best = { h: run, x, y: y - run + 1 }; } else run = 0; } }
  let wmax = 0; if (best.h) { const y = best.y + (best.h >> 1); let run = 0; for (let x = 0; x < I.w; x++) { const c = I.px(x, y); if (c[0] > 215 && c[1] > 210 && c[2] > 195) { run++; wmax = Math.max(wmax, run); } else run = 0; } }
  const centre = best.h ? I.px(best.x, best.y + (best.h >> 1)) : null;
  return { thumbH: best.h / s, thumbW: wmax / s, centre, brassPx: brassBox, w: I.w, h: I.h }; }
(async () => { const b = await L.launch(); const net = []; const res = { W, controls: {} };
  const { page: p, log } = await L.openStudio(b, { width: W, height: H }, `rvfader-${W}`, net, { deviceScaleFactor: 2 });
  await L.setSnapOff(p); await L.addAt(p, 'demo-synth-mix', 'music', 0);
  await p.click(nameSel('stems')); await sleep(200); await p.click(nameSel('sfx'), { modifiers: ['Shift'] }); await sleep(200); await p.mouse.click(5, H - 5); await sleep(150); await p.keyboard.press('Control+g'); await sleep(700);
  const t = p.locator('[data-testid=arrangement-detail-toggle]'); if ((await t.getAttribute('aria-expanded')) === 'false') { await t.click(); await sleep(700); }
  const c = (await L.clipsDom(p))[0]; await L.selectClip(p, c.id);
  for (const [name, sel] of Object.entries(SEL)) { const r = {}; const loc = p.locator(sel); await loc.scrollIntoViewIfNeeded(); await L.blur(p); await p.mouse.move(W - 2, 2); await sleep(150);
    const bb = await loc.boundingBox(); const clip = { x: Math.max(0, Math.floor(bb.x - 8)), y: Math.max(0, Math.floor(bb.y - 10)), width: Math.ceil(bb.width + 16), height: Math.ceil(bb.height + 20) };
    const shot = async (k) => { const f = path.join(OUT, `${name}-${k}.png`); await p.screenshot({ path: f, clip }); return analyseCrop(f); };
    r.rest = { st: await p.evaluate(st, sel), px: await shot('rest') };
    const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2; await p.mouse.move(cx, cy); await p.mouse.down(); await sleep(200);
    r.press = { st: await p.evaluate(st, sel), px: await shot('press') };
    await p.mouse.move(cx + 10, cy, { steps: 4 }); await sleep(120); r.drag = { st: await p.evaluate(st, sel), px: await shot('drag') };
    await p.mouse.up(); await sleep(250); await p.mouse.move(W - 2, 2); await sleep(150); r.release = { st: await p.evaluate(st, sel), px: await shot('release') };
    // keyboard: blur, Tab until reached
    await L.blur(p); await p.evaluate(() => { document.body.focus(); }); let reached = -1;
    for (let i = 0; i < 260; i++) { await p.keyboard.press('Tab'); if (await p.evaluate((s) => document.activeElement === document.querySelector(s), sel)) { reached = i; break; } }
    r.tabs = reached; await sleep(150); r.keyFocus = { st: await p.evaluate(st, sel), px: await shot('key') };
    await p.keyboard.press('ArrowLeft'); await sleep(200); r.keyArrow = { st: await p.evaluate(st, sel), px: await shot('key-arrow') };
    if (reached >= 0) { const d = await K.record(p, 900 + Object.keys(res.controls).length, OUT, W, H, true); r.ring = d && { px: d.px, oo: d.oo, ow: d.ow, oc: d.oc, radius: d.radius, box: d.box }; }
    await p.keyboard.press('Control+z'); await sleep(200); await L.blur(p);
    res.controls[name] = r; }
  res.net = { e: log.errors, h: log.hydration, f: log.forbidden, a: log.authHeaders, noise: log.noise };
  L.save(path.join(__dirname, '..', 'out'), `RV-SABA-3-4-${W}.json`, res);
  for (const [n, r] of Object.entries(res.controls)) console.log(n, JSON.stringify({ tabs: r.tabs, states: ['rest', 'press', 'drag', 'release', 'keyFocus', 'keyArrow'].map((k) => [k, r[k].st.os, r[k].st.ow, r[k].st.oo, r[k].st.fv, r[k].st.src, r[k].st.bg, r[k].st.pbg, r[k].px.thumbH, r[k].px.thumbW, r[k].px.centre && r[k].px.centre.join(',')]), ring: r.ring && { c: r.ring.px.contrast, sides: r.ring.px.sides, oc: r.ring.oc, radius: r.ring.radius } }));
  console.log(JSON.stringify(res.net)); await b.close(); })().catch((e) => { console.error(e); process.exit(1); });
