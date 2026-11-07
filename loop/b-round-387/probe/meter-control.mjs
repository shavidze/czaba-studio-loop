// usage: node meter-control.mjs <w> <h> <abs out.json> [base url]; normal Stop control (B round 387 planning)
import fs from 'fs';
import { open } from '/home/runner/czaba-project/tmp/studio-real-loop/c-round-382/lib.mjs';
const [w, h, out] = [+process.argv[2], +process.argv[3], process.argv[4]];
const { browser, page } = await open(process.argv[5] || 'http://127.0.0.1:5173', w, h);
const errors = []; page.on('pageerror', (e) => errors.push(String(e.message)));
await page.evaluate(() => {
  window.__throwAll = false; window.__thrown = 0;
  const st = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...a) {
    if (window.__throwAll && this.context.constructor.name === 'AudioContext') { window.__thrown++; throw new Error('injected pump failure'); }
    return st.apply(this, a);
  };
});
const list = page.getByRole('listbox', { name: 'Sounds' });
await list.getByRole('option', { name: /Soft impact/ }).first().click();
await page.getByRole('button', { name: 'Add', exact: true }).first().click();
await page.waitForTimeout(800);
const cb = await page.locator('[data-clip-id]').first().boundingBox();
await page.mouse.move(cb.x + 10, cb.y + cb.height * 0.55); await page.mouse.down();
await page.mouse.move(cb.x + 60, cb.y + cb.height * 0.55, { steps: 6 }); await page.mouse.up();
await page.waitForTimeout(300);
const loopBtn = page.getByRole('button', { name: /^Loop/ }).first();
await page.screenshot({path:out.replace(/\.json$/, '-pre.png')}); await loopBtn.click({timeout:5000}).catch(()=>{}); await page.waitForTimeout(300);
const res = { vp: `${w}x${h}`, loopPressed: await loopBtn.getAttribute('aria-pressed') };
await page.locator('button[aria-label="Play"]').first().click();
await page.waitForTimeout(700);
const meters = () => page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-track-meter"],[data-testid*="master-meter"]')].map((m) => m.getAttribute('data-level-db')));
res.metersPlaying = await meters();
await page.evaluate(() => { document.querySelector('button[aria-label="Stop"]').click(); });
await page.waitForTimeout(2500);
res.thrown = await page.evaluate(() => window.__thrown);
res.status = await page.evaluate(() => /could not be scheduled/.test(document.body.innerText));
res.metersAfter1 = await meters();
await page.waitForTimeout(1500);
res.metersAfter2 = await meters();
res.clock = await page.evaluate(() => (document.body.innerText.match(/\d\d:\d\d\.\d\d\d/) || [''])[0]);
await page.waitForTimeout(600);
res.clock2 = await page.evaluate(() => (document.body.innerText.match(/\d\d:\d\d\.\d\d\d/) || [''])[0]);
res.errors = errors;
await page.screenshot({ path: out.replace(/\.json$/, '.png') });
fs.writeFileSync(out, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res));
await browser.close();
