import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2]; const out = process.argv[3];
const ids = ['arrangement-status','arrangement-detail-header-label','arrangement-detail-hint','arrangement-detail-reason','arrangement-detail-clip-gain-reason','arrangement-library-notice','arrangement-lane-empty-hint'];
const res = {};
const b = await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
  const page = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await page.goto(base + '/studio-lab', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]'); await page.waitForTimeout(2000);
  res[`${w}x${h}-S0`] = await page.evaluate((ids) => Object.fromEntries(ids.map((id) => {
    const el = document.querySelector(`[data-testid="${id}"]`);
    if (!el) return [id, null];
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    let hidden = false; for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e); if (c.display==='none'||c.visibility==='hidden') hidden = true; }
    const lh = parseFloat(cs.lineHeight) || 16;
    const visible = !hidden && r.width > 1 && r.height > 1 && (el.textContent||'').trim() !== '';
    return [id, { h: Math.round(r.height), lh, rows: visible ? Math.round(r.height / lh) : 0, text: (el.textContent||'').slice(0,60) }];
  })), ids);
}
await b.close();
writeFileSync(out, JSON.stringify(res, null, 1));
for (const [k,v] of Object.entries(res)) console.log(k, Object.entries(v).map(([i,x]) => `${i.replace('arrangement-','')}=${x?x.rows:'-'}`).join(' '), 'total', Object.values(v).reduce((s,x)=>s+(x?x.rows:0),0));
