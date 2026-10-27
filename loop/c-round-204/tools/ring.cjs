// RING-204 spot: keyboard focus ring + pixel contrast. node ring.cjs <port> <W> <label>
const L = require('./lib.cjs'); const path = require('path'); const fs = require('fs'); const { decode } = require('./png.cjs');
const [PORT, Ws, LABEL] = process.argv.slice(2); const W = +Ws;
const lum = ([r, g, b]) => { const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
async function measure(page, name) {
  const before = await page.evaluate(`(${L.DESCRIBE})(window.__t)`);
  await page.evaluate(() => { window.__t.blur(); }); await L.sleep(300);
  const unf = await page.evaluate(`(${L.DESCRIBE})(window.__t)`);
  return { name, before, unf };
}
(async () => {
  const browser = await L.launch(); const out = [];
  const shot = async (page, d, tag) => { const [x, y, w, h] = d.box; const clip = { x: Math.max(0, Math.floor(x - 10)), y: Math.max(0, Math.floor(y - 10)), width: Math.ceil(w + 21), height: Math.ceil(h + 21) }; const f = path.join(L.SHOTS, 'ring', `${LABEL}-${W}-${tag}.png`); fs.mkdirSync(path.dirname(f), { recursive: true }); await page.screenshot({ path: f, clip }); return { f, clip }; };
  const sample = (f, clip, box) => { const P = decode(fs.readFileSync(f)); const [x, y, w, h] = box; const cx = Math.round(x + w / 2) - clip.x, cy = Math.round(y + h / 2) - clip.y; const res = {};
    const lines = { top: (k) => [cx, Math.floor(y) - clip.y - k], bottom: (k) => [cx, Math.ceil(y + h) - clip.y - 1 + k], left: (k) => [Math.floor(x) - clip.x - k, cy], right: (k) => [Math.ceil(x + w) - clip.x - 1 + k, cy] };
    for (const [side, fn] of Object.entries(lines)) { const [bx, by] = fn(9); if (bx < 0 || by < 0 || bx >= P.w || by >= P.h) { res[side] = null; continue; } const bg = P.px(bx, by); let best = null; for (let k = 1; k <= 6; k++) { const [px, py] = fn(k); if (px < 0 || py < 0 || px >= P.w || py >= P.h) continue; const c = P.px(px, py); const v = cr(c, bg); if (!best || v > best.v) best = { k, c, v }; } res[side] = best && { ring: best.c, at: best.k, bg, ringVsBg: best.v }; } return res; };
  const doEl = async (page, tag, sel, keyPath) => {
    await page.evaluate(sel); const d0 = await page.evaluate(`(${L.DESCRIBE})(window.__t)`);
    // keyboard focus: focus previous focusable then Tab
    await keyPath(); await L.sleep(1300);
    const isT = await page.evaluate(() => document.activeElement === window.__t);
    const df = await page.evaluate(`(${L.DESCRIBE})(window.__t)`); const s1 = await shot(page, df, tag + '-focused');
    await page.evaluate(() => document.activeElement.blur()); await L.sleep(400);
    const du = await page.evaluate(`(${L.DESCRIBE})(window.__t)`); await shot(page, du, tag + '-unfocused');
    const px = sample(s1.f, s1.clip, df.box);
    out.push({ tag, isT, focused: { fv: df.fv, os: df.os, ow: df.ow, oo: df.oo, oc: df.oc, bs: df.bs, bg: df.bg, bc: df.bc, bw: df.bw, box: df.box }, unfocused: { os: du.os, bs: du.bs, bg: du.bg, bc: du.bc, bw: du.bw, box: du.box }, px });
  };
  const tabTo = (page) => async () => { await page.evaluate(() => { const all = [...document.querySelectorAll('a[href],button,input,[tabindex]')].filter((e) => !e.disabled && e.tabIndex >= 0 && e.offsetParent !== null || e === window.__t); const i = all.indexOf(window.__t); const prev = all.slice(0, i).reverse().find((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && getComputedStyle(e).visibility !== 'hidden'; }); if (prev) prev.focus({ preventScroll: true }); }); await L.sleep(200); await page.keyboard.press('Tab'); };
  if (W === 375) {
    const { page } = await L.newPage(browser, W); await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: 'load', timeout: 180000 }); await L.sleep(3000); await L.declineCookies(page); await L.sleep(400);
    await doEl(page, 'toggle', `window.__t = document.querySelector('button[aria-label="Toggle menu"]')`, tabTo(page));
    await page.locator('button[aria-label="Toggle menu"]').click(); await L.sleep(700);
    await doEl(page, 'mobile-studio', `window.__t = [...document.querySelectorAll('header a')].filter((a) => a.textContent.trim() === 'Studio').pop()`, async () => { await page.locator('button[aria-label="Toggle menu"]').focus(); await page.keyboard.press('Tab'); await L.sleep(300); await page.keyboard.press('Tab'); });
  } else {
    const { page } = await L.newPage(browser, W, { signedIn: true }); await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: 'load', timeout: 180000 }); await L.sleep(3000); await L.declineCookies(page); await L.sleep(400); await page.mouse.move(2, L.H(W) - 2);
    await doEl(page, 'usermenu', `window.__t = document.querySelector('button[aria-label="User menu"]')`, tabTo(page));
    await page.locator('button[aria-label="User menu"]').focus(); await page.keyboard.press('Enter'); await L.sleep(400);
    await doEl(page, 'myaccount', `window.__t = document.querySelector('#header-user-menu a[href="/account"]') || document.querySelector('header a[href="/account"]')`, async () => { await page.locator('button[aria-label="User menu"]').focus(); await page.keyboard.press('Tab'); });
  }
  { const { page } = await L.newPage(browser, W); await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load', timeout: 180000 }); await L.sleep(3000); await L.declineCookies(page); await page.mouse.move(2, L.H(W) - 2);
    await page.evaluate(() => { const s = [...document.querySelectorAll('section')].find((x) => /Mixdown/i.test(x.textContent) && x.querySelector('a[href="/store"]')); window.__t = [...s.querySelectorAll('a[href="/store"]')].find((x) => /Browse the Collection/.test(x.textContent)); window.__t.scrollIntoView({ block: 'center', behavior: 'instant' }); }); await L.sleep(2500);
    await doEl(page, 'cta', `window.__t = window.__t`, tabTo(page)); }
  L.save(path.join(L.OUT, 'ring', `${LABEL}-${W}.json`), out);
  for (const o of out) console.log(LABEL, W, o.tag, o.isT, JSON.stringify(o.focused).slice(0, 260), '| unf', JSON.stringify(o.unfocused).slice(0, 200), '| px', JSON.stringify(o.px));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
