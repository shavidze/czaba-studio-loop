const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const out = process.argv[2];
const SVG = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" style="flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" data-probe="1"><path d="M4 4h16v16H4z"/></svg>`;

const measure = () => {
  const lib = document.querySelector('[data-testid="arrangement-library"]');
  const els = [lib, ...lib.querySelectorAll('button,input,[role],[data-testid],h2,p,nav')];
  const occ = {};
  return els.map((e) => {
    const base = e.getAttribute('data-testid') || e.getAttribute('aria-label') || `${e.tagName.toLowerCase()}:${(e.textContent || '').trim().slice(0, 20)}`;
    occ[base] = (occ[base] || 0) + 1;
    const r = e.getBoundingClientRect();
    return { k: `${base}#${occ[base]}`, x: r.x, y: r.y, w: r.width, h: r.height };
  });
};

const iconCentre = () => [...document.querySelectorAll('svg[data-probe]')].map((s) => {
  const b = s.closest('button,span');
  const sr = s.getBoundingClientRect();
  const br = b.getBoundingClientRect();
  return { host: b.getAttribute('data-testid') || b.getAttribute('aria-label'), svg: [sr.width, sr.height], dCentreX: +((sr.x + sr.width / 2) - (br.x + br.width / 2)).toFixed(2), dCentreY: +((sr.y + sr.height / 2) - (br.y + br.height / 2)).toFixed(2) };
});

const apply = ([s12, s10]) => {
  const flexCentre = (b, svg) => { b.innerHTML = svg; b.style.display = 'flex'; b.style.alignItems = 'center'; b.style.justifyContent = 'center'; };
  const q = (sel) => document.querySelector(sel);
  const c = q('[data-testid="arrangement-library-collapse"]'); if (c) flexCentre(c, s12);
  const e = q('[data-testid="arrangement-library-expand"]'); if (e) flexCentre(e, s12);
  const x = q('[data-testid="arrangement-library-search-clear"]'); if (x) flexCentre(x, s12);
  for (const f of document.querySelectorAll('[data-testid="arrangement-library-tree"] button[aria-expanded]')) flexCentre(f, s10);
  const t = q('[data-testid="arrangement-library-preview-toggle"]');
  if (t) { const label = t.textContent.includes('Stop') ? 'Stop' : 'Preview'; t.innerHTML = `${s12}<span>${label}</span>`; t.style.display = 'flex'; t.style.alignItems = 'center'; t.style.justifyContent = 'center'; t.style.gap = '3px'; }
  for (const p of document.querySelectorAll('[data-testid="arrangement-library-option-previewing"]')) { p.innerHTML = `${s10}<span>Playing</span>`; p.style.display = 'flex'; p.style.alignItems = 'center'; p.style.gap = '2px'; }
};

async function run(page, label, prep) {
  await prep();
  await page.waitForTimeout(300);
  const before = await page.evaluate(measure);
  await page.evaluate(apply, [SVG(12), SVG(10)]);
  await page.waitForTimeout(150);
  const after = await page.evaluate(measure);
  const centres = await page.evaluate(iconCentre);
  const am = Object.fromEntries(after.map((a) => [a.k, a]));
  const d = before.map((b) => { const a = am[b.k]; if (!a) return { k: b.k, missing: true }; return { k: b.k, dx: +(a.x - b.x).toFixed(3), dy: +(a.y - b.y).toFixed(3), dw: +(a.w - b.w).toFixed(3), dh: +(a.h - b.h).toFixed(3) }; });
  const moved = d.filter((r) => r.missing || Math.abs(r.dx) > 0.01 || Math.abs(r.dy) > 0.01 || Math.abs(r.dw) > 0.01 || Math.abs(r.dh) > 0.01);
  const maxAbs = Math.max(0, ...d.filter((r) => !r.missing).flatMap((r) => [Math.abs(r.dx), Math.abs(r.dx + r.dw), Math.abs(r.dy), Math.abs(r.dy + r.dh)]));
  return { label, before, n: before.length, maxAbsEdgeDelta: +maxAbs.toFixed(3), moved, centres };
}

(async () => {
  const browser = await chromium.launch();
  const res = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const states = [
      ['S0-expanded', async (p) => {}],
      ['search-typed', async (p) => { await p.fill('[data-testid="arrangement-library-search"]', 'a'); }],
      ['preview-playing', async (p) => { await p.click('[data-testid="arrangement-library-preview-toggle"]'); await p.waitForTimeout(500); }],
      ['collapsed-rail', async (p) => { await p.click('[data-testid="arrangement-library-collapse"]'); await p.waitForTimeout(500); }],
    ];
    res[w] = [];
    for (const [name, prep] of states) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForSelector('[data-testid="arrangement-library-collapse"]');
      await page.waitForTimeout(800);
      const r = await run(page, name, () => prep(page));
      await page.screenshot({ path: out.replace('.json', `-${w}-${name}.png`), clip: { x: 0, y: 60, width: 300, height: h - 60 } });
      res[w].push(r);
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  for (const w in res) for (const r of res[w]) console.log(w, r.label, 'n', r.n, 'max', r.maxAbsEdgeDelta, 'moved', r.moved.length, JSON.stringify(r.moved).slice(0, 400), JSON.stringify(r.centres));
})();
