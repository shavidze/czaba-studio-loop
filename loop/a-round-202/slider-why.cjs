const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(1500);
  for (let i = 0; i < 120; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(60); if (await page.evaluate(() => /play preview/i.test(document.activeElement?.getAttribute('aria-label') || ''))) break; }
  await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  await page.focus('.audio-player-volume-slider'); 
  await page.keyboard.press('Shift'); 
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => { const e = document.querySelector('.audio-player-volume-slider'); const anc = []; let op = 1; for (let n = e; n; n = n.parentElement) { const cs = getComputedStyle(n); op *= +cs.opacity; if (cs.overflow !== 'visible' || cs.opacity !== '1' || cs.clipPath !== 'none' || cs.contain !== 'none') anc.push(`${n.tagName}.${String(n.className).slice(0, 50)} ov=${cs.overflow} op=${cs.opacity} clip=${cs.clipPath} contain=${cs.contain}`); } const cs = getComputedStyle(e); return { active: document.activeElement === e, fv: e.matches(':focus-visible'), src: document.documentElement.dataset.focusSource, outline: cs.outline, offset: cs.outlineOffset, appearance: cs.appearance, op, anc }; });
  console.log(JSON.stringify(info, null, 1));
  const r = await page.evaluate(() => { const q = document.querySelector('.audio-player-volume-slider').getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height }; });
  await page.screenshot({ path: __dirname + '/slider-why.png', clip: { x: r.x - 20, y: r.y - 20, width: r.w + 40, height: r.h + 40 } });
  await b.close();
})();
