// PERF-15b: regenerates public/peaks/*.peaks.json for the two demo MP3 files.
// Run with the dev server up: node scripts/peaks/generate-demo-peaks.mjs [baseUrl]
// Decodes each MP3 with Chromium's decodeAudioData and writes audiowaveform JSON v1:
// mono (min/max over all channels), 16-bit, samples_per_pixel = sampleRate / 100.
// The backend replaces these files with real audiowaveform output (perf-15 handoff note).
import { writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const files = [
  ['/middle-east.mp3', 'public/peaks/middle-east.peaks.json'],
  ['/videos/hero/hero-music.mp3', 'public/peaks/hero-music.peaks.json'],
];
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/robots.txt`);
const meta = {};
for (const [url, path] of files) {
  const result = await page.evaluate(async (audioUrl) => {
    const response = await fetch(audioUrl);
    const bytes = await response.arrayBuffer();
    const ctx = new AudioContext();
    const buffer = await ctx.decodeAudioData(bytes.slice(0));
    const rate = buffer.sampleRate;
    const spp = rate / 100;
    const length = Math.ceil(buffer.length / spp);
    const channels = [];
    for (let c = 0; c < buffer.numberOfChannels; c++) channels.push(buffer.getChannelData(c));
    const quantize = (v) => Math.max(-32768, Math.min(32767, Math.round(v * 32768)));
    const data = new Array(length * 2);
    for (let p = 0; p < length; p++) {
      let min = 0;
      let max = 0;
      const end = Math.min(buffer.length, (p + 1) * spp);
      for (let i = p * spp; i < end; i++) {
        for (const channel of channels) {
          const v = channel[i];
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
      data[2 * p] = quantize(min);
      data[2 * p + 1] = quantize(max);
    }
    await ctx.close();
    return {
      mp3Bytes: bytes.byteLength,
      decodedLength: buffer.length,
      sampleRate: rate,
      json: { version: 1, channels: 1, sample_rate: rate, samples_per_pixel: spp, bits: 16, length, data },
    };
  }, url);
  writeFileSync(path, JSON.stringify(result.json));
  meta[url] = {
    file: path,
    mp3Bytes: result.mp3Bytes,
    decodedLength: result.decodedLength,
    sampleRate: result.sampleRate,
    userAgent: await page.evaluate(() => navigator.userAgent),
  };
}
writeFileSync('scripts/peaks/demo-peaks-meta.json', `${JSON.stringify(meta, null, 2)}\n`);
await browser.close();
console.log(JSON.stringify(meta, null, 2));
