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

// B1
{ const o = await fresh(); const p = o.page;
  await sel(p); await p.evaluate(() => { window.__delayDecodes = 1; window.__starts.length = 0; });
  await p.getByRole('button', { name: 'Preview', exact: true }).first().click();
  await p.waitForTimeout(700); const mid = await status(p);
  await p.waitForFunction(() => window.__starts.some(s => s.sec > 100), null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(500);
  res.rows.B1 = { mid, texts: (await texts(p)).slice(-4), started: await p.evaluate(() => window.__starts.some(s => s.sec > 100)), final: await status(p), errors: o.errors };
  await p.screenshot({ path: `${out}/b1-${w}.png` }); await o.browser.close(); }
// B2
{ const o = await fresh(); const p = o.page;
  await sel(p); await p.evaluate(() => { window.__delayDecodes = 1; });
  await p.keyboard.press('Enter'); await p.waitForTimeout(100);
  // after add, source evicted? Try Space
  const afterAdd = await status(p);
  await p.keyboard.press('Space'); await p.waitForTimeout(300);
  const s1 = await status(p), pl1 = await playing(p);
  await p.waitForTimeout(2200);
  const s2 = await status(p), pl2 = await playing(p);
  await p.keyboard.press('Space'); await p.waitForTimeout(800);
  res.rows.B2 = { afterAdd, s1, pl1, s2, pl2, s3: await status(p), pl3: await playing(p), texts: (await texts(p)).slice(-6), errors: o.errors };
  await p.screenshot({ path: `${out}/b2-${w}.png` }); await o.browser.close(); }
// B3/B4
{ const o = await fresh(); const p = o.page;
  await sel(p); await p.keyboard.press('Enter'); await p.waitForTimeout(2500);
  await p.keyboard.press('Delete'); await p.waitForTimeout(800);
  await p.evaluate(() => { window.__failDecodes = 1; });
  await p.keyboard.press('Control+z'); await p.waitForTimeout(3000);
  const afterUndo = await status(p);
  const libErr = await p.getByRole('listbox', { name: 'Sounds' }).innerText();
  await p.keyboard.press('Space'); await p.waitForTimeout(800);
  res.rows.B3 = { afterUndo, libErrLine: libErr.split('\n').filter(l => /fail|error/i.test(l)).slice(0, 3), status: await status(p), playing: await playing(p), texts: (await texts(p)).slice(-5), errors: o.errors };
  await p.screenshot({ path: `${out}/b3-${w}.png` });
  await p.keyboard.press('Space'); await p.waitForTimeout(500);
  const dl = []; p.on('download', d => dl.push(d.suggestedFilename()));
  const exp = p.getByRole('button', { name: /^Export/ }).first();
  await exp.click(); await p.waitForTimeout(700);
  await p.screenshot({ path: `${out}/b4-dialog-${w}.png` });
  const dlg = await p.locator('[role=dialog]').first().innerText().catch(() => 'NO DIALOG');
  res.rows.B4pre = { dlg: dlg.slice(0, 600) };
  const wavBtn = p.locator('[role=dialog]').getByRole('button', { name: /WAV|Export|Download/ });
  res.rows.B4pre.buttons = await wavBtn.allInnerTexts();
  fs.writeFileSync(`${out}/state-${w}.json`, JSON.stringify(res, null, 1));
  await o.browser.close(); }
fs.writeFileSync(`${out}/probe-${w}.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));
