// A round 218 own smoke: real-mouse add demo clip, MP3 export, frame-header analysis. usage: node mp3-smoke.cjs <base> <outDir> <width> <height>
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(path.join('/home/runner/czaba-project/store/node_modules/playwright'));
const [BASE, outDir, W, H] = [process.argv[2], process.argv[3], Number(process.argv[4] || 1440), Number(process.argv[5] || 900)];
const BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const RATES = [44100, 48000, 32000, 0];

function analyseMp3(buf) {
  let pos = 0;
  if (buf.toString('ascii', 0, 3) === 'ID3') {
    const size = (buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9];
    pos = 10 + size;
  }
  const r = { fileSize: buf.length, id3Bytes: pos, frames: 0, infoFrame: null, firstAudioHeaderHex: null, bitrates: {}, rates: {}, modes: {}, versionLayer: {}, badSyncAt: null };
  let first = true;
  while (pos + 4 <= buf.length) {
    const h = buf.readUInt32BE(pos);
    if ((h >>> 21) !== 0x7ff) { r.badSyncAt = pos; break; }
    const ver = (h >>> 19) & 3; const layer = (h >>> 17) & 3; const bi = (h >>> 12) & 15; const si = (h >>> 10) & 3; const pad = (h >>> 9) & 1; const mode = (h >>> 6) & 3;
    const kbps = BITRATES[bi]; const sr = RATES[si];
    if (!kbps || !sr || ver !== 3 || layer !== 1) { r.badSyncAt = pos; r.badHeader = h.toString(16); break; }
    const len = Math.floor((144 * kbps * 1000) / sr) + pad;
    const tag = buf.toString('ascii', pos + 36, pos + 40);
    if (first && (tag === 'Xing' || tag === 'Info')) {
      r.infoFrame = { tag, kbps, sr, mode, bytes: len, headerHex: buf.slice(pos, pos + 4).toString('hex') };
    } else {
      if (!r.firstAudioHeaderHex) r.firstAudioHeaderHex = buf.slice(pos, pos + 4).toString('hex');
      r.frames += 1;
      r.bitrates[kbps] = (r.bitrates[kbps] || 0) + 1;
      r.rates[sr] = (r.rates[sr] || 0) + 1;
      r.modes[mode] = (r.modes[mode] || 0) + 1;
      r.versionLayer['MPEG1-L3'] = (r.versionLayer['MPEG1-L3'] || 0) + 1;
    }
    first = false;
    pos += len;
  }
  r.endPos = pos;
  r.frameSeconds = (r.frames * 1152) / 48000;
  return r;
}

async function clickCenter(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  const b = await locator.boundingBox();
  if (!b) throw new Error('no box');
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 });
  await page.mouse.down();
  await page.mouse.up();
}

(async () => {
  const key = `${W}x${H}`;
  const R = { base: BASE, key, started: new Date().toISOString(), pageErrors: [], consoleErrors: [], navigations: [], requestsAfterExport: [], attempts: [] };
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => R.pageErrors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') R.consoleErrors.push(m.text().slice(0, 200)); });
  let exportClickedAt = null;
  page.on('framenavigated', (f) => { if (f === page.mainFrame()) R.navigations.push({ t: Date.now(), url: f.url(), afterExport: exportClickedAt !== null }); });
  page.on('request', (q) => { if (exportClickedAt !== null) R.requestsAfterExport.push(q.url()); });
  page.on('response', (s) => { if (s.status() === 504) R.consoleErrors.push(`504 ${s.url()}`); });
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const A = { attempt };
    try {
      await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
      await page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add'); return b && !b.disabled; }, undefined, { timeout: 120000 });
      A.demoBadge = await page.evaluate(() => document.body.innerText.includes('Demo collection — no sign-in required'));
      await clickCenter(page, page.getByRole('button', { name: 'Add', exact: true }));
      await page.locator('[data-clip-kind="audio"]').first().waitFor({ timeout: 20000 });
      await clickCenter(page, page.getByRole('button', { name: 'Export', exact: true }).first());
      const dlg = page.getByRole('dialog');
      await dlg.waitFor();
      await clickCenter(page, page.getByTestId('arrangement-export-format-mp3'));
      A.note = await dlg.getByText(/^LAME/).textContent();
      await page.screenshot({ path: path.join(outDir, `a218-${key}-mp3-dialog.png`) });
      const workersBefore = page.workers().map((w) => w.url());
      const dlP = page.waitForEvent('download', { timeout: 120000 });
      exportClickedAt = Date.now();
      A.workersBefore = workersBefore;
      const statuses = [];
      const poll = setInterval(async () => { try { const t = await page.locator('[role="status"]').allTextContents(); statuses.push(t.join(' | ').slice(0, 160)); } catch {} }, 100);
      await clickCenter(page, dlg.getByRole('button', { name: 'Export MP3', exact: true }));
      const t0 = Date.now();
      const dl = await dlP;
      A.downloadMs = Date.now() - t0;
      await dlg.getByText(/^MP3 created:/).waitFor({ timeout: 30000 });
      clearInterval(poll);
      A.statusSamples = [...new Set(statuses)].slice(0, 12);
      A.created = await dlg.getByText(/^MP3 created:/).textContent();
      await page.screenshot({ path: path.join(outDir, `a218-${key}-mp3-created.png`) });
      A.filename = dl.suggestedFilename();
      const file = path.join(outDir, `a218-${key}.mp3`);
      await dl.saveAs(file);
      const buf = fs.readFileSync(file);
      A.mp3 = analyseMp3(buf);
      A.decoded = await page.evaluate(async (b64) => {
        const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i += 1) u[i] = bin.charCodeAt(i);
        const ac = new OfflineAudioContext(2, 48000, 48000);
        const ab = await ac.decodeAudioData(u.buffer);
        let s = 0; let n = 0; let nz = 0;
        for (let c = 0; c < ab.numberOfChannels; c += 1) { const d = ab.getChannelData(c); for (let i = 0; i < d.length; i += 1) { s += d[i] * d[i]; n += 1; if (d[i] !== 0) nz += 1; } }
        return { duration: ab.duration, channels: ab.numberOfChannels, sampleRate: ab.sampleRate, rmsDbfs: 10 * Math.log10(s / n), nonZeroFraction: nz / n };
      }, buf.toString('base64'));
      fs.unlinkSync(file);
      await new Promise((r) => setTimeout(r, 2000));
      A.workersAfter = page.workers().map((w) => w.url());
      A.blobWorkersAfter = A.workersAfter.filter((u) => u.startsWith('blob:')).length;
      R.attempts.push(A);
      break;
    } catch (e) {
      A.error = String(e).slice(0, 400);
      R.attempts.push(A);
      exportClickedAt = null;
    }
  }
  const origin = new URL(BASE).origin;
  R.thirdPartyAfterExport = R.requestsAfterExport.filter((u) => !u.startsWith(origin) && !u.startsWith('blob:') && !u.startsWith('data:'));
  R.ffmpegOrUnpkg = R.requestsAfterExport.filter((u) => /unpkg|ffmpeg/.test(u));
  R.requestsAfterExportCount = R.requestsAfterExport.length;
  R.requestsAfterExport = R.requestsAfterExport.slice(0, 60);
  await ctx.storageState({ path: '/home/runner/czaba-project/tmp/studio-real-loop/a-browse.json' });
  await browser.close();
  fs.writeFileSync(path.join(outDir, `a218-${key}.json`), JSON.stringify(R, null, 2));
  console.log(JSON.stringify(R, null, 2).slice(0, 6000));
})();
