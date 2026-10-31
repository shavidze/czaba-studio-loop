// C round 286 product-page probe. usage: node product-probe.cjs <base> <mode known|unknown> <out.json> <shotDir>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const [base, mode, out, shotDir] = process.argv.slice(2);
fs.mkdirSync(shotDir, { recursive: true });
const HANDLES = ['door-slams', 'middle-east', 'copper-horizon', 'harbour-lights', 'night-train', 'quiet-valley', 'pulse-loop-kit'];
const API_RE = /\/api\/(cart|auth|orders)/i;

async function openProduct(page, handle) {
  const resp = await page.goto(`${base}/products/${handle}`, { waitUntil: 'load', timeout: 120000 });
  await page.getByText('Total Price', { exact: true }).first().waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);
  return resp ? resp.status() : null;
}

async function panelInfo(page) {
  return page.evaluate(() => {
    const label = [...document.querySelectorAll('div')].find((d) => d.textContent.trim() === 'Total Price' && d.children.length === 0);
    if (!label) return { found: false };
    const figure = label.nextElementSibling;
    let panel = label;
    while (panel && !(panel.className && String(panel.className).includes('p-6'))) panel = panel.parentElement;
    const outer = panel ? panel.parentElement : null;
    const r = panel ? panel.getBoundingClientRect() : null;
    const btn = (name) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim().includes(name));
    const bi = (b) => b ? ({ ariaDisabled: b.getAttribute('aria-disabled'), disabled: b.hasAttribute('disabled'), describedby: b.getAttribute('aria-describedby'),
      describedText: b.getAttribute('aria-describedby') ? (document.getElementById(b.getAttribute('aria-describedby')) || {}).textContent : null,
      opacity: getComputedStyle(b).opacity, cursor: getComputedStyle(b).cursor, tabIndex: b.tabIndex }) : null;
    const contact = [...document.querySelectorAll('a')].find((a) => a.textContent.trim() === 'contact us');
    return {
      found: true,
      figure: figure ? figure.textContent.replace(/\s+/g, ' ').trim() : null,
      panelText: panel ? panel.textContent.replace(/\s+/g, ' ').trim() : null,
      panelHasDollar: panel ? panel.textContent.includes('$') : null,
      outerText: outer ? outer.textContent.replace(/\s+/g, ' ').trim().slice(0, 400) : null,
      bbox: r ? { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) } : null,
      add: bi(btn('Add to Cart')),
      buy: bi(btn('Buy Now')),
      contactHref: contact ? contact.getAttribute('href') : null,
      bodyHas000: document.body.innerText.includes('$0.00'),
      complimentary: document.body.innerText.includes('Complimentary Download'),
    };
  });
}

async function overlayState(page) {
  return page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const dialogs = [...document.querySelectorAll('[role="dialog"],[aria-modal="true"],dialog[open]')].filter(vis).length;
    const t = document.body.innerText;
    return { dialogs, signInModal: t.includes('Forgot password?') && t.includes('Sign in'), toastSignIn: t.includes('Please sign in'), toastNotAvail: t.includes('not yet available'), toastAdded: /Added to cart/i.test(t), url: location.pathname };
  });
}

async function centerClick(page, name) {
  const b = page.getByRole('button', { name }).first();
  const box = await b.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function storeCards(page) {
  await page.goto(`${base}/store`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(4000);
  return page.evaluate(() => {
    const res = {};
    for (const a of document.querySelectorAll('a[href^="/products/"]')) {
      const h = a.getAttribute('href').replace('/products/', '');
      if (res[h]) continue;
      let el = a;
      for (let i = 0; i < 8 && el; i++) { const p = [...el.querySelectorAll('*')].find((x) => x.children.length === 0 && /^(\$\d+(\.\d+)?|Complimentary.*|Price unavailable)$/.test(x.textContent.trim())); if (p) { res[h] = p.textContent.trim(); break; } el = el.parentElement; }
    }
    return res;
  });
}

(async () => {
  const browser = await chromium.launch();
  const result = { base, mode, viewports: [] };
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const reqs = [];
    page.on('request', (r) => reqs.push({ t: Date.now(), url: r.url(), method: r.method() }));
    const v = { viewport: [w, h], authUser: null, pages: {}, activation: {}, cards: null };
    if (mode === 'known') {
      for (const hd of HANDLES) {
        const st = await openProduct(page, hd);
        v.pages[hd] = { status: st, ...(await panelInfo(page)) };
        await page.screenshot({ path: `${shotDir}/${hd}-${w}.png` });
      }
      v.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
      // Premium on middle-east
      await openProduct(page, 'middle-east');
      const prem = page.locator('button[aria-pressed]').filter({ hasText: 'Premium' }).first();
      v.middleEastPremiumButtons = await prem.count();
      if (v.middleEastPremiumButtons) { await prem.click(); await page.waitForTimeout(600); v.middleEastPremium = await panelInfo(page); await page.screenshot({ path: `${shotDir}/middle-east-premium-${w}.png` }); }
      // signed-out Buy Now on door-slams and middle-east
      for (const hd of ['door-slams', 'middle-east']) {
        await openProduct(page, hd);
        const t0 = Date.now();
        await centerClick(page, 'Buy Now');
        await page.waitForTimeout(1200);
        v.activation[hd] = { buyNow: await overlayState(page), apiAfter: reqs.filter((r) => r.t >= t0 && API_RE.test(r.url)).map((r) => `${r.method} ${r.url}`) };
        await page.screenshot({ path: `${shotDir}/${hd}-buynow-${w}.png` });
      }
      v.cards = await storeCards(page);
      if (w === 1440) {
        const card = page.locator('a[href="/products/door-slams"]').first();
        await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
        await page.screenshot({ path: `${shotDir}/journey-door-slams-1-card-${w}.png` });
        await openProduct(page, 'door-slams');
        await page.screenshot({ path: `${shotDir}/journey-door-slams-2-page-${w}.png` });
      }
    } else {
      const hd = 'priceless-pack';
      const st = await openProduct(page, hd);
      v.pages[hd] = { status: st, ...(await panelInfo(page)) };
      v.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
      const panel = page.getByText('Total Price', { exact: true }).locator('xpath=ancestor::div[contains(@class,"p-6")][1]/..');
      await panel.screenshot({ path: `${shotDir}/priceless-panel-${w}.png` });
      await page.screenshot({ path: `${shotDir}/priceless-page-${w}.png` });
      // Tab order from the document start
      await page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
      await page.mouse.click(2, h - 2).catch(() => {});
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      const seq = [];
      for (let i = 0; i < 90; i++) {
        await page.keyboard.press('Tab');
        const f = await page.evaluate(() => {
          const e = document.activeElement; if (!e || e === document.body) return null;
          const s = getComputedStyle(e);
          return { tag: e.tagName, name: (e.getAttribute('aria-label') || e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40), href: e.getAttribute('href'),
            outlineWidth: s.outlineWidth, outlineStyle: s.outlineStyle, outlineColor: s.outlineColor, focusVisible: e.matches(':focus-visible'), inSidebar: !!e.closest('aside') };
        });
        seq.push(f);
        if (f && f.name === 'contact us') { break; }
      }
      v.tabSeq = seq;
      for (const nm of ['Add to Cart', 'Buy Now', 'contact us']) {
        const fi = seq.findIndex((x) => x && x.name === nm); v[`tabIndexOf_${nm}`] = fi;
      }
      const ai = v['tabIndexOf_Add to Cart'];
      v.tabOrderOk = ai >= 0 && seq[ai + 1] && seq[ai + 1].name === 'Buy Now' && seq[ai + 2] && seq[ai + 2].name === 'contact us';
      v.tabPrev = ai > 0 ? seq[ai - 1] : null;
      if (ai >= 0) { await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Shift+Tab'); await page.screenshot({ path: `${shotDir}/priceless-focus-add-${w}.png` }); }
      // activation: click, Enter, Space on each button
      for (const nm of ['Add to Cart', 'Buy Now']) {
        const rec = {};
        for (const how of ['click', 'Enter', 'Space']) {
          await openProduct(page, hd);
          const t0 = Date.now();
          if (how === 'click') await centerClick(page, nm);
          else { await page.getByRole('button', { name: nm }).first().focus(); await page.keyboard.press(how); }
          await page.waitForTimeout(1200);
          rec[how] = { ...(await overlayState(page)), focusedName: await page.evaluate(() => (document.activeElement.textContent || '').trim().slice(0, 30)),
            apiAfter: reqs.filter((r) => r.t >= t0 && API_RE.test(r.url)).map((r) => `${r.method} ${r.url}`) };
        }
        v.activation[nm] = rec;
      }
      v.loadApiRequests = reqs.filter((r) => API_RE.test(r.url)).map((r) => `${r.method} ${r.url}`).slice(0, 6);
      await openProduct(page, hd);
      await page.getByRole('link', { name: 'contact us' }).click();
      await page.waitForURL('**/support', { timeout: 15000 }).catch(() => {});
      v.contactUsUrl = new URL(page.url()).pathname;
      v.cards = await storeCards(page);
      const card = page.locator('a[href="/products/priceless-pack"]').first();
      if (await card.count()) { await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(500); await page.screenshot({ path: `${shotDir}/priceless-store-card-${w}.png` }); }
    }
    result.viewports.push(v);
    await ctx.close();
  }
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  console.log('ok');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
