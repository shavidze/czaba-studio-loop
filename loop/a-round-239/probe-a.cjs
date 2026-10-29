const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const base = process.argv[2];
const out = process.argv[3];
const shots = process.argv[4];

async function grid(page) {
  return page.evaluate(() => {
    const g = document.querySelector('[data-testid="arrangement-grid-control"]');
    const s = document.querySelector('[data-testid="arrangement-status"]');
    const r = document.querySelector('[data-testid="arrangement-bars-ruler"]');
    const sel = document.querySelector('[data-testid="arrangement-grid-division"]');
    const bodies = Array.from(document.querySelectorAll('[data-track-id] [data-grid-seconds]'));
    const periods = bodies.map((b) => {
      const m = /transparent 1px ([\d.]+)px/.exec(b.style.backgroundImage || '');
      return m ? Number(m[1]) : null;
    });
    return {
      division: g?.getAttribute('data-grid-division'),
      seconds: g?.getAttribute('data-grid-seconds'),
      mode: g?.getAttribute('data-grid-mode'),
      lines: g?.getAttribute('data-grid-lines'),
      snap: g?.getAttribute('data-snap'),
      bpm: r?.getAttribute('data-bpm') ?? null,
      selectValue: sel instanceof HTMLSelectElement ? sel.value : null,
      selectTitle: sel?.getAttribute('title'),
      aria: sel?.getAttribute('aria-keyshortcuts'),
      status: s?.textContent ?? null,
      periods,
      liveMutations: window.__liveMutations ?? null,
    };
  });
}

async function watchLive(page) {
  await page.evaluate(() => {
    window.__liveMutations = 0;
    const live = document.querySelector('output[aria-live]');
    if (!live) {
      window.__liveMutations = -1;
      return;
    }
    new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'childList') window.__liveMutations += 1;
      }
    }).observe(live, { childList: true });
  });
}

function check(step, seconds) {
  const sec = Number(step.seconds);
  const p = step.periods.find((x) => x !== null);
  return { period: p ?? null, pxPerSecond: p ? p / sec : null, ok24: p ? p >= 24 - 0.5 : null };
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
    await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 30000 });
    await page.waitForTimeout(800);
    await watchLive(page);
    const steps = [];
    const push = async (name) => {
      const g = await grid(page);
      steps.push({ step: name, ...g, ...check(g) });
    };
    await push('mount');
    if (shots) await page.screenshot({ path: `${shots}/mount-${w}.png` });
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Equal');
      await page.waitForTimeout(150);
      await push(`= ${i + 1}`);
      if (shots && i === 3) await page.screenshot({ path: `${shots}/zoom4-adaptive-${w}.png` });
    }
    await page.keyboard.press('Digit5');
    await page.waitForTimeout(200);
    await push('5 -> fixed');
    if (shots) await page.screenshot({ path: `${shots}/fixed-${w}.png` });
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Minus');
      await page.waitForTimeout(150);
      await push(`- ${i + 1} (fixed)`);
    }
    await page.keyboard.press('Digit5');
    await page.waitForTimeout(200);
    await push('5 -> adaptive');
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Minus');
      await page.waitForTimeout(150);
      await push(`- ${i + 1} (adaptive)`);
    }
    await page.keyboard.press('Digit1');
    await page.waitForTimeout(150);
    await push('1 (density narrow)');
    const keys = await page.evaluate(() => {
      const fire = (target, init) =>
        target.dispatchEvent(
          new KeyboardEvent('keydown', { key: '5', code: 'Digit5', bubbles: true, cancelable: true, ...init }),
        );
      const mode = () =>
        document.querySelector('[data-testid="arrangement-grid-control"]')?.getAttribute('data-grid-mode');
      const r = {};
      const m0 = mode();
      r.ctrlNotPrevented = fire(document.body, { ctrlKey: true });
      r.ctrlModeSame = mode() === m0;
      return r;
    });
    await page.waitForTimeout(100);
    const before = (await grid(page)).mode;
    await page.evaluate(() => {
      for (let i = 0; i < 4; i++) {
        document.body.dispatchEvent(
          new KeyboardEvent('keydown', { key: '5', code: 'Digit5', bubbles: true, cancelable: true, repeat: i > 0 }),
        );
      }
    });
    await page.waitForTimeout(150);
    keys.heldOneToggle = (await grid(page)).mode !== before;
    await page.locator('[data-testid="arrangement-grid-division"]').focus();
    const m1 = (await grid(page)).mode;
    await page.keyboard.press('Digit5');
    await page.waitForTimeout(150);
    const afterSel = await grid(page);
    keys.selectToggled = afterSel.mode !== m1;
    keys.selectValueNot5 = afterSel.selectValue !== '5';
    const search = page.getByLabel('Search the library');
    await search.focus();
    const m2 = (await grid(page)).mode;
    await page.keyboard.press('Digit5');
    keys.searchGot5 = (await search.inputValue()).includes('5');
    keys.searchModeSame = (await grid(page)).mode === m2;
    await search.fill('');
    results.push({ viewport: `${w}x${h}`, errors, steps, keys });
    await context.close();
  }
  await browser.close();
  require('node:fs').writeFileSync(out, JSON.stringify(results, null, 2));
  for (const r of results) {
    console.log(r.viewport, 'errors', r.errors.length, JSON.stringify(r.keys));
    for (const s of r.steps) {
      console.log(
        ' ',
        s.step.padEnd(20),
        s.mode,
        s.division,
        'period',
        s.period,
        'px/s',
        s.pxPerSecond?.toFixed(2),
        s.lines,
        'live',
        s.liveMutations,
        '|',
        (s.status || '').slice(0, 90),
      );
    }
  }
})();
