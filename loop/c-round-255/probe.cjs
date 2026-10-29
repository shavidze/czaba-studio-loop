const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const base = process.argv[2]; const out = process.argv[3];
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }); const page = await ctx.newPage();
  await page.goto(base + '/studio-lab'); await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 });
  await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250); await page.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000);
  await page.locator('[data-testid=arrangement-video-input]').first().setInputFiles('/home/runner/czaba-project/tmp/studio-real-loop/media/beeps-6s-vp9-opus.webm');
  await page.waitForFunction(() => document.querySelectorAll('[data-clip-kind=video]').length > 0, null, { timeout: 30000 }); await sleep(2500);
  const info = await page.evaluate(() => {
    const r = (e) => e && e.getBoundingClientRect().toJSON();
    const vids = [...document.querySelectorAll('video')].map((v) => ({ tid: v.closest('[data-testid]')?.getAttribute('data-testid'), r: r(v), z: getComputedStyle(v).zIndex }));
    const tids = [...document.querySelectorAll('[data-testid*=video]')].map((e) => ({ tid: e.getAttribute('data-testid'), r: r(e), tag: e.tagName }));
    return { vids, tids, line: r(document.querySelector('[data-testid=arrangement-insert-marker]')), ph: r(document.querySelector('[data-testid=arrangement-playhead]')), lane: r(document.querySelector('[data-track-id=video]')) };
  });
  console.log(JSON.stringify(info, null, 1));
  await page.screenshot({ path: out });
  await b.close();
})();
