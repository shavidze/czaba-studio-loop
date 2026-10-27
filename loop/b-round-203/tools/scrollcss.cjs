const F = require('./fl.cjs'); const path = require('path');
(async () => { const browser = await F.launch(); const { ctx, page } = await F.newPage(browser, 1280, 720, {});
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'load' }); await F.sleep(3500); await F.declineCookies(page);
  const r = await page.evaluate(() => { const h = getComputedStyle(document.documentElement), b = getComputedStyle(document.body);
    const t = [...document.querySelectorAll('footer a')].find((a) => a.textContent.trim() === 'Terms of Service');
    const chain = []; let n = t; while (n) { const cs = getComputedStyle(n); chain.push([n.tagName, (n.className || '').toString().slice(0, 40), cs.position, cs.overflowY, cs.scrollSnapType, cs.contentVisibility, cs.transform !== 'none' ? 'T' : '']); n = n.parentElement; }
    return { scrollingElement: document.scrollingElement.tagName, html: [h.overflowY, h.scrollSnapType, h.scrollPaddingTop, h.scrollBehavior, h.height], body: [b.overflowY, b.scrollSnapType, b.height, b.position], chain, href: t.getAttribute('href'), snapChildren: [...document.querySelectorAll('*')].filter((e) => getComputedStyle(e).scrollSnapAlign !== 'none').length };
  });
  console.log(JSON.stringify(r, null, 0)); F.save(path.join(__dirname, '..', 'out', 'scrollcss-5173.json'), r);
  await ctx.close(); await browser.close(); })();
