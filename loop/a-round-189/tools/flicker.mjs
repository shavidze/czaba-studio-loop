import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch();
for (let run = 0; run < 3; run++) {
const ctx = await b.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(() => {
  const s = []; window.__s = s; let t0 = null; let lastRoot = null; let mounts = 0;
  const tick = () => {
    const root = document.querySelector('[data-testid="entrance-loader"]');
    if (root) {
      if (root !== lastRoot) { mounts++; lastRoot = root; }
      if (t0 === null) t0 = performance.now();
      const span = root.querySelector('span.block'); const wrap = span?.parentElement;
      s.push([Math.round(performance.now()-t0), getComputedStyle(root).opacity, wrap ? getComputedStyle(wrap).opacity : 'nowrap', wrap ? wrap.style.opacity : '', mounts, wrap ? wrap.getAnimations().map(a => a.playState + ':' + Math.round(a.currentTime ?? -1)).join(',') : '']);
    }
    if (performance.now() < 15000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5173/', {waitUntil:'load', timeout:60000});
await p.waitForTimeout(3000);
const s = await p.evaluate(() => window.__s);
const bad = s.filter((x, i) => i > 0 && Number(x[2]) < 0.5 && s.slice(0, i).some(y => Number(y[2]) > 0.9));
console.log('run', run, 'samples', s.length, 'mounts', s.at(-1)?.[4], 'dips', JSON.stringify(bad));
console.log(s.filter(x=>x[0]>600&&x[0]<820).map(x=>[...x.slice(0,4),x[5]].join('/')).join(' '));
await ctx.close();
}
await b.close();
