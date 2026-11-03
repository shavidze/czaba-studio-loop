// Usage: node peaks-identity.cjs <baseUrl> <outJson>
// Fresh /studio-lab at 1440x900: records workers created, main-thread CPU profile inclusive time of computePeaks/accumulatePeakChunk,
// and the library preview waveform markup for every library option (identity across trees).
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs'); const crypto = require('crypto');
(async () => {
  const base = process.argv[2]; const out = process.argv[3];
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const workers = []; page.on('worker', (w) => workers.push(w.url().split('/').pop().split('?')[0]));
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 100 }); await cdp.send('Profiler.start');
  await page.goto(base + '/studio-lab', { timeout: 300000 });
  await page.waitForFunction(() => /collection ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 300000 });
  await page.waitForTimeout(1500);
  const { profile } = await cdp.send('Profiler.stop');
  const nodes = new Map(profile.nodes.map((n) => [n.id, n])); const parent = new Map();
  for (const n of profile.nodes) for (const c of n.children || []) parent.set(c, n.id);
  const incl = {};
  profile.samples.forEach((id, i) => { const seen = new Set(); let cur = id; while (cur !== undefined) { const cf = nodes.get(cur).callFrame; const nm = cf.functionName + '@' + cf.url.split('/').pop().split('?')[0]; if (!seen.has(nm)) { seen.add(nm); incl[nm] = (incl[nm] || 0) + (profile.timeDeltas[i] || 0); } cur = parent.get(cur); } });
  const mainPeaksMs = Object.entries(incl).filter(([k]) => /^(computePeaks|accumulatePeakChunk)@/.test(k)).map(([k, v]) => [k, Math.round(v / 100) / 10]);
  for (let k = 0; k < 6; k++) { const closed = page.locator('[data-testid="arrangement-library-folder"][aria-expanded="false"]'); if (await closed.count() === 0) break; await closed.first().click(); await page.waitForTimeout(200); }
  const options = page.locator('[data-testid="arrangement-library"] [role="option"]');
  const n = await options.count(); const waves = [];
  for (let i = 0; i < n; i++) {
    await options.nth(i).click(); await page.waitForTimeout(400);
    const title = (await options.nth(i).textContent() || '').trim().slice(0, 60);
    const html = await page.locator('[data-testid="arrangement-library-preview-wave"]').innerHTML();
    const geom = html.replace(/class="[^"]*"/g, '');
    waves.push({ title, rects: (geom.match(/<rect/g) || []).length, sha: crypto.createHash('sha256').update(geom).digest('hex').slice(0, 16) });
  }
  const result = { base, workers, errors, mainPeaksMs, options: n, waves, status: await page.locator('[data-testid="arrangement-status"]').textContent() };
  fs.writeFileSync(out, JSON.stringify(result, null, 1)); console.log(JSON.stringify(result, null, 1));
  await browser.close();
})();
