// C290 STUDIO-SMOKE-290 (own script; WAV reader adapted from c-round-280/c280-smoke.cjs)
const fs = require('node:fs'); const crypto = require('node:crypto');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const INIT = () => {
  window.__taps = []; const orig = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (t, ...rest) { const res = orig.call(this, t, ...rest);
    try { if (t instanceof AudioDestinationNode && !(this.context instanceof OfflineAudioContext)) { const a = this.context.createAnalyser(); a.fftSize = 2048; orig.call(this, a); window.__taps.push(a); } } catch (e) {} return res; };
  window.__rms = () => window.__taps.map((a) => { const d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); let s = 0; for (const x of d) s += x * x; return Math.sqrt(s / d.length); });
};
const readWav = (buf) => { const riff = buf.toString('ascii', 0, 4), wave = buf.toString('ascii', 8, 12);
  let off = 12, fmt = null, dataOff = -1, dataSize = 0;
  while (off < buf.length - 8) { const id = buf.toString('ascii', off, off + 4); const sz = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') fmt = { format: buf.readUInt16LE(off + 8), ch: buf.readUInt16LE(off + 10), rate: buf.readUInt32LE(off + 12), ba: buf.readUInt16LE(off + 20), bits: buf.readUInt16LE(off + 22) };
    if (id === 'data') { dataOff = off + 8; dataSize = sz; break; } off += 8 + sz + (sz % 2); }
  const frames = dataSize / fmt.ba; const bps = fmt.bits / 8; let peak = 0, nan = 0, s = 0, n = 0, nz = 0; const perSec = [];
  let secS = 0, secN = 0;
  for (let f = 0; f < frames; f++) { for (let c = 0; c < fmt.ch; c++) { const o = dataOff + f * fmt.ba + c * bps; let x;
      if (fmt.bits === 24) { let v = buf[o] | (buf[o+1] << 8) | (buf[o+2] << 16); if (v & 0x800000) v -= 0x1000000; x = v / 8388608; } else if (fmt.bits === 16) x = buf.readInt16LE(o) / 32768; else x = buf.readFloatLE(o);
      if (!Number.isFinite(x)) nan++; const a = Math.abs(x); if (a > peak) peak = a; if (x !== 0) nz++; s += x * x; n++; secS += x * x; secN++; }
    if ((f + 1) % fmt.rate === 0 || f === frames - 1) { perSec.push(+(10 * Math.log10(secS / secN || 1e-20)).toFixed(1)); secS = 0; secN = 0; } }
  return { riff, wave, ...fmt, bytes: buf.length, dataSize, frames, seconds: frames / fmt.rate, peak: +peak.toFixed(5), nan, nonZeroSamples: nz, rmsDb: +(10 * Math.log10(s / n || 1e-20)).toFixed(2), perSecDb: perSec, sha256: crypto.createHash('sha256').update(buf).digest('hex') };
};
const st = (page) => page.evaluate(() => { const q = (s) => document.querySelector(s);
  const play = [...document.querySelectorAll('button')].find((b) => b.dataset.playing !== undefined);
  return { t: Math.round(performance.now()), pos: q('[data-testid="arrangement-position"]')?.textContent ?? null, dp: play?.dataset.playing ?? null, playName: play?.getAttribute('aria-label') ?? play?.textContent ?? null, status: q('[data-testid="arrangement-status"]')?.textContent ?? null, rms: +Math.max(0, ...(window.__rms ? window.__rms() : [0])).toFixed(5), clips: document.querySelectorAll('[data-testid="arrangement-clip"]').length }; });
const toMs = (p) => { const m = /(\d+):(\d+)\.(\d+)/.exec(p || ''); return m ? (+m[1]) * 60000 + (+m[2]) * 1000 + (+m[3]) : NaN; };
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const R = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`; const r = {}; const errors = [];
    try {
    const ctx = await browser.newContext({ viewport: vp, acceptDownloads: true }); await ctx.addInitScript(INIT); const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto('http://127.0.0.1:5173/studio-lab');
    await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
    await sleep(800);
    await page.getByRole('option', { name: /Bass/ }).first().click(); await sleep(200); await page.keyboard.press('Enter'); await sleep(1000);
    r.added = await st(page);
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    r.s0 = await st(page);
    const playBtn = page.locator('button[data-playing]').first();
    await playBtn.click(); await sleep(150); r.p0 = await st(page); await sleep(1350); r.p15 = await st(page);
    await sleep(300); r.p18 = await st(page);
    await page.getByRole('button', { name: 'Stop', exact: true }).first().click(); await sleep(500); r.stopped = await st(page); await sleep(500); r.stopped2 = await st(page);
    await page.screenshot({ path: `shots/smoke-${k}.png` });
    await page.getByRole('button', { name: 'Export', exact: true }).first().click();
    const dlg = page.getByRole('dialog'); await dlg.waitFor();
    const dlP = page.waitForEvent('download', { timeout: 120000 });
    await dlg.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const dl = await dlP; const file = `smoke-${k}.wav`; await dl.saveAs(file); r.filename = dl.suggestedFilename();
    r.wav = readWav(fs.readFileSync(file)); fs.unlinkSync(file);
    r.errors = errors;
    r.checks = { addedStatus: r.added.status, posAt1500: r.p15.pos, posMs: toMs(r.p15.pos), holdsAfterStop: r.stopped.pos + ' / ' + r.stopped2.pos, rmsAfterStop: r.stopped2.rms, dpSeq: [r.s0.dp, r.p15.dp, r.stopped.dp].join('>'), audible: r.p15.rms, riff: r.wav.riff === 'RIFF' && r.wav.wave === 'WAVE', rate: r.wav.rate, seconds: r.wav.seconds, peak: r.wav.peak, nan: r.wav.nan };
    r.pass = /Bass/.test(r.added.status || '') && r.checks.posMs >= 1000 && r.checks.dpSeq === 'false>true>false' && r.checks.riff && r.wav.rate === 48000 && Math.abs(r.wav.seconds - 16) < 1e-9 && r.wav.peak > 0 && r.wav.nan === 0 && errors.length === 0;
    await ctx.close();
    } catch (e) { r.error = String(e).slice(0, 600); }
    R[k] = r; console.log(k, 'pass=', r.pass, JSON.stringify(r.checks || r.error));
  }
  fs.writeFileSync('smoke290.json', JSON.stringify(R, null, 1)); await browser.close();
})();
