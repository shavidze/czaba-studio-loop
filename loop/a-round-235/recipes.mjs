import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';

const out = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-235/shots';
const url = 'http://127.0.0.1:5173/studio-lab';
const PX = 40;
const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
];

async function open(browser, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="arrangement-bars-ruler"]', { state: 'attached' });
  await page.waitForTimeout(1000);
  return { context, page, errors };
}

async function add(page, sourceId) {
  await page.click(`[data-source-id="${sourceId}"]`);
  await page.locator('button:enabled', { hasText: /^Add/ }).first().click();
  await page.waitForTimeout(800);
}

const playhead = (page) =>
  page.getByTestId('arrangement-playhead-handle').getAttribute('aria-valuenow').then(Number);
const playing = async (page) =>
  (await page.locator('button[aria-label="Pause"]').count()) > 0;
const status = (page) => page.getByTestId('arrangement-status').textContent();
const barsBox = (page) => page.getByTestId('arrangement-bars-ruler').boundingBox();

const browser = await chromium.launch();
const report = [];
for (const viewport of viewports) {
  const row = { viewport: viewport.width };
  {
    const { context, page, errors } = await open(browser, viewport);
    await add(page, 'demo-stem-pulse');
    let bars = await barsBox(page);
    row.seed = { bpm: await page.getByTestId('arrangement-bars-ruler').getAttribute('data-bpm') };
    const zones = await page.evaluate(({ x, y }) => {
      const strip = document.querySelector('[data-testid="arrangement-bars-scrub-strip"]');
      const ruler = document.querySelector('[data-testid="arrangement-bars-ruler"]');
      const at4 = document.elementFromPoint(x, y + 4);
      const at15 = document.elementFromPoint(x, y + 15);
      const stripRect = strip?.getBoundingClientRect();
      return {
        at4: at4?.getAttribute('data-testid') ?? at4?.tagName,
        at15: at15?.getAttribute('data-testid') ?? at15?.tagName,
        stripHeight: stripRect?.height,
        stripWidth: stripRect?.width,
        rulerWidth: ruler?.getBoundingClientRect().width,
        stripTitle: strip?.getAttribute('title'),
        rulerTitle: ruler?.getAttribute('title'),
        cursorStrip: strip ? getComputedStyle(strip).cursor : null,
        cursorRuler: ruler ? getComputedStyle(ruler).cursor : null,
        stripBgRest: strip ? getComputedStyle(strip).backgroundColor : null,
      };
    }, { x: bars.x + 100, y: bars.y });
    await page.mouse.move(bars.x + 100, bars.y + 4);
    await page.waitForTimeout(250);
    zones.stripBgHover = await page
      .getByTestId('arrangement-bars-scrub-strip')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    await page.screenshot({ path: `${out}/after-${viewport.width}-strip-hover.png` });
    row.zones = zones;

    await page.mouse.click(bars.x + 4.1 * PX, bars.y + 4);
    await page.waitForTimeout(500);
    row.stripStopped = { playing: await playing(page), playhead: await playhead(page) };
    bars = await barsBox(page);
    await page.mouse.click(bars.x + 8.2 * PX, bars.y + 4);
    const tClick = Date.now();
    await page.waitForTimeout(300);
    row.stripPlaying = {
      playing: await playing(page),
      playhead: await playhead(page),
      elapsedMs: Date.now() - tClick,
    };
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    row.afterSpace = { playing: await playing(page) };
    bars = await barsBox(page);
    await page.mouse.click(bars.x + 6.3 * PX, bars.y + 15);
    await page.waitForTimeout(200);
    row.lower = { playing: await playing(page), playhead: await playhead(page) };
    await page.keyboard.down('Alt');
    await page.mouse.click(bars.x + 6.3 * PX, bars.y + 15);
    await page.keyboard.up('Alt');
    await page.waitForTimeout(200);
    row.lowerAlt = { playing: await playing(page), playhead: await playhead(page) };

    const before = await page.getByTestId('arrangement-timeline-scroller').evaluate((el) => el.scrollLeft);
    const p0 = await playhead(page);
    await page.mouse.move(bars.x + 400, bars.y + 15);
    await page.mouse.down();
    for (let i = 1; i <= 10; i += 1) {
      await page.mouse.move(bars.x + 400 - i * 20, bars.y + 15);
    }
    await page.mouse.up();
    await page.waitForTimeout(300);
    row.drag = {
      scrollBefore: before,
      scrollAfter: await page.getByTestId('arrangement-timeline-scroller').evaluate((el) => el.scrollLeft),
      playheadBefore: p0,
      playheadAfter: await playhead(page),
      playing: await playing(page),
    };
    await page.waitForTimeout(400);
    bars = await barsBox(page);
    await page.mouse.dblclick(bars.x + 300, bars.y + 15);
    await page.waitForTimeout(300);
    row.dbl = { status: await status(page) };
    row.errors = errors;
    await page.screenshot({ path: `${out}/after-${viewport.width}-seeded-used.png` });
    await context.close();
  }
  {
    const { context, page, errors } = await open(browser, viewport);
    await page.screenshot({ path: `${out}/after-${viewport.width}-empty.png` });
    await add(page, 'demo-stem-pulse');
    await page.mouse.move(0, 0);
    await page.screenshot({ path: `${out}/after-${viewport.width}-seeded.png` });
    const ruler = await page.getByTestId('arrangement-ruler').boundingBox();
    await page.mouse.click(ruler.x + 3.175 * PX, ruler.y + 14);
    await page.waitForTimeout(200);
    row.secondsRuler = {
      playhead: await playhead(page),
      playing: await playing(page),
      title: await page.getByTestId('arrangement-ruler').getAttribute('title'),
    };
    row.errors2 = errors;
    await context.close();
  }
  {
    const { context, page, errors } = await open(browser, viewport);
    await add(page, 'demo-soft-impact');
    const bars = await barsBox(page);
    const root = page.getByTestId('arrangement-bars-ruler');
    const p0 = await playhead(page);
    await page.mouse.click(bars.x + 4.1 * PX, bars.y + 4);
    await page.mouse.click(bars.x + 6.3 * PX, bars.y + 15);
    const s0 = await page.getByTestId('arrangement-timeline-scroller').evaluate((el) => el.scrollLeft);
    await page.mouse.move(bars.x + 400, bars.y + 15);
    await page.mouse.down();
    await page.mouse.move(bars.x + 200, bars.y + 15, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    row.noTempo = {
      strips: await page.locator('[data-testid="arrangement-bars-scrub-strip"]').count(),
      title: await root.getAttribute('title'),
      cursor: await root.evaluate((el) => getComputedStyle(el).cursor),
      text: await root.textContent(),
      playheadBefore: p0,
      playheadAfter: await playhead(page),
      playing: await playing(page),
      scrollBefore: s0,
      scrollAfter: await page.getByTestId('arrangement-timeline-scroller').evaluate((el) => el.scrollLeft),
    };
    row.errors3 = errors;
    await context.close();
  }
  {
    const { context, page, errors } = await open(browser, viewport);
    await add(page, 'demo-stem-pulse');
    await page.getByTestId('arrangement-timeline-scroller').evaluate((el) => {
      el.scrollLeft = 400;
    });
    await page.waitForTimeout(300);
    const bars = await barsBox(page);
    await page.mouse.click(bars.x + 20 * PX, bars.y + 4);
    await page.waitForTimeout(300);
    row.pastEnd = { playing: await playing(page), status: await status(page) };
    row.errors4 = errors;
    await context.close();
  }
  {
    const { context, page, errors } = await open(browser, viewport);
    const input = page.getByTestId('arrangement-tempo-input');
    await input.fill('90');
    await input.press('Enter');
    await page.waitForTimeout(300);
    const bars = await barsBox(page);
    row.emptyTempo = { barsBox: bars };
    if (bars && bars.width > 0) {
      await page.mouse.click(bars.x + Math.min(bars.width - 2, 4.1 * PX), bars.y + 4);
      await page.waitForTimeout(300);
      row.emptyTempo.playing = await playing(page);
      row.emptyTempo.status = await status(page);
    }
    row.errors5 = errors;
    await context.close();
  }
  report.push(row);
}
await browser.close();
console.log(JSON.stringify(report, null, 2));
