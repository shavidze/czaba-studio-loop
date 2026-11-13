import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const repoPath = (path) => fileURLToPath(new URL(`../../${path}`, import.meta.url));
const files = [
  ['/middle-east.mp3', 'public/peaks/middle-east.peaks.json'],
  ['/videos/hero/hero-music.mp3', 'public/peaks/hero-music.peaks.json'],
];
const sampleRate = 44100;
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(`${base}/robots.txt`);
  const meta = {};
  const outputs = [];
  for (const [url, path] of files) {
    const result = await page.evaluate(async ({ audioUrl, contextRate }) => {
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error(`${audioUrl}: HTTP ${response.status}`);
      const bytes = await response.arrayBuffer();
      const ctx = new AudioContext({ sampleRate: contextRate });
      if (ctx.sampleRate !== contextRate) throw new Error(`AudioContext rate ${ctx.sampleRate}`);
      const buffer = await ctx.decodeAudioData(bytes.slice(0));
      const rate = buffer.sampleRate;
      const spp = rate / 100;
      const length = Math.ceil(buffer.length / spp);
      const channels = [];
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        channels.push(buffer.getChannelData(c));
      }
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
    }, { audioUrl: url, contextRate: sampleRate });
    outputs.push([path, JSON.stringify(result.json)]);
    meta[url] = {
      file: path,
      mp3Bytes: result.mp3Bytes,
      decodedLength: result.decodedLength,
      sampleRate: result.sampleRate,
      userAgent: await page.evaluate(() => navigator.userAgent),
    };
  }
  for (const [path, text] of outputs) {
    writeFileSync(repoPath(path), text);
  }
  writeFileSync(repoPath('scripts/peaks/demo-peaks-meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
  console.log(JSON.stringify(meta, null, 2));
} finally {
  await browser.close();
}
