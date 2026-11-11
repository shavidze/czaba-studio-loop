import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const [,, base, stepAttr] = process.argv;
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { sessionStorage.setItem('czaba_entrance_seen', '1'); const O = window.Audio; window.__audios = []; window.Audio = function (...a) { const e = new O(...a); window.__audios.push(e); return e; }; window.Audio.prototype = O.prototype; });
const p = await ctx.newPage(); await p.goto(base + '/products/pulse-loop-kit', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: 'Play preview' }).first().click();
const i = p.locator('input[aria-label="Preview position"]'); await i.waitFor();
await p.waitForFunction(() => window.__audios.at(-1)?.duration > 0);
await p.evaluate((s) => { const a = window.__audios.at(-1); a.pause(); a.currentTime = 10.4; a.dispatchEvent(new Event('timeupdate')); if (s !== 'none') document.querySelector('input[aria-label="Preview position"]').setAttribute('step', s); }, stepAttr);
await p.waitForTimeout(200); await i.focus();
const rd = () => p.evaluate(() => ({ ct: +window.__audios.at(-1).currentTime.toFixed(3), value: document.querySelector('input[aria-label="Preview position"]').value }));
const out = { start: await rd() };
for (const k of ['ArrowRight', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'ArrowLeft', 'End', 'ArrowRight']) { await p.keyboard.press(k); await p.waitForTimeout(150); out[k + '_' + Object.keys(out).length] = await rd(); }
out.valuetext = await p.evaluate(() => document.querySelector('input[aria-label="Preview position"]').getAttribute('aria-valuetext')); console.log(stepAttr, JSON.stringify(out)); await b.close();
