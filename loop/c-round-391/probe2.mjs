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


async function exportFlow(p, label, mp3) {
  await p.getByRole('button', { name: /^Export/ }).first().click(); await p.waitForTimeout(500);
  if (mp3) await p.locator('[role=dialog]').getByText(/^MP3/).first().click();
  const dl = []; p.on('download', d => dl.push(d));
  await p.locator('[role=dialog]').getByRole('button', { name: mp3 ? /Export MP3/ : /Export WAV/ }).click();
  await p.waitForTimeout(mp3 ? 8000 : 5000);
  const dlg = await p.locator('[role=dialog]').first().innerText().catch(() => 'NO DIALOG');
  await p.screenshot({ path: `${out}/${label}-${w}.png` });
  let info = null;
  if (dl.length) { const path = await dl[0].path(); const buf = fs.readFileSync(path); info = { name: dl[0].suggestedFilename(), bytes: buf.length, head: buf.subarray(0,4).toString()+'/'+buf.subarray(8,12).toString() };
    if (info.head.startsWith('RIFF')) { const sr = buf.readUInt32LE(24), ch = buf.readUInt16LE(22), bits = buf.readUInt16LE(34); const dataLen = buf.length - 44; info.sr=sr; info.ch=ch; info.bits=bits; info.durS = +(dataLen/(sr*ch*bits/8)).toFixed(2);
      let nz=0, nan=0; for (let i=44;i+3<buf.length;i+=3){ if(buf[i]||buf[i+1]||buf[i+2]) {nz++; break;} } info.nonSilent = nz>0; } }
  return { downloads: dl.length, info, dlg: dlg.slice(-400) };
}
{ const o = await fresh(); const p = o.page;
  await sel(p); await p.keyboard.press('Enter'); await p.waitForTimeout(2500);
  await p.keyboard.press('Delete'); await p.waitForTimeout(800);
  await p.evaluate(() => { window.__failDecodes = 1; });
  await p.keyboard.press('Control+z'); await p.waitForTimeout(3000);
  res.rows.B4wav = await exportFlow(p, 'b4-wav', false);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  res.rows.B4mp3 = await exportFlow(p, 'b4-mp3', true);
  res.rows.B4errors = o.errors; await o.browser.close(); }
{ const o = await fresh(); const p = o.page;
  await sel(p); await p.keyboard.press('Enter'); await p.waitForTimeout(2500);
  res.rows.B5 = await exportFlow(p, 'b5-wav', false); res.rows.B5.errors = o.errors; await o.browser.close(); }

{ const o = await fresh(); const p = o.page;
  await sel(p); await p.evaluate(() => { window.__delayDecodes = 1; window.__starts.length = 0; });
  await p.getByRole('button', { name: 'Preview', exact: true }).first().click(); await p.waitForTimeout(300);
  const btns = await p.getByRole('button').evaluateAll(els => els.map(e => (e.getAttribute('aria-label')||e.textContent).trim()).filter(t => /preview|stop/i.test(t)));
  const mid = await status(p);
  await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  const stopBtn = p.getByRole('button', { name: /Stop/ }).first();
  let clicked = false; if (await stopBtn.count()) { await stopBtn.click(); clicked = true; }
  await p.waitForTimeout(2500);
  res.rows.STALE_STOP = { btns, clicked, mid, after: await status(p), previewStarted: await p.evaluate(() => window.__starts.some(s => s.sec > 100)), texts: (await texts(p)).slice(-4), errors: o.errors };
  await p.screenshot({ path: `${out}/stale-stop-${w}.png` });
  await o.browser.close(); }
{ const o = await fresh(); const p = o.page;
  const list = p.getByRole('listbox', { name: 'Sounds' });
  await sel(p); await p.evaluate(() => { window.__delayDecodes = 1; window.__starts.length = 0; });
  await p.getByRole('button', { name: 'Preview', exact: true }).first().click(); await p.waitForTimeout(300);
  await list.getByRole('option', { name: /Full mix/ }).first().click(); await p.waitForTimeout(100);
  await p.getByRole('button', { name: 'Preview', exact: true }).first().click(); await p.waitForTimeout(3000);
  res.rows.STALE_SUPERSEDED = { after: await status(p), starts: await p.evaluate(() => window.__starts.map(s => s.sec)), texts: (await texts(p)).slice(-5), errors: o.errors };
  await p.screenshot({ path: `${out}/stale-superseded-${w}.png` });
  await o.browser.close(); }
fs.writeFileSync(`${out}/probe2-${w}.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));
