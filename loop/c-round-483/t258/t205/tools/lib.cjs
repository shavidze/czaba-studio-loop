// C round 205 — own helpers (LeadMagnet dialog / scroll lock).
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs'); const path = require('path');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = path.join(__dirname, '..', 'out'); const SHOTS = path.join(__dirname, '..', 'shots');
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|localhost:5199|DevTools/i;
const H = (W) => (W === 1440 ? 900 : W === 1280 ? 720 : 812);
const launch = () => chromium.launch({ headless: true, args: ['--disable-lcd-text'] });
const today = () => new Date().toISOString().slice(0, 10);
async function newPage(browser, W, { suppress = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H(W) }, deviceScaleFactor: 1 });
  if (suppress) {
    await ctx.addInitScript((d) => { try { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: d, dismissed: true, submitted: false })); } catch (e) {} }, today());
  }
  const page = await ctx.newPage();
  const log = { errors: [], noise: 0, requests: [] };
  page.on('console', (m) => { if (m.type() === 'error') { if (NOISE.test(m.text())) log.noise++; else log.errors.push(m.text().slice(0, 200)); } });
  page.on('pageerror', (e) => log.errors.push('pageerror ' + String(e).slice(0, 200)));
  return { ctx, page, log };
}
async function declineCookies(page) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
}
const DESCRIBE = `(el) => {
  if (!el) return null;
  if (el === document.body || el === document.documentElement) return { tag: el.tagName };
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const d = document.querySelector('[role="dialog"]');
  const fx = [...document.querySelectorAll('div.fixed')].find((x) => /FREE DOWNLOAD|CLAIM YOUR OFFER|mystery pack/i.test(x.innerText || ''));
  const name = (el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.textContent || el.getAttribute('href') || el.id || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
  return { tag: el.tagName, name, role: el.getAttribute('role'), inDialog: !!((d && d.contains(el)) || (fx && fx.contains(el))),
    onScreen: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth, box: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(1)),
    fv: el.matches(':focus-visible'), os: cs.outlineStyle, ow: cs.outlineWidth, oc: cs.outlineColor, oo: cs.outlineOffset, bs: cs.boxShadow };
}`;
const describeActive = (page) => page.evaluate(`(${DESCRIBE})(document.activeElement)`);
const state = (page) => page.evaluate(() => {
  const d = [...document.querySelectorAll('[role="dialog"]')];
  const fx = [...document.querySelectorAll('div.fixed')].find((x) => /FREE DOWNLOAD|CLAIM YOUR OFFER|mystery pack/i.test(x.innerText || ''));
  const bs = document.body.style;
  return { dialogs: d.length, modal: d.map((x) => x.getAttribute('aria-modal')), labelledby: d.map((x) => x.getAttribute('aria-labelledby')),
    popup: !!fx, scrollY: Math.round(window.scrollY), body: { position: bs.position, overflow: bs.overflow, top: bs.top, width: bs.width, paddingRight: bs.paddingRight },
    lm: localStorage.getItem('czaba_lead_magnet') };
});
const popupVisible = (page) => page.evaluate(() => !![...document.querySelectorAll('div.fixed')].find((x) => /FREE DOWNLOAD|CLAIM YOUR OFFER|mystery pack/i.test(x.innerText || '') && x.getBoundingClientRect().height > 0));
async function focusMidLink(page) {
  return page.evaluate(() => {
    const els = [...document.querySelectorAll('a[href],button')].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return !e.closest('header') && r.top > 40 && r.bottom < innerHeight - 10 && r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && e.tabIndex >= 0; });
    let el = els[0];
    if (!el) { el = [...document.querySelectorAll('a[href],button')].find((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return !e.closest('header') && r.top > 0 && r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && e.tabIndex >= 0; }); if (!el) return null; window.scrollTo(0, Math.round(window.scrollY + el.getBoundingClientRect().top - innerHeight / 2)); }
    el.focus({ preventScroll: true }); return (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40);
  });
}
async function scrollTo55(page) {
  await page.evaluate(() => window.scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * 0.55)));
  await sleep(1500);
}
// wait for the popup; returns ms waited after it became visible until focus inside (polled)
async function waitPopup(page, timeout = 16000) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) { if (await popupVisible(page)) break; await sleep(50); }
  const vis = Date.now();
  if (!(await popupVisible(page))) return { visible: false };
  let focusMs = null;
  while (Date.now() - vis < 1500) {
    const a = await describeActive(page);
    if (a && a.name === 'Close' && a.inDialog) { focusMs = Date.now() - vis; break; }
    await sleep(25);
  }
  return { visible: true, afterMs: vis - t0, focusMs };
}
const save = (f, d) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 1)); };
module.exports = { launch, newPage, declineCookies, describeActive, state, popupVisible, focusMidLink, scrollTo55, waitPopup, sleep, save, OUT, SHOTS, H };
