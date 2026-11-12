import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); } catch {} });
await p.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 90000 }); await p.waitForTimeout(3000);
for (let y = 0; y < 8000; y += 800) { await p.mouse.wheel(0, 800); await p.waitForTimeout(250); }
await p.waitForTimeout(1500);
const out = await p.evaluate(() => {
  const sel = ['.shadow-glow', '.hover\\:shadow-glow', '.text-glow', '.bg-card', '.group-hover\\:text-primary', '.bg-primary\\/90', '.text-primary-foreground'];
  const rules = {}; for (const s of sel) rules[s] = 0;
  for (const ss of document.styleSheets) { try { const walk = (rs) => { for (const r of rs) { if (r.cssRules) walk(r.cssRules); const t = r.selectorText || ''; for (const s of sel) if (t.includes(s.replace(/\\\\/g,'\\'))) rules[s]++; } }; walk(ss.cssRules); } catch {} }
  const g = (q) => { const e = document.querySelector(q); return e ? { bg: getComputedStyle(e).backgroundColor, c: getComputedStyle(e).color, ts: getComputedStyle(e).textShadow } : null; };
  return { rules, shadowGlowVar: getComputedStyle(document.documentElement).getPropertyValue('--shadow-glow'), textGlow: g('.text-glow'), textGlowParent: (() => { const e=document.querySelector('.text-glow'); return e? getComputedStyle(e.parentElement).color : null; })(), bgCard: g('.bg-card') };
});
const t = p.locator('h3.group-hover\\:text-primary').first(); console.error('pre', JSON.stringify(out));
out.titleCount = await p.locator('h3.group-hover\\:text-primary').count();
if (out.titleCount) { await t.scrollIntoViewIfNeeded(); await p.waitForTimeout(500); out.titleRest = await t.evaluate((e) => getComputedStyle(e).color); const bb = await t.boundingBox(); out.titleBox = bb; if (bb && bb.x >= 0 && bb.x < 1440) { await p.mouse.move(bb.x + 10, bb.y + 5); } await p.waitForTimeout(600); out.titleHover = await t.evaluate((e) => getComputedStyle(e).color); }
console.log(JSON.stringify(out, null, 1)); await b.close();
