const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' }).catch(() => {});
  await p.waitForTimeout(5000);
  const addBtns = await p.getByRole('button', { name: /add/i }).evaluateAll((els) => els.map((e) => [e.getAttribute('aria-label'), e.textContent.trim().slice(0, 40), e.disabled]));
  console.log('ADD', JSON.stringify(addBtns.slice(0, 10)));
  await p.locator('button').filter({ hasText: /^\s*Add\s*$/ }).first().click();
  await p.waitForTimeout(2000);
  const hdr = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-track-header] button')].map((e) => [e.closest('[data-track-id]')?.dataset.trackId, e.getAttribute('aria-label'), e.textContent.trim().slice(0, 30)]));
  console.log('HDR', JSON.stringify(hdr));
  const clips = await p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((e) => [e.tagName, e.getAttribute('role'), e.getAttribute('aria-label'), e.dataset.clipId, JSON.stringify(e.getBoundingClientRect())]).slice(0, 5));
  console.log('CLIPS', JSON.stringify(clips));
  const ready = await p.evaluate(() => [...document.querySelectorAll('[data-testid]')].map((e) => e.dataset.testid).filter((t) => /wave|ready|library|status/i.test(t)).slice(0, 30));
  console.log('TESTIDS', JSON.stringify([...new Set(ready)]));
  await b.close();
})();
