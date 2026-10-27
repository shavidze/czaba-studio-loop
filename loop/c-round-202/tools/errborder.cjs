// C round 202 — ERROR-BORDER: GuestForm (/support chat) and the AuthModal Input (SignInForm). node errborder.cjs <port> <W>
const F = require('./fl.cjs');
const path = require('path');
const PORT = process.argv[2]; const W = +process.argv[3]; const H = W === 1440 ? 900 : 720;
const BASE = `http://127.0.0.1:${PORT}`; const TAG = `${PORT === '5174' ? 'ref' : 'tree'}-${W}`;
const OUT = path.join(F.ROOT, 'out', 'errborder'); const SH = path.join(F.ROOT, 'shots', 'errborder');
require('fs').mkdirSync(SH, { recursive: true });
const st = (page, sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return { bc: c.borderTopColor, bw: c.borderTopWidth, os: c.outlineStyle, oc: c.outlineColor, bs: c.boxShadow, invalid: e.getAttribute('aria-invalid'), cls: e.className.slice(0, 300) }; }, sel);
(async () => {
  const browser = await F.launch(); const R = { TAG };
  // GuestForm
  { const { ctx, page } = await F.newPage(browser, W, H);
    await page.goto(BASE + '/support', { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page);
    await page.locator('button', { hasText: 'Live Chat' }).first().click(); await page.waitForSelector('#guest-name'); await F.sleep(1000);
    const submit = page.locator('form button[type=submit]').first(); await submit.click(); await F.sleep(600);
    await page.mouse.click(5, 5); await page.evaluate(() => document.activeElement.blur()); await F.sleep(400);
    R.guestUnfocused = { name: await st(page, '#guest-name'), email: await st(page, '#guest-email') };
    await page.keyboard.press('Shift'); await page.focus('#guest-name'); await page.keyboard.press('Shift'); await F.sleep(400);
    // keyboard focus: Tab from previous to the field
    await page.evaluate(() => document.activeElement.blur()); await page.focus('#guest-name'); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await F.sleep(400);
    R.guestFocused = { active: await page.evaluate(() => document.activeElement.id), name: await st(page, '#guest-name') };
    const b = await page.locator('#guest-name').boundingBox(); await page.screenshot({ path: path.join(SH, `guest-${TAG}.png`), clip: { x: Math.max(0, b.x - 12), y: Math.max(0, b.y - 40), width: b.width + 24, height: b.height * 3 + 80 } });
    await ctx.close(); }
  // AuthModal SignIn Input
  { const { ctx, page } = await F.newPage(browser, W, H);
    await page.goto(BASE + '/store', { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page); await F.sleep(500);
    await page.locator('header button', { hasText: 'Sign In' }).first().click(); await F.sleep(1500);
    R.modalInputs = await page.evaluate(() => [...document.querySelectorAll('[role=dialog] input, .fixed input')].map((e) => ({ id: e.id, type: e.type, name: e.name })).slice(0, 6));
    const email = await page.evaluate(() => { const e = [...document.querySelectorAll('input')].find((x) => x.type === 'email' && x.offsetParent); if (!e) return null; e.setAttribute('data-c202e','1'); return e.id || 'x'; });
    R.emailId = email;
    if (email) {
      const sel = '[data-c202e]';
      R.emailBefore = await st(page, sel);
      const btn = page.locator('form button[type=submit]').first(); await btn.click(); await F.sleep(800);
      R.afterSubmitActive = await page.evaluate(() => document.activeElement && (document.activeElement.id || document.activeElement.tagName));
      R.errorTexts = await page.evaluate(() => [...document.querySelectorAll('form p, form [role=alert]')].map((e) => e.textContent.trim()).filter(Boolean).slice(0, 6));
      await page.evaluate(() => document.activeElement.blur()); await F.sleep(400);
      R.emailUnfocusedErr = await st(page, sel);
      await page.focus(sel); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await F.sleep(400);
      R.emailFocusedErr = { active: await page.evaluate(() => document.activeElement.hasAttribute('data-c202e')), ...(await st(page, sel)) };
      const b = await page.locator(sel).boundingBox(); await page.screenshot({ path: path.join(SH, `auth-email-${TAG}.png`), clip: { x: Math.max(0, b.x - 16), y: Math.max(0, b.y - 16), width: b.width + 32, height: b.height + 60 } });
      // mouse focus
      await page.mouse.click(b.x + 20, b.y + b.height / 2); await F.sleep(400);
      R.emailMouseErr = await st(page, sel);
    }
    await ctx.close(); }
  F.save(path.join(OUT, `${TAG}.json`), R);
  console.log(JSON.stringify(R, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
