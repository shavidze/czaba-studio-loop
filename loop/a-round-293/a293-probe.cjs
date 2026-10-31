// A round 293 self-check (not acceptance): library preview stops on narrow. Method copied from c-round-292/c292.cjs.
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const URL = 'http://127.0.0.1:5173/studio-lab';
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-293';
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
const rms = (page) => page.evaluate(() => +Math.max(0, ...(window.__rms ? window.__rms() : [0])).toFixed(5));
(async () => {
  const b = await chromium.launch();
  const warm = await b.newPage(); await warm.goto(URL); await sleep(3000); await warm.close();
  const out = {};
  for (const [w, h, nw] of [[1440, 900, 899], [1280, 720, 899], [1440, 900, 390]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(INIT);
    const page = await ctx.newPage();
    await page.goto(URL);
    await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 25000 });
    await sleep(800);
    await page.getByRole('option', { name: /Bass/ }).first().click(); await sleep(500);
    const region = page.getByRole('region', { name: 'Preview', exact: true });
    await region.getByRole('button', { name: 'Preview', exact: true }).click(); await sleep(1200);
    const playingRms = await rms(page);
    const t = Date.now();
    await page.setViewportSize({ width: nw, height: h });
    const samples = [];
    for (const at of [300, 1000, 5000, 10000]) { const d = at - (Date.now() - t); if (d > 0) await sleep(d); samples.push({ at: Date.now() - t, rms: await rms(page) }); }
    await page.screenshot({ path: `${OUT}/shots/preview-${w}-to-${nw}-narrow.png` });
    await page.setViewportSize({ width: w, height: h }); await sleep(700);
    const backLabel = await region.getByRole('button', { name: /^(Preview|Stop)$/ }).first().textContent().catch(() => null);
    const selected = await page.getByRole('option', { name: /Bass/ }).first().getAttribute('aria-selected').catch(() => null);
    await page.screenshot({ path: `${OUT}/shots/preview-${w}-to-${nw}-wide-again.png` });
    let replayRms = null;
    if (backLabel && backLabel.trim() === 'Preview') {
      await region.getByRole('button', { name: 'Preview', exact: true }).click(); await sleep(1200);
      replayRms = await rms(page);
    }
    out[`${w}->${nw}`] = { playingRms, samples, backLabel: backLabel && backLabel.trim(), bassSelectedAfter: selected, replayRms,
      pass: playingRms > 0.001 && samples.every((s) => s.rms === 0) && backLabel && backLabel.trim() === 'Preview' && replayRms > 0.001 };
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync(`${OUT}/a293-probe.json`, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})();
