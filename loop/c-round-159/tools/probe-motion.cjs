const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path');
(async () => { const b = await L.launch(); const net = []; const out = {};
  for (const W of [1440, 1280]) {
    const { page: p, ctx } = await L.openStudio(b, W === 1440 ? { width: 1440, height: 900 } : { width: 1280, height: 720 }, `probe-${W}`, net, {});
    out[W] = await p.evaluate(() => { const pos = document.querySelector('[data-testid=arrangement-position]'); let n = pos; while (n && !(n.classList.contains('flex-wrap') && n.querySelector('[data-testid=arrangement-fit]'))) n = n.parentElement;
      return [...document.querySelectorAll('[class*="motion-safe:transition"]')].filter((e) => !n.contains(e)).slice(0, 8).map((e) => { const cs = getComputedStyle(e); return { tag: e.tagName, testid: e.getAttribute('data-testid'), aria: e.getAttribute('aria-label'), matchesGlobal: e.matches('a, button, [role="button"], input, textarea, select'), motionTokens: String(e.className).split(/\s+/).filter((t) => t.startsWith('motion-')), tp: cs.transitionProperty, td: cs.transitionDuration }; }); });
    await ctx.close();
  }
  out.netOk = require('./lib122.cjs').netOk(net); fs.writeFileSync(path.join(L.OUT, 'probe-motion.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); await b.close(); })();
