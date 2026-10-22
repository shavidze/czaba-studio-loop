import { createRequire } from 'node:module';
const { chromium } = createRequire('/home/runner/czaba-project/store/package.json')('@playwright/test');
const out = { console: [], steps: {} };
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) out.console.push(`${m.type()}: ${m.text().slice(0, 160)}`); });
await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const sc0 = page.getByTestId('arrangement-timeline-scroller');
const b0 = await sc0.boundingBox();
await page.mouse.move(b0.x + 400, b0.y + b0.height - 60);
await page.keyboard.down('Control');
for (let i = 0; i < 6; i += 1) { await page.mouse.wheel(0, -100); await page.waitForTimeout(80); }
await page.keyboard.up('Control');
await page.evaluate(() => { const el = document.activeElement; if (el instanceof HTMLElement) el.blur(); });
await page.keyboard.press('m');
await page.waitForTimeout(200);
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
const flag = page.getByTestId('arrangement-marker').first();
out.steps.flags = await page.getByTestId('arrangement-marker').count();
const scroller = page.getByTestId('arrangement-timeline-scroller');
const sw = await scroller.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth, left: el.scrollLeft }));
out.steps.scroller = sw;
await scroller.evaluate((el) => { el.scrollLeft = 0; });
await page.waitForTimeout(300);
const fb = await flag.boundingBox();
out.steps.flagBefore = fb;
await page.mouse.click(fb.x + fb.width / 2, fb.y + fb.height / 2, { button: 'right' });
await page.waitForTimeout(200);
out.steps.menuOpen = await page.getByTestId('arrangement-marker-menu').count();
const box = await scroller.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height - 60);
await page.mouse.wheel(300, 0);
await page.waitForTimeout(400);
out.steps.afterWheel = {
  menu: await page.getByTestId('arrangement-marker-menu').count(),
  left: await scroller.evaluate((el) => el.scrollLeft),
  activeIsFlag: await page.evaluate(() => document.activeElement?.getAttribute('data-testid')),
};
out.steps.flagAfterWheel = await flag.boundingBox();
await scroller.evaluate((el) => { el.scrollLeft = 0; });
await page.waitForTimeout(300);
const fb2 = await flag.boundingBox();
await page.mouse.click(fb2.x + fb2.width / 2, fb2.y + fb2.height / 2, { button: 'right' });
await page.waitForTimeout(200);
out.steps.reopen = await page.getByTestId('arrangement-marker-menu').count();
await page.mouse.move(box.x + box.width / 2, box.y + box.height - 60);
await page.keyboard.down('Control');
await page.mouse.wheel(0, -100);
await page.keyboard.up('Control');
await page.waitForTimeout(400);
out.steps.afterZoom = {
  menu: await page.getByTestId('arrangement-marker-menu').count(),
  activeIsFlag: await page.evaluate(() => document.activeElement?.getAttribute('data-testid')),
};
await page.screenshot({ path: '../tmp/studio-real-loop/a-round-75/smoke.png' });
await browser.close();
console.log(JSON.stringify(out, null, 1));
