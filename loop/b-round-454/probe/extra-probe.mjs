// usage: node extra-probe.mjs <base> <w> <h> <out.json>  -- volume fill, hover+drag, modified arrows on the Store AudioPlayer
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const [,, base, w, h, out] = process.argv;
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: +w, height: +h } });
await ctx.addInitScript(() => { sessionStorage.setItem('czaba_entrance_seen', '1'); const O = window.Audio; window.__audios = []; window.Audio = function (...a) { const e = new O(...a); window.__audios.push(e); return e; }; window.Audio.prototype = O.prototype; });
const page = await ctx.newPage(); await page.goto(base + '/products/pulse-loop-kit', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Play preview' }).first().click();
await page.locator('input[aria-label="Preview position"]').waitFor();
await page.waitForFunction(() => window.__audios.at(-1)?.duration > 0 && window.__audios.at(-1).currentTime > 0.2, null, { timeout: 15000 });
const pause = () => page.evaluate(() => window.__audios.at(-1).pause());
async function scan(buf, kind) { return page.evaluate(async ([b64, kind]) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); const row = Math.floor(img.height / 2); const d = g.getImageData(0, row, img.width, 1).data; const o = []; for (let x = 0; x < img.width; x++) { const k = x * 4; const [r, gg, bb] = [d[k], d[k+1], d[k+2]]; if (kind === 'white' ? (r > 225 && gg > 225 && bb > 225) : (r > 150 && gg > 110 && r - bb > 60)) o.push(x); } return o; }, [buf.toString('base64'), kind]); }
async function lead(label) {
  const r = await page.evaluate((l) => { const i = document.querySelector(`input[aria-label="${l}"]`); const q = i.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height, value: +i.value }; }, label);
  const clip = { x: Math.floor(r.x - 4), y: Math.floor(r.y + r.h / 2 - 9), width: Math.ceil(r.w + 8), height: 18 };
  const wx = await scan(await page.screenshot({ clip }), 'white'); const thumb = wx.length ? clip.x + (wx[0] + wx.at(-1)) / 2 + 0.5 : null;
  const hide = await page.addStyleTag({ content: `input[aria-label="${label}"]::-webkit-slider-thumb{opacity:0 !important}` });
  const clip2 = { x: Math.floor(r.x), y: Math.floor(r.y + r.h / 2 - 1), width: Math.ceil(r.w), height: 2 };
  const bx = await scan(await page.screenshot({ clip: clip2 }), 'brass'); await hide.evaluate((e) => e.remove());
  const fill = bx.length ? clip2.x + bx.at(-1) + 1 : r.x;
  return { value: r.value, thumb, fill, leadPx: thumb == null ? null : +(thumb - fill).toFixed(2), thumbWidthPx: wx.length ? wx.at(-1) - wx[0] + 1 : 0 };
}
const res = { volume: [], hover: null, drag: null, modkeys: {} };
await pause();
// volume: click on the volume track at fractions
for (const f of [0.05, 0.35, 0.7, 0.95]) {
  const r = await page.locator('input[aria-label="Preview volume"]').boundingBox();
  await page.mouse.click(r.x + 6 + f * (r.width - 12), r.y + r.height / 2); await page.mouse.move(5, 5); await page.waitForTimeout(150);
  res.volume.push({ f, ...(await lead('Preview volume')) });
}
await page.getByRole('button', { name: /^(Mute|Unmute)$/ }).click(); await page.waitForTimeout(100);
const v1 = await page.evaluate(() => +document.querySelector('input[aria-label="Preview volume"]').value);
await page.getByRole('button', { name: /^(Mute|Unmute)$/ }).click(); await page.waitForTimeout(100);
res.muteToggle = [v1, await page.evaluate(() => +document.querySelector('input[aria-label="Preview volume"]').value)];
// hover on the progress thumb at 30 s
await page.evaluate(() => { const a = window.__audios.at(-1); a.currentTime = 30.3; a.dispatchEvent(new Event('timeupdate')); }); await page.waitForTimeout(200);
let pr = await page.locator('input[aria-label="Preview position"]').boundingBox();
const dur = await page.evaluate(() => window.__audios.at(-1).duration);
const tx = (t) => pr.x + 6 + (t / dur) * (pr.width - 12);
await page.mouse.move(tx(30.3), pr.y + pr.height / 2); await page.waitForTimeout(250);
res.hover = await lead('Preview position');
// drag from 20% to 60% of the track (paused)
await page.mouse.move(5, 5); await page.evaluate((t) => { const a = window.__audios.at(-1); a.currentTime = t; a.dispatchEvent(new Event('timeupdate')); }, 0.2 * dur); await page.waitForTimeout(200);
pr = await page.locator('input[aria-label="Preview position"]').boundingBox();
await page.mouse.move(pr.x + 0.2 * pr.width, pr.y + pr.height / 2); await page.mouse.down();
for (let k = 1; k <= 10; k++) await page.mouse.move(pr.x + (0.2 + 0.04 * k) * pr.width, pr.y + pr.height / 2);
await page.mouse.up(); await page.mouse.move(5, 5); await page.waitForTimeout(250);
const after = await page.evaluate(() => ({ ct: window.__audios.at(-1).currentTime, paused: window.__audios.at(-1).paused, value: +document.querySelector('input[aria-label="Preview position"]').value, dur: window.__audios.at(-1).duration }));
res.drag = { ...after, ctMinusValue: +(after.ct - after.value).toFixed(3), ctFraction: +(after.ct / after.dur).toFixed(4), ...(await lead('Preview position')) };
// modified arrows from 10.4 s
for (const k of ['Shift+ArrowRight', 'Alt+ArrowRight', 'Control+ArrowRight', 'Meta+ArrowRight']) {
  await page.evaluate(() => { const a = window.__audios.at(-1); a.pause(); a.currentTime = 10.4; a.dispatchEvent(new Event('timeupdate')); }); await page.waitForTimeout(150);
  await page.locator('input[aria-label="Preview position"]').focus(); await page.keyboard.press(k); await page.waitForTimeout(150);
  res.modkeys[k] = await page.evaluate(() => ({ ct: +window.__audios.at(-1).currentTime.toFixed(3), value: document.querySelector('input[aria-label="Preview position"]').value, url: location.pathname }));
}
fs.writeFileSync(out, JSON.stringify(res, null, 1));
console.log('VOLUME', res.volume.map((v) => `f=${v.f} value=${v.value} lead=${v.leadPx}`).join(' | '));
console.log('VOLUME_MAX_ABS_LEAD_PX', Math.max(...res.volume.map((v) => Math.abs(v.leadPx))).toFixed(2), 'MUTE', JSON.stringify(res.muteToggle));
console.log('HOVER', JSON.stringify(res.hover));
console.log('DRAG', JSON.stringify(res.drag));
console.log('MODKEYS', JSON.stringify(res.modkeys));
await b.close();
