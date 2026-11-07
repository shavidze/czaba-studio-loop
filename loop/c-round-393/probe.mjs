import { open } from '../c-round-382/lib.mjs';
import fs from 'fs';
const [base, w, h] = [process.argv[2], +process.argv[3], +process.argv[4]];
const out = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-393';
const key = `${w}x${h}`;
const res = { vp: key, rows: {} };
const hook = () => {
  window.__dec = []; window.__media = []; window.__texts = []; window.__ended = []; window.__delayDecodes = 0;
  const proto = BaseAudioContext.prototype; const d = proto.decodeAudioData;
  proto.decodeAudioData = function (...a) { return d.apply(this, a).then((b) => { const f = () => { window.__dec.push(+b.duration.toFixed(2)); return b; }; if (window.__delayDecodes > 0) { window.__delayDecodes--; return new Promise((r) => setTimeout(() => r(f()), 1500)); } return f(); }); };
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { if (!window.__media.includes(this)) { window.__media.push(this); this.addEventListener('ended', () => window.__ended.push(performance.now())); } return play.call(this); };
  const el = document.querySelector('[data-testid="arrangement-status"]');
  window.__texts.push(el.textContent);
  new MutationObserver(() => { const t = el.textContent; if (window.__texts.at(-1) !== t) window.__texts.push(t); }).observe(el, { childList: true, characterData: true, subtree: true });
};
async function fresh(route) {
  const o = await open(base, w, h); o.errors = []; o.page.on('pageerror', (e) => o.errors.push(String(e.message)));
  if (route) await o.page.route('**/middle-east.mp3', (r) => r.request().resourceType() === 'media' ? r.abort() : r.continue());
  await o.page.waitForSelector('[data-testid="arrangement-status"]', { timeout: 30000 }); await o.page.evaluate(hook); return o;
}
const sel = (p, rx) => p.getByRole('listbox', { name: 'Sounds' }).getByRole('option', { name: rx }).first().click();
const tg = (p) => p.getByTestId('arrangement-library-preview-toggle');
const reset = (p) => p.evaluate(() => { window.__starts.length = 0; window.__dec.length = 0; window.__texts.length = 0; });
const media = (p) => p.evaluate(() => window.__media.map((m) => ({ src: m.getAttribute('src'), paused: m.paused, t: +m.currentTime.toFixed(2), net: m.networkState })));
const waitT = (p, v = 0.5) => p.waitForFunction((v) => window.__media[0] && window.__media[0].currentTime > v, v, { timeout: 15000 }).then(() => true).catch(() => false);
const playing = (p) => p.evaluate(() => document.querySelector('[data-playing]')?.getAttribute('data-playing'));
const rec = (k, v) => { res.rows[k] = v; fs.writeFileSync(`${out}/rows-${key}.json`, JSON.stringify(res, null, 1)); };

for (const [id, rx, src] of [['S1', /Middle East/, '/middle-east.mp3'], ['S3', /CZABA hero/, '/videos/hero/hero-music.mp3']]) {
  const o = await fresh(); const p = o.page; const before = await o.live();
  await sel(p, rx); await reset(p); const t0 = Date.now(); await tg(p).click(); const ok = await waitT(p); const dt = Date.now() - t0;
  const m = await media(p); const dec = await p.evaluate(() => window.__dec); const st = await p.evaluate(() => window.__starts.map((s) => s.sec)); const texts = await p.evaluate(() => window.__texts);
  const live = await o.live(); const label = await tg(p).textContent();
  await p.screenshot({ path: `${out}/${id}-${key}.png` });
  rec(id, { ok, dtMs: dt, media: m, dec, starts: st, texts, before, live, label, errors: o.errors });
  if (id === 'S1') {
    await tg(p).click(); await p.waitForTimeout(500);
    rec('S2', { media: await media(p), label: await tg(p).textContent() });
  }
  await o.browser.close();
}
{ // S4/S5
  const o = await fresh(); const p = o.page; await sel(p, /Middle East/); await reset(p); await tg(p).click(); await waitT(p);
  const wv = p.getByTestId('arrangement-library-preview-wave'); const bb = await wv.boundingBox();
  const same0 = await p.evaluate(() => { window.__m0 = window.__media[0]; return window.__media.length; });
  await p.mouse.click(bb.x + bb.width * 0.5, bb.y + bb.height / 2); await p.waitForTimeout(800);
  const after = await p.evaluate(() => ({ n: window.__media.length, same: window.__media[0] === window.__m0, paused: window.__media[0].paused, t: window.__media[0].currentTime, vn: document.querySelector('[data-testid="arrangement-library-preview-wave"]').getAttribute('aria-valuenow') }));
  rec('S4', { same0, after, dec: await p.evaluate(() => window.__dec) });
  // keyboard step
  await wv.focus(); const k0 = await p.evaluate(() => window.__media[0].currentTime); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(500);
  rec('NB-KEY', { before: k0, after: await p.evaluate(() => window.__media[0].currentTime), errors: o.errors });
  // S5
  const st0 = await p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]').textContent);
  const bb2 = await wv.boundingBox(); await p.mouse.click(bb2.x + bb2.width * 0.98, bb2.y + bb2.height / 2); const c0 = Date.now();
  await p.waitForFunction(() => window.__ended.length > 0, null, { timeout: 30000 }).catch(() => {});
  const s5 = await p.evaluate(() => ({ ended: window.__ended.length, n: window.__media.length, st: document.querySelector('[data-testid="arrangement-status"]').textContent }));
  await p.waitForTimeout(300);
  rec('S5', { ...s5, ms: Date.now() - c0, label: await tg(p).textContent(), statusBefore: st0, errors: o.errors });
  await o.browser.close();
}
{ // S6 S7
  const o = await fresh(); const p = o.page;
  await sel(p, /Full mix/); await p.keyboard.press('Enter'); await p.waitForTimeout(2500);
  await sel(p, /Middle East/); await tg(p).click(); await waitT(p);
  await p.keyboard.press('Space'); await p.waitForTimeout(800);
  rec('S6', { playing: await playing(p), media: await media(p), label: await tg(p).textContent(), errors: o.errors });
  await p.keyboard.press('Space'); await p.waitForTimeout(500); const pl1 = await playing(p);
  await tg(p).click(); await p.waitForTimeout(1500);
  rec('S7', { playingBefore: pl1, playingAfter: await playing(p), media: await media(p), errors: o.errors });
  await o.browser.close();
}
{ // S8
  const o = await fresh(); const p = o.page; await sel(p, /Middle East/); await tg(p).click(); await waitT(p);
  await p.evaluate(() => { window.__m0 = window.__media[0]; });
  await p.getByTestId('arrangement-exit').click(); await p.waitForTimeout(1500);
  const a = await p.evaluate(() => ({ src: window.__m0.getAttribute('src'), paused: window.__m0.paused, t: window.__m0.currentTime, url: location.pathname }));
  await p.waitForTimeout(1000); const t2 = await p.evaluate(() => window.__m0.currentTime);
  rec('S8', { ...a, t2, errors: o.errors }); await o.browser.close();
}
{ // S9
  const o = await fresh(true); const p = o.page; await sel(p, /Middle East/); await reset(p);
  await tg(p).click(); await p.waitForFunction(() => window.__starts.some((s) => s.sec > 100), null, { timeout: 25000 }).catch(() => {}); await p.waitForTimeout(300);
  const f = await p.evaluate(() => ({ dec: window.__dec, starts: window.__starts.map((s) => s.sec), texts: window.__texts }));
  const l1 = await tg(p).textContent(); await tg(p).click(); await p.waitForTimeout(300);
  const nm = await p.evaluate(() => window.__media.length); await reset(p);
  await tg(p).click(); await p.waitForFunction(() => window.__starts.some((s) => s.sec > 100), null, { timeout: 25000 }).catch(() => {});
  const g = await p.evaluate(() => ({ dec: window.__dec, starts: window.__starts.map((s) => s.sec), texts: window.__texts }));
  rec('S9', { first: f, labelFirst: l1, mediaCountAfterStop: nm, second: g, mediaCountAfterSecond: await p.evaluate(() => window.__media.length), errors: o.errors }); await o.browser.close();
}
{ // S11
  const o = await fresh(true); const p = o.page; await sel(p, /Middle East/); await reset(p); await p.evaluate(() => { window.__delayDecodes = 1; });
  await tg(p).click(); await p.waitForTimeout(300);
  await sel(p, /Full mix/); await tg(p).click(); await p.waitForTimeout(4500);
  rec('S11', { texts: await p.evaluate(() => window.__texts), starts: await p.evaluate(() => window.__starts.map((s) => s.sec)), final: await p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]').textContent), errors: o.errors }); await o.browser.close();
}
{ // S10 + add-after-stream
  const o = await fresh(); const p = o.page; await sel(p, /Full mix/); await reset(p); await tg(p).click(); await p.waitForTimeout(1500);
  rec('S10', { starts: await p.evaluate(() => window.__starts.map((s) => s.sec)), media: await p.evaluate(() => window.__media.length), dec: await p.evaluate(() => window.__dec) });
  await o.browser.close();
  const o2 = await fresh(); const q = o2.page; await sel(q, /Middle East/); await tg(q).click(); await waitT(q); await tg(q).click(); await q.waitForTimeout(300); await reset(q);
  await q.keyboard.press('Enter'); await q.getByRole('listbox', { name: 'Sounds' }).getByRole('option', { name: /Middle East/ }).first().focus().catch(() => {}); await q.keyboard.press('Enter'); await q.waitForTimeout(4000);
  rec('NB-ADD', { dec: await q.evaluate(() => window.__dec), texts: await q.evaluate(() => window.__texts), clips: await q.locator('[data-testid^="arrangement-clip"]').count(), errors: o2.errors });
  await q.screenshot({ path: `${out}/add-${key}.png` }); await o2.browser.close();
}
console.log('done', key);
