// C round 169 — C-R169-N1: computed outline/border on the focused library search (one context, 1440).
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
(async () => { const b = await L.launch(); const net = []; const { page: p, ctx, log } = await L.openStudio(b, X.VPS[1440], 'c169-n1', net);
  const S = '[data-testid=arrangement-library-search]'; const r = { fonts: log.fontsReady && log.fontsReady.ok };
  const read = () => p.evaluate((s) => { const e = document.querySelector(s); const c = getComputedStyle(e); return { focused: document.activeElement === e, fv: e.matches(':focus-visible'), outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor} offset ${c.outlineOffset}`, border: c.borderTopColor, radius: c.borderTopLeftRadius }; }, S);
  r.rest = await read(); await p.click(S); await sleep(300); r.mouseFocus = await read(); await p.keyboard.type('a'); await sleep(300); r.typed = await read();
  await ctx.close(); r.net = X.netOk(net); await b.close(); fs.writeFileSync(path.join(L.OUT, 'c169-n1.json'), JSON.stringify(r, null, 1)); console.log(JSON.stringify(r, null, 1)); })();
