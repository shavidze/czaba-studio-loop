// C round 287 probe. usage: node probe.cjs <base> <label> ; writes probe/<label>.json and shots/<label>/
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const path = require('path');
const [base, label] = process.argv.slice(2);
const DIR = __dirname;
const shotDir = path.join(DIR, 'shots', label);
fs.mkdirSync(shotDir, { recursive: true });
const STD = ['middle-east', 'harbour-lights', 'copper-horizon', 'night-train', 'quiet-valley', 'door-slams', 'pulse-loop-kit'];
const EXTRA = ['priceless-track', 'priceless-pack', 'free-pack'];
const API_RE = /\/api\/(cart|auth|orders)/i;
const PRICE_RE = '^(\\$\\d+(\\.\\d+)?|Complimentary|Price unavailable)$';

const cardScan = (re) => {
  const rx = new RegExp(re);
  const res = {};
  for (const a of document.querySelectorAll('a[href^="/products/"]')) {
    const h = a.getAttribute('href').replace('/products/', '');
    if (res[h]) continue;
    let el = a;
    for (let i = 0; i < 8 && el; i++) {
      const p = [...el.querySelectorAll('span,div,p')].find((x) => x.children.length === 0 && rx.test(x.textContent.trim()));
      if (p) {
        const cs = getComputedStyle(p);
        const pr = p.getBoundingClientRect();
        const cr = el.getBoundingClientRect();
        const card = el.textContent.replace(/\s+/g, ' ').trim();
        res[h] = { price: p.textContent.trim(), cls: p.className, color: cs.color, fontSize: cs.fontSize, fontWeight: cs.fontWeight,
          priceBox: { w: +pr.width.toFixed(1), h: +pr.height.toFixed(1) }, cardBox: { w: +cr.width.toFixed(1), h: +cr.height.toFixed(1) },
          cardText: card.slice(0, 300), hasDollar0: /\$0(?!\d|\.)/.test(card) || card.includes('$0.00'), complimentary: card.includes('Complimentary'),
          nan: card.includes('NaN') };
        break;
      }
      el = el.parentElement;
    }
  }
  return res;
};

async function openProduct(page, handle) {
  const resp = await page.goto(`${base}/products/${handle}`, { waitUntil: 'load', timeout: 120000 });
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
      const slot = b.querySelector('.shrink-0');
      const sr = slot ? slot.getBoundingClientRect() : null;
      const priceEl = slot ? [...slot.querySelectorAll('span')].find((s) => s.children.length === 0) : null;
      return { text: b.textContent.replace(/\s+/g, ' ').trim(), pressed: b.getAttribute('aria-pressed'),
        box: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
        slotText: slot ? slot.textContent.replace(/\s+/g, ' ').trim() : null,
        slotBox: sr ? { w: +sr.width.toFixed(1), h: +sr.height.toFixed(1) } : null,
        priceCls: priceEl ? priceEl.className : null, priceColor: priceEl ? getComputedStyle(priceEl).color : null };
    });
    const body = document.body.innerText;
    return { figure, add: bi(btn('Add to Cart')), buy: bi(btn('Buy Now')), versions,
      bodyDollar0: /\$0(?![\d.])/.test(body) || body.includes('$0.00'), bodyNaN: body.includes('NaN'), complimentaryDl: body.includes('Complimentary Download') };
  });
}

(async () => {
  const browser = await chromium.launch();
  const out = { base, label, at: new Date().toISOString(), viewports: [] };
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => { try { localStorage.setItem('leadMagnetSeen', '1'); } catch (e) {} });
    const page = await ctx.newPage();
    const reqs = [];
    page.on('request', (r) => reqs.push({ t: Date.now(), url: r.url(), method: r.method() }));
    const v = { viewport: [w, h], products: {}, store: null, home: null, activation: {} };
    // /store
    await page.goto(`${base}/store`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForTimeout(3500);
    v.mutedVar = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-muted').trim());
    v.store = await page.evaluate(cardScan, PRICE_RE);
    await page.screenshot({ path: `${shotDir}/store-${w}.png`, fullPage: true });
    for (const hd of ['priceless-pack', 'priceless-track', 'free-pack']) {
      const a = page.locator(`a[href="/products/${hd}"]`).first();
      if (await a.count()) { await a.scrollIntoViewIfNeeded(); await page.waitForTimeout(400); await page.screenshot({ path: `${shotDir}/store-card-${hd}-${w}.png` }); }
    }
    // home
    await page.goto(`${base}/`, { waitUntil: 'load', timeout: 120000 });
    await page.waitForTimeout(3500);
    for (let y = 0; y < 6000; y += 600) { await page.mouse.wheel(0, 600); await page.waitForTimeout(150); }
    await page.waitForTimeout(1500);
    v.home = await page.evaluate(cardScan, PRICE_RE);
    v.homeHandles = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="/products/"]')].map((a) => a.getAttribute('href')))]);
    v.homeBadges = await page.evaluate(() => {
      const r = {};
      for (const a of document.querySelectorAll('a[href^="/products/"]')) {
        const h = a.getAttribute('href').replace('/products/', '');
        let el = a; for (let i = 0; i < 4 && el.parentElement; i++) el = el.parentElement;
        r[h] = [...el.querySelectorAll('span')].filter((s) => /^(Pack|Complimentary|Free|New|Premium)$/i.test(s.textContent.trim())).map((s) => s.textContent.trim());
      }
      return r;
    });
    for (const hd of ['priceless-track', 'free-pack', 'priceless-pack']) {
      const a = page.locator(`a[href="/products/${hd}"]`).first();
      if (await a.count()) { await a.scrollIntoViewIfNeeded(); await page.waitForTimeout(500); await page.screenshot({ path: `${shotDir}/home-card-${hd}-${w}.png` }); }
    }
    // product pages
    for (const hd of [...STD, ...EXTRA]) {
      const st = await openProduct(page, hd);
      v.products[hd] = { status: st, ...(await productInfo(page)) };
      if (EXTRA.includes(hd) || hd === 'middle-east' || hd === 'door-slams') await page.screenshot({ path: `${shotDir}/product-${hd}-${w}.png` });
      if (hd === 'priceless-track') {
        const vc = page.locator('button[aria-pressed]').first();
        if (await vc.count()) await vc.screenshot({ path: `${shotDir}/version-card-priceless-track-${w}.png` });
      }
    }
    // R286-KEEP activation on priceless-pack
    for (const nm of ['Add to Cart', 'Buy Now']) {
      for (const how of ['click', 'Enter', 'Space']) {
        await openProduct(page, 'priceless-pack');
        const b = page.getByRole('button', { name: nm }).first();
        const t0 = Date.now();
        if (how === 'click') { const bx = await b.boundingBox(); await page.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); }
        else { await b.focus(); await page.keyboard.press(how === 'Space' ? ' ' : 'Enter'); }
        await page.waitForTimeout(1000);
        v.activation[`${nm}/${how}`] = { api: reqs.filter((r) => r.t >= t0 && API_RE.test(r.url)).map((r) => `${r.method} ${r.url}`),
          signIn: await page.evaluate(() => document.body.innerText.includes('Forgot password?') || document.body.innerText.includes('Please sign in')) };
      }
    }
    v.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    out.viewports.push(v);
    await ctx.close();
  }
  fs.mkdirSync(path.join(DIR, 'probe'), { recursive: true });
  fs.writeFileSync(path.join(DIR, 'probe', `${label}.json`), JSON.stringify(out, null, 1));
  console.log('done', label);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
