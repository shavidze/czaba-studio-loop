// C326 bounded probe: from 6 s while playing, dispatch two Ctrl+Right keydowns synchronously (before the rAF end-stop tick).
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs'); const path = require('path'); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const st = (p) => p.evaluate(() => ({ pos: document.querySelector('[data-testid="arrangement-position"]')?.textContent, playing: document.querySelector('[data-playing]')?.getAttribute('data-playing'), status: document.querySelector('[data-testid="arrangement-status"]')?.textContent }));
(async () => { const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const out = {};
 for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) { const k = `${vp.width}x${vp.height}`;
  const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab');
  await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
  await sleep(800); await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
  await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000); await p.evaluate(() => document.activeElement?.blur());
  await p.keyboard.press('Home'); await sleep(200);
  const x0 = await p.evaluate(() => document.querySelector('[data-testid="arrangement-insert-marker"]').getBoundingClientRect().x);
  const g = await p.evaluate(() => { const r = document.querySelector('[data-testid="arrangement-bars-ruler"]').getBoundingClientRect(); return { pps: parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent), by: r.y + r.height - 3 }; });
  for (const t of [2, 6]) { await p.mouse.click(x0 + t * g.pps, g.by, { modifiers: ['Alt'] }); await sleep(300); await p.evaluate(() => document.activeElement?.blur()); await p.keyboard.press('m'); await sleep(300); if (await p.locator('[data-testid="arrangement-marker-name-input"]').count()) { await p.keyboard.press('Enter'); await sleep(300); } }
  await p.evaluate(() => document.activeElement?.blur()); await p.keyboard.press('Home'); await sleep(200); await p.keyboard.press('Space'); await sleep(400);
  await p.keyboard.press('Control+ArrowRight'); await sleep(100); await p.keyboard.press('Control+ArrowRight'); await sleep(100);
  const at6 = await st(p);
  const sync = await p.evaluate(() => { const fire = () => (document.activeElement || document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight', ctrlKey: true, bubbles: true, cancelable: true }));
    fire(); const afterFirst = { status: document.querySelector('[data-testid="arrangement-status"]')?.textContent }; fire();
    return { afterFirst, afterSecondSync: { playing: document.querySelector('[data-playing]')?.getAttribute('data-playing'), status: document.querySelector('[data-testid="arrangement-status"]')?.textContent } }; });
  await sleep(50); const after50 = await st(p); await sleep(600); const after650 = await st(p);
  await p.screenshot({ path: path.join(__dirname, 'shots', `probe-sync-${k}.png`) });
  out[k] = { at6, sync, after50, after650 }; await ctx.close(); }
 fs.writeFileSync(path.join(__dirname, 'probe-sync-ctrlright.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); await b.close(); })();
