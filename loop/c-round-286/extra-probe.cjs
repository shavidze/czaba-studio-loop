// C286 extra: generic toast-container count after activation on priceless-pack; priceless-track version card vs panel.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const base = process.argv[2];
const toasts = (p) => p.evaluate(() => { const c = document.querySelector('div.fixed.bottom-6.right-6'); return { container: !!c, items: c ? c.querySelectorAll('.pointer-events-auto').length : -1, alerts: document.querySelectorAll('[role="alert"],[role="status"]').length }; });
(async () => {
  const b = await chromium.launch(); const out = [];
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
    const r = { viewport: [w, h], pack: {}, track: {} };
    for (const nm of ['Add to Cart', 'Buy Now']) for (const how of ['click', 'Enter', 'Space']) {
      await p.goto(base + '/products/priceless-pack', { waitUntil: 'load' }); await p.getByText('Total Price', { exact: true }).waitFor(); await p.waitForTimeout(1200);
      const before = await toasts(p);
      const btn = p.getByRole('button', { name: nm }).first();
      if (how === 'click') { const bx = await btn.boundingBox(); await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); } else { await btn.focus(); await p.keyboard.press(how); }
      await p.waitForTimeout(800);
      r.pack[`${nm}/${how}`] = { before, after: await toasts(p) };
    }
    // positive control: door-slams does not exist on this mock? use priceless-track Buy Now? use middle-east known price Buy Now
    await p.goto(base + '/products/middle-east', { waitUntil: 'load' }); await p.getByText('Total Price', { exact: true }).waitFor(); await p.waitForTimeout(1200);
    const bx = await p.getByRole('button', { name: 'Buy Now' }).boundingBox(); await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.waitForTimeout(800);
    r.controlMiddleEastBuyNow = await toasts(p);
    await p.goto(base + '/products/priceless-track', { waitUntil: 'load' }); await p.getByText('Total Price', { exact: true }).waitFor(); await p.waitForTimeout(1500);
    r.track = await p.evaluate(() => {
      const l = [...document.querySelectorAll('div')].find((d) => d.textContent.trim() === 'Total Price' && !d.children.length);
      const bt = (n) => [...document.querySelectorAll('button')].find((x) => x.textContent.trim().includes(n));
      const vcards = [...document.querySelectorAll('button[aria-pressed]')].map((x) => x.textContent.replace(/\s+/g, ' ').trim());
      return { figure: l.nextElementSibling.textContent.replace(/\s+/g, ' ').trim(), versionCards: vcards, bodyHas0: /\$0(\.00)?\b/.test(document.body.innerText),
        addAria: bt('Add to Cart') && bt('Add to Cart').getAttribute('aria-disabled'), buyAria: bt('Buy Now') && bt('Buy Now').getAttribute('aria-disabled'), complimentary: document.body.innerText.includes('Complimentary Download') };
    });
    await p.screenshot({ path: `shots/priceless-track-${w}.png` });
    out.push(r); await ctx.close();
  }
  require('fs').writeFileSync(process.argv[3], JSON.stringify(out, null, 1)); console.log(JSON.stringify(out)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
