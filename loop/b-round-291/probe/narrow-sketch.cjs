const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const base = process.argv[2];
(async () => {
  const out = {};
  const b = await chromium.launch();
  for (const [w,h] of [[390,844],[768,1024],[899,900],[900,900],[1280,720],[1440,900]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    const net = { requested: [], finished: [], failed: [] }; let workers = 0;
    p.on('request', r => { if (/\.mp3|\.mp4/.test(r.url())) net.requested.push(r.url().replace(base,'')); });
    p.on('requestfinished', r => { if (/\.mp3|\.mp4/.test(r.url())) net.finished.push(r.url().replace(base,'')); });
    p.on('requestfailed', r => { if (/\.mp3|\.mp4/.test(r.url())) net.failed.push(r.url().replace(base,'')+' '+r.failure()?.errorText); });
    p.on('worker', () => workers++);
    const errs = []; p.on('console', m => { if (m.type()==='error' && !/cart|ERR_CONNECTION|5199/.test(m.text())) errs.push(m.text().slice(0,160)); });
    await p.goto(base + '/studio-lab', { waitUntil: 'networkidle' });
    await p.waitForTimeout(2000);
    const m = await p.evaluate(() => ({
      narrowVisible: !!document.querySelector('[data-testid="studio-narrow-screen"]')?.checkVisibility(),
      workspaceExit: !!document.querySelector('[data-testid="arrangement-exit"]'),
      workspaceVisible: !!document.querySelector('[data-testid="arrangement-exit"]')?.checkVisibility(),
      h1Visible: [...document.querySelectorAll('h1')].filter(e => e.checkVisibility()).map(e => e.textContent),
      bodyBg: document.body ? getComputedStyle(document.body).backgroundColor : null,
      scrollW: document.documentElement.scrollWidth,
    }));
    out[`${w}x${h}`] = { ...m, net, workers, errs };
    await p.screenshot({ path: `probe/sketch-${w}x${h}.png` });
    await ctx.close();
  }
  // resize transitions
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(base + '/studio-lab', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  await p.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 15000 }).catch(()=>{});
  const opt = p.getByRole('option').first(); await opt.click(); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
  const clipsBefore = await p.locator('[data-testid^="arrangement-clip"]').count();
  await p.setViewportSize({ width: 899, height: 900 }); await p.waitForTimeout(800);
  const narrowNow = await p.evaluate(() => ({ narrow: !!document.querySelector('[data-testid="studio-narrow-screen"]')?.checkVisibility(), ws: !!document.querySelector('[data-testid="arrangement-exit"]'), active: document.activeElement?.tagName + ' ' + (document.activeElement?.getAttribute('data-testid')||'') }));
  await p.setViewportSize({ width: 1440, height: 900 }); await p.waitForTimeout(1200);
  const clipsAfter = await p.locator('[data-testid^="arrangement-clip"]').count();
  const back = await p.evaluate(() => ({ ws: !!document.querySelector('[data-testid="arrangement-exit"]')?.checkVisibility(), active: document.activeElement?.tagName + ' ' + (document.activeElement?.getAttribute('data-testid')||'') }));
  out.resize = { clipsBefore, narrowNow, clipsAfter, back };
  // narrow -> wide
  const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 } }); const p2 = await ctx2.newPage();
  await p2.goto(base + '/studio-lab', { waitUntil: 'networkidle' }); await p2.waitForTimeout(1000);
  await p2.setViewportSize({ width: 1440, height: 900 }); await p2.waitForTimeout(2500);
  out.narrowToWide = await p2.evaluate(() => ({ ws: !!document.querySelector('[data-testid="arrangement-exit"]')?.checkVisibility(), narrow: !!document.querySelector('[data-testid="studio-narrow-screen"]')?.checkVisibility(), ready: document.body.innerText.includes('Demo collection ready') }));
  await p2.screenshot({ path: 'probe/sketch-narrow-to-wide.png' });
  await b.close();
  console.log(JSON.stringify(out, null, 1));
})();
