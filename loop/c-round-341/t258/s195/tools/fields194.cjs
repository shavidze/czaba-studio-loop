// C round 194 — FIELD-BORDER-194: border pixel vs the pixel just outside at the four edge midpoints, unfocused, then keyboard focus.
// node fields194.cjs <W> <tag:tree|ref> [only-comma-list]
// tree = :5173 (round 193 + 194), ref = :5174 (round-193 tree: the 13 grants restored from b-round-193/r194-granted-start).
const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path'); const { decode } = require('./png.cjs');
const W = +process.argv[2]; const TAG = process.argv[3] || 'tree'; const ONLY = process.argv[4] ? process.argv[4].split(',') : null;
const BASE = TAG === 'ref' ? 'http://127.0.0.1:5174' : TAG === 'head' ? 'http://127.0.0.1:5175' : 'http://127.0.0.1:5173';
const VPS = { 1440: [1440, 900], 1280: [1280, 720], 375: [375, 812] };
const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const SH = path.join(L.ROOT, 'shots', 'fields'); fs.mkdirSync(SH, { recursive: true });
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|localhost:5199|Download the React DevTools/i;
const notPopup = 'xpath=ancestor::div[contains(@class,"z-[9999]")]';
const FIELDS = [
  { id: 'F1', url: '/', sel: 'section input[placeholder="Enter your email"]' },
  { id: 'F2', url: '/store', sel: 'input[placeholder^="Search packs"]' },
  { id: 'F3', url: '/hire-us', sel: '#name' },
  { id: 'F4', url: '/hire-us', sel: '#email' },
  { id: 'F5', url: '/hire-us', sel: '#budget' },
  { id: 'F6', url: '/hire-us', sel: '#message' },
  { id: 'F7', url: '/free-downloads', sel: 'form input[type=email][name=email]', prep: async (p) => { const b = p.locator('button', { hasText: /^Download$/ }).first(); if (await b.count()) { await b.click(); await L.sleep(1200); } } },
  { id: 'F8', url: '/gift-cards', sel: 'input[placeholder="Enter gift card code"]' },
  { id: 'F10', url: '/cart', sel: 'main input[type=text], main input:not([type])' },
  { id: 'F14-signin-email', url: '/', sel: 'input[type=email][placeholder=" "]', prep: async (p) => { await p.locator('header button', { hasText: 'Sign In' }).first().click(); await L.sleep(1200); } },
  { id: 'F14-signin-password', url: '/', sel: 'input[type=password]', prep: async (p) => { await p.locator('header button', { hasText: 'Sign In' }).first().click(); await L.sleep(1200); } },
  { id: 'F14-signup-first', url: '/', sel: 'input[placeholder=" "]', prep: async (p) => { await p.locator('header button', { hasText: 'Sign In' }).first().click(); await L.sleep(1200); const s = p.locator('button', { hasText: /^Sign up$/ }).last(); if (await s.count()) { await s.click(); await L.sleep(1000); } } },
  { id: 'GUEST-name', url: '/support', sel: '#guest-name', prep: async (p) => { await p.locator('button', { hasText: 'Live Chat' }).first().click(); await L.sleep(2000); } },
  { id: 'GUEST-email', url: '/support', sel: '#guest-email', prep: async (p) => { await p.locator('button', { hasText: 'Live Chat' }).first().click(); await L.sleep(2000); } },
  { id: 'F16', url: '/support', sel: 'textarea', prep: async (p) => { await p.locator('button', { hasText: 'Live Chat' }).first().click(); await L.sleep(2000); await p.fill('#guest-name', 'C Test'); await p.fill('#guest-email', 'c@example.com'); await p.locator('button', { hasText: 'Start Chat' }).first().click(); await L.sleep(3000); } },
];
(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text'] }); const res = { W, TAG, BASE, utc: new Date().toISOString(), fields: {} };
  for (const f of FIELDS) {
    if (ONLY && !ONLY.includes(f.id)) continue;
    if (W === 375 && !['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'GUEST-name', 'GUEST-email'].includes(f.id)) continue;
    const ctx = await b.newContext({ viewport: { width: VPS[W][0], height: VPS[W][1] }, deviceScaleFactor: 2 });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); } catch {} });
    const page = await ctx.newPage(); const ev = { pageerror: [], hyd: [], auth: [], remote: [] };
    page.on('pageerror', (e) => ev.pageerror.push(String(e).slice(0, 200)));
    page.on('console', (m) => { const t = m.text(); if (/hydrat|did not match|server rendered/i.test(t)) ev.hyd.push(t.slice(0, 200)); });
    page.on('request', (q) => { const u = q.url(); if (q.headers().authorization) ev.auth.push(u); if (!/^https?:\/\/(127\.0\.0\.1|localhost)/.test(u) && !/^data:|^blob:/.test(u) && !/fonts\.(googleapis|gstatic)\.com/.test(u)) ev.remote.push(u); });
    const r = { url: f.url, sel: f.sel, ev }; const t0 = Date.now();
    try { await Promise.race([(async () => {
      await page.goto(BASE + f.url, { waitUntil: 'load', timeout: 90000 }); await page.waitForFunction(() => document.querySelector('footer'), null, { timeout: 12000 }).catch(() => {}); await L.sleep(3000);
      if (f.prep) await f.prep(page);
      const el = page.locator(f.sel).filter({ hasNot: page.locator(notPopup) }).first();
      if (!(await el.count()) || !(await el.isVisible())) { r.missing = true; console.log(W, TAG, f.id, 'NOT RENDERED'); return; }
      await el.evaluate((e) => e.scrollIntoView({ block: 'center' })); await L.sleep(900);
      await page.locator('div.fixed.inset-0.z-\\[9999\\] button[aria-label=Close]').click({ timeout: 800 }).catch(() => {});
      await page.mouse.move(1, 1); await L.sleep(500);
      r.css = await el.evaluate((e) => { const s = getComputedStyle(e); return { cls: e.className, bw: [s.borderTopWidth, s.borderRightWidth, s.borderBottomWidth, s.borderLeftWidth], bc: s.borderTopColor, bg: s.backgroundColor, ph: e.placeholder || null }; });
      const bb = await el.boundingBox(); r.box = bb;
      const M = 8; const clip = { x: Math.max(0, bb.x - M), y: Math.max(0, bb.y - M), width: Math.min(bb.width + 2 * M, VPS[W][0] - Math.max(0, bb.x - M)), height: bb.height + 2 * M };
      const file = path.join(SH, `${W}-${TAG}-${f.id}.png`); await page.screenshot({ path: file, clip });
      const im = decode(fs.readFileSync(file)); const s = 2; const bw = parseFloat(r.css.bw[0]) * s;
      const X0 = (bb.x - clip.x) * s, Y0 = (bb.y - clip.y) * s, X1 = (bb.x + bb.width - clip.x) * s, Y1 = (bb.y + bb.height - clip.y) * s; const xm = Math.round((X0 + X1) / 2), ym = Math.round((Y0 + Y1) / 2);
      const edge = (name, outXY, bandXY) => { const out = im.px(...outXY); const band = bandXY.map((p) => im.px(...p)); let best = band[0], br = 0; for (const c of band) { const q = ratio(c, out); if (q > br) { br = q; best = c; } } return { outside: out, border: best, band, ratio: br }; };
      const band = (fn) => { const a = []; for (let k = 0; k < Math.max(1, Math.round(bw)); k++) a.push(fn(k)); return a; };
      r.edges = {
        top: edge('top', [xm, Math.max(0, Math.round(Y0) - 4)], band((k) => [xm, Math.round(Y0) + k])),
        right: edge('right', [Math.min(im.w - 1, Math.round(X1) + 3), ym], band((k) => [Math.round(X1) - 1 - k, ym])),
        bottom: edge('bottom', [xm, Math.min(im.h - 1, Math.round(Y1) + 3)], band((k) => [xm, Math.round(Y1) - 1 - k])),
        left: edge('left', [Math.max(0, Math.round(X0) - 4), ym], band((k) => [Math.round(X0) + k, ym])),
      };
      r.min = Math.min(...Object.values(r.edges).map((e) => e.ratio));
      // keyboard focus: focus the previous focusable then Tab into the field
      await el.focus(); await page.keyboard.press('Shift+Tab'); await L.sleep(150); await page.keyboard.press('Tab'); await L.sleep(500);
      r.focus = await el.evaluate((e) => { const s = getComputedStyle(e); return { focused: document.activeElement === e, fv: e.matches(':focus-visible'), bc: s.borderTopColor, boxShadow: s.boxShadow.slice(0, 120), outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}` }; });
      const ff = path.join(SH, `${W}-${TAG}-${f.id}-focus.png`); await page.screenshot({ path: ff, clip });
      const imf = decode(fs.readFileSync(ff)); r.focus.topBorderPx = imf.px(xm, Math.round(Y0) + 1); r.focus.topBorderVsOutside = ratio(r.focus.topBorderPx, imf.px(xm, Math.max(0, Math.round(Y0) - 4)));
    })(), new Promise((_, rej) => setTimeout(() => rej(new Error('field timeout 150s')), 150000))]);
    } catch (e) { r.err = String(e).slice(0, 300); }
    r.ms = Date.now() - t0; res.fields[f.id] = r; await ctx.close().catch(() => {}); L.save(L.OUT, `fields-${TAG}-${W}${ONLY ? '-' + ONLY.join('_') : ''}.json`, res);
    if (!r.missing) console.log(W, TAG, f.id, r.ms, r.err || `min ${r.min} t/r/b/l ${['top', 'right', 'bottom', 'left'].map((k) => r.edges[k].ratio).join('/')} border ${r.css.bc} ${r.css.bw[0]} | focus ${r.focus.focused} fv ${r.focus.fv} ${r.focus.bc} ${r.focus.boxShadow.slice(0, 50)} | ev pe${ev.pageerror.length} hyd${ev.hyd.length} auth${ev.auth.length} rem${ev.remote.length}`);
  }
  await b.close(); L.save(L.OUT, `fields-${TAG}-${W}${ONLY ? '-' + ONLY.join('_') : ''}.json`, res);
})();
