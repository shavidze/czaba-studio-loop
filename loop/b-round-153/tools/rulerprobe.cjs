// B round 153 planning probe (read-only): ruler + tempo-row label overlap, sans vs Plex Mono, across zoom slider positions.
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const net = [];
function measure() { const sets = { ruler: '[data-testid=arrangement-ruler] span.absolute.tabular-nums', tempo: 'span.absolute.leading-none.tabular-nums' }; const out = {};
 for (const [k, sel] of Object.entries(sets)) { const els = [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length); const boxes = els.map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent, l: r.left, r: r.right, top: Math.round(r.top) }; }).sort((a, b) => a.top - b.top || a.l - b.l);
  let overlaps = 0, minGap = 1e9; const ex = []; for (let i = 1; i < boxes.length; i++) { if (boxes[i].top !== boxes[i - 1].top) continue; const g = boxes[i].l - boxes[i - 1].r; if (g < minGap) minGap = g; if (g < 0) { overlaps++; if (ex.length < 4) ex.push(`${boxes[i - 1].t}|${boxes[i].t}|${g.toFixed(1)}`); } }
  out[k] = { n: boxes.length, overlaps, minGap: +minGap.toFixed(1), ex, sample: boxes.slice(0, 4).map((b) => b.t) }; } return out; }
(async () => { const b = await L.launch(); const res = { vp: W, rows: [] };
 try { const { page: p } = await L.openStudio(b, X.VPS[W], `brp-${W}`, net); await p.mouse.move(2, 2); await sleep(300); await L.fontsWait(p);
  await L.blur(p); await p.locator('[data-testid=arrangement-tempo-input]').fill('90'); await p.keyboard.press('Enter'); await sleep(400);
  for (const v of ['0', '0.15', '0.3', '0.45', '0.6', '0.75', '0.9', '1']) {
   await p.evaluate((frac) => { const i = document.querySelector('[data-testid=arrangement-zoom]'); const min = +i.min, max = +i.max; const val = min + (max - min) * +frac; const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, String(val)); i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); }, v); await sleep(500);
   const zoom = await p.locator('[data-testid=arrangement-zoom-readout]').textContent();
   const sans = await p.evaluate(measure);
   await p.evaluate(() => { const st = document.createElement('style'); st.id = 'bsim'; st.textContent = "[data-testid=arrangement-ruler] span.absolute.tabular-nums, span.absolute.leading-none.tabular-nums{font-family:'IBM Plex Mono',monospace !important}"; document.head.appendChild(st); }); await sleep(250);
   const mono = await p.evaluate(measure); await p.evaluate(() => document.getElementById('bsim')?.remove());
   res.rows.push({ frac: v, zoom, sans, mono });
  }
 } catch (e) { res.error = String(e.stack || e); }
 res.net = X.netOk(net); fs.writeFileSync(path.join(L.OUT, `rulerprobe-${W}.json`), JSON.stringify(res, null, 1));
 console.log(res.error || res.rows.map((r) => `${r.frac} ${r.zoom} ruler n${r.sans.ruler.n} ov ${r.sans.ruler.overlaps}->${r.mono.ruler.overlaps} gap ${r.sans.ruler.minGap}->${r.mono.ruler.minGap} | tempo n${r.sans.tempo.n} ov ${r.sans.tempo.overlaps}->${r.mono.tempo.overlaps} gap ${r.sans.tempo.minGap}->${r.mono.tempo.minGap} ${r.mono.ruler.ex.join(';')} ${r.mono.tempo.ex.join(';')}`).join('\n')); await b.close(); })();
