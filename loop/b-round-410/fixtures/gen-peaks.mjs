// B round 410->411: decode the two demo MP3s in Playwright Chromium (same origin as /studio-lab) and write
// audiowaveform JSON v1 (mono = min/max over both channels), 16-bit, samples_per_pixel = sampleRate/100.
// Usage: node gen-peaks.mjs <baseUrl> <outDir>
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const outDir = process.argv[3] ?? '.';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/robots.txt`);
const files = [['/middle-east.mp3', 'middle-east.peaks.json'], ['/videos/hero/hero-music.mp3', 'hero-music.peaks.json']];
const meta = {};
for (const [url, name] of files) {
  const r = await page.evaluate(async (u) => {
    const ctx = new AudioContext();
    const buf = await ctx.decodeAudioData(await (await fetch(u)).arrayBuffer());
    const rate = buf.sampleRate; const spp = rate / 100; const len = Math.ceil(buf.length / spp);
    const chans = []; for (let c = 0; c < buf.numberOfChannels; c++) chans.push(buf.getChannelData(c));
    const q = (v) => Math.max(-32768, Math.min(32767, Math.round(v * 32768)));
    const data = new Array(len * 2);
    for (let p = 0; p < len; p++) {
      let mn = 0, mx = 0;
      const end = Math.min(buf.length, (p + 1) * spp);
      for (let i = p * spp; i < end; i++) for (const ch of chans) { const v = ch[i]; if (v < mn) mn = v; if (v > mx) mx = v; }
      data[2 * p] = q(mn); data[2 * p + 1] = q(mx);
    }
    await ctx.close();
    return { ctxRate: rate, length: buf.length, channels: buf.numberOfChannels, duration: buf.duration, json: { version: 1, channels: 1, sample_rate: rate, samples_per_pixel: spp, bits: 16, length: len, data } };
  }, url);
  const text = JSON.stringify(r.json);
  writeFileSync(`${outDir}/${name}`, text);
  meta[url] = { file: name, decodedLength: r.length, sampleRate: r.ctxRate, channels: r.channels, duration: r.duration, pixels: r.json.length, bytes: Buffer.byteLength(text), userAgent: await page.evaluate(() => navigator.userAgent) };
}
writeFileSync(`${outDir}/gen-meta.json`, JSON.stringify(meta, null, 1));
console.log(JSON.stringify(meta, null, 1));
await browser.close();
