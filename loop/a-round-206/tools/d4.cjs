const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
  const add = p.getByRole('button', { name: 'Add', exact: true });
  await add.waitFor(); await p.waitForFunction(() => { const a = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Add'); return a && !a.disabled; }, null, { timeout: 60000 });
  console.log('wave html', (await p.locator('[data-testid=arrangement-library-preview-wave]').innerHTML()).slice(0, 400));
  await add.click(); await p.waitForTimeout(2500);
  const anc = await p.evaluate(() => { const w = document.querySelector('[data-testid=arrangement-clip-waveform]'); const out = []; let e = w; while (e && out.length < 8) { out.push([e.tagName, e.getAttribute('data-testid'), e.getAttribute('role'), (e.getAttribute('aria-label') || '').slice(0, 120), e.tabIndex, JSON.stringify(e.getBoundingClientRect()).slice(0, 90)]); e = e.parentElement; } return out; });
  console.log(JSON.stringify(anc, null, 0));
  console.log('selected text', await p.locator('[data-testid=arrangement-selected-clip]').innerText());
  await b.close();
})();
