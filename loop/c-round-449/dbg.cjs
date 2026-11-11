const { createRequire } = require('module'); const req = createRequire('/home/runner/czaba-project/store/package.json'); const { chromium } = req('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5178/', { waitUntil: 'networkidle', timeout: 90000 }); await p.waitForTimeout(3000);
for (let y = 0; y < 12000; y += 600) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(300); }
const r = await p.evaluate(() => [...document.querySelectorAll('.text-glow,.hero-title-glow')].map((s) => ({ t: s.textContent, ptag: s.parentElement.tagName, ptext: s.parentElement.textContent.replace(/\s+/g,' ').trim().slice(0, 50) })));
console.log(JSON.stringify(r, null, 1)); await b.close(); })();
