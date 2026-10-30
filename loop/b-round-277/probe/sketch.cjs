const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const DIR = __dirname;
const TARGETS = { head: 'http://127.0.0.1:5173/studio-lab', sketch: 'http://127.0.0.1:5174/studio-lab' };
const status = (page) => page.evaluate(() => document.querySelector('[role="status"]')?.textContent?.trim().slice(0, 200) ?? null);
async function avg(page, locator) {
  const box = await locator.boundingBox();
  const buf = await page.screenshot({ clip: box });
  const b64 = buf.toString('base64');
  return page.evaluate(async (data) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let max = [0, 0, 0], maxL = -1, sum = [0, 0, 0], n = 0;
    for (let i = 0; i < d.length; i += 4) { const L = d[i] + d[i + 1] + d[i + 2]; sum[0] += d[i]; sum[1] += d[i + 1]; sum[2] += d[i + 2]; n++; if (L > maxL) { maxL = L; max = [d[i], d[i + 1], d[i + 2]]; } }
    const corner = [d[4 * (c.width * Math.floor(c.height / 2)) + 4 * 1], d[4 * (c.width * Math.floor(c.height / 2)) + 4 * 1 + 1], d[4 * (c.width * Math.floor(c.height / 2)) + 4 * 1 + 2]];
    return { w: img.width, h: img.height, mean: sum.map((v) => Math.round(v / n)), brightest: max, leftEdgeMid: corner };
  }, b64);
}
(async () => {
  const browser = await chromium.launch();
  const out = {};
  for (const [name, url] of Object.entries(TARGETS)) {
    for (const [w, h] of [[1440, 900], [1280, 720]]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      await page.goto(url);
      await page.getByText('Demo collection ready').first().waitFor({ timeout: 300000 }).catch(() => {});
      await page.waitForTimeout(1500);
      const r = {}; console.error('ctx', name, w);
      const metro = page.getByTestId('arrangement-metronome-toggle');
      const transport = (t) => page.locator('[data-testid="arrangement-transport"] button', { hasText: t }).first();
      const lib = page.locator('[data-testid="arrangement-library-preview"]');
      const add = lib.locator('button', { hasText: 'Add' });
      const preview = page.getByTestId('arrangement-library-preview-toggle');
      const read = (loc) => loc.evaluate((b) => ({ ariaDisabled: b.getAttribute('aria-disabled'), disabled: b.disabled, title: b.title, label: b.getAttribute('aria-label'), cursor: getComputedStyle(b).cursor, bg: getComputedStyle(b).backgroundColor, box: (() => { const q = b.getBoundingClientRect(); return [q.x, q.y, q.width, q.height].map((v) => Math.round(v * 10) / 10); })() }));
      r.metro = await read(metro);
      r.metroLook = await avg(page, metro);
      r.split = await read(transport('Split'));
      r.del = await read(transport('Delete'));
      r.fit = await read(transport('Fit'));
      r.add = await read(add);
      r.preview = await read(preview);
      // hover soft-disabled metronome
      await metro.hover(); await page.waitForTimeout(400);
      r.metroHover = await read(metro);
      await page.mouse.move(5, 5); await page.waitForTimeout(300);
      // Tab reach metronome
      await page.locator('body').click({ position: { x: 5, y: 5 } });
      let reached = false;
      for (let i = 0; i < 140 && !reached; i++) { await page.keyboard.press('Tab'); reached = await page.evaluate(() => document.activeElement?.dataset?.testid === 'arrangement-metronome-toggle'); }
      r.metroTabReached = reached;
      if (reached) {
        r.metroFocus = await metro.evaluate((b) => ({ fv: b.matches(':focus-visible'), outline: getComputedStyle(b).outlineStyle + ' ' + getComputedStyle(b).outlineWidth + ' ' + getComputedStyle(b).outlineColor }));
        const st = await status(page);
        await page.keyboard.press('Enter'); await page.waitForTimeout(500);
        r.metroEnter = { pressed: await metro.getAttribute('aria-pressed'), statusSame: st === (await status(page)) };
      }
      // video track active -> Add
      await page.locator('[data-track-id="video"] [data-testid="arrangement-track-header"] button[aria-label*="— set as the active track"]').first().click();
      await page.waitForTimeout(600);
      r.addVideo = await read(add);
      r.addVideoLook = await avg(page, add);
      await add.hover(); await page.waitForTimeout(400);
      r.addVideoHover = await read(add);
      const st2 = await status(page); const clips = await page.locator('[data-clip-id]').count();
      { const ab = await add.boundingBox(); await page.mouse.click(ab.x + ab.width / 2, ab.y + ab.height / 2); } await page.waitForTimeout(600);
      r.addVideoClick = { statusSame: st2 === (await status(page)), clipsBefore: clips, clipsAfter: await page.locator('[data-clip-id]').count(), active: await page.evaluate(() => document.activeElement?.tagName + ':' + (document.activeElement?.dataset?.testid || (document.activeElement?.textContent || '').trim().slice(0, 15))) };
      // perf predicate value now (video track: expect false on sketch)
      r.perfPredicateVideo = await page.evaluate(() => { const add = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Add'); const wave = document.querySelector('[data-testid="arrangement-library-preview-wave"] rect'); return { old: add instanceof HTMLButtonElement && !add.disabled && wave !== null, neu: add instanceof HTMLButtonElement && add.getAttribute('aria-disabled') !== 'true' && wave !== null }; });
      // Variant X: type BPM draft then click metronome
      const tempo = page.getByTestId('arrangement-tempo-input');
      await tempo.click(); await tempo.fill('120'); await page.waitForTimeout(200);
      { const mb = await metro.boundingBox(); await page.mouse.click(mb.x + mb.width / 2, mb.y + mb.height / 2); } await page.waitForTimeout(700);
      r.variantX = { pressed: await metro.getAttribute('aria-pressed'), tempo: await tempo.inputValue(), ariaDisabled: await metro.getAttribute('aria-disabled'), status: await status(page), active: await page.evaluate(() => document.activeElement?.dataset?.testid || document.activeElement?.tagName) };
      await page.screenshot({ path: `${DIR}/${name}-${w}.png` });
      out[`${name}@${w}x${h}`] = r;
      await ctx.close();
    }
  }
  await browser.close();
  require('fs').writeFileSync(`${DIR}/sketch.json`, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})();
