// usage: node m2-flow.mjs <base> <out.json> [width height]
// Two clips start at 0; the 2nd AudioBufferSourceNode.start of a Play throws (armed for two Play presses).
import fs from 'fs';
import { open } from '/home/runner/czaba-project/tmp/studio-real-loop/c-round-382/lib.mjs';
const [base, outPath, w = '1440', h = '900'] = process.argv.slice(2);
const { browser, page } = await open(base, +w, +h);
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message || e)));
await page.evaluate(() => {
  window.__arm = 0;
  window.__count = 0;
  window.__thrown = 0;
  window.__nodes = [];
  const st = AudioBufferSourceNode.prototype.start;
  const sp = AudioBufferSourceNode.prototype.stop;
  AudioBufferSourceNode.prototype.start = function (...a) {
    if (this.context.constructor.name !== 'AudioContext') {
      return st.apply(this, a);
    }
    if (window.__arm > 0) {
      window.__count += 1;
      if (window.__count === window.__arm) {
        window.__thrown += 1;
        window.__arm = 0;
        window.__count = 0;
        throw new Error('injected partial schedule failure');
      }
    }
    const r = st.apply(this, a);
    const rec = { started: true, stopCalls: 0, sec: this.buffer ? +this.buffer.duration.toFixed(2) : null };
    this.__rec = rec;
    window.__nodes.push(rec);
    return r;
  };
  AudioBufferSourceNode.prototype.stop = function (...a) {
    if (this.__rec) {
      this.__rec.stopCalls += 1;
    }
    return sp.apply(this, a);
  };
});
const list = page.getByRole('listbox', { name: 'Sounds' });
const names = await list.getByRole('option').allInnerTexts();
const add = async (re) => {
  await list.getByRole('option', { name: re }).first().click();
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  await page.waitForTimeout(900);
};
const clock = () => page.evaluate(() => (document.body.innerText.match(/\d\d:\d\d\.\d\d\d/) || [''])[0]);
const status = () => page.evaluate(() => {
  const t = document.body.innerText;
  return {
    playingFrom: /Playing from \d\d:\d\d\.\d\d\d/.test(t),
    scheduleFailed: t.includes('Playback stopped — the audio could not be scheduled'),
  };
});
const leaked = () => page.evaluate(() => window.__nodes.filter((n) => n.started && n.stopCalls === 0).length);
const stopBtn = page.locator('button[aria-label="Stop"]').first();
const r = { base, vp: `${w}x${h}` };
await add(/Full mix/);
await add(/Full mix/);
r.clipCount = await page.locator('[data-clip-id]').count();
const snap = async (key) => {
  const a = await clock(); await page.waitForTimeout(700); const b = await clock();
  r[key] = { thrown: await page.evaluate(() => window.__thrown), errors: [...errors], leaked: await leaked(), status: await status(), clock: [a, b], clips: await page.locator('[data-clip-id]').count() };
};
await page.evaluate(() => { window.__arm = 2; });
await page.locator('button[aria-label="Play"]').first().click();
await page.waitForTimeout(600);
await snap('play1');
await page.screenshot({ path: outPath.replace(/\.json$/, '-play1.png') });
await page.evaluate(() => { window.__arm = 1; });
await page.locator('button[aria-label="Play"]').first().click();
await page.waitForTimeout(600);
await snap('play2');
await page.evaluate(() => { window.__arm = 0; });
await page.locator('button[aria-label="Play"]').first().click();
await page.waitForTimeout(600);
await snap('play3');
await page.evaluate(() => { window.__arm = 1; });
await add(/Pulse/);
await snap('commit');
await page.screenshot({ path: outPath.replace(/\.json$/, '-commit.png') });
await stopBtn.click().catch(() => {});
await page.waitForTimeout(500);
r.afterStop = { leaked: await leaked(), errors: [...errors] };
fs.writeFileSync(outPath, JSON.stringify(r, null, 1));
console.log(JSON.stringify(r));
await browser.close();
