const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const vp of [{w:390,h:844},{w:360,h:740}]) {
    const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: true, isMobile: true });
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
    await p.waitForSelector('[data-testid=studio-narrow-screen]', { timeout: 30000 });
    await p.waitForTimeout(800);
    out[`${vp.w}x${vp.h}`] = await p.evaluate(() => {
      const root = document.querySelector('[data-testid=studio-narrow-screen]');
      const targets = [...root.querySelectorAll('a,button,input,audio')].filter(e => e.getClientRects().length);
      const rects = targets.map(e => { const r = e.getBoundingClientRect(); return { tag: e.tagName, text: (e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,30), x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), cls: e.className && String(e.className).slice(0,120) }; });
      // WCAG 2.5.8 spacing exception: 24px circle centred on each undersized target must not intersect other targets' circles/targets
      const res = rects.map((r,i) => {
        const cx = r.x + r.w/2, cy = r.y + r.h/2;
        let minDist = Infinity;
        rects.forEach((o,j) => { if (i===j) return; const dx = Math.max(o.x - cx, 0, cx - (o.x+o.w)); const dy = Math.max(o.y - cy, 0, cy - (o.y+o.h)); minDist = Math.min(minDist, Math.hypot(dx,dy)); });
        return { ...r, under24: r.w < 24 || r.h < 24, nearestOtherTargetPx: +minDist.toFixed(1), spacingExceptionMet: minDist >= 12 };
      });
      return res;
    });
    await p.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/b-round-294/probe/narrow-${vp.w}.png` });
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
