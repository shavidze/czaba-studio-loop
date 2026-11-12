import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
await p.addInitScript(() => { window.__c = null; const t = setInterval(() => { if (document.body && !window.__c) { const s = getComputedStyle(document.body, '::before'); if (s.content !== 'none' && s.position === 'fixed') window.__c = { bg: s.backgroundColor, z: s.zIndex, pos: s.position, op: s.opacity, content: s.content }; } }, 5); setTimeout(() => clearInterval(t), 1200); });
await p.goto('http://127.0.0.1:5191/', { waitUntil: 'commit' }); await p.waitForTimeout(1500);
console.log(JSON.stringify(await p.evaluate(() => window.__c)));
await p.screenshot({ path: 'shots-c14.png' }); await b.close();
