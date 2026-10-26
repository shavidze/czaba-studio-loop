// C round 193 — TOKENS / CONTRAST / BRASS-TEXT(S5,S3) / KEEP / LAYOUT / SHOTS / PX-NET on one server. node store193.cjs <tag:tree|head> <W>
// tree = :5173 (A's work), head = :5174 (git archive caa09af). Fresh anonymous context per page, DPR 2, --disable-lcd-text.
const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path');
const TAG = process.argv[2]; const W = +process.argv[3];
const BASE = TAG === 'head' ? 'http://127.0.0.1:5174' : 'http://127.0.0.1:5173';
const VPS = { 1440: [1440, 900], 1280: [1280, 720], 375: [375, 812] };
const SH = path.join(L.ROOT, 'shots', TAG === 'head' ? 'store-before' : 'store-after'); fs.mkdirSync(SH, { recursive: true });
const KEYS = { background:'#0e0d0c', surface:'#161412', elevated:'#1d1a17', 'muted-bg':'#24201c', 'surface-glass':'#1a1714', 'surface-glass-strong':'#161412', outline:'#24211e', 'outline-hover':'#2e2a26', 'outline-strong':'#736b60', 'outline-light':'rgba(36,33,30,0.5)', brand:'#c9a46a', 'brand-hover':'#d9b87f', 'brand-foreground':'#0e0d0c', accent:'#c9a46a', foreground:'#ece6da', muted:'#a39b8e', dim:'#928a7d', positive:'#8fa382', destructive:'#d2776a', warning:'#d9a35b', secondary:'#cfc7ba', 'bg-alt':'#12100f', 'brand-rgb':'201, 164, 106', 'accent-rgb':'201, 164, 106', buy:'#c9a46a', 'buy-hover':'#d9b87f' };
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|localhost:5199|Download the React DevTools/i;
const PAGES = [['home', '/'], ['store', '/store'], ['product', '/products/middle-east'], ['hireus', '/hire-us']];

// In-page helpers (stringified into evaluate)
const HELPERS = `
window.__c = {};
const __cv = document.createElement('canvas'); __cv.width = __cv.height = 1; const __cx = __cv.getContext('2d', { willReadFrequently: true }); const P = (s) => { if (!s || s === 'transparent') return [0,0,0,0]; const m = String(s).match(/^rgba?\\(([^)]+)\\)$/); if (m) { const a = m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return [a[0], a[1], a[2], a.length > 3 ? a[3] : 1]; } __cx.clearRect(0,0,1,1); __cx.fillStyle = '#000'; __cx.fillStyle = s; __cx.fillRect(0,0,1,1); const d = __cx.getImageData(0,0,1,1).data; if (d[3] === 0) return [0,0,0,0]; return [d[0], d[1], d[2], d[3]/255]; };
const over = (fg, bg) => [0,1,2].map(i => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat(1);
const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const effBg = (el) => { const layers = []; let grad = null, img = null; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const s = getComputedStyle(e); const bi = s.backgroundImage; if (bi && bi !== 'none') { if (/gradient/.test(bi)) grad = grad || (e.tagName + '.' + String(e.className).slice(0, 60)); else img = img || e.tagName; } const c = P(s.backgroundColor); if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break; } } let bg = [255,255,255,1]; if (!layers.length || layers[layers.length-1][3] < 1) bg = P(getComputedStyle(document.documentElement).backgroundColor) || [0,0,0,1]; for (let i = layers.length - 1; i >= 0; i--) bg = over(layers[i], bg); return { bg, grad, img }; };
const vis = (el) => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return false; const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none') return false; let op = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) op *= +getComputedStyle(e).opacity; return op > 0.05; };
const keyOf = (el) => { const parts = []; for (let e = el; e && e !== document.body && parts.length < 7; e = e.parentElement) { let i = 1, s = e; while ((s = s.previousElementSibling)) if (s.tagName === e.tagName) i++; parts.unshift(e.tagName.toLowerCase() + ':' + i); } return parts.join('>'); };
window.__c.sample = (el, label) => { const s = getComputedStyle(el); const fgc = P(s.color); const eb = effBg(el); const fg = over(fgc, eb.bg); let op = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) op *= +getComputedStyle(e).opacity; const fs = parseFloat(s.fontSize), fw = +s.fontWeight; const large = fs >= 24 || (fs >= 18.66 && fw >= 700); const r = el.getBoundingClientRect(); let clipText = null; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const q = getComputedStyle(e); if (q.webkitBackgroundClip === 'text' || q.backgroundClip === 'text') { clipText = e.tagName + '.' + String(e.className).slice(0, 50); break; } } return { clipText, label, key: keyOf(el), tag: el.tagName, text: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 50), color: s.color, bgEff: 'rgb(' + eb.bg.slice(0,3).map(Math.round).join(',') + ')', ratio: +ratio(fg, eb.bg).toFixed(2), large, fs, fw, grad: eb.grad, img: eb.img, opacity: +op.toFixed(2), cls: String(el.className).slice(0, 140), rect: [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)], method: 'computed+ancestor-composite' }; };
window.__c.allText = () => { const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const seen = new Set(); let n; while ((n = w.nextNode())) { if (!n.textContent.trim()) continue; const el = n.parentElement; if (!el || seen.has(el) || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName)) continue; seen.add(el); if (!vis(el)) continue; if (el.closest('[data-testid=entrance-loader]')) continue; out.push(window.__c.sample(el, 'text')); } return out; };
window.__c.ratio = ratio; window.__c.P = P; window.__c.effBg = effBg; window.__c.over = over;
`;

(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text'] });
  const res = { TAG, W, BASE, utc: new Date().toISOString(), pages: {} };
  for (const [name, url] of PAGES) {
    const ctx = await b.newContext({ viewport: { width: VPS[W][0], height: VPS[W][1] }, deviceScaleFactor: 2 });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
    await ctx.addInitScript(HELPERS);
    const page = await ctx.newPage(); const ev = { pageerror: [], hyd: [], auth: [], remote: [], cons: [] };
    page.on('pageerror', (e) => ev.pageerror.push(String(e).slice(0, 200)));
    page.on('console', (m) => { const t = m.text(); if (/hydrat|did not match|server rendered/i.test(t)) ev.hyd.push(t.slice(0, 200)); else if (m.type() === 'error' && !NOISE.test(t)) ev.cons.push(t.slice(0, 200)); });
    page.on('request', (q) => { const u = q.url(); if (q.headers().authorization) ev.auth.push(u); if (!/^https?:\/\/(127\.0\.0\.1|localhost)/.test(u) && !/^data:|^blob:/.test(u) && !/fonts\.(googleapis|gstatic)\.com/.test(u)) ev.remote.push(u); });
    const r = { url };
    const resp = await page.goto(BASE + url, { waitUntil: 'load', timeout: 90000 }); r.status = resp.status(); await page.waitForFunction(() => document.body && document.querySelector('header') && document.querySelector('footer'), null, { timeout: 60000 }).catch(() => {}); await L.sleep(4000); await page.mouse.move(1, 1); await L.sleep(300);
    r.fonts = await page.evaluate(() => ({ body: getComputedStyle(document.body).fontFamily, h1: document.querySelector('h1') && getComputedStyle(document.querySelector('h1')).fontFamily }));
    if (name !== 'hireus') {
      r.tokens = await page.evaluate((keys) => { const cs = getComputedStyle(document.documentElement); const norm = (v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }; const cmp = {}; for (const [k, exp] of Object.entries(keys)) { const got = cs.getPropertyValue('--color-' + k).trim(); if (k.endsWith('-rgb')) cmp[k] = { got, eq: got.replace(/\s/g, '') === exp.replace(/\s/g, '') }; else { const a = norm(got), bb = norm(exp); cmp[k] = { got, gotN: a, expN: bb, eq: a === bb }; } } return cmp; }, KEYS);
      r.tokenMismatch = Object.entries(r.tokens).filter(([, v]) => !v.eq).map(([k]) => k);
      r.bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      r.studioTheme = await page.evaluate(() => document.querySelectorAll('[data-studio-theme]').length);
      // Layout boxes at scroll 0
      r.boxes = await page.evaluate(() => { const o = {}; const add = (k, el) => { if (!el) return; const q = el.getBoundingClientRect(); o[k] = [q.x, q.y + scrollY, q.width, q.height].map((v) => +v.toFixed(1)); };
        add('header', document.querySelector('header')); [...document.querySelectorAll('header nav a, header a')].slice(0, 20).forEach((a, i) => add('hdrA' + i + ':' + a.innerText.trim().slice(0, 14), a));
        add('h1', document.querySelector('h1')); add('main', document.querySelector('main')); add('footer', document.querySelector('footer'));
        const secs = [...document.querySelectorAll('main section, main > div > section')]; secs.forEach((s, i) => add('section' + i, s));
        [...document.querySelectorAll('main a[href^="/products/"]')].slice(0, 16).forEach((a, i) => add('prodLink' + i, a));
        [...document.querySelectorAll('main button')].slice(0, 20).forEach((x, i) => add('mainBtn' + i + ':' + x.innerText.trim().slice(0, 12), x));
        o.__docH = document.documentElement.scrollHeight; return o; });
      // Keep-list: innerText of containers (whole body + specific)
      r.keep = await page.evaluate(() => { const t = document.body.innerText; const find = (re) => { const hits = []; for (const el of document.querySelectorAll('section, header, nav, div')) { if (re.test(el.innerText || '') && ![...el.children].some((c) => re.test(c.innerText || ''))) hits.push({ key: el.tagName + '.' + String(el.className).slice(0, 50), text: el.innerText.replace(/\s+/g, ' ').slice(0, 300) }); } return hits.slice(0, 4); };
        const sec = [...document.querySelectorAll('main section')].map((s) => s.innerText.replace(/\s+/g, ' ').slice(0, 400));
        return { freeSamplesLinks: [...document.querySelectorAll('a')].filter((a) => /Free Samples/i.test(a.innerText)).map((a) => ({ text: a.innerText.trim(), href: a.getAttribute('href'), inHeader: !!a.closest('header'), vis: a.getBoundingClientRect().width > 0 })), limited: (t.match(/\bLimited\b[^\n]{0,30}/g) || []), happy: /2,500\+/.test(t), happyCtx: find(/2,500\+/), netflix: /Netflix Original Score/.test(t), netflixCtx: find(/Netflix Original Score/), special: find(/Special Offer|SPECIAL OFFER/i), freeDl: /FREE DOWNLOAD/i.test(t), sections: sec }; });
      r.texts = await page.evaluate(() => window.__c.allText());
      // scroll through the page, union text samples (first seen per key); capture + close LeadMagnet popup if it opens
      r.popup = null; { const H = await page.evaluate(() => document.documentElement.scrollHeight); const seen = new Set(r.texts.map((t) => t.key + '|' + t.text)); for (let y = 0; y < H; y += Math.floor(VPS[W][1] / 2)) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await L.sleep(450); const more = await page.evaluate(() => window.__c.allText()); for (const t of more) { const k = t.key + '|' + t.text; if (!seen.has(k)) { seen.add(k); t.scrollY = y; r.texts.push(t); } }
        const pop = await page.evaluate(() => !!document.querySelector('div.fixed.inset-0.z-\\[9999\\]')); if (pop && !r.popup) { await L.sleep(800); r.popup = await page.evaluate(() => { const o = document.querySelector('div.fixed.inset-0.z-\\[9999\\]'); const btns = [...o.querySelectorAll('button')].map((x) => ({ text: x.innerText, aria: x.getAttribute('aria-label'), color: getComputedStyle(x).color, bg: getComputedStyle(x).backgroundColor, cls: String(x.className).slice(0, 160) })); return { innerText: o.innerText, btns }; }); await page.screenshot({ path: path.join(SH, `${W}-${name}-popup-at-scroll.png`) }); const c = page.locator('div.fixed.inset-0.z-\\[9999\\] button[aria-label=Close]'); if (await c.count()) { await c.click(); await L.sleep(600); } } } await page.evaluate(() => window.scrollTo(0, 0)); await L.sleep(500); }
      // Specific UI samples: inputs, placeholders, borders, cart badge
      r.ui = await page.evaluate(() => { const out = []; for (const i of document.querySelectorAll('input, textarea')) { if (i.getBoundingClientRect().width < 2) continue; const s = getComputedStyle(i); const ph = getComputedStyle(i, '::placeholder').color; const eb = window.__c.effBg(i); const pc = window.__c.P(ph); const bc = window.__c.P(s.borderTopColor); const par = window.__c.effBg(i.parentElement); out.push({ label: 'input', ph: i.placeholder, phColor: ph, phRatio: pc ? +window.__c.ratio(window.__c.over(pc, eb.bg), eb.bg).toFixed(2) : null, border: s.borderTopColor, bw: s.borderTopWidth, borderVsOuter: bc ? +window.__c.ratio(window.__c.over(bc, par.bg), par.bg).toFixed(2) : null, fieldBg: s.backgroundColor, outerBg: 'rgb(' + par.bg.slice(0,3).map(Math.round) + ')' }); }
        const cards = [...document.querySelectorAll('main [class*="border-outline"]')].slice(0, 6); for (const c of cards) { const s = getComputedStyle(c); const bc = window.__c.P(s.borderTopColor); const par = window.__c.effBg(c.parentElement); const own = window.__c.effBg(c); out.push({ label: 'border-outline', cls: String(c.className).slice(0, 90), border: s.borderTopColor, bw: s.borderTopWidth, vsOuter: bc ? +window.__c.ratio(window.__c.over(bc, par.bg), par.bg).toFixed(2) : null, fillVsOuter: +window.__c.ratio(own.bg, par.bg).toFixed(2) }); }
        return out; });
      await page.screenshot({ path: path.join(SH, `${W}-${name}.png`), fullPage: true });
    }
    // Buttons: Buy Now (S5) and hire-us submit (S3): rest, hover (computed + pixel), focus
    const btnSel = name === 'product' ? 'button:has-text("Buy Now")' : name === 'hireus' ? 'form button[type=submit]' : null;
    if (btnSel) {
      const bt = page.locator(btnSel).first();
      if (await bt.count()) {
        const closePop = async () => { const c = page.locator('div.fixed.inset-0.z-\\[9999\\] button[aria-label=Close]'); if (await c.count()) { await c.click(); await L.sleep(600); return true; } return false; };
        r.popupClosedBeforeBtn = await closePop();
        await bt.scrollIntoViewIfNeeded(); await page.mouse.move(1, 1); await L.sleep(400); r.popupClosedBeforeBtn2 = await closePop();
        const grab = async (st) => { const c = await bt.evaluate((e) => { const s = window.__c.sample(e, 'btn'); const icon = e.querySelector('svg'); return { ...s, bgOwn: getComputedStyle(e).backgroundColor, iconColor: icon && getComputedStyle(icon).color, text: e.innerText.trim() }; }); const f = path.join(SH, `${W}-${name}-btn-${st}.png`); await bt.screenshot({ path: f }); const { decode } = require('./png.cjs'); const im = decode(fs.readFileSync(f)); const hist = new Map(); for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) { const p = im.px(x, y).join(','); hist.set(p, (hist.get(p) || 0) + 1); } const top = [...hist.entries()].sort((a, b2) => b2[1] - a[1]); const bgPx = top[0][0].split(',').map(Number); let dark = null, dl = 9; const lumf = (c) => { const g = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * g(c[0]) + 0.7152 * g(c[1]) + 0.0722 * g(c[2]); }; for (const [k, n] of top.slice(0, 400)) { if (n < 4) continue; const c = k.split(',').map(Number); const l = lumf(c); if (l < dl) { dl = l; dark = c; } } const lb = lumf(bgPx); const pxRatio = +((Math.max(lb, dl) + 0.05) / (Math.min(lb, dl) + 0.05)).toFixed(2); return { ...c, pixel: { bgModal: bgPx, darkestFrequent: dark, ratio: pxRatio, method: 'pixel: modal colour vs darkest colour with >=4 px' } }; };
        r.btn = { rest: await grab('rest') };
        await closePop(); await bt.hover(); await L.sleep(500); r.btn.hover = await grab('hover');
        await page.mouse.move(1, 1); await L.sleep(300);
      } else r.btn = { missing: btnSel };
    }
    // Focus ring: Tab through first focusables, sample outline vs background
    r.focus = [];
    await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement && document.activeElement.blur && document.activeElement.blur(); });
    await page.mouse.click(1, VPS[W][1] - 2).catch(() => {});
    for (let i = 0; i < 6; i++) { await page.keyboard.press('Tab'); await L.sleep(150); const f = await page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const s = getComputedStyle(e); const oc = window.__c.P(s.outlineColor); const eb = window.__c.effBg(e.parentElement || e); return { tag: e.tagName, text: (e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 30), fv: e.matches(':focus-visible'), outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor, offset: s.outlineOffset, ringRatio: oc && s.outlineStyle !== 'none' ? +window.__c.ratio(window.__c.over(oc, eb.bg), eb.bg).toFixed(2) : null, bgAround: 'rgb(' + eb.bg.slice(0,3).map(Math.round) + ')', boxShadow: s.boxShadow.slice(0, 80) }; }); if (f) r.focus.push(f); }
    r.ev = ev; res.pages[name] = r; await ctx.close();
  }
  // Mobile menu Free Samples (375)
  if (W === 375) { const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 }); await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} }); const page = await ctx.newPage(); await page.goto(BASE + '/', { waitUntil: 'load' }); await L.sleep(3500);
    const tog = page.locator('header button[aria-label*="menu" i], header button[aria-expanded]').first(); res.mobileMenu = { toggle: await tog.count() };
    if (res.mobileMenu.toggle) { await tog.click(); await L.sleep(800); res.mobileMenu.links = await page.evaluate(() => [...document.querySelectorAll('a')].filter((a) => a.getBoundingClientRect().width > 0).map((a) => a.innerText.trim()).filter(Boolean)); res.mobileMenu.freeSamples = res.mobileMenu.links.filter((t) => /Free Samples/i.test(t)); await page.screenshot({ path: path.join(SH, `375-mobile-menu.png`) }); }
    await ctx.close(); }
  await b.close(); L.save(L.OUT, `store-${TAG}-${W}.json`, res);
  for (const [n, p] of Object.entries(res.pages)) console.log(TAG, W, n, p.status, 'mism', p.tokenMismatch && p.tokenMismatch.length, 'bodyBg', p.bodyBg, 'st', p.studioTheme, 'texts', p.texts && p.texts.length, 'btn', p.btn && p.btn.rest && `${p.btn.rest.color} on ${p.btn.rest.bgOwn} ${p.btn.rest.ratio} px ${p.btn.rest.pixel.ratio} | hover ${p.btn.hover.bgOwn} ${p.btn.hover.ratio} px ${p.btn.hover.pixel.ratio}`, 'focus', JSON.stringify(p.focus.slice(0, 2).map((f) => [f.text, f.fv, f.outline, f.ringRatio])), 'ev', p.ev.pageerror.length, p.ev.hyd.length, p.ev.auth.length, p.ev.remote.length, p.ev.cons.length);
  if (res.mobileMenu) console.log('mobileMenu', JSON.stringify(res.mobileMenu.freeSamples), res.mobileMenu.toggle);
})();
