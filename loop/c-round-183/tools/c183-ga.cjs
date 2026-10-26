// C round 183 — GA-env rows: BANNER-STUDIO-M4, BANNER-STORE-M4, NAV-M4, PX-NET/REG-HYD on CUR :5174 and HEAD :5175.
// node c183-ga.cjs <tag>   Fresh anonymous context per session, DPR 2, --disable-lcd-text.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const path = require('path');
const TAG = process.argv[2] || 'run1';
const ROOT = path.join(__dirname, '..');
const SHD = path.join(ROOT, 'shots', TAG);
fs.mkdirSync(SHD, { recursive: true });
fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true });
const BASES = { CUR: 'http://127.0.0.1:5174', HEAD: 'http://127.0.0.1:5175' };
const VPS = { 1440: { width: 1440, height: 900 }, 1280: { width: 1280, height: 720 } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FORBID = /studio-token|\/api\/recording-|\/api\/download|r2\.dev|r2\.cloudflarestorage|r2-proxy|workers\.dev|shopify|identitytoolkit|securetoken|brevo|sendinblue|facebook|fbcdn|doubleclick/i;
const GA = /googletagmanager\.com|google-analytics\.com/;
const res = { tag: TAG, utc: new Date().toISOString(), sessions: [] };
const save = () => fs.writeFileSync(path.join(ROOT, 'out', `c183-ga-${TAG}.json`), JSON.stringify(res, null, 1));

async function open(browser, vp, label) {
  const ctx = await browser.newContext({ viewport: VPS[vp], deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const s = { label, vp, gaAborted: 0, forbidden: [], auth: [], pageerror: [], hydration: [], consoleErrors: [], navs: 0, hosts: {} };
  await page.route(GA, (r) => { s.gaAborted++; r.abort(); });
  page.on('request', (q) => {
    const u = q.url();
    try { const h = new URL(u).host; s.hosts[h] = (s.hosts[h] || 0) + 1; } catch { /* data: */ }
    if (FORBID.test(u)) s.forbidden.push(u);
    if (q.headers().authorization) s.auth.push(u);
  });
  page.on('pageerror', (e) => s.pageerror.push(String(e).slice(0, 200)));
  page.on('console', (m) => {
    const t = m.text();
    if (/hydrat|did not match|server rendered/i.test(t)) s.hydration.push(t.slice(0, 200));
    if (m.type() === 'error') s.consoleErrors.push(t.slice(0, 160));
  });
  page.on('framenavigated', (f) => { if (f === page.mainFrame()) s.navs++; });
  return { ctx, page, s };
}

const PROBE = () => {
  const r2 = (n) => Math.round(n * 100) / 100;
  const bx = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [r2(r.x), r2(r.y), r2(r.width), r2(r.height)]; };
  const btn = (t) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === t);
  const acc = btn('Accept');
  let banner = acc;
  while (banner && getComputedStyle(banner).position !== 'fixed') banner = banner.parentElement;
  const fixedBottom = [...document.querySelectorAll('body *')].filter((e) => {
    const cs = getComputedStyle(e); if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom >= innerHeight - 2 && r.top > innerHeight / 2;
  }).map((e) => ({ tag: e.tagName, cls: String(e.className).slice(0, 80), box: bx(e), text: e.textContent.trim().slice(0, 60) }));
  const hit = (sel) => {
    const el = document.querySelector(sel); if (!el) return { present: false };
    const r = el.getBoundingClientRect(); const x = r.x + r.width / 2; const y = r.y + r.height / 2;
    const h = document.elementFromPoint(x, y);
    return { present: true, box: bx(el), point: [r2(x), r2(y)], hitsSelf: !!(h && (h === el || el.contains(h))), hitTag: h && h.tagName, hitText: h && h.textContent.trim().slice(0, 40), inBanner: !!(banner && h && banner.contains(h)) };
  };
  let store = null;
  if (banner) {
    const cs = getComputedStyle(banner);
    const link = [...banner.querySelectorAll('a')].find((a) => /privacy/i.test(a.textContent));
    const p = banner.querySelector('p');
    const heading = banner.querySelector('h3,h2,h4,strong');
    store = {
      banner: bx(banner), text: bx(p), heading: bx(heading), link: bx(link), linkHref: link && link.getAttribute('href'), decline: bx(btn('Decline')), accept: bx(acc),
      closeX: bx(banner.querySelector('button[aria-label]')),
      cs: { position: cs.position, bottom: cs.bottom, top: cs.top, zIndex: cs.zIndex, backgroundImage: cs.backgroundImage, backdropFilter: cs.backdropFilter, className: banner.className },
      innerText: banner.innerText.replace(/\s+/g, ' ').trim(),
      buttons: [...banner.querySelectorAll('button')].map((b) => ({ text: b.textContent.trim(), aria: b.getAttribute('aria-label'), box: bx(b) })),
    };
  }
  return {
    path: location.pathname, vw: innerWidth, vh: innerHeight,
    acceptBtn: !!acc, declineBtn: !!btn('Decline'), bannerBox: bx(banner), fixedBottom,
    status: hit('[data-testid="arrangement-status"]'), hint: hit('[data-testid="arrangement-shortcut-hint"]'),
    workspace: !!document.querySelector('[data-testid=arrangement-grid-control]'),
    demoBadge: document.body.innerText.includes('Demo collection — no sign-in required'),
    signInRequired: /sign in required/i.test(document.body.innerText),
    audioSrc: document.querySelectorAll('audio[src]').length,
    consent: localStorage.getItem('czaba_analytics_consent'), authUser: localStorage.getItem('auth_user'), cookieLen: document.cookie.length,
    store,
  };
};

async function studioRow(browser, which, vp, route) {
  const label = `${which}-${vp}-${route.replace(/\//g, '_')}`;
  const o = await open(browser, vp, label);
  await o.page.goto(BASES[which] + route, { waitUntil: 'domcontentloaded' });
  await o.page.evaluate(() => { window.__c183load = 1; }).catch(() => {});
  const t0 = Date.now();
  if (route === '/studio-lab') await o.page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }).catch(() => {});
  await sleep(Math.max(0, 6500 - (Date.now() - t0)));
  o.s.result = await o.page.evaluate(PROBE);
  o.s.noReload = await o.page.evaluate(() => window.__c183load === 1);
  o.s.cookies = (await o.ctx.cookies()).length;
  o.s.shot = path.relative(ROOT, path.join(SHD, `${label}.png`));
  await o.page.screenshot({ path: path.join(SHD, `${label}.png`) });
  await o.ctx.close();
  res.sessions.push(o.s); save();
  return o.s;
}

async function storeRow(browser, which, vp, route, action) {
  const label = `${which}-${vp}-store${route.replace(/\//g, '_')}-${action}`;
  const o = await open(browser, vp, label);
  await o.page.goto(BASES[which] + route, { waitUntil: 'domcontentloaded' });
  await o.page.evaluate(() => { window.__c183load = 1; }).catch(() => {});
  await sleep(6500);
  o.s.result = await o.page.evaluate(PROBE);
  o.s.noReload = await o.page.evaluate(() => window.__c183load === 1);
  o.s.shot = path.relative(ROOT, path.join(SHD, `${label}.png`));
  await o.page.screenshot({ path: path.join(SHD, `${label}.png`) });
  if (o.s.result.store) {
    const b = o.s.result.store.banner;
    await o.page.screenshot({ path: path.join(SHD, `${label}-crop.png`), clip: { x: b[0], y: b[1], width: b[2], height: b[3] } });
  }
  if (action !== 'none' && o.s.result.acceptBtn) {
    await o.page.getByRole('button', { name: action, exact: true }).click();
    await sleep(800);
    o.s.afterClick = await o.page.evaluate(() => ({ consent: localStorage.getItem('czaba_analytics_consent'), accept: !![...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Accept') }));
    await o.page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(6000);
    o.s.afterReload = await o.page.evaluate(() => ({ consent: localStorage.getItem('czaba_analytics_consent'), accept: !![...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Accept') }));
  }
  await o.ctx.close();
  res.sessions.push(o.s); save();
  return o.s;
}

async function navRow(browser, vp) {
  const label = `NAV-CUR-${vp}`;
  const o = await open(browser, vp, label);
  const p = o.page;
  await p.goto(BASES.CUR + '/studio-lab', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  await sleep(6000);
  o.s.beforeClick = await p.evaluate(PROBE);
  await p.evaluate(() => { window.__c183marker = 'alive'; });
  const navsBefore = o.s.navs;
  await p.locator('[data-testid=arrangement-exit]').click();
  const tClick = Date.now();
  let appearedMs = null;
  while (Date.now() - tClick < 3000) {
    const ok = await p.evaluate(() => !![...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Accept')).catch(() => false);
    if (ok) { appearedMs = Date.now() - tClick; break; }
    await sleep(50);
  }
  o.s.appearedMs = appearedMs;
  o.s.after = await p.evaluate(PROBE);
  o.s.markerSurvived = await p.evaluate(() => window.__c183marker === 'alive');
  o.s.navsDuringClick = o.s.navs - navsBefore;
  o.s.navigation = o.s.markerSurvived ? 'client-side' : 'full-load';
  await p.screenshot({ path: path.join(SHD, `${label}.png`) });
  o.s.shot = path.relative(ROOT, path.join(SHD, `${label}.png`));
  await o.ctx.close();
  res.sessions.push(o.s); save();
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--disable-lcd-text', '--autoplay-policy=no-user-gesture-required'] });
  try {
    for (const vp of [1440, 1280]) {
      for (const which of ['HEAD', 'CUR']) {
        await studioRow(browser, which, vp, '/studio-lab');
        await studioRow(browser, which, vp, '/studio/middle-east');
        await storeRow(browser, which, vp, '/', 'none');
        await storeRow(browser, which, vp, '/', 'Accept');
        await storeRow(browser, which, vp, '/', 'Decline');
        await storeRow(browser, which, vp, '/products', 'none');
      }
      await navRow(browser, vp);
    }
  } catch (e) { res.fatal = String((e && e.stack) || e).slice(0, 800); }
  await browser.close();
  save();
  console.log('done', res.sessions.length, res.fatal || '');
})();
