const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const res = {};
  for (const mode of ['toggle-press1', 'body-press1']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await ctx.addInitScript(() => {
      window.__ev = [];
      window.addEventListener('keydown', (e) => window.__ev.push({ t: 'kd', k: e.key, r: e.repeat, a: document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName }), true);
      window.addEventListener('keyup', (e) => window.__ev.push({ t: 'ku', k: e.key }), true);
      window.addEventListener('click', (e) => window.__ev.push({ t: 'click', a: e.target?.getAttribute?.('data-testid') || e.target?.tagName }), true);
      document.addEventListener('keydown', (e) => window.__ev.push({ t: 'kd-bubble-late', k: e.key, dp: e.defaultPrevented }));
      new MutationObserver(() => {
        const b = document.querySelector('[data-testid=arrangement-library-preview-toggle]');
        const txt = b ? b.textContent.trim() : null;
        if (txt !== window.__lastLabel) { window.__ev.push({ t: 'label', v: txt }); window.__lastLabel = txt; }
        const pl = document.querySelector('button[aria-label="Play"],button[aria-label="Pause"]');
        const pv = pl ? pl.getAttribute('aria-label') : null;
        if (pv !== window.__lastPlay) { window.__ev.push({ t: 'transport', v: pv }); window.__lastPlay = pv; }
      }).observe(document, { subtree: true, childList: true, characterData: true, attributes: true });
    });
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5173/studio-lab');
    await sleep(1500);
    await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
    const o = p.locator('[role=option][data-source-id="demo-middle-east"]');
    await o.waitFor({ timeout: 90000 });
    const t0 = Date.now(); while (Date.now() - t0 < 90000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
    await o.focus(); await p.keyboard.press('Enter'); await sleep(500);
    await o.click(); await sleep(300);
    if (mode === 'toggle-press1') await p.getByTestId('arrangement-library-preview-toggle').focus();
    else await p.evaluate(() => { document.activeElement && document.activeElement.blur(); });
    await sleep(200);
    const R = { active: await p.evaluate(() => document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName) };
    await p.evaluate(() => { window.__ev = []; });
    await p.keyboard.press(' ');
    await sleep(800);
    R.events = await p.evaluate(() => window.__ev);
    R.label = (await p.getByTestId('arrangement-library-preview-toggle').textContent()).trim();
    R.transport = await p.evaluate(() => { const b = document.querySelector('button[aria-label="Play"],button[aria-label="Pause"]'); return b ? b.getAttribute('aria-label') : null; });
    res[mode] = R;
    await ctx.close();
  }
  fs.writeFileSync(__dirname + '/probe-space-result.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
  await browser.close();
})();
