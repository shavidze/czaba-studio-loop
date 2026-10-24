const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(path.join('/home/runner/czaba-project/store/node_modules/@playwright/test'));

const out = path.join(__dirname, 'out');
fs.mkdirSync(out, { recursive: true });

async function run(width, height) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline');
    if (b) b.click();
  });
  const option = page.locator('[role=option][data-source-id="demo-soft-impact"]');
  await option.waitFor({ timeout: 60000 });
  await page.waitForFunction(() => {
    const el = document.querySelector('[role=option][data-source-id="demo-soft-impact"]');
    return el && /\d\d:\d\d\.\d{3}/.test(el.textContent);
  }, null, { timeout: 60000 });
  const before = await option.boundingBox();
  await option.click();
  await page.getByTestId('arrangement-library-preview-toggle').click();
  const marker = page.getByTestId('arrangement-library-option-previewing');
  await marker.waitFor();
  const m = await marker.evaluate((el) => {
    const opt = el.closest('[role="option"]');
    const r = document.createRange();
    r.selectNodeContents(el);
    const g = r.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    const o = opt.getBoundingClientRect();
    const list = opt.parentElement.closest('[role="listbox"]');
    const hitMid = document.elementFromPoint(g.x + g.width / 2, g.y + g.height / 2);
    const hitEnd = document.elementFromPoint(g.right - 2, g.y + g.height / 2);
    return {
      text: el.textContent,
      box: [b.x, b.y, b.width, b.height],
      glyph: [g.x, g.y, g.width, g.height],
      option: [o.x, o.y, o.width, o.height],
      optScroll: [opt.scrollWidth, opt.clientWidth],
      listScroll: list ? [list.scrollWidth, list.clientWidth] : null,
      hitMid: hitMid === el,
      hitEnd: hitEnd === el,
      parentIsOption: el.parentElement === opt,
    };
  });
  await marker.screenshot({ path: path.join(out, `marker-${width}.png`) });
  await option.screenshot({ path: path.join(out, `option-${width}.png`) });
  await page.getByTestId('arrangement-library-preview-toggle').click();
  await page.waitForTimeout(200);
  const gone = (await marker.count()) === 0;
  const after = await option.boundingBox();
  await browser.close();
  return { width, height, before, m, gone, after };
}

(async () => {
  const results = [await run(1440, 900), await run(1280, 720)];
  fs.writeFileSync(path.join(out, 'probe146.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
})();
