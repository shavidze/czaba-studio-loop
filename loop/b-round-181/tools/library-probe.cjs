const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'out');
const BASE = 'http://127.0.0.1:5173/studio-lab';

async function measure(page) {
  return page.evaluate(() => {
    const round = (n) => Math.round(n * 10) / 10;
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { x: round(r.x), y: round(r.y), w: round(r.width), h: round(r.height) };
    };
    const list = document.querySelector('[data-testid="arrangement-library-list"]');
    if (!list) return { error: 'list missing' };
    const lb = list.getBoundingClientRect();
    const options = [...list.querySelectorAll('[role="option"]')];
    const opts = options.map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        id: el.getAttribute('data-source-id'),
        ...box(el),
        mt: cs.marginTop,
        mb: cs.marginBottom,
        fullyVisible: r.top >= lb.top - 0.5 && r.bottom <= lb.bottom + 0.5,
      };
    });
    const gaps = [];
    for (let i = 1; i < opts.length; i += 1) {
      gaps.push(round(opts[i].y - (opts[i - 1].y + opts[i - 1].h)));
    }
    const outside = {};
    for (const id of [
      'arrangement-library',
      'arrangement-library-tree',
      'arrangement-library-search',
      'arrangement-library-preview',
    ]) {
      const el = document.querySelector(`[data-testid="${id}"]`);
      outside[id] = el ? box(el) : null;
    }
    const preview = document.querySelector('[aria-label="Preview"]');
    outside.previewRegion = preview ? box(preview) : null;
    return {
      list: { ...box(list), clientHeight: list.clientHeight, scrollHeight: list.scrollHeight, className: list.className },
      optionCount: opts.length,
      fullyVisibleCount: opts.filter((o) => o.fullyVisible).length,
      gaps,
      opts,
      outside,
    };
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const result = { note: 'B in-page simulation (prediction, not evidence) of M3: listbox space-y-1 = margin-block-end 4px on every option except the last', at: new Date().toISOString() };
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.locator('[data-testid="arrangement-library-list"] [role="option"]').first().waitFor({ timeout: 30000 });
    await page.waitForTimeout(1500);
    const now = await measure(page);
    await page.screenshot({ path: path.join(OUT, `library-now-${w}.png`) });
    await page.evaluate(() => {
      const list = document.querySelector('[data-testid="arrangement-library-list"]');
      const kids = [...list.children];
      kids.forEach((el, i) => {
        if (i < kids.length - 1) el.style.marginBlockEnd = '4px';
      });
    });
    await page.waitForTimeout(300);
    const simulated = await measure(page);
    await page.screenshot({ path: path.join(OUT, `library-sim-${w}.png`) });
    await page.evaluate(() => {
      const list = document.querySelector('[data-testid="arrangement-library-list"]');
      list.scrollTop = list.scrollHeight;
    });
    await page.waitForTimeout(200);
    const simulatedScrolledEnd = await page.evaluate(() => {
      const list = document.querySelector('[data-testid="arrangement-library-list"]');
      const last = list.lastElementChild.getBoundingClientRect();
      const lb = list.getBoundingClientRect();
      return { scrollTop: list.scrollTop, lastBottomToListBottom: Math.round((lb.bottom - last.bottom) * 10) / 10 };
    });
    result[`${w}x${h}`] = { now, simulatedM3: simulated, simulatedScrolledEnd };
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'library-probe.json'), JSON.stringify(result, null, 1));
  for (const k of ['1440x900', '1280x720']) {
    const r = result[k];
    console.log(k, 'options', r.now.optionCount, 'visible now', r.now.fullyVisibleCount, 'sim', r.simulatedM3.fullyVisibleCount,
      'list', JSON.stringify(r.now.list), 'scrollH now/sim', r.now.list.scrollHeight, r.simulatedM3.list.scrollHeight,
      'gaps now', JSON.stringify(r.now.gaps), 'sim', JSON.stringify(r.simulatedM3.gaps), 'end', JSON.stringify(r.simulatedScrolledEnd));
    console.log(' outside equal:', JSON.stringify(r.now.outside) === JSON.stringify(r.simulatedM3.outside));
    console.log(' opts now', JSON.stringify(r.now.opts.map((o) => [o.id, o.y, o.h])));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
