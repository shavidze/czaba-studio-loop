// A round 191: extends b-round-190/tools/fader-probe.cjs to six range controls.
// usage: node fader-probe.cjs <tag> <W>x<H> [variant]   variant: none | noring | nooutline
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const [tag = 'before', vp = '1440x900', variant = 'none', only = ''] = process.argv.slice(2);
const [W, H] = vp.split('x').map(Number);
const OUT = path.join(__dirname, '..', 'shots', `${tag}-${W}`);
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SEL = {
  trackVol: '[data-track-id=music] input[type=range][aria-label^="Volume — "]',
  pan: '[data-testid=arrangement-track-pan]',
  groupVol: '[data-testid=arrangement-group-volume]',
  master: 'input[aria-label="Master Volume"]',
  clipGain: '[data-testid=arrangement-detail-clip-gain-fader]',
  zoom: '[data-testid=arrangement-zoom]',
};
const nameSel = (t) => `[data-track-id="${t}"] [data-testid=arrangement-track-header] button[aria-label$="set as the active track"]`;
async function libDrop(p, src, lane, xFrac) {
  const o = p.locator(`[role=option][data-source-id="${src}"]`);
  await o.scrollIntoViewIfNeeded();
  const t0 = Date.now();
  while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  const ob = await o.boundingBox();
  const lb = await p.evaluate((t) => { const l = document.querySelector(`[data-track-id="${t}"]`); const g = l.querySelector('[data-grid-seconds]') || l; const r = g.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, lane);
  await p.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2); await p.mouse.down();
  await p.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 });
  await p.mouse.move(lb.x + lb.w * xFrac, lb.y + lb.h / 2, { steps: 14 }); await sleep(300); await p.mouse.up(); await sleep(900);
}
(async () => {
  const b = await chromium.launch({ args: ['--disable-lcd-text'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle', timeout: 90000 });
  await sleep(3000);
  await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  await p.waitForSelector('[data-track-id=stems]', { timeout: 60000 });
  await libDrop(p, 'demo-middle-east', 'music', 0.05);
  const ids = await p.evaluate(() => [...document.querySelectorAll('[data-track-id]')].map((e) => e.getAttribute('data-track-id')));
  const uniq = [...new Set(ids)];
  const log = { tag, vp, variant, tracks: uniq, steps: [], results: {} };
  // group: select the last two audio tracks, Ctrl+G
  const tA = uniq.includes('stems') ? 'stems' : uniq[1];
  const tB = uniq.includes('sfx') ? 'sfx' : uniq[2];
  await p.click(nameSel(tA)); await sleep(200);
  await p.click(nameSel(tB), { modifiers: ['Shift'] }); await sleep(200);
  await p.mouse.click(5, H - 5); await sleep(150);
  await p.keyboard.press('Control+g'); await sleep(600);
  log.steps.push('library drop demo-middle-east onto music lane'); log.steps.push(`group: click name ${tA}, Shift+click name ${tB}, click blank, Ctrl+G`);
  // detail panel + select one clip
  const t = p.locator('[data-testid=arrangement-detail-toggle]');
  if ((await t.count()) && (await t.getAttribute('aria-expanded')) === 'false') { await t.click(); await sleep(700); log.steps.push('open detail panel'); }
  const clip = p.locator('[data-clip-id]').first();
  const cb = await clip.boundingBox();
  await p.mouse.click(cb.x + Math.min(30, cb.width / 2), cb.y + cb.height * 0.65); await sleep(400);
  log.steps.push('click first clip body');
  for (const [name, sel] of Object.entries(SEL)) {
    if (only && name !== only) continue;
    const f = p.locator(sel).first();
    if (!(await f.count())) { log.results[name] = 'missing'; continue; }
    await f.scrollIntoViewIfNeeded();
    if (variant === 'noring') await f.evaluate((el) => { el.classList.remove('focus-visible:ring-2', 'focus-visible:ring-brand'); });
    if (variant === 'nooutline') await f.evaluate((el) => { el.style.setProperty('outline', 'none', 'important'); });
    const bb = await f.boundingBox();
    const clipR = { x: Math.max(0, bb.x - 8), y: Math.max(0, bb.y - 14), width: bb.width + 16, height: bb.height + 28 };
    const info = async (state) => {
      const s = await f.evaluate((el) => {
        const c = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { fv: el.matches(':focus-visible'), focus: el === document.activeElement, value: el.value, outline: c.outline, outlineOffset: c.outlineOffset, shadow: c.boxShadow, bg: c.backgroundColor, appearance: c.appearance, rect: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(2)), cls: el.className };
      });
      await p.screenshot({ path: path.join(OUT, `${name}-${variant}-${state}.png`), clip: clipR });
      return s;
    };
    const r = {};
    r.rest = await info('rest');
    const disabled = await f.isDisabled();
    if (!disabled) {
      await p.mouse.move(bb.x + bb.width * 0.5, bb.y + bb.height / 2);
      await p.mouse.down(); await sleep(200);
      r.pressed = await info('pressed');
      await p.mouse.move(bb.x + bb.width * 0.35, bb.y + bb.height / 2, { steps: 5 }); await sleep(100);
      r.drag = await info('drag');
      await p.mouse.up(); await sleep(200);
      r.released = await info('released');
      await p.keyboard.press('Control+z'); await sleep(200);
    }
    await p.mouse.click(5, H - 5); await sleep(150);
    await f.focus(); await p.keyboard.press('ArrowLeft'); await sleep(150);
    r.keyboard = await info('keyboard');
    await p.keyboard.press('ArrowRight'); await p.mouse.click(5, H - 5); await sleep(150);
    log.results[name] = r;
  }
  log.errors = errors;
  fs.writeFileSync(path.join(OUT, `probe-${variant}${only ? '-' + only : ''}.json`), JSON.stringify(log, null, 1));
  for (const [n, r] of Object.entries(log.results)) {
    if (typeof r === 'string') { console.log(n, r); continue; }
    for (const [s, v] of Object.entries(r)) console.log(n.padEnd(9), s.padEnd(9), 'fv=' + v.fv, 'val=' + v.value, '| outline:', v.outline, '| shadow:', v.shadow.slice(0, 60), '| h=' + v.rect[3]);
  }
  console.log('errors', errors.length, 'steps', log.steps.join('; '));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
