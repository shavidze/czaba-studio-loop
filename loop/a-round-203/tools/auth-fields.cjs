// A round 203: AuthModal Sign In + Sign Up error borders (all Input fields) and destructive-vs-surface contrast.
const F = require('./fl.cjs'); const path = require('path');
const PORT = process.argv[2];
const lum = (c) => { const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map((v) => { v = +v / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return +((x + 0.05) / (y + 0.05)).toFixed(2); };
const fields = (page) => page.evaluate(() => [...document.querySelectorAll('input')].filter((e) => e.offsetParent && e.closest('form') && ['email', 'password', 'text'].includes(e.type) && e.closest('[role=dialog], .fixed')).map((e) => { const c = getComputedStyle(e); return { id: e.id, type: e.type, label: (document.querySelector(`label[for="${e.id}"]`) || {}).textContent, bc: c.borderTopColor, bg: c.backgroundColor, invalid: e.getAttribute('aria-invalid') }; }));
(async () => { const b = await F.launch(); const R = {};
  for (const [W, H] of [[1280, 720], [1440, 900]]) {
    const { ctx, page } = await F.newPage(b, W, H);
    await page.goto(`http://127.0.0.1:${PORT}/store`, { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await F.sleep(400);
    await page.locator('header button', { hasText: 'Sign In' }).first().click(); await F.sleep(1500);
    const r = {}; r.signInBefore = await fields(page);
    await page.locator('form button[type=submit]').first().click(); await F.sleep(800);
    await page.evaluate(() => document.activeElement.blur()); await F.sleep(300);
    r.signInAfter = await fields(page);
    const tab = page.getByRole('button', { name: 'Sign up', exact: true });
    if (await tab.count()) { await tab.click(); await F.sleep(800); r.signUpBefore = await fields(page);
      await page.locator('form button[type=submit]').first().click(); await F.sleep(800); await page.evaluate(() => document.activeElement.blur()); await F.sleep(300);
      r.signUpAfter = await fields(page);
      await page.screenshot({ path: path.join(__dirname, '..', 'out', `signup-errors-${W}.png`) }); } else r.signUp = 'tab not found';
    for (const k of Object.keys(r)) if (Array.isArray(r[k])) r[k] = r[k].map((f) => ({ ...f, cBorderVsBg: ratio(f.bc, f.bg) }));
    R[W] = r; await ctx.close(); }
  F.save(path.join(__dirname, '..', 'out', 'auth-fields.json'), R); console.log(JSON.stringify(R)); await b.close(); })().catch((e) => { console.error(e); process.exit(1); });
