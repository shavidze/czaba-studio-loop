import { createRequire } from 'node:module';
import { writeFileSync, readFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [base, tag, outPath] = process.argv.slice(2);
const out = { base };
const parseWav = (buf) => {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const tag = (o) => String.fromCharCode(buf[o], buf[o+1], buf[o+2], buf[o+3]);
  const r = { riff: tag(0), wave: tag(8), bytes: buf.length };
  let o = 12; let fmt, dataOff, dataLen;
  while (o + 8 <= buf.length) { const id = tag(o), sz = dv.getUint32(o+4, true); if (id === 'fmt ') fmt = { fmtTag: dv.getUint16(o+8,true), ch: dv.getUint16(o+10,true), sr: dv.getUint32(o+12,true), bits: dv.getUint16(o+22,true) }; if (id === 'data') { dataOff = o+8; dataLen = sz; break; } o += 8 + sz + (sz & 1); }
  Object.assign(r, fmt, { dataLen, declaredVsActual: dataOff + dataLen <= buf.length });
  const bps = fmt.bits / 8, n = Math.floor(Math.min(dataLen, buf.length - dataOff) / bps);
  let peak = 0, nz = 0, nan = 0, sumsq = 0;
  for (let i = 0; i < n; i++) { const p = dataOff + i * bps; let v; if (fmt.bits === 24) { v = (buf[p] | (buf[p+1] << 8) | (buf[p+2] << 16)); if (v & 0x800000) v -= 0x1000000; v /= 8388608; } else if (fmt.bits === 16) v = dv.getInt16(p, true) / 32768; else if (fmt.fmtTag === 3) v = dv.getFloat32(p, true); else v = 0; if (!Number.isFinite(v)) nan++; const a = Math.abs(v); if (a > peak) peak = a; if (a > 1e-6) nz++; sumsq += v*v; }
  r.frames = Math.floor(n / fmt.ch); r.seconds = r.frames / fmt.sr; r.peak = peak; r.nonZeroSamples = nz; r.nanOrInf = nan; r.rms = Math.sqrt(sumsq / Math.max(n,1));
  return r;
};

const browser = await chromium.launch();
const ae = (page) => page.evaluate(() => { const e = document.activeElement; if (!e) return null; return { tag: e.tagName, role: e.getAttribute('role'), name: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 40), inDialog: !!e.closest('[role=dialog]') }; });
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = {}; out[`${w}x${h}`] = r;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  const page = await ctx.newPage();
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 });
  await page.waitForTimeout(1000);
  await page.getByTestId('arrangement-library-list').getByRole('option', { name: /Bass/ }).first().click();
  await page.waitForTimeout(250); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  const exp = page.getByRole('button', { name: /^Export/ }).first();
  await exp.click(); await page.waitForTimeout(600);
  const dlg = page.getByRole('dialog');
  r.a_dialogAccName = await page.evaluate(() => { const d = document.querySelector('[role=dialog]'); if (!d) return null; const id = d.getAttribute('aria-labelledby'); return id ? document.getElementById(id)?.textContent?.trim() : d.getAttribute('aria-label'); });
  r.a_active = await ae(page);
  const seq = []; for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); seq.push(await ae(page)); } r.b_tab = seq.map((s) => s && `${s.tag}/${s.role}/${s.name}/${s.inDialog}`);
  await page.screenshot({ path: `${outPath}-open-${w}.png` });
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  r.c_dialogCount = await page.getByRole('dialog').count(); r.c_active = await ae(page);
  await exp.click(); await page.waitForTimeout(500);
  await page.getByRole('radio', { name: /MP3/ }).first().check(); await page.waitForTimeout(200);
  r.d_checkedBeforeClose = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] input[type=radio]')].filter(x => x.checked).map(x => x.getAttribute('aria-labelledby') ? document.getElementById(x.getAttribute('aria-labelledby'))?.textContent?.trim() : x.value));
  await page.getByRole('dialog').getByRole('button', { name: /^(Done|Close)/ }).first().click(); await page.waitForTimeout(400);
  r.d_dialogCountAfterClose = await page.getByRole('dialog').count();
  await exp.click(); await page.waitForTimeout(500);
  r.d_checkedAfterReopen = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] input[type=radio]')].filter(x => x.checked).map(x => x.getAttribute('aria-labelledby') ? document.getElementById(x.getAttribute('aria-labelledby'))?.textContent?.trim() : x.value));
  r.d_exportButtonLabel = await page.getByRole('dialog').getByRole('button', { name: /^Export/ }).first().innerText();
  await page.getByRole('dialog').getByRole('button', { name: /^(Done|Close)/ }).first().click(); await page.waitForTimeout(400);
  await exp.click(); await page.waitForTimeout(500);
  r.e_checkedWavOnReopen = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] input[type=radio]')].filter(x => x.checked).map(x => x.getAttribute('aria-labelledby') ? document.getElementById(x.getAttribute('aria-labelledby'))?.textContent?.trim() : x.value));
  await page.getByRole('radio', { name: /WAV/ }).first().check().catch(() => {});
  try {
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.getByRole('dialog').getByRole('button', { name: /^Export WAV$/ }).first().click()]);
    const p = `${outPath}-${w}.wav`; await dl.saveAs(p);
    r.e_wav = parseWav(readFileSync(p)); r.e_wav.suggested = dl.suggestedFilename();
  } catch (e) { r.e_error = String(e).slice(0, 300); }
  await page.waitForTimeout(800);
  r.e_dialogText = await page.getByRole('dialog').innerText().then((t) => t.replace(/\s+/g, ' ').slice(0, 400)).catch(() => null);
  await page.getByRole('dialog').getByRole('button', { name: /^(Done|Close)/ }).first().click().catch(() => {}); await page.waitForTimeout(500);
  r.e_dialogCountAfter = await page.getByRole('dialog').count();
  await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  let found = null;
  for (let i = 0; i < 120; i++) { await page.keyboard.press('Tab'); const a = await ae(page); if (a && /^Export/.test(a.name) && !a.inDialog) { found = i + 1; break; } }
  r.f_tabsToExport = found; await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  r.f_dialogOpen = await page.getByRole('dialog').count();
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  r.f_active = await ae(page);
  await ctx.close();
}
await browser.close(); writeFileSync(outPath + '.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out));
