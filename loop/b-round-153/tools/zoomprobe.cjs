// B round 153 planning probe (read-only): worst-case widths of zoom readout / pan / ruler labels in sans vs Plex Mono 12px.
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const net = [];
(async () => { const b = await L.launch(); const res = { vp: W };
 try { const { page: p } = await L.openStudio(b, X.VPS[W], `bzp-${W}`, net); await p.mouse.move(2, 2); await sleep(300); await L.fontsWait(p);
  res.widths = await p.evaluate(() => { const host = document.querySelector('[data-testid=arrangement-zoom-readout]'); const out = {}; const s = document.createElement('span'); s.className = 'text-xs tabular-nums'; s.style.position = 'absolute'; s.style.whiteSpace = 'nowrap'; host.parentElement.appendChild(s);
   for (const t of ['0.5 px/s', '40 px/s', '123.4 px/s', '319.9 px/s', '320 px/s', '50L', '50R', 'C', '0 dB', '4/4', '10:00', '1:00:00', '00:00.000']) { s.style.fontFamily = ''; s.textContent = t; const a = s.getBoundingClientRect().width; s.style.fontFamily = "'IBM Plex Mono', monospace"; const m = s.getBoundingClientRect().width; out[t] = { sans: +a.toFixed(1), mono: +m.toFixed(1) }; }
   s.remove(); out.readoutBox = host.getBoundingClientRect().width; out.readoutNext = host.nextElementSibling ? host.nextElementSibling.tagName : null; const lab = host.parentElement; out.labelNext = lab.nextElementSibling ? (lab.nextElementSibling.textContent || '').trim().slice(0, 20) : null; out.gap = lab.nextElementSibling ? +(lab.nextElementSibling.getBoundingClientRect().left - host.getBoundingClientRect().right).toFixed(1) : null; return out; });
 } catch (e) { res.error = String(e.stack || e); }
 res.net = X.netOk(net); fs.writeFileSync(path.join(L.OUT, `zoomprobe-${W}.json`), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res.widths || res.error)); await b.close(); })();
