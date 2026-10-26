const path = require('path');
const fs = require('fs');
const { chromium } = require(path.join('/home/runner/czaba-project/store/node_modules/@playwright/test'));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const BASE = process.env.A_BASE || 'http://127.0.0.1:5173';
const OUT = __dirname;

async function openStudio(W) {
  const H = W === 1440 ? 900 : 720;
  const browser = await chromium.launch({ args: ['--disable-lcd-text'] });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const log = { errors: [], console: [], hydration: [] };
  page.on('pageerror', (e) => log.errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') log.console.push(m.text().slice(0, 200));
    if (/hydrat/i.test(m.text())) log.hydration.push(m.text().slice(0, 200));
  });
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  await sleep(2000);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline');
    if (b) b.click();
  });
  const t0 = Date.now();
  while (Date.now() - t0 < 90000) {
    const n = await page.evaluate(() => {
      const o = [...document.querySelectorAll('[role=option][data-source-id]')];
      return o.length === 0 ? -1 : o.filter((x) => /იტვირთება…|Loading…/.test(x.textContent)).length;
    });
    if (n === 0) break;
    await sleep(250);
  }
  await page.evaluate(() => document.fonts.ready);
  await sleep(500);
  return { browser, ctx, page, log, W, H };
}

const nameSel = (t) =>
  `[data-track-id="${t}"] [data-testid=arrangement-track-header] button[aria-label$="set as the active track"]`;

async function libDrop(page, src, lane, xFrac) {
  const o = page.locator(`[role=option][data-source-id="${src}"]`);
  await o.scrollIntoViewIfNeeded();
  const t0 = Date.now();
  while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  const ob = await o.boundingBox();
  const lb = await page.evaluate((t) => {
    const l = document.querySelector(`[data-track-id="${t}"]`);
    const g = l.querySelector('[data-grid-seconds]') || l;
    const r = g.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }, lane);
  await page.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2);
  await page.mouse.down();
  await page.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 });
  await page.mouse.move(lb.x + lb.w * xFrac, lb.y + lb.h / 2, { steps: 14 });
  await sleep(300);
  await page.mouse.up();
  await sleep(900);
}

async function richScene(page, H) {
  await libDrop(page, 'demo-middle-east', 'music', 0.05);
  await page.click(nameSel('stems'));
  await sleep(200);
  await page.click(nameSel('sfx'), { modifiers: ['Shift'] });
  await sleep(200);
  await page.mouse.click(5, H - 5);
  await sleep(150);
  await page.keyboard.press('Control+g');
  await sleep(700);
  await page.click('[data-testid=arrangement-marker-add]');
  await sleep(500);
  const t = page.locator('[data-testid=arrangement-detail-toggle]');
  if ((await t.getAttribute('aria-expanded')) === 'false') {
    await t.click();
    await sleep(900);
  }
  const clip = page.locator('[data-clip-id]').first();
  const cb = await clip.boundingBox();
  await page.mouse.click(cb.x + 30, cb.y + cb.height * 0.65);
  await sleep(600);
}

async function focusInfo(page) {
  return page.evaluate(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return null;
    const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
    const chrome = sc.firstElementChild.firstElementChild;
    const b = a.getBoundingClientRect();
    const cb = chrome.getBoundingClientRect();
    const inScroller = sc.contains(a) && !chrome.contains(a);
    return {
      label: a.getAttribute('aria-label') || (a.textContent || '').trim().slice(0, 40),
      testid: a.getAttribute('data-testid'),
      tag: a.tagName,
      box: { x: b.left, y: b.top, w: b.width, h: b.height },
      chromeBottom: cb.bottom,
      inScroller,
      hidden: inScroller ? b.top < cb.bottom - 0.5 : false,
      scrollTop: sc.scrollTop,
      scrollLeft: sc.scrollLeft,
      spt: sc.style.scrollPaddingTop,
      chromeH: chrome.offsetHeight,
    };
  });
}

function save(name, data) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 1));
}

module.exports = { openStudio, richScene, libDrop, focusInfo, sleep, save, OUT, nameSel };
