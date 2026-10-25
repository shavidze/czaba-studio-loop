const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const out = process.argv[2];
(async () => {
  const browser = await chromium.launch(); const res = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(800);
    res[w] = await page.evaluate(() => {
      const pv = document.querySelector('[data-testid="arrangement-library-preview"]');
      const add = [...pv.querySelectorAll('button')].find((b) => b.textContent.trim() === '＋ Add');
      const t = add.firstChild; const r = document.createRange(); r.setStart(t, 0); r.setEnd(t, 1); const g = r.getBoundingClientRect();
      const s = document.createRange(); s.setStart(t, 1); s.setEnd(t, 2); const sp = s.getBoundingClientRect().width;
      const els = [...pv.querySelectorAll('button,[role],[data-testid],p')];
      const m = () => els.map((e) => { const b = e.getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; });
      const before = m(); const fs0 = getComputedStyle(add).fontSize;
      add.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" style="flex-shrink:0" fill="none" stroke="currentColor"><path d="M5 12h14M12 5v14"/></svg><span>Add</span>';
      Object.assign(add.style, { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' });
      const after = m();
      const max = Math.max(...before.flatMap((b, i) => [Math.abs(after[i][0] - b[0]), Math.abs(after[i][1] - b[1]), Math.abs(after[i][0] + after[i][2] - b[0] - b[2]), Math.abs(after[i][1] + after[i][3] - b[1] - b[3])]));
      const nameCount = [...document.querySelectorAll('button')].filter((b) => (b.textContent || '').trim() === 'Add').length;
      return { fontSize: fs0, glyphW: +g.width.toFixed(2), spaceW: +sp.toFixed(3), n: els.length, maxAbsEdgeDelta: max, buttonsWithExactTextAdd: nameCount };
    });
    await ctx.close();
  }
  await browser.close(); fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
})();
