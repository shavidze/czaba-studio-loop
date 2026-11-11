// usage: node lm-dialog.cjs <out.json> <urlHead> <urlTree> - opens the LeadMagnet popup (scroll 55 %, timer) at 1440 and records dialog text and element/class inventory on each URL
const { createRequire } = require('module'); const req = createRequire('/home/runner/czaba-project/store/package.json'); const { chromium } = req('playwright');
const fs = require('fs');
const [OUT, ...URLS] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({ headless: true }); const res = {};
  for (const u of URLS) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { try { localStorage.setItem('cookie-consent', 'declined'); } catch (e) {} });
    const p = await ctx.newPage();
    await p.goto(u + '/', { waitUntil: 'networkidle', timeout: 120000 }); await p.waitForTimeout(2500);
    await p.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.55));
    const d = p.locator('[role="dialog"]').filter({ hasText: 'CZABA' }).first();
    await d.waitFor({ state: 'visible', timeout: 25000 }); await p.waitForTimeout(1200);
    res[u] = await p.evaluate(() => { const dl = [...document.querySelectorAll('[role="dialog"]')].find((x) => x.textContent.includes('CZABA'));
      const r = dl.getBoundingClientRect();
      return { text: dl.textContent.replace(/\s+/g, ' ').trim(), elements: dl.querySelectorAll('*').length, tags: [...dl.querySelectorAll('*')].map((e) => e.tagName).join(','), box: [r.x, r.y, r.width, r.height].map(Math.round), classes: [...dl.querySelectorAll('*')].map((e) => e.getAttribute('class') || '').filter((c) => /text-glow/.test(c)) }; });
    await ctx.close();
  }
  await b.close();
  const [h, t] = URLS.map((u) => res[u]);
  const summary = { textEqual: h.text === t.text, tagsEqual: h.tags === t.tags, boxEqual: JSON.stringify(h.box) === JSON.stringify(t.box), headTextGlow: h.classes.length, treeTextGlow: t.classes.length, textLength: h.text.length };
  fs.writeFileSync(OUT, JSON.stringify({ summary, res }, null, 1)); console.log(JSON.stringify(summary));
})();
