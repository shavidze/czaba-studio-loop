// usage: node store-card-probe.cjs <base> <out.json>  -> /store first pack card: hover, then every descendant's computed box-shadow with blur > 0
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const [base, outFile] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch(); const out = { base, rows: [] };
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().split('T')[0], dismissed: true, submitted: false })); } catch (e) {} });
    const page = await ctx.newPage();
    await page.goto(base + '/store', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const card = page.locator('a[href^="/products/"]').first();
    await card.scrollIntoViewIfNeeded(); await card.hover(); await page.waitForTimeout(1000);
    const r = await card.evaluate((root) => {
      const all = [root, ...root.querySelectorAll('*')];
      const glowing = all.map((el) => ({ tag: el.tagName, inline: el.style.boxShadow, computed: getComputedStyle(el).boxShadow }))
        .filter((x) => x.computed !== 'none' && /\b0px 0px [1-9]/.test(x.computed));
      const inlineGlowDecl = all.filter((el) => (el.getAttribute('style') || '').includes('box-shadow')).length;
      return { glowing, inlineGlowDecl, href: root.getAttribute('href') };
    });
    out.rows.push({ vp: w, ...r });
    await ctx.close();
  }
  await browser.close(); fs.writeFileSync(outFile, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out.rows));
})();
