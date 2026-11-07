// C round 210 — EXPORT: drag-set mix vs keyboard-set mix must export bit-identical WAVs. Plus a default-mix control.
// usage: node c210export.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c210lib.cjs');
const fs = require('fs');
const path = require('path');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4] || 1440), Number(process.argv[5] || 900)];

function wavInfo(f) {
  const b = fs.readFileSync(f);
  const o = { size: b.length, riff: b.toString('ascii', 0, 4), wave: b.toString('ascii', 8, 12) };
  let p = 12;
  while (p + 8 <= b.length) {
    const id = b.toString('ascii', p, p + 4);
    const sz = b.readUInt32LE(p + 4);
    if (id === 'fmt ') { o.format = b.readUInt16LE(p + 8); o.channels = b.readUInt16LE(p + 10); o.sampleRate = b.readUInt32LE(p + 12); o.bits = b.readUInt16LE(p + 22); }
    if (id === 'data') {
      o.dataBytes = sz;
      const bps = o.bits / 8;
      const frames = sz / (bps * o.channels);
      o.frames = frames; o.durationS = frames / o.sampleRate;
      let peak = 0, sum = 0, n = 0, nonzero = 0, nan = 0;
      for (let i = p + 8; i + bps <= p + 8 + sz; i += bps) {
        let v;
        if (o.format === 3 && bps === 4) v = b.readFloatLE(i);
        else if (bps === 2) v = b.readInt16LE(i) / 32768;
        else if (bps === 3) v = (b.readIntLE(i, 3)) / 8388608;
        else v = b.readInt32LE(i) / 2147483648;
        if (Number.isNaN(v)) { nan += 1; continue; }
        const a = Math.abs(v); if (a > peak) peak = a; sum += v * v; n += 1; if (v !== 0) nonzero += 1;
      }
      o.peak = peak; o.rms = Math.sqrt(sum / Math.max(1, n)); o.nonzeroFrac = nonzero / Math.max(1, n); o.nan = nan;
      break;
    }
    p += 8 + sz + (sz % 2);
  }
  return o;
}

async function exportWav(page, label) {
  const dl = [];
  page.on('download', (d) => dl.push(d));
  await L.blurActive(page);
  await page.getByRole('button', { name: /^Export$/ }).first().click();
  await L.sleep(800);
  const dialog = page.getByRole('dialog');
  const t0 = Date.now();
  await dialog.getByRole('button', { name: 'Export WAV', exact: true }).click();
  for (let i = 0; i < 1200 && dl.length === 0; i++) await L.sleep(100);
  if (!dl.length) return { error: 'no download', dialogText: (await dialog.innerText()).slice(0, 300) };
  const f = path.join(L.OUT, `export-${tag}-${label}.wav`);
  await dl[0].saveAs(f);
  const res = { file: path.basename(f), suggested: dl[0].suggestedFilename(), ms: Date.now() - t0, sha256: L.sha256(f), wav: wavInfo(f) };
  const done = dialog.getByRole('button', { name: 'Done', exact: true });
  if (await done.count()) await done.click(); else await page.keyboard.press('Escape');
  await L.sleep(500);
  return res;
}

async function keyExact(page, loc, target) {
  await loc.focus();
  let n = 0;
  for (; n < 400; n++) {
    const v = Number(await loc.inputValue());
    if (Math.abs(v - target) < 1e-9) break;
    await page.keyboard.press(v > target ? 'ArrowDown' : 'ArrowUp');
  }
  await L.blurActive(page);
  await L.sleep(400);
  return { presses: n, value: Number(await loc.inputValue()), vt: await loc.getAttribute('aria-valuetext') };
}

async function plainDrag(page, loc, dx) {
  await loc.scrollIntoViewIfNeeded();
  const b = await loc.boundingBox();
  const y = b.y + b.height / 2;
  await page.mouse.move(b.x + b.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2 + dx, y, { steps: 25 });
  await page.mouse.up();
  await L.quiet(page);
  await L.blurActive(page);
  return { value: Number(await loc.inputValue()), vt: await loc.getAttribute('aria-valuetext'), undo: await L.undoTitle(page) };
}

(async () => {
  const browser = await L.launch();
  const R = { base, tag, vw, vh, utc: new Date().toISOString() };
  try {
    { // control: defaults
      const { ctx, page } = await L.openLab(browser, base, vw, vh);
      R.control = { music: await L.sl(page, 'Volume — Music').inputValue(), master: await L.sl(page, 'Master Volume').inputValue(), export: await exportWav(page, 'control') };
      await ctx.close();
    }
    { // session 1: plain drags from below max
      const { ctx, page } = await L.openLab(browser, base, vw, vh);
      const tv = L.sl(page, 'Volume — Music');
      const mv = L.sl(page, 'Master Volume');
      R.s1 = {};
      R.s1.musicKey = await L.keyTo(page, tv, -12, 'ArrowDown');
      R.s1.musicDrag = await plainDrag(page, tv, -17);
      R.s1.masterKey = await L.keyTo(page, mv, -6, 'ArrowDown');
      R.s1.masterDrag = await plainDrag(page, mv, 13);
      R.s1.export = await exportWav(page, 'drag');
      await ctx.close();
    }
    { // session 2: keyboard only to the same slider values
      const { ctx, page } = await L.openLab(browser, base, vw, vh);
      R.s2 = {};
      R.s2.music = await keyExact(page, L.sl(page, 'Volume — Music'), R.s1.musicDrag.value);
      R.s2.master = await keyExact(page, L.sl(page, 'Master Volume'), R.s1.masterDrag.value);
      R.s2.export = await exportWav(page, 'keys');
      await ctx.close();
    }
    R.identical = R.s1.export.sha256 === R.s2.export.sha256;
    R.differsFromControl = R.s1.export.sha256 !== R.control.export.sha256;
  } catch (e) {
    R.fatal = String(e && e.stack || e).slice(0, 1500);
  }
  await browser.close();
  L.save(`export-${tag}.json`, R);
  console.log('done', tag, R.fatal || '', R.identical, R.differsFromControl);
})();
