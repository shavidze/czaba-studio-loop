// B round 470 -> 471: glyph probe after fonts load + crops of the 375 wrap changes. node glyph-and-crops.cjs <outDir> name=url ...
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('node:fs');
const [outDir, ...targets] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const res = {};
  for (const t of targets) {
    const [name, base] = t.split('=');
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.evaluate(async () => {
      const el = document.createElement('p');
      el.id = 'b-glyph-probe';
      el.style.fontSize = '32px';
      el.textContent = 'ქართული — · → € ¼ ↑';
      document.body.prepend(el);
      await document.fonts.ready;
    });
    await page.waitForTimeout(1500);
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '#b-glyph-probe' });
    const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    res[name] = { glyph: fonts.map((f) => `${f.familyName}:${f.glyphCount}`), loaded: await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family}:${f.weight}:${f.unicodeRange.slice(0, 12)}`)) };
    await page.locator('#b-glyph-probe').screenshot({ path: `${outDir}/${name}-glyph.png` });
    await ctx.close();
    const c2 = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const p2 = await c2.newPage();
    for (const [path, text, file] of [['/', 'The Complete Collection', 'complete'], ['/about', 'Sounds Delivered', 'sounds']]) {
      await p2.goto(base + path, { waitUntil: 'networkidle' });
      await p2.waitForTimeout(2500);
      const loc = p2.getByText(text, { exact: true }).first();
      await loc.scrollIntoViewIfNeeded();
      const box = await loc.evaluate((el) => { const c = el.closest('div,article,section') ?? el; c.scrollIntoView({ block: 'center' }); const b = c.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; });
      await p2.screenshot({ path: `${outDir}/${name}-375-${file}.png`, clip: { x: 0, y: Math.max(0, box.y - 40), width: 375, height: Math.min(812 - Math.max(0, box.y - 40), box.height + 80) } });
    }
    await c2.close();
  }
  fs.writeFileSync(`${outDir}/glyph.json`, JSON.stringify(res, null, 1));
  await browser.close();
})();
