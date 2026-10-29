const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
 const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
 const t0 = Date.now(); await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
 for (let i = 0; i < 12; i++) { await new Promise((r) => setTimeout(r, 5000)); const s = await p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? 'NO-STATUS'); console.log(((Date.now() - t0) / 1000).toFixed(0), s.slice(0, 120)); if (s.startsWith('Demo collection ready')) break; }
 console.log(errs.slice(0, 8)); await p.screenshot({ path: 'probe.png' }); await b.close(); })();
