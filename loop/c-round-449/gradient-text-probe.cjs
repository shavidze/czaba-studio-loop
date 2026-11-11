// B round 448 -> 449 planning probe (STORE-2b-3a gradient text).
// usage: node gradient-text-probe.cjs <baseUrl> <out.json> [widths] [shotDir]
// For each emphasised heading word: computed paint (fill, background, clip), boxes, and pixel ink of the word.
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || 'http://127.0.0.1:5173';
const OUTF = process.argv[3] || 'gradient-text.json';
const WIDTHS = (process.argv[4] || '1440,1280,375').split(',').map(Number);
const SHOTS = process.argv[5] || null;
const H = (W) => (W === 1440 ? 900 : W === 1280 ? 720 : 812);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = () => new Date().toISOString().slice(0, 10);

const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const ALL_TARGETS = [
  { id: 'HERO', path: '/', word: 'CZABA', phrase: 'CZABA', tag: 'H1' },
  { id: 'RELEASES', path: '/', word: 'Releases', phrase: 'Latest Releases' },
  { id: 'NEWSLETTER', path: '/', word: 'Inner Circle', phrase: 'Join the Inner Circle' },
  { id: 'STUDIO', path: '/', word: 'Studio', phrase: 'CZABA Studio' },
  { id: 'ABOUT-CINEMA', path: '/about', word: 'Cinema', phrase: 'Crafting Sound for Cinema' },
  { id: 'ABOUT-STAND', path: '/about', word: 'Stand For', phrase: 'What We Stand For' },
  { id: 'NOT-FOUND', path: '/no-such-page-449', word: 'Sound', phrase: 'Lost in the Sound' },
];
const TARGETS = ONLY ? ALL_TARGETS.filter((t) => ONLY.includes(t.id)) : ALL_TARGETS;

const FIND = `(t) => {
  const heads = [...document.querySelectorAll('h1,h2,h3,h4,p,div')].filter((h) => {
    const s = h.querySelector(':scope > span');
    return s && (h.textContent || '').replace(/\\s+/g, ' ').trim().startsWith(t.phrase) && (!t.tag || h.tagName === t.tag);
  });
  for (const h of heads) {
    const spans = [...h.querySelectorAll(':scope > span')];
    const s = t.word ? spans.find((x) => x.textContent.trim() === t.word) : spans[0];
    if (s) { s.setAttribute('data-b449', t.id); h.setAttribute('data-b449-parent', t.id); return true; }
  }
  return false;
}`;

const READ = `(id) => {
  const s = document.querySelector('[data-b449="' + id + '"]');
  const h = document.querySelector('[data-b449-parent="' + id + '"]');
  if (!s || !h) return null;
  const cs = getComputedStyle(s); const hs = getComputedStyle(h);
  const box = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x * 10) / 10, y: Math.round((r.y + scrollY) * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 }; };
  let bg = null; for (let e = s; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') { bg = c; break; } }
  return {
    className: s.getAttribute('class'), text: s.textContent.trim(),
    color: cs.color, fill: cs.webkitTextFillColor, backgroundImage: cs.backgroundImage,
    clip: cs.webkitBackgroundClip || cs.backgroundClip, backgroundClip: cs.backgroundClip, textShadow: cs.textShadow,
    parentColor: hs.color, parentTag: h.tagName, nearestBg: bg, opacity: cs.opacity,
    spanBox: box(s), parentBox: box(h), lines: s.getClientRects().length,
  };
}`;

const PIX = `async (b64) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const px = []; for (let i = 0; i < d.length; i += 4) px.push([d[i], d[i + 1], d[i + 2]]);
  const lum = (p) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(p[0]) + 0.7152 * f(p[1]) + 0.0722 * f(p[2]); };
  const sorted = [...px].sort((a, b) => lum(a) - lum(b));
  const bgp = sorted[Math.floor(sorted.length * 0.1)];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const ink = px.filter((p) => dist(p, bgp) > 60);
  const core = [...ink].sort((a, b) => lum(b) - lum(a)).slice(0, Math.max(1, Math.floor(ink.length * 0.25)));
  const mean = (arr) => arr.length ? [0, 1, 2].map((k) => Math.round(arr.reduce((s, p) => s + p[k], 0) / arr.length)) : null;
  const hue = (p) => { let [r, g2, b] = p.map((v) => v / 255); const mx = Math.max(r, g2, b), mn = Math.min(r, g2, b), dd = mx - mn; if (dd === 0) return { h: 0, s: 0 }; const l = (mx + mn) / 2, s = dd / (1 - Math.abs(2 * l - 1)); let h; if (mx === r) h = 60 * (((g2 - b) / dd) % 6); else if (mx === g2) h = 60 * ((b - r) / dd + 2); else h = 60 * ((r - g2) / dd + 4); if (h < 0) h += 360; return { h, s }; };
  const teal = ink.filter((p) => { const q = hue(p); return q.h >= 160 && q.h <= 190 && q.s >= 0.4; }).length;
  const coreMean = mean(core);
  const cr = coreMean ? (Math.max(lum(coreMean), lum(bgp)) + 0.05) / (Math.min(lum(coreMean), lum(bgp)) + 0.05) : null;
  return { pixels: px.length, inkPixels: ink.length, inkFraction: Math.round((ink.length / px.length) * 1000) / 1000, tealInkPixels: teal, tealInkFraction: ink.length ? Math.round((teal / ink.length) * 1000) / 1000 : null, bg: bgp, coreInk: coreMean, coreContrast: cr ? Math.round(cr * 100) / 100 : null };
}`;

async function newPage(browser, W, suppress) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H(W) }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await ctx.addInitScript((d) => {
    try {
      if (d.suppress) localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: d.day, dismissed: true, submitted: false }));
      localStorage.setItem('cookie-consent', 'declined');
    } catch (e) {}
  }, { suppress, day: today() });
  const page = await ctx.newPage();
  return { ctx, page };
}

async function settle(page) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  await sleep(2500);
  for (let y = 0; y < 14000; y += 500) { await page.evaluate((v) => window.scrollTo(0, v), y); await sleep(250); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(800);
}

async function measure(page, t, W) {
  const found = await page.evaluate(`(${FIND})(${JSON.stringify(t)})`);
  if (!found) return { id: t.id, found: false };
  const el = page.locator(`[data-b449="${t.id}"]`);
  await el.scrollIntoViewIfNeeded();
  await sleep(1500);
  const data = await page.evaluate(`(${READ})(${JSON.stringify(t.id)})`);
  const shot = await el.screenshot({ animations: 'disabled', timeout: 120000 });
  const pix = await page.evaluate(`(${PIX})(${JSON.stringify(shot.toString('base64'))})`);
  if (SHOTS) fs.writeFileSync(path.join(SHOTS, `${t.id}-${W}.png`), shot);
  return { id: t.id, found: true, ...data, pix };
}

(async () => {
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--disable-lcd-text'] });
  const res = { base: BASE, date: new Date().toISOString(), rows: {} };
  for (const W of WIDTHS) {
    const byPath = {};
    for (const t of TARGETS) (byPath[t.path] = byPath[t.path] || []).push(t);
    for (const [p, ts] of Object.entries(byPath)) {
      const { ctx, page } = await newPage(browser, W, true);
      try {
        await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 90000 });
        await page.waitForSelector('h1', { timeout: 60000 }).catch(() => {});
        await settle(page);
        for (const t of ts) res.rows[`${t.id}@${W}`] = await measure(page, t, W);
      } catch (e) { res.rows[`${p}@${W}`] = { error: String(e).slice(0, 300) }; }
      await ctx.close();
    }
    if (ONLY && !ONLY.includes('LEADMAGNET')) continue;
    const { ctx, page } = await newPage(browser, W, false);
    try {
      await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 90000 });
      await settle(page);
      await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.55));
      const dlg = page.locator('[role="dialog"]').filter({ hasText: 'CZABA' }).first();
      await dlg.waitFor({ state: 'visible', timeout: 20000 });
      await sleep(1500);
      const ok = await page.evaluate(() => {
        const d = [...document.querySelectorAll('[role="dialog"]')].find((x) => x.textContent.includes('CZABA'));
        const s = d && [...d.querySelectorAll('span')].find((x) => x.textContent.trim() === 'CZABA' && /tracking-\[0\.5em\]/.test(x.getAttribute('class') || ''));
        if (!s) return false; s.setAttribute('data-b449', 'LEADMAGNET'); s.parentElement.setAttribute('data-b449-parent', 'LEADMAGNET'); return true;
      });
      if (!ok) res.rows[`LEADMAGNET@${W}`] = { id: 'LEADMAGNET', found: false };
      else {
        const el = page.locator('[data-b449="LEADMAGNET"]');
        const data = await page.evaluate(`(${READ})("LEADMAGNET")`);
        const shot = await el.screenshot({ animations: 'disabled', timeout: 120000 });
        const pix = await page.evaluate(`(${PIX})(${JSON.stringify(shot.toString('base64'))})`);
        if (SHOTS) {
          fs.writeFileSync(path.join(SHOTS, `LEADMAGNET-${W}.png`), shot);
          await page.screenshot({ path: path.join(SHOTS, `LEADMAGNET-dialog-${W}.png`), animations: 'disabled', timeout: 120000 });
        }
        res.rows[`LEADMAGNET@${W}`] = { id: 'LEADMAGNET', found: true, ...data, pix };
      }
    } catch (e) { res.rows[`LEADMAGNET@${W}`] = { error: String(e).slice(0, 300) }; }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
  for (const [k, v] of Object.entries(res.rows)) {
    if (v.error || !v.found) { console.log(k, v.error || 'NOT FOUND'); continue; }
    console.log(k, 'fill', v.fill, '| bgImg', (v.backgroundImage || '').slice(0, 40), '| ink', JSON.stringify(v.pix.coreInk), 'teal', v.pix.tealInkFraction, 'cr', v.pix.coreContrast, '| box', JSON.stringify(v.spanBox));
  }
})();
