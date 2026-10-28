// C round 234: LAB-SMOKE playback output measurement in a seeded project. usage: node c234play.cjs <outDir>
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE = 'http://127.0.0.1:5173';
const outDir = process.argv[2];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const INIT = () => {
  window.__taps = [];
  const orig = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (target, ...rest) {
    const res = orig.call(this, target, ...rest);
    try {
      if (target instanceof AudioDestinationNode && !(this.context instanceof OfflineAudioContext)) {
        const a = this.context.createAnalyser(); a.fftSize = 2048; orig.call(this, a); window.__taps.push(a);
      }
    } catch (e) {}
    return res;
  };
  window.__rms = () => window.__taps.map((a) => { const d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return Math.sqrt(s / d.length); });
};
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const R = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const key = `${vp.width}x${vp.height}`;
    const ctx = await browser.newContext({ viewport: vp });
    await ctx.addInitScript(INIT);
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
    await page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Add/.test(x.textContent.trim())); return b && !b.disabled; }, undefined, { timeout: 120000 });
    await sleep(800);
    await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(200);
    await page.locator('button', { hasText: /^Add/ }).first().click(); await sleep(700);
    const clock = () => page.evaluate(() => { const els = [...document.querySelectorAll('[data-testid*="clock"], [data-testid*="time"], time')]; return els.map((e) => `${e.getAttribute('data-testid')}=${e.textContent.trim()}`).slice(0, 6); });
    const ph = () => page.evaluate(() => { const p = document.querySelector('[data-testid="arrangement-playhead"]'); return p ? { style: p.getAttribute('style'), x: Math.round(p.getBoundingClientRect().left * 10) / 10 } : null; });
    const r = { tempo: await page.inputValue('[data-testid="arrangement-tempo-input"]'), clock0: await clock(), ph0: await ph(), rmsIdle: await page.evaluate(() => window.__rms()) };
    await page.getByRole('button', { name: 'Play', exact: true }).first().click();
    const samples = [];
    for (let i = 0; i < 8; i += 1) { await sleep(250); samples.push(await page.evaluate(() => Math.max(0, ...window.__rms()))); }
    r.rmsPlaying = samples;
    r.clock1 = await clock(); r.ph1 = await ph();
    await page.getByRole('button', { name: 'Pause', exact: true }).first().click(); await sleep(500);
    r.rmsAfterPause = await page.evaluate(() => Math.max(0, ...window.__rms()));
    r.clock2 = await clock(); r.ph2 = await ph();
    r.taps = await page.evaluate(() => window.__taps.length);
    r.errors = errors;
    await page.screenshot({ path: path.join(outDir, `play-${key}.png`) });
    R[key] = r; await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(outDir, 'c234play.json'), JSON.stringify(R, null, 1));
  console.log(JSON.stringify(R, null, 1));
})();
