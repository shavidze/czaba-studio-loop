import { open } from '../../c-round-382/lib.mjs';
import fs from 'fs';
const base = 'http://127.0.0.1:5174';
const only = process.argv[2]; const vps = (process.argv[3] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/b-round-395/probe';
const EV = ['play', 'playing', 'pause', 'ended', 'error', 'waiting', 'stalled', 'seeking', 'seeked', 'emptied', 'abort', 'loadstart', 'canplay', 'progress'];
const hook = (EV) => {
  window.__dec = []; window.__media = []; window.__ev = []; window.__texts = [];
  const d = BaseAudioContext.prototype.decodeAudioData;
  BaseAudioContext.prototype.decodeAudioData = function (...a) { return d.apply(this, a).then((b) => { window.__dec.push(+b.duration.toFixed(2)); return b; }); };
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (!window.__media.includes(this)) { const i = window.__media.push(this) - 1;
      for (const e of EV) this.addEventListener(e, () => window.__ev.push([i, e, +performance.now().toFixed(0), +this.currentTime.toFixed(2)])); }
    window.__ev.push([window.__media.indexOf(this), 'play()call', +performance.now().toFixed(0)]);
    return play.call(this); };
  const el = document.querySelector('[data-testid="arrangement-status"]'); window.__texts.push(el.textContent);
  new MutationObserver(() => { const t = el.textContent; if (window.__texts.at(-1) !== t) window.__texts.push(t); }).observe(el, { childList: true, characterData: true, subtree: true });
};
const sel = (p, rx) => p.getByRole('listbox', { name: 'Sounds' }).getByRole('option', { name: rx }).first().click();
const toggle = (p) => p.getByTestId('arrangement-library-preview-toggle');
const snap = (p) => p.evaluate(() => ({ media: window.__media.map((m) => ({ src: m.getAttribute('src'), paused: m.paused, t: +m.currentTime.toFixed(2), net: m.networkState })), dec: window.__dec, starts: window.__starts.map((s) => s.sec), texts: window.__texts, ev: window.__ev.filter(e=>e[1]!=='progress') }));
const hold = (p, reqs) => p.route('**/middle-east.mp3', (route) => { reqs?.push({ t: Date.now(), type: route.request().resourceType() }); if (route.request().resourceType() !== 'media') return route.continue(); });
const wait100 = (p, ms) => p.waitForFunction(() => window.__starts.some((s) => s.sec > 100), null, { timeout: ms }).then(() => true, () => false);
const rows = {
  async R1(o, p) { const reqs = []; await hold(p, reqs); await p.evaluate(hook, EV); await sel(p, /Middle East/);
    const before = await o.live(); await p.evaluate(() => { window.__starts.length = 0; window.__dec.length = 0; window.__t0 = performance.now(); });
    const tc = Date.now(); await toggle(p).click(); const ok = await wait100(p, 15000); const tfb = Date.now(); await p.waitForTimeout(1500);
    const r = await snap(p); r.ok = ok; r.ms = tfb - tc; r.toggle = await toggle(p).textContent(); r.liveBefore = before; r.liveAfter = await o.live();
    r.reqsAfterClick = reqs.filter((q) => q.t >= tc).map((q) => q.type); r.reqsAfterFb = reqs.filter((q) => q.t > tfb).length; return r; },
  async R1b_seekBeforePlaying(o, p) { await hold(p); await p.evaluate(hook, EV); await sel(p, /Middle East/);
    await p.evaluate(() => { window.__starts.length = 0; window.__dec.length = 0; });
    const tc = Date.now(); await toggle(p).click(); await p.waitForTimeout(3500);
    const wave = p.getByTestId('arrangement-library-preview-wave'); const bb = await wave.boundingBox();
    await p.mouse.click(bb.x + bb.width * 0.05, bb.y + bb.height / 2); const tw = Date.now(); const t1 = await p.evaluate(() => window.__media[0]?.currentTime);
    const ok = await wait100(p, 20000); const r = await snap(p); r.ok = ok; r.ms = Date.now() - tc; r.msAfterSeek = Date.now() - tw; r.timeAfterSeek = t1; r.toggle = await toggle(p).textContent(); return r; },
  async R2(o, p) { await p.evaluate(hook, EV); await sel(p, /Middle East/); await p.evaluate(() => { window.__starts.length = 0; window.__dec.length = 0; });
    await toggle(p).click(); await p.waitForFunction(() => window.__media[0] && window.__media[0].currentTime > 1, null, { timeout: 30000 });
    const t0 = await p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]').textContent);
    await p.evaluate(() => window.__media[0].pause()); await p.waitForTimeout(1500);
    const r = await snap(p); r.toggle = await toggle(p).textContent(); r.statusBefore = t0; r.statusAfter = await p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]').textContent); r.hasSrc = await p.evaluate(() => window.__media[0].hasAttribute('src')); return r; },
  async R3(o, p) { await p.evaluate(hook, EV); await sel(p, /Middle East/); const before = await o.live(); await p.evaluate(() => { window.__starts.length = 0; window.__dec.length = 0; });
    await toggle(p).click(); await p.waitForTimeout(10000); const s0 = await p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]').textContent);
    const wave = p.getByTestId('arrangement-library-preview-wave'); const bb = await wave.boundingBox();
    await p.mouse.click(bb.x + bb.width * 0.05, bb.y + bb.height / 2); const tw = Date.now(); const t1 = await p.evaluate(() => window.__media[0]?.currentTime); await p.waitForTimeout(10000);
    const r = await snap(p); r.toggle = await toggle(p).textContent(); r.liveBefore = before; r.liveAfter = await o.live(); r.status0 = s0; return r; },
  async R4(o, p) { await p.evaluate(hook, EV); await sel(p, /Middle East/); const wave = p.getByTestId('arrangement-library-preview-wave'); const bb = await wave.boundingBox();
    await p.mouse.click(bb.x + bb.width * 0.98, bb.y + bb.height / 2); if ((await toggle(p).textContent()).includes('Preview')) await toggle(p).click();
    await p.waitForFunction(() => window.__ev.some((e) => e[1] === 'ended'), null, { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(800);
    const r = await snap(p); r.toggle = await toggle(p).textContent(); return r; },
  async R5(o, p) { await p.route('**/middle-east.mp3', (route) => route.request().resourceType() === 'media' ? route.abort() : route.continue());
    await p.evaluate(hook, EV); await sel(p, /Middle East/); await p.evaluate(() => { window.__starts.length = 0; window.__dec.length = 0; });
    await toggle(p).click(); const ok = await wait100(p, 20000); await p.waitForTimeout(300); const r = await snap(p); r.ok = ok; r.toggle = await toggle(p).textContent();
    await toggle(p).click(); await p.waitForTimeout(500); await toggle(p).click(); await p.waitForTimeout(1500); const r2 = await snap(p); r.after2 = { media: r2.media.length, dec: r2.dec, starts: r2.starts }; r.toggle2 = await toggle(p).textContent(); return r; },
  async R6(o, p) { await p.evaluate(hook, EV); await sel(p, /Middle East/); await p.evaluate(() => { window.__starts.length = 0; window.__dec.length = 0; });
    await toggle(p).click(); await p.waitForTimeout(3000); await toggle(p).click(); await p.waitForTimeout(300); const a = await snap(p); a.toggle = await toggle(p).textContent();
    await p.waitForTimeout(20000); const r = await snap(p); r.toggleAfter = await toggle(p).textContent(); r.atStop = { media: a.media, toggle: a.toggle }; return r; },
  async R8_crossOrigin(o, p) { await p.evaluate(hook, EV); await sel(p, /Middle East/); await p.evaluate(() => { window.__starts.length = 0; window.__dec.length = 0; }); await toggle(p).click(); await p.waitForTimeout(4000);
    const r = await snap(p); r.crossOrigin = await p.evaluate(() => window.__media[0]?.crossOrigin ?? null); r.toggle = await toggle(p).textContent(); return r; },
  async R7(o, p) { await p.evaluate(hook, EV); await sel(p, /Full mix/); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
    await sel(p, /Middle East/); await p.evaluate(() => { window.__starts.length = 0; window.__dec.length = 0; });
    await toggle(p).click(); await p.waitForTimeout(3000); const pre = await toggle(p).textContent();
    await p.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {}); await p.keyboard.press('Space'); await p.waitForTimeout(1500);
    const r = await snap(p); r.preToggle = pre; r.toggle = await toggle(p).textContent();
    r.dataPlaying = await p.evaluate(() => [...document.querySelectorAll('[data-playing]')].map((e) => e.getAttribute('data-playing')));
    await p.waitForTimeout(20000); const r2 = await snap(p); r.dec20 = r2.dec; r.starts20 = r2.starts; return r; },
};
const out = {}; const prog = `${OUT}/progress.json`;
for (const [w, h] of vps) for (const [id, fn] of Object.entries(rows)) {
  if (only && only !== 'all' && !id.startsWith(only)) continue;
  const o = await open(base, w, h);
  try { out[`${id}-${w}x${h}`] = await fn(o, o.page); if (id === 'R1' ) await o.page.screenshot({ path: `${OUT}/${id}-${w}x${h}.png` }); }
  catch (e) { out[`${id}-${w}x${h}`] = { error: String(e).slice(0, 400) }; }
  await o.browser.close();
  fs.writeFileSync(`${OUT}/rows-${only ?? 'all'}.json`, JSON.stringify(out, null, 1));
  fs.writeFileSync(prog, JSON.stringify({ last: `${id}-${w}x${h}`, done: Object.keys(out) }));
  console.log(id, w, JSON.stringify(out[`${id}-${w}x${h}`]).slice(0, 900));
}
