import { open } from '../../c-round-382/lib.mjs';
import fs from 'fs';
const base = process.argv[2]; const outFile = process.argv[3];
const res = { base, at: new Date().toISOString(), rows: {} };
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const o = await open(base, w, h); const p = o.page;
  const reqs = [];
  p.on('request', (r) => { if (r.url().includes('middle-east.mp3')) reqs.push({ t: Date.now(), type: r.resourceType() }); });
  await p.route('**/middle-east.mp3', (route) => { if (route.request().resourceType() !== 'media') return route.continue(); });
  await p.evaluate(() => { window.__dec = []; const proto = BaseAudioContext.prototype; const d = proto.decodeAudioData; proto.decodeAudioData = function (...a) { return d.apply(this, a).then((b) => { window.__dec.push(+b.duration.toFixed(2)); return b; }); }; });
  await p.getByRole('listbox', { name: 'Sounds' }).getByRole('option', { name: /Middle East/ }).first().click();
  const before = await o.live();
  await p.evaluate(() => { window.__starts.length = 0; window.__t0 = performance.now(); });
  const tClick = Date.now();
  await p.getByTestId('arrangement-library-preview-toggle').click();
  await p.waitForFunction(() => window.__starts.some((s) => s.sec > 100), null, { timeout: 15000 }).catch(() => {});
  const tFb = Date.now();
  await p.waitForTimeout(2000);
  const after = await o.live();
  const r = { liveBefore: before, liveAfter: after, dec: await p.evaluate(() => window.__dec), starts: await p.evaluate(() => window.__starts.map((s) => s.sec)), fallbackMs: tFb - tClick, reqsAfterClick: reqs.filter((q) => q.t >= tClick).map((q) => ({ dt: q.t - tClick, type: q.type })), reqsAfterFallback: reqs.filter((q) => q.t > tFb).map((q) => q.type), toggle: await p.getByTestId('arrangement-library-preview-toggle').textContent() };
  res.rows[`HOLD-${w}x${h}`] = r; await o.browser.close();
}
fs.writeFileSync(outFile, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res.rows));
