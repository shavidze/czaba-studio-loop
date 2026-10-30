// C round 276: V-RING by real Tab focus + pixel contrast; HEAD cursor/look comparisons. usage: node c276-ring.cjs <base> <label>
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE = process.argv[2]; const LABEL = process.argv[3];
const outDir = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-276';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const src = fs.readFileSync(path.join(outDir, 'c276.cjs'), 'utf8');
const INIT_SRC = src.slice(src.indexOf('const INIT = () => {'), src.indexOf('const SEVEN'));
const INIT = eval(`(${INIT_SRC.replace('const INIT = ', '').trim().replace(/;$/, '')})`);
const KEYS = ['undo', 'redo', 'split', 'delete', 'loop', 'zoomRange', 'zoomBack', 'fit'];
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = (p) => 0.2126 * lin(p[0]) + 0.7152 * lin(p[1]) + 0.0722 * lin(p[2]);
const CR = (a, b) => { const x = L(a); const y = L(b); return +(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05))).toFixed(2); };
(async () => {
  const browser = await chromium.launch();
  const out = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const ctx = await browser.newContext({ viewport: vp }); await ctx.addInitScript(INIT);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/studio-lab`);
    await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
    await sleep(2000);
    const r = {};
    await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
    await page.evaluate(() => document.activeElement?.blur());
    const seen = new Set();
    for (let i = 0; i < 60 && seen.size < KEYS.length; i += 1) {
      await page.keyboard.press('Tab'); await sleep(150);
      const k = await page.evaluate(() => window.__name(document.activeElement));
      if (!KEYS.includes(k) || seen.has(k)) continue;
      seen.add(k);
      const st = await page.evaluate(() => { const b = document.activeElement; const cs = getComputedStyle(b); return { ariaDisabled: b.getAttribute('aria-disabled'), disabled: b.disabled, fv: b.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, offset: cs.outlineOffset, opacity: cs.opacity, childOps: [...b.children].map((c) => getComputedStyle(c).opacity), box: (() => { const q = b.getBoundingClientRect(); return { x: q.x, y: q.y, width: q.width, height: q.height }; })() }; });
      const bx = st.box;
      const buf = await page.screenshot({ clip: { x: bx.x - 6, y: bx.y - 6, width: bx.width + 12, height: bx.height + 12 } });
      fs.writeFileSync(path.join(outDir, `${LABEL}-ring-${k}-${vp.width}.png`), buf);
      const px = await page.evaluate(async ([b64, h]) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height).data; const at = (x, y) => { const i = (y * c.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
        const y = Math.round(6 + h / 2); const row = []; for (let x = 0; x <= 7; x += 1) row.push(at(x, y));
        return row;
      }, [buf.toString('base64'), bx.height]);
      const ringPx = px.reduce((a, p) => (p[0] - p[2] > a[0] - a[2] ? p : a), px[0]);
      st.leftEdgeRow = px; st.ringPx = ringPx; st.bgPx = px[0]; st.contrast = CR(ringPx, px[0]);
      r[k] = st;
    }
    r.cursorControl = await page.evaluate(() => {
      const mk = (html) => { const w = document.createElement('div'); w.innerHTML = html; document.body.appendChild(w); const b = w.firstChild; const c = getComputedStyle(b).cursor; w.remove(); return c; };
      return { nativeDisabledToken: mk('<button disabled class="disabled:cursor-not-allowed">x</button>'), plainDisabled: mk('<button disabled>x</button>') };
    });
    out[`${vp.width}x${vp.height}`] = r;
    await ctx.close();
  }
  fs.writeFileSync(path.join(outDir, `c276-ring-${LABEL}.json`), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, (k, v) => (k === 'leftEdgeRow' ? undefined : v)).slice(0, 6000));
  await browser.close();
})();
