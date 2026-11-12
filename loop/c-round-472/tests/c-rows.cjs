const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('node:fs');
const O = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-472';
const T = { head: 'http://127.0.0.1:3101', tree: 'http://127.0.0.1:3102' };
const res = {};
(async () => {
  const b = await chromium.launch();
  for (const [name, base] of Object.entries(T)) {
    res[name] = {};
    for (const [w, h] of [[1440, 900], [1280, 720]]) {
      const key = `${w}`;
      const r = (res[name][key] = {});
      const ctx = await b.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      // C4 keep-list home
      await page.goto(base + '/', { waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(2500);
      r.home = await page.evaluate(() => {
        const txt = document.body.innerText;
        const hits = ['2,500+', 'Netflix Original Score', 'Limited', 'FREE DOWNLOAD', 'Special', 'Happy Customers'].map((s) => [s, txt.includes(s)]);
        const badges = [...document.querySelectorAll('*')].filter((e) => e.children.length === 0 && /limited/i.test(e.textContent || '')).map((e) => ({ t: e.textContent.trim().slice(0, 30), sw: e.scrollWidth, cw: e.clientWidth, lines: new Set([...e.getClientRects()].map((x) => Math.round(x.top))).size, family: getComputedStyle(e).fontFamily.slice(0, 20) }));
        return { hits, badges: badges.slice(0, 8), dialog: !!document.querySelector('[role=dialog]') };
      });
      if (w === 1440) {
        const h1 = page.locator('h1').first();
        await h1.scrollIntoViewIfNeeded();
        r.h1w = await h1.evaluate((e) => getComputedStyle(e).fontWeight);
        await h1.screenshot({ path: `${O}/shots/${name}-home-h1.png` });
      }
      await page.screenshot({ path: `${O}/shots/${name}-home-${w}.png` });
      // store
      await page.goto(base + '/store', { waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(2000);
      r.store = await page.evaluate(() => {
        const t = document.body.innerText;
        const h1 = document.querySelector('h1');
        const cards = [...document.querySelectorAll('a[href^="/products/"]')].slice(0, 6).map((a) => ({ sw: a.scrollWidth, cw: a.clientWidth }));
        return { limited: /limited|exclusive/i.test(t), bpm: /bpm/i.test(t), price: /\$\d/.test(t), h1w: h1 && getComputedStyle(h1).fontWeight, ncards: cards.length, over: cards.filter((c) => c.sw > c.cw + 1).length };
      });
      if (w === 1440) { const h1 = page.locator('h1').first(); await h1.screenshot({ path: `${O}/shots/${name}-store-h1.png` }); }
      await page.screenshot({ path: `${O}/shots/${name}-store-${w}.png` });
      // Ctrl+K kbd
      await page.keyboard.press('Control+k'); await page.waitForTimeout(700);
      r.kbd = await page.evaluate(() => [...document.querySelectorAll('kbd')].slice(0, 4).map((k) => ({ t: k.textContent, f: getComputedStyle(k).fontFamily.slice(0, 40) })));
      // leadmagnet focus
      await page.keyboard.press('Escape');
      // C7 studio-lab
      const sctx = await b.newContext({ viewport: { width: w, height: h } });
      const sp = await sctx.newPage();
      await sp.goto(base + '/studio-lab', { waitUntil: 'networkidle' }).catch(() => {});
      await sp.waitForTimeout(2500);
      r.lab = await sp.evaluate(() => {
        const ws = document.querySelector('[data-studio-theme]') || document.body;
        const fams = {};
        for (const e of document.querySelectorAll('[data-studio-theme] *')) { const f = getComputedStyle(e).fontFamily; if (e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) fams[f] = (fams[f] || 0) + 1; }
        return { theme: !!document.querySelector('[data-studio-theme]'), url: location.pathname, fams, signin: /sign in required/i.test(document.body.innerText), assets: document.querySelectorAll('[draggable=true]').length, text: document.body.innerText.slice(0, 120).replace(/\n/g, ' | ') };
      });
      await sp.screenshot({ path: `${O}/shots/${name}-lab-${w}.png` });
      await sctx.close(); await ctx.close();
    }
    // C8/C13 legacy + token
    const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await ctx.newPage();
    const audio = [];
    page.on('request', (q) => { if (/\.(wav|mp3|m4a)(\?|$)|audio/.test(q.url()) && !/woff/.test(q.url())) audio.push(q.url()); });
    await page.goto(base + '/studio/middle-east', { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1500);
    res[name].legacy = await page.evaluate(() => ({ signin: /sign in required/i.test(document.body.innerText), fam: getComputedStyle(document.body).fontFamily.slice(0, 20), audioSrc: document.querySelectorAll('audio[src],source[src]').length, text: document.body.innerText.slice(0, 80).replace(/\n/g, ' | ') }));
    res[name].legacy.audioReq = audio.length;
    await page.screenshot({ path: `${O}/shots/${name}-legacy-1280.png` });
    const tk = await ctx.request.get(base + '/api/studio-token?productId=middle-east');
    res[name].token = tk.status();
    const tk2 = await ctx.request.post(base + '/api/studio-token', { data: { productId: 'middle-east' } });
    res[name].tokenPost = tk2.status();
    await ctx.close();
  }
  // C9 journey on tree
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const j = (res.journey = []);
  await p.goto(T.tree + '/store', { waitUntil: 'networkidle' }).catch(() => {}); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${O}/shots/j1-store.png` });
  j.push({ step: 'store', fam: await p.evaluate(() => getComputedStyle(document.body).fontFamily.slice(0, 20)) });
  await p.locator('a[href^="/products/"]').first().click(); await p.waitForLoadState('networkidle').catch(() => {}); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${O}/shots/j2-product.png` });
  const cta = p.getByRole('link', { name: /try it in the studio/i }).first();
  j.push({ step: 'product', url: p.url(), cta: await cta.count(), fam: await p.evaluate(() => getComputedStyle(document.body).fontFamily.slice(0, 20)) });
  if (await cta.count()) { await cta.click(); await p.waitForLoadState('networkidle').catch(() => {}); await p.waitForTimeout(2500); }
  await p.screenshot({ path: `${O}/shots/j3-studio.png` });
  j.push({ step: 'studio', url: p.url(), theme: await p.evaluate(() => !!document.querySelector('[data-studio-theme]')) });
  fs.writeFileSync(`${O}/rows.json`, JSON.stringify(res, null, 1));
  await b.close();
})();
