// A round 203: a field reached by keyboard Tab keeps data-focus-source=keyboard and its outline while typing.
const F = require('./fl.cjs'); const path = require('path');
const PORT = process.argv[2];
const st = (page) => page.evaluate(() => { const e = document.activeElement; const c = getComputedStyle(e); return { src: document.documentElement.dataset.focusSource ?? null, tag: e.tagName, ph: e.placeholder || '', os: c.outlineStyle, ow: c.outlineWidth }; });
(async () => { const b = await F.launch(); const { ctx, page } = await F.newPage(b, 1280, 720);
  await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await F.sleep(300);
  const sel = 'input[placeholder^="Search packs"]'; const loc = page.locator(sel).filter({ visible: true }).first();
  await loc.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await F.sleep(300);
  const R = { afterTab: await st(page) }; await page.keyboard.type('ab'); await page.keyboard.press('Backspace'); await page.keyboard.press('ArrowLeft'); await F.sleep(200);
  R.afterTyping = await st(page); F.save(path.join(__dirname, '..', 'out', 'tab-typing.json'), R); console.log(JSON.stringify(R)); await b.close(); })().catch((e) => { console.error(e); process.exit(1); });
