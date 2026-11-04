const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => { const base = process.argv[2]; const b = await chromium.launch(); const p = await b.newPage();
  for (const u of ['/studio-lab', '/studio/middle-east']) { const t = Date.now(); try { await p.goto(base + u, { waitUntil: 'load', timeout: 240000 });
    if (u === '/studio-lab') await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 240000 });
    console.log(u, 'ok', Date.now() - t); } catch (e) { console.log(u, 'err', String(e).slice(0, 200)); const s = await p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent || document.body.innerText.slice(0,200)).catch(()=>'?'); console.log('state', s); } }
  await b.close(); })();
