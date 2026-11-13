import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const [base, at] = process.argv.slice(2);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, hasTouch: true });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await p.addInitScript(() => { window.__log = []; const cov = () => { const c = document.getElementById('czaba-entrance-cover'); const o = document.querySelector('[aria-hidden="true"].fixed.inset-0'); return (c && c.media === 'all' ? 'cover' : '') + (o ? 'overlay' : ''); };
  addEventListener('scroll', () => window.__log.push(['scroll', Math.round(performance.now()), scrollY, cov()]), true);
  for (const t of ['touchstart','touchmove','touchend']) addEventListener(t, (e) => window.__log.push([t, Math.round(performance.now()), e.cancelable, e.defaultPrevented, cov()]), { capture: false, passive: true }); });
await p.goto(base + '/', { waitUntil: 'commit' });
await p.waitForFunction((t) => performance.now() >= t, Number(at), { polling: 10, timeout: 10000 });
const pts = (y) => [{ x: 640, y, id: 1 }];
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(600) });
for (let y = 580; y >= 100; y -= 20) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(y) }); await p.waitForTimeout(16); }
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await p.waitForTimeout(600);
const log = await p.evaluate(() => window.__log);
const sc = log.filter(l => l[0]==='scroll'); console.log(base, at, 'scrollEvents', sc.length, 'whileCovered', sc.filter(l=>l[3]).length, 'firstScroll', JSON.stringify(sc[0]), 'final', await p.evaluate(() => scrollY));
await b.close();
