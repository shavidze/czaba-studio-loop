// C round 202 — CHOOSE-VIDEO repeat trials: tree button (Enter/Space/mouse) vs ref native input (Space/mouse), with input.click spy.
const F = require('./fl.cjs'); const path = require('path');
const src = require('fs').readFileSync(path.join(__dirname, 'choose.cjs'), 'utf8');
const mountSrc = src.slice(src.indexOf('async function mount'), src.indexOf('const act ='));
const mount = eval('(' + mountSrc.replace('async function mount', 'async function') + ')');
(async () => {
  const browser = await F.launch(); const R = {}; const N = +(process.argv[2] || 6);
  for (const [W, H] of [[1440, 900], [1280, 720]]) for (const [srv, base] of [['tree', 'http://127.0.0.1:5173'], ['ref', 'http://127.0.0.1:5174']]) for (const m of ['Enter', 'Space', 'mouse']) {
    if (srv === 'ref' && m === 'Enter') continue;
    const k = `${srv}-${W}-${m}`; R[k] = [];
    for (let t = 0; t < N; t++) {
      const { ctx, page } = await F.newPage(browser, W, H); await mount(page, base, false);
      await page.evaluate(() => { window.__clicks = 0; const o = HTMLInputElement.prototype.click; HTMLInputElement.prototype.click = function () { window.__clicks++; return o.apply(this, arguments); }; window.__act = null; });
      let fcGot = null; page.on('filechooser', (c) => { fcGot = c; }); await F.sleep(500);
      await page.focus('#prev'); await page.keyboard.press('Tab'); await F.sleep(400);
      const before = await page.evaluate(() => document.activeElement.tagName);
      let fc;
      if (m === 'mouse') { const el = srv === 'tree' ? page.getByRole('button', { name: 'Choose video' }) : page.locator('#harness label', { hasText: 'Choose video' }); const bb = await el.boundingBox(); [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 4000 }).catch(() => null), page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)]); }
      else [fc] = await Promise.all([page.waitForEvent('filechooser', { timeout: 4000 }).catch(() => null), page.keyboard.press(m === 'Space' ? ' ' : 'Enter')]);
      await F.sleep(1500); if (!fc && fcGot) fc = fcGot; const clicks = await page.evaluate(() => window.__clicks);
      R[k].push(`${fc ? 'FC' : 'none'}/clicks=${clicks}/${before}`);
      await ctx.close();
    }
    console.log(k, R[k].join(' '));
  }
  F.save(path.join(F.ROOT, 'out', 'choose-rep2.json'), R);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
