// N3 cookie-banner probe. Usage: node n3-banner.mjs <baseUrl> <outDir>
// Needs a dev server started with VITE_GA4_MEASUREMENT_ID set (own Vite cacheDir) and the mock API on :5199.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');

const base = process.argv[2];
const out = path.resolve(process.argv[3]);
fs.mkdirSync(out, { recursive: true });
const VIEWPORTS = [[1440, 900], [1280, 720], [375, 812]];
const res = { base, runs: [] };

function lum(c) {
  const m = c.match(/[\d.]+/g).map(Number);
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]);
}
function ratio(a, b) { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); }

async function newPage(browser, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
  const page = await ctx.newPage();
  const gaAborted = [];
  await page.route(/googletagmanager\.com|google-analytics\.com/, (r) => { gaAborted.push(r.request().url()); r.abort(); });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  return { ctx, page, gaAborted, errors };
}

async function openBanner(page, p = '/') {
  await page.goto(base + p, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Accept', exact: true }).waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(700);
}

function readControls() {
  const pick = (name) => [...document.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || b.textContent.trim()) === name);
  const one = (name) => {
    const el = pick(name);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName, cls: el.className, title: el.getAttribute('title'), ariaLabel: el.getAttribute('aria-label'), type: el.getAttribute('type'),
      x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), display: cs.display,
      bg: cs.backgroundColor, color: cs.color, border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`,
      radius: cs.borderTopLeftRadius, weight: cs.fontWeight, size: cs.fontSize, pad: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
      cursor: cs.cursor, opacity: cs.opacity,
    };
  };
  const accept = pick('Accept');
  let banner = accept; while (banner && getComputedStyle(banner).position !== 'fixed') banner = banner.parentElement;
  const br = banner ? banner.getBoundingClientRect() : null;
  const text = banner ? banner.querySelector('p') : null;
  const tr = text ? text.getBoundingClientRect() : null;
  const order = banner ? [...banner.querySelectorAll('button')].map((b) => b.getAttribute('aria-label') || b.textContent.trim()) : [];
  return {
    banner: br && { x: br.x, y: +br.y.toFixed(1), w: br.width, h: +br.height.toFixed(1) },
    text: tr && { x: +tr.x.toFixed(1), y: +tr.y.toFixed(1), w: +tr.width.toFixed(1), h: +tr.height.toFixed(1), right: +tr.right.toFixed(1) },
    order,
    Decline: one('Decline'), Accept: one('Accept'), Close: one('Close'),
  };
}

const focusInfo = () => {
  const el = document.activeElement;
  const cs = el ? getComputedStyle(el) : null;
  return {
    tag: el && el.tagName, name: el && (el.getAttribute('aria-label') || el.textContent.trim().slice(0, 40)),
    focusVisible: el ? el.matches(':focus-visible') : null,
    outline: cs && `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, offset: cs && cs.outlineOffset,
  };
};

(async () => {
  const browser = await chromium.launch();
  // warm-up (L38)
  { const { ctx, page } = await newPage(browser, 1440, 900); await openBanner(page).catch(() => {}); await ctx.close(); }
  for (const [w, h] of VIEWPORTS) {
    const run = { viewport: `${w}x${h}` };
    // 1. rest + hover + bg sample
    {
      const { ctx, page, gaAborted, errors } = await newPage(browser, w, h);
      await openBanner(page);
      run.rest = await page.evaluate(readControls);
      run.bannerBgSample = await page.evaluate(() => {
        const a = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Accept');
        let b = a; while (b && getComputedStyle(b).position !== 'fixed') b = b.parentElement;
        return b ? b.getAttribute('style') : null;
      });
      await page.screenshot({ path: `${out}/rest-${w}.png` });
      const box = run.rest.banner;
      if (box) await page.screenshot({ path: `${out}/banner-${w}.png`, clip: { x: 0, y: Math.max(0, box.y), width: w, height: Math.min(box.h, h - box.y) } });
      run.hover = {};
      for (const name of ['Decline', 'Accept']) {
        await page.getByRole('button', { name, exact: true }).hover();
        await page.waitForTimeout(250);
        run.hover[name] = await page.evaluate((n) => { const el = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === n); const cs = getComputedStyle(el); return { bg: cs.backgroundColor, border: cs.borderTopColor, color: cs.color, cursor: cs.cursor }; }, name);
      }
      await page.mouse.move(1, 1);
      // keyboard: focus the Privacy Policy link, then Tab
      await page.locator('a.underline[href="/privacy"]').focus();
      run.keyboard = [];
      for (let i = 0; i < 3; i += 1) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(150);
        const f = await page.evaluate(focusInfo);
        run.keyboard.push(f);
        if (['Decline', 'Accept'].includes(f.name)) {
          const bb = await page.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
          await page.screenshot({ path: `${out}/focus-${f.name}-${w}.png`, clip: { x: Math.max(0, bb.x - 8), y: Math.max(0, bb.y - 8), width: bb.w + 16, height: bb.h + 16 } });
        }
      }
      // mouse press on Accept (hold) then release outside
      const ab = await page.getByRole('button', { name: 'Accept', exact: true }).boundingBox();
      await page.mouse.move(ab.x + ab.width / 2, ab.y + ab.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(200);
      run.mousePress = await page.evaluate(() => { const el = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Accept'); const cs = getComputedStyle(el); return { opacity: cs.opacity, outline: `${cs.outlineStyle} ${cs.outlineWidth}`, focusVisible: el.matches(':focus-visible'), focused: document.activeElement === el }; });
      await page.screenshot({ path: `${out}/press-accept-${w}.png`, clip: { x: Math.max(0, ab.x - 8), y: Math.max(0, ab.y - 8), width: ab.width + 16, height: ab.height + 16 } });
      await page.mouse.move(1, 1);
      await page.mouse.up();
      run.consentAfterPressReleaseOutside = await page.evaluate(() => localStorage.getItem('czaba_analytics_consent'));
      run.gaAborted = gaAborted.length; run.errors = errors;
      await ctx.close();
    }
    // 2. actions: keyboard Enter on Decline, Enter on Accept, click Close (375 only)
    run.actions = {};
    for (const action of ['Decline', 'Accept', ...(w < 640 ? ['Close'] : [])]) {
      const { ctx, page, errors } = await newPage(browser, w, h);
      await openBanner(page);
      if (action === 'Close') {
        await page.getByRole('button', { name: 'Close', exact: true }).click();
      } else {
        await page.getByRole('button', { name: action, exact: true }).focus();
        await page.keyboard.press('Enter');
      }
      await page.waitForTimeout(400);
      const after = await page.evaluate(focusInfo);
      const state = await page.evaluate(() => ({
        consent: localStorage.getItem('czaba_analytics_consent'),
        acceptCount: [...document.querySelectorAll('button')].filter((b) => b.textContent.trim() === 'Accept').length,
      }));
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      const nextTab = await page.evaluate(focusInfo);
      run.actions[action] = { ...state, focusAfter: after, firstTabAfter: nextTab, errors };
      await ctx.close();
    }
    res.runs.push(run);
  }
  // 3. studio routes with GA4 set: no banner
  res.studio = [];
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    for (const p of ['/studio-lab', '/studio/middle-east']) {
      const { ctx, page, errors } = await newPage(browser, w, h);
      await page.goto(base + p, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
      const d = await page.evaluate(() => ({ accept: [...document.querySelectorAll('button')].filter((b) => ['Accept', 'Decline'].includes(b.textContent.trim())).length, title: document.title, signIn: (document.body ? document.body.innerText : '').includes('Sign in required'), workspace: !!document.querySelector('[data-studio-theme]') })).catch(async () => { await page.waitForTimeout(3000); return page.evaluate(() => ({ accept: [...document.querySelectorAll('button')].filter((b) => ['Accept', 'Decline'].includes(b.textContent.trim())).length, title: document.title, signIn: (document.body ? document.body.innerText : '').includes('Sign in required'), workspace: !!document.querySelector('[data-studio-theme]'), retried: true })); });
      res.studio.push({ viewport: `${w}x${h}`, path: p, ...d, errors });
      await page.screenshot({ path: `${out}/studio-${w}${p.replace(/\W+/g, '-')}.png` });
      await ctx.close();
    }
  }
  await browser.close();
  // contrast (text vs own bg; button bg vs banner black approx rgb(0,0,0))
  for (const r of res.runs) {
    r.contrast = {};
    for (const n of ['Decline', 'Accept']) {
      const c = r.rest[n];
      if (c && !c.bg.includes('0, 0, 0, 0)')) r.contrast[n] = { textVsBg: ratio(c.color, c.bg), bgVsBlack: ratio(c.bg, 'rgb(0,0,0)') };
      else if (c) r.contrast[n] = { textVsBlack: ratio(c.color, 'rgb(0,0,0)') };
    }
    if (r.rest.Close && r.rest.Close.display !== 'none') r.contrast.Close = { textVsBlack: ratio(r.rest.Close.color, 'rgb(0,0,0)') };
  }
  fs.writeFileSync(`${out}/n3.json`, JSON.stringify(res, null, 1));
  console.log('written', `${out}/n3.json`);
})().catch((e) => { console.error(e); process.exit(1); });
