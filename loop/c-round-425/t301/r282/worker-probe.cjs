// C282 WORKER-BROWSER: node worker-probe.cjs <base> <out> ; both viewports, 1 warm-up (untimed) then 3 runs each
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
(async () => {
  const [base, out] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const R = { base, warmup: null, runs: [] };
  { const c = await browser.newContext(); const p = await c.newPage(); await p.goto(base + '/studio-lab'); await p.getByTestId('arrangement-status').filter({ hasText: /^Demo collection ready/ }).waitFor({ timeout: 120000 }); R.warmup = 'ok'; await c.close(); }
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) for (let r = 0; r < 3; r++) {
    const context = await browser.newContext({ viewport: vp });
    const page = await context.newPage(); const errors = []; const reqs = []; const workers = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('request', (q) => { if (/demo-synth/.test(q.url())) reqs.push({ url: q.url().split('/').pop(), type: q.resourceType() }); });
    page.on('worker', (w) => workers.push(w.url().split('/').pop()));
    await page.addInitScript(() => {
      window.__loaf = []; window.__readyAt = null;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loaf.push({ start: e.startTime, dur: e.duration, scripts: e.scripts.map((s) => ({ inv: s.invoker, type: s.invokerType, url: (s.sourceURL || '').split('/').pop(), start: s.startTime, dur: Math.round(s.duration) })) }); }).observe({ type: 'long-animation-frame', buffered: true });
      const poll = () => { const s = document.querySelector('[data-testid="arrangement-status"]'); const t = s ? s.textContent || '' : ''; if (window.__readyAt === null && /^Demo collection ready/.test(t)) window.__readyAt = performance.now(); if (window.__readyAt === null) requestAnimationFrame(poll); };
      requestAnimationFrame(poll);
    });
    await page.goto(base + '/studio-lab');
    await page.waitForFunction(() => window.__readyAt !== null, null, { timeout: 120000 });
    await page.waitForTimeout(1000);
    const d = await page.evaluate(() => ({ loaf: window.__loaf, readyAt: window.__readyAt }));
    const inWin = d.loaf.filter((f) => f.start <= d.readyAt);
    const scripts = inWin.flatMap((f) => f.scripts);
    const maxScript = scripts.reduce((m, s) => Math.max(m, s.dur), 0);
    const workerMsg = scripts.filter((s) => /Worker\.onmessage/.test(s.inv));
    const row = { vp: `${vp.width}x${vp.height}`, run: r, readyAt: Math.round(d.readyAt), loafCount: inWin.length, maxScript, maxScriptInv: (scripts.find((s) => s.dur === maxScript) || {}).inv, workerOnmessage: workerMsg.map((s) => s.dur), scriptsOver50: scripts.filter((s) => s.dur > 50).map((s) => `${s.inv}=${s.dur}`), reqs, workers, errors };
    R.runs.push(row); console.log(JSON.stringify(row));
    await context.close();
  }
  fs.writeFileSync(out, JSON.stringify(R, null, 1)); await browser.close();
})();
