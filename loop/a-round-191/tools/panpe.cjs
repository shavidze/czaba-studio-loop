// Pan peer ring: with Pan focused (ring visible) a second press still reaches the Pan input, not the reset button
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const [W, H] of [[1440, 900], [1280, 720]]) {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' }); await sleep(2500);
    const pan = p.locator('[data-track-id=music] [data-testid=arrangement-track-pan]');
    await pan.focus(); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab');
    for (let i = 0; i < 5; i++) await p.keyboard.press('ArrowLeft');
    await sleep(200);
    const bb = await pan.boundingBox();
    const r = await p.evaluate(({ x, y }) => { const el = document.elementFromPoint(x, y); const pan = document.querySelector('[data-track-id=music] [data-testid=arrangement-track-pan]'); return { hit: el.getAttribute('data-testid') || el.tagName, fv: pan.matches(':focus-visible'), ringOutline: getComputedStyle(pan.nextElementSibling, '::before').outlineStyle, value: pan.value }; }, { x: bb.x + bb.width * 0.5, y: bb.y + bb.height / 2 });
    await p.mouse.move(bb.x + bb.width * 0.5, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + bb.width * 0.5 - 12, bb.y + bb.height / 2, { steps: 6 }); await p.mouse.up(); await sleep(200);
    const after = await pan.evaluate((el) => ({ value: el.value, text: el.getAttribute('aria-valuetext'), focused: el === document.activeElement }));
    out[W] = { beforePress: r, afterDrag: after };
    await p.close();
  }
  console.log(JSON.stringify(out, null, 1)); await b.close();
})();
