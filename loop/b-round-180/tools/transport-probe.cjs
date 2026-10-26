const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'out');
const BASE = 'http://127.0.0.1:5173/studio-lab';

async function measure(page) {
  return page.evaluate(() => {
    const play = [...document.querySelectorAll('button')].find(
      (b) => b.getAttribute('aria-label') === 'Play',
    );
    if (!play) return { error: 'play missing' };
    const row = play.parentElement;
    const rowBox = row.getBoundingClientRect();
    const kids = [...row.children].map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        label: el.getAttribute('aria-label') || el.getAttribute('data-testid') || (el.textContent || '').trim().slice(0, 30),
        x: Math.round(r.x * 10) / 10,
        y: Math.round(r.y * 10) / 10,
        w: Math.round(r.width * 10) / 10,
        h: Math.round(r.height * 10) / 10,
      };
    });
    const ys = [...new Set(kids.map((k) => k.y))];
    const below = row.nextElementSibling ? row.nextElementSibling.getBoundingClientRect().y : null;
    return { row: { x: rowBox.x, y: rowBox.y, w: rowBox.width, h: rowBox.height }, lines: ys.length, ys, kids, nextY: below };
  });
}

(async () => {
  const browser = await chromium.launch();
  const result = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Play' }).waitFor({ timeout: 30000 });
    await page.waitForTimeout(800);
    const now = await measure(page);
    await page.evaluate(() => {
      const play = [...document.querySelectorAll('button')].find(
        (b) => b.getAttribute('aria-label') === 'Play',
      );
      play.classList.remove('w-24', 'rounded-md', 'px-2.5', 'gap-1');
      play.style.width = '32px';
      play.style.height = '32px';
      play.style.padding = '0';
      play.style.borderRadius = '9999px';
      const span = play.querySelector('span');
      if (span) span.remove();
    });
    await page.waitForTimeout(200);
    const simulated = await measure(page);
    await page.screenshot({ path: path.join(OUT, `transport-sim-${w}.png`), clip: { x: 0, y: 0, width: w, height: 140 } });
    result[`${w}x${h}`] = { now, simulatedM1: simulated };
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'transport-probe.json'), JSON.stringify(result, null, 1));
  for (const [k, v] of Object.entries(result)) {
    console.log(k, 'now lines', v.now.lines, 'rowH', v.now.row.h, 'play', JSON.stringify(v.now.kids[0]), '| sim lines', v.simulatedM1.lines, 'rowH', v.simulatedM1.row.h, 'play', JSON.stringify(v.simulatedM1.kids[0]), 'last', JSON.stringify(v.now.kids.at(-1)), '->', JSON.stringify(v.simulatedM1.kids.at(-1)));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
