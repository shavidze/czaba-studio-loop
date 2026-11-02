// C301 RG-22 narrow half (FIX-PD-1c): at 390x844 and 800x720 /studio-lab shows the narrow screen, no workspace, 0 page errors.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path');
(async () => { const b = await chromium.launch(); const out = {};
  for (const [w, h] of [[390, 844], [800, 720]]) { const k = `${w}x${h}`; const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); const errors = []; p.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
    const r = await p.evaluate(() => { const vis = (el) => !!el && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'; const h1 = [...document.querySelectorAll('h1')].filter(vis).map((e) => e.textContent.trim()); const ws = document.querySelector('[data-testid="arrangement-transport"]'); const exit = document.querySelector('[data-testid="arrangement-exit"]'); return { h1, workspaceVisible: vis(ws), exitVisible: vis(exit), scrollWidth: document.documentElement.scrollWidth, innerWidth, audio: [...document.querySelectorAll('audio')].filter(vis).length, authUser: localStorage.getItem('auth_user') }; });
    await p.screenshot({ path: path.join(__dirname, 'shots', `rg22-${k}.png`) });
    r.errors = errors; r.pass = r.h1.includes('The Studio works on a computer') && !r.workspaceVisible && !r.exitVisible && errors.length === 0 && r.scrollWidth <= w; out[k] = r; await ctx.close(); console.log(k, JSON.stringify(r)); }
  fs.writeFileSync(path.join(__dirname, 'rg22n.json'), JSON.stringify(out, null, 1)); await b.close(); })();
