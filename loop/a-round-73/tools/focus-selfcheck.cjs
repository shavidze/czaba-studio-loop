const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-73/';
(async () => {
  const log = [];
  const browser = await chromium.launch();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const context = await browser.newContext({ viewport: vp });
    const page = await context.newPage();
    const state = () => page.evaluate(() => ({
      status: document.querySelector('[data-testid="arrangement-status"]')?.textContent,
      markers: Array.from(document.querySelectorAll('[data-testid="arrangement-marker"]')).map((e) => e.getAttribute('data-marker-time')),
      clips: Array.from(document.querySelectorAll('[data-clip-id]')).map((e) => e.getAttribute('data-clip-start')),
      active: document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName,
    }));
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="arrangement-tempo-input"]', { timeout: 60000 });
    await page.waitForTimeout(3000);
    const opt = page.locator('[role=option][title^="Middle East"]');
    await opt.scrollIntoViewIfNeeded();
    const t0 = Date.now();
    while (Date.now() - t0 < 90000 && (await opt.getAttribute('draggable')) !== 'true') await page.waitForTimeout(200);
    const ob = await opt.boundingBox();
    const lb = await page.evaluate(() => { const body = document.querySelector('[data-track-id="music"] [data-grid-seconds]'); const r = body.getBoundingClientRect(); return { x: r.left, y: r.top, h: r.height }; });
    await page.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2);
    await page.mouse.down();
    await page.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 });
    await page.mouse.move(Math.round(lb.x + 2), lb.y + lb.h / 2, { steps: 14 });
    await page.waitForTimeout(300);
    await page.mouse.up();
    await page.waitForTimeout(800);
    const ruler = await page.locator('[data-testid="arrangement-ruler"]').boundingBox();
    await page.mouse.click(ruler.x + 200, ruler.y + ruler.height / 2);
    await page.waitForTimeout(200);
    await page.keyboard.press('m');
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const v = `${vp.width}x${vp.height}`;
    log.push(`${v} after M+Enter: ` + JSON.stringify(await state()));
    const body = page.locator('[data-clip-id] [title^="drag = დროის მონიშვნა"]').first();
    const bb = await body.boundingBox();
    await page.mouse.click(bb.x + 40, bb.y + bb.height / 2);
    await page.waitForTimeout(200);
    log.push(`${v} after REAL clip body click: ` + JSON.stringify(await state()));
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    log.push(`${v} after ArrowRight: ` + JSON.stringify(await state()));
    await page.keyboard.press('Delete');
    await page.waitForTimeout(300);
    const after = await state();
    log.push(`${v} after Delete: ` + JSON.stringify(after));
    await page.screenshot({ path: `${OUT}selfcheck-${v}.png` });
    await page.click('[data-testid="arrangement-marker"]');
    await page.waitForTimeout(150);
    const before = await state();
    const lane = await page.evaluate(() => { const b = document.querySelector('[data-track-id="sfx"] [data-grid-seconds]') || document.querySelectorAll('[data-track-id] [data-grid-seconds]')[1]; const r = b.getBoundingClientRect(); return { x: r.left + 600, y: r.top + r.height / 2 }; });
    await page.mouse.click(lane.x, lane.y);
    await page.waitForTimeout(150);
    log.push(`${v} flag click active=${before.active}; then lane background click active=` + (await state()).active);
    await page.click('[data-testid="arrangement-marker"]');
    await page.mouse.click(ruler.x + 400, ruler.y + ruler.height / 2);
    await page.waitForTimeout(150);
    log.push(`${v} flag then ruler click active=` + (await state()).active);
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(`${OUT}selfcheck.txt`, log.join('\n') + '\n');
  console.log(log.join('\n'));
})().catch((e) => { console.error(e); process.exit(1); });
