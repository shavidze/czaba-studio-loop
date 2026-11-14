// Round 514 cookie-banner probe (focus after dismissal + Close X overlap). Usage: node r514-banner.mjs <baseUrl> <outDir>
// Needs a dev server with VITE_GA4_MEASUREMENT_ID set (own Vite cacheDir) and the mock API on :5199.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');

const base = process.argv[2];
const out = path.resolve(process.argv[3]);
fs.mkdirSync(out, { recursive: true });
const LAYOUT_VIEWPORTS = [[320, 700], [375, 812], [639, 800], [1280, 720], [1440, 900]];
const res = { base, layout: [], focus: [], errors: [] };

async function newPage(browser, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
  const page = await ctx.newPage();
  await page.route(/googletagmanager\.com|google-analytics\.com/, (r) => r.abort());
  page.on('pageerror', (e) => res.errors.push(`${w}: ${String(e).slice(0, 200)}`));
  return { ctx, page };
}

async function openBanner(page, p = '/') {
  await page.goto(base + p, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Accept', exact: true }).waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForTimeout(700);
}

function readLayout() {
  const btns = [...document.querySelectorAll('button')];
  const accept = btns.find((b) => b.textContent.trim() === 'Accept');
  let banner = accept; while (banner && getComputedStyle(banner).position !== 'fixed') banner = banner.parentElement;
  const close = banner ? [...banner.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Close') : null;
  const p = banner ? banner.querySelector('p') : null;
  const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), r: +r.right.toFixed(1), b: +r.bottom.toFixed(1) }; };
  const glyphs = [];
  if (p) {
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    let n; while ((n = walker.nextNode())) { const rg = document.createRange(); rg.selectNodeContents(n); for (const r of rg.getClientRects()) if (r.width > 0) glyphs.push({ x: r.x, y: r.y, r: r.right, b: r.bottom }); }
  }
  const link = p ? p.querySelector('a') : null;
  const cb = close && getComputedStyle(close).display !== 'none' ? close.getBoundingClientRect() : null;
  let minGap = null; let overlap = false;
  if (cb) {
    const rects = [...glyphs, ...(link ? [...link.getClientRects()].map((r) => ({ x: r.x, y: r.y, r: r.right, b: r.bottom })) : [])];
    for (const g of rects) {
      const dx = Math.max(g.x - cb.right, cb.x - g.r, 0); const dy = Math.max(g.y - cb.bottom, cb.y - g.b, 0);
      if (dx === 0 && dy === 0) overlap = true;
      const d = Math.max(dx, dy); minGap = minGap === null ? d : Math.min(minGap, d);
    }
  }
  return {
    banner: box(banner), text: box(p), link: box(link), accept: box(accept),
    decline: box(btns.find((b) => b.textContent.trim() === 'Decline')),
    close: close ? { ...box(close), display: getComputedStyle(close).display } : null,
    closeTextOverlap: overlap, closeTextMinGapPx: minGap === null ? null : +minGap.toFixed(1),
    textLines: p ? new Set(glyphs.map((g) => Math.round(g.y))).size : 0,
    bannerClass: banner ? banner.className : null, rootPaddingRight: banner ? getComputedStyle(banner).paddingRight : null,
  };
}

function readFocus() {
  const a = document.activeElement;
  const label = a ? (a.getAttribute('aria-label') || (a.textContent || '').trim().slice(0, 40)) : null;
  const cs = a && a !== document.body ? getComputedStyle(a) : null;
  const r = a && a !== document.body ? a.getBoundingClientRect() : null;
  return {
    tag: a ? a.tagName : null, label, href: a && a.getAttribute ? a.getAttribute('href') : null,
    focusVisible: a && a !== document.body ? a.matches(':focus-visible') : false,
    outline: cs ? `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` : null,
    inViewport: r ? r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth : false,
    focusSource: document.documentElement.dataset.focusSource || null,
    scrollY: Math.round(scrollY),
    bannerGone: ![...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Accept'),
  };
}

function markPrevBeforeBanner() {
  const accept = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Accept');
  let banner = accept; while (banner && getComputedStyle(banner).position !== 'fixed') banner = banner.parentElement;
  const all = [...document.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])')]
    .filter((e) => !banner.contains(e) && e.getClientRects().length > 0 && (banner.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING));
  const prev = all[all.length - 1]; prev.setAttribute('data-r514-prev', '1'); return { tag: prev.tagName, label: (prev.getAttribute('aria-label') || prev.textContent || '').trim().slice(0, 40) };
}

async function tabTo(page, name, key) {
  for (let i = 0; i < 80; i += 1) {
    await page.keyboard.press(key);
    const hit = await page.evaluate((n) => { const a = document.activeElement; return a && (a.getAttribute('aria-label') === n || a.textContent.trim() === n); }, name);
    if (hit) return i + 1;
  }
  return -1;
}

async function scenario(browser, w, h, ctlName, entry, out2, key) {
  const { ctx, page } = await newPage(browser, w, h);
  const row = { w, ctl: ctlName, entry };
  try {
    await openBanner(page);
    if (entry === 'shift-tab-from-top') {
      await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement && document.activeElement.blur && document.activeElement.blur(); });
      row.steps = await tabTo(page, ctlName, 'Shift+Tab');
    } else if (entry === 'tab-from-before-banner') {
      await page.evaluate(() => window.scrollTo(0, Math.round(document.documentElement.scrollHeight / 2)));
      row.prev = await page.evaluate(markPrevBeforeBanner);
      await page.keyboard.press('Shift');
      await page.locator('[data-r514-prev="1"]').focus();
      row.scrollBeforeEntry = await page.evaluate(() => Math.round(scrollY));
      row.steps = await tabTo(page, ctlName, 'Tab');
    }
    if (entry === 'privacy-nav-then-keyboard') {
      await page.evaluate(() => window.scrollTo(0, Math.round(document.documentElement.scrollHeight / 2)));
      row.prev = await page.evaluate(markPrevBeforeBanner);
      await page.keyboard.press('Shift');
      await page.locator('[data-r514-prev="1"]').focus();
      row.privacySteps = await tabTo(page, 'Privacy Policy', 'Tab');
      await page.keyboard.press('Enter');
      await page.waitForURL('**/privacy', { timeout: 15000 });
      await page.waitForTimeout(800);
      row.urlAfterPrivacy = page.url();
      row.steps = await tabTo(page, ctlName, 'Tab');
    }
    if (entry === 'shift-tab-mid-page-never-focused') {
      await page.evaluate(() => window.scrollTo(0, Math.round(document.documentElement.scrollHeight / 2)));
      await page.waitForTimeout(500);
      await page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
      row.steps = await tabTo(page, ctlName, 'Shift+Tab');
    }
    if (entry === 'pointer-mid-page') {
      await page.evaluate(() => window.scrollTo(0, Math.round(document.documentElement.scrollHeight / 3)));
      await page.waitForTimeout(300);
      row.scrollBefore = await page.evaluate(() => Math.round(scrollY));
      const loc = ctlName === 'Close' ? page.getByRole('button', { name: 'Close', exact: true }) : page.getByRole('button', { name: ctlName, exact: true });
      await loc.click();
    } else {
      row.scrollBefore = await page.evaluate(() => Math.round(scrollY));
      row.key = key || 'Enter';
      await page.keyboard.press(row.key);
    }
    await page.waitForTimeout(entry === 'shift-tab-mid-page-never-focused' ? 1500 : 400);
    row.after = await page.evaluate(readFocus);
    row.consent = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).filter((k) => /consent|cookie/i.test(k)).map((k) => [k, localStorage.getItem(k)])));
    await page.screenshot({ path: path.join(out2, `focus-${w}-${ctlName}-${entry}${key ? '-' + key : ''}.png`) });
    await page.keyboard.press('Tab');
    row.firstTabAfter = await page.evaluate(() => { const a = document.activeElement; return a ? (a.getAttribute('aria-label') || a.textContent.trim().slice(0, 40)) : null; });
  } catch (e) { row.error = String(e).slice(0, 300); }
  await ctx.close();
  return row;
}

const STUDIO_ONLY = process.argv[4] === 'studio-only';
const browser = await chromium.launch();
if (!STUDIO_ONLY) { const { ctx, page } = await newPage(browser, 1280, 720); try { await openBanner(page); } catch {} await ctx.close(); }
for (const [w, h] of STUDIO_ONLY ? [] : LAYOUT_VIEWPORTS) {
  const { ctx, page } = await newPage(browser, w, h);
  try {
    await openBanner(page);
    const l = await page.evaluate(readLayout);
    res.layout.push({ w, h, ...l });
    if (l.banner) await page.screenshot({ path: path.join(out, `banner-${w}.png`), clip: { x: 0, y: l.banner.y, width: w, height: l.banner.h } });
  } catch (e) { res.layout.push({ w, error: String(e).slice(0, 300) }); }
  await ctx.close();
}
for (const [w, h] of STUDIO_ONLY ? [] : [[1280, 720], [375, 812]]) {
  const ctls = w < 640 ? ['Decline', 'Accept', 'Close'] : ['Decline', 'Accept'];
  for (const c of ctls) {
    for (const entry of ['shift-tab-from-top', 'tab-from-before-banner', 'pointer-mid-page', ...(c === 'Decline' ? ['privacy-nav-then-keyboard', 'shift-tab-mid-page-never-focused'] : [])]) {
      res.focus.push(await scenario(browser, w, h, c, entry, out));
    }
  }
  res.focus.push(await scenario(browser, w, h, 'Accept', 'shift-tab-from-top', out, 'Space'));
}
if (!STUDIO_ONLY) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  await page.route(/googletagmanager\.com|google-analytics\.com/, (r) => r.abort());
  const row = { entry: 'fresh-first-visit-record' };
  try {
    await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Decline', exact: true }).waitFor({ state: 'attached', timeout: 20000 });
    await page.waitForTimeout(1500);
    row.dialogsOpen = await page.evaluate(() => document.querySelectorAll('[role="dialog"]').length);
    await page.getByRole('button', { name: 'Decline', exact: true }).focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);
    row.after = await page.evaluate(readFocus);
    await page.screenshot({ path: path.join(out, 'focus-fresh-first-visit.png') });
  } catch (e) { row.error = String(e).slice(0, 300); }
  res.focus.push(row);
  await ctx.close();
}
{
  const { ctx, page } = await newPage(browser, 1280, 720);
  const st = {};
  try {
    for (let i = 0; i < 2; i += 1) {
      await page.goto(base + '/studio-lab', { waitUntil: 'load' });
      await page.waitForFunction(() => document.body && document.body.innerText.length > 0, null, { timeout: 30000 });
      await page.waitForTimeout(3500);
    }
    st.bannerButtons = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => ['Accept', 'Decline'].includes(b.textContent.trim())).length);
    st.title = await page.title();
    st.workspaceText = await page.evaluate(() => /Demo collection|Arrangement|Library/i.test(document.body.innerText));
    await page.screenshot({ path: path.join(out, 'studio-lab-1280.png') });
  } catch (e) { st.error = String(e).slice(0, 300); }
  res.studio = st;
  await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(out, STUDIO_ONLY ? 'r514-studio.json' : 'r514.json'), JSON.stringify(res, null, 1));
console.log(JSON.stringify({ layout: res.layout.map((l) => ({ w: l.w, overlap: l.closeTextOverlap, gap: l.closeTextMinGapPx, bannerH: l.banner && l.banner.h, close: l.close, err: l.error })), focus: res.focus.map((f) => ({ w: f.w, c: f.ctl, e: f.entry, a: f.after && `${f.after.tag}:${f.after.label}:fv=${f.after.focusVisible}:sy=${f.scrollBefore}->${f.after.scrollY}`, t: f.firstTabAfter, err: f.error })), errors: res.errors.length }, null, 0));
