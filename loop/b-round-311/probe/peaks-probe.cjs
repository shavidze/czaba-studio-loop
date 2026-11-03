// Usage: node peaks-probe.cjs <baseUrl> <outJson> [runs]
// Read-only: loads /studio-lab, records LoAF script attribution and a CDP CPU profile until the demo collection is ready.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
(async () => {
  const base = process.argv[2]; const out = process.argv[3]; const runs = Number(process.argv[4] || 3);
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const results = [];
  for (let r = 0; r < runs; r++) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.setSamplingInterval', { interval: 100 });
    await page.addInitScript(() => {
      window.__lt = []; window.__loaf = []; window.__settledAt = null;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push({ start: e.startTime, dur: e.duration }); }).observe({ type: 'longtask', buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loaf.push({ start: e.startTime, dur: e.duration, scripts: e.scripts.map((s) => ({ inv: s.invoker, type: s.invokerType, fn: s.sourceFunctionName, url: (s.sourceURL || '').split('/').pop().split('?')[0], start: Math.round(s.startTime), dur: Math.round(s.duration) })) }); }).observe({ type: 'long-animation-frame', buffered: true });
      const poll = () => {
        const s = document.querySelector('[data-testid="arrangement-status"]');
        const t = s ? s.textContent || '' : '';
        if (window.__settledAt === null && /collection ready|failed to load/i.test(t)) window.__settledAt = performance.now();
        if (window.__settledAt === null) requestAnimationFrame(poll);
      };
      requestAnimationFrame(poll);
    });
    await cdp.send('Profiler.start');
    await page.goto(base + '/studio-lab', { timeout: 300000 });
    await page.waitForFunction(() => window.__settledAt !== null, null, { timeout: 300000 });
    await page.waitForTimeout(1500);
    const { profile } = await cdp.send('Profiler.stop'); fs.writeFileSync(out.replace('.json', '-profile-' + r + '.cpuprofile'), JSON.stringify(profile));
    const byFn = {};
    const dt = {}; profile.samples.forEach((id, i) => { dt[id] = (dt[id] || 0) + (profile.timeDeltas[i] || 0); });
    const nodes = new Map(profile.nodes.map((n) => [n.id, n]));
    const parent = new Map(); for (const n of profile.nodes) for (const c of n.children || []) parent.set(c, n.id);
    // inclusive time per function name (count each sample once per distinct name on its stack)
    const incl = {};
    profile.samples.forEach((id, i) => {
      const seen = new Set(); let cur = id;
      while (cur !== undefined) { const n = nodes.get(cur); const nm = n.callFrame.functionName + '@' + (n.callFrame.url.split('/').pop().split('?')[0]); if (!seen.has(nm)) { seen.add(nm); incl[nm] = (incl[nm] || 0) + (profile.timeDeltas[i] || 0); } cur = parent.get(cur); }
    });
    const pick = Object.entries(incl).filter(([k]) => /computePeaks|generateDemo|synth|decodeAudio|loadSource/i.test(k)).map(([k, v]) => [k, Math.round(v / 100) / 10]);
    const data = await page.evaluate(() => ({ lt: window.__lt, loaf: window.__loaf, settledAt: window.__settledAt, status: document.querySelector('[data-testid="arrangement-status"]')?.textContent }));
    data.profileInclusiveMs = pick;
    results.push(data);
    console.log(`run ${r}: settled ${Math.round(data.settledAt)} ms status=${JSON.stringify(data.status)}`);
    console.log('  longtasks ' + data.lt.map((e) => `${Math.round(e.start)}+${Math.round(e.dur)}`).join(', '));
    console.log('  profile ' + JSON.stringify(pick));
    for (const f of data.loaf) { const s = f.scripts.filter((x) => x.dur >= 3); if (s.length) console.log(`  LoAF ${Math.round(f.start)}+${Math.round(f.dur)}: ` + s.map((x) => `${x.type}:${x.inv}|${x.fn}@${x.url}=${x.dur}`).join(' ; ')); }
    await context.close();
  }
  fs.writeFileSync(out, JSON.stringify(results, null, 1));
  await browser.close();
})();
