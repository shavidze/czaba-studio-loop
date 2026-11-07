// usage: node resync-throw.mjs <base> <out.json> [width height]
import { open } from '../../c-round-382/lib.mjs';
import fs from 'fs';
const [base, outPath, w = '1440', h = '900'] = process.argv.slice(2);
const { browser, ctx, page } = await open(base, +w, +h);
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message || e)));
await page.evaluate(() => {
  window.__throwStarts = 0; window.__thrown = 0;
  const st = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...a) {
    if (window.__throwStarts > 0) { window.__throwStarts -= 1; window.__thrown += 1; throw new Error('injected schedule failure'); }
    return st.apply(this, a);
  };
});
const list = page.getByRole('listbox', { name: 'Sounds' });
const add = async (re) => { await list.getByRole('option', { name: re }).first().click(); await page.getByRole('button', { name: 'Add', exact: true }).first().click(); };
const clock = () => page.evaluate(() => (document.body.innerText.match(/\d\d:\d\d\.\d\d\d/) || [''])[0]);
const playing = () => page.locator('button[aria-label="Stop"]').count();
await add(/Full mix/); await page.waitForTimeout(800);
await page.locator('button[aria-label="Play"]').first().click(); await page.waitForTimeout(1200);
const r = { base, vp: `${w}x${h}`, playingBefore: await playing(), clockBefore: await clock() };
await add(/Middle East/);
await page.evaluate(() => { window.__throwStarts = 1; });
r.armedAfterAddMs = 0;
await page.waitForFunction(() => window.__thrown > 0, null, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(1500);
r.thrown = await page.evaluate(() => window.__thrown);
r.errors = errors;
r.playingAfter = await playing();
const c1 = await clock(); await page.waitForTimeout(800); const c2 = await clock();
r.clockAfter = [c1, c2];
r.statusHasScheduleFailed = await page.evaluate(() => document.body.innerText.includes('Playback stopped — the audio could not be scheduled'));
await page.screenshot({ path: outPath.replace(/\.json$/, '.png') });
await page.evaluate(() => { window.__throwStarts = 0; });
await page.locator('button[aria-label="Play"]').first().click().catch(() => {});
await page.waitForTimeout(1200);
r.replayPlaying = await playing();
r.replayStatusPlayingFrom = await page.evaluate(() => /Playing from \d\d:\d\d\.\d\d\d/.test(document.body.innerText));
r.replayStatusStillFailed = await page.evaluate(() => document.body.innerText.includes('Playback stopped — the audio could not be scheduled'));
fs.writeFileSync(outPath, JSON.stringify(r, null, 1));
console.log(JSON.stringify(r));
await browser.close();
