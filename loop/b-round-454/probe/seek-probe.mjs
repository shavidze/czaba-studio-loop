import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const [,, base, w, h, out, shotDir] = process.argv;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +w, height: +h } });
await ctx.addInitScript(() => {
  sessionStorage.setItem('czaba_entrance_seen', '1');
  const Orig = window.Audio;
  window.__audios = [];
  window.Audio = function (...a) { const el = new Orig(...a); window.__audios.push(el); return el; };
  window.Audio.prototype = Orig.prototype;
});
const page = await ctx.newPage();
await page.goto(base + '/products/pulse-loop-kit', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Play preview' }).first().click();
const input = page.locator('input[aria-label="Preview position"]');
await input.waitFor();
await page.waitForFunction(() => { const a = window.__audios.at(-1); return a && a.duration > 0 && a.currentTime > 0.3; }, null, { timeout: 15000 });
const read = () => page.evaluate(() => {
  const a = window.__audios.at(-1); const i = document.querySelector('input[aria-label="Preview position"]');
  const r = i.getBoundingClientRect(); const m = /var\(--color-brand\) [0-9.]+%, var\(--color-brand\) (?:calc\(6px \+ )?([0-9.e-]+)/.exec(i.style.background);
  return { ct: a.currentTime, dur: a.duration, value: +i.value, step: i.step, valueAsNumber: i.valueAsNumber, stop: m ? +m[1] : null, x: r.x, y: r.y, w: r.width, h: r.height, paused: a.paused };
});
async function thumbCenter(s, tag) {
  const clip = { x: Math.floor(s.x), y: Math.floor(s.y + s.h / 2 - 8), width: Math.ceil(s.w), height: 16 };
  const buf = await page.screenshot({ clip, path: shotDir ? `${shotDir}/${tag}.png` : undefined });
  const xs = await scan(buf, 'white');
  const dpr = 1;
  if (!xs.length) return null; return clip.x + ((xs[0] + xs.at(-1)) / 2 + 0.5) / dpr;
}
async function scan(buf, kind) {
  return page.evaluate(async ([b64, kind]) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const row = Math.floor(img.height / 2); const d = g.getImageData(0, row, img.width, 1).data; const out = [];
    for (let x = 0; x < img.width; x++) { const k = x * 4; const [r, g, b] = [d[k], d[k+1], d[k+2]];
      if (kind === 'white' ? (r > 225 && g > 225 && b > 225) : (r > 150 && g > 110 && r - b > 60)) out.push(x); }
    return out;
  }, [buf.toString('base64'), kind]);
}
async function fillEndPixels(s) {
  await page.addStyleTag({ content: 'input[aria-label="Preview position"]::-webkit-slider-thumb{opacity:0 !important}' }).then(h => h.evaluate(e => e.id = '__hide'));
  const clip = { x: Math.floor(s.x), y: Math.floor(s.y + s.h / 2 - 1), width: Math.ceil(s.w), height: 2 };
  const buf = await page.screenshot({ clip });
  await page.evaluate(() => document.getElementById('__hide')?.remove());
  const xs = await scan(buf, 'brass');
  return xs.length ? clip.x + xs.at(-1) + 1 : s.x;
}
const rows = [];
// playing samples: value vs currentTime
for (let k = 0; k < 12; k++) { rows.push({ mode: 'playing', ...(await read()) }); await page.waitForTimeout(170); }
// paused samples with pixel thumb centre
const a = page; 
for (const t of [0.4, 3.6, 7.5, 14.4, 15.0, 22.7, 28.6, 75.3, 140.5, 149.6]) {
  await page.evaluate((t) => { const au = window.__audios.at(-1); au.pause(); au.currentTime = t; au.dispatchEvent(new Event('timeupdate')); }, t);
  await page.waitForTimeout(250);
  const s = await read(); const tc = await thumbCenter(s, `paused-${w}-${t}`);
  const fillEnd = await fillEndPixels(s);
  rows.push({ mode: 'paused', t, ...s, thumbCenterPx: tc, fillEndPx: fillEnd, leadPx: tc == null ? null : +(tc - fillEnd).toFixed(2) });
}
fs.writeFileSync(out, JSON.stringify(rows, null, 1));
console.log(rows.filter(r => r.mode === 'paused').map(r => `t=${r.t} value=${r.value} stop=${r.stop} thumb=${r.thumbCenterPx?.toFixed(1)} fill=${r.fillEndPx.toFixed(1)} lead=${r.leadPx}`).join('\n'));
console.log(rows.filter(r => r.mode === 'playing').map(r => `ct=${r.ct.toFixed(2)} value=${r.value} step='${r.step}'`).slice(0,4).join('\n'));
const L = rows.filter(r => r.mode === 'paused').map(r => Math.abs(r.leadPx)); console.log('MAX_ABS_LEAD_PX', Math.max(...L).toFixed(2));
await browser.close();
