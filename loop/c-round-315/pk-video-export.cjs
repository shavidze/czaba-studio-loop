// C315 §8 neighbour: video import -> export refused while the video's sound is decoding (peaks replies held),
// then released -> ready -> Export WAV downloaded and saved for analysis (wavcheck.py).
// Usage: node pk-video-export.cjs <baseURL> <WxH> <out-prefix>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path');
const [base, vp, prefix] = process.argv.slice(2); const [w, h] = vp.split('x').map(Number);
const file = path.join(__dirname, 'media', 'c315-tone-440.webm');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  await ctx.addInitScript(() => {
    window.__c315Hold = false; const held = []; const Native = window.Worker;
    window.Worker = class extends Native { constructor(url, o) { super(url, o); const isPeaks = String(url).includes('peaks'); let handler = null;
      super.onmessage = (ev) => { if (isPeaks && window.__c315Hold) held.push([this, ev]); else if (handler) handler.call(this, ev); };
      Object.defineProperty(this, 'onmessage', { get: () => handler, set: (fn) => { handler = fn; }, configurable: true });
      window.__c315Release = () => { window.__c315Hold = false; for (const [wk, ev] of held.splice(0)) { const hd = wk.onmessage; if (hd) hd.call(wk, ev); } }; } };
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
  await p.goto(base + '/studio-lab'); await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 120000 });
  await p.waitForTimeout(800);
  const res = { base, vp };
  await p.evaluate(() => { window.__c315Hold = true; });
  await p.getByTestId('arrangement-video-input').setInputFiles(file);
  await p.locator('[data-clip-kind="video"]').first().waitFor({ timeout: 30000 });
  await p.waitForTimeout(500);
  await p.getByRole('button', { name: 'Export', exact: true }).first().click();
  const dlg = p.getByRole('dialog');
  await dlg.waitFor();
  await dlg.getByTestId('arrangement-export-format-wav').check().catch(async () => dlg.getByTestId('arrangement-export-format-wav').click());
  const primary = dlg.getByRole('button', { name: 'Export WAV', exact: true });
  res.held = { clipNote: await p.locator('[data-clip-kind="video"]').first().innerText(), primaryDisabled: await primary.isDisabled(), videoSound: await dlg.getByTestId('arrangement-export-video-sound').innerText().catch(() => null) };
  await p.screenshot({ path: path.join(__dirname, 'shots', `export-held-${vp}.png`) });
  await p.evaluate(() => window.__c315Release());
  await p.waitForFunction(() => !/Sound is decoding/.test(document.querySelector('[data-clip-kind="video"]')?.textContent || ''), null, { timeout: 15000 });
  await p.waitForTimeout(300);
  res.ready = { primaryDisabled: await primary.isDisabled(), videoSound: await dlg.getByTestId('arrangement-export-video-sound').innerText().catch(() => null), scope: await dlg.getByTestId('arrangement-export-scope').innerText().catch(() => null) };
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), primary.click()]);
  const wav = `${prefix}.wav`; await dl.saveAs(wav); res.download = { suggested: dl.suggestedFilename(), bytes: fs.statSync(wav).size, path: path.basename(wav) };
  await p.screenshot({ path: path.join(__dirname, 'shots', `export-done-${vp}.png`) });
  res.errors = errs; fs.writeFileSync(`${prefix}.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res)); await b.close();
})();
