const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction(() => { const a = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Add'); return a && !a.disabled; }, null, { timeout: 60000 });
  await p.getByRole('button', { name: 'Add', exact: true }).click(); await p.waitForTimeout(2000);
  const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
  await p.evaluate(() => document.activeElement && document.activeElement.blur()); await p.keyboard.press('Space'); await p.waitForTimeout(1500); console.log('label', await p.getByRole('button', { name: /^(Play|Pause)$/ }).getAttribute('aria-label'));
  const clip = p.locator('[data-clip-kind=audio]').first();
  for (const [steps, wait] of [[10, 0], [10, 300], [30, 0]]) {
    const bb = await clip.boundingBox(); const x = bb.x + 200, y = bb.y + 10; const s0 = await clip.getAttribute('data-clip-start');
    await p.mouse.move(x, y); await p.mouse.down(); if (wait) await p.waitForTimeout(wait); await p.mouse.move(x + 40, y, { steps }); await p.mouse.up(); await p.waitForTimeout(1500);
    console.log('steps', steps, 'holdwait', wait, s0, '->', await clip.getAttribute('data-clip-start'));
  }
  await b.close();
})();
