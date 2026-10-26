// C round 188 — NAV/H1/MARK/FOOT/KEEP/PX-NET/REG-HYD on the store pages. node c188-main.cjs <1440|1280|375>
const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path'); const { decode } = require('./png.cjs');
const VPS = { 1440: { width: 1440, height: 900 }, 1280: { width: 1280, height: 720 }, 375: { width: 375, height: 812 } };
const W = process.argv[2]; const ROOT = path.join(__dirname, '..'); const SH = path.join(ROOT, 'shots', `main-${W}`); fs.mkdirSync(SH, { recursive: true });
const ALLOWED = new Set(['127.0.0.1:5173', 'localhost:5173', '127.0.0.1:5199', 'localhost:5199', '[::1]:5199']);
const FONT_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);
const PAGES = ['/', '/store', '/products/middle-east', '/about', '/free-downloads', '/gift-cards', '/hire-us', '/does-not-exist-188'];
const EXP = [['Collections', '/store'], ['Studio', '/studio-lab'], ['Free Samples', '/free-downloads'], ['About', '/about']];
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const rgb = (s) => s.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
const desktop = W !== '375';
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text'] });
  const res = { W, utc: new Date().toISOString(), rows: {} };
  const ev = { console: [], pageerror: [], hosts: {}, foreign: [], auth: [] }; let cur = 'init';
  const instrument = (pg) => {
    pg.on('console', (m) => ev.console.push({ page: cur, type: m.type(), text: m.text().slice(0, 300) }));
    pg.on('pageerror', (e) => ev.pageerror.push({ page: cur, text: String(e).slice(0, 300) }));
    pg.on('request', (q) => { const u = q.url(); if (/^(data|blob):/.test(u)) return; let h; try { h = new URL(u).host; } catch { h = u; } ev.hosts[h] = (ev.hosts[h] || 0) + 1; if (!ALLOWED.has(h)) ev.foreign.push({ page: cur, u: u.slice(0, 160), font: FONT_HOSTS.has(h) }); if (q.headers().authorization) ev.auth.push(u); });
  };
  // ---------- SSR (JS off) ----------
  const ssrCtx = await b.newContext({ viewport: VPS[W], javaScriptEnabled: false }); const sp = await ssrCtx.newPage(); instrument(sp);
  res.ssr = {};
  for (const u of PAGES) { cur = 'ssr ' + u; const r = await sp.goto(L.BASE + u, { waitUntil: 'load', timeout: 60000 }); res.ssr[u] = { status: r.status(), ...(await sp.evaluate(() => ({ h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim().slice(0, 50)), headerHeadings: document.querySelector('header') ? document.querySelector('header').querySelectorAll('h1,h2,h3,h4,h5,h6').length : null, czabaMusic: (document.documentElement.outerHTML.match(/Czaba Music/g) || []).length, copyright: (document.querySelector('footer') && (document.querySelector('footer').innerText.match(/©[^\n]*/) || [null])[0]) || null, studioLabA: (document.documentElement.outerHTML.match(/Studio Lab<\/a/g) || []).length }))) }; }
  await ssrCtx.close();
  // ---------- hydrated ----------
  const ctx = await b.newContext({ viewport: VPS[W], deviceScaleFactor: 2 }); const page = await ctx.newPage(); instrument(page);
  const loaderUp = () => page.evaluate(() => [...document.querySelectorAll('div.fixed.inset-0')].some((d) => d.style.backgroundColor === 'rgb(0, 0, 0)'));
  const waitLoader = async () => { const t0 = Date.now(); let seen = false, h1During = null; while (Date.now() - t0 < 20000) { const up = await loaderUp(); if (up) { seen = true; if (h1During === null) h1During = await page.evaluate(() => document.querySelectorAll('h1').length); } if (!up && (seen || Date.now() - t0 > 1500)) break; await L.sleep(100); } return { seen, ms: Date.now() - t0, h1During }; };
  const popupUp = () => page.evaluate(() => !!document.querySelector('div.fixed.inset-0.z-\\[9999\\]'));
  const closePopup = async () => { if (await popupUp()) { await page.locator('div.fixed.inset-0.z-\\[9999\\] button[aria-label=Close]').click(); await L.sleep(400); return true; } return false; };
  const go = async (u) => { cur = u; const r = await page.goto(L.BASE + u, { waitUntil: 'load', timeout: 60000 }); const ld = await waitLoader(); await L.sleep(800); return { status: r.status(), loader: ld }; };
  const hit = async (loc) => { await loc.scrollIntoViewIfNeeded(); const bx = await loc.boundingBox(); const ok = await loc.evaluate((el, p) => { const t = document.elementFromPoint(p.x, p.y); return !!t && (t === el || el.contains(t)); }, { x: bx.x + bx.width / 2, y: bx.y + bx.height / 2 }); return { ok, box: bx }; };
  const navInv = (i) => page.evaluate((i) => { const n = document.querySelectorAll('header nav')[i]; return n ? [...n.querySelectorAll('a')].map((a) => ({ t: a.textContent.trim(), h: a.getAttribute('href'), vis: a.getBoundingClientRect().width > 0 && getComputedStyle(n).display !== 'none', cls: a.className })) : null; }, i);
  const headerFacts = () => page.evaluate(() => { const h = document.querySelector('header'); const t = h.innerText; const a = h.querySelector('a[href="/"]'); const s = a.firstElementChild; const cs = getComputedStyle(s); const probe = document.createElement('span'); probe.className = 'text-foreground'; document.body.appendChild(probe); const fg = getComputedStyle(probe).color; probe.remove(); const hb = h.getBoundingClientRect(); const next = h.nextElementSibling; return { headerH: +hb.height.toFixed(2), nextTop: next ? +next.getBoundingClientRect().top.toFixed(2) : null, nextTag: next ? next.tagName : null, headings: h.querySelectorAll('h1,h2,h3,h4,h5,h6').length, textGlow: h.querySelectorAll('.text-glow').length, banned: ['Gift Cards', 'Hire Us', 'Demo', 'Studio Lab'].filter((x) => t.includes(x) || h.textContent.includes(x)), bannedHref: [...h.querySelectorAll('a')].map((x) => x.getAttribute('href')).filter((x) => x === '/gift-cards' || x === '/hire-us'), mark: { tag: s.tagName, text: a.textContent.trim(), aria: a.getAttribute('aria-label'), fill: cs.webkitTextFillColor, color: cs.color, bgImage: cs.backgroundImage, clip: cs.webkitBackgroundClip || cs.backgroundClip, font: cs.fontSize + ' ' + cs.fontWeight, box: (() => { const r = s.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })() }, fgToken: fg, headerBg: getComputedStyle(h).backgroundColor }; });
  const h1Count = () => page.evaluate(() => { const ov = [...document.querySelectorAll('div.fixed.inset-0')].filter((d) => d.style.backgroundColor === 'rgb(0, 0, 0)'); const all = [...document.querySelectorAll('h1')]; return { total: all.length, outsideLoader: all.filter((h) => !ov.some((o) => o.contains(h))).map((h) => h.textContent.trim().slice(0, 50)), czabaMusicDom: (document.body.innerText.match(/Czaba Music/g) || []).length + (document.documentElement.outerHTML.match(/Czaba Music/g) || []).length, copyright: (document.querySelector('footer') && (document.querySelector('footer').innerText.match(/©[^\n]*/) || [null])[0]) || null }; });
  // H1-188 hydrated + MARK on every page
  res.hyd = {};
  for (const u of PAGES) { const g = await go(u); res.hyd[u] = { ...g, ...(await h1Count()), header: await headerFacts() }; }
  // MARK contrast (on /store): hide text, sample the background behind the wordmark
  await go('/store'); await page.evaluate(() => scrollTo(0, 0)); await page.mouse.move(W / 2 | 0, 600); await L.sleep(300);
  const mk = await headerFacts();
  const span = page.locator('header a[href="/"] > span');
  const bx = await span.boundingBox();
  await page.screenshot({ path: path.join(SH, 'header.png'), clip: { x: 0, y: 0, width: VPS[W].width, height: Math.ceil(mk.headerH) + 2 } });
  await page.screenshot({ path: path.join(SH, 'wordmark.png'), clip: bx });
  await span.evaluate((s) => s.style.setProperty('color', 'transparent', 'important')); await L.sleep(200);
  const fbg = path.join(SH, 'wordmark-bg.png'); await page.screenshot({ path: fbg, clip: bx }); await span.evaluate((s) => s.style.removeProperty('color'));
  { const d = decode(fs.readFileSync(fbg)); let dark = null, light = null, dl = 9, ll = -1; for (let y = 0; y < d.h; y++) for (let x = 0; x < d.w; x++) { const p = d.px(x, y); const l = lum(p); if (l < dl) { dl = l; dark = p; } if (l > ll) { ll = l; light = p; } } const fw = decode(fs.readFileSync(path.join(SH, 'wordmark.png'))); let brightest = null, bl = -1; for (let y = 0; y < fw.h; y++) for (let x = 0; x < fw.w; x++) { const p = fw.px(x, y); const l = lum(p); if (l > bl) { bl = l; brightest = p; } } res.rows.MARK = { facts: mk, bg: { dark, light }, glyphBrightestPx: brightest, contrastVsDarkBg: +cr(rgb(mk.mark.color), dark).toFixed(2), contrastVsLightBg: +cr(rgb(mk.mark.color), light).toFixed(2), fillEqualsToken: mk.mark.fill === mk.fgToken && mk.mark.color === mk.fgToken }; }
  // wordmark click from /store -> /
  { const h = await hit(page.locator('header a[href="/"]')); await page.locator('header a[href="/"]').click(); await page.waitForURL((u) => new URL(u).pathname === '/', { timeout: 15000 }).catch(() => {}); res.rows.MARK.click = { hit: h.ok, url: new URL(page.url()).pathname }; await waitLoader(); }
  // NAV
  const nav = { desktopInv: null, mobileInv: null, clicks: [] };
  await go('/');
  nav.desktopInv = await navInv(0); nav.mobileInvCollapsed = await navInv(1);
  if (desktop) {
    nav.signInVisible = await page.getByRole('button', { name: 'Sign In' }).first().isVisible();
    for (const [t, href] of EXP) {
      await go('/'); await closePopup();
      const loc = page.locator('header nav').first().getByRole('link', { name: t, exact: true });
      const h = await hit(loc); await loc.click(); await page.waitForURL((u) => new URL(u).pathname === href, { timeout: 20000 }).catch(() => {}); await L.sleep(1500);
      const c = { t, href, hit: h.ok, url: new URL(page.url()).pathname };
      if (href === '/store') { c.activeInv = (await navInv(0)).map((a) => ({ t: a.t, scale100: a.cls.split(/\s+/).includes('after:scale-x-100'), fg: a.cls.split(/\s+/).includes('text-foreground') })); await page.screenshot({ path: path.join(SH, 'store-active.png'), clip: { x: 0, y: 0, width: VPS[W].width, height: 84 } }); }
      if (href === '/studio-lab') { await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 60000 }).catch(() => {}); c.lab = await page.evaluate(() => ({ workspace: !!document.querySelector('[data-testid=arrangement-grid-control]'), demo: document.body.innerText.includes('Demo collection — no sign-in required'), authUser: localStorage.getItem('auth_user'), header: !!document.querySelector('header nav') })); c.cookies = (await ctx.cookies()).length; }
      nav.clicks.push(c);
    }
  } else {
    await closePopup();
    const tog = page.getByRole('button', { name: 'Toggle menu' });
    const wrap = () => page.evaluate(() => { const n = document.querySelectorAll('header nav')[1]; const w = n.parentElement.parentElement; return { cls: w.className.includes('max-h-0 opacity-0') ? 'collapsed' : w.className.includes('max-h-[80vh] opacity-100') ? 'open' : w.className, h: w.getBoundingClientRect().height }; });
    nav.toggleHit = (await hit(tog)).ok; await tog.click(); await L.sleep(600); nav.afterOpen = await wrap(); nav.mobileInv = await navInv(1);
    nav.signInInMenu = await page.locator('header nav').nth(1).getByRole('button', { name: 'Sign In' }).isVisible().catch(() => false);
    await page.screenshot({ path: path.join(SH, 'mobile-menu-open.png') });
    const st = page.locator('header nav').nth(1).getByRole('link', { name: 'Studio', exact: true }); const h = await hit(st); await st.click(); await page.waitForURL((u) => new URL(u).pathname === '/studio-lab', { timeout: 20000 }).catch(() => {});
    await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 60000 }).catch(() => {});
    nav.studioClick = { hit: h.ok, url: new URL(page.url()).pathname, lab: await page.evaluate(() => ({ workspace: !!document.querySelector('[data-testid=arrangement-grid-control]'), demo: document.body.innerText.includes('Demo collection — no sign-in required'), authUser: localStorage.getItem('auth_user'), headerPresent: !!document.querySelector('header nav'), menuWrapState: (() => { const n = document.querySelectorAll('header nav')[1]; if (!n) return 'header not rendered'; return n.parentElement.parentElement.className.includes('max-h-0') ? 'collapsed' : 'open'; })() })), cookies: (await ctx.cookies()).length };
    // store-internal link: Collections from /, menu must collapse
    await go('/'); await closePopup(); await tog.click(); await L.sleep(600); const o2 = await wrap();
    const co = page.locator('header nav').nth(1).getByRole('link', { name: 'Collections', exact: true }); const h2 = await hit(co); await co.click(); await page.waitForURL((u) => new URL(u).pathname === '/store', { timeout: 20000 }).catch(() => {}); await L.sleep(800);
    nav.collectionsClick = { openBefore: o2, hit: h2.ok, url: new URL(page.url()).pathname, after: await wrap(), mobActive: (await navInv(1)).map((a) => ({ t: a.t, active: a.cls.includes('text-brand bg-elevated') })) };
    // the other two mobile links
    for (const [t, href] of [['Free Samples', '/free-downloads'], ['About', '/about']]) { await go('/'); await closePopup(); await tog.click(); await L.sleep(600); const l = page.locator('header nav').nth(1).getByRole('link', { name: t, exact: true }); const hh = await hit(l); await l.click(); await page.waitForURL((u) => new URL(u).pathname === href, { timeout: 20000 }).catch(() => {}); await L.sleep(800); nav.clicks.push({ t, href, hit: hh.ok, url: new URL(page.url()).pathname, after: await wrap() }); }
  }
  res.rows.NAV = nav;
  // FOOT: footer text + footer links (click) + direct URL
  const foot = { texts: {}, clicks: [] };
  for (const u of ['/', '/store']) { await go(u); await closePopup(); foot.texts[u] = await page.evaluate(() => { const f = document.querySelector('footer'); return f ? (f.innerText.match(/©[^\n]*/) || [null])[0] : 'NO FOOTER ELEMENT'; }); }
  for (const [t, href] of [['Gift Cards', '/gift-cards'], ['Hire Us', '/hire-us']]) {
    await go('/'); await page.locator('footer').scrollIntoViewIfNeeded(); await L.sleep(500); await closePopup(); const l = page.locator('footer').getByRole('link', { name: t, exact: true }); const cnt = await l.count(); const h = await hit(l.first()); const p0 = await popupUp();
    const [resp] = await Promise.all([page.waitForNavigation({ timeout: 20000 }).catch(() => null), l.first().click()]); await L.sleep(1000);
    foot.clicks.push({ t, href, count: cnt, attr: await page.evaluate(() => location.pathname), hit: h.ok, popupBefore: p0, status: resp ? resp.status() : null, url: new URL(page.url()).pathname, h1: await page.evaluate(() => { const h = document.querySelector('h1'); return h ? { t: h.textContent.trim(), vis: h.getBoundingClientRect().height > 0 } : null; }) });
  }
  await go('/'); await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await L.sleep(800); await closePopup();
  const fb = await page.locator('footer').boundingBox().catch(() => null); if (fb) await page.screenshot({ path: path.join(SH, 'footer.png'), fullPage: true, clip: { x: 0, y: (await page.evaluate(() => scrollY)) + fb.y, width: fb.width, height: fb.height } });
  res.rows.FOOT = foot;
  // KEEP: header Free Samples in both lists (above) + LeadMagnet popup appears after scroll on /
  const keep = {};
  await go('/'); await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * 0.5)); const t0 = Date.now(); let up = false; while (Date.now() - t0 < 15000) { if (await popupUp()) { up = true; break; } await page.mouse.wheel(0, 50); await L.sleep(250); }
  keep.popup = { appeared: up, ms: Date.now() - t0, text: up ? (await page.evaluate(() => document.querySelector('div.fixed.inset-0.z-\\[9999\\]').innerText.replace(/\s+/g, ' ').slice(0, 200))) : null };
  if (up) { await page.screenshot({ path: path.join(SH, 'popup.png') }); keep.popup.closed = await closePopup(); keep.popup.goneAfterClose = !(await popupUp()); }
  keep.home = await page.evaluate(() => { const t = document.body.innerText; return { browseGiftCards: /Browse Gift Cards/i.test(t), limited: (t.match(/Limited/g) || []).length, happy: /2,500\+\s*Happy Customers/i.test(t), netflix: /Netflix Original Score/i.test(t), freeSamplesHeader: [...document.querySelectorAll('header nav')].map((n) => [...n.querySelectorAll('a')].some((a) => a.textContent.trim() === 'Free Samples')) }; });
  res.rows.KEEP = keep;
  res.anon = { authUser: await page.evaluate(() => localStorage.getItem('auth_user')), cookies: (await ctx.cookies()).length };
  await b.close();
  res.ev = ev;
  res.summary = { pageerror: ev.pageerror, hydration: ev.console.filter((c) => /hydrat|did not match|server rendered|Text content does not match/i.test(c.text)), errors: ev.console.filter((c) => c.type === 'error').map((c) => c.page + ': ' + c.text.slice(0, 160)), foreignNonFont: ev.foreign.filter((f) => !f.font), foreignHosts: [...new Set(ev.foreign.map((f) => new URL(f.u).host))], auth: ev.auth };
  L.save(path.join(ROOT, 'out'), `main-${W}.json`, res);
  console.log(JSON.stringify({ ssr: Object.fromEntries(Object.entries(res.ssr).map(([k, v]) => [k, [v.status, v.h1.length, v.headerHeadings, v.czabaMusic, v.studioLabA, v.copyright]])), hyd: Object.fromEntries(Object.entries(res.hyd).map(([k, v]) => [k, [v.status, v.loader, v.total, v.outsideLoader, v.czabaMusicDom, v.copyright, v.header.headerH, v.header.nextTop, v.header.headings, v.header.textGlow, v.header.banned, v.header.bannedHref]])), rows: res.rows, anon: res.anon, summary: res.summary }, null, 1));
})();
