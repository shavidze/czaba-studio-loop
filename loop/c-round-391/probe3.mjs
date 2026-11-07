import { open } from '../c-round-382/lib.mjs';
import fs from 'fs';
const [base, w, h] = [process.argv[2], +process.argv[3], +process.argv[4]];
const out = `/home/runner/czaba-project/tmp/studio-real-loop/c-round-391`;
const res = { vp: `${w}x${h}`, rows: {} };
async function fresh() {
  const o = await open(base, w, h);
  o.errors = []; o.page.on('pageerror', e => o.errors.push(String(e.message)));
  await o.page.waitForSelector('[data-testid="arrangement-status"]',{timeout:30000});
  await o.page.waitForFunction(() => /ready/.test(document.querySelector('[data-testid="arrangement-status"]').textContent),null,{timeout:30000}).catch(()=>{});
  await o.page.evaluate(() => {
    window.__delayDecodes = 0; window.__failDecodes = 0; window.__texts = [];
    const proto = BaseAudioContext.prototype; const dec = proto.decodeAudioData;
    proto.decodeAudioData = function (...a) {
      if (window.__failDecodes > 0) { window.__failDecodes--; return Promise.reject(new DOMException('injected', 'EncodingError')); }
      if (window.__delayDecodes > 0) { window.__delayDecodes--; return dec.apply(this, a).then(b => new Promise(r => setTimeout(() => r(b), 1500))); }
      return dec.apply(this, a);
    };
    const el = document.querySelector('[data-testid="arrangement-status"]');
    window.__texts.push(el.textContent);
    new MutationObserver(() => { const t = el.textContent; if (window.__texts.at(-1) !== t) window.__texts.push(t); }).observe(el, { childList: true, characterData: true, subtree: true });
  });
  await o.page.waitForFunction(() => /Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]').textContent) || window.__texts.some(t => /Demo collection ready/.test(t)), null, { timeout: 30000 }).catch(() => {});
  return o;
}
const status = p => p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]').textContent);
const texts = p => p.evaluate(() => window.__texts);
const ME = /Middle East/;
const playing = p => p.evaluate(() => document.querySelector('[data-playing]')?.getAttribute('data-playing'));
async function sel(p) { await p.getByRole('listbox', { name: 'Sounds' }).getByRole('option', { name: ME }).first().click(); }



{ const o = await fresh(); const p = o.page;
  await sel(p); await p.evaluate(() => { window.__delayDecodes = 1; window.__starts.length = 0; });
  await p.getByRole('button', { name: 'Preview', exact: true }).first().click(); await p.waitForTimeout(300);
  const mid = await status(p);
  const bt = await p.locator('button').evaluateAll(els => els.map(e => (e.getAttribute('aria-label')||e.textContent).trim()).filter(t => /preview|stop/i.test(t)));
  await p.getByRole('button', { name: 'Preview', exact: true }).first().click(); // second click = toggle off?
  await p.waitForTimeout(2800);
  res.rows.STALE_TOGGLE = { mid, bt, after: await status(p), starts: await p.evaluate(() => window.__starts.map(s => s.sec)), texts: (await texts(p)).slice(-4), errors: o.errors };
  await p.screenshot({ path: `${out}/stale-toggle-${w}.png` }); await o.browser.close(); }
fs.writeFileSync(`${out}/probe3-${w}.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));
