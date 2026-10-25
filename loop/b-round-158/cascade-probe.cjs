const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const css = fs.readFileSync(__dirname + '/tw-probe-out.css', 'utf8');
(async () => {
  const b = await chromium.launch();
  const res = {};
  for (const rm of ['no-preference', 'reduce']) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: rm });
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await p.waitForSelector('[data-testid="arrangement-fit"]');
    res[rm] = await p.evaluate((css) => {
      const btn = document.querySelector('[data-testid="arrangement-fit"]');
      const read = () => { const s = getComputedStyle(btn); return { tp: s.transitionProperty, td: s.transitionDuration, ttf: s.transitionTimingFunction }; };
      const before = read();
      const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
      btn.classList.add('motion-safe:transition-[background-color,color]!', 'motion-safe:duration-180!', 'motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]!', 'motion-reduce:transition-none!');
      const after = read();
      return { reduceMatches: matchMedia('(prefers-reduced-motion: reduce)').matches, before, after };
    }, css);
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync(__dirname + '/cascade-probe.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
})();
