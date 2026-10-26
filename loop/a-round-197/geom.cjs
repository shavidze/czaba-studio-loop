const path = require('path');
const { chromium } = require(path.join('/home/runner/czaba-project/store/node_modules/@playwright/test'));
const W = +(process.argv[2] || 1440);
const H = W === 1440 ? 900 : 720;
(async () => {
  const browser = await chromium.launch({ args: ['--disable-lcd-text'] });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  await page.waitForTimeout(500);
  await page.click('[data-testid=arrangement-marker-add]');
  await page.waitForTimeout(500);
  if (!(await page.$('[data-testid=arrangement-marker]'))) { await page.keyboard.press('Enter'); await page.waitForTimeout(500); }
  if (!(await page.$('[data-testid=arrangement-marker]'))) { console.log(await page.evaluate(() => document.activeElement.outerHTML.slice(0, 300))); }
  const g = await page.evaluate(() => {
    const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, r: b.right, b: b.bottom }; };
    const flag = document.querySelector('[data-testid=arrangement-marker]');
    const label = flag.querySelector('[data-marker-label]');
    const stem = flag.querySelector('span[aria-hidden]');
    const loop = document.querySelector('[data-testid=arrangement-loop-strip], [data-testid=arrangement-loop-brace]');
    const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
    const chrome = sc.querySelector('.sticky.top-0');
    const row = flag.parentElement;
    const cs = getComputedStyle(flag);
    return { flag: r(flag), label: r(label), stem: r(stem), loop: r(loop), loopId: loop && loop.getAttribute('data-testid'), row: r(row), chrome: r(chrome), scroller: r(sc), scrollTop: sc.scrollTop, scrollLeft: sc.scrollLeft, spt: sc.style.scrollPaddingTop, cls: flag.className, pad: [cs.paddingLeft, cs.paddingRight], labelBorder: getComputedStyle(label).borderColor, labelRadius: getComputedStyle(label).borderRadius, rowOverflow: getComputedStyle(row).overflow };
  });
  console.log(JSON.stringify({ W, g, errors }, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
