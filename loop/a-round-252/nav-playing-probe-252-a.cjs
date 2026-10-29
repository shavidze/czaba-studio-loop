const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const st = (page) => page.evaluate(() => ({ status: document.querySelector('[data-testid="arrangement-status"]')?.textContent, position: document.querySelector('[data-testid="arrangement-position"]')?.textContent, playing: Array.from(document.querySelectorAll('button')).some((b) => b.getAttribute('aria-label') === 'Pause' || b.textContent.trim() === 'Pause'), insertMarker: document.querySelector('[data-insert-marker]')?.getAttribute('data-insert-marker'), follow: document.querySelector('[data-testid="arrangement-follow"]')?.dataset.followMode, active: document.activeElement?.tagName + '#' + (document.activeElement?.getAttribute('data-testid') ?? '') }));
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    const r = {};
    try {
      await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
      await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 240000 });
      await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
      await page.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1200);
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      for (let i = 0; i < 4; i++) { await page.keyboard.press('Equal'); await sleep(150); }
      await sleep(400);
      // playing none-before at the start
      await page.keyboard.press('Home'); await sleep(150);
      await page.keyboard.press('Space'); await sleep(400);
      const steps = [];
      for (let i = 0; i < 3; i++) { await page.keyboard.press('Control+ArrowLeft'); await sleep(120); steps.push(await st(page)); }
      r.playingLeft = steps;
      await page.keyboard.press('Space'); await sleep(300);
      // stopped lower-zone click, visible area
      const bb = await page.getByTestId('arrangement-bars-ruler').boundingBox();
      const sc = await page.getByTestId('arrangement-timeline-scroller').boundingBox();
      const x = Math.min(bb.x + bb.width, sc.x + sc.width) - 300;
      r.lowerX = x;
      r.hit = await page.evaluate(([px, py]) => { const e = document.elementFromPoint(px, py); return (e?.getAttribute('data-testid') ?? e?.tagName) + ' / ' + (e?.closest('[data-testid]')?.getAttribute('data-testid') ?? ''); }, [x, bb.y + bb.height - 3]);
      r.beforeStoppedLower = await st(page);
      await page.mouse.click(x, bb.y + bb.height - 3); await sleep(200);
      r.stoppedLower = await st(page);
      r.metronomeHitAt488 = await page.evaluate(([py]) => { const e = document.elementFromPoint(488, py); return (e?.getAttribute('data-testid') ?? e?.tagName) + ' / ' + (e?.closest('[data-testid]')?.getAttribute('data-testid') ?? '') + ' / ' + (e?.closest('button')?.textContent ?? ''); }, [bb.y + bb.height - 3]);
      await page.screenshot({ path: path.join(__dirname, 'shots', `F-nav-playing-${w}x${h}.png`) });
    } catch (e) { r.error = String(e.stack || e); }
    r.errors = errors; out[`${w}x${h}`] = r; await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'nav-playing-probe-252-a.json'), JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})();
