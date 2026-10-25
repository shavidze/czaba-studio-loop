// B round 153 planning probe (read-only): preview title slack vs mono duration (with/without tracking-tight).
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const net = [];
(async () => { const b = await L.launch(); const res = { vp: W };
 try { const { page: p } = await L.openStudio(b, X.VPS[W], `bpp-${W}`, net); await p.mouse.move(2, 2); await sleep(300); await L.fontsWait(p);
  res.variants = await p.evaluate(async () => { const d = document.querySelector('[data-testid=arrangement-library-preview] span.shrink-0.text-xs'); const t = d.parentElement.querySelector('p'); const out = {};
   const m = () => ({ titleText: t.textContent, titleSW: t.scrollWidth, titleCW: t.clientWidth, durW: +d.getBoundingClientRect().width.toFixed(2), durText: d.textContent, slack: t.clientWidth - t.scrollWidth });
   out.base = m();
   for (const [k, css] of [['mono', "font-family:'IBM Plex Mono',monospace"], ['monoTight', "font-family:'IBM Plex Mono',monospace;letter-spacing:-0.025em"], ['monoTighter', "font-family:'IBM Plex Mono',monospace;letter-spacing:-0.05em"]]) { d.style.cssText = css; await new Promise((r) => setTimeout(r, 200)); out[k] = m(); d.style.cssText = ''; }
   const loop = [...document.querySelectorAll('.font-mono.tracking-tight')].map((e) => e.textContent.slice(0, 20)); out.loopTight = loop; return out; });
 } catch (e) { res.error = String(e.stack || e); }
 res.net = X.netOk(net); fs.writeFileSync(path.join(L.OUT, `previewprobe-${W}.json`), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res.variants || res.error, null, 1)); await b.close(); })();
