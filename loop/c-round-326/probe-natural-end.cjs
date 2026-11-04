// C326 probe: status after playback reaches project end naturally (no keys during playback), 1280x720.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs'); const path = require('path'); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const st = (p) => p.evaluate(() => ({ pos: document.querySelector('[data-testid="arrangement-position"]')?.textContent, playing: document.querySelector('[data-playing]')?.getAttribute('data-playing'), status: document.querySelector('[data-testid="arrangement-status"]')?.textContent }));
(async () => { const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } }); const p = await ctx.newPage();
 await p.goto('http://127.0.0.1:5173/studio-lab'); await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
 await sleep(800); await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250); await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000); await p.evaluate(() => document.activeElement?.blur());
 await p.keyboard.press('Home'); await sleep(200); const before = await st(p); await p.keyboard.press('Space'); await sleep(500); const playing = await st(p); await sleep(16500); const end = await st(p);
 await p.screenshot({ path: path.join(__dirname, 'shots', 'probe-natural-end-1280x720.png') });
 const out = { before, playing, end }; fs.writeFileSync(path.join(__dirname, 'probe-natural-end.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); await b.close(); })();
