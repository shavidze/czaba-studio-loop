const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const base = 'http://127.0.0.1:5173';
(async () => {
  const b = await chromium.launch();
  const out = {};
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  for (const route of ['/store', '/']) {
    await p.goto(base + route, { waitUntil: 'load' });
    await p.waitForTimeout(3000);
    for (let y = 0; y < 6000; y += 600) { await p.mouse.wheel(0, 600); await p.waitForTimeout(120); }
    await p.waitForTimeout(1500);
    out[route] = await p.evaluate(() => {
      const r = {};
      for (const hd of ['priceless-pack', 'priceless-track', 'free-pack', 'middle-east', 'bad-premium-track']) {
        const a = document.querySelector(`a[href="/products/${hd}"]`);
        if (!a) { r[hd] = null; continue; }
        let el = a;
        while (el.parentElement && getComputedStyle(el.parentElement).display !== 'grid') el = el.parentElement;
        const art = a.closest('article');
        const box = (art ?? el).getBoundingClientRect();
        const spans = [...(art ?? el).querySelectorAll('span')].filter((s) => s.textContent.trim() === 'Price unavailable' || /^\$|Complimentary/.test(s.textContent.trim()));
        r[hd] = {
          h: +box.height.toFixed(1), y: +(box.y + scrollY).toFixed(1),
          price: spans.map((s) => { const cs = getComputedStyle(s); const bb = s.getBoundingClientRect(); return { text: s.textContent.trim(), lh: cs.lineHeight, fs: cs.fontSize, color: cs.color, top: +(bb.top + scrollY).toFixed(1), h: +bb.height.toFixed(1) }; }),
        };
      }
      return r;
    });
    await p.locator('a[href="/products/priceless-pack"]').first().scrollIntoViewIfNeeded().catch(() => {});
    await p.waitForTimeout(500);
    await p.screenshot({ path: `${__dirname}/shot-${route === '/' ? 'home' : 'store'}-1440.png`, timeout: 60000 });
  }
  await p.goto(base + '/products/bad-premium-track', { waitUntil: 'load' });
  await p.waitForTimeout(3000);
  const cards = async () => p.evaluate(() => [...document.querySelectorAll('button[aria-pressed]')].map((bt) => ({ text: bt.innerText.replace(/\s+/g, ' ').slice(0, 120), pressed: bt.getAttribute('aria-pressed'), h: +bt.getBoundingClientRect().height.toFixed(1) })));
  out.badPremium = { before: await cards(), body$m5: (await p.textContent('body')).includes('$-5'), bodyNaN: (await p.textContent('body')).includes('NaN') };
  await p.screenshot({ path: `${__dirname}/shot-bad-premium-standard-1440.png` });
  await p.getByRole('button', { name: /Premium/ }).filter({ has: p.locator('[aria-hidden]') }).first().click().catch(async () => { await p.locator('button[aria-pressed]').nth(1).click(); });
  await p.waitForTimeout(800);
  out.badPremium.after = await cards();
  out.badPremium.unavailableCount = await p.getByText('Price unavailable', { exact: true }).count();
  out.badPremium.disabledButtons = await p.evaluate(() => [...document.querySelectorAll('[aria-disabled="true"]')].map((e) => e.textContent.trim().slice(0, 40)));
  out.badPremium.after$m5 = (await p.textContent('body')).includes('$-5') || (await p.textContent('body')).includes('-$5');
  await p.screenshot({ path: `${__dirname}/shot-bad-premium-selected-1440.png` });
  fs.writeFileSync(`${__dirname}/smoke-1440.json`, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
