const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path'); const SH = path.join(__dirname, 'shots');
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const [name, base] of [['a', 'http://127.0.0.1:5173']]) {
    { const c = await b.newContext(); const p = await c.newPage(); await p.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' }).catch(() => {}); await p.waitForTimeout(4000); await c.close(); }
    for (const [w, h] of [[1440, 900], [1280, 720]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
      await p.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
      await p.waitForFunction(() => /Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 60000 });
      await p.waitForTimeout(800);
      if (process.env.CLIP) { await p.locator('[role=option][data-source-id="demo-stem-pulse"]').focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(1200); await p.evaluate(() => document.activeElement && document.activeElement.blur()); await p.waitForTimeout(400); }
      const r = await p.evaluate(() => {
        const tl = document.querySelector('[data-testid="arrangement-timeline-scroller"]');
        const lines = []; const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n; while ((n = walker.nextNode())) {
          const t = n.textContent.trim(); if (!t) continue; const el = n.parentElement; if (!el) continue;
          if (tl && tl.contains(el)) continue;
          const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
          const rg = document.createRange(); rg.selectNodeContents(n); const rects = Array.from(rg.getClientRects()).filter((q) => q.width > 0 && q.height > 0 && q.bottom > 0 && q.top < innerHeight && q.right > 0 && q.left < innerWidth);
          if (!rects.length) continue;
          let op = 1; for (let e = el; e; e = e.parentElement) op *= Number(getComputedStyle(e).opacity);
          if (op === 0) continue;
          const ys = new Set(rects.map((q) => Math.round(q.top))); ys.forEach((y) => lines.push(`${y}|${t.slice(0, 60)}`));
        }
        return { count: lines.length, rows: new Set(lines.map((l) => l.split('|')[0])).size, lines, menus: document.querySelectorAll('[role=menu]').length };
      });
      out[`${name}-${w}x${h}`] = r;
      await p.screenshot({ path: path.join(SH, `budget${process.env.CLIP ? '-clip' : ''}-${name}-${w}x${h}.png`) });
      await ctx.close();
    }
  }
  const base = JSON.parse(fs.readFileSync(path.join(__dirname, '../c-round-300/budget.json'))); const diff = {};
  for (const vp of ['1440x900', '1280x720']) { const A = out[`a-${vp}`], H = base[`a-${vp}`]; diff[vp] = { head: H.count, a: A.count, onlyA: A.lines.filter((l) => !H.lines.includes(l)), onlyHead: H.lines.filter((l) => !A.lines.includes(l)) }; }
  out.diff = diff;
  fs.writeFileSync(path.join(__dirname, process.env.CLIP ? 'budget-clip.json' : 'budget.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(diff, null, 1)); await b.close();
})();
