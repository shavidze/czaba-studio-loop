import { open } from '../../c-round-382/lib.mjs';
import fs from 'fs';
const out = '/home/runner/czaba-project/tmp/studio-real-loop/b-round-392/premise';
const res = {};
for (const [name, rx] of [['middle-east', /Middle East/], ['hero', /CZABA hero/], ['full-mix', /Full mix/]]) {
  const o = await open('http://127.0.0.1:5173', 1440, 900); const p = o.page;
  await p.evaluate(() => {
    window.__dec = []; window.__lt = [];
    const proto = BaseAudioContext.prototype; const d = proto.decodeAudioData;
    proto.decodeAudioData = function (...a) { const t0 = performance.now(); const bytes = a[0]?.byteLength; return d.apply(this, a).then((b) => { window.__dec.push({ ms: +(performance.now() - t0).toFixed(1), inBytes: bytes, sec: +b.duration.toFixed(2), pcmMiB: +(b.length * b.numberOfChannels * 4 / 1048576).toFixed(1) }); return b; }); };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push(+e.duration.toFixed(0)); }).observe({ type: 'longtask' });
  });
  const before = await o.live();
  await p.getByRole('listbox', { name: 'Sounds' }).getByRole('option', { name: rx }).first().click();
  await p.evaluate(() => { window.__starts.length = 0; window.__lt.length = 0; window.__t0 = performance.now(); });
  await p.getByRole('button', { name: 'Preview', exact: true }).first().click();
  await p.waitForFunction(() => window.__starts.length > 0, null, { timeout: 20000 }).catch(() => {});
  const r = await p.evaluate(() => ({ firstSoundMs: window.__starts[0] ? +(window.__starts[0].t - window.__t0).toFixed(0) : null, starts: window.__starts.map((s) => s.sec), dec: window.__dec, longtasks: window.__lt, status: document.querySelector('[data-testid="arrangement-status"]').textContent }));
  const during = await o.live();
  r.liveBefore = before; r.liveDuring = during;
  res[name] = r;
  await o.browser.close();
}
fs.writeFileSync(out + '/premise-head.json', JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
