// A round 194: field border ratios at four edge midpoints + LeadMagnet placeholder ratio. node fields.cjs
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('@playwright/test');
const { decode } = require('./png.cjs');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SH = path.join(ROOT, 'shots', 'fields');
fs.mkdirSync(SH, { recursive: true });
const BASE = 'http://127.0.0.1:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return Math.round(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)) * 100) / 100; };
const VPS = { 1440: { width: 1440, height: 900 }, 1280: { width: 1280, height: 720 }, 375: { width: 375, height: 812 } };
const PAGES = [
  { url: '/', vps: [1440, 1280, 375], fields: [['F1', 'input.h-14[type=email]']] },
  { url: '/store', vps: [1440, 375], fields: [['F2', 'input[name=search]']] },
  { url: '/hire-us', vps: [1440, 375], fields: [['F3', '#name'], ['F4', '#email'], ['F5', '#budget'], ['F6', '#message']] },
  { url: '/free-downloads', vps: [1440], fields: [['F7', 'input.rounded-full[type=email]']] },
  { url: '/gift-cards', vps: [1440], fields: [['F8', 'input[placeholder="Enter gift card code"]']] },
  { url: '/cart', vps: [1440], fields: [['F9', 'input[aria-label="Gift card code"]'], ['F10', 'input[placeholder="Coupon code"]'], ['F10b', 'input[placeholder="Gift card code"]']] },
];
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|Download the React DevTools/i;

async function measure(page, sel, id, tag) {
  const h = await page.$(sel);
  if (!h || !(await h.isVisible())) return { id, sel, rendered: false, note: `matches=${(await page.$$(sel)).length} visible=${h ? await h.isVisible() : 'n/a'}` };
  await h.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await page.mouse.move(1, 1);
  await sleep(250);
  const info = await h.evaluate((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: r.x, y: r.y, w: r.width, h: r.height, bw: parseFloat(cs.borderTopWidth), bc: cs.borderTopColor }; });
  const m = 8;
  const clip = { x: Math.max(0, info.x - m), y: Math.max(0, info.y - m), width: info.w + 2 * m, height: info.h + 2 * m };
  const file = path.join(SH, `${tag}-${id}.png`);
  await page.screenshot({ path: file, clip });
  const img = decode(fs.readFileSync(file));
  const D = 2;
  const ox = (info.x - clip.x) * D, oy = (info.y - clip.y) * D, W = info.w * D, H = info.h * D, B = info.bw * D;
  const px = (x, y) => img.px(Math.round(x), Math.round(y)).slice(0, 3);
  const edges = {
    top: { band: (i) => px(ox + W / 2, oy + i), out: px(ox + W / 2, oy - 8) },
    bottom: { band: (i) => px(ox + W / 2, oy + H - 1 - i), out: px(ox + W / 2, oy + H + 7) },
    left: { band: (i) => px(ox + i, oy + H / 2), out: px(ox - 8, oy + H / 2) },
    right: { band: (i) => px(ox + W - 1 - i, oy + H / 2), out: px(ox + W + 7, oy + H / 2) },
  };
  const res = {};
  for (const [k, e] of Object.entries(edges)) {
    let best = null;
    for (let i = -3; i < Math.max(1, Math.round(B)) + 3; i++) { const b = e.band(i); const r = ratio(b, e.out); if (!best || r > best.r) best = { r, border: b, outside: e.out, i }; }
    res[k] = best;
  }
  const min = Math.min(...Object.values(res).map((v) => v.r));
  return { id, sel, rendered: true, borderWidth: info.bw, borderColor: info.bc, edges: res, min, pass: min >= 3 };
}

async function keyboardFocus(page, sel) {
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
  await page.mouse.click(2, 2);
  for (let i = 0; i < 120; i++) {
    await page.keyboard.press('Tab');
    const hit = await page.evaluate((s) => document.activeElement === document.querySelector(s), sel);
    if (hit) {
      await sleep(250);
      return page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { tabs: 0, borderColor: cs.borderTopColor, boxShadow: cs.boxShadow, outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` }; }).then((v) => ({ ...v, tabs: i + 1 }));
    }
  }
  return { reached: false };
}

(async () => {
  const b = await chromium.launch({ headless: true, args: ['--disable-lcd-text'] });
  const out = { utc: new Date().toISOString(), pages: [], placeholder: [], errors: [] };
  try {
    for (const pg of PAGES) {
      for (const vp of pg.vps) {
        const ctx = await b.newContext({ viewport: VPS[vp], deviceScaleFactor: 2 });
        await ctx.addInitScript(() => localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 99, lastResetDate: new Date().toISOString().split('T')[0], dismissed: true, submitted: false })));
        const page = await ctx.newPage();
        const errs = [];
        page.on('pageerror', (e) => errs.push(`pageerror ${e.message}`));
        page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) errs.push(m.text().slice(0, 200)); });
        await page.goto(BASE + pg.url, { waitUntil: 'networkidle' });
        await sleep(1500);
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => document.fonts.ready);
        await sleep(600);
        const tag = `${pg.url.replace(/\W/g, '') || 'home'}-${vp}`;
        const rows = [];
        if (pg.url === '/free-downloads') { await page.locator('button', { hasText: 'Download' }).first().click(); await sleep(800); }
        for (const [id, sel] of pg.fields) {
          const r = await measure(page, sel, id, tag);
          if (r.rendered && vp === 1440) r.focus = await keyboardFocus(page, sel);
          rows.push(r);
        }
        if (pg.url === '/' && vp === 1440) {
          const btn = page.locator('header button', { hasText: 'Sign In' }).first();
          if (await btn.isVisible()) {
            await btn.click();
            await sleep(800);
            const modalFields = await page.$$eval('input[id^=":r"]', (els) => els.map((e, i) => { e.setAttribute('data-a194', String(i)); return e.type; }));
            for (let i = 0; i < modalFields.length; i++) rows.push({ ...(await measure(page, `[data-a194="${i}"]`, `F14-signin-${i}-${modalFields[i]}`, tag)) });
            const toUp = page.locator('button', { hasText: /^\\s*(sign up|create account)\\s*$/i }).last();
            if (await toUp.count()) {
              await toUp.click(); await sleep(800);
              const upFields = await page.$$eval('input[id^=":r"]', (els) => els.map((e, i) => { e.setAttribute('data-a194u', String(i)); return e.type; }));
              for (let i = 0; i < upFields.length; i++) rows.push({ ...(await measure(page, `[data-a194u="${i}"]`, `F14-signup-${i}-${upFields[i]}`, tag)) });
            }
          } else rows.push({ id: 'F14', rendered: false, note: 'Sign In button not visible' });
        }
        out.pages.push({ url: pg.url, vp, rows, errors: errs });
        await ctx.close();
      }
    }
    for (const vp of [1440, 375]) {
      const ctx = await b.newContext({ viewport: VPS[vp], deviceScaleFactor: 2 });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
      await sleep(1500);
      await page.waitForLoadState('networkidle');
      await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.55));
      await sleep(9000);
      const fd = page.getByText('FREE DOWNLOAD', { exact: false }).first();
      const row = { vp };
      if (await fd.isVisible().catch(() => false)) {
        await fd.click(); await sleep(2500);
        const inp = page.locator('input[placeholder="Enter your email address"]');
        row.placeholderAttr = await inp.getAttribute('placeholder');
        const info = await inp.evaluate((e) => { const r = e.getBoundingClientRect(); const ph = getComputedStyle(e, '::placeholder').color; return { x: r.x, y: r.y, w: r.width, h: r.height, ph, color: getComputedStyle(e).color, bg: getComputedStyle(e).backgroundColor }; });
        Object.assign(row, { phComputed: info.ph, textComputed: info.color, bg: info.bg });
        const shot = async (name) => { const f = path.join(SH, `leadmagnet-${vp}-${name}.png`); await page.screenshot({ path: f, clip: { x: info.x, y: info.y, width: info.w, height: info.h } }); return decode(fs.readFileSync(f)); };
        const darkest = (img) => { let best = [255, 255, 255]; for (let y = Math.floor(img.h * 0.2); y < img.h * 0.8; y++) for (let x = Math.floor(img.w * 0.05); x < img.w * 0.9; x++) { const p = img.px(x, y).slice(0, 3); if (lum(p) < lum(best)) best = p; } return best; };
        const bgPx = (img) => img.px(Math.floor(img.w * 0.95), Math.floor(img.h / 2)).slice(0, 3);
        await page.mouse.move(1, 1);
        const a = await shot('placeholder');
        row.placeholder = { darkest: darkest(a), bg: bgPx(a), ratio: ratio(darkest(a), bgPx(a)) };
        await inp.fill('a@b.co'); await page.mouse.move(1, 1); await sleep(200);
        const t = await shot('typed');
        row.typed = { darkest: darkest(t), bg: bgPx(t), ratio: ratio(darkest(t), bgPx(t)) };
        row.pass = row.placeholder.ratio >= 4.5 && row.typed.ratio > row.placeholder.ratio;
      } else row.note = 'FREE DOWNLOAD not visible';
      out.placeholder.push(row);
      await ctx.close();
    }
  } catch (e) { out.errors.push(String(e.stack || e)); }
  await b.close();
  fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'out', 'fields.json'), JSON.stringify(out, null, 1));
  const sum = out.pages.flatMap((p) => p.rows.map((r) => `${p.url} ${p.vp} ${r.id} ${r.rendered ? `min=${r.min} [t${r.edges.top.r} r${r.edges.right.r} b${r.edges.bottom.r} l${r.edges.left.r}] bw=${r.borderWidth} ${r.borderColor}${r.focus ? ` focus:${r.focus.borderColor} tabs=${r.focus.tabs}` : ''}` : `NOT RENDERED ${r.note || ''}`}`));
  console.log(sum.join('\n'));
  console.log(JSON.stringify(out.placeholder));
  console.log('errors', JSON.stringify(out.errors), JSON.stringify(out.pages.map((p) => p.errors.length)));
})();
