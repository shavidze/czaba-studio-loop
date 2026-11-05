// §4 adjacent: signed-in no popup; fade-in animation; one show per load; mobile Sign In + Escape. usage: node adjacent.cjs <port> <tag>
const L = require('./lib.cjs'); const path = require('path');
const [port, tag] = [process.argv[2], process.argv[3]];
const base = `http://127.0.0.1:${port}`;
(async () => {
  const browser = await L.launch(); const res = {};
  { // signed in (seam: auth_user without accessToken)
    const { ctx, page } = await L.newPage(browser, 1280);
    await ctx.addInitScript(() => localStorage.setItem('auth_user', JSON.stringify({ id: 7, firstName: 'Ana', lastName: 'Test', email: 'ana@example.com' })));
    await page.goto(base + '/', { waitUntil: 'networkidle' }).catch(() => {}); await L.declineCookies(page); await L.sleep(1200); await L.scrollTo55(page); await L.sleep(9000);
    await page.mouse.move(640, 1, { steps: 3 }); await page.mouse.move(640, -20); await L.sleep(600);
    res.signedIn = { popup: await L.popupVisible(page), userMenu: await page.getByRole('button', { name: 'User menu' }).count() }; await ctx.close();
  }
  { // anonymous: animation + once per load
    const { ctx, page } = await L.newPage(browser, 1280);
    await page.goto(base + '/', { waitUntil: 'networkidle' }).catch(() => {}); await L.declineCookies(page); await L.sleep(1200); await L.scrollTo55(page);
    const t0 = Date.now(); while (!(await L.popupVisible(page)) && Date.now() - t0 < 16000) await L.sleep(20);
    res.anim = await page.evaluate(() => { const fx = [...document.querySelectorAll('div.fixed')].find((x) => /FREE DOWNLOAD/.test(x.innerText || '')); const cs = getComputedStyle(fx); return { name: cs.animationName, dur: cs.animationDuration, running: fx.getAnimations().map((a) => a.playState + ':' + (a.currentTime | 0)), opacity: cs.opacity }; });
    await L.sleep(800); await page.keyboard.press('Escape'); await L.sleep(800);
    // stay in the same load: clear dismissed flag would be cheating; scroll and exit-intent again
    await page.mouse.move(640, 300); await page.mouse.wheel(0, -600); await L.sleep(1500); await page.mouse.wheel(0, 900); await L.sleep(1500);
    await page.mouse.move(640, 1, { steps: 3 }); await page.mouse.move(640, -20); await L.sleep(9000);
    res.oncePerLoad = { reopened: await L.popupVisible(page), lm: await page.evaluate(() => localStorage.getItem('czaba_lead_magnet')) }; await ctx.close();
  }
  { // 375 mobile menu Sign In -> AuthModal, Escape closes
    const { page, ctx } = await L.newPage(browser, 375, { suppress: true });
    await page.goto(base + '/', { waitUntil: 'networkidle' }).catch(() => {}); await L.declineCookies(page); await L.sleep(1500);
    const toggle = page.locator('header button[aria-controls="header-mobile-menu"]');
    res.mobileToggle = await toggle.count();
    if (res.mobileToggle) { await toggle.click(); await L.sleep(700); await page.locator('#header-mobile-menu').getByRole('button', { name: 'Sign In' }).click(); await L.sleep(800);
      res.mobileModal = { closeBtns: await page.locator('[aria-label="Close"]:visible').count(), top: (await L.state(page)).body.top };
      await page.keyboard.press('Escape'); await L.sleep(800); res.mobileModal.afterEsc = await page.locator('[aria-label="Close"]:visible').count(); res.mobileModal.body = (await L.state(page)).body; }
    // desktop sign in once
    await ctx.close();
    const d = await L.newPage(browser, 1440, { suppress: true }); await d.page.goto(base + '/', { waitUntil: 'networkidle' }).catch(() => {}); await L.declineCookies(d.page); await L.sleep(1500);
    await d.page.locator('header').getByRole('button', { name: 'Sign In', exact: true }).first().click(); await L.sleep(800);
    res.desktopModal = { closeBtns: await d.page.locator('[aria-label="Close"]:visible').count(), emailFields: await d.page.locator('input[type=email]:visible').count() };
    await d.page.keyboard.press('Escape'); await L.sleep(800); res.desktopModal.afterEsc = await d.page.locator('[aria-label="Close"]:visible').count(); await d.ctx.close();
  }
  L.save(path.join(L.OUT, `adjacent-${tag}.json`), res); console.log(tag, JSON.stringify(res));
  await browser.close();
})();
