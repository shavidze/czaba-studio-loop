const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'out');
const SHOTS = path.join(__dirname, '..', 'shots');
const BASE = 'http://127.0.0.1:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|localhost:5199|firebase|Download the React DevTools/i;
const HYD = /hydrat|did not match|server rendered|Text content does not match/i;
const FORBIDDEN = /studio-token|\/api\/recording-|\/api\/download|r2\.dev|r2\.cloudflarestorage|workers\.dev/;

async function openStudio(browser, vp, label, net) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  const log = { label, vp: `${vp.width}x${vp.height}`, errors: [], hydration: [], noise: 0, forbidden: [], authHeaders: [] };
  net.push(log);
  page.on('console', (m) => {
    const t = m.text();
    if (HYD.test(t)) log.hydration.push(`${m.type()} ${t.slice(0, 300)}`);
    if (m.type() === 'error') {
      if (NOISE.test(t) && !HYD.test(t)) log.noise += 1;
      else log.errors.push(t.slice(0, 300));
    }
  });
  page.on('pageerror', (e) => log.errors.push(`pageerror ${String(e).slice(0, 300)}`));
  page.on('request', (q) => {
    if (FORBIDDEN.test(q.url())) log.forbidden.push(q.url());
    if (q.headers().authorization) log.authHeaders.push(q.url());
  });
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  await sleep(2500);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline');
    if (b) b.click();
  });
  const t0 = Date.now();
  while (Date.now() - t0 < 90000) {
    const n = await page.evaluate(() => {
      const opts = [...document.querySelectorAll('[role=option][data-source-id]')];
      return opts.length === 0 ? -1 : opts.filter((o) => /იტვირთება…/.test(o.textContent)).length;
    });
    if (n === 0) break;
    await sleep(250);
  }
  await sleep(500);
  return { ctx, page, log };
}

async function arm(page) {
  await page.locator('[role=option][data-source-id="demo-middle-east"]').focus();
  await sleep(150);
  await page.keyboard.press('ArrowDown');
  await sleep(200);
}

const st = (page, label) =>
  page.evaluate((label) => {
    const a = document.activeElement;
    const lib = document.querySelector('[data-testid=arrangement-library]');
    const vb = document.querySelector('[data-testid=arrangement-video-box]');
    const sel = document.querySelector('[role=option][aria-selected=true]');
    return {
      label,
      active: a ? a.getAttribute('data-testid') || a.getAttribute('aria-label') || a.tagName : null,
      activeTag: a ? a.tagName : null,
      clips: document.querySelectorAll('[data-clip-id]').length,
      collapsed: lib ? lib.dataset.collapsed : null,
      libWidth: lib ? Math.round(lib.getBoundingClientRect().width) : null,
      query: document.querySelector('[data-testid=arrangement-library-search]')?.value ?? null,
      clearPresent: !!document.querySelector('[data-testid=arrangement-library-search-clear]'),
      selected: sel ? sel.getAttribute('data-source-id') : null,
      videoExpanded: vb ? vb.dataset.videoExpanded : null,
      videoFloating: vb ? vb.dataset.videoFloating : null,
      status: document.querySelector('[data-testid=arrangement-status]')?.textContent?.slice(0, 160) ?? null,
    };
  }, label);

function save(name, data) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 1));
}

module.exports = { chromium, sleep, openStudio, arm, st, save, OUT, SHOTS, BASE };
