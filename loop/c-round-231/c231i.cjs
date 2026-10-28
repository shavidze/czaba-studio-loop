// C round 231: which element gets focus after dismiss + Tab. usage: node c231i.cjs
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
  await p.waitForFunction(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Add'); return x && !x.disabled; }, undefined, { timeout: 90000 }); await p.waitForTimeout(1200);
  await p.getByTestId('arrangement-library-search').focus(); await p.keyboard.press('Tab'); await p.keyboard.press('Enter'); await p.waitForTimeout(500);
  const seq = [];
  for (let i = 0; i < 3; i++) { await p.keyboard.press('Tab'); await p.waitForTimeout(150); seq.push(await p.evaluate(() => { const e = document.activeElement; return { tag: e.tagName, text: e.textContent.trim().slice(0, 40), role: e.getAttribute('role'), parent: e.closest('[data-testid]')?.getAttribute('data-testid') }; })); }
  console.log(JSON.stringify(seq)); await b.close();
})();
