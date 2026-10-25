const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const out = process.argv[2];
const SVG = (s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" style="flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16v16H4z"/></svg>`;
async function measure(page) {
  return page.evaluate(() => {
    const play = document.querySelector('button[aria-label="Play"]');
    const bar = play.parentElement;
    const els = [...bar.querySelectorAll('button, [data-testid="arrangement-position"], input')];
    return els.map((e, i) => { const r = e.getBoundingClientRect(); return { i, t: (e.getAttribute('aria-label') || e.textContent || e.tagName).slice(0, 24), x: r.x, w: r.width, y: r.y, h: r.height }; });
  });
}
async function variant(page, gapText, gapXs, gapDel) {
  await page.evaluate(([s12, s10, s20, g, gx, gd]) => {
    const bar = document.querySelector('button[aria-label="Play"]').parentElement;
    const btn = (pred) => [...bar.querySelectorAll('button')].find(pred);
    const set = (b, svg, label, gap) => { b.innerHTML = svg + (label ? `<span>${label}</span>` : ''); if (gap) b.style.gap = gap; };
    set(btn((b) => b.textContent.trim() === '↤'), s12, '', null);
    for (const ch of ['↶', '↷']) { const b = btn((x) => x.textContent.startsWith(ch)); b.firstElementChild.outerHTML = s12; }
    set(btn((b) => b.textContent.trim() === '✂ Split'), s12, 'Split', g);
    set(btn((b) => b.textContent.trim() === '⌫ Delete'), s20, 'Delete', gd || g);
    set(btn((b) => b.textContent.trim() === '↻ Loop'), s12, 'Loop', g);
    set(btn((b) => b.textContent.trim() === '↩ Zoom'), s10, 'Zoom', gx);
  }, [SVG(12), SVG(10), SVG(20), gapText, gapXs, gapDel]);
}
(async () => {
  const browser = await chromium.launch();
  const res = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    for (const [name, g, gx, gd] of [['R2-as-written-gap4', null, null, null], ['gap3-gapxs2', '3px', '2px', null], ['gap3-del2-xs2', '3px', '2px', '2px']]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForSelector('button[aria-label="Play"]');
      await page.waitForTimeout(500);
      const before = await measure(page);
      await variant(page, g, gx, gd);
      await page.waitForTimeout(100);
      const after = await measure(page);
      const d = before.map((b, k) => ({ t: b.t, dx: +(after[k].x - b.x).toFixed(3), dw: +(after[k].w - b.w).toFixed(3), dy: +(after[k].y - b.y).toFixed(3), dh: +(after[k].h - b.h).toFixed(3) }));
      const maxAbs = Math.max(...d.flatMap((r) => [Math.abs(r.dx), Math.abs(r.dx + r.dw), Math.abs(r.dy), Math.abs(r.dh)]));
      res[`${w}-${name}`] = { maxAbsEdgeDelta: +maxAbs.toFixed(3), d };
      await page.screenshot({ path: out.replace('.json', `-${w}-${name}.png`), clip: { x: 0, y: 0, width: w, height: 140 } });
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  for (const k in res) console.log(k, 'maxAbsEdgeDelta', res[k].maxAbsEdgeDelta);
})();
