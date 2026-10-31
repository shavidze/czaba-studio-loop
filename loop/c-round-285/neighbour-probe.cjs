// C round 285 neighbour probe (not a §8 row): ruler click-seek, Follow playback position, WAV export integrity.
// usage: node neighbour-probe.cjs <base> <W> <H> <outJson> <wavPath>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const crypto = require('crypto');
const [base, W, H, out, wavPath] = process.argv.slice(2);
function parseWav(buf) {
  let p = 12; let fmt = null; let data = null;
  while (p + 8 <= buf.length) {
    const id = buf.toString('latin1', p, p + 4); const size = buf.readUInt32LE(p + 4);
    if (id === 'fmt ') fmt = { format: buf.readUInt16LE(p + 8), ch: buf.readUInt16LE(p + 10), sr: buf.readUInt32LE(p + 12), bits: buf.readUInt16LE(p + 22) };
    if (id === 'data') { data = { off: p + 8, size: Math.min(size, buf.length - p - 8) }; break; }
    p += 8 + size + (size & 1);
  }
  const bps = fmt.bits / 8; const frames = Math.floor(data.size / (bps * fmt.ch));
  let peak = 0; let sum = 0; let nonzero = 0; let nan = 0; let firstNonZero = -1;
  for (let i = 0; i < frames; i++) for (let c = 0; c < fmt.ch; c++) {
    const o = data.off + (i * fmt.ch + c) * bps; let v;
    if (fmt.format === 3) v = buf.readFloatLE(o);
    else if (bps === 2) v = buf.readInt16LE(o) / 32768;
    else if (bps === 3) { let x = buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16); if (x & 0x800000) x -= 0x1000000; v = x / 8388608; }
    else v = buf.readInt32LE(o) / 2147483648;
    if (!Number.isFinite(v)) { nan++; continue; }
    const a = Math.abs(v); if (a > peak) peak = a; sum += v * v; if (v !== 0) { nonzero++; if (firstNonZero < 0) firstNonZero = i; }
  }
  return { fmt, frames, seconds: frames / fmt.sr, peak: +peak.toFixed(6), rms: +Math.sqrt(sum / (frames * fmt.ch)).toFixed(6), nonzeroPct: +(100 * nonzero / (frames * fmt.ch)).toFixed(3), nan, firstNonZeroFrame: firstNonZero, dataSha256: crypto.createHash('sha256').update(buf.subarray(data.off, data.off + data.size)).digest('hex') };
}
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: Number(W), height: Number(H) }, acceptDownloads: true });
  const page = await ctx.newPage();
  const res = { base, viewport: [W, H], pageErrors: [] };
  page.on('pageerror', (e) => res.pageErrors.push(String(e).slice(0, 200)));
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /^Demo collection ready/ }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByTestId('arrangement-clip-waveform').first().waitFor();
  await page.waitForTimeout(800);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  const pos = () => page.getByTestId('arrangement-position').innerText();
  const sl = () => page.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft);
  res.clip = await page.evaluate(() => { const c = document.querySelector('[data-clip-id]'); return { start: c.getAttribute('data-clip-start'), count: document.querySelectorAll('[data-clip-id]').length }; });
  res.posStart = await pos();
  const rb = await page.getByTestId('arrangement-ruler').boundingBox();
  const sc = await page.getByTestId('arrangement-timeline-scroller').boundingBox();
  const x = Math.max(sc.x + 224, rb.x) + 400;
  await page.mouse.click(x, rb.y + rb.height - 4);
  await page.waitForTimeout(400);
  res.posAfterRulerClick = await pos();
  res.rulerClickX = x - rb.x;
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  const sl0 = await sl();
  await page.keyboard.press('Space');
  await page.waitForTimeout(3000);
  res.posAfter3sPlay = await pos();
  await page.keyboard.press('Space');
  await page.waitForTimeout(400);
  res.posAfterStop = await pos();
  res.scrollLeftBeforePlay = sl0; res.scrollLeftAfterPlay = await sl();
  await page.screenshot({ path: out.replace(/\.json$/, '.png') });
  // export WAV
  await page.getByRole('button', { name: 'Export', exact: true }).first().click();
  const dlg = page.getByRole('dialog');
  await dlg.waitFor();
  await page.getByTestId('arrangement-export-format-wav').click();
  await page.waitForTimeout(200);
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 180000 }), dlg.getByRole('button', { name: 'Export WAV', exact: true }).click()]);
  await dl.saveAs(wavPath);
  res.wavName = dl.suggestedFilename();
  res.wav = parseWav(fs.readFileSync(wavPath));
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
