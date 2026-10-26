// C round 175 probe: where is the horizontal scrollbar of the timeline?
const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => { const b = await L.launch(); const net = []; const { page: p, ctx } = await L.openStudio(b, X.VPS[1440], 'probe-sc', net);
  await L.addAt(p, 'demo-middle-east', 'music', 1); await sleep(500);
  const r = await p.evaluate(() => [...document.querySelectorAll('*')].filter((e) => { const cs = getComputedStyle(e); return /auto|scroll/.test(cs.overflowX) || /auto|scroll/.test(cs.overflowY); }).map((e) => { const cs = getComputedStyle(e); const b = e.getBoundingClientRect(); return { t: e.dataset.testid || e.tagName, ox: cs.overflowX, oy: cs.overflowY, sw: e.scrollWidth, cw: e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight, oh: e.offsetHeight, ow: e.offsetWidth, box: [b.x, b.y, b.width, b.height].map(Math.round), sb: getComputedStyle(e, '::-webkit-scrollbar').height }; }));
  console.log(JSON.stringify(r, null, 0)); await ctx.close(); await b.close(); })();
