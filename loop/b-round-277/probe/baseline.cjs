const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const DIR = process.env.OUT_DIR || __dirname;
const out = {};
const libButtons = (page) => page.evaluate(() => {
  const sec = document.querySelector('[data-testid="arrangement-library-preview"]');
  const pick = (b) => b && ({ text: (b.textContent || '').trim(), title: b.getAttribute('title'), disabled: b.disabled,
    ariaDisabled: b.getAttribute('aria-disabled'), cursor: getComputedStyle(b).cursor });
  const bs = sec ? [...sec.querySelectorAll('button')] : [];
  return { preview: pick(bs.find((b) => b.dataset.testid === 'arrangement-library-preview-toggle')),
    add: pick(bs.find((b) => (b.textContent || '').trim() === 'Add')) };
});
const metro = (page) => page.evaluate(() => {
  const b = document.querySelector('[data-testid="arrangement-metronome-toggle"]');
  const t = document.querySelector('[data-testid="arrangement-tempo-input"]');
  return b && { title: b.getAttribute('title'), disabled: b.disabled, ariaDisabled: b.getAttribute('aria-disabled'),
    pressed: b.getAttribute('aria-pressed'), childCount: b.children.length, cursor: getComputedStyle(b).cursor, tempo: t && t.value };
});
const status = (page) => page.evaluate(() => document.querySelector('[role="status"]')?.textContent?.trim().slice(0, 200));
(async () => {
  const browser = await chromium.launch();
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto('http://127.0.0.1:5173/studio-lab');
    await page.getByText('Demo collection ready').first().waitFor({ timeout: 150000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const r = {};
    r.empty = { metro: await metro(page), lib: await libButtons(page), status: await status(page) };
    r.deleteLabel = await page.evaluate(() => { const b = [...document.querySelectorAll('[data-testid="arrangement-transport"] button')].find((x) => (x.textContent || '').trim() === 'Delete'); return b && { label: b.getAttribute('aria-label'), title: b.title, ariaDisabled: b.getAttribute('aria-disabled'), cursor: getComputedStyle(b).cursor }; });
    // Tab stops over the whole page: record metronome / preview / add reachability
    await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
    const stops = [];
    for (let i = 0; i < 120; i++) {
      await page.keyboard.press('Tab');
      const s = await page.evaluate(() => { const a = document.activeElement; if (!a) return null; const id = a.dataset.testid || ''; const txt = (a.textContent || '').trim(); if (id === 'arrangement-metronome-toggle' || id === 'arrangement-library-preview-toggle' || txt === 'Add') return id || txt; return null; });
      if (s) stops.push(s);
    }
    r.tabStopsOfInterest = stops;
    // select first library option
    const row = page.locator('[data-source-id]').first();
    r.firstSourceId = await row.getAttribute('data-source-id');
    await row.click();
    await page.waitForTimeout(1200);
    r.afterSelect = { lib: await libButtons(page), status: await status(page) };
    // make video lane active
    const video = page.locator('[data-track-id="video"] [data-testid="arrangement-track-header"] button[aria-label*="— set as the active track"]').first();
    r.videoLaneFound = await video.count();
    if (r.videoLaneFound) {
      await video.click();
      await page.waitForTimeout(800);
      r.afterVideo = { lib: await libButtons(page), status: await status(page),
        addClick: await (async () => { const before = await status(page); const add = page.locator('[data-testid="arrangement-library-preview"] button', { hasText: 'Add' }); const clipsBefore = await page.locator('[data-clip-id]').count(); await add.click({ force: true }).catch((e) => String(e).slice(0, 80)); await page.waitForTimeout(600); return { before, after: await status(page), clipsBefore, clipsAfter: await page.locator('[data-clip-id]').count(), active: await page.evaluate(() => document.activeElement?.tagName + ':' + (document.activeElement?.textContent || '').trim().slice(0, 20)) }; })(),
        activeTrackText: await page.evaluate(() => document.querySelector('[data-testid="arrangement-library-preview"] p[title]:not(.truncate)')?.getAttribute('title')) };
    }
    await page.screenshot({ path: `${DIR}/head-${w}.png` });
    out[`${w}x${h}`] = r;
    await page.close();
  }
  await browser.close();
  require('fs').writeFileSync(`${DIR}/baseline.json`, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1).slice(0, 6000));
})();
