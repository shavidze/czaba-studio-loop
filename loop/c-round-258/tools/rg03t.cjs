const L = require('/home/runner/czaba-project/tmp/studio-real-loop/c-round-258/tools/lib258.cjs');
(async () => { const b = await L.chromium.launch(); const out = {};
for (const vp of [{ width: 1440, height: 900 }]) { const { ctx, page } = await L.open(b, vp, { pulse: false });
  await page.locator('[data-testid=arrangement-video-input]').first().setInputFiles('/home/runner/czaba-project/tmp/studio-real-loop/media/beeps-6s-vp9-opus.webm');
  await page.waitForFunction(() => document.querySelectorAll('[data-clip-kind=video]').length > 0, null, { timeout: 30000 }); await L.sleep(800);
  out.m = await page.evaluate(() => [...document.querySelectorAll('[data-track-id="video"] button')].filter((x) => /Original video sound/.test((x.getAttribute('title') || '') + (x.getAttribute('aria-label') || ''))).map((x) => ({ text: x.textContent.trim(), label: x.getAttribute('aria-label'), title: x.getAttribute('title'), pressed: x.getAttribute('aria-pressed') })));
  await ctx.close(); }
console.log(JSON.stringify(out)); require('fs').writeFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-258/out/rg03-title.json', JSON.stringify(out, null, 1)); await b.close(); })();
