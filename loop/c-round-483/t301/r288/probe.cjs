// C round 288 probe. usage: node probe.cjs <base> <label> ; writes probe/<label>.json and shots/<label>/
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const path = require('path');
const [base, label] = process.argv.slice(2);
const DIR = __dirname;
const shotDir = path.join(DIR, 'shots', label);
fs.mkdirSync(shotDir, { recursive: true });
fs.mkdirSync(path.join(DIR, 'probe'), { recursive: true });
const ACTIVE = ['middle-east', 'harbour-lights', 'copper-horizon', 'night-train', 'quiet-valley', 'door-slams', 'pulse-loop-kit', 'free-pack', 'priceless-pack', 'priceless-track', 'bad-premium-track'];
const API_RE = /\/api\/(cart|auth|orders)/i;

const gridItems = () => {
  const out = [];
  for (const a of document.querySelectorAll('a[href^="/products/"]')) {
    if (getComputedStyle(a.parentElement).display !== 'grid') continue;
    const r = a.getBoundingClientRect();
    const leaves = [...a.querySelectorAll('*')].filter((e) => e.children.length === 0 && e.textContent.trim());
    const price = leaves.find((e) => /^(\$-?\d+(\.\d+)?|Price unavailable|Complimentary|\$NaN)$/.test(e.textContent.trim()));
    const frame = a.firstElementChild ? a.firstElementChild.getBoundingClientRect() : null;
    const cs = price ? getComputedStyle(price) : null;
    const pr = price ? price.getBoundingClientRect() : null;
    out.push({ h: a.getAttribute('href').slice(10), x: Math.round(r.x), y: +(r.y + scrollY).toFixed(1), w: +r.width.toFixed(1), height: +r.height.toFixed(1),
      frameH: frame ? +frame.height.toFixed(1) : null, frameBottom: frame ? +(frame.bottom + scrollY).toFixed(1) : null,
      price: price ? price.textContent.trim() : null, priceCls: price ? price.className : null,
      lh: cs ? cs.lineHeight : null, fs: cs ? cs.fontSize : null, color: cs ? cs.color : null,
      priceTop: pr ? +(pr.top + scrollY).toFixed(1) : null, priceH: pr ? +pr.height.toFixed(1) : null,
      priceRowTop: price && price.parentElement ? +(price.parentElement.getBoundingClientRect().top + scrollY).toFixed(1) : null,
      text: a.textContent.replace(/\s+/g, ' ').trim().slice(0, 200) });
  }
  return out;
};
const homeItems = () => [...document.querySelectorAll('article')].filter((a) => a.querySelector('a[href^="/products/"]')).map((a) => {
  const rr = a.getBoundingClientRect();
  const leaves = [...a.querySelectorAll('*')].filter((e) => e.children.length === 0 && e.textContent.trim());
  const price = leaves.find((e) => /^(\$-?\d+(\.\d+)?|Price unavailable|Complimentary|\$NaN)$/.test(e.textContent.trim()));
  const cs = price ? getComputedStyle(price) : null;
  const pr = price ? price.getBoundingClientRect() : null;
  const badges = [...a.querySelectorAll('span')].filter((s) => /^(Pack|Complimentary|Free|New|Premium|Limited)$/i.test(s.textContent.trim())).map((s) => s.textContent.trim());
  return { h: a.querySelector('a[href^="/products/"]').getAttribute('href').slice(10), x: Math.round(rr.x), y: +(rr.y + scrollY).toFixed(1), w: +rr.width.toFixed(1), height: +rr.height.toFixed(1),
    price: price ? price.textContent.trim() : null, priceCls: price ? price.className : null, lh: cs ? cs.lineHeight : null, fs: cs ? cs.fontSize : null, color: cs ? cs.color : null,
    priceTop: pr ? +(pr.top + scrollY).toFixed(1) : null, badges, text: a.textContent.replace(/\s+/g, ' ').trim().slice(0, 200) };
});

async function scrollAll(p, n = 6000) { for (let y = 0; y < n; y += 500) { await p.mouse.wheel(0, 500); await p.waitForTimeout(130); } await p.waitForTimeout(1200); }

async function openProduct(page, handle, q = '') {
  const resp = await page.goto(`${base}/products/${handle}${q}`, { waitUntil: 'load', timeout: 120000 });
  await page.getByText('Total Price', { exact: true }).first().waitFor({ timeout: 30000 });
  await page.waitForTimeout(1200);
  return resp ? resp.status() : null;
}
async function productInfo(page) {
  return page.evaluate(() => {
    const label = [...document.querySelectorAll('div')].find((d) => d.textContent.trim() === 'Total Price' && d.children.length === 0);
    const figure = label ? label.nextElementSibling.textContent.replace(/\s+/g, ' ').trim() : null;
    const btn = (n) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().includes(n));
    const bi = (b) => (b ? { ariaDisabled: b.getAttribute('aria-disabled'), disabled: b.hasAttribute('disabled') } : null);
    const versions = [...document.querySelectorAll('button[aria-pressed]')].map((b) => {
      const r = b.getBoundingClientRect();
      return { text: b.textContent.replace(/\s+/g, ' ').trim(), pressed: b.getAttribute('aria-pressed'), box: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) } };
    });
    const body = document.body.innerText;
    return { figure, add: bi(btn('Add to Cart')), buy: bi(btn('Buy Now')), versions,
      bodyM5: body.includes('$-5') || body.includes('-$5') || body.includes('$ -5'), bodyNaN: body.includes('NaN'), bodyDollar0: /\$0(?![\d.])/.test(body) || body.includes('$0.00'),
      unavailableCount: (body.match(/Price unavailable/g) || []).length };
  });
}

(async () => {
  const browser = await chromium.launch();
  const out = { base, label, at: new Date().toISOString(), viewports: {} };
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => {
      try {
        const d = new Date().toISOString().split('T')[0];
        localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: d, dismissed: true, submitted: true }));
        localStorage.setItem('leadMagnetSeen', '1');
      } catch (e) {}
    });
    const page = await ctx.newPage();
    const reqs = [];
    page.on('request', (r) => reqs.push({ t: Date.now(), url: r.url(), method: r.method() }));
    const v = { products: {}, activation: {} };
    // /store All
    await page.goto(`${base}/store`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForTimeout(3000);
    await scrollAll(page);
    v.storeAll = await page.evaluate(gridItems);
    v.mutedVar = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-muted').trim());
    for (const hd of ['priceless-track', 'bad-premium-track']) {
      const a = page.locator(`a[href="/products/${hd}"]`).first();
      if (await a.count()) { await a.scrollIntoViewIfNeeded(); await page.waitForTimeout(500); await page.screenshot({ path: `${shotDir}/store-all-${hd}-${w}.png` }); }
    }
    // journey bad-premium-track: card -> page -> Premium
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
    const card = page.locator('a[href="/products/bad-premium-track"]').first();
    await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
    await card.screenshot({ path: `${shotDir}/journey-bad-premium-1-card-${w}.png` });
    await card.click();
    await page.getByText('Total Price', { exact: true }).first().waitFor({ timeout: 30000 }); await page.waitForTimeout(1500);
    v.journey = { url: page.url(), standard: await productInfo(page) };
    await page.screenshot({ path: `${shotDir}/journey-bad-premium-2-page-${w}.png` });
    const prem = page.locator('button[aria-pressed]').filter({ hasText: 'Premium' }).first();
    v.journey.premiumCardCount = await page.locator('button[aria-pressed]').filter({ hasText: 'Premium' }).count();
    if (v.journey.premiumCardCount) {
      await prem.click(); await page.waitForTimeout(1000);
      v.journey.premium = await productInfo(page);
      v.journey.premiumCardText = (await prem.innerText()).replace(/\s+/g, ' ');
      await page.screenshot({ path: `${shotDir}/journey-bad-premium-3-premium-${w}.png` });
      const vc = page.locator('button[aria-pressed]');
      for (let i = 0; i < await vc.count(); i++) await vc.nth(i).screenshot({ path: `${shotDir}/version-card-bad-premium-${i}-${w}.png` });
    }
    // SFX filter row
    await page.goto(`${base}/store`, { waitUntil: 'load' }); await page.waitForTimeout(2500);
    await page.getByRole('button', { name: 'SFX', exact: true }).first().click(); await page.waitForTimeout(2500);
    await scrollAll(page, 3000);
    v.storeSfx = await page.evaluate(gridItems);
    const pp = page.locator('a[href="/products/priceless-pack"]').first();
    if (await pp.count()) { await pp.scrollIntoViewIfNeeded(); await page.waitForTimeout(800); await page.screenshot({ path: `${shotDir}/store-sfx-row-${w}.png` }); }
    // home
    await page.goto(`${base}/`, { waitUntil: 'load', timeout: 120000 }); await page.waitForTimeout(3000);
    await scrollAll(page);
    v.home = await page.evaluate(homeItems);
    const hc = page.locator('a[href="/products/priceless-pack"]').first();
    if (await hc.count()) { await hc.scrollIntoViewIfNeeded(); await page.waitForTimeout(1500); }
    await page.screenshot({ path: `${shotDir}/home-row-${w}.png` });
    // product pages
    for (const hd of ACTIVE) {
      const st = await openProduct(page, hd);
      v.products[hd] = { status: st, ...(await productInfo(page)) };
      if (['priceless-track', 'bad-premium-track', 'middle-east', 'free-pack', 'priceless-pack'].includes(hd)) await page.screenshot({ path: `${shotDir}/product-${hd}-${w}.png` });
      if (hd === 'priceless-track') { const vc = page.locator('button[aria-pressed]').first(); if (await vc.count()) await vc.screenshot({ path: `${shotDir}/version-card-priceless-track-${w}.png` }); }
    }
    // R286-KEEP activation on priceless-pack + bad-premium Premium selected
    for (const [hd, sel] of [['priceless-pack', null], ['bad-premium-track', 'Premium']]) {
      for (const nm of ['Add to Cart', 'Buy Now']) {
        for (const how of ['click', 'Enter', 'Space']) {
          await openProduct(page, hd);
          if (sel) { await page.locator('button[aria-pressed]').filter({ hasText: sel }).first().click(); await page.waitForTimeout(500); }
          const b = page.getByRole('button', { name: nm }).first();
          const t0 = Date.now();
          if (how === 'click') { const bx = await b.boundingBox(); await page.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); }
          else { await b.focus(); await page.keyboard.press(how === 'Space' ? ' ' : 'Enter'); }
          await page.waitForTimeout(1000);
          v.activation[`${hd}/${nm}/${how}`] = { api: reqs.filter((r) => r.t >= t0 && API_RE.test(r.url)).map((r) => `${r.method} ${r.url}`),
            signIn: await page.evaluate(() => document.body.innerText.includes('Forgot password?') || document.body.innerText.includes('Please sign in')) };
        }
      }
    }
    v.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    out.viewports[w] = v;
    await ctx.close();
  }
  fs.writeFileSync(path.join(DIR, 'probe', `${label}.json`), JSON.stringify(out, null, 1));
  console.log('done', label);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
