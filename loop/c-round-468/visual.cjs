const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    for (const [tag, port] of [['before', 3471], ['after', 3472]]) {
      const ctx = await b.newContext({ viewport: vp });
      await ctx.addInitScript(() => localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 99, lastShown: Date.now(), dismissed: true, submitted: true })));
      const p = await ctx.newPage();
      await p.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
      await p.waitForTimeout(3000);
      const secs = await p.evaluate(() => [...document.querySelectorAll('.homepage > div')].slice(0, 2).map((d) => { const r = d.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height) }; }));
      console.log(vp.width, tag, JSON.stringify(secs));
      const names = ['product-section', 'studio-showcase'];
      for (let k = 0; k < 2; k++) {
        await p.evaluate((y) => window.scrollTo(0, y), secs[k].top - 100);
        await p.waitForTimeout(2500);
        await p.addStyleTag({ content: 'header{visibility:hidden!important}' });
        const el = (await p.$$('.homepage > div'))[k];
        await el.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/c-round-468/shots/${names[k]}-${vp.width}-${tag}.png`, animations: 'disabled' });
      }
      const ov = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, sh: document.documentElement.scrollHeight }));
      console.log(vp.width, tag, JSON.stringify(ov));
      await ctx.close();
    }
  }
  await b.close();
})();
