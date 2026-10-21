const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-72/';
(async () => {
  const log = [];
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const st = () => page.evaluate(() => ({
    pos: document.querySelector('[data-testid="arrangement-position"]')?.textContent,
    status: document.querySelector('[data-testid="arrangement-status"]')?.textContent,
    editor: !!document.querySelector('[data-testid="arrangement-marker-name-input"]'),
    markers: Array.from(document.querySelectorAll('[data-testid="arrangement-marker"]')).map((e) => e.getAttribute('aria-label')),
    undo: Array.from(document.querySelectorAll('button')).map((b) => b.title).find((t) => t.startsWith('Undo')),
    active: document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName,
    clips: Array.from(document.querySelectorAll('[data-clip-id]')).map((e) => e.getAttribute('data-clip-start')),
  }));
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="arrangement-marker-row"]', { timeout: 60000 });
  await page.waitForTimeout(4000);
  const opt = page.locator('[role=option][data-source-id="demo-middle-east"]');
  await opt.scrollIntoViewIfNeeded();
  const t = Date.now();
  while (Date.now() - t < 90000 && (await opt.getAttribute('draggable')) !== 'true') await page.waitForTimeout(200);
  const ob = await opt.boundingBox();
  const lb = await page.evaluate(() => { const r = document.querySelector('[data-track-id="music"] [data-grid-seconds]').getBoundingClientRect(); return { x: r.left, y: r.top, h: r.height }; });
  await page.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2); await page.mouse.down();
  await page.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 });
  await page.mouse.move(Math.round(lb.x + 2), lb.y + lb.h / 2, { steps: 14 }); await page.waitForTimeout(300); await page.mouse.up(); await page.waitForTimeout(800);
  const ruler = await page.locator('[data-testid="arrangement-ruler"]').boundingBox();
  const pps = 40;
  await page.mouse.click(ruler.x + 12 * pps, ruler.y + ruler.height / 2); await page.waitForTimeout(200);
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  const cases = [
    ['ruler click at 20 s', async () => { await page.mouse.click(ruler.x + 20 * pps, ruler.y + ruler.height / 2); }],
    ['clip drag 10 px', async () => { const c = await page.locator('[data-clip-id]').first().boundingBox(); const x = c.x + 300, y = c.y + c.height / 2; await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 10, y, { steps: 4 }); await page.mouse.up(); }],
    ['empty lane marquee (sfx)', async () => { const r = await page.evaluate(() => { const b = document.querySelector('[data-track-id="sfx"] [data-grid-seconds]').getBoundingClientRect(); return { x: b.left, y: b.top, h: b.height }; }); await page.mouse.move(r.x + 900, r.y + r.h / 2); await page.mouse.down(); await page.mouse.move(r.x + 960, r.y + r.h / 2, { steps: 4 }); await page.mouse.up(); }],
    ['library search click', async () => { await page.click('[data-testid="arrangement-library-search"]'); }],
  ];
  let n = 0;
  for (const [name, act] of cases) {
    n += 1;
    await page.keyboard.press('Escape').catch(() => {});
    await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
    await page.keyboard.press('m'); await page.waitForTimeout(150);
    const opened = await st();
    await page.keyboard.type(`probe${n}`);
    await act(); await page.waitForTimeout(400);
    const after = await st();
    log.push(`[${name}] opened editor=${opened.editor} at ${opened.pos} -> after: ${JSON.stringify(after)}`);
    if (after.editor) { await page.keyboard.press('Enter').catch(() => {}); await page.waitForTimeout(200); log.push(`   (editor still open; pressed Enter) -> ${JSON.stringify(await st())}`); }
  }
  await browser.close();
  fs.writeFileSync(`${OUT}blur-probe.txt`, log.join('\n') + '\n');
  console.log(log.join('\n'));
})().catch((e) => { console.error(e); process.exit(1); });
