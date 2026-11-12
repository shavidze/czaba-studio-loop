import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const out = {};
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const root = async (names) => p.evaluate((n) => Object.fromEntries(n.map((k) => [k, getComputedStyle(document.documentElement).getPropertyValue(k)])), names);
await p.goto('http://127.0.0.1:5173/store', { waitUntil: 'networkidle', timeout: 90000 });
await p.waitForTimeout(3000);
out.rootVars = await root(['--color-black','--color-text-muted','--color-text-primary','--radius-xs','--primary-hue','--color-accent-hover','--color-foreground','--color-text-secondary','--color-muted-foreground','--color-surface']);
out.badges = await p.evaluate(() => [...document.querySelectorAll('div.rounded-full.text-xs.font-semibold')].slice(0,6).map((e) => ({ t: e.textContent, cls: e.className, bg: getComputedStyle(e).backgroundColor, c: getComputedStyle(e).color })));
out.cssHasBgPrimary = await p.evaluate(() => { let n=0; for (const s of document.styleSheets) { try { for (const r of s.cssRules) { if ((r.cssText||'').includes('bg-primary')||(r.cssText||'').includes('text-primary-foreground')) n++; } } catch {} } return n; });
const trig = p.locator('.command-palette-trigger').first();
out.trigger = { count: await p.locator('.command-palette-trigger').count() };
if (out.trigger.count) {
  out.trigger.rest = await trig.evaluate((e) => ({ c: getComputedStyle(e).color, parent: getComputedStyle(e.parentElement).color, vis: e.offsetWidth }));
  if (out.trigger.rest.vis) { await trig.hover(); await p.waitForTimeout(400); out.trigger.hover = await trig.evaluate((e) => getComputedStyle(e).color); await p.screenshot({ path: 'head-trigger-hover-1440.png', clip: { x: 0, y: 0, width: 1440, height: 120 } }); }
}
await p.keyboard.press('Control+k'); await p.waitForTimeout(800);
out.palette = await p.evaluate(() => { const q=(s)=>document.querySelector(s); const f=(s)=>{const e=q(s); return e?getComputedStyle(e).color:null}; return { input: f('.command-palette-input'), close: f('.command-palette-close'), result: f('.command-palette-result'), resultCount: document.querySelectorAll('.command-palette-result').length }; });
await p.screenshot({ path: 'head-palette-1440.png' });
await p.keyboard.press('Escape');
await p.goto('http://127.0.0.1:5173/this-page-does-not-exist', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
out.code4 = await p.evaluate(() => [...document.querySelectorAll('.code-4')].map((e) => ({ c: getComputedStyle(e).color, parent: getComputedStyle(e.parentElement).color })));
await p.screenshot({ path: 'head-404-1440.png' });
await p.goto('http://127.0.0.1:5173/search', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
out.searchP = await p.evaluate(() => { const e=[...document.querySelectorAll('p')].find((x)=>x.textContent.includes('coming soon')); return e?{c:getComputedStyle(e).color, parent:getComputedStyle(e.parentElement).color}:null; });
await p.goto('http://127.0.0.1:5173/account/login', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
out.loginP = await p.evaluate(() => [...document.querySelectorAll('p')].filter((x)=>x.getAttribute('style')?.includes('text-muted')).map((e)=>({t:e.textContent.slice(0,40), c:getComputedStyle(e).color})));
const ctx2 = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p2 = await ctx2.newPage();
await p2.goto('http://127.0.0.1:5173/', { waitUntil: 'commit' });
out.entrance = [];
for (let i=0;i<6;i++){ out.entrance.push(await p2.evaluate(() => { const s=getComputedStyle(document.body,'::before'); return { t: Math.round(performance.now()), content: s.content, bg: s.backgroundColor, op: s.opacity, vis: s.visibility, black: getComputedStyle(document.documentElement).getPropertyValue('--color-black') }; }).catch((e)=>String(e))); await p2.waitForTimeout(150); }
console.log(JSON.stringify(out, null, 1));
await b.close();
