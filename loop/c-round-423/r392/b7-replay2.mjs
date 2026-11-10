import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-423/r392'; const res = {};
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); await ctx.addInitScript(() => {
    localStorage.setItem('czaba_analytics_consent', 'denied'); window.__ev = []; const t0 = performance.now(); let id = 0;
    const AC = window.AudioContext; const oc = AC.prototype.createBufferSource;
    AC.prototype.createBufferSource = function () { const s = oc.call(this); const n = ++id; const st = s.start.bind(s); s.start = (...a) => { window.__ev.push({ t: Math.round(performance.now() - t0), e: 'start', n, dur: +(s.buffer?.duration ?? 0).toFixed(2) }); return st(...a); }; const sp = s.stop.bind(s); s.stop = (...a) => { window.__ev.push({ t: Math.round(performance.now() - t0), e: 'stop', n }); return sp(...a); }; s.addEventListener('ended', () => window.__ev.push({ t: Math.round(performance.now() - t0), e: 'ended', n })); return s; };
    const op = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function (...a) { window.__ev.push({ t: Math.round(performance.now() - t0), e: 'media.play', src: this.currentSrc.slice(-16) }); return op.apply(this, a); };
    const opp = HTMLMediaElement.prototype.pause; HTMLMediaElement.prototype.pause = function (...a) { window.__ev.push({ t: Math.round(performance.now() - t0), e: 'media.pause', src: this.currentSrc.slice(-16) }); return opp.apply(this, a); };
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 100)));
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await p.getByText('Demo collection ready').first().waitFor({ timeout: 120000 }); await p.waitForTimeout(1500);
  const list = p.getByRole('listbox', { name: 'Sounds' }); const prev = p.getByTestId('arrangement-library-preview-toggle');
  await list.getByRole('option', { name: /Middle East/ }).first().click(); await p.waitForTimeout(300);
  await p.evaluate(() => { window.__ev.length = 0; });
  await prev.click(); await p.waitForTimeout(300);
  await list.getByRole('option', { name: /Full mix/ }).first().click(); await p.waitForTimeout(100);
  const toggleAfterSelect = await prev.innerText(); await p.waitForTimeout(2000);
  const mid = { toggle: await prev.innerText(), media: await p.evaluate(() => [...document.querySelectorAll('audio')].map((a) => ({ src: a.currentSrc.slice(-16), paused: a.paused }))), open: await p.evaluate(() => { const st = new Set(), en = new Set(); for (const e of window.__ev) { if (e.e === 'start') st.add(e.n); if (e.e === 'stop' || e.e === 'ended') en.add(e.n); } return [...st].filter((n) => !en.has(n)); }) };
  await prev.click(); await p.waitForTimeout(1500);
  const media = await p.evaluate(() => [...document.querySelectorAll('audio')].map((a) => ({ src: a.currentSrc.slice(-16), paused: a.paused })));
  res[`${w}x${h}`] = { mid, toggleAfterSelect, toggleEnd: await prev.innerText(), events: await p.evaluate(() => window.__ev), media, status: await p.getByTestId('arrangement-status').textContent(), errs };
  await ctx.close();
}
fs.writeFileSync(`${out}/b7-replay2.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
await b.close();
