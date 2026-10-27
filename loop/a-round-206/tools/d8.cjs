const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction(() => { const a = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Add'); return a && !a.disabled; }, null, { timeout: 60000 });
  await p.getByRole('button', { name: 'Add', exact: true }).click(); await p.waitForTimeout(2000);
  const rate = Number(process.argv[2]); const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  await p.evaluate(() => document.activeElement && document.activeElement.blur()); await p.keyboard.press('Space');
  await p.waitForTimeout(Number(process.argv[3]));
  const sc = p.getByTestId('arrangement-timeline-scroller'); const clip = p.locator('[data-clip-kind=audio]').first();
  const info = async () => ({ scrollLeft: await sc.evaluate((e) => e.scrollLeft), clip: await clip.boundingBox(), start: await clip.getAttribute('data-clip-start'), label: await p.getByRole('button', { name: /^(Play|Pause)$/ }).getAttribute('aria-label') });
  const a = await info(); console.log('before', JSON.stringify(a));
  const sb = await sc.boundingBox(); const left = Math.max(a.clip.x, sb.x); const x = left + 200, y = a.clip.y + 10;
  await p.mouse.move(x, y); await p.mouse.down(); const mid = await info(); await p.mouse.move(x + 40, y, { steps: 10 }); const mid2 = await info(); await p.mouse.up(); await p.waitForTimeout(1500);
  console.log('afterDown', JSON.stringify(mid)); console.log('beforeUp', JSON.stringify(mid2)); console.log('after', JSON.stringify(await info()));
  await b.close();
})();
