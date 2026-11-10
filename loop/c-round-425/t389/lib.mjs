import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
export const install = () => {
  const refs = []; window.__starts = [];
  const track = (buffer, origin) => { try { refs.push({ ref: new WeakRef(buffer), origin }); } catch {} return buffer; };
  const proto = BaseAudioContext.prototype;
  const decode = proto.decodeAudioData;
  proto.decodeAudioData = function (...a) { return decode.apply(this, a).then((b) => track(b, 'decode')); };
  const create = proto.createBuffer;
  proto.createBuffer = function (...a) { return track(create.apply(this, a), 'createBuffer'); };
  const Native = window.AudioBuffer;
  window.AudioBuffer = class extends Native { constructor(o) { super(o); track(this, 'ctor'); } };
  const render = OfflineAudioContext.prototype.startRendering;
  OfflineAudioContext.prototype.startRendering = function () { return render.call(this).then((b) => track(b, 'render')); };
  const st = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...a) { window.__starts.push({ sec: this.buffer ? +this.buffer.duration.toFixed(2) : null, t: performance.now(), ctx: this.context.constructor.name }); return st.apply(this, a); };
  window.__detail = () => refs.map((r) => r.ref.deref()).filter(Boolean).map((b) => +b.duration.toFixed(2));
};
export async function open(base, w, h, opts = {}) {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  await ctx.addInitScript(install);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.getByRole('listbox', { name: 'Sounds' }).getByRole('option').first().waitFor({ timeout: 60000 });
  await page.waitForFunction(() => !/Loading/.test(document.querySelector('[role=listbox]')?.textContent ?? ''), null, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const gc = async () => { await cdp.send('HeapProfiler.collectGarbage'); await page.waitForTimeout(150); await cdp.send('HeapProfiler.collectGarbage'); await page.waitForTimeout(150); };
  const live = async () => { await gc(); return page.evaluate(() => window.__detail().sort((a, b) => a - b)); };
  return { browser, ctx, page, cdp, gc, live };
}
export const has = (arr, s) => arr.some((x) => Math.abs(x - s) < 0.02);
