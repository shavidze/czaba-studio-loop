const path = require('path');
const { chromium } = require(path.join('/home/runner/czaba-project/store/node_modules/playwright'));
const src = require('fs').readFileSync(path.join(__dirname, '../c-round-218/c218-mp3.cjs'), 'utf8');
const parseMp3 = new Function('Buffer', src.slice(src.indexOf('const KBPS'), src.indexOf('function parseWav')) + '; return parseMp3;')(Buffer);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(3000);
  const out = {};
  for (const bitrate of [128000, 192000, 320000]) {
    const b64 = await page.evaluate(async (bitrate) => {
      const mb = await import('/@id/mediabunny');
      const enc = await import('/@id/@mediabunny/mp3-encoder');
      enc.registerMp3Encoder();
      const sr = 48000, n = sr * 5, ch = 2;
      const buf = new ArrayBuffer(44 + n * ch * 2); const v = new DataView(buf);
      const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
      w(0, 'RIFF'); v.setUint32(4, 36 + n * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true); v.setUint32(24, sr, true); v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * ch * 2, true);
      for (let i = 0; i < n; i++) { const s = Math.round(Math.sin(2 * Math.PI * 440 * i / sr) * 12000); v.setInt16(44 + i * 4, s, true); v.setInt16(46 + i * 4, s, true); }
      const input = new mb.Input({ formats: [mb.WAVE], source: new mb.BlobSource(new Blob([buf])) });
      const target = new mb.BufferTarget();
      const output = new mb.Output({ format: new mb.Mp3OutputFormat(), target });
      const conv = await mb.Conversion.init({ input, output, audio: { codec: 'mp3', quality: new mb.Quality({ bitrate }) } });
      await conv.execute();
      const bytes = new Uint8Array(target.buffer); let s = ''; for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
      return btoa(s);
    }, bitrate);
    const r = parseMp3(Buffer.from(b64, 'base64'));
    out[bitrate] = { bytes: r.bytes, frames: r.audioFrames, kbps: r.hist.kbps, sr: r.hist.sr, mode: r.hist.mode, meta: r.meta && r.meta.kbps, end: r.endReason };
  }
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
