import { open } from '../../c-round-382/lib.mjs';
import fs from 'fs';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const outFile = process.argv[3] ?? '/home/runner/czaba-project/tmp/studio-real-loop/b-round-393/premise/events-head.json';
const vps = (process.argv[4] ?? '1440x900').split(',').map((s) => s.split('x').map(Number));
const EV = ['play', 'playing', 'pause', 'ended', 'error', 'waiting', 'stalled', 'seeking', 'seeked', 'emptied', 'abort', 'loadstart', 'canplay'];
const hook = (EV) => {
  window.__dec = []; window.__media = []; window.__ev = []; window.__texts = [];
  const proto = BaseAudioContext.prototype; const d = proto.decodeAudioData;
  proto.decodeAudioData = function (...a) { return d.apply(this, a).then((b) => { window.__dec.push(+b.duration.toFixed(2)); return b; }); };
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (!window.__media.includes(this)) {
      const i = window.__media.push(this) - 1;
      for (const e of EV) this.addEventListener(e, () => window.__ev.push([i, e, +performance.now().toFixed(0), +this.currentTime.toFixed(2), this.error ? this.error.code : null]));
    }
    window.__ev.push([window.__media.indexOf(this), 'play()call', +performance.now().toFixed(0)]);
    return play.call(this);
  };
  const el = document.querySelector('[data-testid="arrangement-status"]');
  window.__texts.push(el.textContent);
  new MutationObserver(() => { const t = el.textContent; if (window.__texts.at(-1) !== t) window.__texts.push(t); }).observe(el, { childList: true, characterData: true, subtree: true });
};
const sel = (p, rx) => p.getByRole('listbox', { name: 'Sounds' }).getByRole('option', { name: rx }).first().click();
const toggle = (p) => p.getByTestId('arrangement-library-preview-toggle');
const snap = (p) => p.evaluate(() => ({ media: window.__media.map((m) => ({ src: m.getAttribute('src'), paused: m.paused, t: +m.currentTime.toFixed(2), net: m.networkState, ready: m.readyState })), ev: window.__ev, dec: window.__dec, starts: window.__starts.map((s) => s.sec), texts: window.__texts }));
const res = { base, at: new Date().toISOString(), rows: {} };
for (const [w, h] of vps) {
  const k = `${w}x${h}`;
  { // NORMAL 20 s + seek within buffered at 10 s + console pause at 20 s
    const o = await open(base, w, h); const p = o.page; await p.evaluate(hook, EV);
    const before = await o.live();
    await sel(p, /Middle East/); await p.evaluate(() => { window.__starts.length = 0; window.__dec.length = 0; });
    await toggle(p).click(); await p.waitForTimeout(10000);
    const wave = p.getByTestId('arrangement-library-preview-wave'); const bb = await wave.boundingBox();
    await p.mouse.click(bb.x + bb.width * 0.05, bb.y + bb.height / 2);
    await p.waitForTimeout(10000);
    const r = await snap(p); r.toggleAt20 = await toggle(p).textContent(); r.liveBefore = before; r.liveAt20 = await o.live();
    await p.evaluate(() => window.__media[0].pause()); await p.waitForTimeout(1500);
    r.afterConsolePause = await snap(p); r.toggleAfterConsolePause = await toggle(p).textContent();
    res.rows[`NORMAL-SEEK-PAUSE-${k}`] = r; await o.browser.close();
  }
  { // END
    const o = await open(base, w, h); const p = o.page; await p.evaluate(hook, EV);
    await sel(p, /Middle East/);
    const wave = p.getByTestId('arrangement-library-preview-wave'); const bb = await wave.boundingBox();
    await p.mouse.click(bb.x + bb.width * 0.98, bb.y + bb.height / 2);
    if ((await toggle(p).textContent()).includes('Preview')) await toggle(p).click();
    await p.waitForFunction(() => window.__ev.some((e) => e[1] === 'ended'), null, { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(500);
    const r = await snap(p); r.toggle = await toggle(p).textContent(); res.rows[`END-${k}`] = r; await o.browser.close();
  }
  { // ABORT
    const o = await open(base, w, h); const p = o.page;
    await p.route('**/middle-east.mp3', (route) => route.request().resourceType() === 'media' ? route.abort() : route.continue());
    await p.evaluate(hook, EV); await sel(p, /Middle East/); await p.evaluate(() => { window.__starts.length = 0; window.__dec.length = 0; });
    await toggle(p).click();
    await p.waitForFunction(() => window.__starts.some((s) => s.sec > 100), null, { timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(300);
    const r = await snap(p); r.toggle = await toggle(p).textContent(); res.rows[`ABORT-${k}`] = r; await o.browser.close();
  }
  { // HOLD (never fulfil media) 14 s
    const o = await open(base, w, h); const p = o.page;
    await p.route('**/middle-east.mp3', (route) => { if (route.request().resourceType() !== 'media') return route.continue(); });
    await p.evaluate(hook, EV); await sel(p, /Middle East/); await p.evaluate(() => { window.__starts.length = 0; window.__dec.length = 0; window.__t0 = performance.now(); });
    await toggle(p).click();
    await p.waitForFunction(() => window.__starts.some((s) => s.sec > 100), null, { timeout: 14000 }).catch(() => {});
    const r = await snap(p); r.toggle = await toggle(p).textContent(); r.t0 = await p.evaluate(() => window.__t0); r.fallbackAt = await p.evaluate(() => { const s = window.__starts.find((x) => x.sec > 100); return s ? +(s.t - window.__t0).toFixed(0) : null; });
    if (process.argv[5] === 'shots') await p.screenshot({ path: outFile.replace('.json', `-hold-${k}.png`) });
    res.rows[`HOLD-${k}`] = r; await o.browser.close();
  }
}
fs.writeFileSync(outFile, JSON.stringify(res, null, 1));
for (const [id, r] of Object.entries(res.rows)) console.log(id, JSON.stringify({ toggle: r.toggle ?? r.toggleAt20, media: r.media, dec: r.dec, starts: r.starts, ev: r.ev.map((e) => e.slice(0, 2).concat(e.slice(3))), texts: r.texts.slice(-3), fb: r.fallbackAt, after: r.toggleAfterConsolePause }).slice(0, 1800));
