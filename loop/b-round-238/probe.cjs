const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const base = process.argv[2];
const out = process.argv[3];

async function grid(page) {
  return page.evaluate(() => {
    const g = document.querySelector('[data-testid="arrangement-grid-control"]');
    const s = document.querySelector('[data-testid="arrangement-status"]');
    const r = document.querySelector('[data-testid="arrangement-bars-ruler"]');
    const sel = document.querySelector('[data-testid="arrangement-grid-division"]');
    return {
      division: g?.getAttribute('data-grid-division'),
      seconds: g?.getAttribute('data-grid-seconds'),
      mode: g?.getAttribute('data-grid-mode'),
      lines: g?.getAttribute('data-grid-lines'),
      snap: g?.getAttribute('data-snap'),
      bpm: r?.getAttribute('data-bpm') ?? null,
      selectValue: sel instanceof HTMLSelectElement ? sel.value : null,
      selectTitle: sel?.getAttribute('title'),
      status: s?.textContent ?? null,
      statusHtml: s?.innerHTML.length ?? 0,
    };
  });
}

(async () => {
  const browser = await chromium.launch();
  const results = [];
  for (const [w, h] of [
    [1440, 900],
    [1280, 720],
  ]) {
    const context = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
    await page
      .getByText('Demo collection ready', { exact: false })
      .first()
      .waitFor({ timeout: 30000 })
      .catch(() => {});
    await page.waitForTimeout(1000);
    const steps = [];
    steps.push({ step: 'mount', ...(await grid(page)) });
    await page.locator('[data-testid="arrangement-timeline-scroller"], main').first().click({ position: { x: 5, y: 5 } }).catch(() => {});
    await page.keyboard.press('Escape');
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Equal');
      await page.waitForTimeout(150);
      steps.push({ step: `zoom+ ${i + 1}`, ...(await grid(page)) });
    }
    await page.keyboard.press('Digit5');
    await page.waitForTimeout(200);
    steps.push({ step: 'press 5', ...(await grid(page)) });
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Minus');
      await page.waitForTimeout(150);
      steps.push({ step: `zoom- ${i + 1} (fixed)`, ...(await grid(page)) });
    }
    await page.keyboard.press('Digit5');
    await page.waitForTimeout(200);
    steps.push({ step: 'press 5 again', ...(await grid(page)) });
    await page.keyboard.press('Digit1');
    await page.waitForTimeout(200);
    steps.push({ step: 'press 1 (adaptive narrow)', ...(await grid(page)) });
    results.push({ viewport: `${w}x${h}`, errors, steps });
    await context.close();
  }
  await browser.close();
  require('node:fs').writeFileSync(out, JSON.stringify(results, null, 2));
  for (const r of results) {
    console.log(r.viewport, 'errors', r.errors.length);
    for (const s of r.steps) {
      console.log(
        ' ',
        s.step.padEnd(26),
        s.mode,
        s.division,
        s.seconds,
        s.lines,
        'bpm',
        s.bpm,
        '|',
        (s.status || '').slice(0, 110),
      );
    }
  }
})();
