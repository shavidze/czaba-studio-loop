import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base = process.argv[2], [W,H]=process.argv[3].split('x').map(Number), out=process.argv[4];
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const ctx = await b.newContext({viewport:{width:W,height:H}});
await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
const p = await ctx.newPage(); const errors=[]; p.on('pageerror',e=>errors.push(String(e)));
await p.goto(`${base}/studio-lab`,{waitUntil:'load',timeout:240000});
await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''),null,{timeout:240000});
await p.waitForTimeout(1000);
await p.getByRole('button',{name:'Add',exact:true}).first().click(); await p.locator('[data-clip-kind="audio"]').first().waitFor(); await p.waitForTimeout(2000);
const clip = p.locator('[data-clip-kind="audio"]').first();
const nb = await clip.getByTitle(/ — drag to move$/).boundingBox(); await p.mouse.click(nb.x+40, nb.y+nb.height/2); await p.waitForTimeout(500);
const tg = p.getByTestId('arrangement-detail-toggle'); if ((await tg.count()) && (await tg.getAttribute('aria-expanded'))==='false'){await tg.click();await p.waitForTimeout(600);}
const snap = () => p.evaluate(() => ({ states:[...document.querySelectorAll('[data-testid="arrangement-track-meter"]')].map(m=>m.getAttribute('data-state')), overEls:document.querySelectorAll('[data-testid="arrangement-track-meter-over"]').length, sr:[...document.querySelectorAll('.sr-only')].map(e=>e.textContent.trim()).filter(t=>/above|clip|over|peak/i.test(t)), master:document.querySelector('[data-testid="arrangement-master-peak"]')?.getAttribute('aria-label') }));
const r = {};
const gin = p.getByTestId('arrangement-detail-clip-gain-input');
await gin.fill('24'); await gin.press('Enter'); await p.waitForTimeout(300);
await p.keyboard.press('Escape'); await p.evaluate(()=>document.activeElement?.blur());
await p.mouse.click(nb.x+40, nb.y+nb.height/2); await p.keyboard.press('Space'); await p.waitForTimeout(2500); r.latched = await snap();
await p.keyboard.press('Space'); await p.waitForTimeout(800); r.stoppedStill = await snap();
await gin.fill('0'); await gin.press('Enter'); await p.waitForTimeout(500); r.gainBack = await snap();
await p.getByTestId('arrangement-master-peak').click(); await p.waitForTimeout(800); r.afterReset = await snap();
// stale-extent: fade preview then loop
r.errors = errors; writeFileSync(out, JSON.stringify(r,null,1)); await b.close();
