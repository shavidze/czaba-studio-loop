const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-72/';
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
  const state = () => page.evaluate(() => ({
    pos: document.querySelector('[data-testid="arrangement-position"]')?.textContent,
    status: document.querySelector('[data-testid="arrangement-status"]')?.textContent,
    markers: Array.from(document.querySelectorAll('[data-testid="arrangement-marker"]')).map((e) => ({ t: e.getAttribute('data-marker-time'), label: e.getAttribute('aria-label'), cur: e.getAttribute('aria-current') })),
    undo: Array.from(document.querySelectorAll('button')).map((b) => b.title).find((t) => t.startsWith('Undo')),
    active: document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName,
  }));
  const response = await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  log.push(`goto status ${response && response.status()}`);
  await page.waitForSelector('[data-testid="arrangement-tempo-input"]', { timeout: 60000 });
  await page.waitForTimeout(4000);
  const row = await page.evaluate(() => {
    const r = document.querySelector('[data-testid="arrangement-marker-row"]').getBoundingClientRect();
    const tempo = document.querySelector('[data-testid="arrangement-tempo-input"]').getBoundingClientRect();
    const loop = document.querySelector('[data-testid="arrangement-loop-strip"]').getBoundingClientRect();
    const lane = document.querySelector('[data-track-id]').getBoundingClientRect();
    return { rowTop: r.top, rowH: r.height, tempoTop: tempo.top, loopTop: loop.top, firstLaneTop: lane.top };
  });
  log.push('layout ' + JSON.stringify(row));
  const opt = page.locator('[role=option][data-source-id="demo-middle-east"]');
  await opt.scrollIntoViewIfNeeded();
  const tWait = Date.now();
  while (Date.now() - tWait < 90000 && (await opt.getAttribute('draggable')) !== 'true') await page.waitForTimeout(200);
  const ob = await opt.boundingBox();
  const lb = await page.evaluate(() => { const lane = document.querySelector('[data-track-id="music"]'); const body = lane && lane.querySelector('[data-grid-seconds]'); const r = (body || lane).getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  await page.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2);
  await page.mouse.down();
  await page.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 });
  await page.mouse.move(Math.round(lb.x + 2), lb.y + lb.h / 2, { steps: 14 });
  await page.waitForTimeout(300);
  await page.mouse.up();
  await page.waitForTimeout(800);
  log.push('REAL-mouse (PW) drop Middle East on music; clips ' + JSON.stringify(await page.evaluate(() => Array.from(document.querySelectorAll('[data-clip-id]')).map((e) => e.getAttribute('data-clip-start')))));
  const zoomText = await page.evaluate(() => (document.querySelector('[data-testid=arrangement-zoom-readout]') || {}).textContent || '');
  const pps = Number((/([0-9.]+)/.exec(zoomText) || [])[1]);
  const ruler = await page.locator('[data-testid="arrangement-ruler"]').boundingBox();
  await page.mouse.click(ruler.x + 12 * pps, ruler.y + ruler.height / 2);
  await page.waitForTimeout(300);
  log.push(`pps ${pps}; after REAL ruler click at 12 s: ` + JSON.stringify(await state()));
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.keyboard.press('m');
  await page.waitForTimeout(200);
  log.push('after M: ' + JSON.stringify(await state()) + ' inputValue=' + (await page.inputValue('[data-testid="arrangement-marker-name-input"]')));
  await page.keyboard.type('აქ შედის მუსიკა');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  const s1 = await state();
  log.push('after Enter: ' + JSON.stringify(s1));
  const geo = await page.evaluate(() => {
    const flag = document.querySelector('[data-testid="arrangement-marker"]');
    const ruler = document.querySelector('[data-testid="arrangement-ruler"]').getBoundingClientRect();
    return { flagX: flag.getBoundingClientRect().left, rulerX: ruler.left };
  });
  log.push(`flag x - ruler x = ${(geo.flagX - geo.rulerX).toFixed(2)} px; expected time*pps = ${(Number(s1.markers[0].t) * pps).toFixed(2)}`);
  await page.keyboard.press('Home');
  await page.waitForTimeout(200);
  await page.click('[data-testid="arrangement-marker"]');
  await page.waitForTimeout(200);
  log.push('after REAL click on flag from 0: ' + JSON.stringify(await state()));
  await page.keyboard.press('Home');
  await page.waitForTimeout(200);
  const srcBefore = await page.evaluate(() => window.__bufferSources.length);
  await page.dblclick('[data-testid="arrangement-marker"]');
  await page.waitForTimeout(1000);
  log.push('REAL-mouse (PW) dblclick on flag, 1 s later: ' + JSON.stringify(await state()) + ` sources+${(await page.evaluate(() => window.__bufferSources.length)) - srcBefore}`);
  const srcMid = await page.evaluate(() => window.__bufferSources.length);
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.keyboard.press('m');
  await page.keyboard.type('x');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  log.push('M while playing: ' + JSON.stringify(await state()) + ` sources during add ${(await page.evaluate(() => window.__bufferSources.length)) - srcMid}`);
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
  await page.keyboard.press('Home');
  await page.keyboard.press('Control+ArrowRight');
  await page.waitForTimeout(150);
  const n1 = (await state()).pos;
  await page.keyboard.press('Control+ArrowRight');
  await page.waitForTimeout(150);
  const n2 = (await state()).pos;
  await page.keyboard.press('Control+ArrowRight');
  await page.waitForTimeout(150);
  const n3 = (await state()).pos;
  await page.keyboard.press('Control+ArrowRight');
  await page.waitForTimeout(150);
  const n4 = await state();
  log.push(`Ctrl+Right x4 from 0: ${n1}, ${n2}, ${n3}, ${n4.pos} status=${n4.status}`);
  await page.screenshot({ path: `${OUT}smoke-1440.png` });
  log.push(`forbidden requests ${forbidden.length} ${forbidden.join(' ')}`);
  log.push(`authorization headers ${authHeaders.length}`);
  log.push(`hydration console lines ${consoleLines.filter((l) => /hydrat/i.test(l)).length}`);
  log.push(`console errors ${consoleLines.filter((l) => l.startsWith('error')).join(' | ').slice(0, 600)}`);
  await browser.close();
  fs.writeFileSync(`${OUT}smoke-1440.txt`, `${log.join('\n')}\n`);
  console.log(log.join('\n'));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
