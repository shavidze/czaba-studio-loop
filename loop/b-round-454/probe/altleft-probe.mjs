// usage: node altleft-probe.mjs <base>  -- with a history entry behind the product page, does Alt+ArrowLeft on the focused position range navigate back or seek?
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.argv[2];
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { sessionStorage.setItem('czaba_entrance_seen', '1'); const O = window.Audio; window.__audios = []; window.Audio = function (...a) { const e = new O(...a); window.__audios.push(e); return e; }; window.Audio.prototype = O.prototype; });
const p = await ctx.newPage(); await p.goto(base + '/store', { waitUntil: 'networkidle' }); await p.goto(base + '/products/pulse-loop-kit', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: 'Play preview' }).first().click(); await p.locator('input[aria-label="Preview position"]').waitFor();
await p.waitForFunction(() => window.__audios.at(-1)?.duration > 0);
await p.evaluate(() => { const a = window.__audios.at(-1); a.pause(); a.currentTime = 10.4; a.dispatchEvent(new Event('timeupdate')); }); await p.waitForTimeout(150);
await p.locator('input[aria-label="Preview position"]').focus(); await p.keyboard.press('Alt+ArrowLeft'); await p.waitForTimeout(800);
console.log('ALT_LEFT', JSON.stringify({ url: new URL(p.url()).pathname, ct: await p.evaluate(() => window.__audios?.at(-1) ? +window.__audios.at(-1).currentTime.toFixed(3) : null) }));
await b.close();
