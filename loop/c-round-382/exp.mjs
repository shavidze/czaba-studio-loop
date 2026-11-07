import { open, has } from './lib.mjs';
import fs from 'fs'; import crypto from 'crypto';
const out = [];
function wavInfo(buf) {
  const ch = buf.readUInt16LE(22), sr = buf.readUInt32LE(24), bits = buf.readUInt16LE(34);
  let off = 12, dataOff = 0, dataLen = 0;
  while (off < buf.length - 8) { const id = buf.toString('ascii', off, off + 4), len = buf.readUInt32LE(off + 4); if (id === 'data') { dataOff = off + 8; dataLen = len; break; } off += 8 + len; }
  const fmt = buf.readUInt16LE(20); let peak = 0, nz = 0, bad = 0, n = 0;
  if (bits === 16) { for (let i = dataOff; i + 1 < dataOff + dataLen; i += 2) { const v = Math.abs(buf.readInt16LE(i)) / 32768; if (v > peak) peak = v; if (v > 0) nz++; n++; } }
  else if (bits === 24) { for (let i = dataOff; i + 2 < dataOff + dataLen; i += 3) { let v = buf[i] | (buf[i+1] << 8) | (buf[i+2] << 16); if (v & 0x800000) v -= 0x1000000; v = Math.abs(v) / 8388608; if (v > peak) peak = v; if (v > 0) nz++; n++; } }
  else if (bits === 32 && fmt === 3) { for (let i = dataOff; i + 3 < dataOff + dataLen; i += 4) { const v = buf.readFloatLE(i); if (!Number.isFinite(v)) bad++; const a = Math.abs(v); if (a > peak) peak = a; if (a > 0) nz++; n++; } }
  return { fmt, ch, sr, bits, dataLen, seconds: +(dataLen / (ch * bits / 8) / sr).toFixed(3), peak: +peak.toFixed(4), nonZeroFrac: +(nz / n).toFixed(3), nonFinite: bad, riffOk: buf.toString('ascii', 0, 4) === 'RIFF', riffSize: buf.readUInt32LE(4) === buf.length - 8 };
}
for (const [tag, base] of [['patched', process.argv[2]], ['ctrl-head', process.argv[3]]]) {
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const { browser, page, live } = await open(base, w, h);
    const r = { tag, vp: `${w}x${h}` };
    await page.waitForTimeout(3000);
    r.liveReady = (await live()).filter((x) => x > 30);
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByRole('button', { name: 'Export', exact: true }).click();
    const dialog = page.getByRole('dialog'); await dialog.waitFor({ timeout: 30000 });
    await page.screenshot({ path: `shots/export-${tag}-${w}-dialog.png` });
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), dialog.getByRole('button', { name: 'Export WAV', exact: true }).click()]);
    const p = `exp-${tag}-${w}.wav`; await dl.saveAs(p);
    const buf = fs.readFileSync(p);
    r.name = dl.suggestedFilename(); r.bytes = buf.length; r.sha = crypto.createHash('sha256').update(buf).digest('hex'); r.wav = wavInfo(buf);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `shots/export-${tag}-${w}-done.png` });
    const done = dialog.getByRole('button', { name: 'Done', exact: true }); if (await done.count()) await done.click(); else await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
    await page.keyboard.press('Control+z'); await page.waitForTimeout(600);
    r.liveAfterUndo = (await live()).filter((x) => x > 30); r.clipsAfterUndo = await page.locator('[data-clip-kind="audio"]').count();
    out.push(r); await browser.close(); console.log(JSON.stringify(r));
  }
}
fs.writeFileSync('exp.json', JSON.stringify(out, null, 1));
