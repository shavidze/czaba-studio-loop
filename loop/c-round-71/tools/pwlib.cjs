const path = require('path');
const fs = require('fs');
const { createRequire } = require('module');
const req = createRequire('C:/Apps/czaba-project/store/package.json');
const { chromium } = req('playwright');

const LOOP = 'C:/Apps/czaba-project/tmp/studio-real-loop';
const URL = 'http://127.0.0.1:5173/studio-lab';
const OUT = path.join(LOOP, 'c-round-71');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function logger(name) {
  const file = path.join(OUT, 'runs', `${name}.txt`);
  fs.writeFileSync(file, '');
  return (...a) => {
    const line = a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ');
    fs.appendFileSync(file, line + '\n');
    console.log(line);
  };
}

async function open(vp = '1440x900') {
  const [w, h] = vp.split('x').map(Number);
  const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  const page = await context.newPage();
  const consoleLines = [];
  const requests = [];
  page.on('console', (m) => consoleLines.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => consoleLines.push(`[pageerror] ${e.message}`));
  page.on('request', (r) => requests.push({ url: r.url(), auth: r.headers().authorization || null }));
  return { browser, context, page, consoleLines, requests };
}

async function evalFile(page, rel) {
  const src = fs.readFileSync(path.join(LOOP, rel), 'utf8');
  return page.evaluate(src);
}

async function fresh(page, log, opts = {}) {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 60000 });
  await sleep(4000);
  for (const f of ['c-round-31/scripts/setup-base31.js', 'c-round-2/scripts/ext.js', 'c-round-3/scripts/c3.js', 'c-round-5/scripts/m4.js', 'c-round-5/scripts/u.js', 'c-round-6/scripts/c6.js']) {
    await evalFile(page, f);
  }
  await page.setInputFiles('#c-stage', ['beeps-6s-vp9-opus.webm', 'clip-4s-vp9-opus.webm', 'beeps-6s-h264-aac.mp4', 'tone-2s.wav'].map((m) => path.join(LOOP, 'media', m)));
  await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); return 1; });
  for (const f of ['c-round-11/scripts/r11.js', 'c-round-15/scripts/c15.js', 'c-round-16/scripts/c16.js', 'c-round-16/scripts/pv.js', 'c-round-17/scripts/c17.js', 'c-round-19/scripts/c19.js', 'c-round-18/scripts/c18.js', 'c-round-20/scripts/st20.js', 'c-round-20/scripts/g20.js', 'c-round-33/scripts/hook31.js', 'c-round-30/scripts/hook30.js', 'c-round-33/scripts/hst.js']) {
    await evalFile(page, f);
  }
  if (opts.layout !== false) {
    const r = await evalFile(page, 'c-round-33/scripts/s31.js');
    log && log('L47 setup', JSON.stringify(r).slice(0, 400));
  }
  await evalFile(page, 'c-round-34/scripts/ptail.js');
  await evalFile(page, 'c-round-33/scripts/hl.js');
}

async function state(page) {
  return page.evaluate(() => {
    const g = document.querySelector('[data-testid=arrangement-grid-control]');
    const clips = Array.from(document.querySelectorAll('[data-clip-id]')).map((e) => {
      const lane = e.closest('[data-track-id]');
      return { id: e.getAttribute('data-clip-id').slice(0, 8), t: (e.querySelector('div span.truncate') || e).textContent.trim().slice(0, 18), start: e.getAttribute('data-clip-start'), lane: lane ? lane.getAttribute('data-track-id') : null };
    });
    const undo = Array.from(document.querySelectorAll('button')).find((b) => /^Undo/.test(b.getAttribute('title') || ''));
    const status = document.querySelector('[data-testid=arrangement-status]');
    return {
      snap: g && g.getAttribute('data-snap'), grid: g && g.getAttribute('data-grid-seconds'), lines: g && g.getAttribute('data-grid-lines'),
      zoom: (document.querySelector('[data-testid=arrangement-zoom-readout]') || {}).textContent,
      undo: undo && undo.getAttribute('title'), status: status && status.textContent.trim().slice(0, 160), clips,
    };
  });
}

async function header(page, re) {
  const id = await page.evaluate((src) => {
    const rx = new RegExp(src);
    const e = Array.from(document.querySelectorAll('[data-clip-id]')).find((x) => rx.test(x.textContent.trim()));
    return e ? e.getAttribute('data-clip-id') : null;
  }, re.source);
  if (!id) throw new Error('clip not found ' + re);
  const h = page.locator(`[data-clip-id="${id}"] > div`).first();
  const box = await h.boundingBox();
  return { id, box, sel: `[data-clip-id="${id}"]` };
}

async function laneBox(page, trackId) {
  return page.evaluate((t) => {
    const lane = document.querySelector(`[data-track-id="${t}"]`);
    const body = lane && lane.querySelector('[data-grid-seconds]');
    const r = (body || lane).getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }, trackId);
}

async function realDrag(page, x0, y0, x1, y1, opts = {}) {
  await page.mouse.move(x0, y0);
  if (opts.shift) await page.keyboard.down('Shift');
  await page.mouse.down();
  await page.mouse.move((x0 + x1) / 2, (y0 + y1) / 2, { steps: 6 });
  if (opts.mid) await opts.mid();
  await page.mouse.move(x1, y1, { steps: 6 });
  if (opts.beforeUp) await opts.beforeUp();
  await page.mouse.up();
  if (opts.shift) await page.keyboard.up('Shift');
  await sleep(250);
}

async function pps(page) {
  const z = await page.evaluate(() => (document.querySelector('[data-testid=arrangement-zoom-readout]') || {}).textContent || '');
  const m = /([\d.]+)/.exec(z);
  return m ? Number(m[1]) : NaN;
}

module.exports = { open, fresh, state, header, laneBox, realDrag, pps, sleep, logger, evalFile, OUT, LOOP, URL };
