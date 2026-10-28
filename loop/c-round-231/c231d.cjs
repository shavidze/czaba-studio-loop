// C round 231: marquee gesture across the lane hint vs a lane without hint (mid-drag). usage: node c231d.cjs <outDir>
const path = require('node:path'); const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE = 'http://127.0.0.1:5173'; const outDir = process.argv[2]; fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const R = {};
const mq = (page) => page.evaluate(() => { const m = document.querySelector('[data-testid="arrangement-marquee"]'); if (!m) return null; const r = m.getBoundingClientRect(); return [r.x, r.y, r.width, r.height].map((v) => Math.round(v)); });
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`; const r = (R[k] = {});
    const ctx = await b.newContext({ viewport: vp }); const page = await ctx.newPage();
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
    await page.waitForFunction(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Add'); return x && !x.disabled; }, undefined, { timeout: 90000 }); await sleep(1200);
    const hb = await page.getByTestId('arrangement-lane-empty-hint').boundingBox();
    for (const [name, y] of [['hint', hb.y + hb.height / 2], ['stemsControl', (await page.locator('[data-track-id="stems"]').boundingBox()).y + 40]]) {
      const x0 = hb.x + 40;
      r[name] = { target: await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return (e.getAttribute('data-testid') || e.tagName) + '/' + e.closest('[data-track-id]')?.getAttribute('data-track-id'); }, [x0, y]) };
      await page.mouse.move(x0, y); await page.mouse.down(); await page.mouse.move(x0 + 160, y + 10, { steps: 15 }); await sleep(150);
      r[name].midMarquee = await mq(page);
      await page.screenshot({ path: path.join(outDir, `marquee-${name}-${k}.png`) });
      await page.mouse.up(); await sleep(300);
      r[name].afterMarquee = await mq(page);
    }
    await ctx.close();
  }
  await b.close(); fs.writeFileSync(path.join(outDir, 'c231d.json'), JSON.stringify(R, null, 2)); console.log(JSON.stringify(R));
})();
