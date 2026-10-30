// C round 203 — ERROR-BORDER-203: AuthModal SignIn / SignUp / Forgot Input fields, 4 states each, + GuestForm. node errborder.cjs <port> <W>
const F = require('./fl.cjs');
const path = require('path');
const fs = require('fs');
const { decode } = require('./png.cjs');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : 720;
const BASE = `http://127.0.0.1:${PORT}`; const TAG = `${PORT === '5174' ? 'ref' : 'tree'}-${W}`;
const OUT = path.join(F.ROOT, 'out', 'errborder'); const SH = path.join(F.ROOT, 'shots', 'errborder', TAG);
fs.mkdirSync(SH, { recursive: true });
const st = (page, id) => page.evaluate((i) => { const e = document.getElementById(i); if (!e) return null; const c = getComputedStyle(e); const r = e.getBoundingClientRect(); let p = e.parentElement; let surf = null; while (p) { const bg = getComputedStyle(p).backgroundColor; if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) { surf = bg; break; } p = p.parentElement; } return { bc: c.borderTopColor, bcL: c.borderLeftColor, bw: c.borderTopWidth, bg: c.backgroundColor, surf, os: c.outlineStyle, ow: c.outlineWidth, oc: c.outlineColor, oo: c.outlineOffset, bs: c.boxShadow, invalid: e.getAttribute('aria-invalid'), fs: document.documentElement.dataset.focusSource || null, active: document.activeElement === e, box: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(1)) }; }, id);
const fieldIds = (page) => page.evaluate(() => [...document.querySelectorAll('input, textarea')].filter((e) => e.offsetParent && e.closest('form') && ['email', 'password', 'text', 'textarea'].includes(e.type) && e.closest('[role=dialog], .fixed')).map((e) => e.id));
// sample painted pixel on the left border, mid-height
async function pix(page, b, name) {
  const clip = { x: Math.max(0, Math.floor(b[0]) - 6), y: Math.max(0, Math.floor(b[1]) - 6), width: Math.ceil(b[2]) + 12, height: Math.ceil(b[3]) + 12 };
  const file = path.join(SH, name + '.png'); await page.screenshot({ path: file, clip });
  const im = decode(fs.readFileSync(file)); const y = Math.floor(im.h / 2); const x0 = Math.round(b[0] - clip.x);
  const row = []; for (let x = x0 - 3; x <= x0 + 3; x++) row.push(im.px(x, y).slice(0, 3));
  return { row, border: im.px(x0, y).slice(0, 3), inside: im.px(x0 + 5, y).slice(0, 3), outside: im.px(x0 - 4, y).slice(0, 3) };
}
async function states(page, form) {
  const out = {};
  const ids = await fieldIds(page); out.ids = ids;
  out.before = {}; for (const id of ids) out.before[id] = await st(page, id);
  await page.locator('form button[type=submit]').filter({ visible: true }).first().click(); await F.sleep(900);
  out.errorTexts = await page.evaluate(() => [...document.querySelectorAll('form p, form [role=alert]')].filter((e) => e.offsetParent).map((e) => e.textContent.trim()).filter(Boolean).slice(0, 8));
  await page.evaluate(() => document.activeElement && document.activeElement.blur()); await F.sleep(400);
  const still = await fieldIds(page); out.modalStillOpen = still.length > 0;
  if (!still.length) { // clicking outside closed it? reopen not attempted
    return out; }
  out.unfocused = {}; out.kbd = {}; out.mouse = {};
  for (const id of ids) {
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await F.sleep(300);
    const s = await st(page, id); out.unfocused[id] = { ...s, px: await pix(page, s.box, `${form}-${id}-u`) };
    // keyboard: real Tab from the previous tabbable (focus it programmatically, then Shift+Tab/Tab)
    await page.focus('#' + CSS_ESC(id)); await page.keyboard.press('Shift+Tab'); await F.sleep(100); await page.keyboard.press('Tab'); await F.sleep(450);
    const k = await st(page, id); out.kbd[id] = { ...k, px: await pix(page, k.box, `${form}-${id}-k`) };
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await F.sleep(200);
    await page.mouse.click(k.box[0] + 30, k.box[1] + k.box[3] / 2); await F.sleep(450);
    const m = await st(page, id); out.mouse[id] = { ...m, px: await pix(page, m.box, `${form}-${id}-m`) };
  }
  await page.screenshot({ path: path.join(SH, `${form}-dialog.png`) });
  return out;
}
const CSS_ESC = (s) => s.replace(/([^a-zA-Z0-9_-])/g, '\\$1');
(async () => {
  const browser = await F.launch(); const R = { TAG };
  for (const form of ['signin', 'signup', 'forgot']) {
    const { ctx, page } = await F.newPage(browser, W, H);
    try {
      await page.goto(BASE + '/store', { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await F.sleep(500);
      await page.locator('header button', { hasText: 'Sign In' }).first().click(); await F.sleep(1500);
      if (form === 'signup') { await page.getByRole('button', { name: 'Sign up', exact: true }).click(); await F.sleep(900); }
      if (form === 'forgot') { await page.getByRole('button', { name: 'Forgot password?' }).click(); await F.sleep(900); }
      R[form] = await states(page, form);
    } catch (e) { R[form] = { err: String(e).slice(0, 300) }; }
    await ctx.close();
  }
  // GuestForm (/support)
  { const { ctx, page } = await F.newPage(browser, W, H);
    try {
      await page.goto(BASE + '/support', { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page);
      await page.locator('button', { hasText: 'Live Chat' }).first().click(); await page.waitForSelector('#guest-name'); await F.sleep(1000);
      const g = {}; g.before = { name: await st(page, 'guest-name'), email: await st(page, 'guest-email') };
      await page.locator('form button[type=submit]').first().click(); await F.sleep(700);
      await page.evaluate(() => document.activeElement.blur()); await F.sleep(400);
      g.unfocused = { name: await st(page, 'guest-name'), email: await st(page, 'guest-email') };
      await page.focus('#guest-name'); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await F.sleep(450);
      g.kbd = await st(page, 'guest-name');
      await page.evaluate(() => document.activeElement.blur()); const b = g.kbd.box; await page.mouse.click(b[0] + 20, b[1] + b[3] / 2); await F.sleep(450);
      g.mouse = await st(page, 'guest-name');
      R.guest = g;
    } catch (e) { R.guest = { err: String(e).slice(0, 300) }; }
    await ctx.close(); }
  F.save(path.join(OUT, `${TAG}.json`), R);
  const sum = {};
  for (const f of ['signin', 'signup', 'forgot']) { const r = R[f]; if (!r || r.err) { sum[f] = r && r.err; continue; } sum[f] = (r.ids || []).map((id) => ({ id, before: [r.before[id].bc, r.before[id].invalid], u: r.unfocused && [r.unfocused[id].bc, r.unfocused[id].invalid, r.unfocused[id].px.border], k: r.kbd && [r.kbd[id].bc, r.kbd[id].os, r.kbd[id].ow, r.kbd[id].bs, r.kbd[id].fs, r.kbd[id].active, r.kbd[id].px.border], m: r.mouse && [r.mouse[id].bc, r.mouse[id].os, r.mouse[id].fs, r.mouse[id].active, r.mouse[id].px.border] })); sum[f + 'Err'] = r.errorTexts; }
  sum.guest = R.guest.err || { b: R.guest.before.name.bc, u: R.guest.unfocused.name.bc, k: [R.guest.kbd.bc, R.guest.kbd.os, R.guest.kbd.bs], m: [R.guest.mouse.bc, R.guest.mouse.os, R.guest.mouse.bs] };
  console.log(JSON.stringify(sum, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
