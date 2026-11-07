import { open } from '../../c-round-382/lib.mjs';
import fs from 'fs';
const base = process.argv[2] ?? 'http://127.0.0.1:5174';
const out = '/home/runner/czaba-project/tmp/studio-real-loop/b-round-392';
const res = { base, rows: {} };
const hook = () => {
  window.__dec = []; window.__media = []; window.__texts = [];
  const proto = BaseAudioContext.prototype; const d = proto.decodeAudioData;
  proto.decodeAudioData = function (...a) { return d.apply(this, a).then((b) => { window.__dec.push(+b.duration.toFixed(2)); return b; }); };
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { window.__media.push(this); return play.call(this); };
  const el = document.querySelector('[data-testid="arrangement-status"]');
  window.__texts.push(el.textContent);
  new MutationObserver(() => { const t = el.textContent; if (window.__texts.at(-1) !== t) window.__texts.push(t); }).observe(el, { childList: true, characterData: true, subtree: true });
};
const sel = (p, rx) => p.getByRole('listbox', { name: 'Sounds' }).getByRole('option', { name: rx }).first().click();
const toggle = (p) => p.getByTestId('arrangement-library-preview-toggle');
for (const vp of [[1440, 900], [1280, 720]]) {
  const key = vp.join('x');
  {
    const o = await open(base, vp[0], vp[1]); const p = o.page;
    await p.evaluate(hook);
    const before = await o.live();
    await sel(p, /Middle East/);
    await p.evaluate(() => { window.__starts.length = 0; window.__dec.length = 0; window.__t0 = performance.now(); });
    await toggle(p).click();
    await p.waitForFunction(() => window.__media.length > 0 && window.__media[0].currentTime > 0.5, null, { timeout: 15000 }).catch(() => {});
    const mid = await p.evaluate(() => ({ media: window.__media.map((m) => ({ src: m.getAttribute('src'), paused: m.paused, t: +m.currentTime.toFixed(2), ready: m.readyState })), dec: window.__dec, starts: window.__starts.map((s) => s.sec), texts: window.__texts }));
    mid.toggleLabel = await toggle(p).textContent();
    mid.live = await o.live();
    mid.liveBefore = before;
    await p.screenshot({ path: `${out}/sketch-stream-${key}.png` });
    await toggle(p).click(); await p.waitForTimeout(400);
    mid.afterStop = await p.evaluate(() => window.__media.map((m) => ({ src: m.getAttribute('src'), paused: m.paused, net: m.networkState })));
    mid.toggleAfter = await toggle(p).textContent();
    res.rows[`STREAM-${key}`] = mid;
    await o.browser.close();
  }
  {
    const o = await open(base, vp[0], vp[1]); const p = o.page;
    await p.route('**/middle-east.mp3', (route) => route.request().resourceType() === 'media' ? route.abort() : route.continue());
    await p.evaluate(hook);
    await sel(p, /Middle East/);
    await p.evaluate(() => { window.__starts.length = 0; window.__dec.length = 0; window.__texts.length = 0; });
    await toggle(p).click();
    await p.waitForFunction(() => window.__starts.some((s) => s.sec > 100), null, { timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(300);
    res.rows[`FALLBACK-${key}`] = await p.evaluate(() => ({ media: window.__media.length, dec: window.__dec, starts: window.__starts.map((s) => s.sec), texts: window.__texts }));
    res.rows[`FALLBACK-${key}`].toggleLabel = await toggle(p).textContent();
    await o.browser.close();
  }
}
fs.writeFileSync(`${out}/sketch-browser.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1).slice(0, 4000));
