// B round 151 planning probe (word-spacing on V-2a tree) (read-only for source): measure how web fonts move Studio boxes.
// node fontprobe.cjs <1440|1280>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const W = +process.argv[2] || 1440;
const VP = W === 1280 ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const OUT = path.join(__dirname, '..', 'out');
const FONTS = 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+Georgian:wght@400;500&display=swap';
const SEL = '[data-studio-theme="obsidian"],body:has([data-studio-theme="obsidian"])';
const VARIANTS = { base: '', ws10: SEL + '{word-spacing:0.1em}', ws12: SEL + '{word-spacing:0.12em}' };
function collect() {
  const r5 = (v) => Math.round(v * 2) / 2;
  const root = document.querySelector('[data-studio-theme]') || document.body;
  const vw = innerWidth, vh = innerHeight;
  const vis = (e) => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return e.getClientRects().length > 0 && b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && b.right > 0 && b.bottom > 0 && b.left < vw && b.top < vh; };
  const INTER = 'button,input,select,textarea,a,[role=slider],[role=option],[role=tab],[role=separator],[data-testid]';
  const occ = {}; const out = {};
  for (const e of root.querySelectorAll(INTER)) {
    if (!vis(e)) continue;
    const tid = e.getAttribute('data-testid'); const al = e.getAttribute('aria-label');
    let k = tid ? `tid:${tid}` : al ? `al:${al.slice(0, 50)}` : `${e.tagName.toLowerCase()}:${(e.textContent || '').trim().slice(0, 30)}`;
    occ[k] = (occ[k] || 0) + 1; k += `#${occ[k]}`;
    const b = e.getBoundingClientRect();
    const ovf = e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible' || (e.tagName === 'INPUT' && e.scrollWidth > e.clientWidth + 1);
    out[k] = { ovf, x: r5(b.x), y: r5(b.y), w: r5(b.width), h: r5(b.height), ff: getComputedStyle(e).fontFamily.slice(0, 40), fs: getComputedStyle(e).fontSize };
  }
  return out;
}
(async () => {
  const browser = await chromium.launch();
  const res = { vp: VP, variants: {} };
  for (const [name, css] of Object.entries(VARIANTS)) {
    const ctx = await browser.newContext({ viewport: VP });
    const p = await ctx.newPage();
    const fontReq = [];
    p.on('response', (r) => { if (/fonts\.(googleapis|gstatic)/.test(r.url())) fontReq.push(`${r.status()} ${r.url().slice(0, 80)}`); });
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await p.waitForSelector('[data-testid=arrangement-timeline-scroller]');
    await p.waitForTimeout(1500); await p.evaluate(() => document.fonts.ready);
    if (css) {
      
      await p.addStyleTag({ content: css });
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(1500); await p.evaluate(() => document.fonts.ready);
    }
    const fonts = await p.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`));
    const rootFF = await p.evaluate(() => getComputedStyle(document.querySelector('[data-studio-theme]')).fontFamily);
    const boxes = await p.evaluate(collect);
    await p.screenshot({ path: path.join(OUT, `ws-${name}-${W}.png`) });
    res.variants[name] = { fonts: [...new Set(fonts)], rootFF, fontReq: fontReq.slice(0, 6), boxes };
    await ctx.close();
  }
  await browser.close();
  const base = res.variants.base.boxes;
  const summary = {};
  for (const [name, v] of Object.entries(res.variants)) {
    if (name === 'base') continue;
    const moved = [];
    for (const [k, b] of Object.entries(base)) {
      const o = v.boxes[k];
      if (!o) { moved.push({ k, missing: true }); continue; }
      const d = Math.max(Math.abs(o.x - b.x), Math.abs(o.y - b.y), Math.abs(o.w - b.w), Math.abs(o.h - b.h));
      if (d > 1) moved.push({ k, d, base: [b.x, b.y, b.w, b.h], now: [o.x, o.y, o.w, o.h] });
    }
    const ovfNew = Object.entries(v.boxes).filter(([k, o]) => o.ovf && !(base[k] && base[k].ovf)).map(([k]) => k);
    summary[name] = { ovfNew, total: Object.keys(base).length, movedOver1px: moved.length, added: Object.keys(v.boxes).filter((k) => !base[k]).length, maxD: Math.max(0, ...moved.map((m) => m.d || 0)), sample: moved.sort((a, b) => (b.d || 0) - (a.d || 0)).slice(0, 200), fonts: v.fonts, rootFF: v.rootFF, fontReq: v.fontReq };
  }
  summary.baseRootFF = res.variants.base.rootFF;
  summary.baseFonts = res.variants.base.fonts;
  fs.writeFileSync(path.join(OUT, `wsprobe-${W}.json`), JSON.stringify(summary, null, 1));
  for (const [n, s] of Object.entries(summary)) if (s && s.total) console.log(n, s.total, 'moved>1px', s.movedOver1px, 'max', s.maxD, 'fonts', s.fonts.join('|'));
  console.log('base root ff', summary.baseRootFF);
})().catch((e) => { console.error(e); process.exit(1); });
