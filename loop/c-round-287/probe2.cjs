// C287 probe 2: grid rows (all + SFX filter = mixed row), home row without LeadMagnet, journey shots. usage: node probe2.cjs <base> <label>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const [base, label] = process.argv.slice(2);
const shotDir = `${__dirname}/shots/${label}`;
fs.mkdirSync(shotDir, { recursive: true });
const gridItems = () => {
  const out = [];
  for (const a of document.querySelectorAll('a[href^="/products/"]')) {
    if (getComputedStyle(a.parentElement).display !== 'grid') continue;
    const r = a.getBoundingClientRect();
    const leaves = [...a.querySelectorAll('*')].filter((e) => e.children.length === 0 && e.textContent.trim());
    const last = leaves[leaves.length - 1];
    const lr = last ? last.getBoundingClientRect() : null;
    const price = leaves.find((e) => /^(\$\d+|Price unavailable)$/.test(e.textContent.trim()));
    const frame = a.firstElementChild ? a.firstElementChild.getBoundingClientRect() : null;
    out.push({ h: a.getAttribute('href').slice(10), x: Math.round(r.x), y: +(r.y + scrollY).toFixed(1), height: +r.height.toFixed(1),
      frameH: frame ? +frame.height.toFixed(1) : null, lastText: last ? last.textContent.trim() : null, lastY: lr ? +(lr.y - r.y).toFixed(1) : null,
      price: price ? price.textContent.trim() : null, priceY: price ? +(price.getBoundingClientRect().y - r.y).toFixed(1) : null });
  }
  return out;
};
(async () => {
  const b = await chromium.launch();
  const res = {};
  for (const [w, hh] of [[1440, 900], [1280, 720]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: hh } });
    await ctx.addInitScript(() => {
      const d = new Date().toISOString().split('T')[0];
      localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: d, dismissed: true, submitted: true }));
    });
    const p = await ctx.newPage();
    const r = {};
    await p.goto(`${base}/store`, { waitUntil: 'load' }); await p.waitForTimeout(3000);
    for (let y = 0; y < 5000; y += 500) { await p.mouse.wheel(0, 500); await p.waitForTimeout(150); }
    await p.waitForTimeout(1200);
    r.storeAll = await p.evaluate(gridItems);
    // journey: card then page
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    const card = p.locator('a[href="/products/priceless-track"]').first();
    await card.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
    await p.screenshot({ path: `${shotDir}/journey-priceless-track-1-card-${w}.png` });
    await card.click(); await p.getByText('Total Price', { exact: true }).first().waitFor({ timeout: 30000 }); await p.waitForTimeout(1500);
    r.journeyUrl = p.url();
    r.journeyFigure = await p.evaluate(() => { const l = [...document.querySelectorAll('div')].find((d) => d.textContent.trim() === 'Total Price' && !d.children.length); return l.nextElementSibling.textContent.replace(/\s+/g, ' ').trim(); });
    await p.screenshot({ path: `${shotDir}/journey-priceless-track-2-page-${w}.png` });
    // SFX filter: mixed row
    await p.goto(`${base}/store`, { waitUntil: 'load' }); await p.waitForTimeout(2500);
    await p.getByRole('button', { name: 'SFX', exact: true }).first().click(); await p.waitForTimeout(2500);
    for (let y = 0; y < 3000; y += 500) { await p.mouse.wheel(0, 500); await p.waitForTimeout(150); }
    await p.waitForTimeout(1000);
    r.storeSfx = await p.evaluate(gridItems);
    const pp = p.locator('a[href="/products/priceless-pack"]').first();
    if (await pp.count()) { await pp.scrollIntoViewIfNeeded(); await p.waitForTimeout(800); await p.screenshot({ path: `${shotDir}/store-sfx-row-${w}.png` }); }
    // home row
    await p.goto(`${base}/`, { waitUntil: 'load' }); await p.waitForTimeout(3000);
    const hc = p.locator('a[href="/products/priceless-pack"]').first();
    await hc.scrollIntoViewIfNeeded(); await p.waitForTimeout(2000);
    r.home = await p.evaluate(() => [...document.querySelectorAll('article')].filter((a) => a.querySelector('a[href^="/products/"]')).map((a) => {
      const rr = a.getBoundingClientRect(); const cs = getComputedStyle(a);
      return { h: a.querySelector('a[href^="/products/"]').getAttribute('href').slice(10), x: Math.round(rr.x), y: +(rr.y + scrollY).toFixed(1), height: +rr.height.toFixed(1), border: cs.borderTopWidth + ' ' + cs.borderTopColor, bg: cs.backgroundColor };
    }));
    r.popupOpen = await p.evaluate(() => document.body.innerText.includes('FREE DOWNLOAD') && !!document.querySelector('[role="dialog"]'));
    await p.screenshot({ path: `${shotDir}/home-row-${w}.png` });
    res[w] = r;
    await ctx.close();
  }
  fs.writeFileSync(`${__dirname}/probe/p2-${label}.json`, JSON.stringify(res, null, 1));
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
