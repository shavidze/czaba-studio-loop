const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.getByRole('button', { name: 'Add', exact: true }).waitFor();
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.waitForTimeout(2000);
  const clip = page.locator('[data-clip-kind="audio"]').first();
  const info = async (tag) => console.log(tag, JSON.stringify(await clip.evaluate((c) => ({ start: c.dataset.clipStart, fadeIn: c.dataset.fadeIn, w: c.getBoundingClientRect().width, left: c.getBoundingClientRect().left, top: c.getBoundingClientRect().top, h: c.getBoundingClientRect().height, ranges: document.querySelectorAll('[data-range-start]').length, rangeEnd: document.querySelector('[data-range-end]')?.getAttribute('data-range-end') ?? null }))), 'cg', await page.getByRole('slider', { name: 'Clip Gain — fader', exact: true }).count(), 'zoom', await page.getByRole('slider', { name: 'Zoom (px/s)', exact: true }).inputValue().catch(() => 'nozoom'));
  await info('afterAdd');
  for (const [name, loc] of [['range', clip.getByTitle('drag = time selection · click = playhead')], ['fade', clip.getByTestId('arrangement-clip-fade-in-handle')], ['trim', clip.getByTitle('Trim — left edge')], ['move', clip.getByTitle(/ — drag to move$/)]]) {
    console.log(name, 'count', await loc.count(), JSON.stringify(await loc.first().boundingBox()));
  }
  // range drag
  const body = await clip.getByTitle('drag = time selection · click = playhead').boundingBox();
  const x0 = Math.max(body.x, 0) + 300, y0 = body.y + body.height * 0.6;
  await page.mouse.move(x0, y0); await page.mouse.down();
  await page.mouse.move(x0 + 60, y0, { steps: 30 });
  await info('midRange');
  await page.mouse.move(x0 + 120, y0, { steps: 30 }); await page.mouse.up();
  await page.waitForTimeout(500); await info('afterRange'); console.log('TEXT', JSON.stringify(await clip.innerText())); console.log('ZT', await page.getByRole('button', { name: /Zoom to selection/ }).first().getAttribute('title')); console.log('lanerange', await page.getByTestId('arrangement-lane-range').count());
  await page.keyboard.press('Escape'); await page.waitForTimeout(300); await info('afterEsc'); console.log('TEXT2', JSON.stringify(await clip.innerText()));
  await page.keyboard.press('Escape'); await page.waitForTimeout(300); await info('afterEsc2');
  await browser.close();
})();
