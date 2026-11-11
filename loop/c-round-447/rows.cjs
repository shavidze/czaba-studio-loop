const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const base = process.argv[2];
const tag = process.argv[3];
const out = __dirname;
const VPS = [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 375, height: 812 }];
const res = {};
async function mk(browser, vp, extra = {}) {
  const ctx = await browser.newContext({ viewport: vp, ...extra });
  await ctx.addInitScript(() => { try { localStorage.setItem('cookie-consent', 'declined'); localStorage.setItem('leadMagnetDismissed', '1'); } catch {} });
  return [ctx, await ctx.newPage()];
}
(async () => {
  const browser = await chromium.launch();
  for (const vp of VPS) {
    const k = vp.width; const r = (res[k] = {});
    let [ctx, page] = await mk(browser, vp);
    await page.goto(base + '/', { waitUntil: 'commit' });
    try {
      await page.waitForSelector('[data-testid="entrance-loader"]', { timeout: 8000 });
      await page.waitForTimeout(450);
      r.loader = await page.evaluate(() => {
        const L = document.querySelector('[data-testid="entrance-loader"]');
        const span = [...L.querySelectorAll('span')].find((s) => s.textContent.trim() === 'CZABA');
        const cs = getComputedStyle(span);
        const sweep = [...L.querySelectorAll('div')].find((d) => /bg-brand\/50/.test(d.className) || (d.style && d.style.background));
        const all = [...L.querySelectorAll('*')].map((e) => { const c = getComputedStyle(e); return { cls: (e.className && e.className.toString ? e.className.toString() : '').slice(0, 50), bi: c.backgroundImage.slice(0, 80), f: c.filter.slice(0, 80), bs: c.boxShadow.slice(0, 60), w: e.getBoundingClientRect().width, bc: c.backgroundColor }; });
        return { color: cs.color, fill: cs.webkitTextFillColor, bgImage: cs.backgroundImage, filter: cs.filter, fw: cs.fontWeight, tealEls: all.filter((a) => /19, 217, 204|13d9cc/i.test(a.bi + a.f + a.bs)).length, sweep: sweep ? { bc: getComputedStyle(sweep).backgroundColor, bi: getComputedStyle(sweep).backgroundImage.slice(0, 80), w: sweep.getBoundingClientRect().width } : null, narrow: all.filter((a) => a.w > 0 && a.w < 1000 && a.bc !== 'rgba(0, 0, 0, 0)').slice(0, 6) };
      });
      await page.screenshot({ path: `${out}/shots/${tag}-loader-${k}.png` });
    } catch (e) { r.loader = { error: String(e).slice(0, 120) }; }
    await page.waitForTimeout(3500);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(500);
    // keep-list text & hrefs
    r.keep = await page.evaluate(() => {
      const secs = {};
      const want = ['Special', 'Newsletter', 'Limited', 'Happy Customers', 'Netflix'];
      const txt = document.body.innerText;
      for (const w of want) secs[w] = txt.includes(w);
      const so = [...document.querySelectorAll('div.group.relative')].filter((d) => d.className.includes('min-h-[300px]'));
      return { secs, soText: so.map((d) => d.innerText), soHref: so.map((d) => [...d.querySelectorAll('a')].map((a) => a.getAttribute('href'))), bodyLen: txt.length, links: [...document.querySelectorAll('a')].map((a) => a.getAttribute('href')).join('|') };
    });
    // full-page
    await page.screenshot({ path: `${out}/shots/${tag}-home-full-${k}.png`, fullPage: true });
    // showcase
    const mock = page.locator('text=Export Mix').first();
    if (await mock.count()) {
      await mock.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      r.showcase = await page.evaluate(() => {
        const t = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && e.textContent.trim() === 'Export Mix');
        const root = t.closest('section') || document.body;
        const paths = [...root.querySelectorAll('svg path')].map((p) => ({ stroke: getComputedStyle(p).stroke, op: getComputedStyle(p).opacity, so: getComputedStyle(p).strokeOpacity, filt: getComputedStyle(p.ownerSVGElement).filter, svgColor: getComputedStyle(p.ownerSVGElement).color }));
        const b = t.closest('button') || t; const cs = getComputedStyle(t.parentElement.tagName === 'BUTTON' ? t.parentElement : t);
        const playBtn = [...root.querySelectorAll('button,div,span')].filter((e) => /bg-brand\b/.test(e.className.toString()) && !/Export/.test(e.innerText));
        return { pathCount: paths.length, strokes: [...new Set(paths.map((p) => p.stroke + '|' + p.so + '|' + p.filt + '|' + p.svgColor))], exportColor: cs.color, exportBg: cs.backgroundColor, exportClass: (t.className || '') + ' / ' + (t.parentElement.className || ''), fills: playBtn.slice(0, 4).map((e) => [e.className.toString().slice(0, 80), getComputedStyle(e).backgroundColor, getComputedStyle(e).color]) };
      });
      await page.screenshot({ path: `${out}/shots/${tag}-showcase-${k}.png` });
    }
    // product card hover etc. (>=1280)
    const cardLoc = page.locator('article').filter({ has: page.locator('a[href^="/products/"]') });
    r.cardCount = await cardLoc.count();
    if (r.cardCount && vp.width >= 1280) {
      const card = cardLoc.first(); await card.scrollIntoViewIfNeeded(); await card.hover(); await page.waitForTimeout(800);
      r.cardHover = await card.evaluate((el) => {
        const all = [el, ...el.querySelectorAll('*')];
        return { radial: all.filter((e) => getComputedStyle(e).backgroundImage.includes('radial-gradient')).length, tealShadow: all.filter((e) => /19, 217, 204/.test(getComputedStyle(e).boxShadow)).length, scale: getComputedStyle(el).scale, firstChildScale: getComputedStyle(el.firstElementChild).scale, transform: getComputedStyle(el.firstElementChild).transform, overlays: el.querySelectorAll('[class*="group-hover:opacity-100"]').length };
      });
      await page.screenshot({ path: `${out}/shots/${tag}-cardhover-${k}.png` });
      for (const [name, sel] of [['offer0', 'div.group.relative.min-h-\\[300px\\] >> nth=0'], ['offer1', 'div.group.relative.min-h-\\[300px\\] >> nth=1'], ['newsletterBtn', 'section button[type="submit"] >> nth=-1']]) {
        try { const el = page.locator(sel); await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(600); r[name] = await el.evaluate((e) => ({ shadow: getComputedStyle(e).boxShadow, tealShadow: /19, 217, 204/.test(getComputedStyle(e).boxShadow), bg: getComputedStyle(e).backgroundColor, text: e.innerText.slice(0, 40) })); } catch (e) { r[name] = { error: String(e).slice(0, 100) }; }
      }
    }
    await ctx.close();
    // gift cards
    [ctx, page] = await mk(browser, vp);
    await page.goto(base + '/gift-cards', { waitUntil: 'networkidle' }).catch(() => {});
    try {
      await page.locator('button.border-2').first().click({ timeout: 5000 }); await page.waitForTimeout(400);
      r.gift = await page.evaluate(() => [...document.querySelectorAll('button.border-2')].map((b) => ({ ts: /19, 217, 204/.test(getComputedStyle(b).boxShadow), bs: getComputedStyle(b).boxShadow.slice(0, 50), bc: getComputedStyle(b).borderTopColor })));
      await page.screenshot({ path: `${out}/shots/${tag}-gift-${k}.png` });
    } catch (e) { r.gift = { error: String(e).slice(0, 100) }; }
    await ctx.close();
    // checkout success
    [ctx, page] = await mk(browser, vp);
    await page.goto(base + '/checkout/success', { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1500);
    r.checkout = await page.evaluate(() => {
      const h = document.querySelector('h1'); const rip = [...document.querySelectorAll('div.absolute.inset-0.rounded-full')];
      const svg = document.querySelector('svg');
      return { h1: h && h.innerText, ripple: rip.length, rippleShadow: rip.map((d) => getComputedStyle(d).boxShadow.slice(0, 60)), tealAny: [...document.querySelectorAll('*')].filter((e) => /19, 217, 204/.test(getComputedStyle(e).boxShadow)).length };
    });
    await page.screenshot({ path: `${out}/shots/${tag}-checkout-${k}.png` });
    await ctx.close();
    // store + product full
    for (const [n, p] of [['store', '/store'], ['product', '/products/pulse-loop-kit']]) {
      [ctx, page] = await mk(browser, vp);
      await page.goto(base + p, { waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(3500);
      await page.screenshot({ path: `${out}/shots/${tag}-${n}-full-${k}.png`, fullPage: true });
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(`${out}/rows-${tag}.json`, JSON.stringify(res, null, 1));
  console.log('done', tag);
})();
