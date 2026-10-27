// C round 204 — own helpers.
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs'); const path = require('path');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = path.join(__dirname, '..', 'out'); const SHOTS = path.join(__dirname, '..', 'shots');
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|localhost:5199|DevTools/i;
const H = (W) => (W === 1440 ? 900 : W === 1280 ? 720 : 812);
const launch = () => chromium.launch({ headless: true, args: ['--disable-lcd-text'] });
const LM = { viewCount: 0, lastResetDate: '2026-10-27', dismissed: true, submitted: false };
const USER = { id: 7, firstName: 'Ana', lastName: 'Test', email: 'ana@example.com' };
async function newPage(browser, W, { suppress = true, signedIn = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H(W) }, deviceScaleFactor: 1 });
  await ctx.addInitScript(([lm, u, s, si]) => {
    try { if (s) localStorage.setItem('czaba_lead_magnet', JSON.stringify(lm)); if (si) localStorage.setItem('auth_user', JSON.stringify(u)); } catch (e) {}
  }, [LM, USER, suppress, signedIn]);
  const page = await ctx.newPage();
  const log = { errors: [], noise: 0 };
  page.on('console', (m) => { if (m.type() === 'error') { if (NOISE.test(m.text())) log.noise++; else log.errors.push(m.text().slice(0, 200)); } });
  page.on('pageerror', (e) => log.errors.push('pageerror ' + String(e).slice(0, 200)));
  return { ctx, page, log };
}
async function declineCookies(page) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
}
// in-page describer, serialised
const DESCRIBE = `(el) => {
  if (!el || el === document.body || el === document.documentElement) return null;
  const cs = getComputedStyle(el); let op = 1, vis = true, n = el;
  while (n && n.nodeType === 1) { const c = getComputedStyle(n); op *= parseFloat(c.opacity); if (c.visibility === 'hidden' || c.display === 'none') vis = false; n = n.parentElement; }
  const r = el.getBoundingClientRect();
  let clipped = false; let p = el.parentElement;
  while (p && p !== document.body) { const pc = getComputedStyle(p); if (pc.overflow !== 'visible' || pc.overflowY !== 'visible') { const pr = p.getBoundingClientRect(); if (pr.height < 1 || pr.width < 1 || r.bottom <= pr.top + 0.5 || r.top >= pr.bottom - 0.5) { clipped = true; break; } } p = p.parentElement; }
  const name = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('href') || el.id || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
  const onScreen = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  return { tag: el.tagName, name, href: el.getAttribute('href'), tabindex: el.getAttribute('tabindex'), role: el.getAttribute('role'),
    eff: +op.toFixed(3), vis, clipped, onScreen, box: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(1)), scrollY: Math.round(scrollY),
    fv: el.matches(':focus-visible'), os: cs.outlineStyle, ow: cs.outlineWidth, oc: cs.outlineColor, oo: cs.outlineOffset, bs: cs.boxShadow, bg: cs.backgroundColor,
    bc: cs.borderTopColor, bw: cs.borderTopWidth, transform: cs.transform, scale: cs.scale, tp: cs.transitionProperty, td: cs.transitionDuration };
}`;
const describeActive = (page) => page.evaluate(`(${DESCRIBE})(document.activeElement)`);
const describeEl = (handle) => handle.evaluate((el, src) => (new Function('return ' + src)())(el), DESCRIBE);
const popupOpen = (page) => page.evaluate(() => /FREE DOWNLOAD/i.test([...document.querySelectorAll('div.fixed, [role="dialog"]')].map((d) => getComputedStyle(d).display !== 'none' ? d.innerText : '').join(' ')));
const save = (f, d) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 1)); };
module.exports = { launch, newPage, declineCookies, describeActive, describeEl, DESCRIBE, sleep, save, OUT, SHOTS, H, popupOpen };
