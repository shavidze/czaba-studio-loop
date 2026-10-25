// C round 154 — follow-up: zoom sweep by real slider clicks (BPM 90) with ruler/tempo overlap scan; range readout + selected-clip sans;
// grid menu + cookie banner weight inventory (1440). node c154b.cjs <1440|1280>
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const net = [];
const res = { vp: W, utc: new Date().toISOString(), errors: [] };
const OUTF = path.join(L.OUT, `c154b-${W}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const sec = async (n, fn) => { try { res[n] = await fn(); } catch (e) { res.errors.push(`${n}: ${String(e.stack || e).slice(0, 700)}`); } save(); };
const shot = async (p, name, clip) => { const f = `${name}-${W}.png`; await p.screenshot({ path: path.join(L.SHOTS, f), ...(clip ? { clip } : {}) }); return `c-round-154/shots/${f}`; };
function overlapScan() {
  const rows = (els) => { const by = new Map(); for (const e of els) { const b = e.getBoundingClientRect(); if (!(b.width > 0)) continue; const k = Math.round(b.top); if (!by.has(k)) by.set(k, []); by.get(k).push({ l: b.left, r: b.right, t: e.textContent, ff: getComputedStyle(e).fontFamily.slice(0, 15), w: getComputedStyle(e).fontWeight }); } const out = []; for (const [top, arr] of by) { arr.sort((a, b) => a.l - b.l); let minGap = Infinity, overl = 0, minAt = null; for (let i = 1; i < arr.length; i++) { const g = arr[i].l - arr[i - 1].r; if (g < minGap) { minGap = g; minAt = `${arr[i - 1].t}|${arr[i].t}`; } if (g < 0) overl++; } out.push({ top, n: arr.length, minGap: Number.isFinite(minGap) ? +minGap.toFixed(1) : null, minAt, overlaps: overl, first: arr[0] && arr[0].t, last: arr[arr.length - 1] && arr[arr.length - 1].t, ff: [...new Set(arr.map((a) => a.ff))], w: [...new Set(arr.map((a) => a.w))] }); } return out; };
  return { zoom: document.querySelector('[data-testid=arrangement-zoom-readout]').textContent.trim(), ruler: rows([...document.querySelectorAll('[data-testid=arrangement-ruler] span.absolute.whitespace-nowrap')]), tempo: rows([...document.querySelectorAll('span.absolute.whitespace-nowrap.leading-none')]) };
}
function inventory() {
  const vw = innerWidth, vh = innerHeight; const out = []; const sc = document.querySelector('.studio-container');
  for (const e of document.body.querySelectorAll('*')) {
    const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); if (!own && !/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.tagName)) continue;
    const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    if (!(e.getClientRects().length && b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && b.right > 0 && b.bottom > 0 && b.left < vw && b.top < vh)) continue;
    const w = +cs.fontWeight; if (w < 600) continue;
    out.push({ text: (e.textContent || e.value || '').trim().replace(/\s+/g, ' ').slice(0, 50), tag: e.tagName.toLowerCase(), family: cs.fontFamily.slice(0, 50), weight: w, inStudio: !!(sc && sc.contains(e)), box: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] });
  }
  return out;
}
const style = (p, sel) => p.evaluate((s) => [...document.querySelectorAll(s)].map((e) => { const cs = getComputedStyle(e); return { text: e.textContent.slice(0, 90), weight: cs.fontWeight, family: cs.fontFamily.slice(0, 30), sw: e.scrollWidth, cw: e.clientWidth }; }), sel);
(async () => {
  const b = await L.launch();
  try {
    if (W === 1440) {
      await sec('cookieBanner', async () => {
        const { ctx, page } = await L.openCtx(b, X.VPS[W], `c154b-cookie-${W}`, net);
        await page.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded' }); await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(2500); await L.fontsWait(page);
        const shown = await page.evaluate(() => !![...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'));
        const inv = await page.evaluate(inventory); const sh = await shot(page, 'c154b-cookie'); await ctx.close();
        return { bannerShown: shown, inv, shot: sh };
      });
    }
    const { page: p, log } = await L.openStudio(b, X.VPS[W], `c154b-${W}`, net);
    res.fontsWait = log.fontsReady; await p.mouse.move(2, 2);
    await sec('bpm90', async () => { const sel = '[data-testid=arrangement-tempo-input]'; await p.click(sel, { clickCount: 3 }); await p.keyboard.type('90'); await p.keyboard.press('Enter'); await sleep(500); await L.blur(p); return L.status(p); });
    await sec('zoomSweep', async () => {
      const sb = await p.locator('[data-testid=arrangement-zoom]').boundingBox(); const out = [];
      for (const f of [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1]) {
        await p.mouse.click(sb.x + 2 + f * (sb.width - 4), sb.y + sb.height / 2); await sleep(500); await L.blur(p); await p.mouse.move(2, 2); await sleep(200);
        const s = await p.evaluate(overlapScan); s.f = f; out.push(s);
        await shot(p, `c154b-zoom-${Math.round(f * 100)}`, { x: 0, y: 180, width: W, height: 70 });
      }
      return out;
    });
    await sec('rangeReadout', async () => {
      await L.setSnapOff(p); await L.addAt(p, 'demo-soft-impact', 'sfx', 4); const sfx = await H.byLane(p, 'sfx');
      await X.rangeDrag(p, sfx.id, 4.4, 5.4); await L.blur(p); await sleep(300);
      const r = await style(p, '[data-testid=arrangement-range], [data-testid=arrangement-range] *');
      const sh = await shot(p, 'c154b-range');
      return { range: r, status: await L.status(p), shot: sh };
    });
    if (W === 1440) {
      await sec('gridMenu', async () => {
        const pt = await H.laneBgPoint(p, 'sfx', 12); await p.mouse.click(pt.x, pt.y, { button: 'right' }); await sleep(600);
        const open = await p.locator('[data-testid=arrangement-grid-menu]').count(); const inv = await p.evaluate(inventory); const sh = await shot(p, 'c154b-grid-menu');
        const items = await p.locator('[data-testid=arrangement-grid-menu] [role^=menuitem]').allInnerTexts().catch(() => []);
        await p.keyboard.press('Escape'); await sleep(300); return { open, items, inv, shot: sh };
      });
    }
  } catch (e) { res.errors.push(String(e.stack || e)); }
  res.net = X.netOk(net); res.fontNet = net.map((n) => ({ label: n.label, n: n.fontResp.length, non200: n.fontResp.filter((r) => r.s !== 200), fail: n.fontFail }));
  save(); console.log(JSON.stringify({ vp: W, errors: res.errors, net: res.net, fontNet: res.fontNet }, null, 1)); await b.close();
})();
