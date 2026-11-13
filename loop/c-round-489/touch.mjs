import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const [base, at] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, hasTouch: true });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await p.goto(base + '/', { waitUntil: 'commit' });
await p.waitForFunction((t) => performance.now() >= t, Number(at), { polling: 10, timeout: 10000 });
const t0 = await p.evaluate(() => ({ cover: !!document.getElementById('czaba-entrance-cover'), sy: scrollY }));
const pts = (y) => [{ x: 640, y, id: 1 }];
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(500) });
for (let y = 480; y >= 200; y -= 40) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(y) }); await p.waitForTimeout(16); }
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await p.waitForTimeout(900);
const t1 = await p.evaluate(() => ({ coverMedia: document.getElementById('czaba-entrance-cover')?.media ?? null, overlay: !!document.querySelector('[aria-hidden="true"].fixed.inset-0'), sy: scrollY, state: document.documentElement.dataset.entrance ?? document.documentElement.getAttribute('data-entrance') }));
console.log(JSON.stringify({ base, at, t0, t1 }));
await b.close();
