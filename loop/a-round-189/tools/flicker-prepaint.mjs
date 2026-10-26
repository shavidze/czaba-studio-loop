import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch();
const out = [];
for (let run = 0; run < 3; run++) {
const ctx = await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(() => {
  const raf = []; const pre = []; window.__r = { raf, pre }; let t0 = null; let n = 0;
  const read = (arr) => {
    const root = document.querySelector('[data-testid="entrance-loader"]');
    if (!root) return;
    if (t0 === null) t0 = performance.now();
    const wrap = root.querySelector('span.block')?.parentElement;
    arr.push([Math.round(performance.now() - t0), Number(getComputedStyle(wrap).opacity)]);
  };
  const start = () => {
    let dummy = null;
    const tick = () => {
      if (!dummy || !dummy.isConnected) {
        if (document.querySelector('[data-testid="entrance-loader"]')) {
          dummy = document.createElement('div');
          dummy.style.cssText = 'position:fixed;left:-9999px;top:0;height:1px;';
          document.body.appendChild(dummy);
          new ResizeObserver(() => read(pre)).observe(dummy);
        }
      }
      read(raf); n++; if (dummy) dummy.style.width = (n % 2 + 1) + 'px'; if (performance.now() < 15000) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  if (document.documentElement) start(); else document.addEventListener('readystatechange', start, { once: true });
});
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5173/', {waitUntil:'load', timeout:60000});
await p.waitForTimeout(3000);
const r = await p.evaluate(() => window.__r);
const dips = (arr) => arr.filter((x, i) => x[1] < 0.5 && arr.slice(0, i).some(y => y[1] > 0.9));
const line = { run, rafSamples: r.raf.length, prepaintSamples: r.pre.length, rafDips: dips(r.raf), prepaintDips: dips(r.pre) };
out.push(line); console.log(JSON.stringify(line));
await ctx.close();
}
await b.close();
require('node:fs').writeFileSync(process.argv[2] + '/flicker-prepaint.json', JSON.stringify(out, null, 2));
