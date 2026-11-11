// B round 446 planning probe (HEAD): hover/selected/loader/checkout/stems states. usage: node head-states.cjs <base> <out.json>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const base = process.argv[2] || 'http://127.0.0.1:5173';
const out = process.argv[3] || 'head-states.json';
const TEAL = /rgba?\(\s*(19|20)\s*,\s*(217|184)\s*,\s*(204|166)/;
const res = {};
async function ctxPage(browser, vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: vp, ...opts });
  await ctx.addInitScript(() => { try { localStorage.setItem('cookie-consent', 'declined'); } catch {} });
  return [ctx, await ctx.newPage()];
}
(async () => {
  const browser = await chromium.launch();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 375, height: 812 }]) {
    const key = vp.width;
    const r = (res[key] = {});
    // loader
    let [ctx, page] = await ctxPage(browser, vp);
    await page.goto(base + '/', { waitUntil: 'commit' });
    try {
      await page.waitForSelector('[data-testid="entrance-loader"]', { timeout: 8000 });
      await page.waitForTimeout(450);
      r.loader = await page.evaluate(() => {
        const L = document.querySelector('[data-testid="entrance-loader"]');
        const span = [...L.querySelectorAll('span')].find((s) => s.textContent.trim() === 'CZABA');
        const cs = span ? getComputedStyle(span) : null;
        const tealEls = [...L.querySelectorAll('*')].filter((e) => /19, 217, 204/.test(getComputedStyle(e).backgroundImage + getComputedStyle(e).filter)).length;
        return span ? { color: cs.color, fill: cs.webkitTextFillColor, bgImage: cs.backgroundImage.slice(0, 120), filter: cs.filter.slice(0, 120), fontWeight: cs.fontWeight, tealEls } : { noSpan: true, tealEls };
      });
    } catch (e) { r.loader = { error: String(e).slice(0, 120) }; }
    await page.waitForTimeout(2500);
    await page.waitForLoadState('networkidle').catch(() => {});
    // product cards (home ProductSection) hover
    const card = page.locator('article').filter({ has: page.locator('a[href^="/products/"]') }).first();
    r.cardCount = await page.locator('article').filter({ has: page.locator('a[href^="/products/"]') }).count();
    if (r.cardCount > 0 && vp.width >= 1280) {
      await card.scrollIntoViewIfNeeded();
      const b0 = await card.boundingBox();
      await card.hover(); await page.waitForTimeout(700);
      r.cardHover = await card.evaluate((el) => {
        const radial = [...el.querySelectorAll('*')].filter((e) => getComputedStyle(e).backgroundImage.includes('radial-gradient')).map((e) => getComputedStyle(e).backgroundImage.slice(0, 80));
        const inner = el.firstElementChild; const cs = getComputedStyle(inner);
        return { radialCount: radial.length, radialSample: radial.slice(0, 2), innerTransform: cs.transform, innerScale: cs.scale, innerRect: inner.getBoundingClientRect().width };
      });
      r.cardHover.outerWidthBefore = b0 && b0.width;
    }
    // special offers + newsletter hover
    if (vp.width >= 1280) {
      for (const [name, sel] of [['offerGift', 'div.group.relative.min-h-\\[300px\\] >> nth=0'], ['offerBundle', 'div.group.relative.min-h-\\[300px\\] >> nth=1'], ['newsletterBtn', 'section button[type="submit"] >> nth=-1']]) {
        try {
          const el = page.locator(sel); await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
          r[name] = await el.evaluate((e) => ({ boxShadowTeal: /19, 217, 204/.test(getComputedStyle(e).boxShadow), bg: getComputedStyle(e).backgroundColor, text: e.innerText.slice(0, 40) }));
        } catch (e) { r[name] = { error: String(e).slice(0, 100) }; }
      }
    }
    // showcase
    r.showcase = await page.evaluate(() => [...document.querySelectorAll('svg path')].filter((p) => /19, 217, 204|20, 184, 166/.test(getComputedStyle(p).stroke + getComputedStyle(p.ownerSVGElement).filter)).length);
    await ctx.close();
    // gift cards selected
    [ctx, page] = await ctxPage(browser, vp);
    await page.goto(base + '/gift-cards', { waitUntil: 'networkidle' }).catch(() => {});
    try {
      const btn = page.locator('button.border-2').first(); await btn.click({ timeout: 5000 }); await page.waitForTimeout(400);
      r.giftSelected = await page.evaluate(() => [...document.querySelectorAll('button.border-2')].map((b) => /19, 217, 204/.test(getComputedStyle(b).boxShadow)));
    } catch (e) { r.giftSelected = { error: String(e).slice(0, 100) }; }
    await ctx.close();
    // checkout success
    [ctx, page] = await ctxPage(browser, vp);
    await page.goto(base + '/checkout/success', { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1200);
    r.checkout = await page.evaluate(() => {
      const h = document.querySelector('h1'); const rip = [...document.querySelectorAll('div.absolute.inset-0.rounded-full')];
      return { h1: h && h.innerText.slice(0, 60), rippleEls: rip.length, rippleShadow: rip.map((d) => getComputedStyle(d).boxShadow.slice(0, 60)) };
    });
    await ctx.close();
  }
  // stems button on mock products
  const [ctx, page] = await ctxPage(browser, { width: 1440, height: 900 });
  res.stems = {};
  for (const h of ['middle-east', 'harbour-lights', 'copper-horizon', 'night-train', 'quiet-valley', 'pulse-loop-kit']) {
    await page.goto(base + '/products/' + h, { waitUntil: 'networkidle' }).catch(() => {});
    res.stems[h] = await page.getByText(/Play Stems/).count();
  }
  await ctx.close();
  await browser.close();
  require('fs').writeFileSync(out, JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1).slice(0, 4000));
})();
