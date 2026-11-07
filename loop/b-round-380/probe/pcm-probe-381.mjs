import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3];
const fs = await import('node:fs');
const install = () => {
  const refs = [];
  const track = (buffer, origin) => { try { refs.push({ ref: new WeakRef(buffer), origin }); } catch {} return buffer; };
  const proto = BaseAudioContext.prototype;
  const decode = proto.decodeAudioData;
  proto.decodeAudioData = function (...args) { return decode.apply(this, args).then((b) => track(b, 'decode')); };
  const create = proto.createBuffer;
  proto.createBuffer = function (...args) { return track(create.apply(this, args), 'createBuffer'); };
  const Native = window.AudioBuffer;
  window.AudioBuffer = class extends Native { constructor(o) { super(o); track(this, 'ctor'); } };
  const render = OfflineAudioContext.prototype.startRendering;
  OfflineAudioContext.prototype.startRendering = function () { return render.call(this).then((b) => track(b, 'render')); };
  window.__pcm = () => {
    const live = refs.map((r) => ({ b: r.ref.deref(), origin: r.origin })).filter((x) => x.b);
    const byOrigin = {};
    let bytes = 0;
    for (const { b, origin } of live) { const n = b.length * b.numberOfChannels * 4; bytes += n; byOrigin[origin] = (byOrigin[origin] ?? 0) + n; }
    return { created: refs.length, live: live.length, mib: +(bytes / 1048576).toFixed(2), byOrigin: Object.fromEntries(Object.entries(byOrigin).map(([k, v]) => [k, +(v / 1048576).toFixed(2)])) };
  };
};
const browser = await chromium.launch();
const results = [];
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  for (let pass = 0; pass < 3; pass++) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
    await ctx.addInitScript(install);
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
    await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const gc = async () => { await cdp.send('HeapProfiler.collectGarbage'); await page.waitForTimeout(100); await cdp.send('HeapProfiler.collectGarbage'); };
    await gc();
    const ready = await page.evaluate(() => window.__pcm());
    const status = await page.locator('[role=status]').first().textContent().catch(() => null);
    results.push({ viewport: `${w}x${h}`, pass, ready, status });
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(out, JSON.stringify(results, null, 1));
console.log(JSON.stringify(results));
