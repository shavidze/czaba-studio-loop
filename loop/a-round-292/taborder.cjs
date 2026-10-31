const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await c.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab'); await p.waitForTimeout(2500);
  const seq = [];
  for (let i = 0; i < 10; i++) { await p.keyboard.press('Tab'); seq.push(await p.evaluate(() => { const a = document.activeElement; return a.tagName + ':' + (a.getAttribute('data-testid') || a.textContent.trim().slice(0, 15)) + ':' + getComputedStyle(a).outlineStyle + '/' + getComputedStyle(a).outlineWidth; })); }
  console.log(seq.join('\n'));
  await p.keyboard.press('Shift+Tab');
  await p.screenshot({ path: 'tab-390.png' }); await b.close();
})();
