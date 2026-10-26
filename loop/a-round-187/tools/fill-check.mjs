import { existsSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-187';
const state = '/home/runner/czaba-project/tmp/studio-real-loop/a-browse.json';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...(existsSync(state) ? { storageState: state } : {}) });
const page = await context.newPage();
const errors = []; const hydration = []; const remote = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { const t = m.text(); if (/hydrat|did not match/i.test(t)) hydration.push(t); });
page.on('request', (r) => { const u = new URL(r.url()); if (!['127.0.0.1', 'localhost'].includes(u.hostname)) remote.push(u.hostname); });
await page.goto('http://127.0.0.1:5173/products/middle-east', { waitUntil: 'load' });
await page.waitForTimeout(1000);
const btn = page.locator('button[aria-label="Play preview"]').first();
const btnAttrs = await btn.evaluate((b) => ({ type: b.getAttribute('type'), html: b.outerHTML }));
await btn.click();
await page.waitForTimeout(2000);
const result = await page.evaluate(() => {
  const probe = document.createElement('div');
  probe.style.backgroundColor = 'var(--color-brand)';
  document.body.appendChild(probe);
  const probeColor = getComputedStyle(probe).backgroundColor;
  probe.remove();
  const progress = document.querySelector('input[aria-label="Preview position"]');
  const volume = document.querySelector('input[aria-label="Preview volume"]');
  const audio = document.querySelector('audio');
  return {
    probeColor,
    progressBg: progress ? getComputedStyle(progress).backgroundImage : null,
    volumeBg: volume ? getComputedStyle(volume).backgroundImage : null,
    progressStyleAttr: progress?.getAttribute('style') ?? null,
    audioCurrentTime: audio ? audio.currentTime : null,
    pauseLabelPresent: !!document.querySelector('button[aria-label="Pause preview"]'),
  };
});
result.progressContainsProbe = !!result.progressBg && result.progressBg.includes(result.probeColor);
result.volumeContainsProbe = !!result.volumeBg && result.volumeBg.includes(result.probeColor);
result.button = btnAttrs; result.pageErrors = errors; result.hydrationMessages = hydration; result.remoteHosts = [...new Set(remote)];
const bar = page.locator('.audio-player');
if (await bar.count()) await bar.screenshot({ path: `${out}/player-bar-1440.png` });
await page.screenshot({ path: `${out}/product-playing-1440.png` });
await context.storageState({ path: state });
writeFileSync(`${out}/browse-fill-check.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
