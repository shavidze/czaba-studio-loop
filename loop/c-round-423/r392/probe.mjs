import { open } from '../../c-round-382/lib.mjs';
import fs from 'fs';
const [base, w, h] = [process.argv[2], +process.argv[3], +process.argv[4]];
const out = `/home/runner/czaba-project/tmp/studio-real-loop/c-round-423/r392`;
const res = { vp: `${w}x${h}`, rows: {} };
async function fresh() {
  const o = await open(base, w, h);
  o.errors = []; o.page.on('pageerror', e => o.errors.push(String(e.message)));
  await o.page.waitForSelector('[data-testid="arrangement-status"]',{timeout:30000});
  await o.page.waitForFunction(() => /ready/.test(document.querySelector('[data-testid="arrangement-status"]').textContent),null,{timeout:30000}).catch(()=>{});
  await o.page.evaluate(() => {
    window.__delayDecodes = 0; window.__failDecodes = 0; window.__delayFailDecodes = 0; window.__texts = [];
    const proto = BaseAudioContext.prototype; const dec = proto.decodeAudioData;
    proto.decodeAudioData = function (...a) {
      if (window.__failDecodes > 0) { window.__failDecodes--; return Promise.reject(new DOMException('injected', 'EncodingError')); }
      if (window.__delayFailDecodes > 0) { window.__delayFailDecodes--; return new Promise((_, rj) => setTimeout(() => rj(new DOMException('injected-late', 'EncodingError')), 1500)); }
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

const list = p => p.getByRole('listbox', { name: 'Sounds' });
const prev = p => p.getByRole('button', { name: 'Preview', exact: true }).first();
{ const o = await fresh(); const p = o.page; // B7
  await sel(p); await p.evaluate(() => { window.__delayDecodes = 1; window.__starts.length = 0; window.__texts.length = 0; });
  await prev(p).click(); await p.waitForTimeout(300);
  await list(p).getByRole('option', { name: /Full mix/ }).first().click(); await p.waitForTimeout(100);
  await prev(p).click(); await p.waitForTimeout(3000);
  res.rows.B7 = { final: await status(p), texts: await texts(p), starts: await p.evaluate(() => window.__starts.map(s => s.sec)), errors: o.errors };
  await p.screenshot({ path: `${out}/b7-${w}.png` }); await o.browser.close(); }
{ const o = await fresh(); const p = o.page; // B8
  await list(p).getByRole('option', { name: /Full mix/ }).first().click(); await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
  await sel(p); await p.evaluate(() => { window.__delayDecodes = 1; window.__texts.length = 0; });
  await prev(p).click(); await p.waitForTimeout(300);
  await p.keyboard.press('Space'); await p.waitForTimeout(3000);
  res.rows.B8 = { final: await status(p), playing: await playing(p), texts: await texts(p), errors: o.errors };
  await p.screenshot({ path: `${out}/b8-${w}.png` }); await o.browser.close(); }
{ const o = await fresh(); const p = o.page; // B9
  await sel(p); await p.evaluate(() => { window.__delayFailDecodes = 1; window.__starts.length = 0; window.__texts.length = 0; });
  await prev(p).click(); await p.waitForTimeout(300);
  await list(p).getByRole('option', { name: /Full mix/ }).first().click(); await p.waitForTimeout(100);
  await prev(p).click(); await p.waitForTimeout(3500);
  res.rows.B9 = { final: await status(p), texts: await texts(p), starts: await p.evaluate(() => window.__starts.map(s => s.sec)), errors: o.errors };
  await p.screenshot({ path: `${out}/b9-${w}.png` }); await o.browser.close(); }
{ const o = await fresh(); const p = o.page; // B1
  await sel(p); await p.evaluate(() => { window.__delayDecodes = 1; window.__starts.length = 0; window.__texts.length = 0; });
  await prev(p).click(); await p.waitForTimeout(700); const mid = await status(p);
  await p.waitForFunction(() => window.__starts.some(s => s.sec > 100), null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(500);
  res.rows.B1 = { mid, texts: await texts(p), started: await p.evaluate(() => window.__starts.some(s => s.sec > 100)), final: await status(p), errors: o.errors };
  await p.screenshot({ path: `${out}/b1-${w}.png` }); await o.browser.close(); }
{ const o = await fresh(); const p = o.page; // B2
  await sel(p); await p.evaluate(() => { window.__delayDecodes = 1; window.__texts.length = 0; });
  await p.keyboard.press('Enter'); await p.waitForTimeout(100);
  const afterAdd = await status(p);
  await p.keyboard.press('Space'); await p.waitForTimeout(300);
  const s1 = await status(p), pl1 = await playing(p);
  await p.waitForTimeout(2200);
  const s2 = await status(p), pl2 = await playing(p);
  await p.keyboard.press('Space'); await p.waitForTimeout(800);
  res.rows.B2 = { afterAdd, s1, pl1, s2, pl2, s3: await status(p), pl3: await playing(p), texts: await texts(p), errors: o.errors };
  await p.screenshot({ path: `${out}/b2-${w}.png` }); await o.browser.close(); }
{ const o = await fresh(); const p = o.page; // B3/B4
  await sel(p); await p.keyboard.press('Enter'); await p.waitForTimeout(2500);
  await p.keyboard.press('Delete'); await p.waitForTimeout(800);
  await p.evaluate(() => { window.__failDecodes = 1; window.__texts.length = 0; });
  await p.keyboard.press('Control+z'); await p.waitForTimeout(3000);
  const afterUndo = await status(p);
  await p.keyboard.press('Space'); await p.waitForTimeout(800);
  res.rows.B3 = { afterUndo, status: await status(p), playing: await playing(p), texts: await texts(p), errors: o.errors };
  await p.screenshot({ path: `${out}/b3-${w}.png` });
  res.rows.B4wav = await exportFlow(p, 'b4-wav', false);
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  res.rows.B4mp3 = await exportFlow(p, 'b4-mp3', true);
  res.rows.B4errors = o.errors; await o.browser.close(); }
{ const o = await fresh(); const p = o.page; // B5 control + neighbour
  res.rows.firstLoadTexts = (await texts(p)).slice(0,4);
  await sel(p); await p.keyboard.press('Enter'); await p.waitForTimeout(2500);
  res.rows.B5 = await exportFlow(p, 'b5-wav', false); res.rows.B5.errors = o.errors; await o.browser.close(); }
fs.writeFileSync(`${out}/probe-${w}.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));
