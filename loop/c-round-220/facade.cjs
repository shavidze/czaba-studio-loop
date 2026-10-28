// C round 220 FACADE-REAL-220: real Chromium, fresh context, /studio-lab, import('/app/utils/ffmpeg.ts') in the page.
// usage: node facade.cjs <W> <H> <outDir>
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const src = fs.readFileSync(path.join(__dirname, '../c-round-218/c218-mp3.cjs'), 'utf8');
const parseMp3 = new Function('Buffer', src.slice(src.indexOf('const KBPS'), src.indexOf('function parseWav')) + '; return parseMp3;')(Buffer);
const [W, H, OUT] = [Number(process.argv[2]), Number(process.argv[3]), process.argv[4]];
const BASE = 'http://127.0.0.1:5173';

(async () => {
  const R = { vp: `${W}x${H}`, started: new Date().toISOString(), pageErrors: [], calls: {} };
  const browser = await chromium.launch();
  R.chromium = browser.version();
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  const reqs = [];
  const T0 = Date.now();
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 300)));
  page.on('request', (q) => reqs.push({ t: Date.now() - T0, url: q.url() }));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add'); return b && !b.disabled; }, undefined, { timeout: 120000 });
  await page.waitForTimeout(2000);
  R.demoBadge = await page.evaluate(() => document.body.innerText.includes('Demo collection — no sign-in required'));
  R.loadEncoderReq = reqs.filter((q) => /mp3-encoder|mediabunny/.test(q.url)).map((q) => q.url);
  await page.evaluate(async () => {
    window.__m = await import('/app/utils/ffmpeg.ts');
    const sr = 48000, n = sr * 5, ch = 2;
    const buf = new ArrayBuffer(44 + n * ch * 2); const v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + n * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true); v.setUint32(24, sr, true); v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * ch * 2, true);
    for (let i = 0; i < n; i++) { const s = Math.round(Math.sin(2 * Math.PI * 440 * i / sr) * 12000); v.setInt16(44 + i * 4, s, true); v.setInt16(46 + i * 4, s, true); }
    window.__wav = new Blob([buf], { type: 'audio/wav' });
  });
  R.exports = await page.evaluate(() => Object.keys(window.__m));
  const tFirst = Date.now() - T0;
  const before = reqs.length;
  R.calls['256k'] = await page.evaluate(async () => { try { await window.__m.convertWavToMp3(window.__wav, '256k'); return { ok: true }; } catch (e) { return { ok: false, message: String(e && e.message) }; } });
  await page.waitForTimeout(500);
  R.reqAfter256k = reqs.slice(before).map((q) => q.url);
  R.encoderChunkBeforeFirstValid = R.reqAfter256k.some((u) => /mp3-encoder|mediabunny/.test(u));
  for (const b of ['128k', '192k', '320k', null]) {
    const key = b === null ? 'default' : b;
    const res = await page.evaluate(async (b) => {
      const t = performance.now();
      try {
        const blob = b === null ? await window.__m.convertWavToMp3(window.__wav) : await window.__m.convertWavToMp3(window.__wav, b);
        const u = new Uint8Array(await blob.arrayBuffer());
        let s = ''; for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
        const ac = new OfflineAudioContext(2, 48000, 48000);
        const ab = await ac.decodeAudioData(u.buffer.slice(0));
        let ss = 0, nn = 0;
        for (let c = 0; c < ab.numberOfChannels; c++) { const d = ab.getChannelData(c); for (let i = 0; i < d.length; i++) { ss += d[i] * d[i]; nn++; } }
        return { ok: true, type: blob.type, ms: Math.round(performance.now() - t), b64: btoa(s), decoded: { channels: ab.numberOfChannels, duration: ab.duration, sampleRate: ab.sampleRate, rmsDbfs: +(10 * Math.log10(ss / nn)).toFixed(2) } };
      } catch (e) { return { ok: false, message: String(e && e.message) }; }
    }, b);
    if (res.ok) {
      const mp3 = parseMp3(Buffer.from(res.b64, 'base64'));
      delete res.b64;
      res.mp3 = { bytes: mp3.bytes, audioFrames: mp3.audioFrames, frameSeconds: mp3.frameSeconds, hist: mp3.hist, meta: mp3.meta, endReason: mp3.endReason };
    }
    R.calls[key] = res;
  }
  const tLast = Date.now() - T0;
  const win = reqs.filter((q) => q.t >= tFirst && q.t <= tLast);
  R.reqWindow = win.map((q) => q.url.replace(BASE, ''));
  R.offOriginInWindow = win.filter((q) => !q.url.startsWith(BASE) && !q.url.startsWith('blob:') && !q.url.startsWith('data:')).map((q) => q.url);
  R.unpkgAny = reqs.filter((q) => /unpkg|ffmpeg-core|@ffmpeg/.test(q.url)).map((q) => q.url);
  await page.screenshot({ path: path.join(OUT, `facade-${W}x${H}.png`) });
  await ctx.storageState({ path: '/home/runner/czaba-project/tmp/studio-real-loop/c-browse.json' });
  await browser.close();
  fs.writeFileSync(path.join(OUT, `facade-${W}x${H}.json`), JSON.stringify(R, null, 2));
  console.log(JSON.stringify(R, null, 1));
})().catch((e) => { console.error('FATAL', e); process.exit(1); });
