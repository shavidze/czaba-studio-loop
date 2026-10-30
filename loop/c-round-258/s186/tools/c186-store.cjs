// C round 186 — INACTIVE/META/PX-NET/OFFERS-VIS/STORE-AFTER/PREVIEW/REG-HYD. node c186-store.cjs <1440|1280|375> <attempt>
const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path'); const { decode } = require('./png.cjs');
const VPS = { 1440: { width: 1440, height: 900 }, 1280: { width: 1280, height: 720 }, 375: { width: 375, height: 812 } };
const W = process.argv[2], ATT = process.argv[3] || '1'; const ROOT = path.join(__dirname, '..');
const SH = path.join(ROOT, 'shots', 'store-after'); fs.mkdirSync(SH, { recursive: true });
const ALLOWED = new Set(['127.0.0.1:5173', 'localhost:5173', '127.0.0.1:5199', 'localhost:5199', '[::1]:5199']);
const FONT_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);
const FIX = {
  'middle-east': { title: 'Middle East', d: 'Mock fixture track for local store verification.', img: '/images/packs/1.png', cat: 'Music' },
  'harbour-lights': { title: 'Harbour Lights', d: 'Mock fixture track with a slow piano theme.', img: '/images/packs/2.png', cat: 'Music' },
  'door-slams': { title: 'Door Slams', d: 'Mock fixture sound effects with wooden and metal doors.', img: '/images/packs/6.jpg', cat: 'Sound Effects' },
};
const KEYS = ['title', 'name=description', 'property=og:title', 'property=og:description', 'property=og:type', 'property=og:image', 'name=twitter:card', 'name=twitter:title', 'name=twitter:description', 'name=twitter:image', 'property=product:brand', 'property=product:category'];
const expMeta = (h) => { const f = FIX[h]; const t = `${f.title} | CZABA`; return { title: t, 'name=description': f.d, 'property=og:title': t, 'property=og:description': f.d, 'property=og:type': 'product', 'property=og:image': f.img, 'name=twitter:card': 'summary_large_image', 'name=twitter:title': t, 'name=twitter:description': f.d, 'name=twitter:image': f.img, 'property=product:brand': 'CZABA', 'property=product:category': f.cat }; };
const parseSsrMeta = (html) => { const head = html.split('</head>')[0]; const out = {}; const t = head.match(/<title>([^<]*)<\/title>/); if (t) out.title = t[1]; for (const m of head.matchAll(/<meta\s+([^>]*?)\/?>/g)) { const a = Object.fromEntries([...m[1].matchAll(/([\w:-]+)="([^"]*)"/g)].map((x) => [x[1], x[2].replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"')])); const k = a.name ? `name=${a.name}` : a.property ? `property=${a.property}` : null; if (k && 'content' in a) out[k] = a.content; } return out; };
const domMeta = () => { const out = { title: document.title }; for (const m of document.head.querySelectorAll('meta')) { const k = m.getAttribute('name') ? `name=${m.getAttribute('name')}` : m.getAttribute('property') ? `property=${m.getAttribute('property')}` : null; if (k) out[k] = m.getAttribute('content'); } return out; };
const init = () => { window.__media = []; const P = HTMLMediaElement.prototype; const op = P.play; P.play = function () { if (!window.__media.includes(this)) window.__media.push(this); return op.apply(this, arguments); };
  window.__perf = { lcp: 0, cls: 0, lcpEl: null }; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__perf.lcp = e.startTime; window.__perf.lcpEl = e.element ? e.element.tagName + ' ' + (e.element.currentSrc || e.element.textContent || '').slice(0, 60) : null; } }).observe({ type: 'largest-contentful-paint', buffered: true }); new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); } catch (e) {} };
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text', '--autoplay-policy=no-user-gesture-required'] });
  const res = { W, ATT, utc: new Date().toISOString(), pages: {}, perf: [] };
  const ctx = await b.newContext({ viewport: VPS[W], deviceScaleFactor: 2 }); await ctx.addInitScript(init);
  const page = await ctx.newPage(); let cur = 'warm';
  const ev = { console: [], pageerror: [], hosts: {}, foreign: [], auth: [], gift: [] };
  page.on('console', (m) => ev.console.push({ page: cur, type: m.type(), text: m.text().slice(0, 400) }));
  page.on('pageerror', (e) => ev.pageerror.push({ page: cur, text: String(e).slice(0, 300) }));
  page.on('request', (q) => { const u = q.url(); if (/^(data|blob):/.test(u)) return; let h; try { h = new URL(u).host; } catch { h = u; } ev.hosts[h] = (ev.hosts[h] || 0) + 1; if (!ALLOWED.has(h)) ev.foreign.push({ page: cur, u: u.slice(0, 200), font: FONT_HOSTS.has(h) }); if (q.headers().authorization) ev.auth.push(u); });
  page.on('response', (r) => { if (/gift-card\.png/.test(r.url())) ev.gift.push({ page: cur, s: r.status(), ct: r.headers()['content-type'], len: r.headers()['content-length'] }); });
  const scrollAll = async () => { await page.evaluate(async () => { const s = (ms) => new Promise((r) => setTimeout(r, ms)); const H = () => document.documentElement.scrollHeight; for (let y = 0; y < H(); y += Math.floor(innerHeight / 2)) { scrollTo(0, y); await s(250); } scrollTo(0, H()); await s(800); }); await page.waitForFunction(() => [...document.images].every((i) => i.complete && (i.naturalWidth > 0 || !i.currentSrc)), null, { timeout: 30000 }).catch(() => {}); };
  const imgState = () => page.evaluate(() => [...document.images].filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => ({ src: (i.currentSrc || i.src).slice(0, 120), complete: i.complete, nw: i.naturalWidth })));
  const go = async (name, url) => { cur = name; const resp = await page.goto(L.BASE + url, { waitUntil: 'load', timeout: 90000 }); return { status: resp.status(), html: await resp.text() }; };
  // Same order and method as round 185 (warm /, then pages), then a scrolled shot.
  await go('warm', '/'); await L.sleep(3000);
  const visit = async (name, url, extra) => {
    const r = { url }; const g = await go(name, url); r.status = g.status; r.ssrMeta = parseSsrMeta(g.html);
    r.ssrBuy = /TOTAL PRICE|Add to Cart|Buy Now/i.test(g.html.replace(/<script[\s\S]*?<\/script>/g, ''));
    await L.sleep(4000);
    r.h1 = await page.evaluate(() => [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()).slice(0, 3));
    r.domMeta = await page.evaluate(domMeta);
    const f1 = path.join(SH, `${W}-${name}.png`); await page.screenshot({ path: f1, fullPage: true }); r.shot185method = path.relative(ROOT, f1);
    if (extra) Object.assign(r, await extra());
    await scrollAll(); r.unloadedImgs = await imgState(); await page.evaluate(() => scrollTo(0, 0)); await L.sleep(600);
    const f2 = path.join(SH, `${W}-${name}-scrolled.png`); await page.screenshot({ path: f2, fullPage: true }); r.shotScrolled = path.relative(ROOT, f2);
    r.cookies = (await ctx.cookies()).length; r.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    res.pages[name] = r; return r;
  };
  const home = await visit('home', '/', async () => ({ heroBox: await page.evaluate(() => { const s = document.querySelector('main section, section'); const r = s.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; }) }));
  // Special Offers section: boxes, img state, contrast, section shot
  cur = 'home-offers';
  const so = await page.evaluate(async () => {
    const img = [...document.images].find((i) => i.alt === 'Gift Card'); const card = img.closest('.group'); card.scrollIntoView({ block: 'center' });
    await new Promise((r) => setTimeout(r, 1500));
    const sec = card.closest('section');
    const q = (sel, root = card) => [...root.querySelectorAll(sel)];
    const box = (el) => { const r = el.getBoundingClientRect(); return { x: +(r.x).toFixed(2), y: +(r.y + scrollY).toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
    const h3 = q('h3')[0], p = q('p')[0], link = q('a')[0], pill = q('span').find((s) => s.textContent === 'Gift Cards').parentElement;
    const second = [...sec.querySelectorAll('.group')][1];
    return { img: { currentSrc: img.currentSrc, complete: img.complete, nw: img.naturalWidth, nh: img.naturalHeight, loading: img.loading, decoding: img.decoding, alt: img.alt }, texts: { h3: h3.textContent.trim(), p: p.textContent.replace(/\s+/g, ' ').trim(), pill: pill.textContent.trim(), link: link.textContent.trim(), href: link.getAttribute('href'), second: second.innerText.replace(/\s+/g, ' ').trim() },
      boxes: { section: box(sec), card: box(card), h3: box(h3), p: box(p), pill: box(pill), link: box(link), second: box(second) }, colors: { h3: getComputedStyle(h3).color, p: getComputedStyle(p).color } };
  });
  await page.waitForFunction(() => { const i = [...document.images].find((x) => x.alt === 'Gift Card'); return i.complete && i.naturalWidth > 0; }, null, { timeout: 20000 }).catch(() => {});
  so.imgAfterWait = await page.evaluate(() => { const i = [...document.images].find((x) => x.alt === 'Gift Card'); return { currentSrc: i.currentSrc, complete: i.complete, nw: i.naturalWidth }; });
  // layout invariance: remove the image src and re-measure (the img is absolute inset-0)
  so.boxesNoImg = await page.evaluate(() => { const img = [...document.images].find((i) => i.alt === 'Gift Card'); const card = img.closest('.group'); const sec = card.closest('section'); const src = img.getAttribute('src'); img.removeAttribute('src'); const box = (el) => { const r = el.getBoundingClientRect(); return { x: +(r.x).toFixed(2), y: +(r.y + scrollY).toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; }; const out = { h3: box(card.querySelector('h3')), p: box(card.querySelector('p')), link: box(card.querySelector('a')), second: box([...sec.querySelectorAll('.group')][1]) }; img.setAttribute('src', src); return out; });
  await page.waitForFunction(() => { const i = [...document.images].find((x) => x.alt === 'Gift Card'); return i.complete && i.naturalWidth > 0; }, null, { timeout: 20000 }).catch(() => {});
  await page.mouse.move(1, 1); await L.sleep(800);
  const secBoxV = await page.evaluate(() => { const c = [...document.images].find((i) => i.alt === 'Gift Card').closest('section'); const r = c.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height }; });
  const fsec = path.join(SH, `${W}-offers.png`); await page.screenshot({ path: fsec, fullPage: true, clip: secBoxV }); so.shot = path.relative(ROOT, fsec);
  // contrast: hide the text, capture background behind h3 and p
  const bgAt = async (sel) => { const r = await page.evaluate((s) => { const card = [...document.images].find((i) => i.alt === 'Gift Card').closest('.group'); const el = card.querySelector(s); el.style.setProperty('color', 'transparent', 'important'); const b = el.getBoundingClientRect(); return { x: b.x, y: b.y + scrollY, width: b.width, height: b.height }; }, sel); await L.sleep(200); const f = path.join(SH, `${W}-bg-${sel}.png`); await page.screenshot({ path: f, fullPage: true, clip: r }); await page.evaluate((s) => { [...document.images].find((i) => i.alt === 'Gift Card').closest('.group').querySelector(s).style.removeProperty('color'); }, sel); const d = decode(fs.readFileSync(f)); let dark = null, light = null, dl = 9, ll = -1; for (let y = 0; y < d.h; y++) for (let x = 0; x < d.w; x++) { const px = d.px(x, y); const l = lum(px); if (l < dl) { dl = l; dark = px; } if (l > ll) { ll = l; light = px; } } return { dark, light }; };
  const rgb = (s) => s.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
  const bh = await bgAt('h3'), bp = await bgAt('p');
  so.contrast = { h3: { color: so.colors.h3, vsDark: +cr(rgb(so.colors.h3), bh.dark).toFixed(2), vsLight: +cr(rgb(so.colors.h3), bh.light).toFixed(2), bg: bh }, p: { color: so.colors.p, vsDark: +cr(rgb(so.colors.p), bp.dark).toFixed(2), vsLight: +cr(rgb(so.colors.p), bp.light).toFixed(2), bg: bp } };
  res.offers = so;
  await visit('store', '/store');
  const pv = async () => { if (W !== '1440') return {}; const btn = page.getByRole('button', { name: 'Play preview' }).first(); if (!(await btn.count())) return { preview: 'no button' }; await btn.click(); const t0 = Date.now(); const s = []; for (let i = 0; i < 6; i++) { await L.sleep(500); s.push(await page.evaluate(() => window.__media.map((a) => ({ ct: +a.currentTime.toFixed(3), paused: a.paused, src: (a.currentSrc || a.src).slice(-60) })))); } const r = { preview: { samples: s, ms: Date.now() - t0 } }; await page.getByRole('button', { name: /Pause preview|Play preview/ }).first().click().catch(() => {}); return r; };
  const variants = () => page.evaluate(() => [...document.querySelectorAll('button')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()).filter((t) => /^(PREMIUM)?\s*(Standard|Premium)/i.test(t)));
  for (const h of ['middle-east', 'door-slams', 'harbour-lights']) {
    const r = await visit(`product-${h}`, `/products/${h}`, async () => ({ variants: await variants(), price: (await page.evaluate(() => document.body.innerText.match(/TOTAL PRICE[^\n]*\n?[^\n]*/i)?.[0] || null)), ...(h === 'middle-east' ? await pv() : {}) }));
    const e = expMeta(h); r.metaCheck = { ssrKeys: Object.keys(r.ssrMeta).filter((k) => KEYS.includes(k)), ssrMismatch: KEYS.filter((k) => r.ssrMeta[k] !== e[k]).map((k) => [k, r.ssrMeta[k], e[k]]), domMismatch: KEYS.filter((k) => r.domMeta[k] !== e[k]).map((k) => [k, r.domMeta[k], e[k]]), banned: [...Object.values(r.ssrMeta), ...Object.values(r.domMeta)].filter((v) => /Professional|Studio-quality|creative freedom/i.test(v || '')) };
  }
  await visit('product-archived', '/products/archived-rain', async () => ({ text: (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 300), buyDom: await page.evaluate(() => /TOTAL PRICE|Add to Cart|Buy Now/i.test(document.body.innerText)), buttons: await page.evaluate(() => [...document.querySelectorAll('button,a')].map((b) => b.textContent.trim()).filter((t) => /cart|buy/i.test(t))) }));
  await page.close();
  for (let i = 0; i < 3; i++) { const pg = await ctx.newPage(); cur = 'perf' + i; pg.on('request', (q) => { let h; try { h = new URL(q.url()).host; } catch { return; } if (!ALLOWED.has(h) && !/^(data|blob):/.test(q.url())) ev.foreign.push({ page: cur, u: q.url().slice(0, 200), font: FONT_HOSTS.has(h) }); }); await pg.goto(L.BASE + '/', { waitUntil: 'load' }); await L.sleep(4000); await pg.mouse.move(1, 1); res.perf.push(await pg.evaluate(() => window.__perf)); await pg.close(); }
  const med = (a) => [...a].sort((x, y) => x - y)[1]; res.perfMedian = { lcp: med(res.perf.map((p) => p.lcp)), cls: med(res.perf.map((p) => p.cls)) };
  res.ev = ev; await b.close();
  fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true }); fs.writeFileSync(path.join(ROOT, 'out', `store-${W}-${ATT}.json`), JSON.stringify(res, null, 1));
  const sum = { W, pages: Object.fromEntries(Object.entries(res.pages).map(([k, v]) => [k, { s: v.status, h1: v.h1, ssrBuy: v.ssrBuy, buyDom: v.buyDom, variants: v.variants, price: v.price, metaCheck: v.metaCheck, unloaded: v.unloadedImgs, cookies: v.cookies, auth: v.authUser, preview: v.preview, text: v.text }])), offers: { img: so.img, imgAfterWait: so.imgAfterWait, texts: so.texts, boxes: so.boxes, boxesNoImg: so.boxesNoImg, contrast: { h3: [so.contrast.h3.vsDark, so.contrast.h3.vsLight], p: [so.contrast.p.vsDark, so.contrast.p.vsLight], colors: so.colors } }, perf: res.perf, perfMedian: res.perfMedian, hosts: ev.hosts, foreignNonFont: ev.foreign.filter((f) => !f.font), gift: ev.gift, auth: ev.auth.length, pageerror: ev.pageerror, errs: ev.console.filter((c) => c.type === 'error' || c.type === 'warning' || /hydrat/i.test(c.text)).map((c) => c.page + ': ' + c.type + ' ' + c.text.slice(0, 200)) };
  console.log(JSON.stringify(sum, null, 1));
})();
