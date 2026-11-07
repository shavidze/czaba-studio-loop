const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const [w, h] = [Number(process.argv[2]), Number(process.argv[3])];
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: w, height: h } }); await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
  await p.goto('http://127.0.0.1:5173/studio-lab'); await p.waitForFunction(() => /Demo collection ready/.test(document.body?.innerText || ''), null, { timeout: 120000 }); await p.waitForTimeout(800);
  await p.getByRole('button', { name: 'Add', exact: true }).first().click(); await p.locator('[data-clip-kind="audio"]').first().waitFor(); await p.waitForTimeout(1200);
  const clip = p.locator('[data-clip-kind="audio"]').first(); const st = () => clip.getAttribute('data-clip-start');
  const res = { vp: `${w}x${h}`, startBefore: await st() };
  const bx = await clip.getByTitle(/ — drag to move$/).boundingBox(); const x = bx.x + 60, y = bx.y + bx.height / 2;
  await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x + 150, y, { steps: 15 }); await p.waitForTimeout(200);
  res.startMid = await st(); await p.keyboard.press('Escape'); await p.waitForTimeout(300); res.startAfterEsc = await st();
  await p.mouse.move(x + 200, y, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(500);
  res.startAfterRelease = await st(); res.undo = await p.getByRole('button', { name: /^Undo/ }).first().getAttribute('title'); res.errs = errs;
  res.commits = res.startAfterRelease !== res.startBefore;
  fs.writeFileSync(`/home/runner/czaba-project/tmp/studio-real-loop/c-round-390/out/escdrag-${w}.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res)); await b.close();
})();
