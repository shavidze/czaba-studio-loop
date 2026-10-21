const { chromium } = require('C:/Apps/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const OUT = 'C:/Apps/czaba-project/tmp/studio-real-loop/a-round-71/';
const FORBIDDEN = /studio-token|recording-|\/api\/download|r2\.cloudflarestorage|r2\.dev|r2-proxy|workers\.dev/;
(async () => {
  const log = [];
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const forbidden = [];
  const authHeaders = [];
  const consoleLines = [];
  page.on('request', (r) => {
    if (FORBIDDEN.test(r.url())) forbidden.push(r.url());
    if (r.headers().authorization) authHeaders.push(r.url());
  });
  page.on('console', (m) => consoleLines.push(`${m.type()}: ${m.text()}`));
  await page.addInitScript(() => {
    const proto = (window.BaseAudioContext || window.AudioContext).prototype;
    const original = proto.createBufferSource;
    window.__bufferSources = [];
    proto.createBufferSource = function wrapped() {
      window.__bufferSources.push(performance.now());
      return original.call(this);
    };
  });
  const response = await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  log.push(`goto status ${response && response.status()}`);
  await page.waitForSelector('[data-testid="arrangement-tempo-input"]', { timeout: 60000 });
  await page.waitForTimeout(4000);
  const opt = page.locator('[role=option][data-source-id="demo-soft-impact"]');
  await opt.scrollIntoViewIfNeeded();
  const tWait = Date.now();
  while (Date.now() - tWait < 60000 && (await opt.getAttribute('draggable')) !== 'true') await page.waitForTimeout(200);
  const ob = await opt.boundingBox();
  const lb = await page.evaluate(() => { const lane = document.querySelector('[data-track-id="sfx"]'); const body = lane && lane.querySelector('[data-grid-seconds]'); const r = (body || lane).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const zoomText = await page.evaluate(() => (document.querySelector('[data-testid=arrangement-zoom-readout]') || {}).textContent || '');
  const pps = Number((/([0-9.]+)/.exec(zoomText) || [])[1]);
  const dropAt = Math.min(20, (lb.w - 40) / pps);
  await page.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2);
  await page.mouse.down();
  await page.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 });
  await page.mouse.move(Math.round(lb.x + dropAt * pps), lb.y + lb.h / 2, { steps: 14 });
  await page.waitForTimeout(300);
  await page.mouse.up();
  await page.waitForTimeout(600);
  log.push('REAL-mouse (PW) drop Soft impact on sfx at ~' + dropAt.toFixed(2) + ' s (pps ' + pps + '); clips ' + JSON.stringify(await page.evaluate(() => Array.from(document.querySelectorAll('[data-clip-id]')).map((e) => e.getAttribute('data-clip-start')))));
  await page.click('[data-testid="arrangement-tempo-input"]');
  await page.keyboard.type('40');
  await page.keyboard.press('Enter');
  await page.click('[data-testid="arrangement-metronome-toggle"]');
  const pressed = await page.getAttribute('[data-testid="arrangement-metronome-toggle"]', 'aria-pressed');
  log.push(`metronome aria-pressed ${pressed}`);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
  const before = await page.evaluate(() => window.__bufferSources.length);
  const t0 = await page.evaluate(() => performance.now());
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
  log.push('status after Space: ' + (await page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent)));
  log.push('active element: ' + (await page.evaluate(() => document.activeElement?.tagName)));
  const samples = [];
  for (let i = 0; i < 50; i++) {
    await page.waitForTimeout(100);
    samples.push(
      await page.evaluate(() => {
        const meter = document.querySelector('[data-testid="arrangement-master-meter"]');
        const pos = document.querySelector('[data-testid="arrangement-position"]');
        return {
          t: performance.now(),
          level: meter ? meter.getAttribute('data-level-db') : null,
          pos: pos ? pos.textContent : null,
          sources: window.__bufferSources.length,
        };
      }),
    );
  }
  await page.keyboard.press('Space');
  const levels = samples.map((s) => s.level);
  const numeric = levels.map((v) => Number(v)).filter((v) => Number.isFinite(v));
  log.push(`sources before Space ${before}; after 0.5 s ${samples[4].sources - before}; after 5 s ${samples[49].sources - before}`);
  log.push(`position first/last ${samples[0].pos} / ${samples[49].pos}`);
  log.push(`meter samples ${levels.length}, numeric ${numeric.length}, max ${numeric.length ? Math.max(...numeric) : 'n/a'} dB, distinct ${new Set(levels).size}`);
  log.push(`meter levels ${levels.join(',')}`);
  log.push(`source timestamps (ms after Space, first 40): ${(await page.evaluate(() => window.__bufferSources)).filter((x) => x >= 0).map((x) => Math.round(x - 0)).length}`);
  log.push(`forbidden requests ${forbidden.length} ${forbidden.join(' ')}`);
  log.push(`authorization headers ${authHeaders.length} ${authHeaders.join(' ')}`);
  log.push(`hydration console lines ${consoleLines.filter((l) => /hydrat/i.test(l)).length}`);
  log.push(`console errors ${consoleLines.filter((l) => l.startsWith('error')).join(' | ')}`);
  log.push(`t0 ${Math.round(t0)}`);
  await page.screenshot({ path: `${OUT}smoke-1440.png` });
  await browser.close();
  fs.writeFileSync(`${OUT}smoke-1440.txt`, `${log.join('\n')}\n`);
  console.log(log.join('\n'));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
