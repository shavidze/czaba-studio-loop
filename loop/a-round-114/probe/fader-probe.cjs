const L = require('../../c-round-113/tools/lib.cjs');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const FADER = '[data-testid=arrangement-detail-clip-gain-fader]';
const read = (p) => p.evaluate((sel) => {
  const f = document.querySelector(sel);
  const field = document.querySelector('[data-testid=arrangement-detail-clip-gain-input]');
  const undo = [...document.querySelectorAll('button')].find((b) => /^Undo|Undo/.test(b.getAttribute('aria-label') || b.title || ''));
  return { value: f && f.value, text: f && f.getAttribute('aria-valuetext'), disabled: f && f.disabled, field: field && field.value, undo: undo ? (undo.title || undo.getAttribute('aria-label')) : null };
}, FADER);
(async () => {
  const browser = await L.launch();
  const net = [];
  const result = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const key = `${vp.width}x${vp.height}`;
    const { ctx, page: p, log } = await L.openStudio(browser, vp, key, net);
    await L.setSnapOff(p);
    for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(p, s, ln, t);
    const ids = await p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((e) => ({ id: e.getAttribute('data-clip-id'), lane: e.closest('[data-track-id]').getAttribute('data-track-id') })));
    const stems = ids.find((x) => x.lane === 'stems');
    await L.selectClip(p, stems.id);
    const expanded = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]').getAttribute('aria-expanded'));
    if (expanded !== 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(600); }
    await L.blur(p);
    const r = { ids, before: await read(p) };
    const block = await p.evaluate((sel) => {
      const b = document.querySelector('[data-testid=arrangement-detail-clip-gain]');
      const c = document.querySelector('[data-testid=arrangement-detail-content]').getBoundingClientRect();
      const f = document.querySelector(sel).getBoundingClientRect();
      const z = document.querySelector('[data-testid=arrangement-detail-clip-gain-reset]').getBoundingClientRect();
      const inside = (q) => q.left >= c.left && q.right <= c.right && q.top >= c.top && q.bottom <= c.bottom;
      return { scrollW: b.scrollWidth, clientW: b.clientWidth, fader: { w: f.width, inside: inside(f) }, reset: inside(z) };
    }, FADER);
    r.layout = block;
    await p.fill('[data-testid=arrangement-detail-clip-gain-input]', '-3');
    await L.sleep(200);
    r.pendingLayout = await p.evaluate(() => {
      const c = document.querySelector('[data-testid=arrangement-detail-content]').getBoundingClientRect();
      const m = document.querySelector('[data-testid=arrangement-detail-clip-gain-pending]');
      const q = m && m.getBoundingClientRect();
      const b = document.querySelector('[data-testid=arrangement-detail-clip-gain]');
      return { marker: !!m, w: q && q.width, inside: !!q && q.left >= c.left && q.right <= c.right && q.top >= c.top && q.bottom <= c.bottom, scrollW: b.scrollWidth, clientW: b.clientWidth, contentScrollH: document.querySelector('[data-testid=arrangement-detail-content]').scrollHeight, contentClientH: document.querySelector('[data-testid=arrangement-detail-content]').clientHeight };
    });
    await p.keyboard.press('Escape');
    await L.blur(p);
    await L.sleep(200);
    await p.locator(FADER).scrollIntoViewIfNeeded();
    const fb = await p.locator(FADER).boundingBox();
    r.faderWidth = fb.width;
    const y = fb.y + fb.height / 2;
    await p.mouse.move(fb.x + fb.width * 0.15, y);
    await p.mouse.down(); await L.sleep(100); await p.mouse.up(); await L.sleep(200);
    r.noJump = await read(p);
    const x0 = fb.x + fb.width * 0.5;
    await p.mouse.move(x0, y); await p.mouse.down();
    await p.mouse.move(x0 + 10, y, { steps: 5 }); await p.mouse.move(x0 + 20, y, { steps: 5 });
    await p.mouse.up(); await L.sleep(200);
    r.drag = await read(p);
    await p.keyboard.press('Control+z'); await L.sleep(200);
    r.afterUndo = await read(p);
    await p.keyboard.down('Shift');
    await p.mouse.move(x0, y); await p.mouse.down();
    await p.mouse.move(x0 + 10, y, { steps: 5 }); await p.mouse.move(x0 + 20, y, { steps: 5 });
    await p.mouse.up(); await p.keyboard.up('Shift'); await L.sleep(200);
    r.fine = await read(p);
    await p.dblclick(FADER); await L.sleep(200);
    r.dbl = await read(p);
    await p.screenshot({ path: path.join(OUT, `fader-${key}.png`) });
    r.log = log;
    result[key] = r;
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'fader-probe.json'), JSON.stringify(result, null, 1));
  console.log(JSON.stringify(result, (k, v) => (k === 'ids' ? undefined : v), 1));
})().catch((e) => { console.error(e); process.exit(1); });
