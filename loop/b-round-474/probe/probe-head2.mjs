import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const out = {};
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); } catch {} });
await p.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 90000 });
await p.waitForTimeout(4000);
for (let y = 0; y < 8000; y += 800) { await p.mouse.wheel(0, 800); await p.waitForTimeout(300); }
await p.waitForTimeout(1500);
out.badges = await p.evaluate(() => [...document.querySelectorAll('div.absolute.top-3.left-3.rounded-full')].map((e) => { const r=e.getBoundingClientRect(); return { t: e.textContent, cls: e.className.replace(/\s+/g,' '), bg: getComputedStyle(e).backgroundColor, c: getComputedStyle(e).color, y: Math.round(r.y+scrollY), x: Math.round(r.x) }; }));
if (out.badges.length) { const el = p.locator('div.absolute.top-3.left-3.rounded-full').first(); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(800); const card = el.locator('xpath=ancestor::*[contains(@class,"group")][1]'); await card.screenshot({ path: 'head-card-badge-1440.png' }).catch(()=>{}); }
out.navBarRule = await p.evaluate(() => { for (const s of document.styleSheets) { try { for (const r of s.cssRules) { if (r.selectorText === '.nav-loading-bar') return r.cssText; } } catch {} } return null; });
await p.evaluate(() => { const d=document.createElement('div'); d.className='nav-loading-bar'; d.id='probe-nav'; document.body.appendChild(d); });
out.navBarInjected = await p.evaluate(() => { const s=getComputedStyle(document.getElementById('probe-nav')); return { bgImage: s.backgroundImage, h: s.height, w: s.width, anim: s.animationName }; });
console.log(JSON.stringify(out, null, 1));
await b.close();
