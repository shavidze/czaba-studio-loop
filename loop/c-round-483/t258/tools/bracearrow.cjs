// C round 258 RR-FOCUS-ORIGINS 243 brace half: brace focus -> right-click empty lane -> Escape -> ArrowRight moves the loop
const L = require('./lib258.cjs'); const { sleep, fs, path } = L;
(async () => { const b = await L.chromium.launch(); const out = {};
for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) { const k = `${vp.width}x${vp.height}`; const r = {}; out[k] = r;
  const { ctx, page, errors } = await L.open(b, vp, { pulse: true, zoom: false });
  const clip = await page.locator('[data-track-id="music"] [data-clip-id]').first().boundingBox();
  const x0 = (await page.locator('[data-testid="arrangement-ruler"]').boundingBox()).x; const y = clip.y + clip.height * 0.65;
  await page.mouse.move(x0 + 5 * 40, y); await page.mouse.down(); for (let i = 1; i <= 10; i += 1) await page.mouse.move(x0 + 5 * 40 + i * 12, y); await page.mouse.up(); await sleep(300);
  await page.keyboard.press('Control+l'); await sleep(400);
  const brace = page.getByTestId('arrangement-loop-brace');
  r.brace0 = await brace.evaluate((e) => [e.style.left, e.style.width, e.getAttribute('aria-label')]);
  await page.mouse.click(5, 5); await sleep(200);
  await page.evaluate(() => document.body.focus()); for (let i = 0; i < 120; i += 1) { await page.keyboard.press('Tab'); if (await page.evaluate(() => document.activeElement?.getAttribute('data-testid') === 'arrangement-loop-brace')) { r.tabs = i + 1; break; } }
  r.before = await page.evaluate(() => ({ el: document.activeElement?.getAttribute('data-testid'), fv: document.activeElement?.matches(':focus-visible') }));
  const pt = await page.evaluate(() => { const vw = window.innerWidth, vh = window.innerHeight; for (const body of document.querySelectorAll('[data-track-id] [data-grid-lines]')) { const r = body.getBoundingClientRect(); for (const fx of [0.9, 0.75, 0.6, 0.45, 0.3]) { const x = r.left + r.width * fx, y = r.top + r.height / 2; if (x <= 0 || x >= vw - 20 || y <= 0 || y >= vh - 10) continue; if (document.elementFromPoint(x, y) === body) return { x, y }; } } return null; }); r.pt = pt;
  await page.mouse.click(pt.x, pt.y, { button: 'right' }); await sleep(400); r.menu = await page.getByTestId('arrangement-grid-menu').count();
  await page.keyboard.press('Escape'); await sleep(400);
  r.after = await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { el: a.getAttribute('data-testid') || a.tagName, fv: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth}` }; });
  await page.keyboard.press('ArrowRight'); await sleep(400);
  r.brace1 = await brace.evaluate((e) => [e.style.left, e.style.width, e.getAttribute('aria-label')]);
  r.errors = errors; await ctx.close();
  r.checks = { focused: r.before.el === 'arrangement-loop-brace', menu: r.menu === 1, back: r.after.el === 'arrangement-loop-brace' && r.after.fv && /solid/.test(r.after.outline), moved: parseFloat(r.brace1[0]) > parseFloat(r.brace0[0]) && r.brace1[1] === r.brace0[1], errors: errors.length === 0 };
  r.pass = Object.values(r.checks).every(Boolean); console.log(k, r.pass, JSON.stringify(r.checks), JSON.stringify([r.brace0, r.brace1])); }
fs.writeFileSync(path.join(__dirname, '..', 'out', 'bracearrow.json'), JSON.stringify(out, null, 1)); await b.close(); })();
