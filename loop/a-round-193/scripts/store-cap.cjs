// A round 193: store token probe, layout boxes, keep-list text, brass-text sites. node store-cap.cjs <phase:before|after>
const L = require('./lib.cjs');
const path = require('path');
const fs = require('fs');
const PHASE = process.argv[2];
const ROOT = path.join(__dirname, '..');
const SH = path.join(ROOT, 'shots', `store-${PHASE}`);
fs.mkdirSync(SH, { recursive: true });
const KEYS = { background: '#0e0d0c', surface: '#161412', elevated: '#1d1a17', 'muted-bg': '#24201c', 'surface-glass': '#1a1714', 'surface-glass-strong': '#161412', outline: '#24211e', 'outline-hover': '#2e2a26', 'outline-strong': '#736b60', 'outline-light': 'rgba(36,33,30,0.5)', brand: '#c9a46a', 'brand-hover': '#d9b87f', 'brand-foreground': '#0e0d0c', accent: '#c9a46a', foreground: '#ece6da', muted: '#a39b8e', dim: '#928a7d', positive: '#8fa382', destructive: '#d2776a', warning: '#d9a35b', secondary: '#cfc7ba', 'bg-alt': '#12100f', 'brand-rgb': '201, 164, 106', 'accent-rgb': '201, 164, 106', buy: '#c9a46a', 'buy-hover': '#d9b87f' };
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|Download the React DevTools/i;
const KEEP = ['FREE DOWNLOAD', 'Free Samples', 'Free Downloads', 'Limited', '2,500+', 'Happy Customers', 'Netflix Original Score', 'Special'];
function probe({ keys, keep }) {
  const cs = getComputedStyle(document.documentElement);
  const tok = {};
  for (const k of Object.keys(keys)) tok[k] = cs.getPropertyValue(`--color-${k}`).trim();
  const norm = (v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
  const cmp = {};
  for (const [k, exp] of Object.entries(keys)) {
    if (k.endsWith('-rgb')) cmp[k] = { got: tok[k], eq: tok[k].replace(/\s/g, '') === exp.replace(/\s/g, '') };
    else { const a = norm(tok[k]); cmp[k] = { got: tok[k], gotN: a, eq: a === norm(exp) }; }
  }
  const box = (e) => { const r = e.getBoundingClientRect(); return [Math.round((r.x + scrollX) * 10) / 10, Math.round((r.y + scrollY) * 10) / 10, Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10]; };
  const boxes = {};
  const add = (name, els) => els.forEach((e, i) => { boxes[`${name}[${i}]`] = box(e); });
  add('header', [...document.querySelectorAll('header')]);
  add('nav-a', [...document.querySelectorAll('header nav a, header a')].slice(0, 20));
  add('h1', [...document.querySelectorAll('h1')]);
  add('section', [...document.querySelectorAll('main section, section')].slice(0, 30));
  add('card', [...document.querySelectorAll('a[href^="/products/"]')].slice(0, 12));
  add('main', [...document.querySelectorAll('main')]);
  add('button', [...document.querySelectorAll('main button')].slice(0, 20));
  add('footer', [...document.querySelectorAll('footer')]);
  const keepText = {};
  for (const needle of keep) {
    const hits = [...document.querySelectorAll('body *')].filter((e) => e.children.length === 0 && e.textContent.includes(needle));
    keepText[needle] = hits.map((e) => ({ tag: e.tagName, text: e.innerText, inHeader: !!e.closest('header'), section: (e.closest('section') || {}).id || null }));
  }
  const colorOf = (e) => { if (!e) return null; const s = getComputedStyle(e); return { color: s.color, bg: s.backgroundColor, cls: typeof e.className === 'string' ? e.className : '' }; };
  const buy = [...document.querySelectorAll('button')].find((b) => /buy now/i.test(b.innerText));
  return { bodyBg: getComputedStyle(document.body).backgroundColor, studioTheme: document.querySelectorAll('[data-studio-theme]').length, cmp, boxes, keepText, buy: colorOf(buy), docH: document.documentElement.scrollHeight };
}
(async () => {
  const browser = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text'] });
  const res = { PHASE, utc: new Date().toISOString(), runs: [], extra: {} };
  for (const [w, h] of [[1440, 900], [1280, 720], [375, 812]]) {
    for (const pg of ['/', '/store', '/products/middle-east']) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
      await ctx.addInitScript(() => localStorage.setItem('czaba_lead_magnet', JSON.stringify({ dismissed: true })));
      const page = await ctx.newPage();
      const errs = []; const hyd = []; const auth = []; const remote = []; const cons = [];
      page.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
      page.on('console', (m) => { const t = m.text(); if (/hydrat|did not match|server rendered/i.test(t)) hyd.push(t.slice(0, 200)); else if (m.type() === 'error' && !NOISE.test(t)) cons.push(t.slice(0, 200)); });
      page.on('request', (q) => { const u = q.url(); if (q.headers().authorization) auth.push(u); if (!/^https?:\/\/(127\.0\.0\.1|localhost)/.test(u) && !/^data:|^blob:/.test(u) && !/fonts\.(googleapis|gstatic)\.com/.test(u)) remote.push(u); });
      await page.goto(L.BASE + pg, { waitUntil: 'load' });
      await L.sleep(4500);
      await page.mouse.move(1, 1);
      const r = await page.evaluate(probe, { keys: KEYS, keep: KEEP });
      const slug = pg === '/' ? 'home' : pg.replace(/\//g, '-').slice(1);
      await page.screenshot({ path: path.join(SH, `${w}-${slug}.png`), fullPage: true });
      if (pg.startsWith('/products')) {
        const b = page.locator('button', { hasText: /Buy Now/i }).first();
        if (await b.count()) {
          await b.scrollIntoViewIfNeeded(); await L.sleep(300);
          await b.screenshot({ path: path.join(SH, `${w}-buynow-rest.png`) });
          await b.hover(); await L.sleep(500);
          r.buyHover = await b.evaluate((e) => { const s = getComputedStyle(e); return { color: s.color, bg: s.backgroundColor }; });
          await b.screenshot({ path: path.join(SH, `${w}-buynow-hover.png`) });
        }
      }
      const mism = Object.entries(r.cmp).filter(([, v]) => !v.eq).map(([k]) => k);
      res.runs.push({ w, h, pg, ...r, mismatchCount: mism.length, mismatches: mism, errs, hyd, auth, remote, cons });
      await ctx.close();
    }
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await ctx.addInitScript(() => localStorage.setItem('czaba_lead_magnet', JSON.stringify({ dismissed: true })));
    const page = await ctx.newPage();
    await page.goto(`${L.BASE}/hire-us`, { waitUntil: 'load' }); await L.sleep(3000);
    const sub = page.locator('form button[type=submit]').first();
    if (await sub.count()) {
      await sub.scrollIntoViewIfNeeded(); await L.sleep(300);
      const rest = await sub.evaluate((e) => { const s = getComputedStyle(e); return { text: e.innerText, color: s.color, bg: s.backgroundColor }; });
      await sub.screenshot({ path: path.join(SH, `${w}-hireus-submit-rest.png`) });
      await sub.hover(); await L.sleep(400);
      const hover = await sub.evaluate((e) => { const s = getComputedStyle(e); return { color: s.color, bg: s.backgroundColor }; });
      await sub.screenshot({ path: path.join(SH, `${w}-hireus-submit-hover.png`) });
      res.extra[`hireus-${w}`] = { rest, hover };
    }
    await ctx.close();
  }
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(`${L.BASE}/`, { waitUntil: 'load' }); await L.sleep(1500);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55));
  await L.sleep(200);
  await page.evaluate(() => window.dispatchEvent(new Event('scroll')));
  await L.sleep(9000);
  const dl = page.locator('button', { hasText: 'FREE DOWNLOAD' }).first();
  res.extra.leadMagnet = { offerVisible: (await dl.count()) > 0 };
  if (res.extra.leadMagnet.offerVisible) {
    res.extra.leadMagnet.offerText = await dl.evaluate((e) => e.closest('[class*="fixed"]') ? e.closest('[class*="fixed"]').innerText : e.innerText);
    await page.screenshot({ path: path.join(SH, '1440-leadmagnet-offer.png') });
    await dl.click(); await L.sleep(600);
    const cont = page.locator('button[type=submit]', { hasText: 'CONTINUE' }).first();
    if (await cont.count()) {
      res.extra.leadMagnet.continue = await cont.evaluate((e) => { const s = getComputedStyle(e); return { text: e.innerText, color: s.color, bg: s.backgroundColor }; });
      await cont.screenshot({ path: path.join(SH, '1440-leadmagnet-continue.png') });
      await cont.hover(); await L.sleep(400);
      res.extra.leadMagnet.continueHover = await cont.evaluate((e) => { const s = getComputedStyle(e); return { color: s.color, bg: s.backgroundColor, filter: s.filter }; });
      await cont.screenshot({ path: path.join(SH, '1440-leadmagnet-continue-hover.png') });
    }
  }
  await ctx.close();
  await browser.close();
  L.save(path.join(ROOT, 'out'), `store-${PHASE}.json`, res);
  for (const x of res.runs) console.log(x.w, x.pg, 'bodyBg', x.bodyBg, 'mism', `${x.mismatchCount}/26`, 'theme', x.studioTheme, 'buy', x.buy && `${x.buy.bg}/${x.buy.color}`, x.buyHover ? `hover ${x.buyHover.bg}/${x.buyHover.color}` : '', 'errs', x.errs.length, 'hyd', x.hyd.length, 'auth', x.auth.length, 'remote', x.remote.length, 'cons', x.cons.length);
  console.log(JSON.stringify(res.extra));
})();
