const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { localStorage.setItem('czaba_analytics_consent', 'denied'); window.__starts = 0; const o = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function (...a) { window.__starts++; return o.apply(this, a); }; });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
  const add = p.getByRole('button', { name: 'Add', exact: true });
  await add.waitFor(); await p.waitForFunction(() => { const a = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Add'); return a && !a.disabled; }, null, { timeout: 60000 });
  await add.click(); await p.waitForTimeout(2000);
  await p.evaluate(() => document.activeElement && document.activeElement.blur());
  await p.keyboard.press('Space'); await p.waitForTimeout(1500);
  console.log('play label', await p.getByRole('button', { name: /^(Play|Pause)$/ }).getAttribute('aria-label'));
  const clip = p.locator('[data-clip-kind=audio]').first();
  const s0 = await clip.getAttribute('data-clip-start'); const st0 = await p.evaluate(() => window.__starts);
  const bb = await clip.boundingBox(); console.log('bb', bb);
  for (const dy of [10]) {
    const x = Math.max(bb.x, 288) + 300, y = bb.y + dy;
    await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + 40, y, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(600);
    console.log('dy', dy, 'start', s0, '->', await clip.getAttribute('data-clip-start'), 'starts', st0, '->', await p.evaluate(() => window.__starts));
  }
  console.log('label after', await p.getByRole('button', { name: /^(Play|Pause)$/ }).getAttribute('aria-label'));
  await b.close();
})();
