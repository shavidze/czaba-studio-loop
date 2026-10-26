process.env.C_BASE = `http://127.0.0.1:${process.argv[2]}`;
const L = require('./lib.cjs'); const sleep = L.sleep; const W = 1440, H = 900;
const pl = (page) => page.evaluate(() => [[...document.querySelectorAll('button')].find((b) => ['Play', 'Pause'].includes(b.getAttribute('aria-label'))).getAttribute('aria-label'), document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow')].join(' '));
(async () => { const browser = await L.launch(); const net = [];
 const { page, ctx } = await L.openStudio(browser, { width: W, height: H }, 'dbg', net, { deviceScaleFactor: 2 });
 await page.click('button[aria-label=Play]'); const a = []; for (let i = 0; i < 6; i++) { a.push(await pl(page)); await sleep(150); } console.log('play-empty', a.join(' | '));
 await page.click('button[aria-label=Play]').catch(() => {}); await page.click('button[aria-label=Pause]').catch(() => {});
 await page.click('[data-testid=arrangement-marker-add]'); await sleep(400); await page.keyboard.press('Enter'); await sleep(400);
 const b = await page.locator('[data-testid=arrangement-marker]').boundingBox(); await page.mouse.dblclick(b.x + 20, b.y + 10); const c = []; for (let i = 0; i < 8; i++) { c.push(await pl(page)); await sleep(100); } console.log('dbl-empty', c.join(' | '));
 // with a clip
 const o = page.locator('[role=option][data-source-id="demo-middle-east"]'); const ob = await o.boundingBox(); const lb = await page.evaluate(() => { const r = document.querySelector('[data-track-id="music"]').getBoundingClientRect(); return { x: r.left + r.width * 0.5, y: r.top + r.height / 2 }; });
 await page.mouse.move(ob.x + 20, ob.y + 10); await page.mouse.down(); await page.mouse.move(ob.x + 40, ob.y + 10, { steps: 3 }); await page.mouse.move(lb.x, lb.y, { steps: 12 }); await sleep(300); await page.mouse.up(); await sleep(1200);
 console.log('clips', await page.evaluate(() => document.querySelectorAll('[data-clip-id]').length));
 await page.mouse.dblclick(b.x + 20, b.y + 10); const d = []; for (let i = 0; i < 8; i++) { d.push(await pl(page)); await sleep(150); } console.log('dbl-clip', d.join(' | '));
 await ctx.close(); await browser.close(); })();
