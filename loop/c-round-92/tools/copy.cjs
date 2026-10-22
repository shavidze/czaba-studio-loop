// DEMO-COPY + REG-HYD (SSR h1), fresh incognito per viewport
const X = require('./ext.cjs'); const { sleep } = X;
const H1 = 'CZABA Studio Lab · სამუშაო სივრცე', BADGE = 'დემო კოლექცია — ავტორიზაცია არ სჭირდება', TITLE = 'Studio Lab — დემო სამუშაო სივრცე | CZABA', NOTICE = 'სტემები სინთეზური დემოა — არა CZABA-ს კატალოგის სტემები და არა მიქსიდან ამოღებული ნაწილები.';
(async () => {
  const b = await X.launch(); const out = {};
  for (const vp of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
    const tag = `copy-${vp.width}`; const { ctx, page: p, S } = await X.newCtx(b, vp, tag);
    const ssr = await ctx.request.get(X.URL); const html = await ssr.text();
    const m = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
    const bm = html.includes(BADGE);
    await p.goto(X.URL, { waitUntil: 'domcontentloaded' });
    const early = await X.status(p);
    await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
    const st = await X.waitStatus(p, (s) => s === X.READY || /ვერ ჩაიტვირთა/.test(s || ''));
    await sleep(1500);
    const d = await p.evaluate(() => {
      const hd = document.querySelector('header:has(h1)') || document.querySelector('h1').closest('header');
      const h1 = hd.querySelector('h1'); const badge = [...hd.querySelectorAll('span')].find((s) => /border-accent/.test(s.className));
      const master = document.querySelector('[data-testid=arrangement-master]');
      const R = (e) => { const r = e.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), r: +r.right.toFixed(1), b: +r.bottom.toFixed(1) }; };
      const lh = (e) => parseFloat(getComputedStyle(e).lineHeight) || parseFloat(getComputedStyle(e).fontSize) * 1.5;
      const inter = (a, c) => !(a.r <= c.x || c.r <= a.x || a.b <= c.y || c.b <= a.y);
      const hr = R(hd), h1r = R(h1), br = R(badge), mr = master ? R(master) : null;
      const inside = (a) => a.x >= hr.x - 0.5 && a.r <= hr.r + 0.5 && a.y >= hr.y - 0.5 && a.b <= hr.b + 0.5;
      return { h1: h1.textContent, h1Nodes: [...h1.childNodes].map((n) => n.nodeType === 3 ? `#text:${JSON.stringify(n.textContent)}` : n.tagName), badge: badge.textContent, badgeCount: [...document.querySelectorAll('header span')].filter((s) => s.textContent === badge.textContent).length,
        title: document.title, notice: document.querySelector('[data-testid=arrangement-library-notice]')?.textContent ?? null,
        rects: { header: hr, h1: h1r, badge: br, master: mr }, h1Lh: lh(h1), badgeLh: lh(badge), h1OneLine: h1r.h < 2 * lh(h1) - 1, badgeOneLine: br.h < 2 * lh(badge) - 1,
        h1Inside: inside(h1r), badgeInside: inside(br), badgeOverMaster: mr ? inter(br, mr) : null, h1OverMaster: mr ? inter(h1r, mr) : null,
        bodyDemoOccur: (document.body.innerText.match(/შეძენილი/g) || []).length };
    });
    await p.screenshot({ path: `${X.SHOTS}/demo-copy-${vp.width}x${vp.height}.png` });
    await p.locator('header').first().screenshot({ path: `${X.SHOTS}/demo-header-${vp.width}x${vp.height}.png` });
    const pass = d.h1 === H1 && d.badge === BADGE && st === X.READY && d.title === TITLE && d.notice === NOTICE && d.h1OneLine && d.badgeOneLine && d.h1Inside && d.badgeInside && d.badgeOverMaster === false && d.h1OverMaster === false && d.h1Nodes.length === 2;
    out[tag] = { pass, ssr: { status: ssr.status(), h1: m && m[1], commentInH1: m ? m[1].includes('<!--') : null, badgeInSSR: bm, ssrStatusLoading: html.includes('დემო კოლექცია იტვირთება…') }, early, status: st, ...d, errors: S.errors, noise: S.noise, forbidden: S.forbidden, auth: S.authHeaders, third: [...new Set(S.thirdParty)], unpkg: S.unpkg };
    await ctx.close();
  }
  X.save('demo-copy.json', out); console.log(JSON.stringify(out, null, 1)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
